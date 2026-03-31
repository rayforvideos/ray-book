"use client";

import { useState, useCallback } from "react";
import { StepPlayer } from "../primitives/StepPlayer";

interface Variable {
  name: string;
  value: string;
}

interface Context {
  name: string;
  type: "global" | "function" | "eval";
  phase: "creation" | "execution";
  variables: Variable[];
  thisBinding?: string;
}

interface ECStep {
  activeLine: number | null;
  stack: Context[];
  description: string;
}

interface PresetData {
  code: string;
  steps: ECStep[];
}

const typeStyles = {
  global: {
    border: "border-stone-400/50 dark:border-stone-500/40",
    bg: "bg-stone-50 dark:bg-stone-900/40",
    label: "bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200",
  },
  function: {
    border: "border-sky-400/50 dark:border-sky-500/40",
    bg: "bg-sky-50 dark:bg-sky-950/40",
    label: "bg-sky-200 text-sky-800 dark:bg-sky-800 dark:text-sky-100",
  },
  eval: {
    border: "border-amber-400/50 dark:border-amber-500/40",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    label: "bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-100",
  },
};

const presets: Record<string, PresetData> = {
  "basic-callstack": {
    code: `var x = 10;
function foo() {
  var y = 20;
  function bar() {
    var z = 30;
    return x + y + z;
  }
  return bar();
}
foo();`,
    steps: [
      {
        activeLine: null,
        stack: [
          {
            name: "Global",
            type: "global",
            phase: "creation",
            variables: [
              { name: "x", value: "undefined" },
              { name: "foo", value: "function" },
            ],
            thisBinding: "window",
          },
        ],
        description:
          "스크립트가 시작되면 전역 실행 컨텍스트가 생성됩니다. 생성 단계에서 var 변수는 undefined로, 함수 선언은 함수 객체로 초기화됩니다.",
      },
      {
        activeLine: 0,
        stack: [
          {
            name: "Global",
            type: "global",
            phase: "execution",
            variables: [
              { name: "x", value: "10" },
              { name: "foo", value: "function" },
            ],
            thisBinding: "window",
          },
        ],
        description:
          "실행 단계에 진입합니다. var x = 10이 실행되어 x에 10이 할당됩니다.",
      },
      {
        activeLine: 9,
        stack: [
          {
            name: "Global",
            type: "global",
            phase: "execution",
            variables: [
              { name: "x", value: "10" },
              { name: "foo", value: "function" },
            ],
            thisBinding: "window",
          },
          {
            name: "foo()",
            type: "function",
            phase: "creation",
            variables: [
              { name: "y", value: "undefined" },
              { name: "bar", value: "function" },
            ],
            thisBinding: "window",
          },
        ],
        description:
          "foo()가 호출되면 새 실행 컨텍스트가 생성되어 콜스택에 push됩니다. 생성 단계에서 y는 undefined, bar는 함수 객체로 초기화됩니다.",
      },
      {
        activeLine: 2,
        stack: [
          {
            name: "Global",
            type: "global",
            phase: "execution",
            variables: [
              { name: "x", value: "10" },
              { name: "foo", value: "function" },
            ],
            thisBinding: "window",
          },
          {
            name: "foo()",
            type: "function",
            phase: "execution",
            variables: [
              { name: "y", value: "20" },
              { name: "bar", value: "function" },
            ],
            thisBinding: "window",
          },
        ],
        description: "foo의 실행 단계. var y = 20이 실행되어 y에 20이 할당됩니다.",
      },
      {
        activeLine: 7,
        stack: [
          {
            name: "Global",
            type: "global",
            phase: "execution",
            variables: [
              { name: "x", value: "10" },
              { name: "foo", value: "function" },
            ],
            thisBinding: "window",
          },
          {
            name: "foo()",
            type: "function",
            phase: "execution",
            variables: [
              { name: "y", value: "20" },
              { name: "bar", value: "function" },
            ],
            thisBinding: "window",
          },
          {
            name: "bar()",
            type: "function",
            phase: "creation",
            variables: [{ name: "z", value: "undefined" }],
            thisBinding: "window",
          },
        ],
        description:
          "return bar()에서 bar()가 호출됩니다. 새 실행 컨텍스트가 콜스택에 push. 이제 스택에 3개의 컨텍스트가 쌓여 있습니다.",
      },
      {
        activeLine: 4,
        stack: [
          {
            name: "Global",
            type: "global",
            phase: "execution",
            variables: [
              { name: "x", value: "10" },
              { name: "foo", value: "function" },
            ],
            thisBinding: "window",
          },
          {
            name: "foo()",
            type: "function",
            phase: "execution",
            variables: [
              { name: "y", value: "20" },
              { name: "bar", value: "function" },
            ],
            thisBinding: "window",
          },
          {
            name: "bar()",
            type: "function",
            phase: "execution",
            variables: [{ name: "z", value: "30" }],
            thisBinding: "window",
          },
        ],
        description: "bar의 실행 단계. var z = 30이 실행됩니다.",
      },
      {
        activeLine: 5,
        stack: [
          {
            name: "Global",
            type: "global",
            phase: "execution",
            variables: [
              { name: "x", value: "10" },
              { name: "foo", value: "function" },
            ],
            thisBinding: "window",
          },
          {
            name: "foo()",
            type: "function",
            phase: "execution",
            variables: [
              { name: "y", value: "20" },
              { name: "bar", value: "function" },
            ],
            thisBinding: "window",
          },
          {
            name: "bar()",
            type: "function",
            phase: "execution",
            variables: [{ name: "z", value: "30" }],
            thisBinding: "window",
          },
        ],
        description:
          "return x + y + z 실행. z는 bar에서, y는 스코프 체인을 따라 foo에서, x는 Global에서 찾습니다. 결과: 60.",
      },
      {
        activeLine: 7,
        stack: [
          {
            name: "Global",
            type: "global",
            phase: "execution",
            variables: [
              { name: "x", value: "10" },
              { name: "foo", value: "function" },
            ],
            thisBinding: "window",
          },
          {
            name: "foo()",
            type: "function",
            phase: "execution",
            variables: [
              { name: "y", value: "20" },
              { name: "bar", value: "function" },
            ],
            thisBinding: "window",
          },
        ],
        description:
          "bar()가 60을 반환하고 콜스택에서 pop됩니다. 제어권이 foo()의 return bar() 지점으로 돌아갑니다.",
      },
      {
        activeLine: 9,
        stack: [
          {
            name: "Global",
            type: "global",
            phase: "execution",
            variables: [
              { name: "x", value: "10" },
              { name: "foo", value: "function" },
            ],
            thisBinding: "window",
          },
        ],
        description:
          "foo()도 60을 반환하고 pop됩니다. 전역 컨텍스트만 남습니다. 전역 컨텍스트는 페이지가 닫힐 때까지 유지됩니다.",
      },
    ],
  },
};

