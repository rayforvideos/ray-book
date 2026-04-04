"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ─── Types ─── */

interface Layer {
  id: string;
  label: string;
  color: "base" | "auth" | "logging" | "cache" | "active";
  code?: string;
}

interface Step {
  layers: Layer[];
  flowDirection: "inward" | "outward" | null;
  activeLayer: string | null;
  label: string;
  description: string;
  codeSnippet?: string;
}

/* ─── Layer Stack Renderer ─── */

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
  base: {
    bg: "fill-amber-50 dark:fill-amber-950",
    border: "stroke-amber-500 dark:stroke-amber-400",
    text: "fill-amber-800 dark:fill-amber-200",
  },
  auth: {
    bg: "fill-violet-50 dark:fill-violet-950",
    border: "stroke-violet-500 dark:stroke-violet-400",
    text: "fill-violet-800 dark:fill-violet-200",
  },
  logging: {
    bg: "fill-sky-50 dark:fill-sky-950",
    border: "stroke-sky-500 dark:stroke-sky-400",
    text: "fill-sky-800 dark:fill-sky-200",
  },
  cache: {
    bg: "fill-emerald-50 dark:fill-emerald-950",
    border: "stroke-emerald-500 dark:stroke-emerald-400",
    text: "fill-emerald-800 dark:fill-emerald-200",
  },
  active: {
    bg: "fill-rose-50 dark:fill-rose-950",
    border: "stroke-rose-500 dark:stroke-rose-400",
    text: "fill-rose-800 dark:fill-rose-200",
  },
};

function LayerStack({ layers, activeLayer, flowDirection }: {
  layers: Layer[];
  activeLayer: string | null;
  flowDirection: "inward" | "outward" | null;
}) {
  const centerX = 200;
  const centerY = 110;
  const baseW = 100;
  const baseH = 36;
  const layerPad = 24;

  return (
    <svg viewBox="0 0 400 220" className="w-full" style={{ maxHeight: 220 }}>
      <defs>
        <marker id="dec-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" className="fill-rose-500 dark:fill-rose-400" />
        </marker>
      </defs>

      {/* Draw layers from outermost to innermost */}
      {[...layers].reverse().map((layer, revIdx) => {
        const idx = layers.length - 1 - revIdx;
        const w = baseW + layerPad * 2 * idx;
        const h = baseH + layerPad * idx;
        const isActive = layer.id === activeLayer;
        const style = isActive ? colorMap.active : colorMap[layer.color];

        return (
          <g key={layer.id}>
            <rect
              x={centerX - w / 2}
              y={centerY - h / 2}
              width={w}
              height={h}
              rx={8}
              className={`${style.bg} ${style.border} stroke-[1.5] transition-all duration-300`}
              opacity={isActive ? 1 : activeLayer ? 0.4 : 0.8}
            />
            <text
              x={centerX - w / 2 + 10}
              y={centerY - h / 2 + 14}
              className={`${style.text} text-[0.55rem] font-bold transition-all duration-300`}
              opacity={isActive ? 1 : activeLayer ? 0.5 : 1}
            >
              {layer.label}
            </text>
            {layer.code && (
              <text
                x={centerX - w / 2 + 10}
                y={centerY - h / 2 + 26}
                className="fill-muted text-[0.4rem] font-mono"
                opacity={isActive ? 1 : 0.4}
              >
                {layer.code}
              </text>
            )}
          </g>
        );
      })}

      {/* Flow arrow */}
      {flowDirection && (
        <g>
          <line
            x1={flowDirection === "inward" ? 30 : centerX}
            y1={centerY}
            x2={flowDirection === "inward" ? centerX - baseW / 2 - 4 : 370}
            y2={centerY}
            className="stroke-rose-500 dark:stroke-rose-400 stroke-[1.5]"
            markerEnd="url(#dec-arrow)"
            strokeDasharray="6 3"
          />
          <text
            x={flowDirection === "inward" ? 20 : 372}
            y={centerY - 8}
            className="fill-rose-600 dark:fill-rose-400 text-[0.5rem] font-bold"
            textAnchor={flowDirection === "inward" ? "start" : "end"}
          >
            {flowDirection === "inward" ? "request →" : "← response"}
          </text>
        </g>
      )}
    </svg>
  );
}

/* ─── Legend ─── */

