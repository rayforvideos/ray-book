"use client";

import { StepPlayer } from "../primitives/StepPlayer";

type CompositePhase =
  | "paint-result"
  | "promotion-scan"
  | "layer-split"
  | "gpu-upload"
  | "composite"
  | "composite-only";

interface LayerInfo {
  id: string;
  label: string;
  color: string;
  promoted: boolean;
  zOffset: number;
  properties?: string[];
}

interface CompositeStep {
  phase: CompositePhase;
  layers: LayerInfo[];
  highlight?: string;
  description: string;
}

interface PresetData {
  steps: CompositeStep[];
}

const phaseStyles: Record<CompositePhase, { bg: string; text: string; label: string }> = {
  "paint-result": {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    text: "text-sky-700 dark:text-sky-300",
    label: "페인트 결과",
  },
  "promotion-scan": {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    label: "승격 조건 탐색",
  },
  "layer-split": {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    label: "레이어 분리",
  },
  "gpu-upload": {
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-700 dark:text-violet-300",
    label: "GPU 업로드",
  },
  composite: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    label: "합성",
  },
  "composite-only": {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    label: "합성만 재실행",
  },
};

/* ── Preset data ── */

const singleLayer: LayerInfo[] = [
  {
    id: "root",
    label: "루트 레이어 (전체 페이지)",
    color: "sky",
    promoted: false,
    zOffset: 0,
    properties: ["body", ".container", "h1", "p", ".sidebar", ".card"],
  },
];

const scanLayers: LayerInfo[] = [
  {
    id: "root",
    label: "루트 레이어",
    color: "sky",
    promoted: false,
    zOffset: 0,
    properties: ["body", ".container", "h1", "p"],
  },
  {
    id: "card",
    label: ".card — transform: rotate(2deg)",
    color: "amber",
    promoted: false,
    zOffset: 0,
    properties: ["transform: rotate(2deg)", "→ 승격 대상!"],
  },
  {
    id: "sidebar",
    label: ".sidebar — will-change: transform",
    color: "emerald",
    promoted: false,
    zOffset: 0,
    properties: ["will-change: transform", "→ 승격 대상!"],
  },
];

const splitLayers: LayerInfo[] = [
  {
    id: "root",
    label: "루트 레이어",
    color: "sky",
    promoted: false,
    zOffset: 0,
    properties: ["body", ".container", "h1", "p"],
  },
  {
    id: "card",
    label: ".card 레이어",
    color: "amber",
    promoted: true,
    zOffset: 1,
    properties: ["transform: rotate(2deg)"],
  },
  {
    id: "sidebar",
    label: ".sidebar 레이어",
    color: "emerald",
    promoted: true,
    zOffset: 2,
    properties: ["will-change: transform"],
  },
];

const gpuLayers: LayerInfo[] = [
  {
    id: "root",
    label: "루트 레이어 → GPU 텍스처 #1",
    color: "sky",
    promoted: false,
    zOffset: 0,
    properties: ["래스터라이즈 → 비트맵 → GPU 메모리"],
  },
  {
    id: "card",
    label: ".card 레이어 → GPU 텍스처 #2",
    color: "amber",
    promoted: true,
    zOffset: 1,
    properties: ["래스터라이즈 → 비트맵 → GPU 메모리"],
  },
  {
    id: "sidebar",
    label: ".sidebar 레이어 → GPU 텍스처 #3",
    color: "emerald",
    promoted: true,
    zOffset: 2,
    properties: ["래스터라이즈 → 비트맵 → GPU 메모리"],
  },
];

const compositedLayers: LayerInfo[] = [
  {
    id: "root",
    label: "루트 레이어",
    color: "sky",
    promoted: false,
    zOffset: 0,
  },
  {
    id: "card",
    label: ".card 레이어",
    color: "amber",
    promoted: true,
    zOffset: 0,
  },
  {
    id: "sidebar",
    label: ".sidebar 레이어",
    color: "emerald",
    promoted: true,
    zOffset: 0,
  },
];

