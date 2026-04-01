"use client";

import { StepPlayer } from "../primitives/StepPlayer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ExecutionState {
  label: string;
  status: "running" | "suspended" | "resumed" | "done";
  value?: string;
}

interface AsyncStep {
  states: ExecutionState[];
  codeLine: string;
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
  suspended: {
    border: "border-amber-400/50 dark:border-amber-500/40",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-800 dark:text-amber-200",
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
  },
  resumed: {
    border: "border-emerald-400/50 dark:border-emerald-500/40",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-800 dark:text-emerald-200",
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
  },
  done: {
    border: "border-stone-400/50 dark:border-stone-500/40",
    bg: "bg-stone-50 dark:bg-stone-900/40",
    text: "text-stone-600 dark:text-stone-300",
    badge:
      "bg-stone-100 text-stone-600 dark:bg-stone-800/60 dark:text-stone-300",
  },
};

const statusLabels = {
  running: "Running",
  suspended: "Suspended",
  resumed: "Resumed",
  done: "Done",
};

/* ------------------------------------------------------------------ */
/*  Presets                                                            */
/* ------------------------------------------------------------------ */

const presets: Record<string, { code: string; steps: AsyncStep[] }> = {
  /* ---- await 흐름 ------------------------------------------------- */
  "await-flow": {
    code: [
      `async function loadUser() {`,
      `  console.log("시작");`,
      `  const res = await fetch("/user/1");`,
      `  const user = await res.json();`,
      `  console.log(user.name);`,
      `}`,
      ``,
      `loadUser();`,
      `console.log("다음 코드");`,
    ].join("\n"),

    steps: [
      {
        codeLine: "loadUser() 호출",
        activeLines: [0, 1, 7],
        states: [
          { label: "loadUser()", status: "running" },
        ],
        description:
          "async 함수가 호출되면 동기적으로 실행을 시작합니다. " +
          '"시작"이 출력됩니다.',
      },
      {
        codeLine: "await fetch(\"/user/1\")",
        activeLines: [2, 8],
        states: [
          { label: "loadUser()", status: "suspended", value: "fetch 대기 중" },
          { label: "메인 스레드", status: "running" },
        ],
        description:
          "await를 만나면 함수 실행이 일시 중단됩니다. " +
          "제어권이 호출자에게 돌아가서 \"다음 코드\"가 먼저 출력됩니다. " +
          "fetch는 백그라운드에서 진행됩니다.",
      },
      {
        codeLine: "fetch 완료 → 재개",
        activeLines: [2],
        states: [
          { label: "loadUser()", status: "resumed", value: "res = Response" },
        ],
        description:
          "fetch가 완료되면 loadUser()가 중단된 지점부터 재개됩니다. " +
          "await의 결과값 Response가 res에 할당됩니다.",
      },
      {
        codeLine: "await res.json()",
        activeLines: [3],
        states: [
          {
            label: "loadUser()",
            status: "suspended",
            value: "JSON 파싱 대기 중",
          },
        ],
        description:
          "두 번째 await에서 다시 중단됩니다. " +
          "res.json()도 Promise를 반환하므로 완료될 때까지 기다립니다.",
      },
      {
        codeLine: "console.log(user.name)",
        activeLines: [4],
        states: [
          { label: "loadUser()", status: "done", value: "완료" },
        ],
        description:
          "JSON 파싱이 완료되면 재개되어 user.name을 출력합니다. " +
          "함수가 끝나면 반환된 Promise가 fulfilled됩니다.",
      },
    ],
  },

  /* ---- try/catch -------------------------------------------------- */
  "error-handling": {
    code: [
      `async function loadData() {`,
      `  try {`,
      `    const res = await fetch("/api");`,
      `    const data = await res.json();`,
      `    return data;`,
      `  } catch (err) {`,
      `    console.error("실패:", err);`,
      `    return null;`,
      `  }`,
      `}`,
    ].join("\n"),

    steps: [
      {
        codeLine: "await fetch(\"/api\")",
        activeLines: [1, 2],
        states: [
          { label: "loadData()", status: "running" },
          { label: "try 블록", status: "running" },
        ],
        description:
          "try 블록 안에서 await를 사용합니다. " +
          "동기 코드의 try-catch와 동일한 문법으로 비동기 에러를 처리합니다.",
      },
      {
        codeLine: "fetch 실패 → rejected",
        activeLines: [5, 6],
        states: [
          { label: "loadData()", status: "running" },
          { label: "try 블록", status: "done", value: "에러 발생!" },
          { label: "catch 블록", status: "running", value: "err = Error" },
        ],
        description:
          "await한 Promise가 rejected되면 예외가 throw됩니다. " +
          "catch 블록이 에러를 잡습니다. " +
          ".then().catch() 체인 없이 동기 코드처럼 에러를 처리합니다.",
      },
      {
        codeLine: "return null",
        activeLines: [7],
        states: [
          { label: "loadData()", status: "done", value: "→ null" },
        ],
        description:
          "catch에서 null을 반환하여 복구합니다. " +
          "loadData()가 반환하는 Promise는 null로 fulfilled됩니다.",
      },
    ],
  },

  /* ---- 순차 vs 병렬 ----------------------------------------------- */
  "sequential-vs-parallel": {
    code: [
      `// 순차 — 3초`,
      `const a = await fetchA(); // 1초`,
      `const b = await fetchB(); // 1초`,
      `const c = await fetchC(); // 1초`,
      ``,
      `// 병렬 — 1초`,
      `const [a, b, c] = await Promise.all([`,
      `  fetchA(), fetchB(), fetchC()`,
      `]);`,
    ].join("\n"),

    steps: [
      {
        codeLine: "순차 실행",
        activeLines: [1],
        states: [
          { label: "fetchA()", status: "running", value: "1초" },
          { label: "fetchB()", status: "suspended", value: "대기" },
          { label: "fetchC()", status: "suspended", value: "대기" },
        ],
        description:
          "await를 연속으로 쓰면 순차 실행됩니다. " +
          "fetchA()가 끝나야 fetchB()가 시작됩니다. 총 3초 소요.",
      },
      {
        codeLine: "순차 — 완료",
        activeLines: [1, 2, 3],
        states: [
          { label: "fetchA()", status: "done", value: "1초" },
          { label: "fetchB()", status: "done", value: "2초" },
          { label: "fetchC()", status: "done", value: "3초" },
        ],
        description:
          "각 요청이 순서대로 완료됩니다. " +
          "서로 의존성이 없는 요청이라면 불필요한 대기입니다.",
      },
      {
        codeLine: "Promise.all — 동시 시작",
        activeLines: [6, 7],
        states: [
          { label: "fetchA()", status: "running", value: "1초" },
          { label: "fetchB()", status: "running", value: "1초" },
          { label: "fetchC()", status: "running", value: "1초" },
        ],
        description:
          "Promise.all()에 전달하기 전에 세 함수를 모두 호출합니다. " +
          "await 없이 호출하므로 세 요청이 동시에 시작됩니다.",
      },
      {
        codeLine: "Promise.all — 완료",
        activeLines: [6, 7, 8],
        states: [
          { label: "fetchA()", status: "done", value: "1초" },
          { label: "fetchB()", status: "done", value: "1초" },
          { label: "fetchC()", status: "done", value: "1초" },
        ],
        description:
          "가장 느린 요청 기준으로 총 1초 소요. " +
          "독립적인 비동기 작업은 항상 Promise.all로 병렬 실행하세요.",
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

function StateBadge({ state }: { state: ExecutionState }) {
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

function StatePanel({ states }: { states: ExecutionState[] }) {
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

interface AsyncAwaitProps {
  preset?: string;
}

export function AsyncAwait({ preset = "await-flow" }: AsyncAwaitProps) {
  const data = presets[preset] ?? presets["await-flow"];
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
