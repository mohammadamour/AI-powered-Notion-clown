# AI-Powered "Second Brain" Project

## Core Concept
A "zero-friction" personal knowledge base where the AI acts as a personal librarian. The user dumps raw information (notes, links, images, audio), and the AI automatically organizes, tags, and synthesizes it, completely removing the manual labor required by tools like Notion or Obsidian.

## Tech Stack (Planned)
- **Frontend:** Next.js (React), for a sleek, highly responsive, modern UI.
- **Editor:** Exploring BlockNote or TipTap for a native, lightweight Notion-style block editor experience without the bloat of forking a massive mono-repo.
- **Backend/AI:** Python (FastAPI), handling LangChain/LlamaIndex logic, vector embeddings, and LLM integrations.
- **Database:** A Vector Database (e.g., Pinecone, ChromaDB) for semantic search, plus a standard DB for user metadata.

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
It doesn’t just store information; it actively helps create things from it. Spend weeks randomly dumping thoughts, and then ask the AI to "draft a blog post based on my notes from this month." It hunts down fragmented thoughts, stitches them together, and generates a structured outline.

## Next Steps
- [ ] Finalize the decision on how the AI routes Daily Logs to the Mind Tree (Auto vs. Manual).
- [ ] Refine these ideas into a concrete execution plan.
- [ ] Finalize architectural choices (DB, specific LLM models).
- [ ] Scaffold the Next.js frontend and test BlockNote/TipTap.
- [ ] Scaffold the Python/FastAPI backend.
