"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

interface HeapObject {
  id: string;
  label: string;
  alive: boolean;
  generation: "young" | "old";
}

interface GCStep {
  objects: HeapObject[];
  phase: "idle" | "allocate" | "minor-gc" | "promote" | "major-gc";
  description: string;
}

const phaseStyles = {
  idle: { label: "대기", bg: "bg-stone-100 dark:bg-stone-800/40", text: "text-stone-700 dark:text-stone-200" },
  allocate: { label: "할당", bg: "bg-sky-50 dark:bg-sky-950/40", text: "text-sky-950 dark:text-sky-100" },
  "minor-gc": { label: "Minor GC", bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-950 dark:text-amber-100" },
  promote: { label: "승격", bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-950 dark:text-violet-100" },
  "major-gc": { label: "Major GC", bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-950 dark:text-rose-100" },
};

const presets: Record<string, GCStep[]> = {
  lifecycle: [
    {
      objects: [],
      phase: "idle",
      description: "힙이 비어 있습니다. Young Generation과 Old Generation 두 영역으로 나뉘어 있습니다.",
    },
    {
      objects: [
        { id: "a", label: "obj A", alive: true, generation: "young" },
        { id: "b", label: "obj B", alive: true, generation: "young" },
        { id: "c", label: "obj C", alive: true, generation: "young" },
      ],
      phase: "allocate",
      description: "새 객체 A, B, C가 Young Generation에 할당됩니다. 새로 생성되는 객체는 항상 Young에 먼저 들어갑니다.",
    },
    {
      objects: [
        { id: "a", label: "obj A", alive: true, generation: "young" },
        { id: "b", label: "obj B", alive: false, generation: "young" },
        { id: "c", label: "obj C", alive: true, generation: "young" },
        { id: "d", label: "obj D", alive: true, generation: "young" },
      ],
      phase: "allocate",
      description: "obj D가 추가로 할당됩니다. obj B는 더 이상 참조되지 않습니다 (예: 변수가 재할당됨).",
    },
    {
      objects: [
        { id: "a", label: "obj A", alive: true, generation: "young" },
        { id: "c", label: "obj C", alive: true, generation: "young" },
        { id: "d", label: "obj D", alive: true, generation: "young" },
      ],
      phase: "minor-gc",
      description: "Minor GC (Scavenge) 실행! Young Generation에서 살아있는 객체만 골라 복사합니다. obj B는 참조가 없으므로 수거됩니다. 이 과정은 매우 빠릅니다 (보통 1~2ms).",
    },
    {
      objects: [
        { id: "a", label: "obj A", alive: true, generation: "old" },
        { id: "c", label: "obj C", alive: true, generation: "young" },
        { id: "d", label: "obj D", alive: true, generation: "young" },
      ],
      phase: "promote",
      description: "obj A가 여러 번의 Minor GC에서 살아남았습니다. Old Generation으로 승격됩니다. 오래 살아남은 객체는 앞으로도 오래 살 가능성이 높다는 가정입니다.",
    },
    {
      objects: [
        { id: "a", label: "obj A", alive: true, generation: "old" },
        { id: "c", label: "obj C", alive: false, generation: "young" },
        { id: "d", label: "obj D", alive: true, generation: "young" },
        { id: "e", label: "obj E", alive: true, generation: "young" },
        { id: "f", label: "obj F", alive: true, generation: "old" },
        { id: "g", label: "obj G", alive: false, generation: "old" },
      ],
      phase: "allocate",
      description: "시간이 지나며 Old Generation에도 객체가 쌓입니다. obj F는 승격된 객체, obj G는 더 이상 쓰이지 않는 객체입니다.",
    },
    {
      objects: [
        { id: "a", label: "obj A", alive: true, generation: "old" },
        { id: "d", label: "obj D", alive: true, generation: "young" },
        { id: "e", label: "obj E", alive: true, generation: "young" },
        { id: "f", label: "obj F", alive: true, generation: "old" },
      ],
      phase: "major-gc",
      description: "Major GC (Mark-Sweep-Compact) 실행! 전체 힙을 순회하며 도달할 수 없는 obj C, obj G를 수거합니다. Minor GC보다 느리지만 (10~100ms), 자주 실행되지 않습니다.",
    },
  ],
};

interface GCHeapProps {
  preset?: string;
}

export function GCHeap({ preset = "lifecycle" }: GCHeapProps) {
  const gcSteps = presets[preset] ?? presets["lifecycle"];

  const steps = gcSteps.map((step, i) => {
    const phaseStyle = phaseStyles[step.phase];
    const youngObjects = step.objects.filter((o) => o.generation === "young");
    const oldObjects = step.objects.filter((o) => o.generation === "old");

    return (
      <div key={i} className="space-y-4">
        {/* Phase indicator */}
        <span className={`inline-block border border-transparent px-2.5 py-1 font-mono text-[0.6875rem] font-bold ${phaseStyle.bg} ${phaseStyle.text}`}>
          {phaseStyle.label}
        </span>

        {/* Heap visualization */}
        <div className="flex gap-3">
          {/* Young Generation */}
          <div className="flex-1 border border-border p-3">
            <span className="mb-2 block text-[0.625rem] font-semibold uppercase tracking-wider text-muted">
              Young Generation
            </span>
            <div className="flex flex-wrap gap-1.5">
              {youngObjects.map((obj) => (
                <span
                  key={obj.id}
                  className={`inline-block border px-2 py-0.5 font-mono text-[0.625rem] transition-all ${
                    obj.alive
                      ? "border-emerald-400/50 bg-emerald-50 text-emerald-950 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-100"
                      : "border-rose-400/50 bg-rose-50 text-rose-950 line-through opacity-50 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-100"
                  }`}
                >
                  {obj.label}
                </span>
              ))}
              {youngObjects.length === 0 && (
                <span className="text-[0.625rem] text-muted/30">empty</span>
              )}
            </div>
          </div>

          {/* Old Generation */}
          <div className="flex-1 border border-border p-3">
            <span className="mb-2 block text-[0.625rem] font-semibold uppercase tracking-wider text-muted">
              Old Generation
            </span>
            <div className="flex flex-wrap gap-1.5">
              {oldObjects.map((obj) => (
                <span
                  key={obj.id}
                  className={`inline-block border px-2 py-0.5 font-mono text-[0.625rem] transition-all ${
                    obj.alive
                      ? "border-violet-400/50 bg-violet-50 text-violet-950 dark:border-violet-500/40 dark:bg-violet-950/40 dark:text-violet-100"
                      : "border-rose-400/50 bg-rose-50 text-rose-950 line-through opacity-50 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-100"
                  }`}
                >
                  {obj.label}
                </span>
              ))}
              {oldObjects.length === 0 && (
                <span className="text-[0.625rem] text-muted/30">empty</span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <span className="block border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
          {step.description}
        </span>
      </div>
    );
  });

  return <StepPlayer steps={steps} />;
}