interface ExecutionContextProps {
  preset?: string;
}

export function ExecutionContext({
  preset = "basic-callstack",
}: ExecutionContextProps) {
  const data = presets[preset] ?? presets["basic-callstack"];
  const lines = data.code.split("\n");
  const [currentStep, setCurrentStep] = useState(0);

  const handleStepChange = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const step = data.steps[currentStep];

  // Fixed height based on max stack depth across all steps
  const maxStackDepth = Math.max(...data.steps.map((s) => s.stack.length));

  return (
    <StepPlayer totalSteps={data.steps.length} onStepChange={handleStepChange}>
      <div className="flex gap-4 max-sm:flex-col">
        {/* Code panel */}
        <div className="flex-1 min-w-0">
          <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
            코드
          </span>
          <div className="rounded-sm bg-surface font-mono text-[0.75rem] leading-relaxed overflow-x-auto">
            {lines.map((line, i) => {
              const isActive = step.activeLine === i;
              return (
                <div
                  key={i}
                  className={`flex transition-colors duration-150 ${
                    isActive
                      ? "bg-accent/10"
                      : ""
                  }`}
                >
                  <span
                    className={`select-none w-8 shrink-0 text-right pr-3 ${
                      isActive ? "text-accent" : "text-muted/30"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={`flex-1 pr-3 py-px ${
                      isActive
                        ? "text-text"
                        : step.activeLine === null
                          ? "text-muted/60"
                          : "text-muted/40"
                    }`}
                  >
                    {line || "\u00A0"}
                  </span>
                  {isActive && (
                    <span className="shrink-0 pr-2 text-accent text-[0.625rem] pt-px">
                      ◄
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Call Stack panel */}
        <div className="w-56 shrink-0 max-sm:w-full">
          <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
            콜 스택
          </span>
          <div
            className="flex flex-col-reverse justify-end gap-1"
            style={{ minHeight: `${maxStackDepth * 5.5}rem` }}
          >
            {step.stack.map((ctx, i) => {
              const style = typeStyles[ctx.type];
              const isTop = i === step.stack.length - 1;
              return (
                <div
                  key={`${ctx.name}-${i}`}
                  className={`border p-2 transition-all ${style.border} ${style.bg} ${
                    isTop ? "ring-1 ring-accent/30" : ""
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-1 py-px text-[0.5rem] font-bold uppercase ${style.label}`}
                    >
                      {ctx.type === "global" ? "G" : "F"}
                    </span>
                    <span className="font-mono text-[0.6875rem] font-semibold text-text truncate">
                      {ctx.name}
                    </span>
                  </div>
                  <span className="mt-0.5 block text-[0.5rem] text-muted">
                    {ctx.phase === "creation" ? "생성 단계" : "실행 단계"}
                  </span>

                  <div className="mt-1.5 space-y-px">
                    {ctx.variables.map((v) => (
                      <span
                        key={v.name}
                        className="flex items-baseline justify-between font-mono text-[0.625rem]"
                      >
                        <span className="text-muted">{v.name}</span>
                        <span
                          className={
                            v.value === "undefined"
                              ? "text-muted/40"
                              : v.value === "function"
                                ? "text-violet-700 dark:text-violet-300"
                                : "text-text"
                          }
                        >
                          {v.value}
                        </span>
                      </span>
                    ))}
                    {ctx.thisBinding && (
                      <span className="flex items-baseline justify-between font-mono text-[0.625rem]">
                        <span className="text-amber-700 dark:text-amber-300">this</span>
                        <span className="text-muted">{ctx.thisBinding}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Description */}
      <span className="mt-4 block border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted min-h-[3.5rem]">
        {step.description}
      </span>
    </StepPlayer>
  );
}
