"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  NotebookPen,
  GitFork,
  Zap,
  Search,
} from "lucide-react";
import { COMMAND_PALETTE_ACTIONS } from "@/lib/constants";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  brain: Brain,
  "notebook-pen": NotebookPen,
  "git-fork": GitFork,
  zap: Zap,
};

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickCapture: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onQuickCapture,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Filter actions based on query
  const filtered = COMMAND_PALETTE_ACTIONS.filter((action) =>
    action.label.toLowerCase().includes(query.toLowerCase())
  );

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setQuery("");
        setSelectedIndex(0);
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const executeAction = useCallback(
    (action: (typeof COMMAND_PALETTE_ACTIONS)[number]) => {
      onClose();
      if (action.id === "quick-capture") {
        onQuickCapture();
      } else if (action.path) {
        router.push(action.path);
      }
    },
    [onClose, onQuickCapture, router]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const action = filtered[selectedIndex];
        if (action) executeAction(action);
      }
    },
    [filtered, selectedIndex, onClose, executeAction]
  );

  if (!isOpen) return null;

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div
        className="command-palette"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Command Palette"
      >
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "16px",
              color: "var(--color-text-muted)",
              pointerEvents: "none",
            }}
          />
          <input
            ref={inputRef}
            className="command-palette-input"
            style={{ paddingLeft: "40px" }}
            placeholder="Type a command..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            id="command-palette-input"
          />
        </div>

        <div className="command-palette-list">
          {filtered.map((action, i) => {
            const Icon = ICON_MAP[action.icon] || Brain;
            return (
              <div
                key={action.id}
                className={`command-palette-item ${i === selectedIndex ? "selected" : ""}`}
                onClick={() => executeAction(action)}
                onMouseEnter={() => setSelectedIndex(i)}
                id={`command-${action.id}`}
              >
                <span className="command-palette-item-icon">
                  <Icon size={18} />
                </span>
                <span>{action.label}</span>
                <span className="command-palette-item-shortcut">
                  {action.shortcut.map((key) => (
                    <span key={key} className="kbd">
                      {key}
                    </span>
                  ))}
                </span>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div
              style={{
                padding: "var(--space-lg)",
                textAlign: "center",
                color: "var(--color-text-muted)",
                fontSize: "14px",
              }}
            >
              No commands found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
