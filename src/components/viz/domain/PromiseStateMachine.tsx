"use client";

import { StepPlayer } from "../primitives/StepPlayer";

type PromiseState = "pending" | "fulfilled" | "rejected";

interface StateMachineStep {
  active: PromiseState;
  transition?: "resolve" | "reject";
  description: string;
}

const steps: StateMachineStep[] = [
  {
    active: "pending",
    description:
      "Promise가 생성되면 pending 상태입니다. 아직 결과가 결정되지 않았습니다.",
  },
  {
    active: "fulfilled",
    transition: "resolve",
    description:
      "resolve()가 호출되면 pending → fulfilled로 전환됩니다. 값이 확정되며, 다시는 바뀌지 않습니다.",
  },
  {
    active: "pending",
    description:
      "다시 pending 상태에서 시작합니다. 이번에는 reject 경로를 봅니다.",
  },
  {
    active: "rejected",
    transition: "reject",
    description:
      "reject() 또는 throw가 발생하면 pending → rejected로 전환됩니다. 에러 사유가 확정되며, 다시는 바뀌지 않습니다.",
  },
];

const stateConfig: Record<
  PromiseState,
  { label: string; color: string; ring: string; bg: string; x: number; y: number }
> = {
  pending: {
    label: "pending",
    color: "text-amber-700 dark:text-amber-300",
    ring: "ring-amber-400 dark:ring-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/70",
    x: 60,
    y: 80,
  },
  fulfilled: {
    label: "fulfilled",
    color: "text-emerald-700 dark:text-emerald-300",
    ring: "ring-emerald-400 dark:ring-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/70",
    x: 280,
    y: 30,
  },
  rejected: {
    label: "rejected",
    color: "text-red-700 dark:text-red-300",
    ring: "ring-red-400 dark:ring-red-500",
    bg: "bg-red-50 dark:bg-red-900/70",
    x: 280,
    y: 130,
  },
};

function StateBox({
  state,
  isActive,
}: {
  state: PromiseState;
  isActive: boolean;
}) {
  const cfg = stateConfig[state];
  return (
    <div
      className={`absolute flex flex-col items-center justify-center border px-5 py-2.5 transition-all duration-300 ${
        isActive
          ? `${cfg.bg} border-transparent ring-2 ${cfg.ring} shadow-sm`
          : "bg-surface border-border"
      }`}
      style={{ left: cfg.x, top: cfg.y, minWidth: 100 }}
    >
      <span
        className={`font-mono text-[0.75rem] font-semibold transition-colors duration-300 ${
          isActive ? cfg.color : "text-muted"
        }`}
      >
        {cfg.label}
      </span>
      {state !== "pending" && (
        <span className="mt-0.5 text-[0.5625rem] text-muted">settled</span>
      )}
    </div>
  );
}

function Arrow({
  type,
  isActive,
}: {
  type: "resolve" | "reject";
  isActive: boolean;
}) {
  const isResolve = type === "resolve";
  const color = isActive
    ? isResolve
      ? "stroke-emerald-500 dark:stroke-emerald-400"
      : "stroke-red-500 dark:stroke-red-400"
    : "stroke-border";
  const textColor = isActive
    ? isResolve
      ? "text-emerald-700 dark:text-emerald-300"
      : "text-red-700 dark:text-red-300"
    : "text-muted";

  const y1 = isResolve ? 55 : 105;
  const y2 = isResolve ? 45 : 145;
  const labelY = isResolve ? 38 : 158;

  return (
    <>
      <line
        x1={170}
        y1={y1}
        x2={270}
        y2={y2}
        className={`${color} transition-colors duration-300`}
        strokeWidth={isActive ? 2 : 1}
        markerEnd="url(#arrowhead)"
      />
      <foreignObject x={185} y={labelY - 10} width={100} height={20}>
        <span
          className={`block text-center font-mono text-[0.5625rem] transition-colors duration-300 ${textColor}`}
        >
          {isResolve ? "resolve()" : "reject() / throw"}
        </span>
      </foreignObject>
    </>
  );
}

export function PromiseStateMachine() {
  const stepNodes = steps.map((step, idx) => (
    <div key={idx}>
      {/* Diagram */}
      <div className="relative mx-auto" style={{ maxWidth: 440, height: 190 }}>
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 440 190"
          fill="none"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon
                points="0 0, 8 3, 0 6"
                className="fill-muted"
              />
            </marker>
          </defs>
          <Arrow
            type="resolve"
            isActive={step.transition === "resolve"}
          />
          <Arrow
            type="reject"
            isActive={step.transition === "reject"}
          />
        </svg>
        <StateBox state="pending" isActive={step.active === "pending"} />
        <StateBox state="fulfilled" isActive={step.active === "fulfilled"} />
        <StateBox state="rejected" isActive={step.active === "rejected"} />
      </div>

      {/* Description */}
      <span className="mt-4 block border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </span>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
