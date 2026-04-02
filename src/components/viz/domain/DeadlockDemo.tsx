"use client";

import { StepPlayer } from "../primitives/StepPlayer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ResourceState {
  id: string;
  label: string;
  owner: string | null;
}

interface ProcessState {
  id: string;
  label: string;
  holds: string[];
  waitsFor: string | null;
  blocked: boolean;
}

interface DeadlockStep {
  processes: ProcessState[];
  resources: ResourceState[];
  edges: { from: string; to: string; type: "hold" | "wait" }[];
  deadlocked: boolean;
  description: string;
}

/* ------------------------------------------------------------------ */
/*  Colors                                                             */
/* ------------------------------------------------------------------ */

const processColors: Record<
  string,
  { bg: string; border: string; text: string; ring: string }
> = {
  P1: {
    bg: "bg-sky-100 dark:bg-sky-900/50",
    border: "border-sky-400/60 dark:border-sky-500/50",
    text: "text-sky-700 dark:text-sky-300",
    ring: "ring-sky-400/40 dark:ring-sky-500/30",
  },
  P2: {
    bg: "bg-violet-100 dark:bg-violet-900/50",
    border: "border-violet-400/60 dark:border-violet-500/50",
    text: "text-violet-700 dark:text-violet-300",
    ring: "ring-violet-400/40 dark:ring-violet-500/30",
  },
};

const resourceColors: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  R1: {
    bg: "bg-amber-100 dark:bg-amber-900/50",
    border: "border-amber-400/60 dark:border-amber-500/50",
    text: "text-amber-700 dark:text-amber-300",
  },
  R2: {
    bg: "bg-emerald-100 dark:bg-emerald-900/50",
    border: "border-emerald-400/60 dark:border-emerald-500/50",
    text: "text-emerald-700 dark:text-emerald-300",
  },
};

/* ------------------------------------------------------------------ */
/*  Preset: basic                                                      */
/* ------------------------------------------------------------------ */

