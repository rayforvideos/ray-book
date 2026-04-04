"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ─── Types ─── */

interface GraphNode {
  id: string;
  x: number;
  y: number;
  highlight?: "current" | "visited" | "queued";
}

interface Edge {
  from: string;
  to: string;
}

interface Step {
  nodes: GraphNode[];
  edges: Edge[];
  description: string;
  label?: string;
  dataStructure: { label: string; items: string[] };
  visitOrder: string[];
}

/* ─── Styles ─── */

const highlightStyles: Record<string, { ring: string; bg: string; text: string }> = {
  current: {
    ring: "ring-2 ring-sky-400 dark:ring-sky-500",
    bg: "bg-sky-100 dark:bg-sky-900/50",
    text: "text-sky-800 dark:text-sky-200",
  },
  visited: {
    ring: "ring-2 ring-emerald-400 dark:ring-emerald-500",
    bg: "bg-emerald-100 dark:bg-emerald-900/50",
    text: "text-emerald-800 dark:text-emerald-200",
  },
  queued: {
    ring: "ring-2 ring-amber-400 dark:ring-amber-500",
    bg: "bg-amber-100 dark:bg-amber-900/50",
    text: "text-amber-800 dark:text-amber-200",
  },
};

const defaultNode = {
  ring: "ring-1 ring-border",
  bg: "bg-surface",
  text: "text-text",
};

/* ─── Graph layout ─── */

// Fixed positions for a 7-node graph
// Layout:
//        A
//       / \
//      B   C
//     / \   \
//    D   E   F
//         \
//          G
const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  A: { x: 160, y: 30 },
  B: { x: 80, y: 100 },
  C: { x: 240, y: 100 },
  D: { x: 30, y: 180 },
  E: { x: 130, y: 180 },
  F: { x: 280, y: 180 },
  G: { x: 180, y: 260 },
};

const GRAPH_EDGES: Edge[] = [
  { from: "A", to: "B" },
  { from: "A", to: "C" },
  { from: "B", to: "D" },
  { from: "B", to: "E" },
  { from: "C", to: "F" },
  { from: "E", to: "G" },
  { from: "C", to: "E" },
];

function makeNodes(highlights: Record<string, "current" | "visited" | "queued">): GraphNode[] {
  return Object.entries(NODE_POSITIONS).map(([id, pos]) => ({
    id,
    x: pos.x,
    y: pos.y,
    highlight: highlights[id],
  }));
}

/* ─── SVG Graph renderer ─── */

