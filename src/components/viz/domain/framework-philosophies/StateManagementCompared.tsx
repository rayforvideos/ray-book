"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ─── Types ─── */

interface ComponentBox {
  label: string;
  level: number;
  highlighted: boolean;
  hasState?: boolean;
  needsState?: boolean;
}

interface Arrow {
  from: string;
  to: string;
  label?: string;
  highlighted: boolean;
  dashed?: boolean;
}

interface Step {
  label: string;
  description: string;
  components: ComponentBox[];
  arrows: Arrow[];
  externalStore?: { label: string; highlighted: boolean };
  cycleLabels?: string[];
}

/* ─── Colors ─── */

const COLORS = {
  activeBg: "bg-violet-50 dark:bg-violet-950",
  activeBorder: "border-violet-400 dark:border-violet-500",
  activeText: "text-violet-800 dark:text-violet-200",
  stateBg: "bg-amber-50 dark:bg-amber-950",
  stateBorder: "border-amber-400 dark:border-amber-500",
  stateText: "text-amber-800 dark:text-amber-200",
  needsBg: "bg-rose-50 dark:bg-rose-950",
  needsBorder: "border-rose-400 dark:border-rose-500",
  needsText: "text-rose-800 dark:text-rose-200",
  storeBg: "bg-emerald-50 dark:bg-emerald-950",
  storeBorder: "border-emerald-400 dark:border-emerald-500",
  storeText: "text-emerald-800 dark:text-emerald-200",
  dotColor: "bg-violet-500",
};

/* ─── Step Data ─── */

const STEPS: Step[] = [
  {
    label: "Prop Drilling",
    description:
      "컴포넌트 A가 상태를 갖고, 컴포넌트 D가 그 상태를 필요로 합니다. 중간의 B와 C는 사용하지 않지만 전달만 해야 합니다 — 이것이 prop drilling의 고통입니다.",
    components: [
      { label: "A", level: 0, highlighted: false, hasState: true },
      { label: "B", level: 1, highlighted: false },
      { label: "C", level: 2, highlighted: false },
      { label: "D", level: 3, highlighted: false, needsState: true },
    ],
    arrows: [
      { from: "A", to: "B", label: "props", highlighted: true },
      { from: "B", to: "C", label: "props", highlighted: true },
      { from: "C", to: "D", label: "props", highlighted: true },
    ],
  },
  {
    label: "Context / Provide",
    description:
      "상태를 트리 상위에서 제공(provide)하면, 하위 어디서든 직접 접근할 수 있습니다. 중간 컴포넌트를 거칠 필요가 없습니다. React의 useContext, Vue의 provide/inject, Angular의 Service + DI가 이 패턴입니다.",
    components: [
      { label: "A", level: 0, highlighted: true, hasState: true },
      { label: "B", level: 1, highlighted: false },
      { label: "C", level: 2, highlighted: false },
      { label: "D", level: 3, highlighted: true, needsState: false },
    ],
    arrows: [
      { from: "A", to: "D", label: "context", highlighted: true, dashed: true },
    ],
  },
  {
    label: "Global Store",
    description:
      "상태를 컴포넌트 트리 밖의 독립적인 저장소에 둡니다. 어떤 컴포넌트든 직접 접근할 수 있습니다. Redux, Zustand, Pinia, NgRx 등이 이 패턴입니다.",
    components: [
      { label: "A", level: 0, highlighted: false },
      { label: "B", level: 1, highlighted: false },
      { label: "C", level: 2, highlighted: false },
      { label: "D", level: 3, highlighted: true },
    ],
    arrows: [
      { from: "Store", to: "A", highlighted: true, dashed: true },
      { from: "Store", to: "D", highlighted: true, dashed: true },
    ],
    externalStore: { label: "Store", highlighted: true },
  },
  {
    label: "Unidirectional Flow",
    description:
      "단방향 데이터 흐름: Action이 Store를 업데이트하고, Store가 View를 갱신하고, View가 다시 Action을 발생시킵니다. 데이터가 한 방향으로만 흐르므로 예측 가능합니다. Redux와 Flux 패턴의 핵심입니다.",
    components: [],
    arrows: [],
    cycleLabels: ["Action", "Store", "View"],
  },
  {
    label: "Signals / Fine-grained",
    description:
      "시그널 기반 반응성: 상태가 변경되면 그 상태를 구독하는 DOM만 직접 업데이트됩니다. 중간 계층이 없습니다. Angular Signals, Svelte 5 Runes, SolidJS가 이 방향으로 진화하고 있습니다.",
    components: [
      { label: "signal()", level: 0, highlighted: true, hasState: true },
      { label: "View A", level: 1, highlighted: true },
      { label: "View B", level: 1, highlighted: true },
      { label: "View C", level: 1, highlighted: false },
    ],
    arrows: [
      { from: "signal()", to: "View A", label: "subscribe", highlighted: true },
      { from: "signal()", to: "View B", label: "subscribe", highlighted: true },
    ],
  },
];

