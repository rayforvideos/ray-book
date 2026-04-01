"use client";

import { StepPlayer } from "../primitives/StepPlayer";

type StepPhase = "normal" | "error" | "safe";

interface WorkerState {
  local: string | null;
  op: string;
  active: boolean;
}

interface RaceStep {
  counter: number;
  workerA: WorkerState;
  workerB: WorkerState;
  phase: StepPhase;
  activeLines: number[];
  description: string;
}

const presets: Record<string, { code: string; steps: RaceStep[] }> = {
  race: {
    code: `// 레이스 컨디션 (Atomics 없이)
const sab = new SharedArrayBuffer(4);
const view = new Int32Array(sab);

// Worker A (worker-a.js)
const local = view[0];    // 1. 읽기
view[0] = local + 1;     // 2. 쓰기

// Worker B (worker-b.js)
const local = view[0];    // 1. 읽기
view[0] = local + 1;     // 2. 쓰기`,
    steps: [
      {
        counter: 0,
        workerA: { local: null, op: "대기", active: false },
        workerB: { local: null, op: "대기", active: false },
        phase: "normal",
        activeLines: [0, 1, 2],
        description:
          "SharedArrayBuffer를 생성하고 Int32Array 뷰를 만듭니다. 초기값은 0입니다. 두 워커가 이 공유 메모리를 동시에 접근할 수 있습니다.",
      },
      {
        counter: 0,
        workerA: { local: "0", op: "읽기 완료", active: true },
        workerB: { local: null, op: "대기", active: false },
        phase: "normal",
        activeLines: [5],
        description:
          "Worker A가 view[0]을 읽어 로컬 변수에 저장합니다. 현재 값은 0입니다. 아직 쓰기는 하지 않았습니다.",
      },
      {
        counter: 0,
        workerA: { local: "0", op: "읽기 완료", active: false },
        workerB: { local: "0", op: "읽기 완료", active: true },
        phase: "normal",
        activeLines: [9],
        description:
          "컨텍스트 스위치! Worker B가 실행되어 view[0]을 읽습니다. Worker A가 아직 쓰기를 하지 않았으므로 B도 0을 읽습니다. 두 워커의 로컬 변수 모두 0입니다.",
      },
      {
        counter: 1,
        workerA: { local: "0", op: "0+1 → 쓰기", active: true },
        workerB: { local: "0", op: "읽기 완료", active: false },
        phase: "normal",
        activeLines: [6],
        description:
          "Worker A가 local+1 = 0+1 = 1을 계산하고 view[0]에 씁니다. 공유 메모리의 카운터가 1이 됩니다.",
      },
      {
        counter: 1,
        workerA: { local: "0", op: "완료", active: false },
        workerB: { local: "0", op: "0+1 → 쓰기", active: true },
        phase: "error",
        activeLines: [10],
        description:
          "Worker B도 local+1 = 0+1 = 1을 계산하고 씁니다. 카운터가 여전히 1입니다. 두 번 증가했지만 결과는 1 — 갱신 손실(Lost Update)이 발생했습니다. 예상값: 2, 실제값: 1.",
      },
    ],
  },
  atomics: {
    code: `// Atomics 사용 (안전)
const sab = new SharedArrayBuffer(4);
const view = new Int32Array(sab);

// Worker A (worker-a.js)
Atomics.add(view, 0, 1);  // 원자적 증가

// Worker B (worker-b.js)
Atomics.add(view, 0, 1);  // 원자적 증가

// 결과: view[0] === 2 ✓`,
    steps: [
      {
        counter: 0,
        workerA: { local: null, op: "대기", active: false },
        workerB: { local: null, op: "대기", active: false },
        phase: "safe",
        activeLines: [0, 1, 2],
        description:
          "동일한 SharedArrayBuffer를 생성합니다. 이번에는 Atomics.add를 사용합니다. 읽기-수정-쓰기 전체가 하나의 원자적(atomic) 연산으로 처리됩니다.",
      },
      {
        counter: 1,
        workerA: { local: null, op: "Atomics.add 완료", active: true },
        workerB: { local: null, op: "대기", active: false },
        phase: "safe",
        activeLines: [5],
        description:
          "Worker A가 Atomics.add(view, 0, 1)을 실행합니다. 읽기→수정→쓰기가 원자적으로 처리되어 중간에 다른 스레드가 끼어들 수 없습니다. 카운터: 0 → 1.",
      },
      {
        counter: 2,
        workerA: { local: null, op: "완료", active: false },
        workerB: { local: null, op: "Atomics.add 완료", active: true },
        phase: "safe",
        activeLines: [8],
        description:
          "Worker B가 Atomics.add(view, 0, 1)을 실행합니다. Worker A의 결과(1)가 완전히 반영된 후 원자적으로 1을 더합니다. 카운터: 1 → 2.",
      },
      {
        counter: 2,
        workerA: { local: null, op: "완료", active: false },
        workerB: { local: null, op: "완료", active: false },
        phase: "safe",
        activeLines: [10],
        description:
          "최종 결과: view[0] === 2. 예상값과 일치합니다. Atomics는 동시성 환경에서 공유 메모리를 안전하게 다루는 유일한 방법입니다.",
      },
    ],
  },
};

