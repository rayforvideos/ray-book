"use client";

import React from "react";
import { StepPlayer } from "../../primitives/StepPlayer";

type ParserStatus = "idle" | "tokenizing" | "building" | "blocked" | "done";

interface ParserStep {
  htmlActiveLines: number[];
  parserStatus: ParserStatus;
  treeNodes: TreeNode[];
  cssomNodes?: TreeNode[];
  highlight?: string;
  description: string;
}

interface TreeNode {
  tag: string;
  depth: number;
  active?: boolean;
  type?: "element" | "text" | "css";
}

interface PresetData {
  htmlCode: string;
  steps: ParserStep[];
}

const statusStyles: Record<
  ParserStatus,
  { bg: string; text: string; label: string }
> = {
  idle: {
    bg: "bg-stone-100 dark:bg-stone-800/40",
    text: "text-stone-600 dark:text-stone-400",
    label: "대기",
  },
  tokenizing: {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    text: "text-sky-700 dark:text-sky-300",
    label: "토큰화",
  },
  building: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    label: "트리 구축",
  },
  blocked: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    label: "블로킹",
  },
  done: {
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-700 dark:text-violet-300",
    label: "완료",
  },
};

const presets: Record<string, PresetData> = {
  basic: {
    htmlCode: `<!DOCTYPE html>
<html lang="ko">
<head>
  <link rel="stylesheet" href="style.css">
  <script src="app.js"></script>
</head>
<body>
  <h1>Hello</h1>
  <p>World</p>
</body>
</html>`,
    steps: [
      {
        htmlActiveLines: [],
        parserStatus: "idle",
        treeNodes: [],
        description:
          "네트워크에서 HTML 바이트 스트림이 도착합니다. 브라우저는 Content-Type 헤더의 charset(보통 UTF-8)으로 바이트를 문자열로 디코딩합니다. 아직 파싱은 시작되지 않았습니다.",
      },
      {
        htmlActiveLines: [0, 1, 2],
        parserStatus: "tokenizing",
        treeNodes: [
          { tag: "DOCTYPE", depth: 0, active: true, type: "element" },
        ],
        highlight: "토큰: DOCTYPE, StartTag<html>, StartTag<head>",
        description:
          "HTML 토크나이저가 상태 머신 방식으로 문자를 읽어 토큰을 생성합니다. '<' 문자를 만나면 태그 열기 상태로 전환하고, 태그 이름을 수집합니다. DOCTYPE 선언 → html 시작 태그 → head 시작 태그 순으로 토큰이 만들어집니다.",
      },
      {
        htmlActiveLines: [1, 2, 5, 6, 7, 8, 9],
        parserStatus: "building",
        treeNodes: [
          { tag: "html", depth: 0, active: false, type: "element" },
          { tag: "head", depth: 1, active: false, type: "element" },
          { tag: "body", depth: 1, active: true, type: "element" },
          { tag: "h1", depth: 2, active: true, type: "element" },
          { tag: '"Hello"', depth: 3, active: true, type: "text" },
          { tag: "p", depth: 2, active: true, type: "element" },
          { tag: '"World"', depth: 3, active: true, type: "text" },
        ],
        description:
          "토큰을 소비하며 DOM 트리를 구축합니다. 시작 태그 토큰 → 새 노드 생성 후 현재 노드의 자식으로 추가, 종료 태그 토큰 → 현재 노드를 부모로 이동. 이렇게 html → head, body → h1, p 순서로 트리가 쌓입니다.",
      },
      {
        htmlActiveLines: [3],
        parserStatus: "building",
        treeNodes: [
          { tag: "html", depth: 0, active: false, type: "element" },
          { tag: "head", depth: 1, active: false, type: "element" },
          { tag: "body", depth: 1, active: false, type: "element" },
          { tag: "h1", depth: 2, active: false, type: "element" },
          { tag: "p", depth: 2, active: false, type: "element" },
        ],
        cssomNodes: [
          { tag: "StyleSheet", depth: 0, active: true, type: "css" },
          { tag: "Rule: h1", depth: 1, active: true, type: "css" },
          { tag: "color: navy", depth: 2, active: true, type: "css" },
          { tag: "Rule: p", depth: 1, active: true, type: "css" },
          { tag: "font-size: 16px", depth: 2, active: true, type: "css" },
        ],
        highlight: "link 태그 → CSS 파일 요청 → CSSOM 구축 (별도 스레드)",
        description:
          "<link> 태그를 만나면 브라우저는 CSS 파일을 요청합니다. CSS 파싱은 DOM 파싱과 병렬로 진행됩니다. CSS 바이트 → 토큰 → CSSOM 트리 순으로 변환됩니다. CSSOM은 CSS 규칙의 캐스케이드와 특이도(specificity)를 반영한 트리 구조입니다.",
      },
      {
        htmlActiveLines: [4],
        parserStatus: "blocked",
        treeNodes: [
          { tag: "html", depth: 0, active: false, type: "element" },
          { tag: "head", depth: 1, active: false, type: "element" },
          { tag: "body", depth: 1, active: false, type: "element" },
          { tag: "h1", depth: 2, active: false, type: "element" },
          { tag: "p", depth: 2, active: false, type: "element" },
        ],
        cssomNodes: [
          { tag: "StyleSheet", depth: 0, active: false, type: "css" },
          { tag: "Rule: h1", depth: 1, active: false, type: "css" },
          { tag: "Rule: p", depth: 1, active: false, type: "css" },
        ],
        highlight: "⚠ 파서 블로킹: script 다운로드 + 실행 대기",
        description:
          "<script> 태그를 만나면 HTML 파서가 멈춥니다. 스크립트가 document.write()로 DOM을 수정할 수 있기 때문입니다. 브라우저는 스크립트를 다운로드하고 실행 완료될 때까지 나머지 HTML 파싱을 중단합니다. 이것이 파서 블로킹(parser-blocking)입니다.",
      },
      {
        htmlActiveLines: [4],
        parserStatus: "building",
        treeNodes: [
          { tag: "html", depth: 0, active: false, type: "element" },
          { tag: "head", depth: 1, active: false, type: "element" },
          { tag: "body", depth: 1, active: false, type: "element" },
          { tag: "h1", depth: 2, active: false, type: "element" },
          { tag: "p", depth: 2, active: false, type: "element" },
        ],
        cssomNodes: [
          { tag: "StyleSheet", depth: 0, active: false, type: "css" },
          { tag: "Rule: h1", depth: 1, active: false, type: "css" },
          { tag: "Rule: p", depth: 1, active: false, type: "css" },
        ],
        highlight: "스크립트 실행 완료 → 파싱 재개",
        description:
          "스크립트 실행이 완료되면 HTML 파서가 멈춘 지점부터 파싱을 재개합니다. 한편 파서가 블로킹된 동안에도 프리로드 스캐너(preload scanner)가 나머지 HTML을 미리 스캔해 이미지, CSS, 스크립트 등의 리소스를 사전 요청합니다.",
      },
      {
        htmlActiveLines: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        parserStatus: "done",
        treeNodes: [
          { tag: "html", depth: 0, active: true, type: "element" },
          { tag: "head", depth: 1, active: true, type: "element" },
          { tag: "link", depth: 2, active: true, type: "element" },
          { tag: "script", depth: 2, active: true, type: "element" },
          { tag: "body", depth: 1, active: true, type: "element" },
          { tag: "h1", depth: 2, active: true, type: "element" },
          { tag: '"Hello"', depth: 3, active: true, type: "text" },
          { tag: "p", depth: 2, active: true, type: "element" },
          { tag: '"World"', depth: 3, active: true, type: "text" },
        ],
        cssomNodes: [
          { tag: "StyleSheet", depth: 0, active: true, type: "css" },
          { tag: "Rule: h1", depth: 1, active: true, type: "css" },
          { tag: "color: navy", depth: 2, active: true, type: "css" },
          { tag: "Rule: p", depth: 1, active: true, type: "css" },
          { tag: "font-size: 16px", depth: 2, active: true, type: "css" },
        ],
        description:
          "DOM 트리와 CSSOM 트리가 모두 완성되었습니다. 이 두 트리를 결합해 렌더 트리(Render Tree)를 만드는 것이 다음 단계입니다. DOMContentLoaded 이벤트가 발생하며, 이후 레이아웃과 페인트 과정을 거쳐 화면에 픽셀이 그려집니다.",
      },
    ],
  },
};

