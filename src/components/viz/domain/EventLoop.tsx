"use client";

import { StepPlayer } from "../primitives/StepPlayer";
import { AnimatedBox } from "../primitives/AnimatedBox";

interface EventLoopStep {
  queue: "macrotask" | "microtask" | "render";
  item: string;
  description: string;
}

const presets: Record<string, EventLoopStep[]> = {
  basics: [
    { queue: "macrotask", item: "script", description: "전체 스크립트가 macrotask로 실행됩니다." },
    { queue: "microtask", item: "Promise.then", description: "Promise.then 콜백이 microtask 큐에 추가됩니다." },
    { queue: "microtask", item: "queueMicrotask", description: "queueMicrotask 콜백도 microtask 큐에 추가됩니다." },
    { queue: "render", item: "rAF callback", description: "requestAnimationFrame 콜백이 렌더 단계에 예약됩니다." },
    { queue: "macrotask", item: "setTimeout", description: "setTimeout 콜백이 다음 macrotask로 큐에 들어갑니다." },
  ],
};

interface EventLoopProps {
  preset?: string;
  steps?: EventLoopStep[];
}

const queueStyles = {
  macrotask: {
    badge:
      "border-amber-400/50 bg-amber-50 text-amber-950 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-100",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  microtask: {
    badge:
      "border-stone-400/50 bg-stone-100 text-stone-800 dark:border-stone-500/40 dark:bg-stone-800/40 dark:text-stone-200",
    dot: "bg-stone-500 dark:bg-stone-400",
  },
  render: {
    badge:
      "border-emerald-400/50 bg-emerald-50 text-emerald-950 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-100",
    dot: "bg-emerald-500 dark:bg-emerald-400",
  },
};

const queueLabels = {
  macrotask: "Macrotask",
  microtask: "Microtask",
  render: "Render",
};

export function EventLoop({ preset = "basics", steps }: EventLoopProps) {
  const resolvedSteps = steps ?? presets[preset] ?? [];

  const stepNodes = resolvedSteps.map((_, stepIndex) => {
    const visibleSteps = resolvedSteps.slice(0, stepIndex + 1);
    return (
      <div key={stepIndex} className="space-y-3">
        {(["macrotask", "microtask", "render"] as const).map((queue) => {
          const queueSteps = visibleSteps.filter((s) => s.queue === queue);
          return (
            <div key={queue} className="flex items-start gap-3">
              <span className="flex w-24 shrink-0 items-center gap-1.5 pt-1 text-right">
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${queueStyles[queue].dot}`}
                />
                <span className="font-mono text-[0.6875rem] text-muted">
                  {queueLabels[queue]}
                </span>
              </span>
              <div className="flex flex-1 flex-wrap gap-1.5" style={{ minHeight: "1.75rem" }}>
                {queueSteps.map((step, i) => (
                  <AnimatedBox key={i} preset="scaleIn">
                    <span
                      className={`inline-block border px-2 py-0.5 font-mono text-[0.6875rem] ${queueStyles[queue].badge}`}
                    >
                      {step.item}
                    </span>
                  </AnimatedBox>
                ))}
                {queueSteps.length === 0 && (
                  <span className="pt-0.5 text-[0.6875rem] text-muted/30">
                    —
                  </span>
                )}
              </div>
            </div>
          );
        })}

        <div className="mt-4 border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
          {resolvedSteps[stepIndex]?.description}
        </div>
      </div>
    );
  });

  return <StepPlayer steps={stepNodes} />;
}
