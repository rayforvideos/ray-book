"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ─── Types ─── */

interface HistoryEntry {
  id: string;
  label: string;
  type: "execute" | "undo";
  active?: boolean;
}

interface CanvasState {
  items: { id: string; label: string; color: string }[];
}

interface Step {
  history: HistoryEntry[];
  pointer: number;
  canvas: CanvasState;
  label: string;
  description: string;
  codeSnippet?: string;
}

/* ─── History Stack Renderer ─── */

function HistoryStack({ history, pointer }: { history: HistoryEntry[]; pointer: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[0.6rem] font-bold text-muted mb-1">명령 히스토리</div>
      {history.length === 0 && (
        <div className="text-[0.65rem] text-muted/50 italic">비어 있음</div>
      )}
      {history.map((entry, i) => {
        const isCurrent = i === pointer;
        const isAbove = i > pointer;
        return (
          <div
            key={`${entry.id}-${i}`}
            className={`
              flex items-center gap-2 rounded px-2 py-1 font-mono text-[0.65rem] transition-all duration-300
              ${isCurrent
                ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-400 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-700"
                : isAbove
                  ? "bg-stone-100 text-muted/40 line-through dark:bg-stone-900"
                  : "bg-surface text-muted border border-border"
              }
            `}
          >
            <span className="w-3 text-center">
              {isCurrent ? "▸" : isAbove ? "○" : "●"}
            </span>
            {entry.label}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Canvas Renderer ─── */

function Canvas({ state }: { state: CanvasState }) {
  const colorMap: Record<string, string> = {
    red: "bg-rose-400 dark:bg-rose-500",
    blue: "bg-sky-400 dark:bg-sky-500",
    green: "bg-emerald-400 dark:bg-emerald-500",
    yellow: "bg-amber-400 dark:bg-amber-500",
  };

  return (
    <div className="rounded border border-border bg-surface p-3">
      <div className="text-[0.6rem] font-bold text-muted mb-2">캔버스</div>
      <div className="flex gap-2 min-h-[40px] items-center">
        {state.items.length === 0 && (
          <span className="text-[0.65rem] text-muted/50 italic">비어 있음</span>
        )}
        {state.items.map((item) => (
          <div
            key={item.id}
            className={`flex h-9 w-9 items-center justify-center rounded text-[0.5rem] font-bold text-white transition-all duration-300 ${colorMap[item.color] ?? "bg-stone-400"}`}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Steps ─── */

const commandSteps: Step[] = [
  {
    history: [],
    pointer: -1,
    canvas: { items: [] },
    label: "빈 캔버스",
    description: "빈 캔버스와 빈 명령 히스토리입니다. 각 동작을 Command 객체로 기록하면 Undo/Redo가 가능해집니다.",
    codeSnippet: "class CommandManager {\n  constructor() {\n    this.history = [];\n    this.pointer = -1;\n  }\n  execute(command) {\n    command.execute();\n    this.history.length = this.pointer + 1; // redo 분기 제거\n    this.history.push(command);\n    this.pointer++;\n  }\n}",
  },
  {
    history: [
      { id: "1", label: "addShape('■', red)", type: "execute", active: true },
    ],
    pointer: 0,
    canvas: { items: [{ id: "s1", label: "■", color: "red" }] },
    label: "명령 1: 빨간 사각형 추가",
    description: "addShape 명령을 실행합니다. Command 객체는 execute()와 undo() 메서드를 가지고 있습니다. 히스토리 스택에 명령이 기록됩니다.",
    codeSnippet: "const addRed = {\n  execute() { canvas.add({ id: 's1', shape: '■', color: 'red' }); },\n  undo()    { canvas.remove('s1'); },\n};\nmanager.execute(addRed);",
  },
  {
    history: [
      { id: "1", label: "addShape('■', red)", type: "execute" },
      { id: "2", label: "addShape('●', blue)", type: "execute", active: true },
    ],
    pointer: 1,
    canvas: {
      items: [
        { id: "s1", label: "■", color: "red" },
        { id: "s2", label: "●", color: "blue" },
      ],
    },
    label: "명령 2: 파란 원 추가",
    description: "두 번째 명령을 실행합니다. 히스토리에 두 개의 명령이 쌓였습니다. 포인터는 항상 마지막으로 실행된 명령을 가리킵니다.",
  },
  {
    history: [
      { id: "1", label: "addShape('■', red)", type: "execute" },
      { id: "2", label: "addShape('●', blue)", type: "execute" },
      { id: "3", label: "addShape('▲', green)", type: "execute", active: true },
    ],
    pointer: 2,
    canvas: {
      items: [
        { id: "s1", label: "■", color: "red" },
        { id: "s2", label: "●", color: "blue" },
        { id: "s3", label: "▲", color: "green" },
      ],
    },
    label: "명령 3: 초록 삼각형 추가",
    description: "세 번째 명령. 히스토리 스택에 3개의 명령이 쌓여 있습니다.",
  },
  {
    history: [
      { id: "1", label: "addShape('■', red)", type: "execute", active: true },
      { id: "2", label: "addShape('●', blue)", type: "execute" },
      { id: "3", label: "addShape('▲', green)", type: "execute" },
    ],
    pointer: 1,
    canvas: {
      items: [
        { id: "s1", label: "■", color: "red" },
        { id: "s2", label: "●", color: "blue" },
      ],
    },
    label: "Undo → 삼각형 제거",
    description: "Undo! 포인터가 한 칸 뒤로 이동하고, 마지막 명령의 undo()를 실행합니다. 초록 삼각형이 캔버스에서 사라집니다. 히스토리는 그대로 유지됩니다.",
    codeSnippet: "undo() {\n  if (this.pointer < 0) return;\n  this.history[this.pointer].undo();\n  this.pointer--;\n}",
  },
  {
    history: [
      { id: "1", label: "addShape('■', red)", type: "execute", active: true },
      { id: "2", label: "addShape('●', blue)", type: "execute" },
      { id: "3", label: "addShape('▲', green)", type: "execute" },
    ],
    pointer: 0,
    canvas: {
      items: [
        { id: "s1", label: "■", color: "red" },
      ],
    },
    label: "Undo → 원 제거",
    description: "한 번 더 Undo. 파란 원도 사라집니다. 포인터가 첫 번째 명령을 가리키고 있습니다.",
  },
  {
    history: [
      { id: "1", label: "addShape('■', red)", type: "execute" },
      { id: "2", label: "addShape('●', blue)", type: "execute", active: true },
      { id: "3", label: "addShape('▲', green)", type: "execute" },
    ],
    pointer: 1,
    canvas: {
      items: [
        { id: "s1", label: "■", color: "red" },
        { id: "s2", label: "●", color: "blue" },
      ],
    },
    label: "Redo → 원 복원",
    description: "Redo! 포인터를 앞으로 이동하고 해당 명령의 execute()를 다시 실행합니다. 파란 원이 돌아옵니다. Undo/Redo는 포인터 이동으로 구현됩니다.",
    codeSnippet: "redo() {\n  if (this.pointer >= this.history.length - 1) return;\n  this.pointer++;\n  this.history[this.pointer].execute();\n}",
  },
];

/* ─── Main Component ─── */

interface CommandPatternProps {
  preset?: string;
}

export function CommandPattern({ preset = "editor" }: CommandPatternProps) {
  const steps = commandSteps;

  const stepNodes = steps.map((step, idx) => (
    <div key={idx} className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-bold text-accent">{step.label}</span>
        <span className="text-[0.6875rem] text-muted">{idx + 1} / {steps.length}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Canvas state={step.canvas} />
        <HistoryStack history={step.history} pointer={step.pointer} />
      </div>

      {step.codeSnippet && (
        <pre className="rounded border border-border bg-surface p-3 font-mono text-xs leading-relaxed text-muted">
          {step.codeSnippet}
        </pre>
      )}

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
