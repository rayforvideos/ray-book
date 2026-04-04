"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

interface Block {
  value: string;
  highlight?: "push" | "pop" | "enqueue" | "dequeue" | "active";
}

interface Step {
  stackState: Block[];
  queueState: Block[];
  stackLabel?: string;
  queueLabel?: string;
  description: string;
}

const highlightStyles: Record<string, string> = {
  push: "bg-emerald-100 dark:bg-emerald-900/50 border-emerald-400 dark:border-emerald-500 text-emerald-800 dark:text-emerald-200",
  pop: "bg-rose-100 dark:bg-rose-900/50 border-rose-400 dark:border-rose-500 text-rose-800 dark:text-rose-200",
  enqueue:
    "bg-emerald-100 dark:bg-emerald-900/50 border-emerald-400 dark:border-emerald-500 text-emerald-800 dark:text-emerald-200",
  dequeue:
    "bg-rose-100 dark:bg-rose-900/50 border-rose-400 dark:border-rose-500 text-rose-800 dark:text-rose-200",
  active:
    "bg-sky-100 dark:bg-sky-900/50 border-sky-400 dark:border-sky-500 text-sky-800 dark:text-sky-200",
};

const defaultStyle = "bg-surface border-border text-text";

const presets: Record<string, Step[]> = {
  basic: [
    {
      stackState: [],
      queueState: [],
      description:
        "스택과 큐 모두 비어 있는 초기 상태입니다. 스택은 위에서만 넣고 빼는 LIFO (Last In, First Out), 큐는 뒤에서 넣고 앞에서 빼는 FIFO (First In, First Out) 구조입니다.",
    },
    {
      stackState: [{ value: "A", highlight: "push" }],
      queueState: [{ value: "A", highlight: "enqueue" }],
      stackLabel: "push(A)",
      queueLabel: "enqueue(A)",
      description:
        "첫 번째 요소 A를 추가합니다. 스택은 push로 맨 위(top)에, 큐는 enqueue로 맨 뒤(rear)에 넣습니다. 하나뿐이니 둘 다 동일해 보입니다.",
    },
    {
      stackState: [
        { value: "B", highlight: "push" },
        { value: "A" },
      ],
      queueState: [
        { value: "A" },
        { value: "B", highlight: "enqueue" },
      ],
      stackLabel: "push(B)",
      queueLabel: "enqueue(B)",
      description:
        "B를 추가합니다. 스택에서 B는 A 위에 쌓입니다 (top). 큐에서 B는 A 뒤에 줄을 섭니다 (rear). 스택의 위쪽이 top, 큐의 왼쪽이 front입니다.",
    },
    {
      stackState: [
        { value: "C", highlight: "push" },
        { value: "B" },
        { value: "A" },
      ],
      queueState: [
        { value: "A" },
        { value: "B" },
        { value: "C", highlight: "enqueue" },
      ],
      stackLabel: "push(C)",
      queueLabel: "enqueue(C)",
      description:
        "C까지 추가했습니다. 스택은 C가 맨 위, 큐는 C가 맨 뒤입니다. 이제 하나씩 꺼내면서 LIFO와 FIFO의 차이를 확인합니다.",
    },
    {
      stackState: [
        { value: "C", highlight: "pop" },
        { value: "B" },
        { value: "A" },
      ],
      queueState: [
        { value: "A", highlight: "dequeue" },
        { value: "B" },
        { value: "C" },
      ],
      stackLabel: "pop() -> C",
      queueLabel: "dequeue() -> A",
      description:
        "핵심 차이가 드러나는 순간입니다. 스택은 마지막에 넣은 C를 꺼냅니다 (LIFO). 큐는 가장 먼저 넣은 A를 꺼냅니다 (FIFO). 빨간색이 제거되는 요소입니다.",
    },
    {
      stackState: [
        { value: "B", highlight: "pop" },
        { value: "A" },
      ],
      queueState: [
        { value: "B", highlight: "dequeue" },
        { value: "C" },
      ],
      stackLabel: "pop() -> B",
      queueLabel: "dequeue() -> B",
      description:
        "두 번째 제거입니다. 스택은 B를, 큐도 B를 꺼냅니다. 이번에는 우연히 같은 값이지만, 스택은 위에서(나중에 넣은 것), 큐는 앞에서(먼저 넣은 것) 꺼낸다는 원리가 다릅니다.",
    },
    {
      stackState: [{ value: "A", highlight: "pop" }],
      queueState: [{ value: "C", highlight: "dequeue" }],
      stackLabel: "pop() -> A",
      queueLabel: "dequeue() -> C",
      description:
        "마지막 제거입니다. 스택은 처음 넣은 A를, 큐는 마지막에 넣은 C를 꺼냅니다. 정리하면 스택 순서: C, B, A (역순). 큐 순서: A, B, C (입력 순서). 이것이 LIFO와 FIFO의 차이입니다.",
    },
  ],
};

