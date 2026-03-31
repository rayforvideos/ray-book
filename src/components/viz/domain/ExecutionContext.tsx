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
  phase: "creation" | "execution" | "popped";
  variables: Variable[];
  thisBinding?: string;
}

interface ECStep {
  code: string;
  highlight?: string;
  stack: Context[];
  description: string;
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

const presets: Record<string, ECStep[]> = {
  "basic-callstack": [
    {
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
      code: `var x = 10;  // ← 실행`,
      highlight: "var x = 10;",
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
        "실행 단계에 진입합니다. var x = 10이 실행되어 x에 10이 할당됩니다. foo는 이미 함수 객체로 초기화되어 있습니다.",
    },
    {
      code: `foo();  // ← 호출`,
      highlight: "foo();",
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
      code: `var y = 20;  // ← foo 내부 실행`,
      highlight: "var y = 20;",
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
      description: "foo의 실행 단계. y에 20이 할당됩니다.",
    },
    {
      code: `bar();  // ← foo 내부에서 bar 호출`,
      highlight: "return bar();",
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
        "bar()가 호출되면 또 새 실행 컨텍스트가 콜스택에 push됩니다. 이제 스택에 3개의 컨텍스트가 쌓여 있습니다.",
    },
    {
      code: `return x + y + z;  // ← bar 내부 실행`,
      highlight: "return x + y + z;",
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
        "z에 30이 할당되고 return 문이 실행됩니다. x는 bar에 없으므로 스코프 체인을 따라 올라가 Global에서 찾고, y는 foo에서 찾습니다. 결과: 10 + 20 + 30 = 60.",
    },
    {
      code: `// bar() 반환 → pop`,
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
        "bar()가 60을 반환하고 콜스택에서 pop됩니다. 제어권이 foo()로 돌아갑니다.",
    },
    {
      code: `// foo() 반환 → pop`,
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
};

interface ExecutionContextProps {
  preset?: string;
}

export function ExecutionContext({
  preset = "basic-callstack",
}: ExecutionContextProps) {
  const steps = presets[preset] ?? presets["basic-callstack"];
  const [currentStep, setCurrentStep] = useState(0);

  const handleStepChange = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const step = steps[currentStep];

  return (
    <StepPlayer totalSteps={steps.length} onStepChange={handleStepChange}>
      <div className="space-y-4">
        {/* Code */}
        <div>
          <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
            코드
          </span>
          <div className="rounded-sm bg-surface p-3 font-mono text-[0.8125rem] whitespace-pre-wrap">
            {step.code}
          </div>
        </div>

        {/* Call Stack */}
        <div>
          <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
            콜 스택
          </span>
          <div className="flex flex-col-reverse gap-1.5">
            {step.stack.map((ctx, i) => {
              const style = typeStyles[ctx.type];
              const isTop = i === step.stack.length - 1;
              return (
                <div
                  key={`${ctx.name}-${i}`}
                  className={`border p-3 transition-all ${style.border} ${style.bg} ${
                    isTop ? "ring-1 ring-accent/30" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 text-[0.5625rem] font-bold uppercase ${style.label}`}
                    >
                      {ctx.type}
                    </span>
                    <span className="font-mono text-[0.75rem] font-semibold text-text">
                      {ctx.name}
                    </span>
                    <span className="text-[0.5625rem] text-muted">
                      {ctx.phase === "creation" ? "생성 단계" : "실행 단계"}
                    </span>
                  </div>

                  {/* Variables */}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    {ctx.variables.map((v) => (
                      <span
                        key={v.name}
                        className="font-mono text-[0.6875rem]"
                      >
                        <span className="text-muted">{v.name}: </span>
                        <span
                          className={
                            v.value === "undefined"
                              ? "text-muted/50"
                              : "text-text"
                          }
                        >
                          {v.value}
                        </span>
                      </span>
                    ))}
                    {ctx.thisBinding && (
                      <span className="font-mono text-[0.6875rem]">
                        <span className="text-amber-700 dark:text-amber-300">
                          this
                        </span>
                        <span className="text-muted">: {ctx.thisBinding}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <span className="block border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
          {step.description}
        </span>
      </div>
    </StepPlayer>
  );
}
