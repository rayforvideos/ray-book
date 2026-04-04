"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MemorySegment {
  label: string;
  sublabel: string;
  color: {
    bg: string;
    border: string;
    text: string;
  };
  shared?: boolean;
}

type Phase = "process" | "thread" | "context-switch";

interface ProcessStep {
  phase: Phase;
  phaseLabel: string;
  activeSegments: number[];
  threads: ThreadState[];
  switchHighlight?: "save" | "restore" | "switch";
  description: string;
}

interface ThreadState {
  id: string;
  label: string;
  active: boolean;
  stackItems: string[];
  pc?: string;
  registers?: string;
}

/* ------------------------------------------------------------------ */
/*  Memory segments                                                    */
/* ------------------------------------------------------------------ */

const segments: MemorySegment[] = [
  {
    label: "Code (Text)",
    sublabel: "실행할 기계어 명령어",
    color: {
      bg: "bg-sky-50 dark:bg-sky-950/40",
      border: "border-sky-400/50 dark:border-sky-500/40",
      text: "text-sky-700 dark:text-sky-300",
    },
    shared: true,
  },
  {
    label: "Data",
    sublabel: "전역 변수, static 변수",
    color: {
      bg: "bg-violet-50 dark:bg-violet-950/40",
      border: "border-violet-400/50 dark:border-violet-500/40",
      text: "text-violet-700 dark:text-violet-300",
    },
    shared: true,
  },
  {
    label: "Heap",
    sublabel: "동적 할당 메모리",
    color: {
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-400/50 dark:border-amber-500/40",
      text: "text-amber-700 dark:text-amber-300",
    },
    shared: true,
  },
  {
    label: "Stack",
    sublabel: "지역 변수, 리턴 주소",
    color: {
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      border: "border-emerald-400/50 dark:border-emerald-500/40",
      text: "text-emerald-700 dark:text-emerald-300",
    },
    shared: false,
  },
];

/* ------------------------------------------------------------------ */
/*  Presets                                                            */
/* ------------------------------------------------------------------ */

