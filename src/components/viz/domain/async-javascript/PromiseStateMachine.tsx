"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

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
  {
    label: string;
    settled: boolean;
    fill: string;
    fillActive: string;
    stroke: string;
    strokeActive: string;
    textColor: string;
    textActive: string;
    x: number;
    y: number;
  }
> = {
  pending: {
    label: "pending",
    settled: false,
    fill: "var(--color-surface)",
    fillActive: "#fefce8",
    stroke: "var(--color-border)",
    strokeActive: "#f59e0b",
    textColor: "var(--color-muted)",
    textActive: "#b45309",
    x: 20,
    y: 65,
  },
  fulfilled: {
    label: "fulfilled",
    settled: true,
    fill: "var(--color-surface)",
    fillActive: "#ecfdf5",
    stroke: "var(--color-border)",
    strokeActive: "#10b981",
    textColor: "var(--color-muted)",
    textActive: "#047857",
    x: 230,
    y: 15,
  },
  rejected: {
    label: "rejected",
    settled: true,
    fill: "var(--color-surface)",
    fillActive: "#fef2f2",
    stroke: "var(--color-border)",
    strokeActive: "#ef4444",
    textColor: "var(--color-muted)",
    textActive: "#b91c1c",
    x: 230,
    y: 115,
  },
};

function StateRect({
  state,
  isActive,
}: {
  state: PromiseState;
  isActive: boolean;
}) {
  const cfg = stateConfig[state];
  const w = 110;
  const h = cfg.settled ? 45 : 35;
  return (
    <g>
      <rect
        x={cfg.x}
        y={cfg.y}
        width={w}
        height={h}
        rx={2}
        fill={isActive ? cfg.fillActive : cfg.fill}
        stroke={isActive ? cfg.strokeActive : cfg.stroke}
        strokeWidth={isActive ? 2 : 1}
      />
      <text
        x={cfg.x + w / 2}
        y={cfg.y + (cfg.settled ? 18 : h / 2 + 5)}
        textAnchor="middle"
        fontSize={12}
        fontFamily="var(--font-mono)"
        fontWeight={600}
        fill={isActive ? cfg.textActive : cfg.textColor}
      >
        {cfg.label}
      </text>
      {cfg.settled && (
        <text
          x={cfg.x + w / 2}
          y={cfg.y + 35}
          textAnchor="middle"
          fontSize={9}
          fill="var(--color-muted)"
        >
          settled
        </text>
      )}
    </g>
  );
}

function SvgArrow({
  type,
  isActive,
}: {
  type: "resolve" | "reject";
  isActive: boolean;
}) {
  const isResolve = type === "resolve";
  const activeColor = isResolve ? "#10b981" : "#ef4444";
  const color = isActive ? activeColor : "var(--color-border)";
  const textColor = isActive
    ? isResolve
      ? "#047857"
      : "#b91c1c"
    : "var(--color-muted)";

  const y1 = isResolve ? 75 : 90;
  const y2 = isResolve ? 35 : 140;
  const labelY = isResolve ? 48 : 128;

  return (
    <>
      <defs>
        <marker
          id={`arrow-${type}`}
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill={color} />
        </marker>
      </defs>
      <line
        x1={140}
        y1={y1}
        x2={225}
        y2={y2}
        stroke={color}
        strokeWidth={isActive ? 2 : 1}
        markerEnd={`url(#arrow-${type})`}
      />
      <text
        x={180}
        y={labelY}
        textAnchor="middle"
        fontSize={9}
        fontFamily="var(--font-mono)"
        fill={textColor}
      >
        {isResolve ? "resolve()" : "reject() / throw"}
      </text>
    </>
  );
}

export function PromiseStateMachine() {
  const stepNodes = steps.map((step, idx) => (
    <div key={idx}>
      <svg
        viewBox="0 0 360 175"
        className="w-full"
        style={{ maxHeight: 200 }}
      >
        <SvgArrow
          type="resolve"
          isActive={step.transition === "resolve"}
        />
        <SvgArrow
          type="reject"
          isActive={step.transition === "reject"}
        />
        <StateRect state="pending" isActive={step.active === "pending"} />
        <StateRect state="fulfilled" isActive={step.active === "fulfilled"} />
        <StateRect state="rejected" isActive={step.active === "rejected"} />
      </svg>

      <span className="mt-4 block border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </span>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
