"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Zap, X } from "lucide-react";

interface FloatingActionButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  onSubmit: (content: string) => void;
}

export default function FloatingActionButton({
  isOpen,
  onToggle,
  onSubmit,
}: FloatingActionButtonProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content.trim());
    setContent("");
    onToggle();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      onToggle();
    }
  };

  return (
    <>
      {/* FAB Button */}
      <button
        className="fab"
        onClick={onToggle}
        title="Quick Capture"
        id="fab-button"
      >
        <Plus size={24} />
      </button>

      {/* Quick Capture Modal */}
      {isOpen && (
        <div className="quick-capture-overlay" onClick={onToggle}>
          <div
            className="quick-capture-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="quick-capture-title">
              <Zap size={18} style={{ color: "var(--color-accent)" }} />
              Quick Capture
            </div>
            <textarea
              ref={textareaRef}
              className="quick-capture-textarea"
              placeholder="Dump your thought here... (Ctrl+Enter to save)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              id="quick-capture-textarea"
            />
            <div className="quick-capture-actions">
              <button className="btn-ghost" onClick={onToggle}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={!content.trim()}
              >
                <Zap size={14} />
                Capture
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
