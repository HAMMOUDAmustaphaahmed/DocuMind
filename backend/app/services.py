"""
Core services: OCR, AI Analysis (Tesseract 5.5 + Groq)
"""
import os
import json
import re
import traceback
from typing import List, Dict, Any, Optional
from datetime import datetime

from PIL import Image
from groq import Groq

# CHARGER LE .ENV
from dotenv import load_dotenv
load_dotenv()

# Initialize Groq client avec vérification
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
print(f"🔑 GROQ_API_KEY loaded: {'Yes (' + str(len(GROQ_API_KEY)) + ' chars)' if GROQ_API_KEY else 'NO - Check .env file!'}")

if not GROQ_API_KEY:
    print("⚠️  WARNING: GROQ_API_KEY not set! AI features will not work.")
    groq_client = None
else:
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
        print("✅ Groq client initialized")
    except Exception as e:
        print(f"❌ Failed to initialize Groq: {e}")
        groq_client = None

# Import Tesseract
try:
    import pytesseract
    from pdf2image import convert_from_path
    TESSERACT_AVAILABLE = True
    print("✅ Tesseract OCR available")
except ImportError as e:
    TESSERACT_AVAILABLE = False
    print(f"❌ Tesseract not available: {e}")

# Stockage mémoire
memory_store = {}

DOCUMENT_PATTERNS = {
    "invoice": ["invoice", "facture", "bill to", "total due", "payment due", "invoice number", "facture n°", "montant", "total ttc", "ht", "tva"],
    "contract": ["contract", "agreement", "terms and conditions", "parties", "hereby agree", "signature", "contrat", "accord"],
    "resume": ["experience", "education", "skills", "curriculum vitae", "cv", "professional summary", "compétences", "formation"],
    "receipt": ["receipt", "ticket", "cash", "change", "thank you", "purchase", "reçu", "caisse"],
    "bank_statement": ["statement", "account", "balance", "transaction", "debit", "credit", "bank", "relevé", "bancaire"],
    "id_document": ["passport", "id card", "identification", "nationality", "date of birth", "expires", "carte d'identité", "passeport"],
    "report": ["report", "analysis", "findings", "conclusion", "rapport", "étude"],
    "letter": ["dear", "sincerely", "regards", "letter", "madam", "sir", "cher", "cordialement"],
    "email": ["from:", "to:", "subject:", "sent:", "email", "cc:", "bcc:"],
    "form": ["form", "application", "field", "formulaire", "demande"],
}


class OCRService:
    """Handles OCR extraction"""
    
    @staticmethod
    def extract_from_pdf(file_path: str) -> str:
        """Extract text from PDF using OCR"""
        if not TESSERACT_AVAILABLE:
            return "Error: Tesseract not installed"
        
        try:
            images = convert_from_path(file_path, dpi=300)
            text_parts = []
            
            for i, image in enumerate(images):
                page_text = pytesseract.image_to_string(
                    image, 
                    lang='fra+eng',
                    config='--psm 6'
                )
                text_parts.append(f"--- Page {i + 1} ---\n{page_text}")
            
            full_text = "\n\n".join(text_parts)
            print(f"📄 PDF extracted: {len(full_text)} characters")
            return full_text
            
        except Exception as e:
            error_msg = f"Error extracting PDF: {str(e)}"
            print(f"❌ {error_msg}")
            return error_msg
    
    @staticmethod
    def extract_from_image(file_path: str) -> str:
        """Extract text from image"""
        if not TESSERACT_AVAILABLE:
            return "Error: Tesseract not available"
        
        try:
            image = Image.open(file_path)
            
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            text = pytesseract.image_to_string(
                image, 
                lang='fra+eng',
                config='--psm 3'
            )
            
            cleaned_text = text.strip()
            print(f"🖼️  Image extracted: {len(cleaned_text)} characters")
            return cleaned_text
            
        except Exception as e:
            error_msg = f"Error extracting image: {str(e)}"
            print(f"❌ {error_msg}")
            return error_msg
    
    @staticmethod
    def extract_text(file_path: str, file_type: str) -> str:
        """Extract text based on file type"""
        ext = file_type.lower()
        
        print(f"🔍 Extracting text from: {file_path} (type: {ext})")
        
        if ext == '.pdf':
            return OCRService.extract_from_pdf(file_path)
        elif ext in ['.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.gif', '.webp']:
            return OCRService.extract_from_image(file_path)
        elif ext in ['.txt', '.md', '.csv']:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            except UnicodeDecodeError:
                with open(file_path, 'r', encoding='latin-1') as f:
                    return f.read()
        else:
            return f"Unsupported file type: {file_type}"


