"use client";

import { StepPlayer } from "../primitives/StepPlayer";

interface LoopStep {
  callStack: string[];
  taskQueue: string[];
  microtaskQueue: string[];
  webAPI?: string[];
  log: string[];
  activeLines: number[];
  phase: "callstack" | "microtask" | "task" | "render" | "idle";
  description: string;
}

const phaseStyles = {
  callstack: { label: "콜스택 실행", bg: "bg-sky-50 dark:bg-sky-950/40", text: "text-sky-900 dark:text-sky-100" },
  microtask: { label: "마이크로태스크", bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-900 dark:text-violet-100" },
  task: { label: "태스크 (매크로)", bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-900 dark:text-amber-100" },
  render: { label: "렌더링", bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-900 dark:text-emerald-100" },
  idle: { label: "대기", bg: "bg-stone-100 dark:bg-stone-800/40", text: "text-stone-700 dark:text-stone-200" },
};

const presets: Record<string, { code: string; steps: LoopStep[] }> = {
  "setTimeout-promise": {
    code: `console.log("1");

setTimeout(() => {
  console.log("2");
}, 0);

Promise.resolve()
  .then(() => console.log("3"))
  .then(() => console.log("4"));

console.log("5");`,
    steps: [
      {
        callStack: ["script"],
        taskQueue: [],
        microtaskQueue: [],
        activeLines: [],
        log: [],
        phase: "callstack",
        description: "스크립트 전체가 하나의 태스크로 콜스택에 올라갑니다.",
      },
      {
        callStack: ["script", 'console.log("1")'],
        taskQueue: [],
        microtaskQueue: [],
        activeLines: [0],
        log: ["1"],
        phase: "callstack",
        description: 'console.log("1") 실행. 동기 코드이므로 즉시 실행되고 "1"이 출력됩니다.',
      },
      {
        callStack: ["script"],
        taskQueue: [],
        microtaskQueue: [],
        webAPI: ["setTimeout (0ms)"],
        activeLines: [2, 3, 4],
        log: ["1"],
        phase: "callstack",
        description: "setTimeout을 만나면 콜백을 Web API에 등록합니다. 타이머가 0ms이므로 즉시 태스크 큐로 이동할 준비가 됩니다.",
      },
      {
        callStack: ["script"],
        taskQueue: ['() => log("2")'],
        microtaskQueue: [],
        activeLines: [2, 3, 4],
        log: ["1"],
        phase: "callstack",
        description: "타이머가 만료되어 콜백이 태스크 큐에 들어갑니다. 하지만 콜스택이 비어있지 않으므로 아직 실행되지 않습니다.",
      },
      {
        callStack: ["script"],
        taskQueue: ['() => log("2")'],
        microtaskQueue: ['() => log("3")'],
        activeLines: [6, 7],
        log: ["1"],
        phase: "callstack",
        description: "Promise.resolve().then()을 만납니다. Promise가 이미 resolved이므로 then 콜백이 즉시 마이크로태스크 큐에 들어갑니다.",
      },
      {
        callStack: ["script", 'console.log("5")'],
        taskQueue: ['() => log("2")'],
        microtaskQueue: ['() => log("3")'],
        activeLines: [10],
        log: ["1", "5"],
        phase: "callstack",
        description: 'console.log("5") 실행. 동기 코드이므로 즉시 실행. "5"가 출력됩니다. 스크립트의 동기 코드가 모두 끝났습니다.',
      },
      {
        callStack: [],
        taskQueue: ['() => log("2")'],
        microtaskQueue: ['() => log("3")'],
        activeLines: [],
        log: ["1", "5"],
        phase: "callstack",
        description: "script가 콜스택에서 pop됩니다. 콜스택이 비었으므로 이벤트 루프가 마이크로태스크 큐를 확인합니다.",
      },
      {
        callStack: ['() => log("3")'],
        taskQueue: ['() => log("2")'],
        microtaskQueue: [],
        activeLines: [7],
        log: ["1", "5", "3"],
        phase: "microtask",
        description: '마이크로태스크 큐에서 콜백을 꺼내 실행합니다. "3"이 출력됩니다. 이 콜백의 .then()이 새 마이크로태스크를 등록합니다.',
      },
      {
        callStack: ['() => log("4")'],
        taskQueue: ['() => log("2")'],
        microtaskQueue: [],
        activeLines: [8],
        log: ["1", "5", "3", "4"],
        phase: "microtask",
        description: '새로 등록된 마이크로태스크를 즉시 실행합니다. "4"가 출력됩니다. 마이크로태스크 큐가 완전히 비었습니다.',
      },
      {
        callStack: ['() => log("2")'],
        taskQueue: [],
        microtaskQueue: [],
        activeLines: [3],
        log: ["1", "5", "3", "4", "2"],
        phase: "task",
        description: '마이크로태스크가 모두 처리된 후, 태스크 큐에서 setTimeout 콜백을 꺼내 실행합니다. "2"가 출력됩니다.',
      },
      {
        callStack: [],
        taskQueue: [],
        microtaskQueue: [],
        activeLines: [],
        log: ["1", "5", "3", "4", "2"],
        phase: "idle",
        description: "모든 큐가 비었습니다. 최종 출력 순서: 1, 5, 3, 4, 2. 동기 → 마이크로태스크 → 매크로태스크 순서가 핵심입니다.",
      },
    ],
  },
};

interface EventLoopFullProps {
  preset?: string;
}

export function EventLoopFull({ preset = "setTimeout-promise" }: EventLoopFullProps) {
  const data = presets[preset] ?? presets["setTimeout-promise"];
  const lines = data.code.split("\n");

  const stepNodes = data.steps.map((step, idx) => {
    const ps = phaseStyles[step.phase];
    return (
      <div key={idx} className="space-y-3">
        {/* Phase badge */}
        <span className={`inline-block px-2 py-0.5 font-mono text-[0.6875rem] font-bold ${ps.bg} ${ps.text}`}>
          {ps.label}
        </span>

        <div className="flex gap-3 max-sm:flex-col">
          {/* Code */}
          <div className="flex-1 min-w-0">
            <span className="mb-1 block text-[0.6875rem] uppercase tracking-wider text-muted">코드</span>
            <div className="rounded-sm bg-surface font-mono text-[0.6875rem] leading-relaxed overflow-x-auto">
              {lines.map((line, i) => {
                const isActive = step.activeLines.includes(i);
                return (
                  <div key={i} className={`flex transition-colors duration-150 ${isActive ? "bg-accent/10" : ""}`}>
                    <span className={`select-none w-7 shrink-0 text-right pr-2 ${isActive ? "text-accent" : "text-muted/50"}`}>{i + 1}</span>
                    <span className={`flex-1 pr-2 py-px whitespace-pre ${isActive ? "text-text" : "text-muted/50"}`}>{line || "\u00A0"}</span>
                    {isActive && <span className="shrink-0 pr-2 text-accent text-[0.625rem] pt-px">◄</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Queues */}
          <div className="w-48 shrink-0 space-y-2 max-sm:w-full">
            {/* Call Stack */}
            <div>
              <span className="mb-1 block text-[0.6875rem] uppercase tracking-wider text-muted">콜스택</span>
              <div className="min-h-[3rem] border border-sky-400/50 bg-sky-50 p-1.5 dark:border-sky-500/40 dark:bg-sky-950/40">
                {step.callStack.length > 0 ? (
                  <div className="flex flex-col-reverse gap-0.5">
                    {step.callStack.map((item, i) => (
                      <span key={i} className={`block px-1.5 py-0.5 font-mono text-[0.5625rem] ${i === step.callStack.length - 1 ? "bg-sky-200 text-sky-900 dark:bg-sky-800 dark:text-sky-100" : "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-200"}`}>
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[0.5625rem] text-muted/30">empty</span>
                )}
              </div>
            </div>

            {/* Microtask Queue */}
            <div>
              <span className="mb-1 block text-[0.6875rem] uppercase tracking-wider text-muted">마이크로태스크</span>
              <div className="min-h-[1.5rem] border border-violet-400/50 bg-violet-50 p-1.5 dark:border-violet-500/40 dark:bg-violet-950/40">
                {step.microtaskQueue.length > 0 ? (
                  <div className="flex flex-wrap gap-0.5">
                    {step.microtaskQueue.map((item, i) => (
                      <span key={i} className="px-1.5 py-0.5 font-mono text-[0.5625rem] bg-violet-200 text-violet-900 dark:bg-violet-800 dark:text-violet-100">{item}</span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[0.5625rem] text-muted/30">empty</span>
                )}
              </div>
            </div>

            {/* Task Queue */}
            <div>
              <span className="mb-1 block text-[0.6875rem] uppercase tracking-wider text-muted">태스크 큐</span>
              <div className="min-h-[1.5rem] border border-amber-400/50 bg-amber-50 p-1.5 dark:border-amber-500/40 dark:bg-amber-950/40">
                {step.taskQueue.length > 0 ? (
                  <div className="flex flex-wrap gap-0.5">
                    {step.taskQueue.map((item, i) => (
                      <span key={i} className="px-1.5 py-0.5 font-mono text-[0.5625rem] bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100">{item}</span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[0.5625rem] text-muted/30">empty</span>
                )}
              </div>
            </div>

            {/* Web API */}
            {step.webAPI && step.webAPI.length > 0 && (
              <div>
                <span className="mb-1 block text-[0.6875rem] uppercase tracking-wider text-muted">Web API</span>
                <div className="flex flex-wrap gap-0.5">
                  {step.webAPI.map((item, i) => (
                    <span key={i} className="px-1.5 py-0.5 font-mono text-[0.5625rem] bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200">{item}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Console output */}
            <div>
              <span className="mb-1 block text-[0.6875rem] uppercase tracking-wider text-muted">Console</span>
              <div className="min-h-[1.5rem] bg-surface p-1.5 font-mono text-[0.5625rem] text-text">
                {step.log.length > 0 ? step.log.join(", ") : <span className="text-muted/30">—</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
          {step.description}
        </div>
      </div>
    );
  });

  return <StepPlayer steps={stepNodes} />;
}
