"use client";

import { StepPlayer } from "../primitives/StepPlayer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PromiseState {
  label: string;
  state: "pending" | "fulfilled" | "rejected";
  value?: string;
}

interface PromiseStep {
  promises: PromiseState[];
  codeLine: string;
  activeLines: number[];
  description: string;
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const stateStyles = {
  pending: {
    border: "border-amber-400/50 dark:border-amber-500/40",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-800 dark:text-amber-200",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
  },
  fulfilled: {
    border: "border-emerald-400/50 dark:border-emerald-500/40",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-800 dark:text-emerald-200",
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
  },
  rejected: {
    border: "border-red-400/50 dark:border-red-500/40",
    bg: "bg-red-50 dark:bg-red-950/40",
    text: "text-red-800 dark:text-red-200",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300",
  },
};

const stateLabels = {
  pending: "Pending",
  fulfilled: "Fulfilled",
  rejected: "Rejected",
};

/* ------------------------------------------------------------------ */
/*  Presets                                                            */
/* ------------------------------------------------------------------ */

const presets: Record<string, { code: string; steps: PromiseStep[] }> = {
  /* ---- 상태 전환 -------------------------------------------------- */
  "state-transition": {
    code: [
      `const p = new Promise((resolve, reject) => {`,
      `  setTimeout(() => resolve("done"), 1000);`,
      `});`,
      ``,
      `p.then(value => console.log(value));`,
    ].join("\n"),

    steps: [
      {
        codeLine: "new Promise((resolve, reject) => {...})",
        activeLines: [0, 1, 2],
        promises: [
          { label: "p", state: "pending" },
        ],
        description:
          "Promise가 생성되면 즉시 executor 함수가 실행됩니다. " +
          "resolve나 reject가 호출되기 전까지 상태는 pending입니다.",
      },
      {
        codeLine: "p.then((value) => console.log(value))",
        activeLines: [4],
        promises: [
          { label: "p", state: "pending" },
          { label: ".then()", state: "pending" },
        ],
        description:
          ".then()은 새로운 Promise를 반환합니다. " +
          "p가 아직 pending이므로 콜백은 등록만 되고 실행되지 않습니다.",
      },
      {
        codeLine: 'resolve("done") — 1초 후',
        activeLines: [1],
        promises: [
          { label: "p", state: "fulfilled", value: '"done"' },
          { label: ".then()", state: "pending" },
        ],
        description:
          'setTimeout 콜백에서 resolve("done")가 호출됩니다. ' +
          "p의 상태가 pending → fulfilled로 변경됩니다. " +
          "이 전환은 되돌릴 수 없습니다.",
      },
      {
        codeLine: 'console.log("done")',
        activeLines: [4],
        promises: [
          { label: "p", state: "fulfilled", value: '"done"' },
          { label: ".then()", state: "fulfilled", value: "undefined" },
        ],
        description:
          "p가 fulfilled되었으므로 .then()의 콜백이 마이크로태스크 큐에 들어가 실행됩니다. " +
          'console.log("done")이 출력됩니다.',
      },
    ],
  },

  /* ---- 체이닝 ------------------------------------------------------ */
  chaining: {
    code: [
      `fetch("/user/1")`,
      `  .then(r => r.json())`,
      `  .then(u => fetch("/orders/" + u.id))`,
      `  .then(r => r.json())`,
      `  .then(orders => console.log(orders))`,
      `  .catch(err => console.error(err));`,
    ].join("\n"),

    steps: [
      {
        codeLine: 'fetch("/user/1")',
        activeLines: [0],
        promises: [
          { label: "fetch()", state: "pending" },
        ],
        description:
          "fetch()가 네트워크 요청을 시작하고 Promise를 반환합니다. " +
          "응답이 올 때까지 pending 상태입니다.",
      },
      {
        codeLine: "→ res.json()",
        activeLines: [1],
        promises: [
          { label: "fetch()", state: "fulfilled", value: "Response" },
          { label: ".then(res.json)", state: "pending" },
        ],
        description:
          "응답이 도착하면 첫 번째 .then() 콜백이 실행됩니다. " +
          "res.json()도 Promise를 반환하므로, 체인은 이 Promise가 완료될 때까지 기다립니다.",
      },
      {
        codeLine: "→ fetch(/orders/${user.id})",
        activeLines: [2],
        promises: [
          { label: "fetch()", state: "fulfilled", value: "Response" },
          { label: ".then(res.json)", state: "fulfilled", value: "{id: 1, ...}" },
          { label: ".then(fetch)", state: "pending" },
        ],
        description:
          "JSON 파싱이 완료되면 user 객체가 다음 .then()으로 전달됩니다. " +
          "콜백 지옥 없이 순차적 비동기 작업이 평탄하게 이어집니다.",
      },
      {
        codeLine: "→ orders",
        activeLines: [3, 4],
        promises: [
          { label: "fetch()", state: "fulfilled", value: "Response" },
          { label: ".then(res.json)", state: "fulfilled", value: "{id: 1, ...}" },
          { label: ".then(fetch)", state: "fulfilled", value: "Response" },
          { label: ".then(res.json)", state: "fulfilled", value: "[{...}, ...]" },
          { label: ".then(log)", state: "fulfilled", value: "undefined" },
        ],
        description:
          "모든 체인이 완료되었습니다. 콜백 방식과 비교하면: " +
          "들여쓰기 없이 평탄하고, 에러는 마지막 .catch() 하나로 처리됩니다.",
      },
    ],
  },

  /* ---- 에러 전파 --------------------------------------------------- */
  "error-propagation": {
    code: [
      `Promise.resolve(1)`,
      `  .then(v => {`,
      `    throw new Error("실패!");`,
      `  })`,
      `  .then(v => console.log("건너뜀"))`,
      `  .catch(e => console.error(e.message))`,
      `  .then(() => console.log("복구됨"));`,
    ].join("\n"),

    steps: [
      {
        codeLine: "Promise.resolve(1)",
        activeLines: [0],
        promises: [
          { label: "Promise.resolve", state: "fulfilled", value: "1" },
        ],
        description:
          "Promise.resolve(1)은 즉시 fulfilled 상태인 Promise를 만듭니다.",
      },
      {
        codeLine: 'throw new Error("실패!")',
        activeLines: [1, 2, 3],
        promises: [
          { label: "Promise.resolve", state: "fulfilled", value: "1" },
          { label: ".then(throw)", state: "rejected", value: "Error: 실패!" },
        ],
        description:
          ".then() 콜백 안에서 throw하면 반환된 Promise가 rejected됩니다. " +
          "try-catch를 쓸 필요 없이, Promise 체인이 에러를 자동으로 전파합니다.",
      },
      {
        codeLine: '.then(v => console.log("건너뜀")) — 건너뜀!',
        activeLines: [4],
        promises: [
          { label: "Promise.resolve", state: "fulfilled", value: "1" },
          { label: ".then(throw)", state: "rejected", value: "Error: 실패!" },
          { label: ".then(log)", state: "rejected", value: "Error: 실패!" },
        ],
        description:
          "rejected 상태는 .catch()를 만날 때까지 체인을 따라 전파됩니다. " +
          "중간의 .then()은 건너뜁니다. " +
          "콜백 방식에서 매번 if (err)를 체크하던 것과 비교됩니다.",
      },
      {
        codeLine: ".catch(err => console.error(err.message))",
        activeLines: [5],
        promises: [
          { label: "Promise.resolve", state: "fulfilled", value: "1" },
          { label: ".then(throw)", state: "rejected", value: "Error: 실패!" },
          { label: ".then(log)", state: "rejected", value: "Error: 실패!" },
          { label: ".catch()", state: "fulfilled", value: "undefined" },
        ],
        description:
          ".catch()가 에러를 처리합니다. " +
          "중요한 점: .catch()도 새 Promise를 반환하며, " +
          '에러 없이 완료되면 fulfilled 상태가 됩니다. 체인이 "복구"됩니다.',
      },
      {
        codeLine: '.then(() => console.log("복구됨"))',
        activeLines: [6],
        promises: [
          { label: "Promise.resolve", state: "fulfilled", value: "1" },
          { label: ".then(throw)", state: "rejected", value: "Error: 실패!" },
          { label: ".then(log)", state: "rejected", value: "Error: 실패!" },
          { label: ".catch()", state: "fulfilled", value: "undefined" },
          { label: ".then(복구)", state: "fulfilled", value: "undefined" },
        ],
        description:
          ".catch() 이후의 .then()은 정상적으로 실행됩니다. " +
          '"복구됨"이 출력됩니다. 이것이 Promise의 에러 복구 메커니즘입니다.',
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
              <span className={`flex-1 pr-3 py-px ${isActive ? "text-text" : "text-muted/50"}`}>
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

function PromiseBadge({ promise }: { promise: PromiseState }) {
  const s = stateStyles[promise.state];

  return (
    <div className={`border p-2 transition-all ${s.border} ${s.bg}`}>
      <div className="flex items-center justify-between gap-1.5">
        <span className={`text-[0.625rem] font-bold ${s.text}`}>
          {promise.label}
        </span>
        <span
          className={`rounded-sm px-1.5 py-0.5 text-[0.5rem] font-mono font-bold ${s.badge}`}
        >
          {stateLabels[promise.state]}
        </span>
      </div>

      {promise.value && (
        <div className="mt-1 font-mono text-[0.625rem] text-muted">
          → {promise.value}
        </div>
      )}
    </div>
  );
}

function ChainPanel({ promises }: { promises: PromiseState[] }) {
  return (
    <div className="w-48 shrink-0 max-sm:w-full">
      <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
        Promise 체인
      </span>
      <div className="space-y-1.5">
        {promises.map((p, i) => (
          <PromiseBadge key={`${p.label}-${i}`} promise={p} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface PromiseChainProps {
  preset?: string;
}

export function PromiseChain({ preset = "state-transition" }: PromiseChainProps) {
  const data = presets[preset] ?? presets["state-transition"];
  const lines = data.code.split("\n");

  const stepNodes = data.steps.map((step, idx) => (
    <div key={idx}>
      <div className="flex gap-4 max-sm:flex-col">
        <CodePanel lines={lines} activeLines={step.activeLines} />
        <ChainPanel promises={step.promises} />
      </div>

      <span className="mt-4 block border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </span>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
