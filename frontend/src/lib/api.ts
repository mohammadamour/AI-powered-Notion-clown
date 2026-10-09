/**
 * API Client for the Second Brain backend.
 *
 * Provides typed functions for all backend endpoints.
 * When the backend is not running, functions will throw — the UI
 * handles this gracefully by showing mock/local behavior.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Types (mirror the backend Pydantic schemas) ─────────────────

export interface ProcessedThought {
  title: string;
  summary: string;
  tags: string[];
  category: string;
  action_items: string[];
  connections: string[];
}

export interface ProcessResponse {
  success: boolean;
  thought: ProcessedThought;
  processing_time_ms: number;
}

export interface HealthResponse {
  status: string;
  app_name: string;
  version: string;
  llm_provider: string;
}

// ─── API Functions ───────────────────────────────────────────────

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function processBrainDump(
  content: string,
  source: string = "omnibox"
): Promise<ProcessResponse> {
  const res = await fetch(`${API_BASE}/api/brain/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, source }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `Processing failed: ${res.status}`);
  }
  return res.json();
}

export interface Document {
  id: number;
  title: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

export async function getDocuments(): Promise<Document[]> {
  const res = await fetch(`${API_BASE}/api/documents`);
  if (!res.ok) throw new Error(`Fetching documents failed: ${res.status}`);
  return res.json();
}

export async function createDocument(
  title: string,
  content_markdown: string,
  category: string = "Uncategorized"
): Promise<Document> {
  const res = await fetch(`${API_BASE}/api/documents/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      content_markdown,
      category,
    }),
  });
  if (!res.ok) throw new Error(`Creating document failed: ${res.status}`);
  return res.json();
}