/* ── Sub-components ── */

function CodePane({
  code,
  activeLines,
  statusKey,
}: {
  code: string;
  activeLines: number[];
  statusKey: ParserStatus;
}) {
  const lines = code.split("\n");
  const ss = statusStyles[statusKey];
  return (
    <div className="flex-1 min-w-0">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
          HTML 소스
        </span>
        <span
          className={`px-1.5 py-px font-mono text-[0.5rem] font-bold ${ss.bg} ${ss.text}`}
        >
          {ss.label}
        </span>
      </div>
      <div className="rounded-sm bg-surface font-mono text-[0.6875rem] leading-relaxed overflow-x-auto">
        {lines.map((line, i) => {
          const isActive = activeLines.includes(i);
          return (
            <div
              key={i}
              className={`flex transition-colors duration-150 ${isActive ? "bg-accent/10" : ""}`}
            >
              <span
                className={`select-none w-7 shrink-0 text-right pr-2 ${isActive ? "text-accent" : "text-muted/50"}`}
              >
                {i + 1}
              </span>
              <span
                className={`flex-1 pr-2 py-px whitespace-pre ${isActive ? "text-text" : "text-muted/50"}`}
              >
                {line || "\u00A0"}
              </span>
              {isActive && (
                <span className="shrink-0 pr-2 text-accent text-[0.625rem] pt-px">
                  ◄
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TreePane({
  title,
  nodes,
  color,
}: {
  title: string;
  nodes: TreeNode[];
  color: "sky" | "amber";
}) {
  const colorMap = {
    sky: {
      activeBg: "bg-sky-100 dark:bg-sky-900/40",
      activeText: "text-sky-700 dark:text-sky-300",
      activeBorder: "border-sky-300 dark:border-sky-700",
      inactiveBg: "bg-surface",
      inactiveText: "text-muted/60",
      inactiveBorder: "border-border",
      titleText: "text-sky-600 dark:text-sky-400",
    },
    amber: {
      activeBg: "bg-amber-100 dark:bg-amber-900/40",
      activeText: "text-amber-700 dark:text-amber-300",
      activeBorder: "border-amber-300 dark:border-amber-700",
      inactiveBg: "bg-surface",
      inactiveText: "text-muted/60",
      inactiveBorder: "border-border",
      titleText: "text-amber-600 dark:text-amber-400",
    },
  };
  const c = colorMap[color];

  // 같은 depth의 마지막 노드인지 확인 (└ vs ├ 결정용)
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
        <span className={`text-[0.6875rem] uppercase tracking-wider ${c.titleText}`}>
          {title}
        </span>
      </div>
      <div className="rounded-sm bg-surface p-2 overflow-x-auto">
        {nodes.length === 0 ? (
          <div className="text-[0.75rem] text-muted/40 italic py-1">
            아직 노드 없음
          </div>
        ) : (
          <div className="font-mono text-[0.6875rem]">
            {nodes.map((node, i) => {
              const isActive = node.active;
              const isText = node.type === "text";
              const isCss = node.type === "css";

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

              const label = isCss
                ? node.tag
                : isText
                  ? node.tag
                  : `<${node.tag}>`;

              return (
                <div
                  key={i}
                  className={`flex items-stretch transition-colors duration-150 ${
                    isActive ? "text-text" : "text-muted/40"
                  } ${isText ? "italic" : ""}`}
                  style={{ lineHeight: '1.375em', minHeight: '1.375em' }}
                >
                  {indentSegments}
                  {connectorNode}
                  <span className={`whitespace-nowrap py-px ${isActive ? (color === "sky" ? "text-sky-600 dark:text-sky-400" : "text-amber-600 dark:text-amber-400") : ""}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main component ── */

interface DomCssomParserProps {
  preset?: string;
}

export function DomCssomParser({ preset = "basic" }: DomCssomParserProps) {
  const data = presets[preset] ?? presets["basic"];

  const stepNodes = data.steps.map((step, idx) => (
    <div key={idx} className="space-y-3">
      <div className="flex gap-3 max-sm:flex-col">
        <CodePane
          code={data.htmlCode}
          activeLines={step.htmlActiveLines}
          statusKey={step.parserStatus}
        />

        <div className="flex flex-col gap-3 w-56 shrink-0 max-sm:w-full">
          <TreePane
            title="DOM Tree"
            nodes={step.treeNodes}
            color="sky"
          />
          {step.cssomNodes && (
            <TreePane
              title="CSSOM Tree"
              nodes={step.cssomNodes}
              color="amber"
            />
          )}
        </div>
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
  ));

  return <StepPlayer steps={stepNodes} />;
}
