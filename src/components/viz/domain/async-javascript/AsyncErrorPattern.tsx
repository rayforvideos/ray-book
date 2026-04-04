"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PatternState {
  label: string;
  status: "running" | "success" | "fail" | "retry" | "abort" | "waiting";
  value?: string;
}

interface PatternStep {
  states: PatternState[];
  activeLines: number[];
  description: string;
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const statusStyles = {
  running: {
    border: "border-sky-400/50 dark:border-sky-500/40",
    bg: "bg-sky-50 dark:bg-sky-950/40",
    text: "text-sky-800 dark:text-sky-200",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300",
  },
  success: {
    border: "border-emerald-400/50 dark:border-emerald-500/40",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-800 dark:text-emerald-200",
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
  },
  fail: {
    border: "border-red-400/50 dark:border-red-500/40",
    bg: "bg-red-50 dark:bg-red-950/40",
    text: "text-red-800 dark:text-red-200",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300",
  },
  retry: {
    border: "border-amber-400/50 dark:border-amber-500/40",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-800 dark:text-amber-200",
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
  },
  abort: {
    border: "border-stone-400/50 dark:border-stone-500/40",
    bg: "bg-stone-50 dark:bg-stone-900/40",
    text: "text-stone-600 dark:text-stone-300",
    badge:
      "bg-stone-100 text-stone-600 dark:bg-stone-800/60 dark:text-stone-300",
  },
  waiting: {
    border: "border-violet-400/50 dark:border-violet-500/40",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-800 dark:text-violet-200",
    badge:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300",
  },
};

const statusLabels = {
  running: "Running",
  success: "Success",
  fail: "Failed",
  retry: "Retry",
  abort: "Aborted",
  waiting: "Waiting",
};

/* ------------------------------------------------------------------ */
/*  Presets                                                            */
/* ------------------------------------------------------------------ */

const presets: Record<string, { code: string; steps: PatternStep[] }> = {
  /* ---- 재시도 ----------------------------------------------------- */
  retry: {
    code: [
      `async function fetchWithRetry(url, n = 3) {`,
      `  for (let i = 0; i < n; i++) {`,
      `    try {`,
      `      return await fetch(url);`,
      `    } catch (err) {`,
      `      if (i === n - 1) throw err;`,
      `      await delay(1000 * 2 ** i);`,
      `    }`,
      `  }`,
      `}`,
    ].join("\n"),

    steps: [
      {
        activeLines: [1, 3],
        states: [
          { label: "시도 1/3", status: "running", value: "fetch 요청 중" },
        ],
        description:
          "첫 번째 시도. fetch()가 서버에 요청을 보냅니다.",
      },
      {
        activeLines: [4, 6],
        states: [
          { label: "시도 1/3", status: "fail", value: "네트워크 에러" },
          { label: "대기", status: "waiting", value: "1초 (2⁰ × 1000ms)" },
        ],
        description:
          "첫 시도 실패. 아직 마지막 시도가 아니므로 (i !== n-1) " +
          "지수 백오프로 1초 대기 후 재시도합니다.",
      },
      {
        activeLines: [1, 3],
        states: [
          { label: "시도 1/3", status: "fail" },
          { label: "시도 2/3", status: "running", value: "fetch 요청 중" },
        ],
        description: "두 번째 시도. 다시 fetch()를 호출합니다.",
      },
      {
        activeLines: [4, 6],
        states: [
          { label: "시도 1/3", status: "fail" },
          { label: "시도 2/3", status: "fail", value: "타임아웃" },
          { label: "대기", status: "waiting", value: "2초 (2¹ × 1000ms)" },
        ],
        description:
          "두 번째도 실패. 대기 시간이 2초로 증가합니다 (지수 백오프). " +
          "서버에 부하를 주지 않으면서 복구 시간을 확보합니다.",
      },
      {
        activeLines: [1, 3],
        states: [
          { label: "시도 1/3", status: "fail" },
          { label: "시도 2/3", status: "fail" },
          { label: "시도 3/3", status: "success", value: "Response 200" },
        ],
        description:
          "세 번째 시도에서 성공. return await fetch(url)로 " +
          "결과를 반환합니다.",
      },
    ],
  },

  /* ---- 타임아웃 --------------------------------------------------- */
  timeout: {
    code: [
      `async function fetchWithTimeout(url, ms) {`,
      `  const controller = new AbortController();`,
      `  const timer = setTimeout(`,
      `    () => controller.abort(), ms`,
      `  );`,
      ``,
      `  try {`,
      `    const res = await fetch(url, {`,
      `      signal: controller.signal`,
      `    });`,
      `    return await res.json();`,
      `  } finally {`,
      `    clearTimeout(timer);`,
      `  }`,
      `}`,
    ].join("\n"),

    steps: [
      {
        activeLines: [1, 2, 3, 4],
        states: [
          { label: "AbortController", status: "running", value: "생성됨" },
          { label: "타이머", status: "waiting", value: "5초 후 abort" },
        ],
        description:
          "AbortController를 생성하고, ms 후에 abort()를 호출하는 " +
          "타이머를 설정합니다. signal을 fetch에 전달합니다.",
      },
      {
        activeLines: [7, 8, 9],
        states: [
          { label: "AbortController", status: "running" },
          { label: "타이머", status: "waiting", value: "3초 남음" },
          { label: "fetch", status: "running", value: "응답 대기 중" },
        ],
        description:
          "fetch가 요청을 보내고 응답을 기다립니다. " +
          "signal이 연결되어 있으므로 abort() 시 요청이 취소됩니다.",
      },
      {
        activeLines: [3, 4],
        states: [
          { label: "AbortController", status: "abort", value: "abort() 호출" },
          { label: "타이머", status: "success", value: "만료" },
          { label: "fetch", status: "fail", value: "AbortError" },
        ],
        description:
          "5초가 지나면 타이머가 controller.abort()를 호출합니다. " +
          "fetch의 Promise가 AbortError로 rejected됩니다.",
      },
      {
        activeLines: [11, 12],
        states: [
          { label: "finally", status: "running", value: "clearTimeout" },
        ],
        description:
          "finally 블록이 실행되어 타이머를 정리합니다. " +
          "성공이든 실패든 반드시 리소스를 정리하는 것이 핵심입니다. " +
          "AbortError는 호출자의 catch에서 처리합니다.",
      },
    ],
  },

  /* ---- 경쟁 조건 방지 --------------------------------------------- */
  race: {
    code: [
      `let currentId = 0;`,
      ``,
      `async function search(query) {`,
      `  const id = ++currentId;`,
      `  const res = await fetch("/search?q=" + query);`,
      `  const data = await res.json();`,
      ``,
      `  if (id !== currentId) return; // 무시`,
      `  renderResults(data);`,
      `}`,
    ].join("\n"),

    steps: [
      {
        activeLines: [3, 4],
        states: [
          { label: "search(\"re\")", status: "running", value: "id = 1" },
        ],
        description:
          "사용자가 \"re\"를 입력. currentId를 1로 증가시키고 " +
          "fetch 요청을 보냅니다.",
      },
      {
        activeLines: [3, 4],
        states: [
          { label: "search(\"re\")", status: "running", value: "id = 1" },
          { label: "search(\"rea\")", status: "running", value: "id = 2" },
        ],
        description:
          "응답이 오기 전에 사용자가 \"rea\"를 입력. " +
          "새 요청이 시작되고 currentId가 2로 증가합니다. " +
          "두 요청이 동시에 진행 중입니다.",
      },
      {
        activeLines: [7],
        states: [
          { label: "search(\"re\")", status: "abort", value: "id(1) ≠ current(2)" },
          { label: "search(\"rea\")", status: "running", value: "id = 2" },
        ],
        description:
          "\"re\"의 응답이 먼저 도착했지만, id(1) !== currentId(2)이므로 " +
          "결과를 무시합니다. 오래된 응답이 새 결과를 덮어쓰는 것을 방지합니다.",
      },
      {
        activeLines: [7, 8],
        states: [
          { label: "search(\"re\")", status: "abort", value: "무시됨" },
          { label: "search(\"rea\")", status: "success", value: "id(2) === current(2)" },
        ],
        description:
          "\"rea\"의 응답이 도착. id(2) === currentId(2)이므로 " +
          "renderResults()를 실행합니다. 항상 마지막 요청의 결과만 표시됩니다.",
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

function StateBadge({ state }: { state: PatternState }) {
  const s = statusStyles[state.status];
  return (
    <div className={`border p-2 transition-all ${s.border} ${s.bg}`}>
      <div className="flex items-center justify-between gap-1.5">
        <span className={`text-[0.625rem] font-bold ${s.text}`}>
          {state.label}
        </span>
        <span
          className={`rounded-sm px-1.5 py-0.5 text-[0.5rem] font-mono font-bold ${s.badge}`}
        >
          {statusLabels[state.status]}
        </span>
      </div>
      {state.value && (
        <div className="mt-1 font-mono text-[0.625rem] text-muted">
          {state.value}
        </div>
      )}
    </div>
  );
}

function StatePanel({ states }: { states: PatternState[] }) {
  return (
    <div className="w-48 shrink-0 max-sm:w-full">
      <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
        실행 상태
      </span>
      <div className="space-y-1.5">
        {states.map((s, i) => (
          <StateBadge key={`${s.label}-${i}`} state={s} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface AsyncErrorPatternProps {
  preset?: string;
}

export function AsyncErrorPattern({ preset = "retry" }: AsyncErrorPatternProps) {
  const data = presets[preset] ?? presets["retry"];
  const lines = data.code.split("\n");

  const stepNodes = data.steps.map((step, idx) => (
    <div key={idx}>
      <div className="flex gap-4 max-sm:flex-col">
        <CodePanel lines={lines} activeLines={step.activeLines} />
        <StatePanel states={step.states} />
      </div>

      <span className="mt-4 block border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </span>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
