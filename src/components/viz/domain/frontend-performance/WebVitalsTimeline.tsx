"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ── Data ── */

interface Metric {
  id: string;
  label: string;
  full: string;
  offsetPct: number;
  color: string;
  ringColor: string;
  description: string;
  good: string;
  poor: string;
  how: string;
}

const metrics: Metric[] = [
  {
    id: "nav",
    label: "Navigation",
    full: "Navigation Start",
    offsetPct: 0,
    color: "bg-stone-400",
    ringColor: "ring-stone-400",
    description:
      "사용자가 URL을 입력하거나 링크를 클릭한 순간 — 모든 측정의 기준점입니다. 아직 화면에는 아무것도 보이지 않습니다.",
    good: "-",
    poor: "-",
    how: "performance.timing.navigationStart",
  },
  {
    id: "fcp",
    label: "FCP",
    full: "First Contentful Paint",
    offsetPct: 20,
    color: "bg-sky-500 dark:bg-sky-400",
    ringColor: "ring-sky-500 dark:ring-sky-400",
    description:
      "브라우저가 첫 번째 텍스트, 이미지, 또는 SVG를 화면에 렌더링한 시점입니다. 사용자가 '페이지가 로딩되고 있구나'라고 느끼는 순간입니다.",
    good: "1.8초 이하",
    poor: "3.0초 초과",
    how: "PerformanceObserver (paint)",
  },
  {
    id: "lcp",
    label: "LCP",
    full: "Largest Contentful Paint",
    offsetPct: 45,
    color: "bg-emerald-500 dark:bg-emerald-400",
    ringColor: "ring-emerald-500 dark:ring-emerald-400",
    description:
      "뷰포트에서 가장 큰 콘텐츠 요소 (히어로 이미지, 제목 텍스트 블록 등) 가 렌더링 완료된 시점입니다. Core Web Vitals의 로딩 지표입니다.",
    good: "2.5초 이하",
    poor: "4.0초 초과",
    how: "PerformanceObserver (largest-contentful-paint)",
  },
  {
    id: "inp",
    label: "INP",
    full: "Interaction to Next Paint",
    offsetPct: 70,
    color: "bg-amber-500 dark:bg-amber-400",
    ringColor: "ring-amber-500 dark:ring-amber-400",
    description:
      "사용자의 클릭, 탭, 키 입력에 대해 브라우저가 다음 프레임을 그리기까지의 지연 시간입니다. 페이지 전체 수명 동안 가장 느린 인터랙션을 대표값으로 사용합니다. 2024년 3월 FID를 대체했습니다.",
    good: "200ms 이하",
    poor: "500ms 초과",
    how: "PerformanceObserver (event)",
  },
  {
    id: "cls",
    label: "CLS",
    full: "Cumulative Layout Shift",
    offsetPct: 90,
    color: "bg-rose-500 dark:bg-rose-400",
    ringColor: "ring-rose-500 dark:ring-rose-400",
    description:
      "페이지 로드 중 예기치 않게 레이아웃이 이동한 정도의 누적 점수입니다. 이미지에 크기가 지정되지 않았거나, 동적으로 삽입된 광고 등이 원인입니다.",
    good: "0.1 이하",
    poor: "0.25 초과",
    how: "PerformanceObserver (layout-shift)",
  },
];

/* ── Timeline Bar ── */

function TimelineBar({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="relative h-8 w-full rounded bg-border/30">
      {/* Progress fill */}
      <div
        className="absolute inset-y-0 left-0 rounded bg-accent/15 transition-all duration-500"
        style={{ width: `${metrics[activeIndex].offsetPct + 8}%` }}
      />

      {/* Markers */}
      {metrics.map((m, i) => {
        const isActive = i <= activeIndex;
        const isCurrent = i === activeIndex;
        return (
          <div
            key={m.id}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
            style={{ left: `${m.offsetPct + 4}%` }}
          >
            <div
              className={`rounded-full transition-all duration-300 ${m.color} ${
                isCurrent
                  ? `h-5 w-5 ring-2 ring-offset-2 ring-offset-bg ${m.ringColor} scale-110`
                  : isActive
                    ? "h-3 w-3"
                    : "h-3 w-3 opacity-30"
              }`}
            />
            <span
              className={`absolute left-1/2 -translate-x-1/2 top-full mt-1.5 font-mono text-[0.625rem] whitespace-nowrap transition-opacity duration-300 ${
                isActive ? "text-muted" : "text-muted/30"
              }`}
            >
              {m.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Page Preview ── */

function PagePreview({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="w-full max-w-[200px] aspect-[3/4] border border-border rounded overflow-hidden bg-bg text-[0.5rem] flex flex-col">
      {/* Browser chrome */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border bg-border/20">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span className="ml-1 flex-1 h-2.5 rounded bg-border/40" />
      </div>

      {/* Content area */}
      <div className="flex-1 p-2 space-y-1.5 relative">
        {activeIndex === 0 && (
          <div className="flex items-center justify-center h-full text-muted/40 text-[0.625rem]">
            blank
          </div>
        )}

        {activeIndex >= 1 && (
          <>
            <div className="h-2 w-3/5 rounded bg-muted/30" />
            <div className="h-1.5 w-4/5 rounded bg-muted/20" />
          </>
        )}

        {activeIndex >= 2 && (
          <>
            <div
              className={`h-12 w-full rounded transition-all duration-500 ${
                activeIndex === 2
                  ? "bg-emerald-500/20 ring-1 ring-emerald-500/40"
                  : "bg-muted/15"
              }`}
            />
            <div className="h-1.5 w-full rounded bg-muted/15" />
            <div className="h-1.5 w-3/4 rounded bg-muted/15" />
          </>
        )}

        {activeIndex === 3 && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-amber-500/20 ring-1 ring-amber-500/40 text-amber-600 dark:text-amber-400 text-[0.5rem]">
            click!
          </div>
        )}

        {activeIndex === 4 && (
          <>
            <div className="h-6 w-full rounded bg-rose-500/10 ring-1 ring-rose-500/30 animate-pulse" />
            <div className="h-1.5 w-full rounded bg-muted/15 translate-y-2 transition-transform" />
          </>
        )}
      </div>
    </div>
  );
}

/* ── Step Nodes ── */

const stepNodes = metrics.map((m, idx) => (
  <div key={idx} className="space-y-4">
    {/* Header */}
    <div className="flex items-center justify-between">
      <span className="font-mono text-sm font-bold text-accent">
        {m.label} — {m.full}
      </span>
      <span className="text-[0.6875rem] text-muted">
        {idx + 1} / {metrics.length}
      </span>
    </div>

    {/* Timeline + Preview */}
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="flex-1 w-full space-y-6 pt-1">
        <TimelineBar activeIndex={idx} />
      </div>
      <PagePreview activeIndex={idx} />
    </div>

    {/* Description */}
    <div className="border-t border-border pt-3 space-y-2">
      <p className="text-[0.8125rem] leading-relaxed text-muted">
        {m.description}
      </p>
      {m.good !== "-" && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.75rem] font-mono">
          <span>
            <span className="text-emerald-500">Good</span>{" "}
            <span className="text-muted">{m.good}</span>
          </span>
          <span>
            <span className="text-rose-500">Poor</span>{" "}
            <span className="text-muted">{m.poor}</span>
          </span>
          <span>
            <span className="text-sky-500">측정</span>{" "}
            <span className="text-muted">{m.how}</span>
          </span>
        </div>
      )}
    </div>
  </div>
));

/* ── Main Component ── */

export function WebVitalsTimeline() {
  return <StepPlayer steps={stepNodes} />;
}