function Legend() {
  const items = [
    { color: "bg-amber-400", label: "원본 함수" },
    { color: "bg-violet-400", label: "인증 데코레이터" },
    { color: "bg-sky-400", label: "로깅 데코레이터" },
    { color: "bg-emerald-400", label: "캐시 데코레이터" },
    { color: "bg-rose-400", label: "현재 실행 중" },
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

/* ─── Steps: Function Wrapping ─── */

const wrapSteps: Step[] = [
  {
    layers: [
      { id: "base", label: "fetchUser(id)", color: "base", code: "fetch(`/api/users/${id}`)" },
    ],
    activeLayer: "base",
    flowDirection: null,
    label: "원본 함수",
    description: "원본 함수 fetchUser(id)가 있습니다. API를 호출해서 사용자 정보를 반환합니다. 이 함수에 인증, 로깅, 캐싱 기능을 추가해야 합니다.",
    codeSnippet: "async function fetchUser(id) {\n  const res = await fetch(`/api/users/${id}`);\n  return res.json();\n}",
  },
  {
    layers: [
      { id: "base", label: "fetchUser(id)", color: "base" },
      { id: "auth", label: "withAuth", color: "auth", code: "토큰 검증 → 원본 호출" },
    ],
    activeLayer: "auth",
    flowDirection: null,
    label: "1단계: 인증 감싸기",
    description: "withAuth 데코레이터로 감쌉니다. 요청 전에 토큰을 확인하고, 유효하면 원본 함수를 호출합니다. 원본 함수는 전혀 수정되지 않습니다.",
    codeSnippet: "function withAuth(fn) {\n  return async (...args) => {\n    if (!getToken()) throw new Error('Unauthorized');\n    return fn(...args); // 원본 호출\n  };\n}",
  },
  {
    layers: [
      { id: "base", label: "fetchUser(id)", color: "base" },
      { id: "auth", label: "withAuth", color: "auth" },
      { id: "logging", label: "withLogging", color: "logging", code: "시작 로그 → 원본 → 종료 로그" },
    ],
    activeLayer: "logging",
    flowDirection: null,
    label: "2단계: 로깅 감싸기",
    description: "withLogging 데코레이터를 한 겹 더 감쌉니다. 호출 전후로 로그를 남깁니다. 레이어가 하나씩 쌓이는 것을 확인하세요.",
    codeSnippet: "function withLogging(fn) {\n  return async (...args) => {\n    console.log(`호출: ${fn.name}`, args);\n    const result = await fn(...args);\n    console.log(`완료: ${fn.name}`, result);\n    return result;\n  };\n}",
  },
  {
    layers: [
      { id: "base", label: "fetchUser(id)", color: "base" },
      { id: "auth", label: "withAuth", color: "auth" },
      { id: "logging", label: "withLogging", color: "logging" },
      { id: "cache", label: "withCache", color: "cache", code: "캐시 확인 → 없으면 원본 → 캐시 저장" },
    ],
    activeLayer: "cache",
    flowDirection: null,
    label: "3단계: 캐싱 감싸기",
    description: "withCache 데코레이터를 추가합니다. 이미 캐시된 결과가 있으면 원본 함수를 호출하지 않고 즉시 반환합니다. 3겹의 데코레이터가 원본을 감싸고 있습니다.",
    codeSnippet: "function withCache(fn) {\n  const cache = new Map();\n  return async (...args) => {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key);\n    const result = await fn(...args);\n    cache.set(key, result);\n    return result;\n  };\n}",
  },
  {
    layers: [
      { id: "base", label: "fetchUser(id)", color: "base" },
      { id: "auth", label: "withAuth", color: "auth" },
      { id: "logging", label: "withLogging", color: "logging" },
      { id: "cache", label: "withCache", color: "cache" },
    ],
    activeLayer: null,
    flowDirection: null,
    label: "조합 완성",
    description: "세 데코레이터를 합성합니다. 요청이 바깥(캐시)부터 안쪽(원본)으로 통과합니다. 각 레이어는 독립적이므로 순서를 바꾸거나 빼는 것도 자유롭습니다.",
    codeSnippet: "// 데코레이터 합성 — 바깥부터 실행\nconst enhancedFetch = withCache(\n  withLogging(\n    withAuth(fetchUser)\n  )\n);\n\n// 한 줄로 호출\nconst user = await enhancedFetch(42);",
  },
  {
    layers: [
      { id: "base", label: "fetchUser(id)", color: "base" },
      { id: "auth", label: "withAuth ✓", color: "auth" },
      { id: "logging", label: "withLogging 📝", color: "logging" },
      { id: "cache", label: "withCache 🔍", color: "cache" },
    ],
    activeLayer: "cache",
    flowDirection: "inward",
    label: "요청 흐름: 바깥 → 안쪽",
    description: "enhancedFetch(42) 호출 시 실행 순서: ① withCache가 캐시를 확인합니다 (miss) → ② withLogging이 시작 로그를 남깁니다 → ③ withAuth가 토큰을 검증합니다 → ④ fetchUser가 API를 호출합니다.",
    codeSnippet: "enhancedFetch(42);\n// 1. withCache: 캐시에 42 있나? → 없음\n// 2. withLogging: '호출: fetchUser [42]'\n// 3. withAuth: 토큰 유효? → OK\n// 4. fetchUser: fetch('/api/users/42')",
  },
];

/* ─── Presets ─── */

const presets: Record<string, Step[]> = {
  wrap: wrapSteps,
};

/* ─── Main Component ─── */

interface DecoratorPatternProps {
  preset?: string;
}

export function DecoratorPattern({ preset = "wrap" }: DecoratorPatternProps) {
  const steps = presets[preset] ?? presets["wrap"];

  const stepNodes = steps.map((step, idx) => (
    <div key={idx} className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-bold text-accent">{step.label}</span>
        <span className="text-[0.6875rem] text-muted">{idx + 1} / {steps.length}</span>
      </div>

      <LayerStack
        layers={step.layers}
        activeLayer={step.activeLayer}
        flowDirection={step.flowDirection}
      />

      <Legend />

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
