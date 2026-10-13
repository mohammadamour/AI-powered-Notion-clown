"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, ExternalLink, Calendar } from "lucide-react";
import { Document } from "@/lib/api";

interface DailyLogEntryProps {
  doc: Document;
  defaultOpen?: boolean;
}

export default function DailyLogEntry({ doc, defaultOpen = false }: DailyLogEntryProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const dateStr = new Date(doc.created_at).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Strip markdown syntax for preview
  const preview = doc.content
    ? doc.content.replace(/[#*`_>\[\]]/g, "").trim().slice(0, 160)
    : "No content";

  return (
    <div
      style={{
        border: "1px solid var(--color-surface-border)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        marginBottom: "12px",
        transition: "border-color var(--transition-base)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-accent-muted)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-surface-border)";
      }}
    >
      {/* Header row — always visible */}
      <button
        id={`daily-log-entry-${doc.id}`}
        onClick={() => setIsOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "16px 20px",
          background: isOpen ? "var(--color-surface-hover)" : "var(--color-surface)",
          border: "none",
          cursor: "pointer",
          transition: "background var(--transition-fast)",
          textAlign: "left",
        }}
      >
        {/* Chevron */}
        <span style={{ color: "var(--color-text-muted)", flexShrink: 0, transition: "transform var(--transition-fast)", transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)" }}>
          <ChevronDown size={16} />
        </span>

        {/* Date icon */}
        <span style={{ color: "var(--color-accent)", flexShrink: 0 }}>
          <Calendar size={15} />
        </span>

        {/* Title area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {doc.title || dateStr}
          </p>
          {!isOpen && (
            <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {preview}{preview.length === 160 ? "…" : ""}
            </p>
          )}
        </div>

        {/* Date badge */}
        <span style={{ fontSize: "11px", color: "var(--color-text-muted)", flexShrink: 0, whiteSpace: "nowrap" }}>
          {new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>

        {/* Open full page link */}
        <Link
          href={`/daily-log/${doc.id}`}
          onClick={(e) => e.stopPropagation()}
          title="Open full page"
          style={{ color: "var(--color-text-muted)", flexShrink: 0, display: "flex", alignItems: "center" }}
        >
          <ExternalLink size={14} />
        </Link>
      </button>

      {/* Expandable content */}
      {isOpen && (
        <div
          style={{
            padding: "20px 24px",
            background: "var(--color-bg-secondary)",
            borderTop: "1px solid var(--color-surface-border)",
            fontSize: "14px",
            lineHeight: 1.7,
            color: "var(--color-text-secondary)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            maxHeight: "400px",
            overflowY: "auto",
          }}
        >
          {doc.content || <em style={{ color: "var(--color-text-muted)" }}>No content saved.</em>}
        </div>
      )}
    </div>
  );
}
