from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def health():
    return {"status": "ok", "service": "DocuMind API"}

@router.get("/")
def root():
    return {"message": "DocuMind API is running. Visit /docs for API documentation."}