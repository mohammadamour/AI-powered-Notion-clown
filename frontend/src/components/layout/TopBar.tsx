"use client";

import { Settings, Bell } from "lucide-react";

interface TopBarProps {
  title: string;
  sidebarCollapsed: boolean;
}

export default function TopBar({ title, sidebarCollapsed }: TopBarProps) {
  return (
    <header
      className={`topbar ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
    >
      <span className="topbar-title">{title}</span>

      <div className="topbar-actions">
        <button className="topbar-btn" title="Notifications" id="topbar-notifications">
          <Bell size={18} />
        </button>
        <button className="topbar-btn" title="Settings" id="topbar-settings">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
