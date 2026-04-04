"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ─── Types ─── */

interface PipelineStage {
  label: string;
  active: boolean;
  description?: string;
}

interface Step {
  label: string;
  description: string;
  stages: PipelineStage[];
}

type Preset = "react" | "vue" | "angular" | "svelte";

/* ─── Framework Colors ─── */

const FRAMEWORK_STYLES: Record<
  Preset,
  {
    activeBg: string;
    activeBorder: string;
    activeText: string;
    arrowActive: string;
    dotColor: string;
  }
> = {
  react: {
    activeBg: "bg-sky-50 dark:bg-sky-950",
    activeBorder: "border-sky-400 dark:border-sky-500",
    activeText: "text-sky-800 dark:text-sky-200",
    arrowActive: "text-sky-400 dark:text-sky-500",
    dotColor: "bg-sky-500",
  },
  vue: {
    activeBg: "bg-emerald-50 dark:bg-emerald-950",
    activeBorder: "border-emerald-400 dark:border-emerald-500",
    activeText: "text-emerald-800 dark:text-emerald-200",
    arrowActive: "text-emerald-400 dark:text-emerald-500",
    dotColor: "bg-emerald-500",
  },
  angular: {
    activeBg: "bg-rose-50 dark:bg-rose-950",
    activeBorder: "border-rose-400 dark:border-rose-500",
    activeText: "text-rose-800 dark:text-rose-200",
    arrowActive: "text-rose-400 dark:text-rose-500",
    dotColor: "bg-rose-500",
  },
  svelte: {
    activeBg: "bg-orange-50 dark:bg-orange-950",
    activeBorder: "border-orange-400 dark:border-orange-500",
    activeText: "text-orange-800 dark:text-orange-200",
    arrowActive: "text-orange-400 dark:text-orange-500",
    dotColor: "bg-orange-500",
  },
};

/* ─── Step Data ─── */

