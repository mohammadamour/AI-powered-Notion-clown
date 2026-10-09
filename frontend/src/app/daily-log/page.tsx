"use client";

import { useState, useCallback, useEffect } from "react";
import { Send } from "lucide-react";
import DailyLogEntry from "@/components/daily-log/DailyLogEntry";
import { MOODS } from "@/lib/constants";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDocuments, createDocument } from "@/lib/api";

interface LogEntry {
  id: string;
  content: string;
  mood?: string;
  time: string;
}

// Sample entries for development
const SAMPLE_ENTRIES: LogEntry[] = [
  {
    id: "1",
    content:
      "Had a great insight about the Second Brain project today. The Omnibox should detect intent from the input — URLs get scraped, questions trigger search, plain text gets categorized. This removes the need for separate buttons entirely.",
    mood: "💡",
    time: "14:32",
  },
  {
    id: "2",
    content:
      "Feeling stuck on the database choice. Vector DBs are great for semantic search but I also need relational data for user accounts and metadata. Maybe a hybrid approach? PostgreSQL + pgvector could be a single-DB solution.",
    mood: "😐",
    time: "11:15",
  },
  {
    id: "3",
    content:
      "Morning workout done. 5x5 squats at 100kg. Need to increase protein intake — aiming for 160g/day minimum. Also need to fix my sleep schedule, been going to bed too late.",
    mood: "😊",
    time: "08:45",
  },
];

export default function DailyLogPage() {
  const queryClient = useQueryClient();
  
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: getDocuments,
  });
  const [selectedMood, setSelectedMood] = useState<string | undefined>();
  const [hasContent, setHasContent] = useState(false);

  const editor = useCreateBlockNote();

  const handleChange = useCallback(() => {
    // Check if the editor has meaningful text (more than just an empty paragraph)
    const blocks = editor.document;
    const text = blocks.map((b) => ('content' in b ? b.content : "")).toString().trim();
    setHasContent(blocks.length > 1 || text.length > 0);
  }, [editor]);

  const [today, setToday] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setToday(
        new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const mutation = useMutation({
    mutationFn: (vars: { title: string; content: string }) =>
      createDocument(vars.title, vars.content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      editor.replaceBlocks(editor.document, [{ type: "paragraph", content: "" }]);
      setHasContent(false);
      setSelectedMood(undefined);
    },
  });

  const handleSubmit = useCallback(async () => {
    if (!hasContent || mutation.isPending) return;

    const markdown = await editor.blocksToMarkdownLossy(editor.document);
    const title = markdown.split("\n")[0].substring(0, 40) || "Brain Dump";

    mutation.mutate({ title, content: markdown });
  }, [hasContent, editor, mutation]);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="daily-log-header">
        <h1 className="daily-log-date">{today}</h1>
        <p className="daily-log-subtitle">
          Dump your thoughts below. No structure needed — just write.
        </p>
      </div>
      {/* Input Section */}
      <div className="daily-log-input-section" style={{ background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)", padding: "16px", border: "1px solid var(--color-surface-border)" }}>
        <BlockNoteView editor={editor} theme="dark" onChange={handleChange} />

        <div className="daily-log-controls" style={{ marginTop: "16px" }}>
          {/* Mood Picker */}
          <div className="mood-picker">
            {MOODS.map(({ emoji, label }) => (
              <button
                key={emoji}
                className={`mood-btn ${selectedMood === emoji ? "selected" : ""}`}
                onClick={() =>
                  setSelectedMood((prev) => (prev === emoji ? undefined : emoji))
                }
                title={label}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Submit */}
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!hasContent || mutation.isPending}
            id="daily-log-submit"
          >
            <Send size={14} />
            {mutation.isPending ? "Saving..." : "Log it"}
          </button>
        </div>
      </div>

      {/* Entries */}
      {isLoading ? (
        <p className="daily-log-subtitle" style={{ marginTop: "32px" }}>Loading entries...</p>
      ) : documents.length > 0 ? (
        <div className="daily-log-entries">
          <h3 className="daily-log-entries-title">
            Your Documents ({documents.length})
          </h3>
          {documents.map((doc) => {
            const timeStr = new Date(doc.created_at).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
            return (
              <DailyLogEntry
                key={doc.id}
                content={`**${doc.title}**\n*(Saved to database)*`}
                time={timeStr}
              />
            );
          })}
        </div>
      ) : (
        <p className="daily-log-subtitle" style={{ marginTop: "32px" }}>No documents yet.</p>
      )}
    </div>
  );
}
