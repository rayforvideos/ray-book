"use client";

import React from "react";
import { StepPlayer } from "../primitives/StepPlayer";

type StepPhase =
  | "dom-cssom"
  | "filtering"
  | "render-tree"
  | "box-model"
  | "layout"
  | "done";

interface TreeNode {
  tag: string;
  depth: number;
  active?: boolean;
  type?: "element" | "text" | "css" | "render" | "pseudo";
  excluded?: boolean;
  style?: string;
}

interface BoxRect {
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  active?: boolean;
}

interface RenderStep {
  phase: StepPhase;
  domNodes: TreeNode[];
  cssomNodes: TreeNode[];
  renderNodes?: TreeNode[];
  boxes?: BoxRect[];
  highlight?: string;
  description: string;
}

interface PresetData {
  steps: RenderStep[];
}

const phaseStyles: Record<StepPhase, { bg: string; text: string; label: string }> = {
  "dom-cssom": {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    text: "text-sky-700 dark:text-sky-300",
    label: "DOM + CSSOM",
  },
  filtering: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    label: "필터링",
  },
  "render-tree": {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    label: "렌더 트리",
  },
  "box-model": {
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-700 dark:text-violet-300",
    label: "박스 모델",
  },
  layout: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    label: "레이아웃",
  },
  done: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    label: "완료",
  },
};

const domNodes: TreeNode[] = [
  { tag: "html", depth: 0, type: "element" },
  { tag: "head", depth: 1, type: "element" },
  { tag: "meta", depth: 2, type: "element" },
  { tag: "body", depth: 1, type: "element" },
  { tag: "div.container", depth: 2, type: "element" },
  { tag: "h1", depth: 3, type: "element" },
  { tag: '"Hello"', depth: 4, type: "text" },
  { tag: "p.hidden", depth: 3, type: "element" },
  { tag: '"숨겨진 텍스트"', depth: 4, type: "text" },
  { tag: "p.intro", depth: 3, type: "element" },
  { tag: '"Welcome"', depth: 4, type: "text" },
  { tag: "script", depth: 2, type: "element" },
];

const cssomNodes: TreeNode[] = [
  { tag: "StyleSheet", depth: 0, type: "css" },
  { tag: "body", depth: 1, type: "css" },
  { tag: "margin: 0; font: 16px/1.5 sans-serif", depth: 2, type: "css" },
  { tag: ".container", depth: 1, type: "css" },
  { tag: "width: 80%; margin: 0 auto", depth: 2, type: "css" },
  { tag: "h1", depth: 1, type: "css" },
  { tag: "font-size: 24px; color: navy", depth: 2, type: "css" },
  { tag: "h1::before", depth: 1, type: "css" },
  { tag: 'content: "# "; color: gray', depth: 2, type: "css" },
  { tag: ".hidden", depth: 1, type: "css" },
  { tag: "display: none", depth: 2, type: "css" },
  { tag: ".intro", depth: 1, type: "css" },
  { tag: "font-size: 16px; padding: 8px", depth: 2, type: "css" },
];

