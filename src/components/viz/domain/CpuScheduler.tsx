"use client";

import { StepPlayer } from "../primitives/StepPlayer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ProcessInfo {
  id: string;
  label: string;
  arrival: number;
  burst: number;
  color: {
    bg: string;
    border: string;
    text: string;
    bar: string;
  };
}

interface GanttBlock {
  processId: string;
  start: number;
  end: number;
}

interface SchedulerStep {
  gantt: GanttBlock[];
  readyQueue: string[];
  running: string | null;
  currentTime: number;
  description: string;
  metrics?: { pid: string; waiting: number; turnaround: number }[];
}

/* ------------------------------------------------------------------ */
/*  Process definitions                                                */
/* ------------------------------------------------------------------ */

const processColors: ProcessInfo["color"][] = [
  {
    bg: "bg-sky-100 dark:bg-sky-900/50",
    border: "border-sky-400/60 dark:border-sky-500/50",
    text: "text-sky-700 dark:text-sky-300",
    bar: "bg-sky-400 dark:bg-sky-500",
  },
  {
    bg: "bg-violet-100 dark:bg-violet-900/50",
    border: "border-violet-400/60 dark:border-violet-500/50",
    text: "text-violet-700 dark:text-violet-300",
    bar: "bg-violet-400 dark:bg-violet-500",
  },
  {
    bg: "bg-amber-100 dark:bg-amber-900/50",
    border: "border-amber-400/60 dark:border-amber-500/50",
    text: "text-amber-700 dark:text-amber-300",
    bar: "bg-amber-400 dark:bg-amber-500",
  },
  {
    bg: "bg-emerald-100 dark:bg-emerald-900/50",
    border: "border-emerald-400/60 dark:border-emerald-500/50",
    text: "text-emerald-700 dark:text-emerald-300",
    bar: "bg-emerald-400 dark:bg-emerald-500",
  },
];

/* ------------------------------------------------------------------ */
/*  FCFS preset                                                        */
/* ------------------------------------------------------------------ */

const fcfsProcesses: ProcessInfo[] = [
  { id: "P1", label: "P1", arrival: 0, burst: 4, color: processColors[0] },
  { id: "P2", label: "P2", arrival: 1, burst: 3, color: processColors[1] },
  { id: "P3", label: "P3", arrival: 2, burst: 1, color: processColors[2] },
  { id: "P4", label: "P4", arrival: 3, burst: 2, color: processColors[3] },
];

function buildFcfsSteps(): SchedulerStep[] {
  const steps: SchedulerStep[] = [];
  const gantt: GanttBlock[] = [];
  let time = 0;

  // Initial state
  steps.push({
    gantt: [],
    readyQueue: [],
    running: null,
    currentTime: 0,
    description:
      "FCFS (First-Come, First-Served) 스케줄링을 시작합니다. 도착 순서대로 실행하는 가장 단순한 비선점형 알고리즘입니다. P1(burst=4), P2(burst=3), P3(burst=1), P4(burst=2)가 순서대로 도착합니다.",
  });

  for (const proc of fcfsProcesses) {
    const block: GanttBlock = { processId: proc.id, start: time, end: time + proc.burst };
    gantt.push(block);

    // Show queue before running
    const waiting = fcfsProcesses
      .filter((p) => p.arrival <= time && p.id !== proc.id && !gantt.slice(0, -1).some((g) => g.processId === p.id && g.end <= time))
      .filter((p) => {
        const executed = gantt.slice(0, -1).find((g) => g.processId === p.id);
        return !executed;
      });

    steps.push({
      gantt: [...gantt],
      readyQueue: waiting.map((w) => w.id),
      running: proc.id,
      currentTime: time + proc.burst,
      description:
        `${proc.label}을 t=${time}에서 t=${time + proc.burst}까지 실행합니다 (burst=${proc.burst}). FCFS는 실행 중인 프로세스를 끝까지 처리한 후 다음으로 넘어갑니다.`,
    });

    time += proc.burst;
  }

  // Final metrics
  const metrics = fcfsProcesses.map((proc) => {
    const block = gantt.find((g) => g.processId === proc.id)!;
    const turnaround = block.end - proc.arrival;
    const waiting = turnaround - proc.burst;
    return { pid: proc.id, waiting, turnaround };
  });

  steps.push({
    gantt: [...gantt],
    readyQueue: [],
    running: null,
    currentTime: time,
    metrics,
    description: `모든 프로세스 완료. 평균 대기 시간 = ${(metrics.reduce((s, m) => s + m.waiting, 0) / metrics.length).toFixed(1)}, 평균 반환 시간 = ${(metrics.reduce((s, m) => s + m.turnaround, 0) / metrics.length).toFixed(1)}. 먼저 도착한 긴 작업이 뒤의 짧은 작업을 오래 기다리게 하는 Convoy Effect가 나타납니다.`,
  });

  return steps;
}

