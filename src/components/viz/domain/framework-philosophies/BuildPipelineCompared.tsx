"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ─── Types ─── */

interface PipelineBox {
  label: string;
  description: string;
  active: boolean;
}

interface Step {
  label: string;
  description: string;
  boxes: PipelineBox[];
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
      label: "1. 소스 코드",
      description:
        "JSX로 작성된 React 컴포넌트입니다. JSX는 JavaScript가 아니므로 브라우저가 직접 실행할 수 없습니다.",
      boxes: [
        { label: "JSX", description: "React 컴포넌트 소스", active: true },
        { label: "Babel / SWC", description: "트랜스파일러", active: false },
        { label: "Bundle", description: "최종 결과물", active: false },
      ],
    },
    {
      label: "2. 트랜스파일",
      description:
        "Babel 또는 SWC가 JSX를 createElement() 호출로 변환합니다. 이것이 React 빌드의 거의 전부입니다 — 변환만 하고 최적화는 하지 않습니다.",
      boxes: [
        { label: "JSX", description: "React 컴포넌트 소스", active: true },
        { label: "Babel / SWC", description: "JSX → createElement()", active: true },
        { label: "Bundle", description: "최종 결과물", active: false },
      ],
    },
    {
      label: "3. 번들링",
      description:
        "앱 코드 + React 런타임 (~42KB gzip) 이 하나의 번들로 합쳐집니다. 런타임에 VDOM diff, 재조정, 스케줄러 등 모든 로직이 포함됩니다.",
      boxes: [
        { label: "JSX", description: "React 컴포넌트 소스", active: true },
        { label: "Babel / SWC", description: "JSX → createElement()", active: true },
        { label: "Bundle", description: "앱 코드 + 런타임 ~42KB", active: true },
      ],
    },
  ],
  vue: [
    {
      label: "1. 소스 코드",
      description:
        ".vue 파일 (SFC) 에는 <script>, <template>, <style>이 하나의 파일에 담겨 있습니다.",
      boxes: [
        { label: ".vue SFC", description: "단일 파일 컴포넌트", active: true },
        { label: "vue-compiler-sfc", description: "SFC 컴파일러", active: false },
        { label: "Bundle", description: "최종 결과물", active: false },
      ],
    },
    {
      label: "2. SFC 컴파일",
      description:
        "vue-compiler-sfc가 템플릿을 분석하여 렌더 함수로 변환합니다. 이때 정적 노드와 동적 노드를 구분하는 컴파일러 힌트를 삽입합니다 — 런타임 diff를 크게 줄이는 핵심 최적화입니다.",
      boxes: [
        { label: ".vue SFC", description: "단일 파일 컴포넌트", active: true },
        { label: "vue-compiler-sfc", description: "템플릿 → 렌더 함수 + 힌트", active: true },
        { label: "Bundle", description: "최종 결과물", active: false },
      ],
    },
    {
      label: "3. 번들링",
      description:
        "앱 코드 + Vue 런타임 (~33KB gzip) 이 번들됩니다. 런타임은 반응성 시스템과 VDOM을 포함하지만, 컴파일러 힌트 덕분에 diff 범위가 최소화됩니다.",
      boxes: [
        { label: ".vue SFC", description: "단일 파일 컴포넌트", active: true },
        { label: "vue-compiler-sfc", description: "템플릿 → 렌더 함수 + 힌트", active: true },
        { label: "Bundle", description: "앱 코드 + 런타임 ~33KB", active: true },
      ],
    },
  ],
  angular: [
    {
      label: "1. 소스 코드",
      description:
        "TypeScript 클래스와 HTML 템플릿으로 구성됩니다. @Component 데코레이터가 메타데이터를 제공합니다.",
      boxes: [
        { label: ".ts + Template", description: "TS 클래스 + HTML 템플릿", active: true },
        { label: "AOT Compiler (ngc)", description: "Angular 컴파일러", active: false },
        { label: "Bundle", description: "최종 결과물", active: false },
      ],
    },
    {
      label: "2. AOT 컴파일",
      description:
        "Angular 컴파일러 (ngc) 가 데코레이터를 분석하고, 템플릿을 Ivy 명령어로 변환합니다. 타입 체크, 의존성 주입 분석, 템플릿 검증까지 빌드 시 수행합니다 — 가장 무거운 빌드 과정입니다.",
      boxes: [
        { label: ".ts + Template", description: "TS 클래스 + HTML 템플릿", active: true },
        { label: "AOT Compiler (ngc)", description: "데코레이터 → Ivy 명령어", active: true },
        { label: "Bundle", description: "최종 결과물", active: false },
      ],
    },
    {
      label: "3. 번들링",
      description:
        "tree-shaken Ivy 명령어 + Angular 런타임이 번들됩니다. Angular 21부터 zone.js가 기본에서 제거되어 번들이 ~33KB 줄었지만, 전체 런타임은 여전히 ~45KB+ (gzip) 입니다.",
      boxes: [
        { label: ".ts + Template", description: "TS 클래스 + HTML 템플릿", active: true },
        { label: "AOT Compiler (ngc)", description: "데코레이터 → Ivy 명령어", active: true },
        { label: "Bundle", description: "tree-shaken Ivy + 런타임 ~45KB+", active: true },
      ],
    },
  ],
  svelte: [
    {
      label: "1. 소스 코드",
      description:
        ".svelte 파일에 마크업, 로직, 스타일이 담겨 있습니다. React나 Vue와 달리, 이 파일은 프레임워크가 아니라 컴파일러의 입력입니다.",
      boxes: [
        { label: ".svelte", description: "컴파일러 입력 파일", active: true },
        { label: "Svelte Compiler", description: "Svelte 컴파일러", active: false },
        { label: "Bundle", description: "최종 결과물", active: false },
      ],
    },
    {
      label: "2. 컴파일",
      description:
        "Svelte 컴파일러가 .svelte 파일을 순수 JavaScript로 변환합니다. $state → 시그널 객체, 템플릿 → DOM 조작 코드로 변환됩니다. VDOM도, diff도 없습니다 — 모든 업데이트 로직이 컴파일 타임에 결정됩니다.",
      boxes: [
        { label: ".svelte", description: "컴파일러 입력 파일", active: true },
        { label: "Svelte Compiler", description: ".svelte → 순수 JS + DOM 코드", active: true },
        { label: "Bundle", description: "최종 결과물", active: false },
      ],
    },
    {
      label: "3. 번들링",
      description:
        "앱 코드만 번들됩니다. 별도의 런타임 라이브러리가 거의 없으므로 (~2KB) 빈 앱 번들이 ~3KB 수준입니다. 앱이 커지면 컴포넌트마다 코드가 추가되지만, 시작점이 극단적으로 가볍습니다.",
      boxes: [
        { label: ".svelte", description: "컴파일러 입력 파일", active: true },
        { label: "Svelte Compiler", description: ".svelte → 순수 JS + DOM 코드", active: true },
        { label: "Bundle", description: "앱 코드 + 미니 런타임 ~2KB", active: true },
      ],
    },
  ],
};

