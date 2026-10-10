"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDocument } from "@/lib/api";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { getFormattingToolbarItems, FormattingToolbarController, FormattingToolbar } from "@blocknote/react";
import "@blocknote/mantine/style.css";

export default function DailyLogEntryContent({ id }: { id: string }) {
  const { data: document, isLoading, error } = useQuery({
    queryKey: ["document", id],
    queryFn: () => getDocument(id),
  });

  const editor = useCreateBlockNote();

  useEffect(() => {
    async function loadContent() {
      if (document && document.content) {
        const blocks = await editor.tryParseMarkdownToBlocks(document.content);
        editor.replaceBlocks(editor.document, blocks);
      }
    }
    loadContent();
  }, [document, editor]);

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
      <div style={{ borderBottom: "1px solid var(--color-surface-border)", paddingBottom: "20px", marginBottom: "40px" }}>
        <p style={{ color: "var(--color-text-tertiary)", fontWeight: 600, fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
          Past Entry
        </p>
        <h1 style={{ fontSize: "42px", fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: "-1px" }}>
          {document.title || dateStr}
        </h1>
      </div>
      
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
