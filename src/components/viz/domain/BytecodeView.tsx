"use client";

import { useState, useCallback } from "react";
import { StepPlayer } from "../primitives/StepPlayer";
import { AnimatedBox } from "../primitives/AnimatedBox";

interface BytecodeInstruction {
  offset: string;
  opcode: string;
  operand?: string;
  description: string;
  astNode?: string;
}

interface BytecodeStep {
  highlighted: number;
  registers: Record<string, string>;
  accumulator?: string;
  description: string;
}

const presets: Record<
  string,
  {
    code: string;
    instructions: BytecodeInstruction[];
    steps: BytecodeStep[];
  }
> = {
  "let-hello": {
    code: 'let message = "hello";',
    instructions: [
      { offset: "0x00", opcode: "LdaConstant", operand: '"hello"', description: "상수 풀에서 문자열 \"hello\"를 꺼내 누산기 (accumulator) 에 로드합니다.", astNode: "Literal" },
      { offset: "0x02", opcode: "Star0", description: "누산기의 값을 레지스터 r0에 저장합니다. r0이 변수 message에 대응됩니다.", astNode: "VariableDeclarator" },
      { offset: "0x03", opcode: "LdaUndefined", description: "누산기에 undefined를 로드합니다. 이 문은 값을 반환하지 않으므로 undefined가 됩니다." },
      { offset: "0x04", opcode: "Return", description: "현재 함수의 실행을 종료하고 누산기의 값 (undefined) 을 반환합니다." },
    ],
    steps: [
      { highlighted: 0, registers: {}, accumulator: "undefined", description: "실행 시작. 누산기와 레지스터가 초기화됩니다." },
      { highlighted: 0, registers: {}, accumulator: '"hello"', description: "LdaConstant — 상수 풀에서 \"hello\"를 꺼내 누산기에 넣었습니다." },
      { highlighted: 1, registers: { r0: '"hello"' }, accumulator: '"hello"', description: "Star0 — 누산기의 값을 r0에 복사했습니다. 이제 r0 = message = \"hello\"." },
      { highlighted: 2, registers: { r0: '"hello"' }, accumulator: "undefined", description: "LdaUndefined — 누산기를 undefined로 초기화합니다." },
      { highlighted: 3, registers: { r0: '"hello"' }, accumulator: "undefined", description: "Return — undefined를 반환하며 실행을 종료합니다." },
    ],
  },
  "add-function": {
    code: "function add(a, b) { return a + b; }",
    instructions: [
      { offset: "0x00", opcode: "Ldar", operand: "a1", description: "레지스터 a1 (매개변수 b) 의 값을 누산기에 로드합니다.", astNode: "Identifier (b)" },
      { offset: "0x02", opcode: "Add", operand: "a0", description: "레지스터 a0 (매개변수 a) 의 값과 누산기의 값을 더합니다. 결과는 누산기에 저장됩니다.", astNode: "BinaryExpression" },
      { offset: "0x04", opcode: "Return", description: "누산기의 값 (a + b의 결과) 을 반환합니다.", astNode: "ReturnStatement" },
    ],
    steps: [
      { highlighted: 0, registers: { a0: "3", a1: "5" }, accumulator: "undefined", description: "add(3, 5)를 호출했다고 가정합니다. a0=3, a1=5." },
      { highlighted: 0, registers: { a0: "3", a1: "5" }, accumulator: "5", description: "Ldar a1 — 매개변수 b의 값 5를 누산기에 로드했습니다." },
      { highlighted: 1, registers: { a0: "3", a1: "5" }, accumulator: "8", description: "Add a0 — a0 (3) + 누산기 (5) = 8. 결과가 누산기에 저장됩니다." },
      { highlighted: 2, registers: { a0: "3", a1: "5" }, accumulator: "8", description: "Return — 누산기의 값 8을 반환합니다." },
    ],
  },
};

interface BytecodeViewProps {
  preset?: string;
}

export function BytecodeView({ preset = "let-hello" }: BytecodeViewProps) {
  const data = presets[preset] ?? presets["let-hello"];
  const [currentStep, setCurrentStep] = useState(0);

  const handleStepChange = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const step = data.steps[currentStep];

  return (
    <StepPlayer totalSteps={data.steps.length} onStepChange={handleStepChange}>
      <div className="space-y-4">
        {/* Source */}
        <div>
          <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
            소스 코드
          </span>
          <div className="rounded-sm bg-surface p-3 font-mono text-[0.8125rem]">
            {data.code}
          </div>
        </div>

        {/* Instructions */}
        <div>
          <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
            바이트코드
          </span>
          <div className="space-y-0.5">
            {data.instructions.map((inst, i) => (
              <div
                key={i}
                className={`flex items-baseline gap-3 rounded-sm px-3 py-1.5 font-mono text-[0.75rem] transition-colors ${
                  i === step.highlighted
                    ? "bg-amber-50 dark:bg-amber-950/40"
                    : ""
                }`}
              >
                <span className="w-10 shrink-0 text-muted/40">
                  {inst.offset}
                </span>
                <span
                  className={`font-semibold ${
                    i === step.highlighted
                      ? "text-amber-900 dark:text-amber-100"
                      : "text-text"
                  }`}
                >
                  {inst.opcode}
                </span>
                {inst.operand && (
                  <span className="text-muted">
                    {inst.operand}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Registers & Accumulator */}
        <div className="flex gap-4">
          <div className="flex-1">
            <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
              레지스터
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(step.registers).length > 0 ? (
                Object.entries(step.registers).map(([reg, val]) => (
                  <AnimatedBox key={reg} preset="fadeIn">
                    <span className="inline-flex items-baseline gap-1 border border-sky-400/50 bg-sky-50 px-2 py-0.5 font-mono text-[0.6875rem] text-sky-900 dark:border-sky-600/40 dark:bg-sky-950/40 dark:text-sky-100">
                      <span className="opacity-50">{reg}</span>
                      <span>{val}</span>
                    </span>
                  </AnimatedBox>
                ))
              ) : (
                <span className="text-[0.6875rem] text-muted/30">
                  —
                </span>
              )}
            </div>
          </div>
          <div>
            <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
              누산기
            </span>
            <span
              className={`inline-block border px-2 py-0.5 font-mono text-[0.6875rem] ${
                step.accumulator !== "undefined"
                  ? "border-amber-400/50 bg-amber-50 text-amber-900 dark:border-amber-600/40 dark:bg-amber-950/40 dark:text-amber-100"
                  : "border-stone-400/50 bg-stone-100 text-stone-600 dark:border-stone-600/40 dark:bg-stone-900/40 dark:text-stone-300"
              }`}
            >
              {step.accumulator}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted min-h-[3.5rem]">
          {step.description}
        </div>
      </div>
    </StepPlayer>
  );
}
