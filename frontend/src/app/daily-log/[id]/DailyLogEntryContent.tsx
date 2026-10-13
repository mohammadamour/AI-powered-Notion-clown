"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDocument, updateDocument } from "@/lib/api";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { getFormattingToolbarItems, FormattingToolbarController, FormattingToolbar } from "@blocknote/react";
import "@blocknote/mantine/style.css";
import { Save, Circle } from "lucide-react";
import { useToast } from "@/components/toast/ToastProvider";

export default function DailyLogEntryContent({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: document, isLoading, error } = useQuery({
    queryKey: ["document", id],
    queryFn: () => getDocument(id),
  });

  const editor = useCreateBlockNote();
  const [title, setTitle] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Load document content into editor once
  useEffect(() => {
    async function loadContent() {
      if (document && !contentLoaded) {
        setTitle(document.title || "");
        if (document.content) {
          const blocks = await editor.tryParseMarkdownToBlocks(document.content);
          editor.replaceBlocks(editor.document, blocks);
        }
        setContentLoaded(true);
        // After load, mark clean
        setIsDirty(false);
      }
    }
    loadContent();
  }, [document, editor, contentLoaded]);

  // Track editor changes
  useEffect(() => {
    if (!contentLoaded) return;
    const unsubscribe = editor.onChange(() => setIsDirty(true));
    return unsubscribe;
  }, [editor, contentLoaded]);

  const handleSave = useCallback(async () => {
    if (!document || isSaving) return;
    setIsSaving(true);
    try {
      const markdown = await editor.blocksToMarkdownLossy(editor.document);
      const currentTitle = titleRef.current?.textContent?.trim() || title || "Untitled";
      await updateDocument(document.id, currentTitle, markdown);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document", id] });
      setIsDirty(false);
      toast("Changes saved ✓", "success");
    } catch (e: any) {
      toast(`Failed to save: ${e.message}`, "error");
    } finally {
      setIsSaving(false);
    }
  }, [document, isSaving, title, editor, queryClient, id, toast]);

  // Ctrl+S shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  if (isLoading) return <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--color-text-muted)" }}>Loading document...</div>;
  if (error) return <div style={{ padding: "60px 20px", color: "var(--color-error)" }}>Error loading document</div>;
  if (!document) return <div style={{ padding: "60px 20px", color: "var(--color-text-muted)" }}>Document not found</div>;

  const dateStr = new Date(document.created_at).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 20px", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--color-surface-border)", paddingBottom: "20px", marginBottom: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "16px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: "var(--color-text-tertiary)", fontWeight: 600, fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
              {dateStr}
            </p>
            {/* Inline-editable title */}
            <h1
              ref={titleRef}
              contentEditable
              suppressContentEditableWarning
              onInput={() => setIsDirty(true)}
              style={{
                fontSize: "42px",
                fontWeight: 800,
                color: "var(--color-text-primary)",
                letterSpacing: "-1px",
                outline: "none",
                borderBottom: "2px solid transparent",
                transition: "border-color 0.2s",
                cursor: "text",
                minWidth: "100px",
              }}
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = "var(--color-accent)")}
              onBlur={(e) => (e.currentTarget.style.borderBottomColor = "transparent")}
            >
              {document.title || dateStr}
            </h1>
          </div>

          {/* Save button + dirty indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            {isDirty && (
              <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "var(--color-warning)", fontWeight: 500 }}>
                <Circle size={7} fill="currentColor" />
                Unsaved changes
              </span>
            )}
            <button
              id="save-entry-btn"
              onClick={handleSave}
              disabled={isSaving}
              style={{
                background: isDirty ? "var(--gradient-accent)" : "var(--color-surface-hover)",
                color: isDirty ? "white" : "var(--color-text-secondary)",
                border: "1px solid var(--color-surface-border)",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: isSaving ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease",
                boxShadow: isDirty ? "0 0 16px rgba(139,92,246,0.3)" : "none",
              }}
            >
              <Save size={16} />
              {isSaving ? "Saving..." : (
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  Save
                  <span style={{ fontSize: "11px", opacity: 0.65, fontWeight: 500 }}>Ctrl+S</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div style={{ minHeight: "60vh", fontSize: "16px", padding: "0 10px" }}>
        <BlockNoteView editor={editor} theme="dark" formattingToolbar={false}>
          <FormattingToolbarController
            formattingToolbar={() => (
              <FormattingToolbar>
                {getFormattingToolbarItems()}
              </FormattingToolbar>
            )}
          />
        </BlockNoteView>
      </div>
    </div>
  );
}