const compositeOnlyLayers: LayerInfo[] = [
  {
    id: "root",
    label: "루트 레이어 (변경 없음)",
    color: "sky",
    promoted: false,
    zOffset: 0,
  },
  {
    id: "card",
    label: ".card — transform 변경! (합성만)",
    color: "amber",
    promoted: true,
    zOffset: 0,
    properties: ["transform: rotate(5deg)", "메인 스레드 미사용"],
  },
  {
    id: "sidebar",
    label: ".sidebar (변경 없음)",
    color: "emerald",
    promoted: true,
    zOffset: 0,
  },
];

const presets: Record<string, PresetData> = {
  basic: {
    steps: [
      {
        phase: "paint-result",
        layers: singleLayer,
        description:
          "페인트 단계가 완료되어 모든 요소가 하나의 레이어에 그려져 있습니다. 아직 레이어 분리가 이루어지지 않은 상태입니다. 브라우저는 이제 어떤 요소를 별도 레이어로 분리할지 판단합니다.",
      },
      {
        phase: "promotion-scan",
        layers: scanLayers,
        highlight:
          "승격 조건: transform, opacity, will-change, position:fixed, video, canvas",
        description:
          "브라우저가 레이어 승격 조건에 해당하는 요소를 탐색합니다. transform이 none이 아니거나, will-change가 설정되어 있거나, opacity 애니메이션이 있거나, position:fixed, <video>, <canvas> 등의 요소가 승격 후보입니다.",
      },
      {
        phase: "layer-split",
        layers: splitLayers,
        highlight: "각 레이어는 독립적으로 래스터라이즈 및 합성 가능",
        description:
          "승격 조건에 해당하는 요소가 별도 레이어로 분리됩니다. 각 레이어는 자체 페인트 레코드와 비트맵을 가지며, 독립적으로 업데이트할 수 있습니다. 위 시각화에서 레이어가 z축으로 분리되는 것을 확인하세요.",
      },
      {
        phase: "gpu-upload",
        layers: gpuLayers,
        highlight: "각 레이어의 비트맵이 GPU 메모리(VRAM)에 텍스처로 업로드",
        description:
          "분리된 각 레이어는 래스터라이즈되어 비트맵으로 변환된 후, GPU 메모리에 텍스처로 업로드됩니다. GPU는 이 텍스처들을 빠르게 합성할 수 있습니다. 이 업로드 과정은 비용이 있으므로, 불필요한 레이어 승격은 피해야 합니다.",
      },
      {
        phase: "composite",
        layers: compositedLayers,
        highlight: "합성 스레드가 GPU 텍스처를 z-order에 따라 합성 → 최종 프레임",
        description:
          "합성 스레드(compositor thread)가 GPU에 있는 텍스처들을 올바른 순서로 합칩니다. transform, opacity, clip 등을 적용하여 최종 프레임을 만듭니다. 이 과정은 메인 스레드와 독립적으로 실행되므로, JavaScript 실행이 느려도 합성은 부드럽게 진행됩니다.",
      },
      {
        phase: "composite-only",
        layers: compositeOnlyLayers,
        highlight:
          "transform/opacity 변경 → Layout, Paint 스킵 → 합성만 재실행",
        description:
          "transform이나 opacity만 변경되면 레이아웃과 페인트를 건너뛰고 합성만 다시 실행합니다. GPU에 이미 업로드된 텍스처의 변환 행렬만 업데이트하면 되므로 매우 빠릅니다. 이것이 CSS 애니메이션에서 transform과 opacity를 권장하는 이유입니다.",
      },
    ],
  },
};

/* ── Color mapping ── */

const colorMap: Record<string, { bg: string; border: string; text: string; fill: string; fillLight: string }> = {
  sky: {
    bg: "bg-sky-100 dark:bg-sky-900/40",
    border: "border-sky-300 dark:border-sky-700",
    text: "text-sky-700 dark:text-sky-300",
    fill: "rgba(14, 165, 233, 0.6)",
    fillLight: "rgba(14, 165, 233, 0.15)",
  },
  amber: {
    bg: "bg-amber-100 dark:bg-amber-900/40",
    border: "border-amber-300 dark:border-amber-700",
    text: "text-amber-700 dark:text-amber-300",
    fill: "rgba(245, 158, 11, 0.6)",
    fillLight: "rgba(245, 158, 11, 0.15)",
  },
  emerald: {
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
    border: "border-emerald-300 dark:border-emerald-700",
    text: "text-emerald-700 dark:text-emerald-300",
    fill: "rgba(16, 185, 129, 0.6)",
    fillLight: "rgba(16, 185, 129, 0.15)",
  },
  violet: {
    bg: "bg-violet-100 dark:bg-violet-900/40",
    border: "border-violet-300 dark:border-violet-700",
    text: "text-violet-700 dark:text-violet-300",
    fill: "rgba(139, 92, 246, 0.6)",
    fillLight: "rgba(139, 92, 246, 0.15)",
  },
};

