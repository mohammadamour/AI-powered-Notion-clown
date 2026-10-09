"use client";

interface DailyLogEntryProps {
  content: string;
  mood?: string;
  time: string;
}

export default function DailyLogEntry({ content, mood, time }: DailyLogEntryProps) {
  return (
    <div className="log-entry-card">
      <div className="log-entry-header">
        <span className="log-entry-time">{time}</span>
        {mood && <span className="log-entry-mood">{mood}</span>}
      </div>
      <p className="log-entry-content">{content}</p>
    </div>
  );
}
