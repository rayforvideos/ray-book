"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

interface PipelineStep {
  stage: "source" | "bytecode" | "profile" | "optimize" | "machine" | "deopt";
  description: string;
  detail?: string;
}

const stageConfig = {
  source: {
    label: "소스 코드",
    icon: "{ }",
    bg: "bg-stone-100 dark:bg-stone-800/40",
    text: "text-stone-800 dark:text-stone-200",
    active: "ring-2 ring-stone-400 dark:ring-stone-500",
  },
  bytecode: {
    label: "바이트코드",
    icon: "B",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-950 dark:text-violet-100",
    active: "ring-2 ring-violet-400 dark:ring-violet-500",
  },
  profile: {
    label: "프로파일링",
    icon: "⚡",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-950 dark:text-amber-100",
    active: "ring-2 ring-amber-400 dark:ring-amber-500",
  },
  optimize: {
    label: "최적화 컴파일",
    icon: "⚙",
    bg: "bg-sky-50 dark:bg-sky-950/40",
    text: "text-sky-950 dark:text-sky-100",
    active: "ring-2 ring-sky-400 dark:ring-sky-500",
  },
  machine: {
    label: "기계어",
    icon: "01",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-950 dark:text-emerald-100",
    active: "ring-2 ring-emerald-400 dark:ring-emerald-500",
  },
  deopt: {
    label: "역최적화",
    icon: "↩",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-950 dark:text-rose-100",
    active: "ring-2 ring-rose-400 dark:ring-rose-500",
  },
};

const stages: (keyof typeof stageConfig)[] = [
  "source",
  "bytecode",
  "profile",
  "optimize",
  "machine",
  "deopt",
];

const presets: Record<string, PipelineStep[]> = {
  "hot-function": [
    {
      stage: "source",
      description: "add(a, b) 함수가 소스 코드로 존재합니다.",
      detail: "파싱되어 AST로 변환된 상태",
    },
    {
      stage: "bytecode",
      description: "Ignition이 AST를 바이트코드로 컴파일합니다.",
      detail: "Ldar a1 → Add a0 → Return",
    },
    {
      stage: "profile",
      description: "함수가 반복 호출되며 Ignition이 타입 피드백을 수집합니다.",
      detail: "a, b가 항상 숫자 (Smi) 로 호출됨 → 'hot' 으로 표시",
    },
    {
      stage: "optimize",
      description: "TurboFan이 타입 피드백을 기반으로 최적화된 기계어를 생성합니다.",
      detail: "타입 체크 생략, 정수 덧셈으로 특화",
    },
    {
      stage: "machine",
      description: "최적화된 기계어가 실행됩니다. 바이트코드 대비 10~100배 빠릅니다.",
      detail: "단일 CPU 명령어 (ADD) 로 실행",
    },
    {
      stage: "deopt",
      description: "add(\"hello\", \"world\") 호출 — 타입 가정이 깨집니다.",
      detail: "기계어를 폐기하고 바이트코드로 되돌아갑니다 (역최적화)",
    },
  ],
};

interface JITPipelineProps {
  preset?: string;
}

export function JITPipeline({ preset = "hot-function" }: JITPipelineProps) {
  const data = presets[preset] ?? presets["hot-function"];

  const stepNodes = data.map((current, idx) => {
    const activeIndex = stages.indexOf(current.stage);
    return (
      <div key={idx} className="space-y-4">
        <div className="overflow-x-auto -mx-1 px-1">
          <div className="flex items-center gap-1" style={{ minWidth: "fit-content" }}>
            {stages.map((stage, i) => {
              const config = stageConfig[stage];
              const isActive = i === activeIndex;
              const isPast = i < activeIndex;
              const isDeopt = current.stage === "deopt" && stage === "deopt";
              return (
                <div key={stage} className="flex items-center gap-1">
                  <div
                    className={`flex flex-col items-center gap-0.5 rounded-sm px-1.5 py-1.5 transition-all ${config.bg} ${
                      isActive || isDeopt ? config.active : ""
                    } ${!isActive && !isPast && !isDeopt ? "opacity-30" : ""}`}
                    style={{ minWidth: "3.2rem" }}
                  >
                    <span className={`font-mono text-[0.6875rem] font-bold ${config.text}`}>{config.icon}</span>
                    <span className={`text-[0.5rem] leading-tight text-center ${config.text}`}>{config.label}</span>
                  </div>
                  {i < stages.length - 1 && (
                    <span className={`text-[0.5rem] ${isPast || isActive ? "text-muted" : "text-muted/20"}`}>→</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="border-t border-border pt-3">
          <p className="text-[0.8125rem] leading-relaxed text-muted">{current.description}</p>
          {current.detail && <p className="mt-1.5 font-mono text-[0.75rem] text-muted/70">{current.detail}</p>}
        </div>
      </div>
    );
  });

  return <StepPlayer steps={stepNodes} />;
}
