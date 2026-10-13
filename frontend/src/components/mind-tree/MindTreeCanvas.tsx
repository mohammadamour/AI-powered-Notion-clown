"use client";

import { useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  Handle,
  Position,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { SAMPLE_MIND_TREE } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { getDocuments } from "@/lib/api";

// ─── Custom Node Components ─────────────────────────────────────

interface MindTreeNodeData {
  label: string;
  nodeType: "root" | "branch" | "leaf" | "doc-leaf";
  docId?: number;
}

function MindTreeNode({ data }: { data: MindTreeNodeData }) {
  return (
    <div className={`mind-tree-node ${data.nodeType}`}>
      <Handle type="target" position={Position.Top} style={{ visibility: "hidden" }} />
      <span className="mind-tree-node-label">{data.label}</span>
      <Handle type="source" position={Position.Bottom} style={{ visibility: "hidden" }} />
    </div>
  );
}

const nodeTypes = { mindTreeNode: MindTreeNode };

// ─── Layout builder ──────────────────────────────────────────────

function buildFlowData(documents: { id: number; title: string; category?: string }[]): { nodes: Node[]; edges: Edge[] } {
  const root = SAMPLE_MIND_TREE.nodes.find((n) => n.type === "root")!;
  const branches = SAMPLE_MIND_TREE.nodes.filter((n) => n.type === "branch");
  const staticLeaves = SAMPLE_MIND_TREE.nodes.filter((n) => n.type === "leaf");

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Root
  nodes.push({
    id: root.id,
    type: "mindTreeNode",
    position: { x: 500, y: 40 },
    data: { label: root.label, nodeType: "root" },
  });

  const branchSpacing = 300;
  const branchStartX = 500 - ((branches.length - 1) * branchSpacing) / 2;

  branches.forEach((branch, i) => {
    const bx = branchStartX + i * branchSpacing;

    nodes.push({
      id: branch.id,
      type: "mindTreeNode",
      position: { x: bx, y: 200 },
      data: { label: branch.label, nodeType: "branch" },
    });

    // Root → branch edge
    edges.push({
      id: `edge-root-${branch.id}`,
      source: root.id,
      target: branch.id,
      type: "smoothstep",
      animated: true,
      style: { stroke: "rgba(139, 92, 246, 0.35)", strokeWidth: 2 },
    });

    // Static leaf children
    const staticChildren = SAMPLE_MIND_TREE.edges
      .filter((e) => e.source === branch.id)
      .map((e) => staticLeaves.find((l) => l.id === e.target)!)
      .filter(Boolean);

    // Live document children for this branch (match by category label)
    const branchLabel = branch.label.replace(/^[^ ]+ /, ""); // strip emoji prefix
    const docChildren = documents.filter(
      (d) => d.category && d.category.toLowerCase().includes(branchLabel.toLowerCase())
    );

    const allChildren = [
      ...staticChildren.map((l) => ({ id: l.id, label: l.label, isDoc: false, docId: undefined as number | undefined })),
      ...docChildren.map((d) => ({ id: `doc-${d.id}`, label: d.title || "Untitled", isDoc: true, docId: d.id })),
    ];

    if (allChildren.length === 0) return;

    const leafSpacing = 170;
    const leafStartX = bx - ((allChildren.length - 1) * leafSpacing) / 2;

    allChildren.forEach((child, ci) => {
      nodes.push({
        id: child.id,
        type: "mindTreeNode",
        position: { x: leafStartX + ci * leafSpacing, y: 390 },
        data: {
          label: child.isDoc ? `📄 ${child.label}` : child.label,
          nodeType: child.isDoc ? "doc-leaf" : "leaf",
          docId: child.docId,
        },
      });

      edges.push({
        id: `edge-${branch.id}-${child.id}`,
        source: branch.id,
        target: child.id,
        type: "smoothstep",
        style: { stroke: child.isDoc ? "rgba(52,211,153,0.3)" : "rgba(63,63,70,0.5)", strokeWidth: 1.5 },
      });
    });
  });

  return { nodes, edges };
}

// ─── Inner canvas (needs ReactFlowProvider context) ──────────────

interface InnerCanvasProps {
  fitViewRef: React.MutableRefObject<(() => void) | null>;
  zoomInRef: React.MutableRefObject<(() => void) | null>;
}

function InnerCanvas({ fitViewRef, zoomInRef }: InnerCanvasProps) {
  const router = useRouter();
  const { fitView, zoomIn } = useReactFlow();
  const { data: documents = [] } = useQuery({ queryKey: ["documents"], queryFn: getDocuments });

  // Expose controls to parent toolbar
  fitViewRef.current = () => fitView({ duration: 500, padding: 0.3 });
  zoomInRef.current = () => zoomIn({ duration: 300 });

  const { nodes, edges } = useMemo(() => buildFlowData(documents), [documents]);

  const onNodeClick = useCallback((_: any, node: Node) => {
    const data = node.data as unknown as MindTreeNodeData;
    if (data.nodeType === "doc-leaf" && data.docId) {
      router.push(`/daily-log/${data.docId}`);
    }
  }, [router]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodeClick={onNodeClick}
      fitView
      fitViewOptions={{ padding: 0.35 }}
      minZoom={0.2}
      maxZoom={2.5}
      proOptions={{ hideAttribution: true }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={28}
        size={1}
        color="rgba(113, 113, 122, 0.12)"
      />
      <Controls
        showInteractive={false}
        style={{
          background: "var(--color-bg-secondary)",
          border: "1px solid var(--color-surface-border)",
          borderRadius: "var(--radius-md)",
        }}
      />
    </ReactFlow>
  );
}

// ─── Public export: wrapped in provider, exposes toolbar refs ────

export interface MindTreeCanvasRef {
  fitView: () => void;
  zoomIn: () => void;
}

export default function MindTreeCanvas({
  fitViewRef,
  zoomInRef,
}: {
  fitViewRef: React.MutableRefObject<(() => void) | null>;
  zoomInRef: React.MutableRefObject<(() => void) | null>;
}) {
  return (
    <div className="mind-tree-canvas">
      <ReactFlowProvider>
        <InnerCanvas fitViewRef={fitViewRef} zoomInRef={zoomInRef} />
      </ReactFlowProvider>
    </div>
  );
}

