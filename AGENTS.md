# 🤖 Agent Guidelines: AI-Powered Second Brain (Notion Clone)

Welcome! You are working on a full-stack, AI-powered "Second Brain" note-taking application. This document provides critical context, architecture details, and environment quirks to ensure you can seamlessly continue development without breaking existing setups.

## 🎯 Project Overview
We are building a frictionless, Notion-like application where the user can dump unstructured thoughts, and an AI automatically structures, tags, and organizes them into a cohesive knowledge base. 
**Design Philosophy:** Zero-friction UX, premium aesthetics (dark mode, glassmorphism, no generic colors), and production-grade architecture.

## 🛠️ Technology Stack
- **Frontend:** Next.js 15 (App Router), React, TypeScript.
  - **Styling:** Vanilla CSS (No Tailwind).
  - **Editor:** BlockNote (`@blocknote/react`) for Notion-like block editing.
  - **State/Data:** TanStack Query (`@tanstack/react-query`).
- **Backend:** Python (FastAPI).
  - **ORM:** SQLModel (SQLAlchemy).
  - **Database Driver:** `pg8000` (Pure Python PostgreSQL driver).
  - **AI Integration:** Google Gemini Pro API (via direct REST/`httpx`).
- **Database:** Supabase (PostgreSQL).

## ⚠️ CRITICAL Environment Constraints (READ THIS FIRST)

1. **The Python MSYS2 Issue (Windows):**
   - The user's default `python` command resolves to an unstable MSYS2/Mingw Python 3.14 installation. This environment lacks a Rust/C++ compiler, causing `pip install` to instantly crash when trying to build core dependencies like `pydantic-core` or `fastapi`.
   - **THE FIX:** The user has a stable Python 3.12 installation located at `C:\Users\somet\AppData\Local\Programs\Python\Python312\python.exe`.
   - **YOUR RULE:** When managing the backend, ALWAYS ensure the user runs commands inside the `backend/venv` virtual environment (which is bound to Python 3.12). Do NOT run `pip install` using the global `python` alias.

2. **Supabase IPv6 Connection Issue:**
   - The user's local network does not support IPv6.
   - You MUST use the **Supabase Session Pooler** URL (e.g., `aws-0-[region].pooler.supabase.com:5432`) which resolves to IPv4.
   - Do NOT use the "Direct Connection" URL (`db.[project].supabase.co`) as it will result in an instant timeout/InterfaceError.
   - The SQLAlchemy connection string in `.env` MUST be prefixed with `postgresql+pg8000://` to use the pure Python driver.

3. **Next.js & BlockNote (SSR Restrictions):**
   - BlockNote relies heavily on browser APIs (`window`, `document`).
   - Any Next.js page rendering BlockNote (like `/daily-log`) must wrap the editor component in a `next/dynamic` import with `ssr: false`, and the parent page must be explicitly marked as a `"use client"` component.

## 🏗️ Current Architecture & Progress

- **Completed - Phase 1: Core Infrastructure:**
  - Database schema defined in `backend/app/models/domain.py` (`User`, `Document`, `Block`).
  - Next.js frontend layout established with a custom `Providers` wrapper for React Query.
- **Completed - Phase 2: AI Gardener Integration:**
  - AI logic is housed in `backend/app/services/gardener.py`. It takes raw markdown, prompts Gemini Pro, and returns a structured `ProcessedThought` (Title, Category, Tags, Summary, Action Items).
  - The Daily Log page (`/daily-log`) successfully captures user input, sends it to the AI for structuring, and persists the result to Supabase via FastAPI.
- **Up Next - Phase 3: The Mind Tree & Infinite Canvas:**
  - We are transitioning into building the visualization layer where documents and tags are mapped out visually.

## 🚀 Running the Project Locally

**Frontend:**
```bash
cd frontend
npm run dev
```

**Backend:**
```bash
cd backend
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --port 8000
```
*(Remind the user to activate the venv if backend dependencies fail!)*
