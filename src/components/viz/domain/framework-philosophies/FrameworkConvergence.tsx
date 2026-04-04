"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ─── Types ─── */

interface CirclePos {
  cx: number;
  cy: number;
  r: number;
  color: string;
  label: string;
}

interface Step {
  label: string;
  description: string;
  circles: CirclePos[];
  showCore?: boolean;
  coreLabel?: string;
}

/* ─── Framework Colors (SVG fills) ─── */

const COLORS = {
  react: { fill: "rgba(56, 189, 248, 0.2)", stroke: "#38bdf8", text: "#0ea5e9" },
  vue: { fill: "rgba(52, 211, 153, 0.2)", stroke: "#34d399", text: "#10b981" },
  angular: { fill: "rgba(251, 113, 133, 0.2)", stroke: "#fb7185", text: "#f43f5e" },
  svelte: { fill: "rgba(251, 146, 60, 0.2)", stroke: "#fb923c", text: "#f97316" },
};

/* ─── Step Data ─── */

const STEPS: Step[] = [
  {
    label: "과거: 4개의 섬",
    description:
      "각 프레임워크는 독자적인 철학으로 출발했습니다. React는 VDOM, Vue는 반응성, Angular는 엔터프라이즈 풀스택, Svelte는 컴파일러 — 서로 교집합이 거의 없었습니다.",
    circles: [
      { cx: 90, cy: 80, r: 52, color: "react", label: "React" },
      { cx: 260, cy: 80, r: 52, color: "vue", label: "Vue" },
      { cx: 90, cy: 210, r: 52, color: "angular", label: "Angular" },
      { cx: 260, cy: 210, r: 52, color: "svelte", label: "Svelte" },
    ],
  },
  {
    label: "Signals 수렴",
    description:
      "세밀한 반응성 (Signals) 이 표준이 되고 있습니다. Vue의 ref()는 이미 시그널이었고, Angular는 signal()을 공식 도입했으며, Svelte 5의 $state(runes)는 시그널의 컴파일러 추상화입니다. TC39에서 Signals 표준 제안이 Stage 1에 진입했습니다.",
    circles: [
      { cx: 120, cy: 100, r: 52, color: "react", label: "React" },
      { cx: 230, cy: 100, r: 52, color: "vue", label: "Vue" },
      { cx: 120, cy: 195, r: 52, color: "angular", label: "Angular" },
      { cx: 230, cy: 195, r: 52, color: "svelte", label: "Svelte" },
    ],
  },
  {
    label: "서버 렌더링 수렴",
    description:
      "모든 프레임워크가 서버 렌더링을 핵심으로 삼고 있습니다. React Server Components, Nuxt Server Components, Angular SSR (hydration 개선), SvelteKit — 서버와 클라이언트의 경계가 흐려지고 있습니다.",
    circles: [
      { cx: 140, cy: 115, r: 52, color: "react", label: "React" },
      { cx: 215, cy: 115, r: 52, color: "vue", label: "Vue" },
      { cx: 140, cy: 185, r: 52, color: "angular", label: "Angular" },
      { cx: 215, cy: 185, r: 52, color: "svelte", label: "Svelte" },
    ],
  },
  {
    label: "컴파일러 수렴",
    description:
      "컴파일러가 프레임워크의 핵심이 되고 있습니다. React Compiler (자동 메모이제이션, v1.0 출시), Vue Vapor (VDOM 제거), Angular AOT + Ivy, Svelte 컴파일러 — 모두 빌드 타임에 더 많은 일을 하려 합니다.",
    circles: [
      { cx: 150, cy: 125, r: 52, color: "react", label: "React" },
      { cx: 205, cy: 125, r: 52, color: "vue", label: "Vue" },
      { cx: 150, cy: 175, r: 52, color: "angular", label: "Angular" },
      { cx: 205, cy: 175, r: 52, color: "svelte", label: "Svelte" },
    ],
  },
  {
    label: "공통의 핵심",
    description:
      "네 프레임워크가 수렴하는 지점: 선언적 UI, 컴포넌트 기반, 반응성, 단방향 데이터 흐름. 구현 방식은 달라도 풀려는 문제와 도달하는 답은 점점 비슷해지고 있습니다.",
    circles: [
      { cx: 155, cy: 130, r: 52, color: "react", label: "React" },
      { cx: 200, cy: 130, r: 52, color: "vue", label: "Vue" },
      { cx: 155, cy: 170, r: 52, color: "angular", label: "Angular" },
      { cx: 200, cy: 170, r: 52, color: "svelte", label: "Svelte" },
    ],
    showCore: true,
    coreLabel: "선언적 UI · 컴포넌트 · 반응성 · 단방향 흐름",
  },
];

/* ─── Venn Diagram ─── */

function VennDiagram({ step }: { step: Step }) {
  return (
    <svg viewBox="0 0 350 290" className="w-full max-w-[350px] mx-auto">
      {step.circles.map((c) => {
        const col = COLORS[c.color as keyof typeof COLORS];
        return (
          <g key={c.label}>
            <circle
              cx={c.cx}
              cy={c.cy}
              r={c.r}
              fill={col.fill}
              stroke={col.stroke}
              strokeWidth={1.5}
              className="transition-all duration-500"
            />
            <text
              x={c.cx}
              y={c.cy + 4}
              textAnchor="middle"
              fill={col.text}
              fontSize={12}
              fontWeight={700}
              className="transition-all duration-500"
            >
              {c.label}
            </text>
          </g>
        );
      })}
      {step.showCore && (
        <text
          x={177}
          y={265}
          textAnchor="middle"
          fontSize={10}
          fontWeight={600}
          className="fill-accent"
        >
          {step.coreLabel}
        </text>
      )}
    </svg>
  );
}

/* ─── Main Component ─── */

export function FrameworkConvergence() {
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

      {/* Venn Diagram */}
      <VennDiagram step={step} />

      {/* Description */}
      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