/* ─── Pipeline Diagram ─── */

function PipelineDiagram({
  boxes,
  preset,
}: {
  boxes: PipelineBox[];
  preset: Preset;
}) {
  const style = FRAMEWORK_STYLES[preset];

  return (
    <div className="flex items-stretch gap-0 overflow-x-auto py-2">
      {boxes.map((box, i) => (
        <div key={box.label} className="flex items-stretch">
          {/* Box */}
          <div
            className={[
              "flex flex-col items-center justify-center rounded-md border px-4 py-3 min-w-[100px] max-w-[140px] transition-all duration-300",
              box.active
                ? `${style.activeBg} ${style.activeBorder} ${style.activeText}`
                : "bg-surface border-border text-muted opacity-40",
            ].join(" ")}
          >
            <span className="text-[0.75rem] font-bold text-center leading-tight">
              {box.label}
            </span>
            {box.description && box.active && (
              <span className="mt-1 text-[0.5625rem] text-center leading-snug opacity-80">
                {box.description}
              </span>
            )}
          </div>

          {/* Arrow */}
          {i < boxes.length - 1 && (
            <div className="flex items-center px-1.5">
              <span
                className={[
                  "text-lg transition-colors duration-300",
                  box.active && boxes[i + 1]?.active
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

interface BuildPipelineComparedProps {
  preset?: string;
}

export function BuildPipelineCompared({ preset = "react" }: BuildPipelineComparedProps) {
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
      <PipelineDiagram boxes={step.boxes} preset={key} />

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
