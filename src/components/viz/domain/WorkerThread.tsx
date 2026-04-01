"use client";

import { StepPlayer } from "../primitives/StepPlayer";

type ThreadStatus = "idle" | "starting" | "running" | "waiting" | "done";

interface WorkerStep {
  mainActiveLines: number[];
  workerActiveLines: number[];
  mainStatus: ThreadStatus;
  workerStatus: ThreadStatus;
  message?: { direction: "→" | "←"; content: string };
  log?: string[];
  description: string;
}

interface PresetData {
  mainCode: string;
  workerCode: string;
  steps: WorkerStep[];
}

const statusStyles: Record<
  ThreadStatus,
  { bg: string; text: string; label: string }
> = {
  idle: {
    bg: "bg-stone-100 dark:bg-stone-800/40",
    text: "text-stone-600 dark:text-stone-400",
    label: "대기",
  },
  starting: {
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-700 dark:text-violet-300",
    label: "시작 중",
  },
  running: {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    text: "text-sky-700 dark:text-sky-300",
    label: "실행 중",
  },
  waiting: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    label: "대기 중",
  },
  done: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    label: "완료",
  },
};

const presets: Record<string, PresetData> = {
  basic: {
    mainCode: `const worker = new Worker('worker.js');

worker.onmessage = (e) => {
  console.log('합계:', e.data.sum);
};

worker.postMessage({ nums: bigArray });

// 워커 실행 중에도 계속 동작
updateUI();`,
    workerCode: `self.onmessage = (e) => {
  const { nums } = e.data;

  // 무거운 연산
  const sum = nums.reduce(
    (acc, n) => acc + n, 0
  );

  self.postMessage({ sum });
};`,
    steps: [
      {
        mainActiveLines: [],
        workerActiveLines: [],
        mainStatus: "idle",
        workerStatus: "idle",
        description:
          "초기 상태. 메인 스레드만 실행 중이며 Web Worker는 아직 생성되지 않았습니다. 모든 JavaScript는 이 단일 스레드에서 처리됩니다.",
      },
      {
        mainActiveLines: [0],
        workerActiveLines: [],
        mainStatus: "running",
        workerStatus: "starting",
        description:
          "new Worker('worker.js')로 전용 워커를 생성합니다. 브라우저는 별도 OS 스레드에서 worker.js를 로드하기 시작합니다. 이 시점부터 두 스레드가 존재합니다.",
      },
      {
        mainActiveLines: [2, 3, 4],
        workerActiveLines: [],
        mainStatus: "running",
        workerStatus: "waiting",
        description:
          "onmessage 핸들러를 등록합니다. 워커에서 self.postMessage()가 호출되면 이 콜백이 메인 스레드의 태스크 큐에 들어갑니다.",
      },
      {
        mainActiveLines: [6],
        workerActiveLines: [],
        mainStatus: "running",
        workerStatus: "waiting",
        message: { direction: "→", content: "{ nums: bigArray }" },
        description:
          "worker.postMessage()로 데이터를 전송합니다. 기본적으로 구조적 복제(Structured Clone)로 데이터가 복사됩니다. 대용량 데이터라면 복사 비용이 발생합니다.",
      },
      {
        mainActiveLines: [9],
        workerActiveLines: [0, 1],
        mainStatus: "running",
        workerStatus: "running",
        description:
          "두 스레드가 동시에 실행됩니다. 워커는 메시지를 수신해 처리를 시작하고, 메인 스레드는 updateUI()를 계속 실행합니다. UI가 블로킹되지 않습니다.",
      },
      {
        mainActiveLines: [2, 3, 4],
        workerActiveLines: [4, 5, 6],
        mainStatus: "waiting",
        workerStatus: "running",
        description:
          "워커가 무거운 계산을 수행하는 동안, 메인 스레드의 이벤트 루프는 자유롭습니다. 사용자 클릭, 스크롤 등 UI 이벤트에 반응할 수 있습니다.",
      },
      {
        mainActiveLines: [2, 3, 4],
        workerActiveLines: [8],
        mainStatus: "waiting",
        workerStatus: "done",
        message: { direction: "←", content: "{ sum: 5000050000 }" },
        description:
          "워커가 연산을 완료하고 self.postMessage()로 결과를 전송합니다. 결과는 메인 스레드의 태스크 큐에 등록됩니다.",
      },
      {
        mainActiveLines: [3],
        workerActiveLines: [],
        mainStatus: "done",
        workerStatus: "done",
        log: ["합계: 5000050000"],
        description:
          "메인 스레드의 onmessage 핸들러가 실행되어 결과를 출력합니다. 워커는 worker.terminate()로 종료하거나, 다음 작업을 위해 재사용할 수 있습니다.",
      },
    ],
  },
};

