"use client";

import { StepPlayer } from "../primitives/StepPlayer";

type Phase = "capture" | "target" | "bubble" | "idle";

interface FlowStep {
  phase: Phase;
  currentNode: string;
  path: string[];
  visitedCapture: string[];
  visitedBubble: string[];
  description: string;
}

const phaseStyles: Record<Phase, { label: string; bg: string; text: string }> = {
  idle: { label: "대기", bg: "bg-stone-100 dark:bg-stone-800/40", text: "text-stone-700 dark:text-stone-200" },
  capture: { label: "캡처 단계", bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-900 dark:text-violet-100" },
  target: { label: "타겟 단계", bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-900 dark:text-rose-100" },
  bubble: { label: "버블 단계", bg: "bg-sky-50 dark:bg-sky-950/40", text: "text-sky-900 dark:text-sky-100" },
};

const treeNodes = ["window", "document", "html", "body", "ul", "li"];

const steps: FlowStep[] = [
  {
    phase: "idle",
    currentNode: "",
    path: treeNodes,
    visitedCapture: [],
    visitedBubble: [],
    description: "사용자가 <li>를 클릭합니다. 이벤트 객체가 생성되고, window에서 시작하여 target까지 내려갑니다.",
  },
  {
    phase: "capture",
    currentNode: "window",
    path: treeNodes,
    visitedCapture: ["window"],
    visitedBubble: [],
    description: "캡처 단계 시작. window에서 이벤트가 출발합니다. addEventListener의 세 번째 인자가 true이면 이 단계에서 핸들러가 실행됩니다.",
  },
  {
    phase: "capture",
    currentNode: "document",
    path: treeNodes,
    visitedCapture: ["window", "document"],
    visitedBubble: [],
    description: "document → html → body → ul 순서로 내려갑니다. 각 노드에서 캡처 리스너가 있으면 실행됩니다.",
  },
  {
    phase: "capture",
    currentNode: "html",
    path: treeNodes,
    visitedCapture: ["window", "document", "html"],
    visitedBubble: [],
    description: "html 노드를 지나갑니다.",
  },
  {
    phase: "capture",
    currentNode: "body",
    path: treeNodes,
    visitedCapture: ["window", "document", "html", "body"],
    visitedBubble: [],
    description: "body 노드를 지나갑니다.",
  },
  {
    phase: "capture",
    currentNode: "ul",
    path: treeNodes,
    visitedCapture: ["window", "document", "html", "body", "ul"],
    visitedBubble: [],
    description: "ul 노드를 지나갑니다. target 바로 위 조상입니다.",
  },
  {
    phase: "target",
    currentNode: "li",
    path: treeNodes,
    visitedCapture: ["window", "document", "html", "body", "ul"],
    visitedBubble: [],
    description: "타겟 단계. event.target === <li>. 캡처/버블 구분 없이 등록 순서대로 핸들러가 실행됩니다.",
  },
  {
    phase: "bubble",
    currentNode: "ul",
    path: treeNodes,
    visitedCapture: ["window", "document", "html", "body", "ul"],
    visitedBubble: ["ul"],
    description: "버블 단계 시작. target에서 window까지 올라갑니다. 기본 addEventListener (세 번째 인자 생략/false)의 핸들러가 여기서 실행됩니다.",
  },
  {
    phase: "bubble",
    currentNode: "body",
    path: treeNodes,
    visitedCapture: ["window", "document", "html", "body", "ul"],
    visitedBubble: ["ul", "body"],
    description: "body로 올라갑니다. body에 등록된 click 핸들러가 실행됩니다.",
  },
  {
    phase: "bubble",
    currentNode: "html",
    path: treeNodes,
    visitedCapture: ["window", "document", "html", "body", "ul"],
    visitedBubble: ["ul", "body", "html"],
    description: "html → document → window 순서로 올라갑니다.",
  },
  {
    phase: "bubble",
    currentNode: "document",
    path: treeNodes,
    visitedCapture: ["window", "document", "html", "body", "ul"],
    visitedBubble: ["ul", "body", "html", "document"],
    description: "document 노드에 도달합니다.",
  },
  {
    phase: "bubble",
    currentNode: "window",
    path: treeNodes,
    visitedCapture: ["window", "document", "html", "body", "ul"],
    visitedBubble: ["ul", "body", "html", "document", "window"],
    description: "window까지 도달하면 이벤트 흐름이 완료됩니다. 캡처(↓) → 타겟 → 버블(↑), 총 3단계입니다.",
  },
];

function NodeBox({ name, isCurrent, captureVisited, bubbleVisited, isTarget }: {
  name: string;
  isCurrent: boolean;
  captureVisited: boolean;
  bubbleVisited: boolean;
  isTarget: boolean;
}) {
  let bg = "bg-surface";
  let border = "border-border";
  let text = "text-muted/40";

  if (isCurrent && isTarget) {
    bg = "bg-rose-50 dark:bg-rose-900/70"; border = "border-rose-400"; text = "text-rose-900 dark:text-rose-100";
  } else if (isCurrent && captureVisited) {
    bg = "bg-violet-50 dark:bg-violet-900/70"; border = "border-violet-400"; text = "text-violet-900 dark:text-violet-100";
  } else if (isCurrent && bubbleVisited) {
    bg = "bg-sky-50 dark:bg-sky-900/70"; border = "border-sky-400"; text = "text-sky-900 dark:text-sky-100";
  } else if (captureVisited || bubbleVisited) {
    bg = "bg-surface"; border = "border-border"; text = "text-text";
  }

  return (
    <div className={`border px-3 py-1.5 text-center font-mono text-[0.6875rem] transition-all duration-200 ${bg} ${border} ${text}`}>
      &lt;{name}&gt;
    </div>
  );
}

export function EventFlow() {
  const stepNodes = steps.map((step, idx) => {
    const ps = phaseStyles[step.phase];
    return (
      <div key={idx} className="space-y-3">
        <span className={`inline-block px-2 py-0.5 font-mono text-[0.6875rem] font-bold ${ps.bg} ${ps.text}`}>
          {ps.label}
        </span>

        <div className="flex flex-col items-center gap-0">
          {treeNodes.map((name, i) => {
            const isCurrent = step.currentNode === name;
            const captureVisited = step.visitedCapture.includes(name);
            const bubbleVisited = step.visitedBubble.includes(name);
            const isTarget = name === "li";
            return (
              <div key={name} className="flex flex-col items-center">
                {i > 0 && (
                  <div className="flex items-center gap-2 py-0.5">
                    {captureVisited && <span className="text-[0.5rem] text-violet-500">▼</span>}
                    {bubbleVisited && <span className="text-[0.5rem] text-sky-500">▲</span>}
                    {!captureVisited && !bubbleVisited && <span className="text-[0.5rem] text-muted/20">│</span>}
                  </div>
                )}
                <NodeBox
                  name={name}
                  isCurrent={isCurrent}
                  captureVisited={captureVisited}
                  bubbleVisited={bubbleVisited}
                  isTarget={isTarget}
                />
              </div>
            );
          })}
        </div>

        <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
          {step.description}
        </div>
      </div>
    );
  });

  return <StepPlayer steps={stepNodes} />;
}
