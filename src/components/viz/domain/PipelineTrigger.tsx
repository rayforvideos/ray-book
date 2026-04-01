"use client";

import { StepPlayer } from "../primitives/StepPlayer";

/* ── Pipeline stages ── */

interface PipelineStage {
  id: string;
  label: string;
  color: string;
  activeColor: string;
}

const stages: PipelineStage[] = [
  {
    id: "style",
    label: "Style",
    color: "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border-stone-200 dark:border-stone-700",
    activeColor: "bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-600",
  },
  {
    id: "layout",
    label: "Layout",
    color: "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border-stone-200 dark:border-stone-700",
    activeColor: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-600",
  },
  {
    id: "paint",
    label: "Paint",
    color: "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border-stone-200 dark:border-stone-700",
    activeColor: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600",
  },
  {
    id: "raster",
    label: "Raster",
    color: "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border-stone-200 dark:border-stone-700",
    activeColor: "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-600",
  },
  {
    id: "composite",
    label: "Composite",
    color: "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border-stone-200 dark:border-stone-700",
    activeColor: "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-600",
  },
];

/* ── Preset definitions ── */

interface PresetData {
  property: string;
  code: string;
  activeStages: string[];
  description: string;
  triggerLabel: string;
}

const presets: Record<string, PresetData> = {
  "layout-change": {
    property: "width",
    code: "element.style.width = '200px';",
    activeStages: ["style", "layout", "paint", "raster", "composite"],
    description:
      "width 변경은 요소의 기하학적 크기를 바꾸므로 전체 파이프라인이 재실행됩니다. Layout부터 다시 시작해 이후 모든 단계를 거칩니다.",
    triggerLabel: "Geometry 변경 → 전체 재실행",
  },
  "paint-change": {
    property: "background-color",
    code: "element.style.backgroundColor = '#3b82f6';",
    activeStages: ["style", "paint", "raster", "composite"],
    description:
      "background-color 변경은 기하학에 영향을 주지 않으므로 Layout을 건너뜁니다. Paint부터 재실행되어 새 색상으로 다시 그립니다.",
    triggerLabel: "Paint-only 변경 → Layout 스킵",
  },
  "composite-change": {
    property: "transform",
    code: "element.style.transform = 'translateX(100px)';",
    activeStages: ["style", "composite"],
    description:
      "transform 변경은 이미 GPU에 업로드된 레이어의 변환 행렬만 수정합니다. Layout과 Paint를 모두 건너뛰고 합성만 재실행하므로 가장 빠릅니다.",
    triggerLabel: "Composite-only 변경 → Layout + Paint 스킵",
  },
};

/* ── Sub-components ── */

function PipelineRow({ activeStages }: { activeStages: string[] }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {stages.map((stage, idx) => {
        const isActive = activeStages.includes(stage.id);
        const cls = isActive ? stage.activeColor : stage.color;
        return (
          <div key={stage.id} className="flex items-center gap-1">
            <div
              className={`shrink-0 border px-2.5 py-1.5 text-center font-mono text-[0.6875rem] font-medium transition-colors ${cls}`}
            >
              {stage.label}
              {!isActive && (
                <span className="ml-1 text-[0.5625rem] opacity-60">SKIP</span>
              )}
            </div>
            {idx < stages.length - 1 && (
              <span
                className={`shrink-0 text-[0.625rem] ${
                  isActive && activeStages.includes(stages[idx + 1].id)
                    ? "text-text"
                    : "text-muted/30"
                }`}
              >
                →
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CodeSnippet({ code }: { code: string }) {
  return (
    <div className="bg-surface border border-border px-3 py-2 font-mono text-[0.75rem] text-text">
      {code}
    </div>
  );
}

/* ── Main component ── */

interface PipelineTriggerProps {
  preset?: string;
}

export function PipelineTrigger({ preset = "layout-change" }: PipelineTriggerProps) {
  const data = presets[preset] ?? presets["layout-change"];

  const stepNodes = [
    /* Step 1: Show the CSS property change */
    <div key="code" className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 font-mono text-[0.625rem] font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300">
          CSS 속성 변경
        </span>
        <span className="text-[0.6875rem] text-muted">
          {data.property} 속성이 변경됩니다
        </span>
      </div>

      <CodeSnippet code={data.code} />

      <div className="mb-1.5">
        <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
          렌더링 파이프라인 (변경 전)
        </span>
      </div>
      <PipelineRow activeStages={["style", "layout", "paint", "raster", "composite"]} />

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        위 코드가 실행되면 브라우저는 스타일 재계산부터 시작해 필요한 파이프라인 단계를 다시 실행합니다. 다음 단계에서 어떤 단계가 재실행되는지 확인하세요.
      </div>
    </div>,

    /* Step 2: Show which pipeline stages are triggered */
    <div key="pipeline" className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 font-mono text-[0.625rem] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
          {data.triggerLabel}
        </span>
      </div>

      <CodeSnippet code={data.code} />

      <div className="mb-1.5">
        <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
          재실행되는 파이프라인 단계
        </span>
      </div>
      <PipelineRow activeStages={data.activeStages} />

      <div className="bg-accent/10 px-3 py-1.5 font-mono text-[0.6875rem] text-accent">
        활성: {data.activeStages.length}단계 / 스킵: {5 - data.activeStages.length}단계
      </div>

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {data.description}
      </div>
    </div>,
  ];

  return <StepPlayer steps={stepNodes} />;
}
