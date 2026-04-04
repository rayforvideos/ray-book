"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ── Types ── */

interface Block {
  label: string;
  widthPercent: number;
  color: string;
  ms?: string;
}

interface TimelineRow {
  thread: string;
  blocks: Block[];
}

interface Preset {
  title: string;
  rows: TimelineRow[];
  description: string;
}

/* ── Colors ── */

const TASK =
  "bg-red-200 dark:bg-red-900/60 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700";
const CHUNK =
  "bg-sky-200 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 border-sky-300 dark:border-sky-700";
const EVENT =
  "bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700";
const IDLE =
  "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border-stone-200 dark:border-stone-700";
const WORKER =
  "bg-violet-200 dark:bg-violet-900/60 text-violet-800 dark:text-violet-200 border-violet-300 dark:border-violet-700";
const YIELD =
  "bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700";

/* ── Presets ── */

const presets: Preset[] = [
  {
    title: "Long Task — 200ms 메인 스레드 차단",
    rows: [
      {
        thread: "Main",
        blocks: [
          { label: "Long Task", widthPercent: 80, color: TASK, ms: "200ms" },
          { label: "idle", widthPercent: 20, color: IDLE },
        ],
      },
      {
        thread: "Event",
        blocks: [
          { label: "click 대기 ⏳", widthPercent: 80, color: IDLE },
          { label: "처리", widthPercent: 20, color: EVENT, ms: "5ms" },
        ],
      },
    ],
    description:
      "200ms 동안 메인 스레드가 차단되어 사용자 클릭이 즉시 처리되지 못합니다. 50ms를 초과하는 작업은 Long Task로 분류되며, INP (Interaction to Next Paint) 점수에 직접적인 악영향을 미칩니다.",
  },
  {
    title: "Time Slicing — 10ms 청크로 분할",
    rows: [
      {
        thread: "Main",
        blocks: [
          { label: "chunk", widthPercent: 12, color: CHUNK, ms: "10ms" },
          { label: "⚡", widthPercent: 5, color: EVENT },
          { label: "chunk", widthPercent: 12, color: CHUNK, ms: "10ms" },
          { label: "⚡", widthPercent: 5, color: EVENT },
          { label: "chunk", widthPercent: 12, color: CHUNK, ms: "10ms" },
          { label: "⚡", widthPercent: 5, color: EVENT },
          { label: "chunk", widthPercent: 12, color: CHUNK, ms: "10ms" },
          { label: "idle", widthPercent: 37, color: IDLE },
        ],
      },
      {
        thread: "Event",
        blocks: [
          { label: "즉시 처리 가능 ✓", widthPercent: 100, color: EVENT },
        ],
      },
    ],
    description:
      "작업을 10ms 이하의 청크로 분할하면, 청크 사이에 브라우저가 이벤트를 처리할 수 있습니다. setTimeout(fn, 0)이나 MessageChannel을 사용해 제어권을 반환합니다.",
  },
  {
    title: "Web Worker — 별도 스레드 위임",
    rows: [
      {
        thread: "Main",
        blocks: [
          { label: "postMessage", widthPercent: 8, color: CHUNK, ms: "1ms" },
          { label: "자유 (UI 반응)", widthPercent: 72, color: EVENT },
          { label: "결과 수신", widthPercent: 20, color: CHUNK, ms: "2ms" },
        ],
      },
      {
        thread: "Worker",
        blocks: [
          { label: "", widthPercent: 8, color: IDLE },
          { label: "Heavy computation", widthPercent: 72, color: WORKER, ms: "200ms" },
          { label: "", widthPercent: 20, color: IDLE },
        ],
      },
    ],
    description:
      "CPU 집약적인 작업을 Web Worker로 위임하면 메인 스레드가 완전히 자유로워집니다. 이미지 처리, JSON 파싱, 데이터 정렬 등에 적합합니다. 다만 DOM 접근은 불가능합니다.",
  },
  {
    title: "scheduler.yield() — 제어권 반환",
    rows: [
      {
        thread: "Main",
        blocks: [
          { label: "작업 A", widthPercent: 18, color: CHUNK, ms: "15ms" },
          { label: "yield", widthPercent: 6, color: YIELD },
          { label: "작업 B", widthPercent: 18, color: CHUNK, ms: "15ms" },
          { label: "yield", widthPercent: 6, color: YIELD },
          { label: "작업 C", widthPercent: 18, color: CHUNK, ms: "15ms" },
          { label: "idle", widthPercent: 34, color: IDLE },
        ],
      },
      {
        thread: "Event",
        blocks: [
          { label: "yield 시점에 처리 가능 ✓", widthPercent: 100, color: EVENT },
        ],
      },
    ],
    description:
      "scheduler.yield()는 await로 메인 스레드에 제어권을 반환하고, 브라우저가 긴급한 작업을 처리한 후 이어서 실행합니다. setTimeout과 달리 continuation이 우선 스케줄링되어 다른 태스크에 끼어들기를 방지합니다.",
  },
];

/* ── Sub-components ── */

function TimelineBlock({ block }: { block: Block }) {
  return (
    <div
      className={`border px-1 py-1.5 text-center font-mono text-[0.625rem] font-medium truncate ${block.color}`}
      style={{ width: `${block.widthPercent}%`, minWidth: "1.5rem" }}
      title={`${block.label}${block.ms ? ` (${block.ms})` : ""}`}
    >
      <span className="truncate block">
        {block.label}
        {block.ms && (
          <span className="ml-0.5 opacity-70 text-[0.5625rem]">
            {block.ms}
          </span>
        )}
      </span>
    </div>
  );
}

function Timeline({ rows }: { rows: TimelineRow[] }) {
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.thread} className="flex items-center gap-2">
          <span className="shrink-0 w-12 text-right font-mono text-[0.625rem] text-muted">
            {row.thread}
          </span>
          <div className="flex-1 flex gap-px overflow-hidden">
            {row.blocks.map((block, i) => (
              <TimelineBlock key={i} block={block} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main ── */

export function MainThreadTimeline() {
  const stepNodes = presets.map((p, i) => (
    <div key={i} className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-2 py-0.5 font-mono text-[0.625rem] font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300">
          Step {i + 1}
        </span>
        <span className="text-[0.8125rem] font-medium text-text">
          {p.title}
        </span>
      </div>

      <Timeline rows={p.rows} />

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {p.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
