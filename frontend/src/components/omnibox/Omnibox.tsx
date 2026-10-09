"use client";

import { useState, useCallback } from "react";
import {
  Sparkles,
  ArrowUp,
  Link as LinkIcon,
  MessageCircleQuestion,
  Lightbulb,
} from "lucide-react";
import { processBrainDump, type ProcessResponse } from "@/lib/api";

type InputType = "thought" | "url" | "question";

function detectInputType(value: string): InputType {
  const trimmed = value.trim();
  if (!trimmed) return "thought";

  // URL detection
  if (
    /^https?:\/\//i.test(trimmed) ||
    /^www\./i.test(trimmed) ||
    /\.[a-z]{2,}\//.test(trimmed)
  ) {
    return "url";
  }

  // Question detection
  if (
    trimmed.endsWith("?") ||
    /^(what|how|why|when|where|who|is|are|can|could|should|would|do|does|did)\b/i.test(
      trimmed
    )
  ) {
    return "question";
  }

  return "thought";
}

const PLACEHOLDERS: Record<InputType, string> = {
  thought: "Dump a thought, paste a URL, or ask a question...",
  url: "Paste detected — press Enter to save this link",
  question: "Asking a question — press Enter to search your brain",
};

const TYPE_ICONS: Record<InputType, React.ComponentType<{ size?: number }>> = {
  thought: Lightbulb,
  url: LinkIcon,
  question: MessageCircleQuestion,
};

export default function Omnibox() {
  const [value, setValue] = useState("");
  const [inputType, setInputType] = useState<InputType>("thought");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResponse | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      setInputType(detectInputType(newValue));
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (!value.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await processBrainDump(value.trim(), "omnibox");
      setResult(response);
      setValue("");
      setInputType("thought");
    } catch {
      // Backend not running — show a friendly local mock
      setResult({
        success: true,
        thought: {
          title:
            value.trim().split(" ").slice(0, 6).join(" ") +
            (value.trim().split(" ").length > 6 ? "..." : ""),
          summary: value.trim(),
          tags: ["captured", "unprocessed"],
          category: "Personal",
          action_items: [],
          connections: ["Start the backend to enable AI processing"],
        },
        processing_time_ms: 0,
      });
      setValue("");
      setInputType("thought");
    } finally {
      setIsProcessing(false);
    }
  }, [value, isProcessing]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const ActiveIcon = TYPE_ICONS[inputType];

  return (
    <div className="omnibox-wrapper">
      {/* Greeting */}
      <div className="omnibox-greeting">
        <h1>What&apos;s on your mind?</h1>
        <p>
          Dump a thought, paste a link, or ask your second brain a question.
        </p>
      </div>

      {/* Input */}
      <div className="omnibox-container">
        <div className="omnibox-input-wrap">
          <input
            type="text"
            className="omnibox-input"
            placeholder={PLACEHOLDERS[inputType]}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            id="omnibox-input"
            autoFocus
          />
          <span className="omnibox-icon">
            <ActiveIcon size={20} />
          </span>
          <button
            className={`omnibox-action ${value.trim() ? "visible" : ""}`}
            onClick={handleSubmit}
            disabled={isProcessing}
            id="omnibox-submit"
            title="Submit"
          >
            {isProcessing ? (
              <Sparkles size={16} />
            ) : (
              <ArrowUp size={16} />
            )}
          </button>
        </div>

        {/* Hints */}
        <div className="omnibox-hint">
          <div className="omnibox-hint-item">
            <span className="omnibox-hint-dot thought" />
            <span>Thought</span>
          </div>
          <div className="omnibox-hint-item">
            <span className="omnibox-hint-dot url" />
            <span>URL</span>
          </div>
          <div className="omnibox-hint-item">
            <span className="omnibox-hint-dot question" />
            <span>Question</span>
          </div>
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div className="omnibox-result">
          <div className="omnibox-result-header">
            <span className="omnibox-result-title">
              {result.thought.title}
            </span>
            <span className="omnibox-result-category">
              {result.thought.category}
            </span>
          </div>
          <p className="omnibox-result-summary">{result.thought.summary}</p>

          <div className="omnibox-result-tags">
            {result.thought.tags.map((tag) => (
              <span key={tag} className="omnibox-result-tag">
                #{tag}
              </span>
            ))}
          </div>

          {result.thought.action_items.length > 0 && (
            <ul className="omnibox-result-actions-list">
              {result.thought.action_items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}

          <div className="omnibox-result-meta">
            {result.processing_time_ms > 0
              ? `Processed in ${result.processing_time_ms.toFixed(1)}ms`
              : "Captured locally — start backend for AI processing"}
          </div>
        </div>
      )}
    </div>
  );
}
