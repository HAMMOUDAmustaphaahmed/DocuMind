# DocuMind — Intelligent Document Analysis

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5.3-646CFF?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=three.js" alt="Three.js" />
</p>

**DocuMind** is a next‑generation document analysis platform that combines powerful OCR, advanced AI, and a stunning 3D interface. Upload any document – PDF, image, Word, or text – and get instant summaries, extracted entities, and an interactive Q&A experience.  
Built with React, FastAPI, and Tailwind CSS.

![Screenshot](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=DocuMind+Interface)

---

## ✨ Features

| Frontend | Backend |
|----------|---------|
| 🧠 **AI‑Powered Analysis** – Summaries, entity extraction, and Q&A via state‑of‑the‑art LLMs | 🔍 **OCR Engine** – Tesseract 5.5 extracts text from images and PDFs |
| 🎨 **Immersive 3D Document Viewer** – Flip pages with drag gestures (Three.js) | 🤖 **AI Integration** – Plug‑and‑play with any LLM (Groq, OpenAI, local) |
| 🌙 **Dark Mode & Dynamic Theming** – Adapts to document mood | 📁 **Multi‑Format Upload** – PDF, PNG, JPG, DOCX, TXT (up to 50MB) |
| ✨ **Particle‑Animated Progress** – Visual feedback during upload | 💾 **SQLite / PostgreSQL** – Persistent storage |
| 🏆 **Gamification** – Achievements, badges, and leaderboard | 🧩 **Vector Store** – Semantic search across documents |
| 🎭 **Micro‑interactions** – Morphing transitions, typing animations | 🔌 **RESTful API** – FastAPI with automatic interactive docs |
| 📱 **Responsive Design** – Works seamlessly on all devices | ⚡ **Background Tasks** – Non‑blocking processing |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18.0 and **npm** (for frontend)
- **Python** ≥ 3.10 and **pip** (for backend)
- **Tesseract OCR** installed on your system:
  - **Ubuntu/Debian**: `sudo apt install tesseract-ocr tesseract-ocr-fra tesseract-ocr-ara`
  - **macOS**: `brew install tesseract`
  - **Windows**: Download from [UB‑Mannheim](https://github.com/UB-Mannheim/tesseract/wiki)

### Clone & Install

```bash
git clone https://github.com/yourusername/documind.git
cd documind