"use client";

import { StepPlayer } from "../primitives/StepPlayer";

type FramePhase = "js" | "raf" | "style" | "layout" | "paint" | "idle" | "dropped";

interface Frame {
  id: number;
  phases: { phase: FramePhase; duration: number; label: string }[];
  totalMs: number;
  dropped: boolean;
}

interface TimelineStep {
  frames: Frame[];
  currentFrame: number;
  description: string;
}

const phaseColors: Record<FramePhase, { bg: string; text: string }> = {
  js: { bg: "bg-amber-200 dark:bg-amber-700", text: "text-amber-900 dark:text-amber-100" },
  raf: { bg: "bg-sky-200 dark:bg-sky-700", text: "text-sky-900 dark:text-sky-100" },
  style: { bg: "bg-violet-200 dark:bg-violet-700", text: "text-violet-900 dark:text-violet-100" },
  layout: { bg: "bg-emerald-200 dark:bg-emerald-700", text: "text-emerald-900 dark:text-emerald-100" },
  paint: { bg: "bg-rose-200 dark:bg-rose-700", text: "text-rose-900 dark:text-rose-100" },
  idle: { bg: "bg-stone-100 dark:bg-stone-800", text: "text-stone-500 dark:text-stone-400" },
  dropped: { bg: "bg-red-300 dark:bg-red-800", text: "text-red-900 dark:text-red-100" },
};

const steps: TimelineStep[] = [
  {
    frames: [
      { id: 1, totalMs: 16, dropped: false, phases: [
        { phase: "js", duration: 4, label: "이벤트 핸들러" },
        { phase: "raf", duration: 2, label: "rAF" },
        { phase: "style", duration: 2, label: "Style" },
        { phase: "layout", duration: 3, label: "Layout" },
        { phase: "paint", duration: 2, label: "Paint" },
        { phase: "idle", duration: 3, label: "" },
      ]},
    ],
    currentFrame: 1,
    description: "정상 프레임 (16ms). JS 실행 → rAF 콜백 → Style → Layout → Paint 순서로 처리됩니다. 여유 시간(idle)이 남아 부드럽게 렌더링됩니다.",
  },
  {
    frames: [
      { id: 1, totalMs: 16, dropped: false, phases: [
        { phase: "js", duration: 4, label: "핸들러" },
        { phase: "raf", duration: 2, label: "rAF" },
        { phase: "style", duration: 2, label: "Style" },
        { phase: "layout", duration: 3, label: "Layout" },
        { phase: "paint", duration: 2, label: "Paint" },
        { phase: "idle", duration: 3, label: "" },
      ]},
      { id: 2, totalMs: 35, dropped: true, phases: [
        { phase: "js", duration: 25, label: "무거운 스크롤 핸들러" },
        { phase: "raf", duration: 2, label: "rAF" },
        { phase: "style", duration: 2, label: "Style" },
        { phase: "layout", duration: 3, label: "Layout" },
        { phase: "paint", duration: 3, label: "Paint" },
      ]},
    ],
    currentFrame: 2,
    description: "프레임 드롭! 스크롤 핸들러가 25ms나 걸려서 16.67ms 예산을 초과했습니다. 이 프레임은 건너뛰어져 화면이 버벅입니다.",
  },
  {
    frames: [
      { id: 1, totalMs: 16, dropped: false, phases: [
        { phase: "js", duration: 4, label: "핸들러" },
        { phase: "raf", duration: 2, label: "rAF" },
        { phase: "style", duration: 2, label: "Style" },
        { phase: "layout", duration: 3, label: "Layout" },
        { phase: "paint", duration: 2, label: "Paint" },
        { phase: "idle", duration: 3, label: "" },
      ]},
      { id: 2, totalMs: 16, dropped: false, phases: [
        { phase: "js", duration: 1, label: "passive" },
        { phase: "raf", duration: 4, label: "rAF (로직 이동)" },
        { phase: "style", duration: 2, label: "Style" },
        { phase: "layout", duration: 3, label: "Layout" },
        { phase: "paint", duration: 2, label: "Paint" },
        { phase: "idle", duration: 4, label: "" },
      ]},
    ],
    currentFrame: 2,
    description: "해결: passive 리스너 + rAF로 로직을 이동. 스크롤 핸들러는 플래그만 설정하고, 실제 작업은 rAF에서 프레임당 한 번만 실행합니다.",
  },
];

const FRAME_WIDTH = 280;
const MS_SCALE = FRAME_WIDTH / 16.67;

export function RafTimeline() {
  const stepNodes = steps.map((step, idx) => (
    <div key={idx} className="space-y-3">
      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {(["js", "raf", "style", "layout", "paint"] as FramePhase[]).map(phase => (
          <span key={phase} className={`inline-flex items-center gap-1 text-[0.5625rem] ${phaseColors[phase].text}`}>
            <span className={`inline-block h-2 w-2 ${phaseColors[phase].bg}`} />
            {phase === "js" ? "JS" : phase === "raf" ? "rAF" : phase.charAt(0).toUpperCase() + phase.slice(1)}
          </span>
        ))}
      </div>

      {/* Frames */}
      <div className="space-y-2 overflow-x-auto">
        {step.frames.map((frame) => {
          const isCurrent = frame.id === step.currentFrame;
          return (
            <div key={frame.id} className={`${isCurrent ? "ring-1 ring-accent" : ""}`}>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[0.5625rem] font-mono text-muted shrink-0">Frame {frame.id}</span>
                <span className={`text-[0.5625rem] font-mono ${frame.dropped ? "text-red-500 font-bold" : "text-muted"}`}>
                  {frame.totalMs}ms {frame.dropped ? "⚠ DROPPED" : ""}
                </span>
              </div>
              <div className="flex h-6" style={{ minWidth: FRAME_WIDTH }}>
                {frame.phases.map((p, i) => {
                  const width = Math.max(p.duration * MS_SCALE, 2);
                  const colors = phaseColors[p.phase];
                  return (
                    <div
                      key={i}
                      className={`${colors.bg} flex items-center justify-center overflow-hidden border-r border-white/20 dark:border-black/20`}
                      style={{ width }}
                      title={`${p.label || p.phase}: ${p.duration}ms`}
                    >
                      {width > 30 && (
                        <span className={`text-[0.4375rem] font-mono truncate px-0.5 ${colors.text}`}>{p.label}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* 16.67ms marker */}
              <div className="relative h-3" style={{ minWidth: FRAME_WIDTH }}>
                <div
                  className="absolute top-0 h-full border-l border-dashed border-muted/40"
                  style={{ left: 16.67 * MS_SCALE }}
                />
                <span
                  className="absolute top-0 text-[0.4375rem] text-muted/40"
                  style={{ left: 16.67 * MS_SCALE + 2 }}
                >
                  16.67ms
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
