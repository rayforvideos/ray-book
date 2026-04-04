"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ─── Types ─── */

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  type: "component" | "mediator";
  active?: boolean;
}

interface Link {
  from: string;
  to: string;
  active?: boolean;
}

interface Step {
  nodes: Node[];
  links: Link[];
  label: string;
  description: string;
  codeSnippet?: string;
  mode: "direct" | "mediator";
}

/* ─── Graph Renderer ─── */

function ConnectionGraph({ nodes, links, mode }: { nodes: Node[]; links: Link[]; mode: string }) {
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <svg viewBox="0 0 400 220" className="w-full" style={{ maxHeight: 220 }}>
      <defs>
        <marker id="med-arrow" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
          <path d="M0,0 L6,2.5 L0,5" className="fill-violet-500 dark:fill-violet-400" />
        </marker>
        <marker id="med-arrow-muted" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
          <path d="M0,0 L6,2.5 L0,5" className="fill-muted/30" />
        </marker>
      </defs>

      {/* Links */}
      {links.map((link, i) => {
        const from = nodeMap[link.from];
        const to = nodeMap[link.to];
        if (!from || !to) return null;
        return (
          <line
            key={i}
            x1={from.x} y1={from.y}
            x2={to.x} y2={to.y}
            className={link.active
              ? "stroke-violet-500 dark:stroke-violet-400 stroke-[1.5]"
              : "stroke-muted/20 stroke-1"
            }
            markerEnd={link.active ? "url(#med-arrow)" : "url(#med-arrow-muted)"}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((node) => {
        const isMediator = node.type === "mediator";
        const r = isMediator ? 28 : 20;
        return (
          <g key={node.id}>
            <circle
              cx={node.x} cy={node.y} r={r}
              className={`
                stroke-[1.5] transition-all duration-300
                ${isMediator
                  ? "fill-amber-100 stroke-amber-500 dark:fill-amber-950 dark:stroke-amber-400"
                  : node.active
                    ? "fill-violet-100 stroke-violet-500 dark:fill-violet-950 dark:stroke-violet-400"
                    : "fill-surface stroke-border"
                }
              `}
              opacity={node.active === false ? 0.4 : 1}
            />
            <text
              x={node.x} y={node.y + 1}
              textAnchor="middle" dominantBaseline="central"
              className={`text-[0.5rem] font-bold ${
                isMediator
                  ? "fill-amber-800 dark:fill-amber-200"
                  : node.active
                    ? "fill-violet-800 dark:fill-violet-200"
                    : "fill-muted"
              }`}
            >
              {node.label}
            </text>
          </g>
        );
      })}

      {/* Mode label */}
      <text x={200} y={210} textAnchor="middle" className="fill-muted text-[0.5rem] font-bold">
        {mode === "direct" ? "직접 통신 — 연결 폭발" : "Mediator — 중앙 집중"}
      </text>
    </svg>
  );
}

/* ─── Legend ─── */

function Legend() {
  const items = [
    { color: "bg-amber-400", label: "Mediator" },
    { color: "bg-violet-400", label: "Active Component" },
    { color: "bg-stone-300 dark:bg-stone-600", label: "Component" },
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

/* ─── Component positions ─── */

const compPositions = [
  { x: 80, y: 50 },
  { x: 320, y: 50 },
  { x: 50, y: 140 },
  { x: 200, y: 180 },
  { x: 350, y: 140 },
];

const compLabels = ["Header", "Sidebar", "List", "Filter", "Detail"];

function makeComps(activeIds: string[] = []): Node[] {
  return compLabels.map((label, i) => ({
    id: `c${i}`,
    label,
    x: compPositions[i].x,
    y: compPositions[i].y,
    type: "component" as const,
    active: activeIds.includes(`c${i}`),
  }));
}

function allDirectLinks(): Link[] {
  const links: Link[] = [];
  for (let i = 0; i < 5; i++) {
    for (let j = i + 1; j < 5; j++) {
      links.push({ from: `c${i}`, to: `c${j}` });
    }
  }
  return links;
}

/* ─── Steps ─── */

const mediatorSteps: Step[] = [
  {
    nodes: makeComps(),
    links: allDirectLinks(),
    label: "직접 통신: 5개 컴포넌트",
    description: "5개 컴포넌트가 서로 직접 통신합니다. 연결 수 = n(n-1)/2 = 10개. 컴포넌트가 늘어나면 연결이 폭발적으로 증가합니다 (6개면 15개, 10개면 45개).",
    mode: "direct",
    codeSnippet: "// 직접 통신 — Header가 모든 컴포넌트를 알아야 함\nclass Header {\n  onSearch(query) {\n    sidebar.filter(query);\n    list.search(query);\n    filter.setKeyword(query);\n    detail.highlight(query);\n  }\n}",
  },
  {
    nodes: makeComps(["c0", "c2"]),
    links: allDirectLinks().map((l) =>
      (l.from === "c0" && l.to === "c2") || (l.from === "c2" && l.to === "c0")
        ? { ...l, active: true }
        : l
    ),
    label: "Header → List 직접 호출",
    description: "Header가 List를 직접 호출합니다. Header는 List의 API를 알아야 하고, List가 변경되면 Header도 수정해야 합니다. 컴포넌트 간 결합도가 높아집니다.",
    mode: "direct",
  },
  {
    nodes: [
      ...makeComps(),
      { id: "med", label: "Store", x: 200, y: 110, type: "mediator" as const },
    ],
    links: compLabels.map((_, i) => ({ from: `c${i}`, to: "med" })),
    label: "Mediator 도입",
    description: "중앙 Mediator(Store)를 도입합니다. 모든 컴포넌트는 Mediator하고만 통신합니다. 연결 수가 10개에서 5개로 줄었습니다. 컴포넌트가 서로를 몰라도 됩니다.",
    mode: "mediator",
    codeSnippet: "// Mediator 패턴 — 컴포넌트는 Store만 알면 된다\nclass Store {\n  dispatch(action) {\n    const newState = this.reduce(action);\n    this.notify(newState); // 모든 구독자에게 알림\n  }\n}",
  },
  {
    nodes: [
      ...makeComps(["c0"]),
      { id: "med", label: "Store", x: 200, y: 110, type: "mediator" as const },
    ],
    links: [
      { from: "c0", to: "med", active: true },
      ...compLabels.slice(1).map((_, i) => ({ from: `c${i + 1}`, to: "med" })),
    ],
    label: "Header → Store에 액션 전달",
    description: "Header가 검색어를 입력하면, Store에 액션을 전달합니다. Header는 다른 컴포넌트를 전혀 모릅니다 — Store만 알면 됩니다.",
    mode: "mediator",
    codeSnippet: "// Header는 Store에만 액션을 전달\nfunction Header() {\n  const onSearch = (query) => {\n    store.dispatch({ type: 'SEARCH', payload: query });\n  };\n}",
  },
  {
    nodes: [
      ...makeComps(["c1", "c2", "c3", "c4"]),
      { id: "med", label: "Store", x: 200, y: 110, type: "mediator" as const },
    ],
    links: [
      { from: "c0", to: "med" },
      ...compLabels.slice(1).map((_, i) => ({ from: "med", to: `c${i + 1}`, active: true })),
    ],
    label: "Store → 관련 컴포넌트에 알림",
    description: "Store가 상태를 업데이트하고, 관련된 모든 컴포넌트에 알립니다. Sidebar, List, Filter, Detail이 새 상태를 받아 자신의 UI를 업데이트합니다. 핵심: 컴포넌트는 서로의 존재를 모릅니다.",
    mode: "mediator",
    codeSnippet: "// Store가 상태 변경을 중계\nstore.dispatch({ type: 'SEARCH', payload: 'react' });\n// → Sidebar: 검색 결과 필터 표시\n// → List: 검색 결과 목록 렌더링\n// → Filter: 키워드 하이라이트\n// → Detail: 매칭 항목 표시",
  },
];

/* ─── Main Component ─── */

interface MediatorPatternProps {
  preset?: string;
}

export function MediatorPattern({ preset = "compare" }: MediatorPatternProps) {
  const steps = mediatorSteps;

  const stepNodes = steps.map((step, idx) => (
    <div key={idx} className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-bold text-accent">{step.label}</span>
        <span className="text-[0.6875rem] text-muted">{idx + 1} / {steps.length}</span>
      </div>

      <ConnectionGraph nodes={step.nodes} links={step.links} mode={step.mode} />
      <Legend />

      {step.codeSnippet && (
        <pre className="overflow-x-auto rounded border border-border bg-surface p-3 font-mono text-xs leading-relaxed text-muted">
          {step.codeSnippet}
        </pre>
      )}

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
