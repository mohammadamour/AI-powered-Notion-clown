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
} from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";

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

          return (
            <Link
              key={item.id}
              href={item.path}
              className={`nav-item ${isActive ? "active" : ""}`}
              id={`nav-${item.id}`}
            >
              <span className="nav-item-icon">
                <Icon size={20} />
              </span>
              <span className="nav-item-label">{item.label}</span>
            </Link>
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