function CodePane({
  title,
  code,
  activeLines,
  statusKey,
}: {
  title: string;
  code: string;
  activeLines: number[];
  statusKey: ThreadStatus;
}) {
  const lines = code.split("\n");
  const ss = statusStyles[statusKey];
  return (
    <div className="flex-1 min-w-0">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
          {title}
        </span>
        <span
          className={`px-1.5 py-px font-mono text-[0.5rem] font-bold ${ss.bg} ${ss.text}`}
        >
          {ss.label}
        </span>
      </div>
      <div className="rounded-sm bg-surface font-mono text-[0.6875rem] leading-relaxed overflow-x-auto">
        {lines.map((line, i) => {
          const isActive = activeLines.includes(i);
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
  );
}

interface WorkerThreadProps {
  preset?: string;
}

export function WorkerThread({ preset = "basic" }: WorkerThreadProps) {
  const data = presets[preset] ?? presets["basic"];

  const stepNodes = data.steps.map((step, idx) => (
    <div key={idx} className="space-y-3">
      <div className="flex gap-3 max-sm:flex-col">
        <CodePane
          title="메인 스레드 (main.js)"
          code={data.mainCode}
          activeLines={step.mainActiveLines}
          statusKey={step.mainStatus}
        />

        {/* Message channel — desktop */}
        <div className="w-20 shrink-0 flex flex-col items-center justify-center gap-1.5 max-sm:hidden">
          <span className="text-[0.5rem] uppercase tracking-wider text-muted">
            채널
          </span>
          {step.message ? (
            <div className="flex flex-col items-center gap-1">
              <span
                className={`text-lg leading-none ${
                  step.message.direction === "→"
                    ? "text-sky-500 dark:text-sky-400"
                    : "text-violet-500 dark:text-violet-400"
                }`}
              >
                {step.message.direction}
              </span>
              <span className="font-mono text-[0.5rem] text-center text-muted break-all">
                {step.message.content}
              </span>
            </div>
          ) : (
            <span className="text-[0.5625rem] text-muted/30">—</span>
          )}
        </div>

        {/* Message — mobile */}
        {step.message && (
          <div className="sm:hidden flex items-center gap-2 bg-surface px-2 py-1.5">
            <span
              className={`font-mono text-base ${
                step.message.direction === "→"
                  ? "text-sky-500 dark:text-sky-400"
                  : "text-violet-500 dark:text-violet-400"
              }`}
            >
              {step.message.direction}
            </span>
            <span className="font-mono text-[0.625rem] text-muted">
              {step.message.content}
            </span>
          </div>
        )}

        <CodePane
          title="워커 스레드 (worker.js)"
          code={data.workerCode}
          activeLines={step.workerActiveLines}
          statusKey={step.workerStatus}
        />
      </div>

      {step.log && step.log.length > 0 && (
        <div className="bg-surface px-3 py-1.5 font-mono text-[0.6875rem] text-text">
          {step.log.map((l, i) => (
            <span key={i} className="block">
              → {l}
            </span>
          ))}
        </div>
      )}

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
