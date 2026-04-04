"use client";

import { useState } from "react";

interface TimeEvent {
  time: number;
  type: "fired" | "ignored" | "executed";
  label?: string;
}

interface TimerBar {
  start: number;
  end: number;
  cancelled: boolean;
}

interface TimelinePreset {
  title: string;
  description: string;
  totalMs: number;
  events: TimeEvent[];
  timers: TimerBar[];
}

const presets: Record<string, TimelinePreset> = {
  debounce: {
    title: "Debounce (300ms)",
    description:
      "연속 입력 중에는 타이머가 계속 리셋됩니다. 마지막 입력 후 300ms가 지나야 실행됩니다.",
    totalMs: 1200,
    events: [
      { time: 100, type: "fired", label: "입력" },
      { time: 250, type: "fired", label: "입력" },
      { time: 400, type: "fired", label: "입력" },
      { time: 500, type: "fired", label: "입력" },
      { time: 800, type: "executed", label: "실행!" },
    ],
    timers: [
      { start: 100, end: 250, cancelled: true },
      { start: 250, end: 400, cancelled: true },
      { start: 400, end: 500, cancelled: true },
      { start: 500, end: 800, cancelled: false },
    ],
  },
  throttle: {
    title: "Throttle (200ms)",
    description:
      "200ms마다 최대 1번 실행됩니다. 간격 내 호출은 무시됩니다.",
    totalMs: 1200,
    events: [
      { time: 50, type: "executed", label: "실행" },
      { time: 100, type: "ignored" },
      { time: 150, type: "ignored" },
      { time: 260, type: "executed", label: "실행" },
      { time: 350, type: "ignored" },
      { time: 480, type: "executed", label: "실행" },
      { time: 550, type: "ignored" },
      { time: 600, type: "ignored" },
      { time: 700, type: "executed", label: "실행" },
    ],
    timers: [],
  },
};

const eventColors: Record<string, string> = {
  fired: "bg-sky-400 dark:bg-sky-500",
  ignored: "bg-stone-300 dark:bg-stone-600",
  executed: "bg-emerald-500 dark:bg-emerald-400",
};

const eventRing: Record<string, string> = {
  fired: "ring-sky-300 dark:ring-sky-600",
  ignored: "",
  executed: "ring-emerald-300 dark:ring-emerald-500",
};

export function DebounceTimeline() {
  const [mode, setMode] = useState<"debounce" | "throttle">("debounce");
  const preset = presets[mode];

  const toPercent = (ms: number) => (ms / preset.totalMs) * 100;

  const timeLabels = Array.from(
    { length: Math.floor(preset.totalMs / 200) + 1 },
    (_, i) => i * 200
  );

  return (
    <div className="my-8 border border-border p-5">
      {/* Toggle */}
      <div className="mb-4 flex gap-2">
        {(["debounce", "throttle"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 text-[0.75rem] font-mono border transition-colors ${
              mode === m
                ? "border-accent text-accent bg-accent/10"
                : "border-border text-muted hover:text-text"
            }`}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      <span className="mb-1 block text-[0.75rem] font-semibold text-text">
        {preset.title}
      </span>
      <span className="mb-5 block text-[0.6875rem] text-muted">
        {preset.description}
      </span>

      <div className="relative mx-auto" style={{ height: 140 }}>
        {/* Time labels */}
        {timeLabels.map((ms) => (
          <span
            key={ms}
            className="absolute bottom-0 -translate-x-1/2 font-mono text-[0.5625rem] text-muted"
            style={{ left: `${toPercent(ms)}%` }}
          >
            {ms}ms
          </span>
        ))}

        {/* Timeline bar */}
        <div
          className="absolute left-0 right-0 h-px bg-border"
          style={{ top: 70 }}
        />

        {/* Timer bars (debounce only) */}
        {preset.timers.map((timer, i) => (
          <div
            key={i}
            className={`absolute h-1 ${
              timer.cancelled
                ? "bg-red-300/40 dark:bg-red-500/20"
                : "bg-emerald-300/60 dark:bg-emerald-500/30"
            }`}
            style={{
              left: `${toPercent(timer.start)}%`,
              width: `${toPercent(timer.end - timer.start)}%`,
              top: 74,
            }}
          >
            {timer.cancelled && (
              <span className="absolute -right-1 -top-0.5 text-[0.5rem] text-red-600 dark:text-red-400">
                ✕
              </span>
            )}
          </div>
        ))}

        {/* Events */}
        {preset.events.map((evt, i) => {
          const isAbove = evt.type !== "executed";
          const yPos = isAbove ? 48 : 84;
          return (
            <div
              key={i}
              className="absolute -translate-x-1/2 flex flex-col items-center"
              style={{
                left: `${toPercent(evt.time)}%`,
                top: yPos,
                animationDelay: `${i * 80}ms`,
              }}
            >
              {evt.label && isAbove && (
                <span className="mb-1 text-[0.5625rem] text-muted whitespace-nowrap">
                  {evt.label}
                </span>
              )}
              <div
                className={`h-2.5 w-2.5 rounded-full ${eventColors[evt.type]} ${
                  evt.type === "executed" ? `ring-2 ${eventRing[evt.type]}` : ""
                } ${evt.type === "ignored" ? "opacity-50" : ""}`}
              />
              {evt.label && !isAbove && (
                <span className="mt-1 text-[0.5625rem] font-semibold text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
                  {evt.label}
                </span>
              )}
              {/* Vertical tick */}
              <div
                className={`absolute w-px ${
                  evt.type === "ignored"
                    ? "bg-stone-300/40 dark:bg-stone-600/40"
                    : "bg-border"
                }`}
                style={{
                  height: isAbove ? 10 : 10,
                  top: isAbove ? "100%" : undefined,
                  bottom: isAbove ? undefined : "100%",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-[0.625rem] text-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-sky-400 dark:bg-sky-500" />
          호출
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-stone-300 dark:bg-stone-600 opacity-50" />
          무시됨
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
          실행
        </span>
      </div>
    </div>
  );
}