const PRESETS: Record<Preset, Step[]> = {
  react: [
    {
      label: "setState 호출",
      description:
        "setState(count + 1)이 호출되면, React는 해당 컴포넌트를 dirty로 마킹합니다. 아직 DOM은 건드리지 않습니다.",
      stages: [
        { label: "State Change", active: true, description: "setState(count + 1)" },
        { label: "Detection", active: false },
        { label: "Reconciliation", active: false },
        { label: "DOM Update", active: false },
      ],
    },
    {
      label: "Re-render → VDOM 생성",
      description:
        "컴포넌트 함수 전체가 다시 실행됩니다. 새로운 Virtual DOM 트리를 메모리에 생성합니다.",
      stages: [
        { label: "State Change", active: true, description: "setState(count + 1)" },
        { label: "Detection", active: true, description: "컴포넌트 함수 재실행" },
        { label: "Reconciliation", active: false },
        { label: "DOM Update", active: false },
      ],
    },
    {
      label: "VDOM Diff",
      description:
        "이전 VDOM과 새 VDOM을 비교 (diffing) 합니다. 변경된 텍스트 노드를 찾아냅니다.",
      stages: [
        { label: "State Change", active: true, description: "setState(count + 1)" },
        { label: "Detection", active: true, description: "컴포넌트 함수 재실행" },
        { label: "Reconciliation", active: true, description: "VDOM diff → 변경 노드 발견" },
        { label: "DOM Update", active: false },
      ],
    },
    {
      label: "DOM Patch",
      description:
        "diff에서 발견된 최소한의 변경만 실제 DOM에 적용합니다. 전체 DOM을 다시 그리지 않습니다.",
      stages: [
        { label: "State Change", active: true, description: "setState(count + 1)" },
        { label: "Detection", active: true, description: "컴포넌트 함수 재실행" },
        { label: "Reconciliation", active: true, description: "VDOM diff → 변경 노드 발견" },
        { label: "DOM Update", active: true, description: "최소 DOM patch 적용" },
      ],
    },
  ],
  vue: [
    {
      label: "Proxy set trap",
      description:
        "count.value++를 실행하면, Vue의 Proxy가 set 트랩을 실행합니다. 값이 변경되었음을 감지합니다.",
      stages: [
        { label: "State Change", active: true, description: "count.value++ → Proxy set" },
        { label: "Detection", active: false },
        { label: "Reconciliation", active: false },
        { label: "DOM Update", active: false },
      ],
    },
    {
      label: "의존성 추적",
      description:
        "이 count를 사용하는 컴포넌트와 effect를 찾습니다. 렌더링 시 자동으로 수집된 의존성 그래프를 활용합니다.",
      stages: [
        { label: "State Change", active: true, description: "count.value++ → Proxy set" },
        { label: "Detection", active: true, description: "의존성 그래프 탐색" },
        { label: "Reconciliation", active: false },
        { label: "DOM Update", active: false },
      ],
    },
    {
      label: "VDOM Diff (with compiler hints)",
      description:
        "의존하는 컴포넌트만 re-render합니다. Vue 컴파일러가 정적/동적 노드를 미리 분류해 두어 diff가 빠릅니다.",
      stages: [
        { label: "State Change", active: true, description: "count.value++ → Proxy set" },
        { label: "Detection", active: true, description: "의존성 그래프 탐색" },
        { label: "Reconciliation", active: true, description: "컴파일러 힌트 + VDOM diff" },
        { label: "DOM Update", active: false },
      ],
    },
    {
      label: "DOM Patch",
      description:
        "diff 결과를 실제 DOM에 적용합니다. 컴파일러 최적화 덕분에 비교 대상이 적어 빠릅니다.",
      stages: [
        { label: "State Change", active: true, description: "count.value++ → Proxy set" },
        { label: "Detection", active: true, description: "의존성 그래프 탐색" },
        { label: "Reconciliation", active: true, description: "컴파일러 힌트 + VDOM diff" },
        { label: "DOM Update", active: true, description: "DOM patch 적용" },
      ],
    },
  ],
  angular: [
    {
      label: "Zone.js 이벤트 가로채기",
      description:
        "버튼 클릭 이벤트를 Zone.js가 가로챕니다. Zone.js는 모든 비동기 작업 (이벤트, setTimeout, Promise 등) 을 래핑하여 감지합니다.",
      stages: [
        { label: "State Change", active: true, description: "click → Zone.js 감지" },
        { label: "Detection", active: false },
        { label: "Reconciliation", active: false },
        { label: "DOM Update", active: false },
      ],
    },
    {
      label: "Change Detection 시작",
      description:
        "Zone.js가 Angular에 알리면, 루트 컴포넌트부터 변경 감지 사이클이 시작됩니다. 트리 전체를 순회합니다.",
      stages: [
        { label: "State Change", active: true, description: "click → Zone.js 감지" },
        { label: "Detection", active: true, description: "루트부터 CD 사이클 시작" },
        { label: "Reconciliation", active: false },
        { label: "DOM Update", active: false },
      ],
    },
    {
      label: "바인딩 체크",
      description:
        "각 컴포넌트의 템플릿 바인딩을 하나씩 확인합니다. {{ count() }}의 값이 이전과 다른지 비교합니다.",
      stages: [
        { label: "State Change", active: true, description: "click → Zone.js 감지" },
        { label: "Detection", active: true, description: "루트부터 CD 사이클 시작" },
        { label: "Reconciliation", active: true, description: "템플릿 바인딩 비교" },
        { label: "DOM Update", active: false },
      ],
    },
    {
      label: "DOM 업데이트",
      description:
        "변경된 바인딩에 해당하는 DOM만 업데이트합니다. VDOM 없이 직접 DOM을 수정합니다 (Ivy 렌더러).",
      stages: [
        { label: "State Change", active: true, description: "click → Zone.js 감지" },
        { label: "Detection", active: true, description: "루트부터 CD 사이클 시작" },
        { label: "Reconciliation", active: true, description: "템플릿 바인딩 비교" },
        { label: "DOM Update", active: true, description: "Ivy → DOM 직접 수정" },
      ],
    },
  ],
  svelte: [
    {
      label: "시그널 값 변경",
      description:
        "count++를 실행하면, 컴파일러가 $state()를 시그널 객체로 변환해 둔 코드가 값 변경을 감지합니다. Svelte 5의 Runes는 런타임 시그널 기반입니다.",
      stages: [
        { label: "State Change", active: true, description: "count++ → 시그널 업데이트" },
        { label: "Detection", active: false },
        { label: "DOM Update", active: false },
      ],
    },
    {
      label: "의존성 알림",
      description:
        "시그널이 변경되면, 이 시그널에 의존하는 effect들에게 알림을 보냅니다. 표현식 수준의 세밀한 추적으로 정확히 영향받는 DOM 바인딩만 식별합니다.",
      stages: [
        { label: "State Change", active: true, description: "count++ → 시그널 업데이트" },
        { label: "Detection", active: true, description: "의존 effect 알림" },
        { label: "DOM Update", active: false },
      ],
    },
    {
      label: "직접 DOM 업데이트",
      description:
        "컴파일러가 생성한 코드가 해당 DOM 노드를 직접 업데이트합니다. VDOM diff 없이, 시그널과 DOM이 직접 연결되어 있어 최소한의 조작만 수행합니다.",
      stages: [
        { label: "State Change", active: true, description: "count++ → 시그널 업데이트" },
        { label: "Detection", active: true, description: "의존 effect 알림" },
        { label: "DOM Update", active: true, description: "element.textContent = count" },
      ],
    },
  ],
};

