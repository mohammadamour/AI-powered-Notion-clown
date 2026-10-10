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
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

  const { data: documents = [] } = useQuery({ queryKey: ["documents"], queryFn: getDocuments });

  const toggleFolder = (key: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenFolders(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const dailyLogs = documents.filter(d => d.category === "Daily Log");
  const grouped = dailyLogs.reduce((acc: any, doc) => {
    const d = new Date(doc.created_at);
    const month = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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
                <div className="sidebar-nested-list" style={{ paddingLeft: '24px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {Object.entries(grouped).map(([month, weeks]) => (
                    <div key={month}>
                      <div onClick={(e) => toggleFolder(month, e)} style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px 0' }}>
                        {openFolders[month] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        <span style={{ marginLeft: '4px', fontWeight: 600 }}>{month}</span>
                      </div>
                      
                      {openFolders[month] && Object.entries(weeks as any).map(([week, docs]: any) => (
                        <div key={month+week} style={{ paddingLeft: '12px' }}>
                          <div onClick={(e) => toggleFolder(month+week, e)} style={{ display: 'flex', alignItems: 'center', fontSize: '11px', color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: '4px 0' }}>
                            {openFolders[month+week] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            <span style={{ marginLeft: '4px' }}>{week}</span>
                          </div>
                          
                          {openFolders[month+week] && docs.map((doc: any) => (
                            <Link href={`/daily-log/${doc.id}`} key={doc.id} className={`nav-item ${pathname === '/daily-log/' + doc.id ? 'active' : ''}`} style={{ padding: '4px 8px', fontSize: '12px', marginLeft: '12px', width: 'calc(100% - 12px)', minHeight: 'auto', background: pathname === '/daily-log/' + doc.id ? 'var(--color-bg-hover)' : 'transparent' }}>
                              <FileText size={12} style={{ marginRight: '6px', flexShrink: 0 }} />
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {doc.title || new Date(doc.created_at).toLocaleDateString()}
                              </span>
                            </Link>
                          ))}
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
