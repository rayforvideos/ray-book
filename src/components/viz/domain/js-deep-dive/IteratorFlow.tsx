"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface IteratorState {
  cursorPosition: number;
  sequence: { value: string; consumed: boolean }[];
  nextResult: { value: string; done: boolean } | null;
  description: string;
  codeLine: string;
  activeLines: number[];
  generatorState?: "suspended" | "running" | "completed";
}

/* ------------------------------------------------------------------ */
/*  Presets                                                            */
/* ------------------------------------------------------------------ */

const presets: Record<string, { code: string; steps: IteratorState[] }> = {
  "array-iterator": {
    code: [
      `const arr = [1, 2, 3];`,
      `const iter = arr[Symbol.iterator]();`,
      ``,
      `iter.next(); // { value: 1, done: false }`,
      `iter.next(); // { value: 2, done: false }`,
      `iter.next(); // { value: 3, done: false }`,
      `iter.next(); // { value: undefined, done: true }`,
    ].join("\n"),

    steps: [
      {
        cursorPosition: -1,
        sequence: [
          { value: "1", consumed: false },
          { value: "2", consumed: false },
          { value: "3", consumed: false },
        ],
        nextResult: null,
        codeLine: "arr[Symbol.iterator]()",
        activeLines: [0, 1],
        description:
          "배열의 [Symbol.iterator]() 메서드를 호출하면 이터레이터 객체를 반환합니다. " +
          "이터레이터의 커서는 첫 번째 요소 앞에 위치합니다.",
      },
      {
        cursorPosition: 0,
        sequence: [
          { value: "1", consumed: true },
          { value: "2", consumed: false },
          { value: "3", consumed: false },
        ],
        nextResult: { value: "1", done: false },
        codeLine: "iter.next()",
        activeLines: [3],
        description:
          "첫 번째 next() 호출 — 커서가 첫 번째 요소로 이동합니다. " +
          "{ value: 1, done: false }를 반환합니다. done이 false이므로 아직 값이 남아 있습니다.",
      },
      {
        cursorPosition: 1,
        sequence: [
          { value: "1", consumed: true },
          { value: "2", consumed: true },
          { value: "3", consumed: false },
        ],
        nextResult: { value: "2", done: false },
        codeLine: "iter.next()",
        activeLines: [4],
        description:
          "두 번째 next() 호출 — 커서가 다음 요소로 이동합니다. " +
          "{ value: 2, done: false }를 반환합니다.",
      },
      {
        cursorPosition: 2,
        sequence: [
          { value: "1", consumed: true },
          { value: "2", consumed: true },
          { value: "3", consumed: true },
        ],
        nextResult: { value: "3", done: false },
        codeLine: "iter.next()",
        activeLines: [5],
        description:
          "세 번째 next() 호출 — 마지막 요소를 반환합니다. " +
          "{ value: 3, done: false } — 값은 있지만 done은 아직 false입니다.",
      },
      {
        cursorPosition: 3,
        sequence: [
          { value: "1", consumed: true },
          { value: "2", consumed: true },
          { value: "3", consumed: true },
        ],
        nextResult: { value: "undefined", done: true },
        codeLine: "iter.next()",
        activeLines: [6],
        description:
          "네 번째 next() 호출 — 더 이상 값이 없습니다. " +
          "{ value: undefined, done: true }를 반환합니다. " +
          "for...of는 내부적으로 done: true를 만나면 루프를 종료합니다.",
      },
    ],
  },

  generator: {
    code: [
      `function* gen() {`,
      `  console.log("시작");`,
      `  yield 10;`,
      `  console.log("재개");`,
      `  yield 20;`,
      `  console.log("끝");`,
      `  return 30;`,
      `}`,
      ``,
      `const g = gen();`,
      `g.next(); // { value: 10, done: false }`,
      `g.next(); // { value: 20, done: false }`,
      `g.next(); // { value: 30, done: true }`,
    ].join("\n"),

    steps: [
      {
        cursorPosition: -1,
        sequence: [
          { value: "10", consumed: false },
          { value: "20", consumed: false },
          { value: "30", consumed: false },
        ],
        nextResult: null,
        codeLine: "const g = gen()",
        activeLines: [9],
        generatorState: "suspended",
        description:
          "gen()을 호출하면 제너레이터 객체가 반환되지만, 함수 본문은 아직 실행되지 않습니다. " +
          "제너레이터는 suspended 상태로 시작합니다.",
      },
      {
        cursorPosition: 0,
        sequence: [
          { value: "10", consumed: true },
          { value: "20", consumed: false },
          { value: "30", consumed: false },
        ],
        nextResult: { value: "10", done: false },
        codeLine: "g.next() → yield 10",
        activeLines: [1, 2, 10],
        generatorState: "suspended",
        description:
          '첫 번째 next() — "시작"이 출력되고 yield 10에서 실행이 일시 정지됩니다. ' +
          "{ value: 10, done: false }를 반환합니다. 제너레이터는 다시 suspended 상태입니다.",
      },
      {
        cursorPosition: 1,
        sequence: [
          { value: "10", consumed: true },
          { value: "20", consumed: true },
          { value: "30", consumed: false },
        ],
        nextResult: { value: "20", done: false },
        codeLine: "g.next() → yield 20",
        activeLines: [3, 4, 11],
        generatorState: "suspended",
        description:
          '두 번째 next() — yield 10 이후부터 재개됩니다. "재개"가 출력되고 yield 20에서 다시 정지합니다. ' +
          "{ value: 20, done: false }를 반환합니다.",
      },
      {
        cursorPosition: 2,
        sequence: [
          { value: "10", consumed: true },
          { value: "20", consumed: true },
          { value: "30", consumed: true },
        ],
        nextResult: { value: "30", done: true },
        codeLine: "g.next() → return 30",
        activeLines: [5, 6, 12],
        generatorState: "completed",
        description:
          '세 번째 next() — "끝"이 출력되고 return 30으로 함수가 종료됩니다. ' +
          "{ value: 30, done: true }를 반환합니다. " +
          "done: true이므로 for...of에서는 return 값이 포함되지 않습니다.",
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function CodePanel({
  lines,
  activeLines,
}: {
  lines: string[];
  activeLines: number[];
}) {
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
              <span
                className={`select-none w-8 shrink-0 text-right pr-3 ${isActive ? "text-accent" : "text-muted"}`}
              >
                {i + 1}
              </span>
              <span
                className={`flex-1 pr-3 py-px whitespace-pre ${isActive ? "text-text" : "text-muted"}`}
              >
                {line || "\u00A0"}
              </span>
              {isActive && (
                <span className="shrink-0 pr-2 text-accent text-[0.625rem] pt-px">
                  ◄
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SequencePanel({
  step,
}: {
  step: IteratorState;
}) {
  return (
    <div className="w-52 shrink-0 max-sm:w-full">
      <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
        이터레이터 상태
      </span>

      {/* Sequence visualization */}
      <div className="mb-3">
        <span className="mb-1 block text-[0.625rem] text-muted">시퀀스</span>
        <div className="flex gap-1">
          {step.sequence.map((item, i) => {
            const isCursor = i === step.cursorPosition;
            return (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div
                  className={`flex h-8 w-10 items-center justify-center border font-mono text-[0.75rem] font-semibold transition-all ${
                    isCursor
                      ? "border-accent bg-accent/10 text-accent"
                      : item.consumed
                        ? "border-border bg-surface text-muted line-through"
                        : "border-border bg-surface text-text"
                  }`}
                >
                  {item.value}
                </div>
                {isCursor && (
                  <span className="text-[0.625rem] text-accent">▲</span>
                )}
              </div>
            );
          })}
          {/* Done slot */}
          <div className="flex flex-col items-center gap-0.5">
            <div
              className={`flex h-8 w-10 items-center justify-center border font-mono text-[0.625rem] transition-all ${
                step.cursorPosition >= step.sequence.length
                  ? "border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/70 text-red-700 dark:text-red-300"
                  : "border-border bg-surface text-muted"
              }`}
            >
              end
            </div>
            {step.cursorPosition >= step.sequence.length && (
              <span className="text-[0.625rem] text-red-500 dark:text-red-400">
                ▲
              </span>
            )}
          </div>
        </div>
      </div>

      {/* next() result */}
      <div className="mb-3">
        <span className="mb-1 block text-[0.625rem] text-muted">
          next() 반환값
        </span>
        {step.nextResult ? (
          <div
            className={`border p-2 font-mono text-[0.6875rem] ${
              step.nextResult.done
                ? "border-red-400/50 dark:border-red-500/40 bg-red-50 dark:bg-red-950/40"
                : "border-emerald-400/50 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40"
            }`}
          >
            <span className="text-muted">{"{ "}</span>
            <span className="text-text">value</span>
            <span className="text-muted">: </span>
            <span
              className={
                step.nextResult.done
                  ? "text-red-700 dark:text-red-300"
                  : "text-emerald-700 dark:text-emerald-300"
              }
            >
              {step.nextResult.value}
            </span>
            <span className="text-muted">, </span>
            <span className="text-text">done</span>
            <span className="text-muted">: </span>
            <span
              className={
                step.nextResult.done
                  ? "text-red-700 dark:text-red-300 font-semibold"
                  : "text-emerald-700 dark:text-emerald-300"
              }
            >
              {String(step.nextResult.done)}
            </span>
            <span className="text-muted">{" }"}</span>
          </div>
        ) : (
          <div className="border border-border bg-surface p-2 text-[0.6875rem] text-muted">
            아직 next() 호출 전
          </div>
        )}
      </div>

      {/* Generator state badge */}
      {step.generatorState && (
        <div>
          <span className="mb-1 block text-[0.625rem] text-muted">
            제너레이터 상태
          </span>
          <span
            className={`inline-block border px-2 py-1 text-[0.625rem] font-mono font-semibold ${
              step.generatorState === "suspended"
                ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/70 text-amber-800 dark:text-amber-200"
                : step.generatorState === "running"
                  ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-200"
                  : "border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
            }`}
          >
            {step.generatorState}
          </span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface IteratorFlowProps {
  preset?: string;
}

export function IteratorFlow({
  preset = "array-iterator",
}: IteratorFlowProps) {
  const data = presets[preset] ?? presets["array-iterator"];
  const lines = data.code.split("\n");

  const stepNodes = data.steps.map((step, idx) => (
    <div key={idx}>
      <div className="flex gap-4 max-sm:flex-col">
        <CodePanel lines={lines} activeLines={step.activeLines} />
        <SequencePanel step={step} />
      </div>

      <span className="mt-4 block border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </span>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
