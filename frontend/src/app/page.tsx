"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDocuments } from "@/lib/api";
import Omnibox from "@/components/omnibox/Omnibox";
import Link from "next/link";
import { FileText, Flame, NotebookPen, ArrowRight } from "lucide-react";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function calcStreak(docs: { created_at: string; category?: string }[]): number {
  const dailyDates = docs
    .filter((d) => d.category === "Daily Log")
    .map((d) => new Date(d.created_at).toDateString());
  const unique = [...new Set(dailyDates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (!unique.length) return 0;

  let streak = 0;
  let check = new Date();
  check.setHours(0, 0, 0, 0);

  for (const dateStr of unique) {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((check.getTime() - d.getTime()) / 86400000);
    if (diff > 1) break;
    streak++;
    check = d;
  }
  return streak;
}

export default function DashboardPage() {
  const { data: documents = [] } = useQuery({
    queryKey: ["documents"],
    queryFn: getDocuments,
  });

  const todayStr = new Date().toDateString();

  const stats = useMemo(() => ({
    total: documents.length,
    streak: calcStreak(documents),
    today: documents.filter((d) => new Date(d.created_at).toDateString() === todayStr).length,
  }), [documents, todayStr]);

  const recent = useMemo(() =>
    [...documents]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5),
    [documents]
  );

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <div className="dashboard-wrapper">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="dashboard-header">
        <div>
          <p className="dashboard-date">{todayFormatted}</p>
          <h1 className="dashboard-greeting">
            {getGreeting()}, <span className="dashboard-greeting-accent">Mohammad</span> 👋
          </h1>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────── */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "rgba(139,92,246,0.15)", color: "#8b5cf6" }}>
            <FileText size={20} />
          </div>
          <div>
            <p className="stat-card-value">{stats.total}</p>
            <p className="stat-card-label">Total Notes</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "rgba(251,146,60,0.15)", color: "#fb923c" }}>
            <Flame size={20} />
          </div>
          <div>
            <p className="stat-card-value">
              {stats.streak}
              <span style={{ fontSize: "18px", marginLeft: "4px" }}>🔥</span>
            </p>
            <p className="stat-card-label">Day Streak</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "rgba(52,211,153,0.15)", color: "#34d399" }}>
            <NotebookPen size={20} />
          </div>
          <div>
            <p className="stat-card-value">{stats.today}</p>
            <p className="stat-card-label">Added Today</p>
          </div>
        </div>
      </div>

      {/* ── Omnibox ─────────────────────────────────────────── */}
      <Omnibox />

      {/* ── Recent Activity ─────────────────────────────────── */}
      {recent.length > 0 && (
        <div className="dashboard-recent">
          <div className="dashboard-recent-header">
            <span className="dashboard-recent-title">Recent Activity</span>
            <Link href="/daily-log" className="dashboard-recent-link">
              View all <ArrowRight size={13} />
            </Link>
          </div>

          <div className="dashboard-recent-list">
            {recent.map((doc) => (
              <Link
                key={doc.id}
                href={`/daily-log/${doc.id}`}
                className="dashboard-recent-item"
              >
                <div className="dashboard-recent-item-left">
                  <span className="dashboard-recent-category">{doc.category || "Note"}</span>
                  <span className="dashboard-recent-doc-title">{doc.title || "Untitled"}</span>
                </div>
                <span className="dashboard-recent-time">
                  {new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
