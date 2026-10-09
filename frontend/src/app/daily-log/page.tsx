"use client";

import { useState, useCallback, useEffect } from "react";
import { Send } from "lucide-react";
import DailyLogEntry from "@/components/daily-log/DailyLogEntry";
import { MOODS } from "@/lib/constants";

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
  const [entries, setEntries] = useState<LogEntry[]>(SAMPLE_ENTRIES);
  const [newContent, setNewContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | undefined>();

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

  const handleSubmit = useCallback(() => {
    if (!newContent.trim()) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const entry: LogEntry = {
      id: Date.now().toString(),
      content: newContent.trim(),
      mood: selectedMood,
      time: timeStr,
    };

    setEntries((prev) => [entry, ...prev]);
    setNewContent("");
    setSelectedMood(undefined);
  }, [newContent, selectedMood]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

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
      <div className="daily-log-input-section">
        <textarea
          className="daily-log-textarea"
          placeholder="What's going through your mind right now? Just start typing..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          onKeyDown={handleKeyDown}
          id="daily-log-textarea"
        />

        <div className="daily-log-controls">
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
            disabled={!newContent.trim()}
            id="daily-log-submit"
          >
            <Send size={14} />
            Log it
          </button>
        </div>
      </div>

      {/* Entries */}
      {entries.length > 0 && (
        <div className="daily-log-entries">
          <h3 className="daily-log-entries-title">
            Today&apos;s Entries ({entries.length})
          </h3>
          {entries.map((entry) => (
            <DailyLogEntry
              key={entry.id}
              content={entry.content}
              mood={entry.mood}
              time={entry.time}
            />
          ))}
        </div>
      )}
    </div>
  );
}