/* ─── Component Tree ─── */

function ComponentTree({
  components,
  arrows,
  externalStore,
}: {
  components: ComponentBox[];
  arrows: Arrow[];
  externalStore?: { label: string; highlighted: boolean };
}) {
  return (
    <div className="flex items-start gap-6">
      {/* External Store */}
      {externalStore && (
        <div className="flex flex-col items-center gap-2 pt-2">
          <div
            className={[
              "flex items-center justify-center rounded-lg border-2 px-4 py-3 text-sm font-bold transition-all duration-300",
              externalStore.highlighted
                ? `${COLORS.storeBg} ${COLORS.storeBorder} ${COLORS.storeText}`
                : "bg-surface border-border text-muted",
            ].join(" ")}
          >
            {externalStore.label}
          </div>
          <span className="text-[0.5625rem] text-muted">external</span>
        </div>
      )}

      {/* Component tree */}
      <div className="flex items-center gap-2 overflow-x-auto py-2">
        {components.map((comp, i) => (
          <div key={comp.label} className="flex items-center">
            <div
              className={[
                "flex flex-col items-center justify-center rounded-md border px-3 py-2.5 min-w-[56px] text-sm font-mono font-bold transition-all duration-300",
                comp.hasState
                  ? `${COLORS.stateBg} ${COLORS.stateBorder} ${COLORS.stateText}`
                  : comp.needsState
                    ? `${COLORS.needsBg} ${COLORS.needsBorder} ${COLORS.needsText}`
                    : comp.highlighted
                      ? `${COLORS.activeBg} ${COLORS.activeBorder} ${COLORS.activeText}`
                      : "bg-surface border-border text-text",
              ].join(" ")}
            >
              {comp.label}
              {comp.hasState && (
                <span className="mt-0.5 text-[0.5625rem] font-normal opacity-70">
                  state
                </span>
              )}
              {comp.needsState && (
                <span className="mt-0.5 text-[0.5625rem] font-normal opacity-70">
                  needs
                </span>
              )}
            </div>

            {/* Arrow to next */}
            {i < components.length - 1 && (
              <div className="flex flex-col items-center px-1.5">
                {(() => {
                  const arrow = arrows.find(
                    (a) =>
                      a.from === comp.label &&
                      a.to === components[i + 1]?.label
                  );
                  return (
                    <>
                      <span
                        className={[
                          "text-lg transition-colors duration-300",
                          arrow?.highlighted
                            ? "text-violet-400 dark:text-violet-500"
                            : "text-border",
                        ].join(" ")}
                      >
                        {arrow?.dashed ? "⇢" : "→"}
                      </span>
                      {arrow?.label && (
                        <span className="text-[0.5625rem] text-muted -mt-1">
                          {arrow.label}
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Cycle Diagram ─── */

function CycleDiagram({ labels }: { labels: string[] }) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center">
          <div
            className={`flex items-center justify-center rounded-md border px-4 py-2.5 text-sm font-bold transition-all duration-300 ${COLORS.activeBg} ${COLORS.activeBorder} ${COLORS.activeText}`}
          >
            {label}
          </div>
          <span className="px-2 text-lg text-violet-400 dark:text-violet-500">
            {i < labels.length - 1 ? "→" : "→"}
          </span>
          {i === labels.length - 1 && (
            <span className="text-[0.625rem] font-mono text-muted italic">
              (cycle)
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Context Arrow (skip levels) ─── */

function ContextArrow({ arrow }: { arrow: Arrow }) {
  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-[0.625rem] font-mono text-violet-600 dark:text-violet-400">
        {arrow.from}
      </span>
      <div className="flex-1 border-t-2 border-dashed border-violet-400 dark:border-violet-500 relative">
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[0.5625rem] bg-surface px-1 text-violet-600 dark:text-violet-400">
          {arrow.label}
        </span>
      </div>
      <span className="text-[0.625rem] font-mono text-violet-600 dark:text-violet-400">
        {arrow.to}
      </span>
    </div>
  );
}

/* ─── Main Component ─── */

export function StateManagementCompared() {
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

      {/* Visualization */}
      {step.cycleLabels ? (
        <CycleDiagram labels={step.cycleLabels} />
      ) : (
        <>
          <ComponentTree
            components={step.components}
            arrows={step.arrows}
            externalStore={step.externalStore}
          />
          {/* Show context skip arrow for step 2 */}
          {step.arrows.some((a) => a.dashed && a.from !== "Store") && (
            <ContextArrow
              arrow={step.arrows.find((a) => a.dashed && a.from !== "Store")!}
            />
          )}
        </>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 text-[0.6875rem] text-muted">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${COLORS.dotColor}`} />
        <span>State Management Pattern</span>
      </div>

      {/* Description */}
      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
