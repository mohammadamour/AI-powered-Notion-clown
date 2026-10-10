"use client";

import { useState, useEffect } from "react";
import { Sparkles, Save } from "lucide-react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { 
  FormattingToolbarController, 
  FormattingToolbar,
  getFormattingToolbarItems
} from "@blocknote/react";
import "@blocknote/mantine/style.css";
import { createDocument, processBrainDump } from "@/lib/api";

export default function DailyLogContent() {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [today, setToday] = useState("");

  const editor = useCreateBlockNote();

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  const handleAIMagic = async () => {
    const selection = editor.getSelection();
    if (!selection || selection.blocks.length === 0) return;
    
    setIsAiLoading(true);
    try {
      const markdown = await editor.blocksToMarkdownLossy(selection.blocks);
      const aiResponse = await processBrainDump(markdown);
      
      const structuredContent = `### ✨ ${aiResponse.thought.title}
**Summary:** ${aiResponse.thought.summary}

**Action Items:**
${aiResponse.thought.action_items?.length ? aiResponse.thought.action_items.map((item: string) => `- [ ] ${item}`).join('\n') : "None"}

**Tags:** ${aiResponse.thought.tags?.map((tag: string) => `#${tag}`).join(', ')}
`;

      const newBlocks = await editor.tryParseMarkdownToBlocks(structuredContent);
      editor.replaceBlocks(selection.blocks, newBlocks);
    } catch (e: any) {
      alert(`AI failed: ${e.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveDay = async () => {
    setIsSaving(true);
    try {
      const markdown = await editor.blocksToMarkdownLossy(editor.document);
      await createDocument(today, markdown, "Daily Log");
      alert("Daily log saved successfully!");
    } catch (e: any) {
      alert(`Failed to save: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 20px", minHeight: "100vh" }}>
      {/* Header Area */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1px solid var(--color-surface-border)", paddingBottom: "20px", marginBottom: "40px" }}>
        <div>
          <p style={{ color: "var(--color-text-tertiary)", fontWeight: 600, fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
            Daily Log
          </p>
          <h1 style={{ fontSize: "42px", fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: "-1px" }}>
            {today || "Loading..."}
          </h1>
        </div>
        
        <button
          onClick={handleSaveDay}
          disabled={isSaving}
          style={{
            background: "var(--color-surface-hover)",
            color: "var(--color-text-secondary)",
            border: "1px solid var(--color-surface-border)",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: isSaving ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--color-bg-primary)";
            e.currentTarget.style.color = "var(--color-text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--color-surface-hover)";
            e.currentTarget.style.color = "var(--color-text-secondary)";
          }}
        >
          <Save size={16} />
          {isSaving ? "Saving..." : "Save Page"}
        </button>
      </div>
      
      {/* Full Page Editor */}
      <div style={{ minHeight: "60vh", fontSize: "16px", padding: "0 10px" }}>
        <BlockNoteView editor={editor} theme="dark" formattingToolbar={false}>
          <FormattingToolbarController
            formattingToolbar={() => (
              <FormattingToolbar>
                {getFormattingToolbarItems()}
                
                {/* Custom AI Button inserted into the default toolbar */}
                <button
                  onClick={handleAIMagic}
                  disabled={isAiLoading}
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #d946ef)",
                    color: "white",
                    border: "none",
                    padding: "4px 12px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: isAiLoading ? "wait" : "pointer",
                    marginLeft: "8px",
                    marginRight: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 2px 10px rgba(217, 70, 239, 0.2)"
                  }}
                >
                  <Sparkles size={14} />
                  {isAiLoading ? "Structuring..." : "Summarize with AI"}
                </button>
              </FormattingToolbar>
            )}
          />
        </BlockNoteView>
      </div>
    </div>
  );
}
