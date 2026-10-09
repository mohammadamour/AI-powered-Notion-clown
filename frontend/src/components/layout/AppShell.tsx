"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import CommandPalette from "@/components/command-palette/CommandPalette";
import FloatingActionButton from "@/components/fab/FloatingActionButton";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/daily-log": "Daily Log",
  "/mind-tree": "Mind Tree",
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const pathname = usePathname();

  const pageTitle = PAGE_TITLES[pathname] || "Second Brain";

  // Global keyboard shortcut: Ctrl+K for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
        setFabOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleQuickCapture = useCallback(() => {
    setFabOpen(true);
  }, []);

  const handleFabSubmit = useCallback((content: string) => {
    // For now, log to console. Later: send to backend
    console.log("Quick capture:", content);
  }, []);

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />
      <TopBar title={pageTitle} sidebarCollapsed={sidebarCollapsed} />

      <main
        className={`main-content ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
      >
        {children}
      </main>

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onQuickCapture={handleQuickCapture}
      />

      <FloatingActionButton
        isOpen={fabOpen}
        onToggle={() => setFabOpen((prev) => !prev)}
        onSubmit={handleFabSubmit}
      />
    </div>
  );
}
