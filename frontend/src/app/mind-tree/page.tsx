"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { Focus, ZoomIn } from "lucide-react";

// Dynamic import to avoid SSR issues with React Flow
const MindTreeCanvas = dynamic(
  () => import("@/components/mind-tree/MindTreeCanvas"),
  { ssr: false }
);

export default function MindTreePage() {
  const fitViewRef = useRef<(() => void) | null>(null);
  const zoomInRef = useRef<(() => void) | null>(null);
  return (
    <div className="mind-tree-page">
      {/* Toolbar */}
      <div className="mind-tree-toolbar">
        <h2>🧠 Mind Tree</h2>
        <div className="mind-tree-toolbar-actions">
          <button className="btn-secondary" id="mind-tree-fit-view" onClick={() => fitViewRef.current?.()}>
            <Focus size={14} />
            Fit View
          </button>
          <button className="btn-secondary" id="mind-tree-zoom-in" onClick={() => zoomInRef.current?.()}>
            <ZoomIn size={14} />
            Zoom In
          </button>
        </div>
      </div>

      {/* Canvas */}
      <MindTreeCanvas fitViewRef={fitViewRef} zoomInRef={zoomInRef} />
    </div>
  );
}