function WorkerBox({
  label,
  state,
  phase,
}: {
  label: string;
  state: WorkerState;
  phase: StepPhase;
}) {
  const isError = phase === "error" && state.active;
  const isSafe = phase === "safe" && state.active;
  return (
    <div
      className={`border p-2 transition-all ${
        isError
          ? "border-rose-400/60 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-950/40"
          : isSafe
            ? "border-emerald-400/60 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-950/40"
            : state.active
              ? "border-sky-400/50 bg-sky-50 dark:border-sky-500/40 dark:bg-sky-950/40"
              : "border-border bg-surface"
      }`}
    >
      <span className="block text-[0.5625rem] font-bold uppercase text-muted mb-1">
        {label}
      </span>
      {state.local !== null && (
        <div className="flex items-baseline justify-between font-mono text-[0.625rem] mb-0.5">
          <span className="text-muted">local</span>
          <span className="text-text">{state.local}</span>
        </div>
      )}
      <span
        className={`block font-mono text-[0.5625rem] ${
          isError
            ? "text-rose-700 dark:text-rose-300"
            : isSafe
              ? "text-emerald-700 dark:text-emerald-300"
              : state.active
                ? "text-sky-700 dark:text-sky-300"
                : "text-muted/50"
        }`}
      >
        {state.op}
      </span>
    </div>
  );
}

interface SharedMemoryRaceProps {
  preset?: string;
}

export function SharedMemoryRace({ preset = "race" }: SharedMemoryRaceProps) {
  const data = presets[preset] ?? presets["race"];
  const lines = data.code.split("\n");

  const stepNodes = data.steps.map((step, idx) => {
    const isError = step.phase === "error";
    const isSafe = step.phase === "safe";

    return (
      <div key={idx} className="space-y-3">
        <div className="flex gap-4 max-sm:flex-col">
          {/* Code */}
          <div className="flex-1 min-w-0">
            <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
              코드
            </span>
            <div className="rounded-sm bg-surface font-mono text-[0.6875rem] leading-relaxed overflow-x-auto">
              {lines.map((line, i) => {
                const isActive = step.activeLines.includes(i);
                return (
                  <div
                    key={i}
                    className={`flex transition-colors duration-150 ${isActive ? "bg-accent/10" : ""}`}
                  >
                    <span
                      className={`select-none w-7 shrink-0 text-right pr-2 ${isActive ? "text-accent" : "text-muted/50"}`}
                    >
                      {i + 1}
                    </span>
                    <span
                      className={`flex-1 pr-2 py-px whitespace-pre ${isActive ? "text-text" : "text-muted/50"}`}
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

          {/* State panel */}
          <div className="w-44 shrink-0 max-sm:w-full space-y-2">
            <div>
              <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
                공유 메모리
              </span>
              <div
                className={`border p-2 ${
                  isError
                    ? "border-rose-400/60 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-950/40"
                    : isSafe
                      ? "border-emerald-400/60 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-950/40"
                      : "border-stone-400/50 bg-stone-50 dark:border-stone-500/40 dark:bg-stone-900/40"
                }`}
              >
                <span className="block font-mono text-[0.5rem] text-muted mb-0.5">
                  SharedArrayBuffer
                </span>
                <div className="flex items-baseline justify-between font-mono">
                  <span className="text-[0.625rem] text-muted">view[0]</span>
                  <span
                    className={`text-xl font-bold leading-none ${
                      isError
                        ? "text-rose-700 dark:text-rose-300"
                        : isSafe
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-text"
                    }`}
                  >
                    {step.counter}
                  </span>
                </div>
                {isError && (
                  <span className="mt-1 block text-[0.5rem] font-bold text-rose-600 dark:text-rose-400">
                    ✗ 예상: 2 / 실제: 1
                  </span>
                )}
                {isSafe && step.counter === 2 && (
                  <span className="mt-1 block text-[0.5rem] font-bold text-emerald-600 dark:text-emerald-400">
                    ✓ 예상: 2 / 실제: 2
                  </span>
                )}
              </div>
            </div>

            <WorkerBox label="Worker A" state={step.workerA} phase={step.phase} />
            <WorkerBox label="Worker B" state={step.workerB} phase={step.phase} />
          </div>
        </div>

        <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
          {step.description}
        </div>
      </div>
    );
  });

  return <StepPlayer steps={stepNodes} />;
}