const presets: Record<string, PresetData> = {
  basic: {
    steps: [
      {
        phase: "dom-cssom",
        domNodes: domNodes.map((n) => ({ ...n, active: true })),
        cssomNodes: cssomNodes.map((n) => ({ ...n, active: true })),
        description:
          "DOM 트리와 CSSOM 트리가 모두 완성된 상태입니다. 브라우저는 이 두 트리를 결합해 렌더 트리를 만듭니다. DOM은 문서의 구조를, CSSOM은 각 요소에 적용될 스타일 정보를 담고 있습니다.",
      },
      {
        phase: "filtering",
        domNodes: domNodes.map((n) => {
          const isExcluded =
            n.tag === "head" ||
            n.tag === "meta" ||
            n.tag === "script" ||
            n.tag === "p.hidden" ||
            n.tag === '"숨겨진 텍스트"';
          return { ...n, active: !isExcluded, excluded: isExcluded };
        }),
        cssomNodes: cssomNodes.map((n) => ({
          ...n,
          active:
            n.tag === ".hidden" || n.tag === "display: none" ? false : true,
        })),
        highlight:
          "제외: <head>, <meta>, <script>, display:none 요소",
        description:
          "렌더 트리에는 화면에 보이는 요소만 포함됩니다. <head>, <meta>, <script> 같은 비시각적 요소는 제외됩니다. display:none이 적용된 .hidden 요소와 그 자식도 렌더 트리에서 완전히 빠집니다. 반면 visibility:hidden이나 opacity:0 요소는 공간을 차지하므로 렌더 트리에 포함됩니다.",
      },
      {
        phase: "render-tree",
        domNodes: domNodes.map((n) => ({
          ...n,
          active: false,
        })),
        cssomNodes: cssomNodes.map((n) => ({ ...n, active: false })),
        renderNodes: [
          { tag: "RenderView (viewport)", depth: 0, type: "render", active: true },
          { tag: "RenderBody", depth: 1, type: "render", active: true, style: "margin:0; font:16px/1.5 sans-serif" },
          { tag: "RenderBlock (div.container)", depth: 2, type: "render", active: true, style: "width:80%; margin:0 auto" },
          { tag: "RenderBlock (h1)", depth: 3, type: "render", active: true, style: "font-size:24px; color:navy" },
          { tag: '::before "# "', depth: 4, type: "pseudo", active: true, style: "color:gray" },
          { tag: 'RenderText "Hello"', depth: 4, type: "text", active: true },
          { tag: "RenderBlock (p.intro)", depth: 3, type: "render", active: true, style: "font-size:16px; padding:8px" },
          { tag: 'RenderText "Welcome"', depth: 4, type: "text", active: true },
        ],
        highlight:
          "추가: h1::before 의사 요소 포함 | 제외: head, script, display:none",
        description:
          "렌더 트리가 완성되었습니다. DOM에는 없지만 CSS에 정의된 ::before 의사 요소가 추가되었습니다. 각 렌더 노드는 DOM 노드와 CSSOM의 계산된 스타일(computed style)을 결합한 것입니다. 이 트리가 이후 레이아웃과 페인트의 입력이 됩니다.",
      },
      {
        phase: "box-model",
        domNodes: [],
        cssomNodes: [],
        renderNodes: [
          { tag: "RenderView (viewport)", depth: 0, type: "render", active: false },
          { tag: "RenderBody", depth: 1, type: "render", active: false },
          { tag: "RenderBlock (div.container)", depth: 2, type: "render", active: false },
          { tag: "RenderBlock (h1)", depth: 3, type: "render", active: true },
          { tag: '::before "# "', depth: 4, type: "pseudo", active: true },
          { tag: 'RenderText "Hello"', depth: 4, type: "text", active: true },
          { tag: "RenderBlock (p.intro)", depth: 3, type: "render", active: true },
          { tag: 'RenderText "Welcome"', depth: 4, type: "text", active: true },
        ],
        boxes: [
          { label: "margin", x: 0, y: 0, w: 280, h: 160, color: "amber", active: true },
          { label: "border", x: 20, y: 15, w: 240, h: 130, color: "sky", active: true },
          { label: "padding", x: 30, y: 27, w: 220, h: 106, color: "emerald", active: true },
          { label: "content", x: 50, y: 42, w: 180, h: 76, color: "violet", active: true },
        ],
        highlight: "CSS 박스 모델: content → padding → border → margin",
        description:
          "렌더 트리의 각 노드에 CSS 박스 모델이 적용됩니다. 모든 요소는 content(내용) → padding(안쪽 여백) → border(테두리) → margin(바깥 여백)의 네 영역으로 구성된 사각형 박스를 생성합니다. box-sizing: content-box(기본값)에서는 width가 content 영역만을 의미하고, border-box에서는 padding + border까지 포함합니다.",
      },
      {
        phase: "layout",
        domNodes: [],
        cssomNodes: [],
        renderNodes: [
          { tag: "RenderView (viewport)", depth: 0, type: "render", active: true, style: "1024×768" },
          { tag: "RenderBody", depth: 1, type: "render", active: true, style: "x:0 y:0 w:1024 h:768" },
          { tag: "RenderBlock (div.container)", depth: 2, type: "render", active: true, style: "x:102 y:0 w:819 h:auto" },
          { tag: "RenderBlock (h1)", depth: 3, type: "render", active: true, style: "x:102 y:0 w:819 h:33" },
          { tag: "RenderBlock (p.intro)", depth: 3, type: "render", active: true, style: "x:102 y:33 w:819 h:40" },
        ],
        boxes: [
          { label: "viewport (1024×768)", x: 0, y: 0, w: 280, h: 160, color: "stone", active: true },
          { label: "body", x: 0, y: 0, w: 280, h: 160, color: "sky", active: false },
          { label: ".container (80%)", x: 28, y: 5, w: 224, h: 145, color: "emerald", active: true },
          { label: "h1 (24px)", x: 28, y: 5, w: 224, h: 40, color: "violet", active: true },
          { label: "p.intro", x: 28, y: 50, w: 224, h: 35, color: "amber", active: true },
        ],
        highlight: "뷰포트 1024px 기준 → .container: 80% = 819px, margin: 0 auto → 좌우 102px",
        description:
          "레이아웃(Reflow) 단계에서는 렌더 트리를 루트부터 순회하며 각 박스의 정확한 위치(x, y)와 크기(width, height)를 계산합니다. 퍼센트 값은 부모 기준으로 해석됩니다. .container의 width:80%는 뷰포트 1024px의 80%인 819px로 계산되고, margin:0 auto는 남은 205px를 좌우 균등 분배합니다.",
      },
      {
        phase: "done",
        domNodes: [],
        cssomNodes: [],
        renderNodes: [
          { tag: "RenderView (viewport)", depth: 0, type: "render", active: true, style: "1024×768" },
          { tag: "RenderBody", depth: 1, type: "render", active: true, style: "0,0 1024×768" },
          { tag: "RenderBlock (div.container)", depth: 2, type: "render", active: true, style: "102,0 819×auto" },
          { tag: "RenderBlock (h1)", depth: 3, type: "render", active: true, style: "102,0 819×33" },
          { tag: '::before "# "', depth: 4, type: "pseudo", active: true },
          { tag: 'RenderText "Hello"', depth: 4, type: "text", active: true },
          { tag: "RenderBlock (p.intro)", depth: 3, type: "render", active: true, style: "102,33 819×40" },
          { tag: 'RenderText "Welcome"', depth: 4, type: "text", active: true },
        ],
        boxes: [
          { label: "viewport", x: 0, y: 0, w: 280, h: 160, color: "stone", active: false },
          { label: ".container", x: 28, y: 5, w: 224, h: 145, color: "emerald", active: true },
          { label: "h1", x: 28, y: 5, w: 224, h: 40, color: "violet", active: true },
          { label: "p.intro", x: 28, y: 50, w: 224, h: 35, color: "amber", active: true },
        ],
        description:
          "레이아웃이 완료되었습니다. 모든 렌더 노드에 정확한 좌표와 크기가 결정되었습니다. 이 기하학적 정보를 기반으로 다음 단계인 페인트(Paint)에서 실제 픽셀을 그리게 됩니다. 레이아웃 결과는 레이아웃 트리(Layout Tree)로도 불립니다.",
      },
    ],
  },
};