class DocumentAnalyzer:
    """AI-powered document analysis"""
    
    @staticmethod
    def detect_document_type(text: str) -> str:
        text_lower = text.lower()
        scores = {}
        
        for doc_type, patterns in DOCUMENT_PATTERNS.items():
            score = sum(1 for pattern in patterns if pattern in text_lower)
            if score > 0:
                scores[doc_type] = score
        
        detected = max(scores, key=scores.get) if scores else "other"
        print(f"📋 Detected document type: {detected}")
        return detected
    
    @staticmethod
    def analyze_document(text: str) -> dict:
        """Complete document analysis with Groq"""
        
        # Vérifier si Groq est disponible
        if not groq_client:
            print("❌ Cannot analyze: Groq client not available")
            return {
                "doc_type": "other",
                "language": "unknown",
                "summary": "AI analysis unavailable - API key not configured",
                "confidence": 0.0,
                "entities": {"dates": [], "amounts": [], "names": [], "key_fields": {}},
                "anomalies": ["Groq API not configured"]
            }
        
        # Vérifier si le texte est valide
        if not text or text.startswith("Error") or len(text.strip()) < 10:
            print(f"❌ Cannot analyze: Invalid text (length: {len(text) if text else 0})")
            return {
                "doc_type": "other",
                "language": "unknown",
                "summary": f"Cannot analyze: {text[:100] if text else 'No text extracted'}",
                "confidence": 0.0,
                "entities": {"dates": [], "amounts": [], "names": [], "key_fields": {}},
                "anomalies": ["OCR failed or no text extracted"]
            }
        
        # Tronquer si trop long
        truncated = text[:3500] if len(text) > 3500 else text
        print(f"🤖 Sending to Groq for analysis ({len(truncated)} chars)...")
        
        prompt = f"""Analyze this document and return ONLY valid JSON.

Document text:
{truncated}

Return exactly this JSON structure:
{{
  "doc_type": "invoice|contract|cv|report|letter|identity_card|receipt|form|email|other",
  "language": "French|English|Spanish|etc",
  "summary": "2-3 sentence summary of what this document contains",
  "confidence": 0.95,
  "entities": {{
    "dates": ["any dates found"],
    "amounts": ["any monetary values"],
    "names": ["people or company names"],
    "key_fields": {{"important_field": "value"}}
  }},
  "anomalies": []
}}"""

        try:
            response = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=1500,
                timeout=30
            )

            raw = response.choices[0].message.content.strip()
            print(f"📝 Raw Groq response: {raw[:200]}...")
            
            # Nettoyer le markdown
            raw = re.sub(r'```json\s*', '', raw)
            raw = re.sub(r'```\s*', '', raw)
            raw = raw.strip()

            # Parser le JSON
            try:
                result = json.loads(raw)
                print(f"✅ Analysis successful: {result.get('doc_type', 'unknown')}")
                return result
            except json.JSONDecodeError as json_err:
                print(f"⚠️  JSON parse error: {json_err}")
                print(f"Raw content: {raw[:500]}")
                # Fallback: retourner le texte brut comme résumé
                return {
                    "doc_type": "other",
                    "language": "unknown",
                    "summary": raw[:300] if len(raw) > 10 else "Could not parse AI response",
                    "confidence": 0.3,
                    "entities": {"dates": [], "amounts": [], "names": [], "key_fields": {}},
                    "anomalies": ["JSON parsing failed"]
                }
            
        except Exception as e:
            error_detail = traceback.format_exc()
            print(f"❌ Groq API error: {e}")
            print(error_detail)
            return {
                "doc_type": "other",
                "language": "unknown",
                "summary": f"AI analysis failed: {str(e)}",
                "confidence": 0.0,
                "entities": {"dates": [], "amounts": [], "names": [], "key_fields": {}},
                "anomalies": [str(e)]
            }
    
    @staticmethod
    def suggest_questions(text: str, document_type: str) -> List[str]:
        """Suggest relevant questions"""
        if not groq_client or not text or text.startswith("Error"):
            return [
                "What is this document about?",
                "What are the key points mentioned?",
                "Are there any important dates or deadlines?",
                "What actions are required?",
                "Who is involved in this document?"
            ]
        
        prompt = f"""Based on this {document_type} document, suggest 5 relevant questions.
Return ONLY a JSON array of strings, nothing else.

Document preview: {text[:1000]}..."""

        try:
            response = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": "Return only a JSON array of 5 questions."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=300,
                timeout=20
            )
            
            content = response.choices[0].message.content
            content = re.sub(r'```json\s*', '', content)
            content = re.sub(r'```\s*', '', content)
            content = content.strip()
            
            questions = json.loads(content)
            if isinstance(questions, list) and len(questions) > 0:
                return questions[:5]
            return [
                "What is the main purpose of this document?",
                "What are the key dates mentioned?",
                "What are the important amounts or figures?",
                "Who are the parties involved?",
                "Are there any action items or next steps?"
            ]
        except Exception as e:
            print(f"⚠️  Failed to generate questions: {e}")
            return [
                "What is the main purpose of this document?",
                "What are the key dates mentioned?",
                "What are the important amounts or figures?",
                "Who are the parties involved?",
                "Are there any action items or next steps?"
            ]


