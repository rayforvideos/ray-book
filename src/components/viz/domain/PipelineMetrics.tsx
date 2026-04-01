"use client";

import { StepPlayer } from "../primitives/StepPlayer";

/* ── Pipeline stages ── */

interface PipelineStage {
  id: string;
  label: string;
  inactiveColor: string;
  activeColor: string;
}

const stages: PipelineStage[] = [
  {
    id: "style",
    label: "Style",
    inactiveColor: "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border-stone-200 dark:border-stone-700",
    activeColor: "bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-600",
  },
  {
    id: "layout",
    label: "Layout",
    inactiveColor: "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border-stone-200 dark:border-stone-700",
    activeColor: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-600",
  },
  {
    id: "paint",
    label: "Paint",
    inactiveColor: "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border-stone-200 dark:border-stone-700",
    activeColor: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600",
  },
  {
    id: "raster",
    label: "Raster",
    inactiveColor: "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border-stone-200 dark:border-stone-700",
    activeColor: "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-600",
  },
  {
    id: "composite",
    label: "Composite",
    inactiveColor: "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border-stone-200 dark:border-stone-700",
    activeColor: "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-600",
  },
];

/* ── Additional stages for INP (event handling before pipeline) ── */

const eventStage: PipelineStage = {
  id: "event",
  label: "Event",
  inactiveColor: "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border-stone-200 dark:border-stone-700",
  activeColor: "bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-600",
};

/* ── Web Vital definitions ── */

interface WebVital {
  id: string;
  label: string;
  fullName: string;
  color: string;
  badgeColor: string;
  stages: string[];
  description: string;
  good: string;
  needsImprovement: string;
  poor: string;
}

const webVitals: WebVital[] = [
  {
    id: "lcp",
    label: "LCP",
    fullName: "Largest Contentful Paint",
    color: "bg-emerald-500/20 dark:bg-emerald-500/10 border-emerald-400 dark:border-emerald-600",
    badgeColor: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
    stages: ["style", "layout", "paint"],
    description: "가장 큰 콘텐츠 요소가 화면에 렌더링되기까지의 시간. 파싱 → 스타일 계산 → 레이아웃 → 페인트 단계가 관여합니다.",
    good: "≤ 2.5s",
    needsImprovement: "≤ 4s",
    poor: "> 4s",
  },
  {
    id: "cls",
    label: "CLS",
    fullName: "Cumulative Layout Shift",
    color: "bg-amber-500/20 dark:bg-amber-500/10 border-amber-400 dark:border-amber-600",
    badgeColor: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300",
    stages: ["layout"],
    description: "페이지 로드 중 예상치 못한 레이아웃 이동의 누적 점수. Layout 단계에서 요소 위치가 변경될 때 발생합니다.",
    good: "≤ 0.1",
    needsImprovement: "≤ 0.25",
    poor: "> 0.25",
  },
  {
    id: "inp",
    label: "INP",
    fullName: "Interaction to Next Paint",
    color: "bg-violet-500/20 dark:bg-violet-500/10 border-violet-400 dark:border-violet-600",
    badgeColor: "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300",
    stages: ["event", "style", "layout", "paint", "raster", "composite"],
    description: "사용자 인터랙션(클릭, 탭, 키 입력)부터 다음 프레임이 화면에 표시되기까지의 시간. 이벤트 처리 → 전체 파이프라인이 관여합니다.",
    good: "≤ 200ms",
    needsImprovement: "≤ 500ms",
    poor: "> 500ms",
  },
];

/* ── Sub-components ── */

