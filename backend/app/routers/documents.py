from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db, Document
from app.services import ocr_service, analyzer, vector_store
import os
import uuid
import json
from datetime import datetime
from typing import List, Optional

router = APIRouter()

UPLOAD_DIR = "uploads"
ALLOWED_TYPES = {
    "image/jpeg", "image/jpg", "image/png", "image/webp",
    "image/tiff", "application/pdf"
}

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    print(f"📤 Upload request: {file.filename} ({file.content_type})")
    
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type not supported. Allowed: JPEG, PNG, WEBP, TIFF, PDF"
        )

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 10MB.")

    file_ext = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        with open(file_path, "wb") as f:
            f.write(contents)
        print(f"💾 File saved: {file_path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Create database record
    doc = Document(
        filename=file.filename,
        original_filename=file.filename,
        file_path=file_path,
        file_type=file_ext,
        file_size=len(contents),
        status="processing"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    print(f"🆕 Document created: {doc.id}")

    # Process in background
    background_tasks.add_task(process_document, doc.id, file_path, file_ext)

    return {
        "id": doc.id,
        "document_id": doc.id,
        "message": "Document uploaded successfully",
        "status": "processing",
        "filename": file.filename
    }


def process_document(doc_id: str, file_path: str, file_type: str):
    """Background task to process document"""
    from app.database import SessionLocal
    db = SessionLocal()
    
    print(f"🔧 Processing document {doc_id}...")
    
    try:
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            print(f"❌ Document {doc_id} not found")
            return

        # OCR
        print(f"🔍 Starting OCR for {file_type}...")
        raw_text = ocr_service.extract_text(file_path, file_type)
        print(f"📝 OCR result: {len(raw_text)} characters")

        if not raw_text.strip() or raw_text.startswith("Error"):
            print(f"❌ OCR failed: {raw_text[:100]}")
            doc.status = "error"
            doc.raw_text = raw_text if raw_text else "No text extracted"
            doc.metadata_json = {"error": "OCR failed", "details": raw_text}
            db.commit()
            return

        # AI Analysis
        print(f"🤖 Starting AI analysis...")
        analysis = analyzer.analyze_document(raw_text)
        print(f"📊 Analysis complete: {analysis.get('doc_type', 'unknown')}")
        
        # Extraction des données
        doc_type = analysis.get("doc_type", "other")
        entities = analysis.get("entities", {})
        summary = analysis.get("summary", "No summary available")
        confidence = float(analysis.get("confidence", 0.0))
        
        print(f"   - Type: {doc_type}")
        print(f"   - Summary: {summary[:50]}...")
        print(f"   - Confidence: {confidence}")

        # Questions
        suggestions = analyzer.suggest_questions(raw_text, doc_type)

        # Vector store
        try:
            vector_store.add_document(
                doc_id=doc_id,
                text=raw_text,
                metadata={"filename": doc.original_filename, "document_type": doc_type}
            )
        except Exception as e:
            print(f"⚠️  Vector store error: {e}")

        # Update document
        doc.raw_text = raw_text
        doc.document_type = doc_type
        doc.summary = summary
        doc.entities = entities
        doc.language = analysis.get("language", "unknown")
        doc.confidence = confidence
        doc.metadata_json = {
            "suggested_questions": suggestions,
            "page_count": raw_text.count("--- Page"),
            "word_count": len(raw_text.split()),
            "processed_at": datetime.utcnow().isoformat(),
            "anomalies": analysis.get("anomalies", [])
        }
        doc.status = "completed"
        
        db.commit()
        print(f"✅ Document {doc_id} processing complete!")

    except Exception as e:
        import traceback
        print(f"❌ Error processing {doc_id}: {e}")
        print(traceback.format_exc())
        
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if doc:
            doc.status = "error"
            doc.metadata_json = {"error": str(e), "traceback": traceback.format_exc()}
            db.commit()
    finally:
        db.close()


@router.get("/")
def list_documents(
    skip: int = 0,
    limit: int = 50,
    document_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Document)
    if document_type:
        query = query.filter(Document.document_type == document_type)
    
    docs = query.order_by(Document.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        {
            "id": d.id,
            "filename": d.filename,
            "original_filename": d.original_filename,
            "doc_type": d.document_type,
            "summary": d.summary,
            "language": d.language,
            "confidence": d.confidence,
            "status": d.status,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        }
        for d in docs
    ]


@router.get("/types")
def get_document_types(db: Session = Depends(get_db)):
    types = db.query(Document.document_type).distinct().all()
    return [t[0] for t in types if t[0]]


@router.get("/{doc_id}")
def get_document(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {
        "id": doc.id,
        "filename": doc.filename,
        "original_filename": doc.original_filename,
        "file_type": doc.file_type,
        "file_size": doc.file_size,
        "doc_type": doc.document_type,
        "document_type": doc.document_type,
        "summary": doc.summary,
        "language": doc.language,
        "confidence": doc.confidence,
        "entities": doc.entities if doc.entities else {},
        "status": doc.status,
        "metadata": doc.metadata_json if doc.metadata_json else {},
        "created_at": doc.created_at.isoformat() if doc.created_at else None,
        "updated_at": doc.updated_at.isoformat() if doc.updated_at else None,
    }


@router.get("/{doc_id}/text")
def get_document_text(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {
        "document_id": doc_id,
        "text": doc.raw_text or "Text not yet extracted",
        "status": doc.status
    }


@router.delete("/{doc_id}")
def delete_document(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    try:
        if os.path.exists(doc.file_path):
            os.remove(doc.file_path)
    except Exception as e:
        print(f"Warning: Could not delete file: {e}")
    
    try:
        vector_store.delete_document(doc_id)
    except Exception as e:
        print(f"Warning: Could not delete from vector store: {e}")
    
    db.delete(doc)
    db.commit()
    
    return {"message": "Document deleted successfully"}