function GraphViz({ nodes, edges, label }: { nodes: GraphNode[]; edges: Edge[]; label?: string }) {
  const R = 22;
  const svgW = 320;
  const svgH = 300;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div className="flex flex-col items-center">
      {label && (
        <span className="mb-1.5 text-[0.6875rem] uppercase tracking-wider text-muted">
          {label}
        </span>
      )}
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-xs"
        role="img"
        aria-label="그래프 탐색 시각화"
      >
        {/* Edges */}
        {edges.map((edge) => {
          const fromNode = nodeMap.get(edge.from);
          const toNode = nodeMap.get(edge.to);
          if (!fromNode || !toNode) return null;

          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              className="stroke-border"
              strokeWidth={2}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const hl = node.highlight ? highlightStyles[node.highlight] : defaultNode;
          return (
            <g key={node.id}>
              <foreignObject
                x={node.x - R - 4}
                y={node.y - R - 4}
                width={(R + 4) * 2}
                height={(R + 4) * 2}
              >
                <div className="flex h-full w-full items-center justify-center">
                  <div
                    className={`flex items-center justify-center rounded-full ${hl.bg} ${hl.ring}`}
                    style={{ width: R * 2, height: R * 2 }}
                  >
                    <span className={`font-mono text-sm font-bold ${hl.text}`}>
                      {node.id}
                    </span>
                  </div>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─── Data structure display ─── */

function DataStructureView({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-mono font-bold text-accent">{label}:</span>
      <div className="flex gap-1">
        {items.length === 0 ? (
          <span className="text-muted">(비어 있음)</span>
        ) : (
          items.map((item, i) => (
            <span
              key={i}
              className="inline-flex h-7 w-7 items-center justify-center rounded border border-border bg-surface font-mono text-xs font-bold"
            >
              {item}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Visit order display ─── */

function VisitOrderView({ order }: { order: string[] }) {
  if (order.length === 0) return null;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">방문 순서:</span>
      <span className="font-mono text-muted">
        {order.join(" → ")}
      </span>
    </div>
  );
}

/* ─── Legend ─── */

function Legend() {
  const items = [
    { color: "bg-sky-400 dark:bg-sky-500", label: "현재 노드" },
    { color: "bg-emerald-400 dark:bg-emerald-500", label: "방문 완료" },
    { color: "bg-amber-400 dark:bg-amber-500", label: "대기 중" },
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

/* ─── BFS Preset Steps ─── */

const bfsSteps: Step[] = [
  {
    nodes: makeNodes({}),
    edges: GRAPH_EDGES,
    description:
      "7개의 노드와 7개의 간선으로 구성된 무방향 그래프입니다. 노드 A에서 BFS를 시작합니다. 큐에 시작 노드를 넣습니다.",
    label: "초기 상태",
    dataStructure: { label: "큐", items: ["A"] },
    visitOrder: [],
  },
  {
    nodes: makeNodes({ A: "current", B: "queued", C: "queued" }),
    edges: GRAPH_EDGES,
    description:
      "큐에서 A를 꺼내 방문합니다. A의 이웃인 B, C를 큐에 추가합니다. BFS는 가까운 노드부터 탐색합니다.",
    label: "A 방문",
    dataStructure: { label: "큐", items: ["B", "C"] },
    visitOrder: ["A"],
  },
  {
    nodes: makeNodes({ A: "visited", B: "current", C: "queued", D: "queued", E: "queued" }),
    edges: GRAPH_EDGES,
    description:
      "큐에서 B를 꺼내 방문합니다. B의 이웃 중 미방문인 D, E를 큐에 추가합니다. (A는 이미 방문했으므로 건너뜁니다.)",
    label: "B 방문",
    dataStructure: { label: "큐", items: ["C", "D", "E"] },
    visitOrder: ["A", "B"],
  },
  {
    nodes: makeNodes({ A: "visited", B: "visited", C: "current", D: "queued", E: "queued", F: "queued" }),
    edges: GRAPH_EDGES,
    description:
      "큐에서 C를 꺼내 방문합니다. C의 이웃 중 미방문인 F를 큐에 추가합니다. (E는 이미 큐에 있으므로 건너뜁니다.)",
    label: "C 방문",
    dataStructure: { label: "큐", items: ["D", "E", "F"] },
    visitOrder: ["A", "B", "C"],
  },
  {
    nodes: makeNodes({ A: "visited", B: "visited", C: "visited", D: "current", E: "queued", F: "queued" }),
    edges: GRAPH_EDGES,
    description:
      "큐에서 D를 꺼내 방문합니다. D의 이웃은 B뿐이고, 이미 방문했으므로 큐에 추가할 노드가 없습니다.",
    label: "D 방문",
    dataStructure: { label: "큐", items: ["E", "F"] },
    visitOrder: ["A", "B", "C", "D"],
  },
  {
    nodes: makeNodes({ A: "visited", B: "visited", C: "visited", D: "visited", E: "current", F: "queued", G: "queued" }),
    edges: GRAPH_EDGES,
    description:
      "큐에서 E를 꺼내 방문합니다. E의 이웃 중 미방문인 G를 큐에 추가합니다.",
    label: "E 방문",
    dataStructure: { label: "큐", items: ["F", "G"] },
    visitOrder: ["A", "B", "C", "D", "E"],
  },
  {
    nodes: makeNodes({ A: "visited", B: "visited", C: "visited", D: "visited", E: "visited", F: "current", G: "queued" }),
    edges: GRAPH_EDGES,
    description:
      "큐에서 F를 꺼내 방문합니다. F의 이웃은 C뿐이고, 이미 방문했으므로 추가할 노드가 없습니다.",
    label: "F 방문",
    dataStructure: { label: "큐", items: ["G"] },
    visitOrder: ["A", "B", "C", "D", "E", "F"],
  },
  {
    nodes: makeNodes({ A: "visited", B: "visited", C: "visited", D: "visited", E: "visited", F: "visited", G: "current" }),
    edges: GRAPH_EDGES,
    description:
      "큐에서 G를 꺼내 방문합니다. 큐가 비었으므로 BFS가 종료됩니다.",
    label: "G 방문",
    dataStructure: { label: "큐", items: [] },
    visitOrder: ["A", "B", "C", "D", "E", "F", "G"],
  },
  {
    nodes: makeNodes({ A: "visited", B: "visited", C: "visited", D: "visited", E: "visited", F: "visited", G: "visited" }),
    edges: GRAPH_EDGES,
    description:
      "BFS 완료! 방문 순서: A → B → C → D → E → F → G. 레벨 0 (A) → 레벨 1 (B, C) → 레벨 2 (D, E, F) → 레벨 3 (G) 순서로 탐색했습니다. BFS는 시작점에서 가까운 노드부터 방문합니다.",
    label: "BFS 완료",
    dataStructure: { label: "큐", items: [] },
    visitOrder: ["A", "B", "C", "D", "E", "F", "G"],
  },
];

/* ─── DFS Preset Steps ─── */

const dfsSteps: Step[] = [
  {
    nodes: makeNodes({}),
    edges: GRAPH_EDGES,
    description:
      "같은 그래프에서 이번에는 DFS를 시작합니다. 노드 A에서 출발합니다. 스택에 시작 노드를 넣습니다.",
    label: "초기 상태",
    dataStructure: { label: "스택", items: ["A"] },
    visitOrder: [],
  },
  {
    nodes: makeNodes({ A: "current", C: "queued", B: "queued" }),
    edges: GRAPH_EDGES,
    description:
      "스택에서 A를 꺼내 방문합니다. A의 이웃인 B, C를 스택에 넣습니다. (스택이므로 나중에 넣은 것이 먼저 나옵니다.)",
    label: "A 방문",
    dataStructure: { label: "스택", items: ["C", "B"] },
    visitOrder: ["A"],
  },
  {
    nodes: makeNodes({ A: "visited", B: "current", C: "queued", E: "queued", D: "queued" }),
    edges: GRAPH_EDGES,
    description:
      "스택 상단의 B를 꺼내 방문합니다. B의 이웃 중 미방문인 D, E를 스택에 넣습니다. DFS는 한 방향으로 깊이 파고듭니다.",
    label: "B 방문",
    dataStructure: { label: "스택", items: ["C", "E", "D"] },
    visitOrder: ["A", "B"],
  },
  {
    nodes: makeNodes({ A: "visited", B: "visited", C: "queued", D: "current", E: "queued" }),
    edges: GRAPH_EDGES,
    description:
      "스택 상단의 D를 꺼내 방문합니다. D의 이웃은 B뿐이고, 이미 방문했으므로 추가할 노드가 없습니다.",
    label: "D 방문",
    dataStructure: { label: "스택", items: ["C", "E"] },
    visitOrder: ["A", "B", "D"],
  },
  {
    nodes: makeNodes({ A: "visited", B: "visited", C: "queued", D: "visited", E: "current", G: "queued" }),
    edges: GRAPH_EDGES,
    description:
      "스택 상단의 E를 꺼내 방문합니다. E의 이웃 중 미방문인 G를 스택에 넣습니다. (C는 이미 스택에 있습니다.)",
    label: "E 방문",
    dataStructure: { label: "스택", items: ["C", "G"] },
    visitOrder: ["A", "B", "D", "E"],
  },
  {
    nodes: makeNodes({ A: "visited", B: "visited", C: "queued", D: "visited", E: "visited", G: "current" }),
    edges: GRAPH_EDGES,
    description:
      "스택 상단의 G를 꺼내 방문합니다. G의 이웃은 E뿐이고, 이미 방문했습니다. 깊이를 끝까지 탐색한 후 되돌아옵니다.",
    label: "G 방문",
    dataStructure: { label: "스택", items: ["C"] },
    visitOrder: ["A", "B", "D", "E", "G"],
  },
  {
    nodes: makeNodes({ A: "visited", B: "visited", C: "current", D: "visited", E: "visited", F: "queued", G: "visited" }),
    edges: GRAPH_EDGES,
    description:
      "스택 상단의 C를 꺼내 방문합니다. C의 이웃 중 미방문인 F를 스택에 넣습니다.",
    label: "C 방문",
    dataStructure: { label: "스택", items: ["F"] },
    visitOrder: ["A", "B", "D", "E", "G", "C"],
  },
  {
    nodes: makeNodes({ A: "visited", B: "visited", C: "visited", D: "visited", E: "visited", F: "current", G: "visited" }),
    edges: GRAPH_EDGES,
    description:
      "스택 상단의 F를 꺼내 방문합니다. 스택이 비었으므로 DFS가 종료됩니다.",
    label: "F 방문",
    dataStructure: { label: "스택", items: [] },
    visitOrder: ["A", "B", "D", "E", "G", "C", "F"],
  },
  {
    nodes: makeNodes({ A: "visited", B: "visited", C: "visited", D: "visited", E: "visited", F: "visited", G: "visited" }),
    edges: GRAPH_EDGES,
    description:
      "DFS 완료! 방문 순서: A → B → D → E → G → C → F. BFS와 달리 한 경로를 끝까지 탐색한 후 되돌아오는 패턴입니다. A에서 B → D까지 깊이 탐색 후, B → E → G까지 깊이 탐색, 그 다음 C → F를 탐색했습니다.",
    label: "DFS 완료",
    dataStructure: { label: "스택", items: [] },
    visitOrder: ["A", "B", "D", "E", "G", "C", "F"],
  },
];

/* ─── Presets ─── */

const presets: Record<string, Step[]> = {
  bfs: bfsSteps,
  dfs: dfsSteps,
};

/* ─── Main component ─── */

interface GraphTraversalProps {
  preset?: string;
}

export function GraphTraversal({ preset = "bfs" }: GraphTraversalProps) {
  const steps = presets[preset] ?? presets["bfs"];

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

      <GraphViz nodes={step.nodes} edges={step.edges} />

      <div className="space-y-2">
        <DataStructureView
          label={step.dataStructure.label}
          items={step.dataStructure.items}
        />
        <VisitOrderView order={step.visitOrder} />
      </div>

      <Legend />

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