function PipelineRow({
  activeStages,
  includeEvent = false,
  overlayColor,
}: {
  activeStages: string[];
  includeEvent?: boolean;
  overlayColor?: string;
}) {
  const allStages = includeEvent ? [eventStage, ...stages] : stages;

  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {allStages.map((stage, idx) => {
        const isActive = activeStages.includes(stage.id);
        const cls = isActive ? stage.activeColor : stage.inactiveColor;
        return (
          <div key={stage.id} className="flex items-center gap-1">
            <div
              className={`relative shrink-0 border px-2.5 py-1.5 text-center font-mono text-[0.6875rem] font-medium transition-colors ${cls}`}
            >
              {stage.label}
              {isActive && overlayColor && (
                <div
                  className={`absolute inset-0 border-2 ${overlayColor} pointer-events-none`}
                />
              )}
            </div>
            {idx < allStages.length - 1 && (
              <span
                className={`shrink-0 text-[0.625rem] ${
                  isActive && activeStages.includes(allStages[idx + 1].id)
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

function ThresholdBar({ vital }: { vital: WebVital }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-[0.6875rem]">
        <span className={`px-1.5 py-0.5 font-mono font-bold ${vital.badgeColor}`}>
          {vital.label}
        </span>
        <span className="text-muted">{vital.fullName}</span>
      </div>
      <div className="flex h-6 overflow-hidden font-mono text-[0.625rem]">
        <div className="flex flex-1 items-center justify-center bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-r border-emerald-300 dark:border-emerald-600">
          좋음 {vital.good}
        </div>
        <div className="flex flex-1 items-center justify-center bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-r border-amber-300 dark:border-amber-600">
          개선 필요 {vital.needsImprovement}
        </div>
        <div className="flex flex-1 items-center justify-center bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300">
          나쁨 {vital.poor}
        </div>
      </div>
    </div>
  );
}

/* ── Main component ── */

interface PipelineMetricsProps {
  preset?: string;
}

export function PipelineMetrics({ preset = "basic" }: PipelineMetricsProps) {
  void preset; // reserved for future presets

  const stepNodes = [
    /* Step 1: Pipeline overview */
    <div key="overview" className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 font-mono text-[0.625rem] font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300">
          전체 파이프라인
        </span>
        <span className="text-[0.6875rem] text-muted">
          렌더링 파이프라인과 Core Web Vitals의 관계
        </span>
      </div>

      <div className="mb-1.5">
        <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
          브라우저 렌더링 파이프라인
        </span>
      </div>
      <PipelineRow activeStages={["style", "layout", "paint", "raster", "composite"]} />

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        브라우저는 Style → Layout → Paint → Raster → Composite 파이프라인을 거쳐 화면을 그립니다.
        Core Web Vitals (LCP, CLS, INP) 는 이 파이프라인의 서로 다른 구간을 측정합니다. 다음 단계에서 각 지표가 어떤 구간에 해당하는지 확인하세요.
      </div>
    </div>,

    /* Step 2: LCP highlight */
    <div key="lcp" className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 font-mono text-[0.625rem] font-bold ${webVitals[0].badgeColor}`}>
          LCP — Largest Contentful Paint
        </span>
      </div>

      <div className="mb-1.5">
        <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
          LCP가 관여하는 파이프라인 단계
        </span>
      </div>
      <PipelineRow
        activeStages={webVitals[0].stages}
        overlayColor={webVitals[0].color}
      />

      <div className="bg-accent/10 px-3 py-1.5 font-mono text-[0.6875rem] text-accent">
        관여 단계: Style → Layout → Paint (파싱 + 리소스 로딩 시간 포함)
      </div>

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {webVitals[0].description} 서버 응답 시간, 렌더 블로킹 리소스, 이미지 최적화가 LCP에 직접적인 영향을 줍니다.
      </div>
    </div>,

    /* Step 3: CLS highlight */
    <div key="cls" className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 font-mono text-[0.625rem] font-bold ${webVitals[1].badgeColor}`}>
          CLS — Cumulative Layout Shift
        </span>
      </div>

      <div className="mb-1.5">
        <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
          CLS가 관여하는 파이프라인 단계
        </span>
      </div>
      <PipelineRow
        activeStages={webVitals[1].stages}
        overlayColor={webVitals[1].color}
      />

      <div className="bg-accent/10 px-3 py-1.5 font-mono text-[0.6875rem] text-accent">
        관여 단계: Layout (레이아웃 시프트 발생 지점)
      </div>

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {webVitals[1].description} 이미지/광고의 크기 미지정, 동적 콘텐츠 삽입, 웹폰트 로딩 시 FOUT 등이 레이아웃 시프트의 주요 원인입니다.
      </div>
    </div>,

    /* Step 4: INP highlight */
    <div key="inp" className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 font-mono text-[0.625rem] font-bold ${webVitals[2].badgeColor}`}>
          INP — Interaction to Next Paint
        </span>
      </div>

      <div className="mb-1.5">
        <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
          INP가 관여하는 파이프라인 단계
        </span>
      </div>
      <PipelineRow
        activeStages={webVitals[2].stages}
        includeEvent={true}
        overlayColor={webVitals[2].color}
      />

      <div className="bg-accent/10 px-3 py-1.5 font-mono text-[0.6875rem] text-accent">
        관여 단계: Event → Style → Layout → Paint → Raster → Composite (전체 경로)
      </div>

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {webVitals[2].description} 이벤트 핸들러의 실행 시간, 메인 스레드 블로킹, 무거운 DOM 조작이 INP를 악화시킵니다.
      </div>
    </div>,

    /* Step 5: Threshold summary */
    <div key="thresholds" className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 font-mono text-[0.625rem] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300">
          기준값 요약
        </span>
        <span className="text-[0.6875rem] text-muted">
          좋음 / 개선 필요 / 나쁨
        </span>
      </div>

      {webVitals.map((vital) => (
        <ThresholdBar key={vital.id} vital={vital} />
      ))}

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        위 기준값은 페이지 방문의 75번째 백분위수 (p75) 를 기준으로 합니다.
        즉, 방문자의 75% 이상이 해당 기준 이내의 경험을 해야 &ldquo;좋음&rdquo;으로 분류됩니다.
        Chrome User Experience Report (CrUX) 에서 실제 사용자 데이터를 확인할 수 있습니다.
      </div>
    </div>,
  ];

  return <StepPlayer steps={stepNodes} />;
}
