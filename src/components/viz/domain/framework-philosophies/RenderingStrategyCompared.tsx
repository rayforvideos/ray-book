"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ─── Types ─── */

type Preset = "vdom" | "compiled";

interface ListItem {
  label: string;
  isNew: boolean;
  visible: boolean;
}

interface VdomNode {
  label: string;
  isNew: boolean;
  highlighted: boolean;
}

interface Step {
  label: string;
  description: string;
  items: ListItem[];
  showOldVdom?: boolean;
  showNewVdom?: boolean;
  oldVdom?: VdomNode[];
  newVdom?: VdomNode[];
  showDiffArrow?: boolean;
  domOperation?: string;
}

/* ─── Colors ─── */

const PRESET_STYLES: Record<
  Preset,
  {
    activeBg: string;
    activeBorder: string;
    activeText: string;
    newBg: string;
    newBorder: string;
    newText: string;
    dotColor: string;
  }
> = {
  vdom: {
    activeBg: "bg-sky-50 dark:bg-sky-950",
    activeBorder: "border-sky-400 dark:border-sky-500",
    activeText: "text-sky-800 dark:text-sky-200",
    newBg: "bg-sky-100 dark:bg-sky-900",
    newBorder: "border-sky-500 dark:border-sky-400",
    newText: "text-sky-700 dark:text-sky-300",
    dotColor: "bg-sky-500",
  },
  compiled: {
    activeBg: "bg-orange-50 dark:bg-orange-950",
    activeBorder: "border-orange-400 dark:border-orange-500",
    activeText: "text-orange-800 dark:text-orange-200",
    newBg: "bg-orange-100 dark:bg-orange-900",
    newBorder: "border-orange-500 dark:border-orange-400",
    newText: "text-orange-700 dark:text-orange-300",
    dotColor: "bg-orange-500",
  },
};

/* ─── Step Data ─── */

const PRESETS: Record<Preset, Step[]> = {
  vdom: [
    {
      label: "State 변경",
      description:
        "items.push('D')가 호출됩니다. 상태가 변경되었으므로 React는 re-render를 스케줄합니다.",
      items: [
        { label: "A", isNew: false, visible: true },
        { label: "B", isNew: false, visible: true },
        { label: "C", isNew: false, visible: true },
      ],
    },
    {
      label: "새 VDOM 트리 생성",
      description:
        "컴포넌트 함수가 다시 실행됩니다. 메모리에 새로운 Virtual DOM 트리가 만들어집니다. A, B, C, D 네 개의 노드를 포함합니다.",
      items: [
        { label: "A", isNew: false, visible: true },
        { label: "B", isNew: false, visible: true },
        { label: "C", isNew: false, visible: true },
      ],
      showOldVdom: true,
      showNewVdom: true,
      oldVdom: [
        { label: "A", isNew: false, highlighted: false },
        { label: "B", isNew: false, highlighted: false },
        { label: "C", isNew: false, highlighted: false },
      ],
      newVdom: [
        { label: "A", isNew: false, highlighted: false },
        { label: "B", isNew: false, highlighted: false },
        { label: "C", isNew: false, highlighted: false },
        { label: "D", isNew: true, highlighted: false },
      ],
    },
    {
      label: "VDOM Diff",
      description:
        "이전 VDOM과 새 VDOM을 비교합니다. A, B, C는 동일하고 'D'가 새로 추가되었음을 발견합니다.",
      items: [
        { label: "A", isNew: false, visible: true },
        { label: "B", isNew: false, visible: true },
        { label: "C", isNew: false, visible: true },
      ],
      showOldVdom: true,
      showNewVdom: true,
      showDiffArrow: true,
      oldVdom: [
        { label: "A", isNew: false, highlighted: false },
        { label: "B", isNew: false, highlighted: false },
        { label: "C", isNew: false, highlighted: false },
      ],
      newVdom: [
        { label: "A", isNew: false, highlighted: false },
        { label: "B", isNew: false, highlighted: false },
        { label: "C", isNew: false, highlighted: false },
        { label: "D", isNew: true, highlighted: true },
      ],
    },
    {
      label: "DOM Patch",
      description:
        "diff 결과에 따라 최소한의 DOM 조작만 수행합니다. appendChild('D') 한 번이면 끝입니다.",
      items: [
        { label: "A", isNew: false, visible: true },
        { label: "B", isNew: false, visible: true },
        { label: "C", isNew: false, visible: true },
        { label: "D", isNew: true, visible: true },
      ],
      domOperation: "appendChild('D')",
    },
  ],
  compiled: [
    {
      label: "State 변경",
      description:
        "items.push('D')가 호출됩니다. 컴파일러가 생성한 코드가 변경을 감지합니다.",
      items: [
        { label: "A", isNew: false, visible: true },
        { label: "B", isNew: false, visible: true },
        { label: "C", isNew: false, visible: true },
      ],
    },
    {
      label: "컴파일러 생성 코드 실행",
      description:
        "VDOM을 만들거나 diff를 수행하지 않습니다. 컴파일러가 미리 생성해 둔 코드가 'D'에 대한 DOM 노드를 직접 생성합니다.",
      items: [
        { label: "A", isNew: false, visible: true },
        { label: "B", isNew: false, visible: true },
        { label: "C", isNew: false, visible: true },
      ],
      domOperation: "document.createElement('li')",
    },
    {
      label: "DOM 업데이트",
      description:
        "생성된 DOM 노드를 바로 삽입합니다. diff가 없으므로 비교 비용이 제로입니다. appendChild('D') — 끝.",
      items: [
        { label: "A", isNew: false, visible: true },
        { label: "B", isNew: false, visible: true },
        { label: "C", isNew: false, visible: true },
        { label: "D", isNew: true, visible: true },
      ],
      domOperation: "appendChild('D')",
    },
  ],
};