function buildBasicSteps(): DeadlockStep[] {
  return [
    {
      processes: [
        { id: "P1", label: "P1", holds: [], waitsFor: null, blocked: false },
        { id: "P2", label: "P2", holds: [], waitsFor: null, blocked: false },
      ],
      resources: [
        { id: "R1", label: "R1", owner: null },
        { id: "R2", label: "R2", owner: null },
      ],
      edges: [],
      deadlocked: false,
      description:
        "두 프로세스(P1, P2)와 두 자원(R1, R2)이 있습니다. 아직 아무도 자원을 점유하지 않은 초기 상태입니다. 이제 두 프로세스가 서로 다른 순서로 자원을 요청하면 어떤 일이 벌어지는지 관찰합니다.",
    },
    {
      processes: [
        { id: "P1", label: "P1", holds: ["R1"], waitsFor: null, blocked: false },
        { id: "P2", label: "P2", holds: [], waitsFor: null, blocked: false },
      ],
      resources: [
        { id: "R1", label: "R1", owner: "P1" },
        { id: "R2", label: "R2", owner: null },
      ],
      edges: [{ from: "R1", to: "P1", type: "hold" }],
      deadlocked: false,
      description:
        "P1이 R1을 획득(lock)합니다. 자원 할당 그래프에서 R1 --> P1 할당 간선이 생깁니다. P1은 R1을 점유한 채 다음 작업을 수행합니다.",
    },
    {
      processes: [
        { id: "P1", label: "P1", holds: ["R1"], waitsFor: null, blocked: false },
        { id: "P2", label: "P2", holds: ["R2"], waitsFor: null, blocked: false },
      ],
      resources: [
        { id: "R1", label: "R1", owner: "P1" },
        { id: "R2", label: "R2", owner: "P2" },
      ],
      edges: [
        { from: "R1", to: "P1", type: "hold" },
        { from: "R2", to: "P2", type: "hold" },
      ],
      deadlocked: false,
      description:
        "P2가 R2를 획득합니다. R2 --> P2 할당 간선이 추가됩니다. 이제 P1은 R1을, P2는 R2를 각각 점유하고 있습니다. 아직까지는 문제가 없습니다.",
    },
    {
      processes: [
        { id: "P1", label: "P1", holds: ["R1"], waitsFor: "R2", blocked: true },
        { id: "P2", label: "P2", holds: ["R2"], waitsFor: null, blocked: false },
      ],
      resources: [
        { id: "R1", label: "R1", owner: "P1" },
        { id: "R2", label: "R2", owner: "P2" },
      ],
      edges: [
        { from: "R1", to: "P1", type: "hold" },
        { from: "R2", to: "P2", type: "hold" },
        { from: "P1", to: "R2", type: "wait" },
      ],
      deadlocked: false,
      description:
        "P1이 R2를 요청합니다. 하지만 R2는 P2가 점유 중이므로 P1은 블로킹됩니다. P1 --> R2 요청 간선이 추가됩니다. P1은 R1을 놓지 않은 채 R2를 기다립니다 (Hold and Wait).",
    },
    {
      processes: [
        { id: "P1", label: "P1", holds: ["R1"], waitsFor: "R2", blocked: true },
        { id: "P2", label: "P2", holds: ["R2"], waitsFor: "R1", blocked: true },
      ],
      resources: [
        { id: "R1", label: "R1", owner: "P1" },
        { id: "R2", label: "R2", owner: "P2" },
      ],
      edges: [
        { from: "R1", to: "P1", type: "hold" },
        { from: "R2", to: "P2", type: "hold" },
        { from: "P1", to: "R2", type: "wait" },
        { from: "P2", to: "R1", type: "wait" },
      ],
      deadlocked: true,
      description:
        "P2가 R1을 요청합니다. R1은 P1이 점유 중이므로 P2도 블로킹됩니다. P2 --> R1 요청 간선이 추가되면서 사이클이 형성됩니다: P1 --> R2 --> P2 --> R1 --> P1. 교착 상태(Deadlock)가 발생했습니다! 두 프로세스 모두 상대방이 가진 자원을 기다리며 영원히 진행할 수 없습니다.",
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Presets                                                            */
/* ------------------------------------------------------------------ */

const presets: Record<string, { steps: DeadlockStep[] }> = {
  basic: { steps: buildBasicSteps() },
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function ResourceNode({
  resource,
}: {
  resource: ResourceState;
}) {
  const colors = resourceColors[resource.id] ?? resourceColors["R1"];
  return (
    <div
      className={`flex flex-col items-center gap-1 border-2 px-4 py-2 transition-all duration-200 ${colors.border} ${colors.bg}`}
    >
      <span className={`text-[0.75rem] font-bold ${colors.text}`}>
        {resource.label}
      </span>
      <span className="text-[0.5625rem] text-muted">
        {resource.owner ? `${resource.owner} 점유` : "사용 가능"}
      </span>
    </div>
  );
}

function ProcessNode({
  process,
  deadlocked,
}: {
  process: ProcessState;
  deadlocked: boolean;
}) {
  const colors = processColors[process.id] ?? processColors["P1"];
  const isBlocked = process.blocked;
  const showDanger = deadlocked && isBlocked;

  return (
    <div
      className={`flex flex-col items-center gap-1 border-2 px-4 py-2 transition-all duration-200 ${
        showDanger
          ? "border-rose-500 bg-rose-50 dark:border-rose-400 dark:bg-rose-950/40"
          : `${colors.border} ${colors.bg}`
      }`}
    >
      <span
        className={`text-[0.75rem] font-bold ${
          showDanger ? "text-rose-700 dark:text-rose-300" : colors.text
        }`}
      >
        {process.label}
      </span>
      <span className="text-[0.5625rem] text-muted">
        {showDanger
          ? "DEADLOCK"
          : isBlocked
            ? "BLOCKED"
            : process.holds.length > 0
              ? `보유: ${process.holds.join(", ")}`
              : "대기 중"}
      </span>
    </div>
  );
}

function AllocationGraph({
  step,
}: {
  step: DeadlockStep;
}) {
  const { processes, resources, edges, deadlocked } = step;

  return (
    <div className="w-full">
      <span className="mb-2 block text-[0.6875rem] uppercase tracking-wider text-muted">
        자원 할당 그래프 (RAG)
      </span>

      {/* Graph layout: processes on sides, resources in middle */}
      <div className="flex items-center justify-center gap-6 max-sm:gap-3 py-4">
        {/* P1 on left */}
        <ProcessNode process={processes[0]} deadlocked={deadlocked} />

        {/* Center column: resources + edges description */}
        <div className="flex flex-col items-center gap-4">
          <ResourceNode resource={resources[0]} />
          <ResourceNode resource={resources[1]} />
        </div>

        {/* P2 on right */}
        <ProcessNode process={processes[1]} deadlocked={deadlocked} />
      </div>

      {/* Edge list */}
      {edges.length > 0 && (
        <div className="mt-2 space-y-1">
          <span className="mb-1 block text-[0.625rem] uppercase tracking-wider text-muted">
            간선
          </span>
          <div className="flex flex-wrap gap-1.5">
            {edges.map((edge, idx) => {
              const isWait = edge.type === "wait";
              const cycleEdge = deadlocked && isWait;
              return (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[0.5625rem] font-bold border ${
                    cycleEdge
                      ? "border-rose-400 bg-rose-50 text-rose-700 dark:border-rose-500/50 dark:bg-rose-950/40 dark:text-rose-300"
                      : isWait
                        ? "border-amber-400/60 bg-amber-50 text-amber-700 dark:border-amber-500/50 dark:bg-amber-950/40 dark:text-amber-300"
                        : "border-sky-400/60 bg-sky-50 text-sky-700 dark:border-sky-500/50 dark:bg-sky-950/40 dark:text-sky-300"
                  }`}
                >
                  {edge.from}
                  <span className="text-muted">
                    {isWait ? " --req--> " : " --own--> "}
                  </span>
                  {edge.to}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Cycle detection */}
      {deadlocked && (
        <div className="mt-3 border border-rose-400 bg-rose-50 px-3 py-2 dark:border-rose-500/50 dark:bg-rose-950/40">
          <span className="text-[0.6875rem] font-bold text-rose-700 dark:text-rose-300">
            사이클 감지: P1 --req--&gt; R2 --own--&gt; P2 --req--&gt; R1 --own--&gt; P1
          </span>
        </div>
      )}
    </div>
  );
}

function ConditionChecklist({ step }: { step: DeadlockStep }) {
  const hasMutualExclusion = step.resources.some((r) => r.owner !== null);
  const hasHoldAndWait = step.processes.some(
    (p) => p.holds.length > 0 && p.waitsFor !== null
  );
  const hasNoPreemption = step.processes.some((p) => p.holds.length > 0);
  const hasCircularWait = step.deadlocked;

  const conditions = [
    {
      label: "상호 배제 (Mutual Exclusion)",
      met: hasMutualExclusion,
      desc: "자원은 한 번에 하나의 프로세스만 사용",
    },
    {
      label: "점유 대기 (Hold and Wait)",
      met: hasHoldAndWait,
      desc: "자원을 보유한 채 다른 자원 대기",
    },
    {
      label: "비선점 (No Preemption)",
      met: hasNoPreemption,
      desc: "점유 중인 자원을 강제로 빼앗지 못함",
    },
    {
      label: "순환 대기 (Circular Wait)",
      met: hasCircularWait,
      desc: "프로세스들이 원형으로 자원 대기",
    },
  ];

  return (
    <div className="w-full">
      <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
        교착 상태 4조건 (Coffman)
      </span>
      <div className="space-y-1">
        {conditions.map((cond, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-2 border px-2 py-1.5 transition-all duration-200 ${
              cond.met
                ? "border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-950/30"
                : "border-border bg-surface"
            }`}
          >
            <span
              className={`flex-shrink-0 text-[0.625rem] font-bold ${
                cond.met
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-muted/40"
              }`}
            >
              {cond.met ? "O" : "-"}
            </span>
            <div className="min-w-0">
              <span
                className={`text-[0.6875rem] font-bold ${
                  cond.met ? "text-rose-700 dark:text-rose-300" : "text-muted/50"
                }`}
              >
                {cond.label}
              </span>
              <span
                className={`ml-1.5 text-[0.5625rem] ${
                  cond.met ? "text-rose-600/80 dark:text-rose-400/80" : "text-muted/30"
                }`}
              >
                {cond.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface DeadlockDemoProps {
  preset?: string;
}

export function DeadlockDemo({ preset = "basic" }: DeadlockDemoProps) {
  const data = presets[preset] ?? presets["basic"];

  const stepNodes = data.steps.map((step, idx) => (
    <div key={idx} className="space-y-4">
      {/* Phase label */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`px-2 py-0.5 font-mono text-[0.5625rem] font-bold ${
            step.deadlocked
              ? "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300"
              : "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300"
          }`}
        >
          {step.deadlocked ? "DEADLOCK" : "자원 할당"}
        </span>
        <span className="font-mono text-[0.5625rem] text-muted">
          단계 {idx + 1} / {data.steps.length}
        </span>
      </div>

      {/* Allocation graph */}
      <AllocationGraph step={step} />

      {/* 4 conditions checklist */}
      <ConditionChecklist step={step} />

      {/* Description */}
      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