class SimpleVectorStore:
    """Stockage vectoriel simple"""
    
    @staticmethod
    def add_document(doc_id, text: str, metadata: Dict):
        global memory_store
        key = str(doc_id)
        
        # Ne pas stocker si texte est une erreur
        if not text or text.startswith("Error"):
            memory_store[key] = {
                "chunks": [],
                "text": text if text else "",
                "metadata": metadata,
                "error": text if text else "No text"
            }
            print(f"⚠️  Document {doc_id} stored with error: {text[:100] if text else 'None'}")
            return
        
        chunks = SimpleVectorStore._chunk_text(text, 1000, 200)
        
        memory_store[key] = {
            "chunks": chunks,
            "text": text,
            "metadata": metadata,
            "created_at": datetime.utcnow().isoformat()
        }
        print(f"✅ Document {doc_id} stored in memory ({len(chunks)} chunks)")
    
    @staticmethod
    def query_similar(query: str, doc_id=None, n_results: int = 5) -> List[str]:
        global memory_store
        
        doc_key = str(doc_id) if doc_id else None
        
        if doc_key and doc_key in memory_store:
            chunks = memory_store[doc_key].get("chunks", [])
        elif doc_key:
            return []
        else:
            all_chunks = []
            for doc_data in memory_store.values():
                all_chunks.extend(doc_data.get("chunks", []))
            chunks = all_chunks
        
        if not chunks:
            # Fallback: retourner le texte complet si pas de chunks
            full_text = SimpleVectorStore.get_document_text(doc_id)
            if full_text:
                return [full_text[:3000]]  # Retourner les 3000 premiers caractères
            return []
        
        # Matching par mots-clés
        query_words = set(query.lower().split())
        if not query_words:
            return chunks[:n_results]
        
        scored = []
        for chunk in chunks:
            words = set(chunk.lower().split())
            score = len(query_words & words)
            if score > 0:
                scored.append((score, chunk))
        
        scored.sort(reverse=True, key=lambda x: x[0])
        result = [c for s, c in scored[:n_results]]
        
        # Si pas de résultats, retourner les premiers chunks
        if not result and chunks:
            return chunks[:n_results]
        
        return result
    
    @staticmethod
    def get_document_text(doc_id) -> str:
        key = str(doc_id)
        return memory_store.get(key, {}).get("text", "")
    
    @staticmethod
    def delete_document(doc_id):
        key = str(doc_id)
        if key in memory_store:
            del memory_store[key]
            print(f"🗑️  Document {doc_id} deleted from memory")
    
    @staticmethod
    def _chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        words = text.split()
        if not words:
            return []
        
        chunks = []
        start = 0
        
        while start < len(words):
            end = min(start + chunk_size, len(words))
            chunk = ' '.join(words[start:end])
            if chunk.strip():
                chunks.append(chunk)
            start += (chunk_size - overlap)
            if start >= len(words):
                break
        
        return chunks


class ChatService:
    """Service de chat"""
    
    @staticmethod
    def get_answer(query: str, doc_id, chat_history: List[Dict] = None) -> str:
        """Get answer using document context"""
        
        # Vérifier Groq
        if not groq_client:
            return "Error: Groq API not configured. Please check your GROQ_API_KEY in .env file."
        
        # Récupérer le contexte
        context_chunks = SimpleVectorStore.query_similar(query, doc_id, n_results=3)
        
        if context_chunks:
            context = "\n\n".join(context_chunks)
        else:
            context = SimpleVectorStore.get_document_text(doc_id)[:3000]
        
        print(f"💬 Chat query: '{query[:50]}...' | Context: {len(context)} chars")
        
        if not context.strip():
            return "I don't have any document content to answer your question. The document may still be processing or the OCR failed to extract text."
        
        messages = [
            {"role": "system", "content": f"""You are a helpful document analysis assistant. 
Answer the user's question based ONLY on the provided document context below.
If the answer is not in the document, say clearly: "I cannot find this information in the document."
Be concise and accurate.

Document context:
{context}"""}
        ]
        
        if chat_history:
            messages.extend(chat_history[-5:])
        
        messages.append({"role": "user", "content": query})
        
        try:
            response = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=messages,
                temperature=0.2,
                max_tokens=800,
                timeout=30
            )
            answer = response.choices[0].message.content.strip()
            print(f"✅ Chat answer generated ({len(answer)} chars)")
            return answer
            
        except Exception as e:
            error_msg = f"Error generating answer: {str(e)}"
            print(f"❌ {error_msg}")
            return error_msg


# Initialize
ocr_service = OCRService()
analyzer = DocumentAnalyzer()
vector_store = SimpleVectorStore()
chat_service = ChatService()

print("🚀 Services initialized")