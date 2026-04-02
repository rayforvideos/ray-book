"use client";

import { StepPlayer } from "../primitives/StepPlayer";

/* ─── Types ─── */

interface BSTNode {
  value: number;
  left: number | null;
  right: number | null;
  highlight?: "current" | "path" | "insert" | "delete" | "found" | "replace";
}

interface Step {
  nodes: BSTNode[];
  description: string;
  label?: string;
}

/* ─── Styles ─── */

const highlightStyles: Record<string, { ring: string; bg: string; text: string }> = {
  current: {
    ring: "ring-2 ring-sky-400 dark:ring-sky-500",
    bg: "bg-sky-100 dark:bg-sky-900/50",
    text: "text-sky-800 dark:text-sky-200",
  },
  path: {
    ring: "ring-2 ring-violet-400 dark:ring-violet-500",
    bg: "bg-violet-100 dark:bg-violet-900/50",
    text: "text-violet-800 dark:text-violet-200",
  },
  insert: {
    ring: "ring-2 ring-emerald-400 dark:ring-emerald-500",
    bg: "bg-emerald-100 dark:bg-emerald-900/50",
    text: "text-emerald-800 dark:text-emerald-200",
  },
  delete: {
    ring: "ring-2 ring-rose-400 dark:ring-rose-500",
    bg: "bg-rose-100 dark:bg-rose-900/50",
    text: "text-rose-800 dark:text-rose-200",
  },
  found: {
    ring: "ring-2 ring-amber-400 dark:ring-amber-500",
    bg: "bg-amber-100 dark:bg-amber-900/50",
    text: "text-amber-800 dark:text-amber-200",
  },
  replace: {
    ring: "ring-2 ring-teal-400 dark:ring-teal-500",
    bg: "bg-teal-100 dark:bg-teal-900/50",
    text: "text-teal-800 dark:text-teal-200",
  },
};

const defaultNode = {
  ring: "ring-1 ring-border",
  bg: "bg-surface",
  text: "text-text",
};

/* ─── Layout helpers ─── */

interface Position {
  x: number;
  y: number;
}

function layoutTree(nodes: BSTNode[]): Map<number, Position> {
  const positions = new Map<number, Position>();
  if (nodes.length === 0) return positions;

  // Find root (index 0)
  const W = 280;
  const H_STEP = 56;

  function place(idx: number, x: number, y: number, spread: number) {
    if (idx < 0 || idx >= nodes.length) return;
    positions.set(idx, { x, y });
    const node = nodes[idx];
    if (node.left !== null) {
      place(node.left, x - spread, y + H_STEP, spread * 0.55);
    }
    if (node.right !== null) {
      place(node.right, x + spread, y + H_STEP, spread * 0.55);
    }
  }

  place(0, W / 2, 24, W / 4);
  return positions;
}

/* ─── BST SVG renderer ─── */

function BSTViz({ nodes, label }: { nodes: BSTNode[]; label?: string }) {
  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        {label && (
          <span className="mb-2 text-[0.6875rem] uppercase tracking-wider text-muted">
            {label}
          </span>
        )}
        <div className="flex h-40 items-center justify-center rounded border border-dashed border-border">
          <span className="text-sm text-muted">빈 트리 (empty)</span>
        </div>
      </div>
    );
  }

  const positions = layoutTree(nodes);

  // Compute SVG bounds
  let minX = Infinity, maxX = -Infinity, maxY = -Infinity;
  positions.forEach(({ x, y }) => {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  });

  const pad = 32;
  const R = 20;
  // 최소 크기를 보장해서 노드 1~2개일 때 거대하게 스케일링되지 않도록
  const MIN_W = 320;
  const MIN_H = 200;
  const rawW = maxX - minX + pad * 2 + R * 2;
  const rawH = maxY + pad * 2 + R * 2;
  const svgW = Math.max(rawW, MIN_W);
  const svgH = Math.max(rawH, MIN_H);
  const offX = -minX + pad + R + (svgW - rawW) / 2;
  const offY = pad + (svgH - rawH) / 2;

  return (
    <div className="flex flex-col items-center">
      {label && (
        <span className="mb-1.5 text-[0.6875rem] uppercase tracking-wider text-muted">
          {label}
        </span>
      )}
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-sm"
        role="img"
        aria-label="이진 탐색 트리 시각화"
      >
        {/* Edges */}
        {nodes.map((node, idx) => {
          const parentPos = positions.get(idx);
          if (!parentPos) return null;
          const children: (number | null)[] = [node.left, node.right];
          return children.map((childIdx) => {
            if (childIdx === null) return null;
            const childPos = positions.get(childIdx);
            if (!childPos) return null;
            return (
              <line
                key={`${idx}-${childIdx}`}
                x1={parentPos.x + offX}
                y1={parentPos.y + offY + R}
                x2={childPos.x + offX}
                y2={childPos.y + offY - R}
                className="stroke-border"
                strokeWidth={2}
              />
            );
          });
        })}

        {/* Nodes */}
        {nodes.map((node, idx) => {
          const pos = positions.get(idx);
          if (!pos) return null;
          const hl = node.highlight ? highlightStyles[node.highlight] : defaultNode;
          const P = 4; // ring overflow padding
          return (
            <foreignObject
              key={idx}
              x={pos.x + offX - R - P}
              y={pos.y + offY - R - P}
              width={(R + P) * 2}
              height={(R + P) * 2}
            >
              <div className="flex h-full w-full items-center justify-center">
                <div className={`flex items-center justify-center rounded-full ${hl.bg} ${hl.ring}`} style={{ width: R * 2, height: R * 2 }}>
                  <span className={`font-mono text-sm font-bold ${hl.text}`}>
                    {node.value}
                  </span>
                </div>
              </div>
            </foreignObject>
          );
        })}
      </svg>
    </div>
  );
}

