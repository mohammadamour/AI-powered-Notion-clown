"use client";

import { useState, useCallback, useEffect } from "react";
import { Send } from "lucide-react";
import DailyLogEntry from "@/components/daily-log/DailyLogEntry";
import { MOODS } from "@/lib/constants";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDocuments, createDocument, processBrainDump } from "@/lib/api";

export default function DailyLogContent() {
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
    mutationFn: async (vars: { content: string }) => {
      // 1. Send the raw thought to Gemini for structure
      const aiResponse = await processBrainDump(vars.content);
      
      const structuredContent = `## Summary
${aiResponse.thought.summary}

## Action Items
${aiResponse.thought.action_items && aiResponse.thought.action_items.length > 0 
  ? aiResponse.thought.action_items.map((item: string) => `- [ ] ${item}`).join('\n') 
  : "None"}

## Tags
${aiResponse.thought.tags ? aiResponse.thought.tags.map((tag: string) => `#${tag}`).join(', ') : ""}

## Category
${aiResponse.thought.category}

---
**Original Thought:**
${vars.content}`;

      // 2. Save the structure to our database
      return createDocument(
        aiResponse.thought.title,
        structuredContent,
        aiResponse.thought.category
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      editor.replaceBlocks(editor.document, [{ type: "paragraph", content: "" }]);
      setHasContent(false);
      setSelectedMood(undefined);
    },
    onError: (error: any) => {
      alert(`Error processing your log: ${error.message || error}`);
    }
  });

  const handleSubmit = useCallback(async () => {
    if (!hasContent || mutation.isPending) return;

    const markdown = await editor.blocksToMarkdownLossy(editor.document);
    mutation.mutate({ content: markdown });
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
                content={`**${doc.title}**\n\n${doc.content}`}
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
