"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TimelineEvent {
  label: string;
  status: "fired" | "ignored" | "scheduled" | "executed" | "queued" | "limited";
  time?: string;
}

interface PatternStep {
  events: TimelineEvent[];
  activeLines: number[];
  description: string;
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const statusStyles = {
  fired: {
    border: "border-sky-400/50 dark:border-sky-500/40",
    bg: "bg-sky-50 dark:bg-sky-950/40",
    text: "text-sky-800 dark:text-sky-200",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300",
  },
  ignored: {
    border: "border-stone-400/50 dark:border-stone-500/40",
    bg: "bg-stone-50 dark:bg-stone-900/40",
    text: "text-stone-500 dark:text-stone-400",
    badge:
      "bg-stone-100 text-stone-500 dark:bg-stone-800/60 dark:text-stone-400",
  },
  scheduled: {
    border: "border-amber-400/50 dark:border-amber-500/40",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-800 dark:text-amber-200",
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
  },
  executed: {
    border: "border-emerald-400/50 dark:border-emerald-500/40",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-800 dark:text-emerald-200",
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
  },
  queued: {
    border: "border-violet-400/50 dark:border-violet-500/40",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-800 dark:text-violet-200",
    badge:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300",
  },
  limited: {
    border: "border-red-400/50 dark:border-red-500/40",
    bg: "bg-red-50 dark:bg-red-950/40",
    text: "text-red-800 dark:text-red-200",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300",
  },
};

const statusLabels = {
  fired: "Fired",
  ignored: "Ignored",
  scheduled: "Scheduled",
  executed: "Executed",
  queued: "Queued",
  limited: "Limited",
};

/* ------------------------------------------------------------------ */
/*  Presets                                                            */
/* ------------------------------------------------------------------ */

const presets: Record<string, { code: string; steps: PatternStep[] }> = {
  /* ---- 디바운스 --------------------------------------------------- */
  debounce: {
    code: [
      `function debounce(fn, ms) {`,
      `  let timer;`,
      `  return (...args) => {`,
      `    clearTimeout(timer);`,
      `    timer = setTimeout(() => fn(...args), ms);`,
      `  };`,
      `}`,
      ``,
      `const search = debounce(query => {`,
      `  fetch("/search?q=" + query);`,
      `}, 300);`,
    ].join("\n"),

    steps: [
      {
        activeLines: [3, 4],
        events: [
          { label: "입력: \"r\"", status: "fired", time: "0ms" },
          { label: "타이머", status: "scheduled", time: "300ms 후 실행" },
        ],
        description:
          "사용자가 \"r\"을 입력합니다. " +
          "이전 타이머를 취소(clearTimeout)하고 300ms 타이머를 새로 설정합니다.",
      },
      {
        activeLines: [3, 4],
        events: [
          { label: "입력: \"r\"", status: "ignored", time: "0ms" },
          { label: "입력: \"re\"", status: "fired", time: "100ms" },
          { label: "타이머", status: "scheduled", time: "400ms에 실행" },
        ],
        description:
          "100ms 후 \"re\"를 입력. 이전 타이머가 취소되고 " +
          "새 타이머가 설정됩니다. \"r\"의 요청은 영원히 실행되지 않습니다.",
      },
      {
        activeLines: [3, 4],
        events: [
          { label: "입력: \"r\"", status: "ignored" },
          { label: "입력: \"re\"", status: "ignored", time: "100ms" },
          { label: "입력: \"rea\"", status: "fired", time: "200ms" },
          { label: "타이머", status: "scheduled", time: "500ms에 실행" },
        ],
        description:
          "계속 타이핑하면 타이머가 계속 리셋됩니다. " +
          "마지막 입력 후 300ms 동안 추가 입력이 없어야 실행됩니다.",
      },
      {
        activeLines: [4, 9],
        events: [
          { label: "입력: \"r\"", status: "ignored" },
          { label: "입력: \"re\"", status: "ignored" },
          { label: "입력: \"rea\"", status: "ignored" },
          { label: "입력: \"reac\"", status: "executed", time: "250ms" },
          { label: "fetch(\"/search?q=reac\")", status: "executed", time: "550ms" },
        ],
        description:
          "\"reac\" 입력 후 300ms 동안 추가 입력이 없으면 " +
          "fetch가 실행됩니다. 4번의 키 입력에 1번만 요청 — 서버 부하를 크게 줄입니다.",
      },
    ],
  },

  /* ---- 스로틀 ----------------------------------------------------- */
  throttle: {
    code: [
      `function throttle(fn, ms) {`,
      `  let last = 0;`,
      `  return (...args) => {`,
      `    const now = Date.now();`,
      `    if (now - last >= ms) {`,
      `      last = now;`,
      `      fn(...args);`,
      `    }`,
      `  };`,
      `}`,
      ``,
      `const onScroll = throttle(() => {`,
      `  updatePosition();`,
      `}, 100);`,
    ].join("\n"),

    steps: [
      {
        activeLines: [4, 5, 6],
        events: [
          { label: "scroll 이벤트", status: "executed", time: "0ms" },
        ],
        description:
          "첫 번째 스크롤 이벤트. last가 0이므로 " +
          "조건(now - last >= 100)을 만족하여 즉시 실행됩니다.",
      },
      {
        activeLines: [4],
        events: [
          { label: "scroll 이벤트", status: "executed", time: "0ms" },
          { label: "scroll 이벤트", status: "ignored", time: "30ms" },
          { label: "scroll 이벤트", status: "ignored", time: "60ms" },
        ],
        description:
          "30ms, 60ms에 스크롤 이벤트가 발생하지만, " +
          "마지막 실행(0ms)으로부터 100ms가 지나지 않아 무시됩니다.",
      },
      {
        activeLines: [4, 5, 6],
        events: [
          { label: "scroll @ 0ms", status: "executed" },
          { label: "scroll @ 30ms", status: "ignored" },
          { label: "scroll @ 60ms", status: "ignored" },
          { label: "scroll @ 100ms", status: "executed" },
        ],
        description:
          "100ms가 지나면 다시 실행됩니다. " +
          "디바운스와 달리 주기적으로 실행되므로 " +
          "스크롤 위치 업데이트 같은 연속적인 피드백에 적합합니다.",
      },
      {
        activeLines: [4, 5, 6],
        events: [
          { label: "scroll @ 0ms", status: "executed" },
          { label: "scroll @ 30ms", status: "ignored" },
          { label: "scroll @ 60ms", status: "ignored" },
          { label: "scroll @ 100ms", status: "executed" },
          { label: "scroll @ 130ms", status: "ignored" },
          { label: "scroll @ 200ms", status: "executed" },
        ],
        description:
          "100ms마다 최대 1번 실행. 스크롤 중에도 " +
          "일정 간격으로 UI가 업데이트되어 자연스러운 경험을 제공합니다.",
      },
    ],
  },

  /* ---- 동시성 제한 ------------------------------------------------- */
  concurrency: {
    code: [
      `async function poolAll(urls, limit = 3) {`,
      `  const results = [];`,
      `  const executing = new Set();`,
      ``,
      `  for (const url of urls) {`,
      `    const p = fetch(url).then(r => r.json());`,
      `    results.push(p);`,
      `    executing.add(p);`,
      `    p.finally(() => executing.delete(p));`,
      ``,
      `    if (executing.size >= limit)`,
      `      await Promise.race(executing);`,
      `  }`,
      `  return Promise.all(results);`,
      `}`,
    ].join("\n"),

    steps: [
      {
        activeLines: [5, 6, 7],
        events: [
          { label: "fetch(url[0])", status: "fired", time: "슬롯 1/3" },
          { label: "fetch(url[1])", status: "fired", time: "슬롯 2/3" },
          { label: "fetch(url[2])", status: "fired", time: "슬롯 3/3" },
        ],
        description:
          "처음 3개 요청을 동시에 시작합니다. " +
          "executing Set에 3개가 들어있으므로 limit에 도달합니다.",
      },
      {
        activeLines: [10, 11],
        events: [
          { label: "fetch(url[0])", status: "fired", time: "슬롯 1/3" },
          { label: "fetch(url[1])", status: "fired", time: "슬롯 2/3" },
          { label: "fetch(url[2])", status: "fired", time: "슬롯 3/3" },
          { label: "fetch(url[3])", status: "queued", time: "대기 중" },
        ],
        description:
          "4번째 요청은 executing.size >= limit이므로 " +
          "Promise.race(executing)로 대기합니다. " +
          "3개 중 하나가 완료되어야 다음 요청을 시작합니다.",
      },
      {
        activeLines: [8, 5, 6],
        events: [
          { label: "fetch(url[0])", status: "executed" },
          { label: "fetch(url[1])", status: "fired", time: "슬롯 2/3" },
          { label: "fetch(url[2])", status: "fired", time: "슬롯 3/3" },
          { label: "fetch(url[3])", status: "fired", time: "슬롯 1/3" },
        ],
        description:
          "url[0]이 완료되어 executing에서 제거됩니다. " +
          "빈 슬롯에 url[3] 요청이 시작됩니다. 항상 3개가 동시에 실행됩니다.",
      },
      {
        activeLines: [13],
        events: [
          { label: "fetch(url[0])", status: "executed" },
          { label: "fetch(url[1])", status: "executed" },
          { label: "fetch(url[2])", status: "executed" },
          { label: "fetch(url[3])", status: "executed" },
          { label: "Promise.all(results)", status: "executed" },
        ],
        description:
          "모든 요청이 완료되면 Promise.all(results)로 " +
          "전체 결과를 반환합니다. 서버에 동시 요청 폭탄을 보내지 않으면서 " +
          "최대한 빠르게 처리합니다.",
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function CodePanel({ lines, activeLines }: { lines: string[]; activeLines: number[] }) {
  return (
    <div className="flex-1 min-w-0">
      <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
        코드
      </span>
      <div className="rounded-sm bg-surface font-mono text-[0.6875rem] leading-relaxed overflow-x-auto">
        {lines.map((line, i) => {
          const isActive = activeLines.includes(i);
          return (
            <div
              key={i}
              className={`flex transition-colors duration-150 ${isActive ? "bg-accent/10" : ""}`}
            >
              <span className={`select-none w-8 shrink-0 text-right pr-3 ${isActive ? "text-accent" : "text-muted/50"}`}>
                {i + 1}
              </span>
              <span className={`flex-1 pr-3 py-px whitespace-pre ${isActive ? "text-text" : "text-muted/50"}`}>
                {line || "\u00A0"}
              </span>
              {isActive && (
                <span className="shrink-0 pr-2 text-accent text-[0.625rem] pt-px">◄</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventBadge({ event }: { event: TimelineEvent }) {
  const s = statusStyles[event.status];
  return (
    <div className={`border p-2 transition-all ${s.border} ${s.bg}`}>
      <div className="flex items-center justify-between gap-1.5">
        <span className={`text-[0.625rem] font-bold ${s.text}`}>
          {event.label}
        </span>
        <span
          className={`rounded-sm px-1.5 py-0.5 text-[0.5rem] font-mono font-bold ${s.badge}`}
        >
          {statusLabels[event.status]}
        </span>
      </div>
      {event.time && (
        <div className="mt-1 font-mono text-[0.625rem] text-muted">
          {event.time}
        </div>
      )}
    </div>
  );
}

function EventPanel({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="w-48 shrink-0 max-sm:w-full">
      <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
        타임라인
      </span>
      <div className="space-y-1.5">
        {events.map((e, i) => (
          <EventBadge key={`${e.label}-${i}`} event={e} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface AsyncUtilPatternProps {
  preset?: string;
}

export function AsyncUtilPattern({ preset = "debounce" }: AsyncUtilPatternProps) {
  const data = presets[preset] ?? presets["debounce"];
  const lines = data.code.split("\n");

  const stepNodes = data.steps.map((step, idx) => (
    <div key={idx}>
      <div className="flex gap-4 max-sm:flex-col">
        <CodePanel lines={lines} activeLines={step.activeLines} />
        <EventPanel events={step.events} />
      </div>

      <span className="mt-4 block border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </span>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