const presets: Record<string, { steps: ProcessStep[] }> = {
  basic: {
    steps: [
      {
        phase: "process",
        phaseLabel: "프로세스 메모리 구조",
        activeSegments: [],
        threads: [],
        description:
          "프로세스(Process)는 실행 중인 프로그램입니다. OS는 프로그램을 메모리에 로드할 때 독립된 주소 공간을 할당합니다. 이 공간은 Code, Data, Heap, Stack 네 영역으로 나뉩니다.",
      },
      {
        phase: "process",
        phaseLabel: "프로세스 메모리 구조",
        activeSegments: [0],
        threads: [],
        description:
          "Code(Text) 영역: 컴파일된 기계어 명령어가 저장됩니다. 읽기 전용이며 프로그램 실행 중 변경되지 않습니다. CPU의 Program Counter(PC)가 이 영역의 명령어를 순서대로 가리킵니다.",
      },
      {
        phase: "process",
        phaseLabel: "프로세스 메모리 구조",
        activeSegments: [1],
        threads: [],
        description:
          "Data 영역: 전역 변수와 static 변수가 저장됩니다. 프로그램 시작 시 할당되어 종료까지 유지됩니다. 초기화된 데이터(.data)와 초기화되지 않은 데이터(.bss)로 나뉩니다.",
      },
      {
        phase: "process",
        phaseLabel: "프로세스 메모리 구조",
        activeSegments: [2],
        threads: [],
        description:
          "Heap 영역: malloc(), new 등으로 동적 할당한 메모리입니다. 낮은 주소에서 높은 주소로 성장합니다. 개발자가 직접 관리하거나 (C/C++), GC가 자동으로 회수합니다 (Java, JS).",
      },
      {
        phase: "process",
        phaseLabel: "프로세스 메모리 구조",
        activeSegments: [3],
        threads: [],
        description:
          "Stack 영역: 함수 호출 시 지역 변수, 매개변수, 리턴 주소가 프레임 단위로 쌓입니다. 높은 주소에서 낮은 주소로 성장합니다. Heap과 반대 방향으로 자라므로 충돌을 방지합니다.",
      },
      {
        phase: "process",
        phaseLabel: "프로세스 메모리 구조",
        activeSegments: [0, 1, 2, 3],
        threads: [],
        description:
          "네 영역이 하나의 프로세스 주소 공간을 구성합니다. 각 프로세스는 완전히 독립된 주소 공간을 가지므로 다른 프로세스의 메모리에 직접 접근할 수 없습니다. 이것이 프로세스 격리(isolation)입니다.",
      },
      {
        phase: "thread",
        phaseLabel: "스레드 생성",
        activeSegments: [0, 1, 2],
        threads: [
          {
            id: "main",
            label: "메인 스레드",
            active: true,
            stackItems: ["main()", "doWork()"],
            pc: "0x0040",
            registers: "rax=42, rbx=0",
          },
        ],
        description:
          "프로세스에는 최소 하나의 실행 흐름이 있습니다. 이것이 메인 스레드입니다. 스레드는 Code, Data, Heap을 프로세스와 공유하지만, 자신만의 Stack과 레지스터(PC, SP 등)를 가집니다.",
      },
      {
        phase: "thread",
        phaseLabel: "스레드 생성",
        activeSegments: [0, 1, 2],
        threads: [
          {
            id: "main",
            label: "메인 스레드",
            active: true,
            stackItems: ["main()", "doWork()"],
            pc: "0x0040",
            registers: "rax=42, rbx=0",
          },
          {
            id: "t1",
            label: "스레드 1",
            active: true,
            stackItems: ["threadFunc()", "compute()"],
            pc: "0x0080",
            registers: "rax=0, rbx=7",
          },
        ],
        description:
          "새 스레드를 생성하면 별도의 Stack이 할당됩니다. Code, Data, Heap은 같은 프로세스의 것을 공유합니다. Heap을 공유하므로 스레드 간 데이터 교환이 빠르지만, 동기화 문제가 발생할 수 있습니다.",
      },
      {
        phase: "thread",
        phaseLabel: "스레드 생성",
        activeSegments: [0, 1, 2],
        threads: [
          {
            id: "main",
            label: "메인 스레드",
            active: true,
            stackItems: ["main()", "doWork()"],
            pc: "0x0040",
            registers: "rax=42, rbx=0",
          },
          {
            id: "t1",
            label: "스레드 1",
            active: true,
            stackItems: ["threadFunc()", "compute()"],
            pc: "0x0080",
            registers: "rax=0, rbx=7",
          },
          {
            id: "t2",
            label: "스레드 2",
            active: true,
            stackItems: ["ioHandler()"],
            pc: "0x00C0",
            registers: "rax=1, rbx=3",
          },
        ],
        description:
          "스레드를 더 생성할 수 있습니다. 각 스레드는 독립적인 Stack, PC, 레지스터를 갖고, 같은 Heap에서 데이터를 읽고 씁니다. 이것이 멀티스레드 프로그래밍의 기본 모델입니다.",
      },
      {
        phase: "context-switch",
        phaseLabel: "컨텍스트 스위칭",
        activeSegments: [0, 1, 2],
        threads: [
          {
            id: "main",
            label: "메인 스레드",
            active: true,
            stackItems: ["main()", "doWork()"],
            pc: "0x0040",
            registers: "rax=42, rbx=0",
          },
          {
            id: "t1",
            label: "스레드 1",
            active: false,
            stackItems: ["threadFunc()", "compute()"],
            pc: "0x0080",
            registers: "rax=0, rbx=7",
          },
        ],
        switchHighlight: "save",
        description:
          "CPU 코어 하나는 한 번에 하나의 스레드만 실행합니다. OS 스케줄러가 실행할 스레드를 교체하는 것이 컨텍스트 스위칭입니다. 먼저 현재 스레드(메인)의 PC, 레지스터, 스택 포인터를 PCB/TCB에 저장합니다.",
      },
      {
        phase: "context-switch",
        phaseLabel: "컨텍스트 스위칭",
        activeSegments: [0, 1, 2],
        threads: [
          {
            id: "main",
            label: "메인 스레드",
            active: false,
            stackItems: ["main()", "doWork()"],
            pc: "0x0040",
            registers: "rax=42, rbx=0",
          },
          {
            id: "t1",
            label: "스레드 1",
            active: false,
            stackItems: ["threadFunc()", "compute()"],
            pc: "0x0080",
            registers: "rax=0, rbx=7",
          },
        ],
        switchHighlight: "switch",
        description:
          "스케줄러가 다음 실행할 스레드를 선택합니다. 이 전환 과정에서 CPU는 유용한 작업을 하지 못합니다. 스레드 간 전환은 같은 주소 공간을 공유하므로 비교적 가볍지만, 프로세스 간 전환은 주소 공간(페이지 테이블)까지 교체해야 하므로 훨씬 무겁습니다.",
      },
      {
        phase: "context-switch",
        phaseLabel: "컨텍스트 스위칭",
        activeSegments: [0, 1, 2],
        threads: [
          {
            id: "main",
            label: "메인 스레드",
            active: false,
            stackItems: ["main()", "doWork()"],
            pc: "0x0040",
            registers: "rax=42, rbx=0",
          },
          {
            id: "t1",
            label: "스레드 1",
            active: true,
            stackItems: ["threadFunc()", "compute()"],
            pc: "0x0080",
            registers: "rax=0, rbx=7",
          },
        ],
        switchHighlight: "restore",
        description:
          "스레드 1의 저장된 컨텍스트(PC, 레지스터, SP)를 CPU에 복원합니다. 이제 스레드 1이 마지막으로 멈춘 지점(PC=0x0080)부터 실행을 재개합니다. 사용자에게는 두 스레드가 동시에 실행되는 것처럼 보입니다.",
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function MemoryLayout({
  activeSegments,
  showShared,
}: {
  activeSegments: number[];
  showShared: boolean;
}) {
  return (
    <div className="w-full">
      <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
        프로세스 메모리
      </span>
      <div className="space-y-1">
        {segments.map((seg, idx) => {
          const isActive = activeSegments.includes(idx);
          return (
            <div
              key={idx}
              className={`flex items-center justify-between border p-2 transition-all duration-200 ${
                isActive
                  ? `${seg.color.border} ${seg.color.bg}`
                  : "border-border bg-surface"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-[0.6875rem] font-bold ${
                    isActive ? seg.color.text : "text-muted/50"
                  }`}
                >
                  {seg.label}
                </span>
                {isActive && (
                  <span className="text-accent text-[0.625rem]">◄</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {showShared && seg.shared !== undefined && (
                  <span
                    className={`px-1.5 py-px font-mono text-[0.5rem] font-bold ${
                      seg.shared
                        ? "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                    }`}
                  >
                    {seg.shared ? "공유" : "독립"}
                  </span>
                )}
                <span
                  className={`font-mono text-[0.5625rem] ${
                    isActive ? seg.color.text : "text-muted/30"
                  }`}
                >
                  {seg.sublabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ThreadStacks({
  threads,
  switchHighlight,
}: {
  threads: ThreadState[];
  switchHighlight?: "save" | "restore" | "switch";
}) {
  if (threads.length === 0) return null;

  return (
    <div className="w-full">
      <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
        스레드 스택
      </span>
      <div className="flex gap-2 overflow-x-auto">
        {threads.map((t) => {
          const isHighlightTarget =
            (switchHighlight === "save" && t.active) ||
            (switchHighlight === "restore" && t.active);
          const borderStyle = isHighlightTarget
            ? "border-accent"
            : t.active
              ? "border-emerald-400/50 dark:border-emerald-500/40"
              : "border-border";

          return (
            <div
              key={t.id}
              className={`flex-1 min-w-0 border p-2 transition-all duration-200 ${borderStyle} ${
                t.active
                  ? "bg-emerald-50 dark:bg-emerald-950/40"
                  : "bg-surface"
              }`}
            >
              <div className="mb-1.5 flex items-center justify-between gap-1">
                <span
                  className={`text-[0.625rem] font-bold ${
                    t.active
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-muted/50"
                  }`}
                >
                  {t.label}
                </span>
                <span
                  className={`px-1.5 py-px font-mono text-[0.5rem] font-bold ${
                    t.active
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                      : "bg-stone-100 text-stone-500 dark:bg-stone-800/40 dark:text-stone-400"
                  }`}
                >
                  {t.active ? "실행 중" : "대기"}
                </span>
              </div>

              {/* Stack frames */}
              <div className="space-y-0.5">
                {t.stackItems.map((item, i) => (
                  <div
                    key={i}
                    className={`px-1.5 py-0.5 font-mono text-[0.5625rem] ${
                      t.active
                        ? "bg-emerald-100/50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
                        : "bg-stone-100/50 text-stone-500 dark:bg-stone-800/30 dark:text-stone-400"
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>

              {/* PC & Registers */}
              {t.pc && (
                <div className="mt-1.5 space-y-0.5">
                  <div
                    className={`flex items-center gap-1 font-mono text-[0.5rem] ${
                      isHighlightTarget
                        ? "text-accent font-bold"
                        : t.active
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted/40"
                    }`}
                  >
                    <span className="uppercase">PC:</span>
                    <span>{t.pc}</span>
                  </div>
                  {t.registers && (
                    <div
                      className={`font-mono text-[0.5rem] ${
                        isHighlightTarget
                          ? "text-accent font-bold"
                          : t.active
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-muted/40"
                      }`}
                    >
                      {t.registers}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ContextSwitchIndicator({
  highlight,
}: {
  highlight?: "save" | "restore" | "switch";
}) {
  if (!highlight) return null;

  const labels: Record<string, { text: string; style: string }> = {
    save: {
      text: "SAVE: 현재 스레드 상태 저장",
      style:
        "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300",
    },
    switch: {
      text: "SWITCH: 스케줄러가 다음 스레드 선택",
      style:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
    },
    restore: {
      text: "RESTORE: 선택된 스레드 상태 복원",
      style:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
    },
  };

  const { text, style } = labels[highlight];

  return (
    <div className={`px-2 py-1 font-mono text-[0.5625rem] font-bold ${style}`}>
      {text}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface ProcessThreadProps {
  preset?: string;
}

export function ProcessThread({ preset = "basic" }: ProcessThreadProps) {
  const data = presets[preset] ?? presets["basic"];
  const showShared = (step: ProcessStep) =>
    step.phase === "thread" || step.phase === "context-switch";

  const stepNodes = data.steps.map((step, idx) => (
    <div key={idx} className="space-y-4">
      {/* Phase indicator */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`px-2 py-0.5 font-mono text-[0.5625rem] font-bold ${
            step.phase === "process"
              ? "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300"
              : step.phase === "thread"
                ? "bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300"
                : "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300"
          }`}
        >
          {step.phaseLabel}
        </span>
        <ContextSwitchIndicator highlight={step.switchHighlight} />
      </div>

      {/* Main content */}
      <div className="flex gap-4 max-sm:flex-col">
        <div className="flex-1 min-w-0">
          <MemoryLayout
            activeSegments={step.activeSegments}
            showShared={showShared(step)}
          />
        </div>
        {step.threads.length > 0 && (
          <div className="flex-1 min-w-0">
            <ThreadStacks
              threads={step.threads}
              switchHighlight={step.switchHighlight}
            />
          </div>
        )}
      </div>

      {/* Description */}
      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
