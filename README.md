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
**Note:** Ensure you are using a stable Python 3.12+ environment, as some dependencies like `pydantic-core` require native compilation that may fail in environments like Mingw/MSYS2.

```bash
cd backend
python -m venv venv
# On Windows PowerShell: .\venv\Scripts\Activate.ps1
# On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt pg8000
python -m uvicorn app.main:app --reload --port 8000
# → http://localhost:8000
# → API Docs: http://localhost:8000/docs
```

## Tech Stack
- **Frontend:** Next.js 15 (App Router), TypeScript, React, React Flow (`@xyflow/react`), TanStack Query, Vanilla CSS
- **Editor:** BlockNote (`@blocknote/react`) for a native, lightweight Notion-style block editor experience.
- **Backend/AI:** Python (FastAPI), Google Gemini Pro API via `httpx`.
- **Database:** Supabase (PostgreSQL) integrated via `pg8000` (pure-python driver) and SQLModel (SQLAlchemy).

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
Set up your `.env` file in the `backend` directory:
```bash
cp backend/.env.example backend/.env
```

Ensure your `.env` contains:
```env
GEMINI_API_KEY="your-gemini-api-key"
DATABASE_URL="postgresql+pg8000://postgres:[password]@[pooler-host].supabase.com:5432/postgres"
```
*(Note: If using Supabase and an IPv4 network, you must use the Session Pooler URL, not the direct connection URL).*

## Progress & Next Steps
- [x] Finalize architectural choices (Supabase, Gemini Pro, SQLModel).
- [x] Integrate a rich text editor (BlockNote) into the Daily Log (Client-side rendering).
- [x] Add real LLM integration to the Gardener service (Gemini Pro).
- [x] Add persistence (Supabase Postgres database layer).
- [ ] Transition to **Phase 3: The Mind Tree & Infinite Canvas** - Build the visualization layer mapping out documents and tags visually using React Flow.
