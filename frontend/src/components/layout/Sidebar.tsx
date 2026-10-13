"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  NotebookPen,
  GitFork,
  PanelLeftClose,
  PanelLeft,
  Command,
  ChevronDown,
  ChevronRight,
  FileText
} from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { getDocuments } from "@/lib/api";

const getWeekRangeStr = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  const start = new Date(d.setDate(diff));
  const end = new Date(start.getTime());
  end.setDate(end.getDate() + 6);
  
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${startStr} - ${endStr}`;
};

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  brain: Brain,
  "notebook-pen": NotebookPen,
  "git-fork": GitFork,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  // Auto-open current month + week on mount
  const now = new Date();
  const currentMonth = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const currentWeek = getWeekRangeStr(now);

  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    [currentMonth]: true,
    [currentMonth + currentWeek]: true,
  });

  const { data: documents = [] } = useQuery({ queryKey: ["documents"], queryFn: getDocuments });

  const toggleFolder = (key: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenFolders(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Only show Daily Log category docs
  const dailyLogDocs = documents.filter((d) => d.category === "Daily Log");

  const grouped = dailyLogDocs.reduce((acc: any, doc) => {
    const d = new Date(doc.created_at);
    const month = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const week = getWeekRangeStr(d);

    if (!acc[month]) acc[month] = {};
    if (!acc[month][week]) acc[month][week] = [];
    acc[month][week].push(doc);
    return acc;
  }, {});

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🧠</div>
          <span className="sidebar-logo-text">Second Brain</span>
        </div>
        <button
          className="sidebar-toggle"
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          id="sidebar-toggle"
        >
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon] || Brain;
          const isActive =
            item.path === "/"
              ? pathname === "/"
              : pathname.startsWith(item.path);

          const isDailyLog = item.id === "daily-log";

          return (
            <div key={item.id}>
              <Link
                href={item.path}
                className={`nav-item ${isActive ? "active" : ""}`}
                id={`nav-${item.id}`}
              >
                <span className="nav-item-icon">
                  <Icon size={20} />
                </span>
                <span className="nav-item-label">{item.label}</span>
              </Link>
              
              {isDailyLog && !collapsed && Object.keys(grouped).length > 0 && (
                <div className="sidebar-nested-list">
                  {Object.entries(grouped).map(([month, weeks]) => (
                    <div key={month}>
                      {/* Month row */}
                      <div className="sidebar-folder-row" onClick={(e) => toggleFolder(month, e)}>
                        {openFolders[month] ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                        <span className="sidebar-folder-label">{month}</span>
                      </div>

                      {openFolders[month] && Object.entries(weeks as any).map(([week, docs]: any) => (
                        <div key={month + week} style={{ paddingLeft: '12px' }}>
                          {/* Week row */}
                          <div className="sidebar-folder-row sidebar-week-row" onClick={(e) => toggleFolder(month + week, e)}>
                            {openFolders[month + week] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            <span className="sidebar-folder-label sidebar-week-label">{week}</span>
                          </div>

                          {/* Doc links */}
                          {openFolders[month + week] && docs.map((doc: any) => {
                            const docActive = pathname === `/daily-log/${doc.id}`;
                            return (
                              <Link
                                href={`/daily-log/${doc.id}`}
                                key={doc.id}
                                className={`nav-item sidebar-doc-link ${docActive ? 'active' : ''}`}
                              >
                                <FileText size={12} style={{ flexShrink: 0 }} />
                                <span className="sidebar-doc-title">
                                  {doc.title || new Date(doc.created_at).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-shortcut">
          <Command size={14} />
          <span>
            <span className="kbd">Ctrl</span> + <span className="kbd">K</span>{" "}
            Command Palette
          </span>
        </div>
      </div>
    </aside>
  );
}
