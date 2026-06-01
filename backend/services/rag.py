import os
from anthropic import Anthropic
from chromadb import Client
import chromadb
from langchain_text_splitters import RecursiveCharacterTextSplitter

client = Anthropic()
chroma_client = chromadb.Client()

def create_collection(video_id: str): # creates "buckets" for each video in the ChromaDB so that chunks dont mix between videos
    return chroma_client.get_or_create_collection(name=f"video_{video_id}")

def store_chunks(chunks: list, video_id: str): # takes the raw "Whisper" chunks and then re-chunks them smartly into meaningful chunks (~500 words) and stores them in ChromaDB with their timestamps
    collection = create_collection(video_id)
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    
    documents = []
    metadatas = []
    ids = []
    
    for i, chunk in enumerate(chunks):
        split_texts = text_splitter.split_text(chunk["text"])
        for j, text in enumerate(split_texts):
            documents.append(text)
            metadatas.append({
                "start": chunk["start"],
                "end": chunk["end"],
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
        Answer questions based ONLY on the provided transcript chunks.
        Always cite the timestamp where the answer comes from.
        If the answer isn't in the transcript, say so clearly.""",
        messages=[{
            "role": "user",
            "content": f"Context from lecture:\n{context}\n\nQuestion: {question}"
        }]
    )
    
    return {
        "answer": response.content[0].text,
        "sources": relevant_chunks
    }