/* ─── List Visualization ─── */

function ListViz({ items, preset }: { items: ListItem[]; preset: Preset }) {
  const style = PRESET_STYLES[preset];
  return (
    <div className="flex items-center gap-2">
      <span className="text-[0.6875rem] font-bold text-muted mr-1">DOM</span>
      {items.map((item, i) => (
        <div
          key={`${item.label}-${i}`}
          className={[
            "flex items-center justify-center w-10 h-10 rounded border text-sm font-mono font-bold transition-all duration-300",
            item.isNew
              ? `${style.newBg} ${style.newBorder} ${style.newText} ring-2 ring-offset-1 ring-offset-transparent ${preset === "vdom" ? "ring-sky-400/50 dark:ring-sky-500/50" : "ring-orange-400/50 dark:ring-orange-500/50"}`
              : "bg-surface border-border text-text",
          ].join(" ")}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}

/* ─── VDOM Tree ─── */

function VdomTree({
  label,
  nodes,
  preset,
}: {
  label: string;
  nodes: VdomNode[];
  preset: Preset;
}) {
  const style = PRESET_STYLES[preset];
  return (
    <div className="space-y-1.5">
      <span className="text-[0.625rem] font-bold text-muted uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        {nodes.map((node, i) => (
          <div
            key={`${node.label}-${i}`}
            className={[
              "flex items-center justify-center w-8 h-8 rounded border text-xs font-mono font-bold transition-all duration-300",
              node.highlighted
                ? `${style.newBg} ${style.newBorder} ${style.newText} ring-2 ring-offset-1 ring-offset-transparent ${preset === "vdom" ? "ring-sky-400/50 dark:ring-sky-500/50" : "ring-orange-400/50 dark:ring-orange-500/50"}`
                : node.isNew
                  ? `${style.activeBg} ${style.activeBorder} ${style.activeText}`
                  : "bg-surface border-border text-muted",
            ].join(" ")}
          >
            {node.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Legend ─── */

function Legend({ preset }: { preset: Preset }) {
  const style = PRESET_STYLES[preset];
  const labels: Record<Preset, string> = {
    vdom: "VDOM Diff (React/Vue)",
    compiled: "Compiled (Svelte)",
  };
  return (
    <div className="flex items-center gap-2 text-[0.6875rem] text-muted">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${style.dotColor}`} />
      <span>{labels[preset]}</span>
    </div>
  );
}

/* ─── Main Component ─── */

interface RenderingStrategyComparedProps {
  preset?: string;
}

export function RenderingStrategyCompared({
  preset = "vdom",
}: RenderingStrategyComparedProps) {
  const key = preset as Preset;
  const steps = PRESETS[key] ?? PRESETS.vdom;

  const stepNodes = steps.map((step, idx) => (
    <div key={idx} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-bold text-accent">
          {step.label}
        </span>
        <span className="text-[0.6875rem] text-muted">
          {idx + 1} / {steps.length}
        </span>
      </div>

      {/* DOM List */}
      <ListViz items={step.items} preset={key} />

      {/* VDOM Comparison (vdom preset only) */}
      {(step.showOldVdom || step.showNewVdom) && (
        <div className="mt-3 space-y-3">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-start">
            {step.showOldVdom && step.oldVdom && (
              <VdomTree label="Old VDOM" nodes={step.oldVdom} preset={key} />
            )}
            {step.showDiffArrow && (
              <div className="hidden sm:flex items-end pb-2 text-muted">
                <span className="text-lg">⇄</span>
              </div>
            )}
            {step.showNewVdom && step.newVdom && (
              <VdomTree label="New VDOM" nodes={step.newVdom} preset={key} />
            )}
          </div>
        </div>
      )}

      {/* DOM Operation */}
      {step.domOperation && (
        <div className="mt-2 inline-block rounded bg-surface border border-border px-3 py-1.5">
          <span className="text-[0.75rem] font-mono text-accent">
            {step.domOperation}
          </span>
        </div>
      )}

      {/* Legend */}
      <Legend preset={key} />

      {/* Description */}
      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
