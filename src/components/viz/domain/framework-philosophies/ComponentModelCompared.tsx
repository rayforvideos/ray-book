"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ─── Types ─── */

interface Step {
  label: string;
  description: string;
  parentHighlight: boolean;
  childHighlight: boolean;
  arrowDown: boolean;
  arrowUp: boolean;
  activeZone: "parent" | "child" | "arrow-down" | "arrow-up" | "both";
}

/* ─── Step Data ─── */

const STEPS: Step[] = [
  {
    label: "1. Parent가 상태를 보유",
    description:
      "Parent 컴포넌트가 상태 (state) 를 소유합니다. 모든 데이터의 원천은 상위 컴포넌트입니다.",
    parentHighlight: true,
    childHighlight: false,
    arrowDown: false,
    arrowUp: false,
    activeZone: "parent",
  },
  {
    label: "2. Props가 아래로 전달",
    description:
      "Parent는 자신의 상태를 props로 Child에게 전달합니다. 데이터는 항상 위에서 아래로 흐릅니다.",
    parentHighlight: true,
    childHighlight: false,
    arrowDown: true,
    arrowUp: false,
    activeZone: "arrow-down",
  },
  {
    label: "3. Child가 props로 렌더링",
    description:
      "Child는 전달받은 props를 사용하여 UI를 렌더링합니다. 자신의 상태를 직접 소유하지 않습니다.",
    parentHighlight: true,
    childHighlight: true,
    arrowDown: true,
    arrowUp: false,
    activeZone: "child",
  },
  {
    label: "4. 사용자 상호작용 → 이벤트 발생",
    description:
      "Child에서 사용자 상호작용이 발생하면, 이벤트 (콜백/emit) 를 통해 Parent에게 알립니다.",
    parentHighlight: true,
    childHighlight: true,
    arrowDown: true,
    arrowUp: true,
    activeZone: "arrow-up",
  },
  {
    label: "5. Parent 상태 업데이트 → 사이클 반복",
    description:
      "이벤트를 받은 Parent가 상태를 업데이트합니다. 새로운 props가 다시 아래로 전달되며 사이클이 반복됩니다.",
    parentHighlight: true,
    childHighlight: true,
    arrowDown: true,
    arrowUp: true,
    activeZone: "both",
  },
];

/* ─── Diagram ─── */

function Diagram({ step }: { step: Step }) {
  return (
    <div className="flex flex-col items-center gap-0 py-2">
      {/* Parent Box */}
      <div
        className={[
          "w-56 rounded-lg border-2 px-4 py-3 text-center transition-all duration-300",
          step.parentHighlight
            ? step.activeZone === "parent" || step.activeZone === "both"
              ? "border-sky-500 bg-sky-50 dark:border-sky-400 dark:bg-sky-950"
              : "border-sky-400/60 bg-sky-50/60 dark:border-sky-500/60 dark:bg-sky-950/60"
            : "border-border bg-surface opacity-40",
        ].join(" ")}
      >
        <span className="text-xs font-bold text-sky-700 dark:text-sky-300">
          Parent
        </span>
        <div className="mt-1 font-mono text-[0.6875rem] text-sky-600 dark:text-sky-400">
          state = {`{ count: 0 }`}
        </div>
      </div>

      {/* Down Arrow */}
      <div className="flex items-center gap-3 py-1">
        <div
          className={[
            "flex flex-col items-center transition-all duration-300",
            step.arrowDown
              ? step.activeZone === "arrow-down"
                ? "opacity-100"
                : "opacity-80"
              : "opacity-20",
          ].join(" ")}
        >
          <div
            className={[
              "h-6 w-0.5 transition-colors duration-300",
              step.arrowDown
                ? "bg-emerald-500 dark:bg-emerald-400"
                : "bg-border",
            ].join(" ")}
          />
          <span
            className={[
              "text-lg leading-none transition-colors duration-300",
              step.arrowDown
                ? "text-emerald-500 dark:text-emerald-400"
                : "text-border",
            ].join(" ")}
          >
            ▼
          </span>
        </div>
        <span
          className={[
            "text-[0.6875rem] font-medium transition-opacity duration-300",
            step.arrowDown
              ? "text-emerald-600 dark:text-emerald-400 opacity-100"
              : "text-muted opacity-30",
          ].join(" ")}
        >
          props
        </span>
      </div>

      {/* Child Box */}
      <div
        className={[
          "w-56 rounded-lg border-2 px-4 py-3 text-center transition-all duration-300",
          step.childHighlight
            ? step.activeZone === "child" || step.activeZone === "both"
              ? "border-violet-500 bg-violet-50 dark:border-violet-400 dark:bg-violet-950"
              : "border-violet-400/60 bg-violet-50/60 dark:border-violet-500/60 dark:bg-violet-950/60"
            : "border-border bg-surface opacity-40",
        ].join(" ")}
      >
        <span className="text-xs font-bold text-violet-700 dark:text-violet-300">
          Child
        </span>
        <div className="mt-1 font-mono text-[0.6875rem] text-violet-600 dark:text-violet-400">
          props.count → render
        </div>
      </div>

      {/* Up Arrow */}
      <div className="flex items-center gap-3 py-1">
        <span
          className={[
            "text-[0.6875rem] font-medium transition-opacity duration-300",
            step.arrowUp
              ? "text-amber-600 dark:text-amber-400 opacity-100"
              : "text-muted opacity-30",
          ].join(" ")}
        >
          event
        </span>
        <div
          className={[
            "flex flex-col items-center transition-all duration-300",
            step.arrowUp
              ? step.activeZone === "arrow-up"
                ? "opacity-100"
                : "opacity-80"
              : "opacity-20",
          ].join(" ")}
        >
          <span
            className={[
              "text-lg leading-none transition-colors duration-300",
              step.arrowUp
                ? "text-amber-500 dark:text-amber-400"
                : "text-border",
            ].join(" ")}
          >
            ▲
          </span>
          <div
            className={[
              "h-6 w-0.5 transition-colors duration-300",
              step.arrowUp
                ? "bg-amber-500 dark:bg-amber-400"
                : "bg-border",
            ].join(" ")}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center gap-4 text-[0.625rem] text-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          Props (아래로)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
          Events (위로)
        </span>
      </div>
    </div>
  );
}

/* ─── Step Nodes ─── */

const stepNodes = STEPS.map((step, idx) => (
  <div key={idx} className="space-y-4">
    {/* Header */}
    <div className="flex items-center justify-between">
      <span className="font-mono text-sm font-bold text-accent">
        {step.label}
      </span>
      <span className="text-[0.6875rem] text-muted">
        {idx + 1} / {STEPS.length}
      </span>
    </div>

    {/* Diagram */}
    <Diagram step={step} />

    {/* Description */}
    <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
      {step.description}
    </div>
  </div>
));

/* ─── Main Component ─── */

export function ComponentModelCompared() {
  return <StepPlayer steps={stepNodes} />;
}
