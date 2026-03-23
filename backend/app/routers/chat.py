from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db, Document, ChatMessage
from app.services import chat_service
from pydantic import BaseModel
from typing import List

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    suggestions: List[str]


@router.post("/{doc_id}", response_model=ChatResponse)
async def chat_with_document(
    doc_id: str,  # CHANGÉ: int → str pour UUID
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """Chat with a specific document"""
    
    # Validation
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    # Chercher le document
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Vérifier statut
    if doc.status == "processing":
        return ChatResponse(
            response="Document is still being processed. Please wait a moment and try again.",
            suggestions=[]
        )
    
    if doc.status == "error":
        return ChatResponse(
            response=f"Document processing failed: {doc.metadata_json.get('error', 'Unknown error')}",
            suggestions=[]
        )

    # Get chat history
    history = db.query(ChatMessage).filter(
        ChatMessage.document_id == doc_id
    ).order_by(ChatMessage.created_at).all()

    chat_history = [
        {"role": msg.role, "content": msg.content}
        for msg in history[-10:]
    ]

    # Get answer - TOUJOURS retourner une string
    try:
        answer = chat_service.get_answer(request.message, doc_id, chat_history)
        # S'assurer que c'est une string
        if not isinstance(answer, str):
            answer = str(answer)
    except Exception as e:
        import traceback
        print(f"Chat error: {e}")
        print(traceback.format_exc())
        answer = f"Sorry, I encountered an error: {str(e)}"

    # Save messages
    try:
        user_msg = ChatMessage(
            document_id=doc_id,
            role="user",
            content=request.message
        )
        assistant_msg = ChatMessage(
            document_id=doc_id,
            role="assistant",
            content=answer
        )
        db.add(user_msg)
        db.add(assistant_msg)
        db.commit()
    except Exception as e:
        print(f"Failed to save chat history: {e}")
        # Continue même si sauvegarde échoue

    # Get suggestions
    suggestions = []
    if doc.metadata_json and isinstance(doc.metadata_json, dict):
        suggestions = doc.metadata_json.get("suggested_questions", [])

    return ChatResponse(response=answer, suggestions=suggestions)


@router.get("/{doc_id}/history")
async def get_chat_history(doc_id: str, db: Session = Depends(get_db)):  # CHANGÉ: int → str
    """Get chat history for a document"""
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    messages = db.query(ChatMessage).filter(
        ChatMessage.document_id == doc_id
    ).order_by(ChatMessage.created_at).all()
    
    return [
        {
            "id": msg.id,
            "role": msg.role,
            "content": msg.content,
            "created_at": msg.created_at.isoformat() if msg.created_at else None
        }
        for msg in messages
    ]


@router.delete("/{doc_id}/history")
async def clear_chat_history(doc_id: str, db: Session = Depends(get_db)):  # CHANGÉ: int → str
    """Clear chat history for a document"""
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    db.query(ChatMessage).filter(ChatMessage.document_id == doc_id).delete()
    db.commit()
    
    return {"message": "Chat history cleared"}