function StackViz({
  blocks,
  label,
}: {
  blocks: Block[];
  label?: string;
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
          스택 (Stack) — LIFO
        </span>
        {label && (
          <span className="font-mono text-[0.625rem] text-muted">
            {label}
          </span>
        )}
      </div>
      <div className="flex flex-col items-center gap-0 min-h-[10rem]">
        {blocks.length === 0 && (
          <div className="flex items-center justify-center h-[10rem] text-[0.75rem] text-muted">
            비어 있음 (empty)
          </div>
        )}
        {blocks.length > 0 && (
          <>
            <span className="text-[0.5625rem] text-muted font-mono mb-1">
              top
            </span>
            {blocks.map((block, i) => {
              const style = block.highlight
                ? highlightStyles[block.highlight]
                : defaultStyle;
              return (
                <div
                  key={i}
                  className={`w-20 h-10 flex items-center justify-center border font-mono text-sm font-bold ${style} ${i > 0 ? "border-t-0" : ""}`}
                >
                  {block.value}
                </div>
              );
            })}
            <span className="text-[0.5625rem] text-muted font-mono mt-1">
              bottom
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function QueueViz({
  blocks,
  label,
}: {
  blocks: Block[];
  label?: string;
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
          큐 (Queue) — FIFO
        </span>
        {label && (
          <span className="font-mono text-[0.625rem] text-muted">
            {label}
          </span>
        )}
      </div>
      <div className="flex items-center gap-0 overflow-x-auto pb-1 min-h-[10rem]">
        {blocks.length === 0 && (
          <div className="flex items-center justify-center w-full h-[10rem] text-[0.75rem] text-muted">
            비어 있음 (empty)
          </div>
        )}
        {blocks.length > 0 && (
          <>
            <span className="text-[0.5625rem] text-muted font-mono mr-1.5 shrink-0">
              front
            </span>
            {blocks.map((block, i) => {
              const style = block.highlight
                ? highlightStyles[block.highlight]
                : defaultStyle;
              return (
                <div
                  key={i}
                  className={`w-11 h-11 flex items-center justify-center border font-mono text-sm font-bold shrink-0 ${style} ${i > 0 ? "border-l-0" : ""}`}
                >
                  {block.value}
                </div>
              );
            })}
            <span className="text-[0.5625rem] text-muted font-mono ml-1.5 shrink-0">
              rear
            </span>
          </>
        )}
      </div>
    </div>
  );
}

interface StackAndQueueProps {
  preset?: string;
}

export function StackAndQueue({ preset = "basic" }: StackAndQueueProps) {
  const steps = presets[preset] ?? presets["basic"];

  const stepNodes = steps.map((step, idx) => (
    <div key={idx} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-6">
        <StackViz blocks={step.stackState} label={step.stackLabel} />
        <QueueViz blocks={step.queueState} label={step.queueLabel} />
      </div>

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
