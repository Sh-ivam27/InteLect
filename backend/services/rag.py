import os
from anthropic import Anthropic
from chromadb import Client
import chromadb
from langchain_text_splitters import RecursiveCharacterTextSplitter

client = Anthropic()
chroma_client = chromadb.Client()

def create_collection(video_id: str): # creates "buckets" for each video in the ChromaDB so that chunks dont mix between videos
    return chroma_client.get_or_create_collection(name=f"video_{video_id}")

def store_chunks(chunks: list, video_id: str):
    collection = create_collection(video_id)
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1500,
        chunk_overlap=200
    )
    
    documents = []
    metadatas = []
    ids = []
    
    for i, chunk in enumerate(chunks):
        split_texts = text_splitter.split_text(chunk["text"])
        num_splits = len(split_texts)
        seg_duration = chunk["end"] - chunk["start"]
        
        for j, text in enumerate(split_texts):
            # interpolate start/end within the parent segment
            frac_start = j / num_splits
            frac_end = (j + 1) / num_splits
            interpolated_start = chunk["start"] + frac_start * seg_duration
            interpolated_end = chunk["start"] + frac_end * seg_duration
            
            documents.append(text)
            metadatas.append({
                "start": interpolated_start,
                "end": interpolated_end,
                "video_id": video_id
            })
            ids.append(f"{video_id}_{i}_{j}")
    
    collection.add(
        documents=documents,
        metadatas=metadatas,
        ids=ids
    )
    
    return len(documents)

def query_chunks(question: str, video_id: str, n_results: int = 3): # takes a user's question, searches for the 3 most relevant chunks in ChromaDB, then returns those chunks with their timestamps
    collection = create_collection(video_id)
    
    results = collection.query(
        query_texts=[question],
        n_results=n_results
    )
    
    chunks = []
    for i, doc in enumerate(results["documents"][0]):
        chunks.append({
            "text": doc,
            "start": results["metadatas"][0][i]["start"],
            "end": results["metadatas"][0][i]["end"]
        })
    
    return chunks

def ask_question(question: str, video_id: str): # calls query_chunks to get the relevant chunks, then formats them with timestamps, sends them to Claude to get an answer and then finally returns the Claude answer + timestamps so that the user can go to those timestamps to understand the concept
    relevant_chunks = query_chunks(question, video_id)
    
    context = ""
    for chunk in relevant_chunks:
        start = int(chunk["start"])
        context += f"[{start//60}:{start%60:02d}] {chunk['text']}\n\n"
    
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        system="""You are an intelligent tutor helping students understand lecture content.
        Answer questions based primarily on the provided transcript chunks.
        If the question is closely related to the topic but not explicitly covered in the transcript, 
        you may use your general knowledge to answer — but clearly indicate when you are doing so.
        Always cite the timestamp where relevant content appears in the transcript.
        If the question is completely unrelated to the lecture topic, say so clearly.
        Do not use markdown formatting like ** or ## in your responses.
        Write in plain, clear text.""",
        messages=[{
            "role": "user",
            "content": f"Context from lecture:\n{context}\n\nQuestion: {question}"
        }]
    )
    
    return {
        "answer": response.content[0].text,
        "sources": relevant_chunks
    }
def get_all_chunks(video_id: str) -> list:
    """
    Returns all chunks stored in ChromaDB for a given video
    so we can sample evenly across the entire video for quiz generation
    """
    collection = create_collection(video_id)
    
    # get count first
    count = collection.count()
    
    if count == 0:
        return []
    
    # get all chunks
    results = collection.get(
        include=["documents", "metadatas"]
    )
    
    chunks = []
    for i, doc in enumerate(results["documents"]):
        chunks.append({
            "text": doc,
            "start": results["metadatas"][i]["start"],
            "end": results["metadatas"][i]["end"]
        })
    
    return chunks