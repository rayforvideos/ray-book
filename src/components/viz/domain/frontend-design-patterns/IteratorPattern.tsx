"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ─── Types ─── */

interface Cell {
  id: string;
  label: string;
  active?: boolean;
  visited?: boolean;
}

interface Step {
  cells: Cell[];
  cursor: number | null;
  label: string;
  description: string;
  codeSnippet?: string;
  result?: string;
}

/* ─── Cell Row Renderer ─── */

function CellRow({ cells, cursor }: { cells: Cell[]; cursor: number | null }) {
  return (
    <div className="flex items-center justify-center gap-1">
      {cells.map((cell, i) => {
        const isCursor = cursor === i;
        const isVisited = cell.visited;
        return (
          <div
            key={cell.id}
            className={`
              relative flex h-12 w-14 items-center justify-center rounded border text-xs font-mono transition-all duration-300
              ${isCursor
                ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-950 dark:text-emerald-200 scale-110 ring-2 ring-emerald-300 dark:ring-emerald-700"
                : isVisited
                  ? "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-300"
                  : "border-border bg-surface text-muted"
              }
            `}
          >
            {cell.label}
            {isCursor && (
              <span className="absolute -top-5 text-[0.6rem] font-bold text-emerald-600 dark:text-emerald-400">
                ▼ cursor
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Tree Node Renderer ─── */

interface TreeNode {
  id: string;
  label: string;
  x: number;
  y: number;
  active?: boolean;
  visited?: boolean;
  children?: string[];
}

function TreeDiagram({ nodes, currentId }: { nodes: TreeNode[]; currentId: string | null }) {
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <svg viewBox="0 0 340 160" className="w-full" style={{ maxHeight: 160 }}>
      {/* Edges */}
      {nodes.map((node) =>
        (node.children ?? []).map((childId) => {
          const child = nodeMap[childId];
          if (!child) return null;
          return (
            <line
              key={`${node.id}-${childId}`}
              x1={node.x} y1={node.y + 14}
              x2={child.x} y2={child.y - 14}
              className="stroke-border stroke-1"
            />
          );
        })
      )}
      {/* Nodes */}
      {nodes.map((node) => {
        const isCurrent = node.id === currentId;
        const isVisited = node.visited;
        return (
          <g key={node.id}>
            <circle
              cx={node.x} cy={node.y} r={16}
              className={`
                transition-all duration-300 stroke-[1.5]
                ${isCurrent
                  ? "fill-emerald-100 stroke-emerald-500 dark:fill-emerald-950 dark:stroke-emerald-400"
                  : isVisited
                    ? "fill-sky-100 stroke-sky-400 dark:fill-sky-950 dark:stroke-sky-600"
                    : "fill-surface stroke-border"
                }
              `}
            />
            <text
              x={node.x} y={node.y + 1}
              textAnchor="middle" dominantBaseline="central"
              className={`text-[0.6rem] font-bold ${
                isCurrent
                  ? "fill-emerald-800 dark:fill-emerald-200"
                  : isVisited
                    ? "fill-sky-700 dark:fill-sky-300"
                    : "fill-muted"
              }`}
            >
              {node.label}
            </text>
            {isCurrent && (
              <text
                x={node.x} y={node.y - 24}
                textAnchor="middle"
                className="fill-emerald-600 dark:fill-emerald-400 text-[0.5rem] font-bold"
              >
                ▼ next()
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Legend ─── */

function Legend() {
  const items = [
    { color: "bg-emerald-400 dark:bg-emerald-500", label: "현재 (cursor)" },
    { color: "bg-sky-300 dark:bg-sky-600", label: "방문 완료" },
    { color: "bg-stone-200 dark:bg-stone-700", label: "미방문" },
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

/* ─── Array Iteration Steps ─── */

const arrayCells = [
  { id: "0", label: "10" },
  { id: "1", label: "20" },
  { id: "2", label: "30" },
  { id: "3", label: "40" },
  { id: "4", label: "50" },
];

const arraySteps: Step[] = [
  {
    cells: arrayCells.map((c) => ({ ...c })),
    cursor: null,
    label: "배열 순회 시작",
    description: "배열 [10, 20, 30, 40, 50]을 for...of로 순회합니다. 내부적으로 [Symbol.iterator]()가 호출되어 이터레이터 객체가 생성됩니다.",
    codeSnippet: "const arr = [10, 20, 30, 40, 50];\nconst iter = arr[Symbol.iterator]();\n// iter.next() → { value: 10, done: false }",
  },
  {
    cells: arrayCells.map((c, i) => ({ ...c, active: i === 0, visited: false })),
    cursor: 0,
    label: "next() → { value: 10, done: false }",
    description: "첫 번째 next() 호출. 커서가 인덱스 0을 가리키고 value: 10을 반환합니다. done: false이므로 아직 순회가 끝나지 않았습니다.",
    codeSnippet: "for (const value of arr) {\n  console.log(value); // 10\n}",
    result: "{ value: 10, done: false }",
  },
  {
    cells: arrayCells.map((c, i) => ({ ...c, visited: i < 1, active: i === 1 })),
    cursor: 1,
    label: "next() → { value: 20, done: false }",
    description: "두 번째 next(). 커서가 인덱스 1로 이동합니다. 이전 요소는 '방문 완료' 상태로 표시됩니다.",
    result: "{ value: 20, done: false }",
  },
  {
    cells: arrayCells.map((c, i) => ({ ...c, visited: i < 2, active: i === 2 })),
    cursor: 2,
    label: "next() → { value: 30, done: false }",
    description: "세 번째 next(). 커서가 계속 전진합니다. for...of 루프는 이 과정을 done: true가 될 때까지 자동으로 반복합니다.",
    result: "{ value: 30, done: false }",
  },
  {
    cells: arrayCells.map((c, i) => ({ ...c, visited: i < 4, active: i === 4 })),
    cursor: 4,
    label: "next() → { value: 50, done: false }",
    description: "마지막 요소에 도달했습니다. 이 값을 반환한 후 다음 next() 호출에서 done: true가 됩니다.",
    result: "{ value: 50, done: false }",
  },
  {
    cells: arrayCells.map((c) => ({ ...c, visited: true })),
    cursor: null,
    label: "next() → { done: true }",
    description: "모든 요소를 순회했습니다. done: true를 반환하면 for...of 루프가 종료됩니다. 핵심: 배열이든 Set이든 Map이든, next()가 { value, done }을 반환하는 한 같은 for...of로 순회할 수 있습니다.",
    codeSnippet: "// 배열, Set, Map 모두 같은 문법\nfor (const v of [1, 2, 3]) { ... }\nfor (const v of new Set([1, 2, 3])) { ... }\nfor (const [k, v] of new Map([['a', 1]])) { ... }",
    result: "{ value: undefined, done: true }",
  },
];

/* ─── Tree Iteration Steps ─── */

const treeNodes: TreeNode[] = [
  { id: "A", label: "A", x: 170, y: 30, children: ["B", "C"] },
  { id: "B", label: "B", x: 90, y: 80, children: ["D", "E"] },
  { id: "C", label: "C", x: 250, y: 80, children: ["F"] },
  { id: "D", label: "D", x: 50, y: 130 },
  { id: "E", label: "E", x: 130, y: 130 },
  { id: "F", label: "F", x: 250, y: 130 },
];

const treeOrder = ["A", "B", "D", "E", "C", "F"]; // pre-order

function makeTreeStep(visitedCount: number, currentIdx: number | null): TreeNode[] {
  return treeNodes.map((n) => {
    const orderIdx = treeOrder.indexOf(n.id);
    return {
      ...n,
      visited: orderIdx < visitedCount,
      active: currentIdx !== null && orderIdx === currentIdx,
    };
  });
}

interface TreeStep {
  nodes: TreeNode[];
  currentId: string | null;
  label: string;
  description: string;
  codeSnippet?: string;
  result?: string;
}

const treeSteps: TreeStep[] = [
  {
    nodes: makeTreeStep(0, null),
    currentId: null,
    label: "트리 순회 시작",
    description: "이진 트리를 이터레이터로 순회합니다. 배열과 다른 자료구조지만, [Symbol.iterator]를 구현하면 같은 for...of로 순회할 수 있습니다.",
    codeSnippet: "class BinaryTree {\n  *[Symbol.iterator]() {\n    yield this.value;       // 현재 노드\n    if (this.left) yield* this.left;  // 왼쪽 서브트리\n    if (this.right) yield* this.right; // 오른쪽 서브트리\n  }\n}",
  },
  {
    nodes: makeTreeStep(0, 0),
    currentId: "A",
    label: "next() → A",
    description: "루트 노드 A를 방문합니다. 제너레이터의 yield this.value가 실행되어 'A'를 반환합니다.",
    result: "{ value: 'A', done: false }",
  },
  {
    nodes: makeTreeStep(1, 1),
    currentId: "B",
    label: "next() → B",
    description: "yield* this.left로 왼쪽 서브트리에 진입합니다. B 노드를 방문합니다.",
    result: "{ value: 'B', done: false }",
  },
  {
    nodes: makeTreeStep(2, 2),
    currentId: "D",
    label: "next() → D",
    description: "B의 왼쪽 자식 D를 방문합니다. D는 리프 노드이므로 더 이상 내려갈 곳이 없습니다.",
    result: "{ value: 'D', done: false }",
  },
  {
    nodes: makeTreeStep(3, 3),
    currentId: "E",
    label: "next() → E",
    description: "B의 오른쪽 자식 E를 방문합니다. B의 서브트리 순회가 완료됩니다.",
    result: "{ value: 'E', done: false }",
  },
  {
    nodes: makeTreeStep(4, 4),
    currentId: "C",
    label: "next() → C",
    description: "A의 오른쪽 서브트리로 이동합니다. C 노드를 방문합니다.",
    result: "{ value: 'C', done: false }",
  },
  {
    nodes: makeTreeStep(5, 5),
    currentId: "F",
    label: "next() → F",
    description: "마지막 노드 F를 방문합니다. 다음 next()에서 done: true가 됩니다.",
    result: "{ value: 'F', done: false }",
  },
  {
    nodes: makeTreeStep(6, null),
    currentId: null,
    label: "순회 완료",
    description: "모든 노드를 방문했습니다. 배열과 완전히 다른 자료구조인 트리를, 같은 for...of 문법으로 순회했습니다. 이것이 Iterator 패턴의 힘입니다.",
    codeSnippet: "// 배열이든 트리이든 같은 문법!\nfor (const node of tree) {\n  console.log(node); // A, B, D, E, C, F\n}",
    result: "순회 순서: A → B → D → E → C → F (전위 순회)",
  },
];

/* ─── Presets ─── */

interface IteratorPatternProps {
  preset?: string;
}

export function IteratorPattern({ preset = "array" }: IteratorPatternProps) {
  if (preset === "tree") {
    const stepNodes = treeSteps.map((step, idx) => (
      <div key={idx} className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-bold text-accent">{step.label}</span>
          <span className="text-[0.6875rem] text-muted">{idx + 1} / {treeSteps.length}</span>
        </div>
        <TreeDiagram nodes={step.nodes} currentId={step.currentId} />
        <Legend />
        {step.result && (
          <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 font-mono text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            → {step.result}
          </div>
        )}
        {step.codeSnippet && (
          <pre className="rounded border border-border bg-surface p-3 font-mono text-xs leading-relaxed text-muted">
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

  // Default: array preset
  const stepNodes = arraySteps.map((step, idx) => (
    <div key={idx} className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-bold text-accent">{step.label}</span>
        <span className="text-[0.6875rem] text-muted">{idx + 1} / {arraySteps.length}</span>
      </div>
      <CellRow cells={step.cells} cursor={step.cursor} />
      <Legend />
      {step.result && (
        <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 font-mono text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          → {step.result}
        </div>
      )}
      {step.codeSnippet && (
        <pre className="rounded border border-border bg-surface p-3 font-mono text-xs leading-relaxed text-muted">
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