/* ------------------------------------------------------------------ */
/*  Round Robin preset                                                 */
/* ------------------------------------------------------------------ */

const rrProcesses: ProcessInfo[] = [
  { id: "P1", label: "P1", arrival: 0, burst: 4, color: processColors[0] },
  { id: "P2", label: "P2", arrival: 1, burst: 3, color: processColors[1] },
  { id: "P3", label: "P3", arrival: 2, burst: 1, color: processColors[2] },
  { id: "P4", label: "P4", arrival: 3, burst: 2, color: processColors[3] },
];

function buildRrSteps(): SchedulerStep[] {
  const quantum = 2;
  const steps: SchedulerStep[] = [];
  const gantt: GanttBlock[] = [];
  const remaining = new Map(rrProcesses.map((p) => [p.id, p.burst]));
  const queue: string[] = [];
  let time = 0;
  const arrived = new Set<string>();

  steps.push({
    gantt: [],
    readyQueue: [],
    running: null,
    currentTime: 0,
    description:
      `라운드 로빈(RR) 스케줄링을 시작합니다. 타임 퀀텀 = ${quantum}. 각 프로세스는 최대 ${quantum}단위 시간만 실행되고 큐 맨 뒤로 돌아갑니다. 선점형 알고리즘으로, 모든 프로세스에 공정하게 CPU 시간을 배분합니다.`,
  });

  // Initialize: add P1 at time 0
  for (const p of rrProcesses) {
    if (p.arrival <= 0 && !arrived.has(p.id)) {
      queue.push(p.id);
      arrived.add(p.id);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const rem = remaining.get(current)!;
    const runTime = Math.min(rem, quantum);

    const newGantt: GanttBlock = { processId: current, start: time, end: time + runTime };
    gantt.push(newGantt);

    time += runTime;
    remaining.set(current, rem - runTime);

    // Add newly arrived processes before the preempted one
    for (const p of rrProcesses) {
      if (p.arrival > time - runTime && p.arrival <= time && !arrived.has(p.id)) {
        queue.push(p.id);
        arrived.add(p.id);
      }
    }

    // If not finished, push back to queue
    if (remaining.get(current)! > 0) {
      queue.push(current);
    }

    const queueDisplay = [...queue];
    const finished = remaining.get(current) === 0;

    steps.push({
      gantt: [...gantt],
      readyQueue: queueDisplay,
      running: current,
      currentTime: time,
      description: finished
        ? `${current}을 t=${newGantt.start}~${newGantt.end}에서 실행. 남은 burst=0, 완료되었습니다.`
        : `${current}을 t=${newGantt.start}~${newGantt.end}에서 실행. 타임 퀀텀(${quantum}) 소진. 남은 burst=${remaining.get(current)}, 큐 뒤로 이동합니다.`,
    });
  }

  // Final metrics
  const completionTime = new Map<string, number>();
  for (const block of gantt) {
    completionTime.set(block.processId, block.end);
  }
  const metrics = rrProcesses.map((proc) => {
    const ct = completionTime.get(proc.id)!;
    const turnaround = ct - proc.arrival;
    const waiting = turnaround - proc.burst;
    return { pid: proc.id, waiting, turnaround };
  });

  steps.push({
    gantt: [...gantt],
    readyQueue: [],
    running: null,
    currentTime: time,
    metrics,
    description: `모든 프로세스 완료. 평균 대기 시간 = ${(metrics.reduce((s, m) => s + m.waiting, 0) / metrics.length).toFixed(1)}, 평균 반환 시간 = ${(metrics.reduce((s, m) => s + m.turnaround, 0) / metrics.length).toFixed(1)}. FCFS보다 짧은 작업의 대기 시간이 크게 줄었습니다.`,
  });

  return steps;
}

/* ------------------------------------------------------------------ */
/*  Presets                                                            */
/* ------------------------------------------------------------------ */

const presets: Record<string, { label: string; processes: ProcessInfo[]; steps: SchedulerStep[] }> = {
  fcfs: {
    label: "FCFS",
    processes: fcfsProcesses,
    steps: buildFcfsSteps(),
  },
  rr: {
    label: "Round Robin (Q=2)",
    processes: rrProcesses,
    steps: buildRrSteps(),
  },
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function ProcessTable({ processes }: { processes: ProcessInfo[] }) {
  return (
    <div className="w-full">
      <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
        프로세스 정보
      </span>
      <div className="overflow-x-auto">
        <table className="w-full text-[0.6875rem]">
          <thead>
            <tr className="border-b border-border">
              <th className="px-2 py-1 text-left font-bold text-muted">PID</th>
              <th className="px-2 py-1 text-left font-bold text-muted">도착</th>
              <th className="px-2 py-1 text-left font-bold text-muted">Burst</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((p) => (
              <tr key={p.id} className="border-b border-border/50">
                <td className={`px-2 py-1 font-mono font-bold ${p.color.text}`}>
                  {p.label}
                </td>
                <td className="px-2 py-1 font-mono text-text">{p.arrival}</td>
                <td className="px-2 py-1 font-mono text-text">{p.burst}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GanttChart({
  gantt,
  processes,
  currentTime,
}: {
  gantt: GanttBlock[];
  processes: ProcessInfo[];
  currentTime: number;
}) {
  if (gantt.length === 0) return null;

  const totalTime = Math.max(currentTime, ...gantt.map((g) => g.end));
  const processMap = new Map(processes.map((p) => [p.id, p]));

  return (
    <div className="w-full">
      <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
        Gantt 차트
      </span>
      <div className="overflow-x-auto">
        <div className="min-w-0">
          {/* Gantt bars */}
          <div className="flex h-8">
            {gantt.map((block, idx) => {
              const proc = processMap.get(block.processId)!;
              const widthPct = ((block.end - block.start) / totalTime) * 100;
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-center border-r border-bg ${proc.color.bar} transition-all duration-300`}
                  style={{ width: `${widthPct}%` }}
                >
                  <span className="text-[0.625rem] font-bold text-white dark:text-white/90">
                    {proc.label}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Time markers */}
          <div className="relative flex">
            {gantt.map((block, idx) => {
              const widthPct = ((block.end - block.start) / totalTime) * 100;
              return (
                <div key={idx} style={{ width: `${widthPct}%` }} className="relative">
                  <span className="absolute left-0 -translate-x-1/2 pt-0.5 font-mono text-[0.5rem] text-muted">
                    {block.start}
                  </span>
                  {idx === gantt.length - 1 && (
                    <span className="absolute right-0 translate-x-1/2 pt-0.5 font-mono text-[0.5rem] text-muted">
                      {block.end}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReadyQueue({
  queue,
  running,
  processes,
}: {
  queue: string[];
  running: string | null;
  processes: ProcessInfo[];
}) {
  const processMap = new Map(processes.map((p) => [p.id, p]));

  return (
    <div className="w-full">
      <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
        상태
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {running && (
          <div className="flex items-center gap-1.5">
            <span className="text-[0.625rem] font-bold text-muted">CPU:</span>
            <span
              className={`px-2 py-0.5 font-mono text-[0.625rem] font-bold border ${
                processMap.get(running)!.color.bg
              } ${processMap.get(running)!.color.border} ${
                processMap.get(running)!.color.text
              }`}
            >
              {running}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <span className="text-[0.625rem] font-bold text-muted">Ready:</span>
          {queue.length === 0 ? (
            <span className="text-[0.625rem] text-muted/50">(비어 있음)</span>
          ) : (
            <div className="flex gap-1">
              {queue.map((pid, idx) => {
                const proc = processMap.get(pid);
                if (!proc) return null;
                return (
                  <span
                    key={idx}
                    className={`px-1.5 py-0.5 font-mono text-[0.625rem] font-bold border ${proc.color.bg} ${proc.color.border} ${proc.color.text}`}
                  >
                    {pid}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricsTable({
  metrics,
  processes,
}: {
  metrics: { pid: string; waiting: number; turnaround: number }[];
  processes: ProcessInfo[];
}) {
  const processMap = new Map(processes.map((p) => [p.id, p]));
  const avgWait = metrics.reduce((s, m) => s + m.waiting, 0) / metrics.length;
  const avgTurnaround = metrics.reduce((s, m) => s + m.turnaround, 0) / metrics.length;

  return (
    <div className="w-full">
      <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
        성능 지표
      </span>
      <div className="overflow-x-auto">
        <table className="w-full text-[0.6875rem]">
          <thead>
            <tr className="border-b border-border">
              <th className="px-2 py-1 text-left font-bold text-muted">PID</th>
              <th className="px-2 py-1 text-left font-bold text-muted">대기 시간</th>
              <th className="px-2 py-1 text-left font-bold text-muted">반환 시간</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => {
              const proc = processMap.get(m.pid);
              return (
                <tr key={m.pid} className="border-b border-border/50">
                  <td className={`px-2 py-1 font-mono font-bold ${proc?.color.text ?? "text-text"}`}>
                    {m.pid}
                  </td>
                  <td className="px-2 py-1 font-mono text-text">{m.waiting}</td>
                  <td className="px-2 py-1 font-mono text-text">{m.turnaround}</td>
                </tr>
              );
            })}
            <tr className="border-t border-border">
              <td className="px-2 py-1 font-bold text-muted">평균</td>
              <td className="px-2 py-1 font-mono font-bold text-accent">{avgWait.toFixed(1)}</td>
              <td className="px-2 py-1 font-mono font-bold text-accent">{avgTurnaround.toFixed(1)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface CpuSchedulerProps {
  preset?: string;
}

export function CpuScheduler({ preset = "fcfs" }: CpuSchedulerProps) {
  const data = presets[preset] ?? presets["fcfs"];

  const stepNodes = data.steps.map((step, idx) => (
    <div key={idx} className="space-y-4">
      {/* Algorithm label */}
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 font-mono text-[0.5625rem] font-bold bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300">
          {data.label}
        </span>
        <span className="font-mono text-[0.5625rem] text-muted">
          t = {step.currentTime}
        </span>
      </div>

      {/* Process table + Ready queue */}
      <div className="flex gap-4 max-sm:flex-col">
        <div className="flex-shrink-0">
          <ProcessTable processes={data.processes} />
        </div>
        <div className="flex-1 min-w-0">
          <ReadyQueue
            queue={step.readyQueue}
            running={step.running}
            processes={data.processes}
          />
        </div>
      </div>

      {/* Gantt chart */}
      <GanttChart
        gantt={step.gantt}
        processes={data.processes}
        currentTime={step.currentTime}
      />

      {/* Metrics (final step) */}
      {step.metrics && (
        <MetricsTable metrics={step.metrics} processes={data.processes} />
      )}

      {/* Description */}
      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
