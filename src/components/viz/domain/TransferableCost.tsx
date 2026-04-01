"use client";

import { StepPlayer } from "../primitives/StepPlayer";

type Approach = "initial" | "copy" | "transfer";

interface TransferStep {
  approach: Approach;
  mainBlocks: number;
  workerBlocks: number;
  mainDetached: boolean;
  activeLines: number[];
  bytesCopied?: string;
  note?: { type: "warn" | "ok"; text: string };
  description: string;
}

const TOTAL_BLOCKS = 12;

function BufferBar({
  label,
  filledBlocks,
  detached,
  sizeLabel,
}: {
  label: string;
  filledBlocks: number;
  detached: boolean;
  sizeLabel: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[0.5625rem] text-muted">{label}</span>
        <span
          className={`font-mono text-[0.5rem] font-bold ${
            detached
              ? "text-rose-600 dark:text-rose-400"
              : filledBlocks === 0
                ? "text-muted/40"
                : "text-text"
          }`}
        >
          {detached ? "detached" : sizeLabel}
        </span>
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: TOTAL_BLOCKS }).map((_, i) => (
          <div
            key={i}
            className={`h-4 flex-1 transition-colors duration-200 ${
              detached
                ? "border border-rose-300 dark:border-rose-800"
                : i < filledBlocks
                  ? "bg-sky-400 dark:bg-sky-500"
                  : "bg-stone-200 dark:bg-stone-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

const codeLines = [
  `const buf = new ArrayBuffer(256 * 1024 * 1024);`,
  ``,
  `// 복사 방식 (transfer 배열 없음)`,
  `worker.postMessage({ buf });`,
  `console.log(buf.byteLength); // 268435456`,
  ``,
  `// 전송 방식 (transfer 배열 지정)`,
  `worker.postMessage({ buf }, [buf]);`,
  `console.log(buf.byteLength); // 0 (detached!)`,
];

const steps: TransferStep[] = [
  {
    approach: "initial",
    mainBlocks: TOTAL_BLOCKS,
    workerBlocks: 0,
    mainDetached: false,
    activeLines: [0],
    description:
      "256MB ArrayBuffer를 생성합니다. 현재는 메인 스레드만 이 버퍼를 소유합니다. 이 버퍼를 워커에 전달하는 두 가지 방법을 비교해봅니다.",
  },
  {
    approach: "copy",
    mainBlocks: TOTAL_BLOCKS,
    workerBlocks: TOTAL_BLOCKS,
    mainDetached: false,
    activeLines: [2, 3],
    bytesCopied: "256 MB 복사됨",
    note: { type: "warn", text: "256MB 복사 발생 — 느리고 메모리 2배 사용" },
    description:
      "transfer 배열 없이 postMessage를 호출하면 구조적 복제(Structured Clone)로 데이터가 복사됩니다. 메인 스레드의 버퍼는 그대로 남고, 워커는 복사본을 받습니다. 256MB 버퍼라면 복사에 수백 ms가 걸릴 수 있습니다.",
  },
  {
    approach: "copy",
    mainBlocks: TOTAL_BLOCKS,
    workerBlocks: TOTAL_BLOCKS,
    mainDetached: false,
    activeLines: [4],
    note: {
      type: "warn",
      text: "원본 유효 — 메인과 워커가 각각 256MB 보유 (총 512MB)",
    },
    description:
      "복사 방식에서는 postMessage 이후에도 메인 스레드의 buf.byteLength가 원래 크기를 유지합니다. 두 스레드가 독립적인 복사본을 보유합니다.",
  },
  {
    approach: "transfer",
    mainBlocks: 0,
    workerBlocks: TOTAL_BLOCKS,
    mainDetached: true,
    activeLines: [6, 7],
    bytesCopied: "0 B 복사됨",
    note: { type: "ok", text: "소유권 이전 — 복사 없음, 즉시 완료" },
    description:
      "postMessage의 두 번째 인자에 전송할 객체 배열을 지정합니다. ArrayBuffer의 소유권이 워커로 이전됩니다. 메모리를 복사하지 않고 포인터만 이동하므로 256MB라도 거의 즉시 완료됩니다.",
  },
  {
    approach: "transfer",
    mainBlocks: 0,
    workerBlocks: TOTAL_BLOCKS,
    mainDetached: true,
    activeLines: [8],
    note: {
      type: "warn",
      text: "원본 접근 시 TypeError — byteLength: 0, 모든 read/write 불가",
    },
    description:
      "전송 후 메인 스레드의 buf는 분리(detached) 상태가 됩니다. byteLength는 0이 되고 모든 접근이 TypeError를 발생시킵니다. 소유권은 워커에게만 있습니다.",
  },
];

export function TransferableCost() {
  const stepNodes = steps.map((step, idx) => (
    <div key={idx} className="space-y-3">
      {step.approach !== "initial" && (
        <span
          className={`inline-block px-2 py-0.5 font-mono text-[0.6875rem] font-bold ${
            step.approach === "copy"
              ? "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
              : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
          }`}
        >
          {step.approach === "copy"
            ? "복사 방식 (Structured Clone)"
            : "전송 방식 (Transferable)"}
        </span>
      )}

      <div className="flex gap-4 max-sm:flex-col">
        {/* Code panel */}
        <div className="flex-1 min-w-0">
          <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
            코드
          </span>
          <div className="rounded-sm bg-surface font-mono text-[0.6875rem] leading-relaxed overflow-x-auto">
            {codeLines.map((line, i) => {
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

        {/* Buffer visualization */}
        <div className="w-52 shrink-0 max-sm:w-full space-y-3">
          <div>
            <span className="mb-2 block text-[0.6875rem] uppercase tracking-wider text-muted">
              메모리
            </span>
            <div className="space-y-2.5">
              <BufferBar
                label="메인 스레드  buf"
                filledBlocks={step.mainBlocks}
                detached={step.mainDetached}
                sizeLabel="256 MB"
              />

              <div className="flex items-center gap-2">
                <div className="h-px flex-1 border-t border-dashed border-border" />
                {step.bytesCopied && (
                  <span
                    className={`shrink-0 font-mono text-[0.5rem] font-bold ${
                      step.bytesCopied.startsWith("0")
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {step.bytesCopied}
                  </span>
                )}
                <div className="h-px flex-1 border-t border-dashed border-border" />
              </div>

              <BufferBar
                label="워커 스레드  buf"
                filledBlocks={step.workerBlocks}
                detached={false}
                sizeLabel="256 MB"
              />
            </div>
          </div>

          {step.note && (
            <div
              className={`px-2 py-1.5 text-[0.5625rem] leading-snug ${
                step.note.type === "warn"
                  ? "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                  : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
              }`}
            >
              {step.note.text}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
