"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ── Pipeline stages ── */

interface Stage {
  id: string;
  label: string;
  inactive: string;
  active: string;
}

const stages: Stage[] = [
  {
    id: "layout",
    label: "Layout",
    inactive:
      "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border-stone-200 dark:border-stone-700",
    active:
      "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-600",
  },
  {
    id: "paint",
    label: "Paint",
    inactive:
      "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border-stone-200 dark:border-stone-700",
    active:
      "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600",
  },
  {
    id: "composite",
    label: "Composite",
    inactive:
      "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border-stone-200 dark:border-stone-700",
    active:
      "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-600",
  },
];

/* ── Presets ── */

interface Preset {
  title: string;
  property: string;
  code: string;
  activeStages: string[];
  description: string;
  warn?: boolean;
}

const presets: Preset[] = [
  {
    title: "Full pipeline — width/height 변경",
    property: "width",
    code: "element.style.width = '300px';",
    activeStages: ["layout", "paint", "composite"],
    description:
      "width, height, margin, padding 등 기하학적 속성을 변경하면 Layout부터 전체 파이프라인이 재실행됩니다. 가장 비용이 높은 경로입니다.",
  },
  {
    title: "Skip Layout — color/background 변경",
    property: "background-color",
    code: "element.style.backgroundColor = '#3b82f6';",
    activeStages: ["paint", "composite"],
    description:
      "color, background-color, box-shadow 등 시각적 속성만 변경하면 Layout을 건너뜁니다. 기하학이 바뀌지 않으므로 Paint부터 시작합니다.",
  },
  {
    title: "Composite only — transform/opacity 변경",
    property: "transform",
    code: "element.style.transform = 'translateX(100px)';",
    activeStages: ["composite"],
    description:
      "transform과 opacity는 GPU 레이어에서 직접 처리됩니다. Layout과 Paint를 모두 건너뛰므로 가장 저렴하고 60fps 애니메이션에 이상적입니다.",
  },
  {
    title: "Layout Thrashing — 강제 동기 레이아웃",
    property: "offsetHeight (read)",
    code: `// ❌ Layout thrashing
for (const el of elements) {
  el.style.width = box.offsetWidth + 'px'; // read → write 반복
}`,
    activeStages: ["layout", "paint", "composite"],
    description:
      "DOM을 쓰고 바로 읽으면 브라우저가 보류 중인 레이아웃을 강제로 실행합니다. 루프 안에서 반복되면 한 프레임 안에 수십 번 레이아웃이 발생합니다.",
    warn: true,
  },
];

/* ── Sub-components ── */

function PipelineRow({ activeStages }: { activeStages: string[] }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto">
      {stages.map((stage, idx) => {
        const isActive = activeStages.includes(stage.id);
        const cls = isActive ? stage.active : stage.inactive;
        return (
          <div key={stage.id} className="flex items-center gap-1.5">
            <div
              className={`shrink-0 border px-3 py-2 text-center font-mono text-[0.75rem] font-medium transition-colors ${cls}`}
            >
              {stage.label}
              {!isActive && (
                <span className="ml-1.5 text-[0.625rem] opacity-60">
                  SKIP
                </span>
              )}
            </div>
            {idx < stages.length - 1 && (
              <span
                className={`shrink-0 text-[0.75rem] ${
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

function CostBar({ count, total }: { count: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[0.6875rem] text-muted shrink-0">비용</span>
      <div className="flex gap-0.5">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`h-2 w-5 ${
              i < count
                ? "bg-accent/70"
                : "bg-stone-200 dark:bg-stone-700"
            }`}
          />
        ))}
      </div>
      <span className="text-[0.6875rem] text-muted">
        {count}/{total} 단계
      </span>
    </div>
  );
}

/* ── Main ── */

export function RenderingPipelineOpt() {
  const stepNodes = presets.map((p, i) => (
    <div key={i} className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`px-2 py-0.5 font-mono text-[0.625rem] font-bold ${
            p.warn
              ? "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300"
              : "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300"
          }`}
        >
          Step {i + 1}
        </span>
        <span className="text-[0.8125rem] font-medium text-text">
          {p.title}
        </span>
      </div>

      <div className="bg-surface border border-border px-3 py-2 font-mono text-[0.75rem] text-text overflow-x-auto whitespace-pre">
        {p.code}
      </div>

      <PipelineRow activeStages={p.activeStages} />
      <CostBar count={p.activeStages.length} total={3} />

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {p.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
