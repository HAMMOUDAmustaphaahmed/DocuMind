from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# CHARGER LE .ENV AU DÉMARRAGE (avant tous les autres imports)
from dotenv import load_dotenv
load_dotenv()

from app.routers import documents, chat, health
from app.database import init_db
import os

app = FastAPI(title="DocuMind API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])

@app.on_event("startup")
async def startup():
    init_db()

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)