"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  Handle,
  Position,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { SAMPLE_MIND_TREE } from "@/lib/constants";

// ─── Custom Node Component ──────────────────────────────────────

interface MindTreeNodeData {
  label: string;
  nodeType: "root" | "branch" | "leaf";
}

function MindTreeNode({ data }: { data: MindTreeNodeData }) {
  return (
    <div className={`mind-tree-node ${data.nodeType}`}>
      <Handle
        type="target"
        position={Position.Top}
        style={{ visibility: "hidden" }}
      />
      <span className="mind-tree-node-label">{data.label}</span>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ visibility: "hidden" }}
      />
    </div>
  );
}

const nodeTypes = { mindTreeNode: MindTreeNode };

// ─── Build React Flow data from constants ────────────────────────

function buildFlowData(): { nodes: Node[]; edges: Edge[] } {
  // Simple radial layout
  const root = SAMPLE_MIND_TREE.nodes.find((n) => n.type === "root")!;
  const branches = SAMPLE_MIND_TREE.nodes.filter((n) => n.type === "branch");
  const leaves = SAMPLE_MIND_TREE.nodes.filter((n) => n.type === "leaf");

  const nodes: Node[] = [];

  // Root at center
  nodes.push({
    id: root.id,
    type: "mindTreeNode",
    position: { x: 400, y: 50 },
    data: { label: root.label, nodeType: "root" },
  });

  // Branches in a row below root
  const branchSpacing = 280;
  const branchStartX = 400 - ((branches.length - 1) * branchSpacing) / 2;

  branches.forEach((branch, i) => {
    nodes.push({
      id: branch.id,
      type: "mindTreeNode",
      position: { x: branchStartX + i * branchSpacing, y: 200 },
      data: { label: branch.label, nodeType: "branch" },
    });
  });

  // Leaves below their parent branches
  branches.forEach((branch, branchIdx) => {
    const branchLeaves = SAMPLE_MIND_TREE.edges
      .filter((e) => e.source === branch.id)
      .map((e) => leaves.find((l) => l.id === e.target)!)
      .filter(Boolean);

    const leafSpacing = 160;
    const branchX = branchStartX + branchIdx * branchSpacing;
    const leafStartX = branchX - ((branchLeaves.length - 1) * leafSpacing) / 2;

    branchLeaves.forEach((leaf, leafIdx) => {
      nodes.push({
        id: leaf.id,
        type: "mindTreeNode",
        position: { x: leafStartX + leafIdx * leafSpacing, y: 380 },
        data: { label: leaf.label, nodeType: "leaf" },
      });
    });
  });

  // Edges
  const edges: Edge[] = SAMPLE_MIND_TREE.edges.map((e, i) => ({
    id: `edge-${i}`,
    source: e.source,
    target: e.target,
    type: "smoothstep",
    animated: e.source === "root",
    style: { stroke: "rgba(139, 92, 246, 0.4)", strokeWidth: 2 },
  }));

  return { nodes, edges };
}

// ─── Canvas Component ────────────────────────────────────────────

export default function MindTreeCanvas() {
  const { nodes: initialNodes, edges: initialEdges } = buildFlowData();

  return (
    <div className="mind-tree-canvas">
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgba(113, 113, 122, 0.15)"
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
    </div>
  );
}