/* ── Sub-components ── */

function LayerStack({ layers }: { layers: LayerInfo[] }) {
  const W = 280;
  const H = 200;
  const LAYER_W = 180;
  const LAYER_H = 40;
  const Z_STEP = 35;

  const hasSpread = layers.some((l) => l.zOffset > 0);

  return (
    <div className="flex-1 min-w-0">
      <div className="mb-1.5">
        <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
          레이어 스택
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-[300px] h-auto"
        role="img"
        aria-label="합성 레이어 스택 시각화"
      >
        {/* Render layers from back to front */}
        {[...layers].reverse().map((layer) => {
          const cm = colorMap[layer.color] ?? colorMap.sky;
          const baseX = (W - LAYER_W) / 2;
          const yOffset = hasSpread ? layer.zOffset * Z_STEP : 0;
          const baseY = H - LAYER_H - 20 - yOffset;
          /* Isometric shift for depth effect */
          const isoX = hasSpread ? layer.zOffset * 12 : 0;
          const x = baseX - isoX;
          const y = baseY;

          return (
            <g key={layer.id}>
              {/* Shadow for promoted layers */}
              {layer.promoted && hasSpread && (
                <rect
                  x={x + 3}
                  y={y + 3}
                  width={LAYER_W}
                  height={LAYER_H}
                  fill="rgba(0,0,0,0.1)"
                  rx={4}
                />
              )}
              {/* Layer rect */}
              <rect
                x={x}
                y={y}
                width={LAYER_W}
                height={LAYER_H}
                fill={layer.promoted ? cm.fill : cm.fillLight}
                stroke={layer.promoted ? cm.fill : "rgba(120,113,108,0.3)"}
                strokeWidth={layer.promoted ? 2 : 1}
                rx={4}
              />
              {/* Label */}
              <text
                x={x + LAYER_W / 2}
                y={y + LAYER_H / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-current text-text"
                fontSize={10}
                fontFamily="ui-monospace, monospace"
              >
                {layer.id}
              </text>
              {/* Promoted badge */}
              {layer.promoted && (
                <text
                  x={x + LAYER_W - 4}
                  y={y + 10}
                  textAnchor="end"
                  fontSize={7}
                  fontFamily="ui-monospace, monospace"
                  className="fill-current"
                  style={{ fill: cm.fill.replace("0.6", "1") }}
                >
                  GPU
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function LayerDetails({ layers }: { layers: LayerInfo[] }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="mb-1.5">
        <span className="text-[0.6875rem] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          레이어 목록
        </span>
      </div>
      <div className="space-y-1.5">
        {layers.map((layer) => {
          const cm = colorMap[layer.color] ?? colorMap.sky;
          return (
            <div key={layer.id} className="flex items-start gap-1.5">
              <span
                className={`shrink-0 inline-block px-1.5 py-px text-[0.625rem] font-mono border ${cm.bg} ${cm.text} ${cm.border}`}
              >
                {layer.id}
              </span>
              <div className="min-w-0">
                <span className="text-[0.625rem] font-mono text-text block">
                  {layer.label}
                </span>
                {layer.properties && (
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {layer.properties.map((prop, i) => (
                      <span
                        key={i}
                        className="text-[0.5625rem] font-mono text-muted bg-surface px-1 py-px border border-border"
                      >
                        {prop}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main component ── */

interface CompositorLayersProps {
  preset?: string;
}

export function CompositorLayers({ preset = "basic" }: CompositorLayersProps) {
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

        <div className="flex gap-4 max-sm:flex-col">
          {/* Left: layer details */}
          <LayerDetails layers={step.layers} />

          {/* Right: layer stack visualization */}
          <LayerStack layers={step.layers} />
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
