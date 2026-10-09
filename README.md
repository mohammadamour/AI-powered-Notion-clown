# AI-Powered "Second Brain" Project

## Core Concept
A "zero-friction" personal knowledge base where the AI acts as a personal librarian. The user dumps raw information (notes, links, images, audio), and the AI automatically organizes, tags, and synthesizes it, completely removing the manual labor required by tools like Notion or Obsidian.

## Quick Start

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# → http://localhost:8000
# → API Docs: http://localhost:8000/docs
```

> **Note:** The frontend works independently — if the backend isn't running, the Omnibox falls back to local capture mode.

## Tech Stack
- **Frontend:** Next.js 15 (App Router), TypeScript, React Flow (`@xyflow/react`), Lucide icons, Vanilla CSS
- **Editor:** Exploring BlockNote or TipTap for a native, lightweight Notion-style block editor experience without the bloat of forking a massive mono-repo.
- **Backend/AI:** Python (FastAPI), handling LangChain/LlamaIndex logic, vector embeddings, and LLM integrations.
- **Database:** A Vector Database (e.g., Pinecone, ChromaDB) for semantic search, plus a standard DB for user metadata.

## Project Structure
```
AI project/
├── frontend/                 # Next.js (App Router, TypeScript)
│   ├── src/
│   │   ├── app/              # Pages (Dashboard, Daily Log, Mind Tree)
│   │   ├── components/       # Reusable UI components
│   │   └── lib/              # API client, constants
│   └── package.json
├── backend/                  # Python FastAPI
│   ├── app/
│   │   ├── api/routes/       # HTTP endpoints
│   │   ├── core/             # Config & settings
│   │   ├── models/           # Pydantic schemas
│   │   └── services/         # Business logic (AI Gardener)
│   ├── requirements.txt
│   └── .env.example
└── README.md
```

## Architecture & Core Features

### 1. The 2D "Mind Tree" Navigation
Alongside a classic sidebar, the app features an interactive 2D mind-map view. It starts from a central node (e.g., "Ethan's Second Brain") and expands into main branches (Coding, Fitness, Philosophy, Business), which further split into sub-branches. This visually organic approach makes navigating and visualizing complex domains incredibly intuitive.

### 2. The Frictionless Daily Log
Indexing thoughts is exhausting. This is a dedicated section for unpolished daily dumps, auto-titled with the date. 
- You can type or speak (using AI transcription like Whisper). 
- A "Summarize/Polish" toggle allows you to instantly structure the raw thoughts and remove fillers, or view the original, raw emotional rant if preferred.

### 3. The Active "Gardener" AI Assistant
The AI isn't just a chatbot; it works proactively in the background. It parses fragmented ideas into clear documents, automatically categorizes topics onto your Mind Tree branches, finds links between disparate ideas, and handles robust search/retrieval.

### 4. The Serendipity Engine (Smart Reminders)
A system for reminders (language learning goals, to-dos, quotes, insights). Using spaced repetition, the AI serendipitously surfaces past insights that you wanted to remember, naturally weaving them into your workflow or dashboard.

### 5. The "Omnibox" (One Input to Rule Them All)
Instead of navigating through complex menus, the main UI has one massive, beautiful input bar. Paste a URL to scrape it, type a thought to save it, or ask a question to chat with your data—zero clicks required.

### 6. The Proactive "Ghost Writer"
It doesn't just store information; it actively helps create things from it. Spend weeks randomly dumping thoughts, and then ask the AI to "draft a blog post based on my notes from this month." It hunts down fragmented thoughts, stitches them together, and generates a structured outline.

## Keyboard Shortcuts
| Shortcut | Action |
|---|---|
| `Ctrl + K` | Open Command Palette |
| `Ctrl + Enter` | Submit (in Daily Log / Quick Capture) |
| `Enter` | Submit (in Omnibox) |
| `Esc` | Close modal / palette |

## Configuration
Copy the example env file and configure as needed:
```bash
cp backend/.env.example backend/.env
```

Set `LLM_PROVIDER` to `openai` or `anthropic` and provide your API key when ready to enable real AI processing.

## Next Steps
- [ ] Finalize the decision on how the AI routes Daily Logs to the Mind Tree (Auto vs. Manual).
- [ ] Integrate a rich text editor (BlockNote or TipTap) into the Daily Log.
- [ ] Finalize architectural choices (DB, specific LLM models).
- [ ] Add real LLM integration to the Gardener service.
- [ ] Add persistence (database layer).