/* ─── Pipeline Diagram ─── */

function PipelineDiagram({
  stages,
  preset,
}: {
  stages: PipelineStage[];
  preset: Preset;
}) {
  const style = FRAMEWORK_STYLES[preset];

  return (
    <div className="flex items-stretch gap-0 overflow-x-auto py-2">
      {stages.map((stage, i) => (
        <div key={stage.label} className="flex items-stretch">
          {/* Box */}
          <div
            className={[
              "flex flex-col items-center justify-center rounded-md border px-3 py-3 min-w-[80px] max-w-[120px] transition-all duration-300",
              stage.active
                ? `${style.activeBg} ${style.activeBorder} ${style.activeText}`
                : "bg-surface border-border text-muted opacity-40",
            ].join(" ")}
          >
            <span className="text-[0.6875rem] font-bold text-center leading-tight">
              {stage.label}
            </span>
            {stage.description && stage.active && (
              <span className="mt-1 text-[0.5625rem] text-center leading-snug opacity-80">
                {stage.description}
              </span>
            )}
          </div>

          {/* Arrow */}
          {i < stages.length - 1 && (
            <div className="flex items-center px-1">
              <span
                className={[
                  "text-lg transition-colors duration-300",
                  stage.active && stages[i + 1]?.active
                    ? style.arrowActive
                    : "text-border",
                ].join(" ")}
              >
                →
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Legend ─── */

function Legend({ preset }: { preset: Preset }) {
  const style = FRAMEWORK_STYLES[preset];
  const labels: Record<Preset, string> = {
    react: "React",
    vue: "Vue",
    angular: "Angular",
    svelte: "Svelte",
  };
  return (
    <div className="flex items-center gap-2 text-[0.6875rem] text-muted">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${style.dotColor}`} />
      <span>{labels[preset]}</span>
    </div>
  );
}

/* ─── Main Component ─── */

interface ReactivityComparedProps {
  preset?: string;
}

export function ReactivityCompared({ preset = "react" }: ReactivityComparedProps) {
  const key = preset as Preset;
  const steps = PRESETS[key] ?? PRESETS.react;

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

      {/* Pipeline */}
      <PipelineDiagram stages={step.stages} preset={key} />

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