/* ─── Legend ─── */

function Legend() {
  const items = [
    { color: "bg-sky-400 dark:bg-sky-500", label: "현재 노드" },
    { color: "bg-violet-400 dark:bg-violet-500", label: "탐색 경로" },
    { color: "bg-emerald-400 dark:bg-emerald-500", label: "삽입" },
    { color: "bg-rose-400 dark:bg-rose-500", label: "삭제" },
    { color: "bg-amber-400 dark:bg-amber-500", label: "발견" },
    { color: "bg-teal-400 dark:bg-teal-500", label: "대체" },
  ];
  return (
    <div className="flex flex-wrap gap-3 text-[0.6875rem] text-muted">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${it.color}`} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

/* ─── Presets ─── */

const presets: Record<string, Step[]> = {
  basic: [
    // Step 0: Empty tree
    {
      nodes: [],
      description:
        "빈 트리에서 시작합니다. BST는 각 노드가 최대 두 개의 자식을 가지며, 왼쪽 자식 < 부모 < 오른쪽 자식 규칙을 따릅니다.",
      label: "빈 트리",
    },
    // Step 1: Insert 8 (root)
    {
      nodes: [{ value: 8, left: null, right: null, highlight: "insert" }],
      description:
        "8을 삽입합니다. 트리가 비어있으므로 루트 노드가 됩니다.",
      label: "insert(8)",
    },
    // Step 2: Insert 3
    {
      nodes: [
        { value: 8, left: 1, right: null, highlight: "current" },
        { value: 3, left: null, right: null, highlight: "insert" },
      ],
      description:
        "3을 삽입합니다. 3 < 8이므로 루트의 왼쪽 자식이 됩니다.",
      label: "insert(3)",
    },
    // Step 3: Insert 10
    {
      nodes: [
        { value: 8, left: 1, right: 2, highlight: "current" },
        { value: 3, left: null, right: null },
        { value: 10, left: null, right: null, highlight: "insert" },
      ],
      description:
        "10을 삽입합니다. 10 > 8이므로 루트의 오른쪽 자식이 됩니다.",
      label: "insert(10)",
    },
    // Step 4: Insert 1
    {
      nodes: [
        { value: 8, left: 1, right: 2 },
        { value: 3, left: 3, right: null, highlight: "current" },
        { value: 10, left: null, right: null },
        { value: 1, left: null, right: null, highlight: "insert" },
      ],
      description:
        "1을 삽입합니다. 1 < 8 -> 왼쪽으로, 1 < 3 -> 왼쪽으로. 노드 3의 왼쪽 자식이 됩니다.",
      label: "insert(1)",
    },
    // Step 5: Insert 6
    {
      nodes: [
        { value: 8, left: 1, right: 2 },
        { value: 3, left: 3, right: 4, highlight: "current" },
        { value: 10, left: null, right: null },
        { value: 1, left: null, right: null },
        { value: 6, left: null, right: null, highlight: "insert" },
      ],
      description:
        "6을 삽입합니다. 6 < 8 -> 왼쪽, 6 > 3 -> 오른쪽. 노드 3의 오른쪽 자식이 됩니다. 이제 5개 노드가 모두 BST 규칙을 만족합니다.",
      label: "insert(6)",
    },
    // Step 6: Search for 6 — highlight path
    {
      nodes: [
        { value: 8, left: 1, right: 2, highlight: "path" },
        { value: 3, left: 3, right: 4, highlight: "path" },
        { value: 10, left: null, right: null },
        { value: 1, left: null, right: null },
        { value: 6, left: null, right: null, highlight: "found" },
      ],
      description:
        "6을 탐색합니다. 8에서 시작 -> 6 < 8이므로 왼쪽 -> 6 > 3이므로 오른쪽 -> 6 발견! 보라색이 탐색 경로, 노란색이 발견된 노드입니다. 3번의 비교로 찾았습니다 (O(log n)).",
      label: "search(6)",
    },
    // Step 7: Delete 3 — show restructure (in-order successor = 6)
    {
      nodes: [
        { value: 8, left: 1, right: 2 },
        { value: 6, left: 3, right: null, highlight: "replace" },
        { value: 10, left: null, right: null },
        { value: 1, left: null, right: null },
      ],
      description:
        "3을 삭제합니다. 자식이 둘인 노드를 삭제할 때는 중위 후속자 (in-order successor) 로 대체합니다. 3의 오른쪽 서브트리에서 가장 작은 값인 6이 3의 자리를 대신합니다. 초록색이 대체된 노드입니다. BST 규칙이 유지됩니다 (1 < 6 < 8).",
      label: "delete(3)",
    },
  ],
};

/* ─── Main component ─── */

interface BSTOperationsProps {
  preset?: string;
}

export function BSTOperations({ preset = "basic" }: BSTOperationsProps) {
  const steps = presets[preset] ?? presets["basic"];

  const stepNodes = steps.map((step, idx) => (
    <div key={idx} className="space-y-4">
      {step.label && (
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-bold text-accent">
            {step.label}
          </span>
          <span className="text-[0.6875rem] text-muted">
            {idx + 1} / {steps.length}
          </span>
        </div>
      )}

      <BSTViz nodes={step.nodes} />

      <Legend />

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