/* ── Sub-components ── */

function TreePane({
  title,
  nodes,
  color,
}: {
  title: string;
  nodes: TreeNode[];
  color: "sky" | "amber" | "emerald" | "violet";
}) {
  const colorMap = {
    sky: {
      activeBg: "bg-sky-100 dark:bg-sky-900/40",
      activeText: "text-sky-700 dark:text-sky-300",
      activeBorder: "border-sky-300 dark:border-sky-700",
      inactiveBg: "bg-surface",
      inactiveText: "text-muted/60",
      inactiveBorder: "border-border",
      excludedBg: "bg-rose-50 dark:bg-rose-950/30",
      excludedText: "text-rose-400 dark:text-rose-500 line-through",
      excludedBorder: "border-rose-200 dark:border-rose-800",
      titleText: "text-sky-600 dark:text-sky-400",
    },
    amber: {
      activeBg: "bg-amber-100 dark:bg-amber-900/40",
      activeText: "text-amber-700 dark:text-amber-300",
      activeBorder: "border-amber-300 dark:border-amber-700",
      inactiveBg: "bg-surface",
      inactiveText: "text-muted/60",
      inactiveBorder: "border-border",
      excludedBg: "bg-rose-50 dark:bg-rose-950/30",
      excludedText: "text-rose-400 dark:text-rose-500 line-through",
      excludedBorder: "border-rose-200 dark:border-rose-800",
      titleText: "text-amber-600 dark:text-amber-400",
    },
    emerald: {
      activeBg: "bg-emerald-100 dark:bg-emerald-900/40",
      activeText: "text-emerald-700 dark:text-emerald-300",
      activeBorder: "border-emerald-300 dark:border-emerald-700",
      inactiveBg: "bg-surface",
      inactiveText: "text-muted/60",
      inactiveBorder: "border-border",
      excludedBg: "bg-rose-50 dark:bg-rose-950/30",
      excludedText: "text-rose-400 dark:text-rose-500 line-through",
      excludedBorder: "border-rose-200 dark:border-rose-800",
      titleText: "text-emerald-600 dark:text-emerald-400",
    },
    violet: {
      activeBg: "bg-violet-100 dark:bg-violet-900/40",
      activeText: "text-violet-700 dark:text-violet-300",
      activeBorder: "border-violet-300 dark:border-violet-700",
      inactiveBg: "bg-surface",
      inactiveText: "text-muted/60",
      inactiveBorder: "border-border",
      excludedBg: "bg-rose-50 dark:bg-rose-950/30",
      excludedText: "text-rose-400 dark:text-rose-500 line-through",
      excludedBorder: "border-rose-200 dark:border-rose-800",
      titleText: "text-violet-600 dark:text-violet-400",
    },
  };
  const c = colorMap[color];

  const isLastAtDepth = (idx: number, depth: number) => {
    for (let j = idx + 1; j < nodes.length; j++) {
      if (nodes[j].depth < depth) return true;
      if (nodes[j].depth === depth) return false;
    }
    return true;
  };

  return (
    <div className="min-w-0">
      <div className="mb-1.5">
        <span
          className={`text-[0.6875rem] uppercase tracking-wider ${c.titleText}`}
        >
          {title}
        </span>
      </div>
      <div className="rounded-sm bg-surface p-2 overflow-x-auto">
        {nodes.length === 0 ? (
          <div className="text-[0.75rem] text-muted/40 italic py-1">
            (이 단계에서는 표시하지 않음)
          </div>
        ) : (
          <div className="font-mono text-[0.625rem]">
            {nodes.map((node, i) => {
              const isActive = node.active;
              const isExcluded = node.excluded;
              const isText = node.type === "text";
              const isPseudo = node.type === "pseudo";

              const isLast = node.depth > 0 && isLastAtDepth(i, node.depth);

              // Build indent segments as styled spans
              const indentSegments: React.ReactNode[] = [];
              for (let d = 1; d < node.depth; d++) {
                let hasSibling = false;
                for (let j = i + 1; j < nodes.length; j++) {
                  if (nodes[j].depth < d) break;
                  if (nodes[j].depth === d) { hasSibling = true; break; }
                }
                indentSegments.push(
                  <span
                    key={`i${d}`}
                    className="inline-block select-none"
                    style={{ width: 16, height: '100%' }}
                  >
                    {hasSibling && (
                      <span
                        className="inline-block border-l border-current opacity-25"
                        style={{ width: 0, height: '100%', marginLeft: 2 }}
                      />
                    )}
                  </span>
                );
              }

              // Build connector segment
              let connectorNode: React.ReactNode = null;
              if (node.depth > 0) {
                connectorNode = (
                  <span
                    key="conn"
                    className="inline-flex select-none"
                    style={{ width: 16, height: '1.375em', verticalAlign: 'top' }}
                  >
                    {/* vertical line: full height for ├, half height for └ */}
                    <span
                      className="inline-block border-l border-current opacity-25"
                      style={{
                        width: 0,
                        height: isLast ? '50%' : '100%',
                        marginLeft: 2,
                        flexShrink: 0,
                      }}
                    />
                    {/* horizontal line */}
                    <span
                      className="inline-block border-b border-current opacity-25"
                      style={{
                        width: 8,
                        height: '50%',
                        flexShrink: 0,
                        marginLeft: 0,
                      }}
                    />
                  </span>
                );
              }

              const label = isText || isPseudo || node.type === "css" || node.type === "render"
                ? node.tag
                : `<${node.tag}>`;

              return (
                <div
                  key={i}
                  className={`flex items-stretch transition-colors duration-150 ${
                    isExcluded
                      ? "text-rose-400 dark:text-rose-500 line-through"
                      : isActive
                        ? "text-text"
                        : "text-muted/40"
                  } ${isText ? "italic" : ""} ${isPseudo ? "opacity-80" : ""}`}
                  style={{ lineHeight: '1.375em', minHeight: '1.375em' }}
                >
                  {indentSegments}
                  {connectorNode}
                  <span className={`whitespace-nowrap py-px ${isActive && !isExcluded ? c.activeText : ""}`}>
                    {label}
                  </span>
                  {node.style && isActive && (
                    <span className="text-muted/50 ml-1 whitespace-nowrap py-px">{node.style}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function BoxModelDiagram({ boxes }: { boxes: BoxRect[] }) {
  const boxColors: Record<string, { bg: string; border: string; text: string }> = {
    amber: {
      bg: "rgba(245, 158, 11, 0.12)",
      border: "rgba(245, 158, 11, 0.5)",
      text: "rgb(180, 120, 10)",
    },
    sky: {
      bg: "rgba(14, 165, 233, 0.12)",
      border: "rgba(14, 165, 233, 0.5)",
      text: "rgb(2, 132, 199)",
    },
    emerald: {
      bg: "rgba(16, 185, 129, 0.12)",
      border: "rgba(16, 185, 129, 0.5)",
      text: "rgb(5, 150, 105)",
    },
    violet: {
      bg: "rgba(139, 92, 246, 0.15)",
      border: "rgba(139, 92, 246, 0.5)",
      text: "rgb(109, 62, 216)",
    },
    stone: {
      bg: "rgba(120, 113, 108, 0.08)",
      border: "rgba(120, 113, 108, 0.3)",
      text: "rgb(87, 83, 78)",
    },
    rose: {
      bg: "rgba(244, 63, 94, 0.12)",
      border: "rgba(244, 63, 94, 0.5)",
      text: "rgb(225, 29, 72)",
    },
  };

  return (
    <div className="flex-1 min-w-0">
      <div className="mb-1.5">
        <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
          박스 배치
        </span>
      </div>
      <svg
        viewBox="0 0 300 180"
        className="w-full max-w-[300px] h-auto"
        role="img"
        aria-label="박스 모델 시각화"
      >
        {boxes.map((box, i) => {
          const c = boxColors[box.color] ?? boxColors.stone;
          return (
            <g key={i}>
              <rect
                x={box.x + 10}
                y={box.y + 10}
                width={box.w}
                height={box.h}
                fill={box.active ? c.bg : "transparent"}
                stroke={box.active ? c.border : "rgba(120,113,108,0.15)"}
                strokeWidth={box.active ? 1.5 : 0.5}
                strokeDasharray={box.active ? "none" : "3 2"}
                rx={2}
              />
              <text
                x={box.x + 14}
                y={box.y + 22}
                fontSize="9"
                fill={box.active ? c.text : "rgba(120,113,108,0.3)"}
                fontFamily="monospace"
              >
                {box.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Main component ── */

interface RenderTreeLayoutProps {
  preset?: string;
}

export function RenderTreeLayout({
  preset = "basic",
}: RenderTreeLayoutProps) {
  const data = presets[preset] ?? presets["basic"];

  const stepNodes = data.steps.map((step, idx) => {
    const ps = phaseStyles[step.phase];

    return (
      <div key={idx} className="space-y-3">
        {/* Phase badge */}
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 font-mono text-[0.625rem] font-bold ${ps.bg} ${ps.text}`}
          >
            {ps.label}
          </span>
        </div>

        <div className="flex gap-3 max-sm:flex-col">
          {/* Left side: trees */}
          <div className="flex flex-col gap-3 flex-1 min-w-0 max-w-sm">
            {step.domNodes.length > 0 && (
              <TreePane title="DOM Tree" nodes={step.domNodes} color="sky" />
            )}
            {step.cssomNodes.length > 0 && (
              <TreePane
                title="CSSOM Tree"
                nodes={step.cssomNodes}
                color="amber"
              />
            )}
            {step.renderNodes && (
              <TreePane
                title="Render Tree"
                nodes={step.renderNodes}
                color="emerald"
              />
            )}
          </div>

          {/* Right side: box visualization */}
          {step.boxes && (
            <BoxModelDiagram boxes={step.boxes} />
          )}
        </div>

        {step.highlight && (
          <div className="bg-accent/10 px-3 py-1.5 font-mono text-[0.6875rem] text-accent">
            {step.highlight}
          </div>
        )}

        <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
          {step.description}
        </div>
      </div>
    );
  });

  return <StepPlayer steps={stepNodes} />;
}
