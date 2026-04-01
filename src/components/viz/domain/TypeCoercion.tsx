"use client";

import { StepPlayer } from "../primitives/StepPlayer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ConversionStep {
  input: string;
  inputType: string;
  operation: string;
  result: string;
  resultType: string;
  activeLines: number[];
  description: string;
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const typeColors: Record<string, { badge: string }> = {
  string: {
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-300",
  },
  number: {
    badge:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/70 dark:text-blue-300",
  },
  boolean: {
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/70 dark:text-amber-300",
  },
  undefined: {
    badge:
      "bg-stone-100 text-stone-600 dark:bg-stone-800/70 dark:text-stone-300",
  },
  null: {
    badge:
      "bg-stone-100 text-stone-600 dark:bg-stone-800/70 dark:text-stone-300",
  },
  object: {
    badge:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/70 dark:text-purple-300",
  },
  NaN: {
    badge: "bg-red-100 text-red-700 dark:bg-red-900/70 dark:text-red-300",
  },
};

function getTypeColor(type: string) {
  return typeColors[type] ?? typeColors["string"];
}

/* ------------------------------------------------------------------ */
/*  Presets                                                            */
/* ------------------------------------------------------------------ */

const presets: Record<string, { code: string; steps: ConversionStep[] }> = {
  /* ---- ToNumber --------------------------------------------------- */
  "to-number": {
    code: [
      `Number("42")        // 42`,
      `Number("")          // 0`,
      `Number("hello")     // NaN`,
      `Number(true)        // 1`,
      `Number(false)       // 0`,
      `Number(null)        // 0`,
      `Number(undefined)   // NaN`,
      `Number([])          // 0  (ToPrimitive → "")`,
      `Number({})          // NaN (ToPrimitive → "[object Object]")`,
    ].join("\n"),

    steps: [
      {
        input: '"42"',
        inputType: "string",
        operation: "ToNumber",
        result: "42",
        resultType: "number",
        activeLines: [0],
        description:
          "숫자로 파싱할 수 있는 문자열은 그대로 숫자로 변환됩니다. " +
          "앞뒤 공백은 무시됩니다.",
      },
      {
        input: '""',
        inputType: "string",
        operation: "ToNumber",
        result: "0",
        resultType: "number",
        activeLines: [1],
        description:
          "빈 문자열은 0으로 변환됩니다. " +
          "이것은 많은 == 비교의 혼란을 일으키는 원인 중 하나입니다.",
      },
      {
        input: '"hello"',
        inputType: "string",
        operation: "ToNumber",
        result: "NaN",
        resultType: "NaN",
        activeLines: [2],
        description:
          "숫자로 파싱할 수 없는 문자열은 NaN이 됩니다. " +
          "NaN은 Not-a-Number의 약자이지만 타입은 여전히 number입니다.",
      },
      {
        input: "true",
        inputType: "boolean",
        operation: "ToNumber",
        result: "1",
        resultType: "number",
        activeLines: [3],
        description:
          "true는 1로, false는 0으로 변환됩니다. " +
          "이 규칙은 산술 연산에서 boolean이 사용될 때 적용됩니다.",
      },
      {
        input: "null",
        inputType: "null",
        operation: "ToNumber",
        result: "0",
        resultType: "number",
        activeLines: [5],
        description:
          "null은 0으로 변환됩니다. " +
          "반면 undefined는 NaN이 됩니다. 이 차이가 직관적이지 않아 버그의 원인이 됩니다.",
      },
      {
        input: "undefined",
        inputType: "undefined",
        operation: "ToNumber",
        result: "NaN",
        resultType: "NaN",
        activeLines: [6],
        description:
          "undefined는 NaN으로 변환됩니다. " +
          "null이 0인 것과 비교하면 일관성이 없어 보이지만, " +
          "이것이 JavaScript 명세의 규칙입니다.",
      },
      {
        input: "[]",
        inputType: "object",
        operation: "ToPrimitive → ToNumber",
        result: "0",
        resultType: "number",
        activeLines: [7],
        description:
          "객체는 먼저 ToPrimitive로 원시값을 구한 뒤 ToNumber를 적용합니다. " +
          '빈 배열은 ""(빈 문자열)이 되고, ""는 0입니다.',
      },
      {
        input: "{}",
        inputType: "object",
        operation: "ToPrimitive → ToNumber",
        result: "NaN",
        resultType: "NaN",
        activeLines: [8],
        description:
          '일반 객체의 ToPrimitive는 "[object Object]"를 반환합니다. ' +
          "이 문자열은 숫자로 파싱할 수 없으므로 NaN이 됩니다.",
      },
    ],
  },

  /* ---- ToString --------------------------------------------------- */
  "to-string": {
    code: [
      `String(42)          // "42"`,
      `String(0)           // "0"`,
      `String(-0)          // "0"  (주의!)`,
      `String(NaN)         // "NaN"`,
      `String(true)        // "true"`,
      `String(false)       // "false"`,
      `String(null)        // "null"`,
      `String(undefined)   // "undefined"`,
      `String([1, 2, 3])   // "1,2,3"`,
      `String({})          // "[object Object]"`,
    ].join("\n"),

    steps: [
      {
        input: "42",
        inputType: "number",
        operation: "ToString",
        result: '"42"',
        resultType: "string",
        activeLines: [0],
        description:
          "숫자는 그대로 문자열로 변환됩니다. " +
          "양수, 음수, 소수 모두 직관적으로 변환됩니다.",
      },
      {
        input: "-0",
        inputType: "number",
        operation: "ToString",
        result: '"0"',
        resultType: "string",
        activeLines: [2],
        description:
          '-0은 "0"으로 변환됩니다. 부호가 사라집니다! ' +
          "이것은 JavaScript의 잘 알려진 함정 중 하나입니다. " +
          "String(-0) === String(0)이 true입니다.",
      },
      {
        input: "NaN",
        inputType: "NaN",
        operation: "ToString",
        result: '"NaN"',
        resultType: "string",
        activeLines: [3],
        description:
          'NaN은 문자열 "NaN"이 됩니다. ' +
          "디버깅 시 콘솔에서 자주 보게 되는 값입니다.",
      },
      {
        input: "true",
        inputType: "boolean",
        operation: "ToString",
        result: '"true"',
        resultType: "string",
        activeLines: [4],
        description:
          'boolean은 "true" 또는 "false" 문자열이 됩니다. ' +
          "템플릿 리터럴에서 자동으로 적용되는 변환입니다.",
      },
      {
        input: "null",
        inputType: "null",
        operation: "ToString",
        result: '"null"',
        resultType: "string",
        activeLines: [6],
        description:
          'null은 "null" 문자열이 됩니다. ' +
          "undefined도 마찬가지로 \"undefined\"가 됩니다.",
      },
      {
        input: "[1, 2, 3]",
        inputType: "object",
        operation: "ToPrimitive → ToString",
        result: '"1,2,3"',
        resultType: "string",
        activeLines: [8],
        description:
          "배열의 toString()은 각 요소를 쉼표로 이어붙입니다. " +
          "Array.prototype.join()과 같은 결과입니다.",
      },
      {
        input: "{}",
        inputType: "object",
        operation: "ToPrimitive → ToString",
        result: '"[object Object]"',
        resultType: "string",
        activeLines: [9],
        description:
          "일반 객체의 toString()은 \"[object Object]\"를 반환합니다. " +
          "디버깅할 때 이 문자열이 보이면 의도치 않은 형변환을 의심하세요.",
      },
    ],
  },

  /* ---- ToBoolean -------------------------------------------------- */
  "to-boolean": {
    code: [
      `// Falsy values — 이 값들만 false가 됩니다`,
      `Boolean(false)       // false`,
      `Boolean(0)           // false`,
      `Boolean(-0)          // false`,
      `Boolean(0n)          // false`,
      `Boolean("")          // false`,
      `Boolean(null)        // false`,
      `Boolean(undefined)   // false`,
      `Boolean(NaN)         // false`,
      ``,
      `// 나머지는 모두 truthy`,
      `Boolean("0")         // true  (문자열 "0"은 truthy!)`,
      `Boolean([])          // true  (빈 배열도 truthy!)`,
      `Boolean({})          // true  (빈 객체도 truthy!)`,
    ].join("\n"),

    steps: [
      {
        input: "false",
        inputType: "boolean",
        operation: "ToBoolean",
        result: "false",
        resultType: "boolean",
        activeLines: [1],
        description:
          "false는 당연히 false입니다. JavaScript에는 정확히 8개의 falsy 값이 있습니다.",
      },
      {
        input: "0, -0, 0n",
        inputType: "number",
        operation: "ToBoolean",
        result: "false",
        resultType: "boolean",
        activeLines: [2, 3, 4],
        description:
          "숫자 0, -0, BigInt 0n은 모두 falsy입니다. " +
          "다른 모든 숫자 (음수 포함) 는 truthy입니다.",
      },
      {
        input: '""',
        inputType: "string",
        operation: "ToBoolean",
        result: "false",
        resultType: "boolean",
        activeLines: [5],
        description:
          "빈 문자열만 falsy입니다. " +
          '"0", " " (공백), "false" 등은 모두 truthy입니다.',
      },
      {
        input: "null, undefined",
        inputType: "null",
        operation: "ToBoolean",
        result: "false",
        resultType: "boolean",
        activeLines: [6, 7],
        description:
          "null과 undefined는 falsy입니다. " +
          '이 때문에 if (value) 체크로 "값이 있는지" 대략적으로 확인할 수 있습니다.',
      },
      {
        input: "NaN",
        inputType: "NaN",
        operation: "ToBoolean",
        result: "false",
        resultType: "boolean",
        activeLines: [8],
        description:
          "NaN은 falsy입니다. " +
          "숫자 연산이 실패했을 때 if 체크에서 자연스럽게 걸러집니다.",
      },
      {
        input: '"0", [], {}',
        inputType: "object",
        operation: "ToBoolean",
        result: "true",
        resultType: "boolean",
        activeLines: [11, 12, 13],
        description:
          '문자열 "0", 빈 배열, 빈 객체는 모두 truthy입니다. ' +
          "다른 언어에서 온 개발자가 자주 실수하는 부분입니다. " +
          "객체는 항상 truthy — 예외 없음.",
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function CodePanel({
  lines,
  activeLines,
}: {
  lines: string[];
  activeLines: number[];
}) {
  return (
    <div className="flex-1 min-w-0">
      <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
        코드
      </span>
      <div className="rounded-sm bg-surface font-mono text-[0.6875rem] leading-relaxed overflow-x-auto">
        {lines.map((line, i) => {
          const isActive = activeLines.includes(i);
          return (
            <div
              key={i}
              className={`flex transition-colors duration-150 ${isActive ? "bg-accent/10" : ""}`}
            >
              <span
                className={`select-none w-8 shrink-0 text-right pr-3 ${isActive ? "text-accent" : "text-muted"}`}
              >
                {i + 1}
              </span>
              <span
                className={`flex-1 pr-3 py-px whitespace-pre ${isActive ? "text-text" : "text-muted"}`}
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
  );
}

function TypeBadge({ type }: { type: string }) {
  const color = getTypeColor(type);
  return (
    <span
      className={`inline-block rounded-sm px-1.5 py-0.5 text-[0.5rem] font-mono font-semibold ${color.badge}`}
    >
      {type}
    </span>
  );
}

function ConversionPanel({ step }: { step: ConversionStep }) {
  return (
    <div className="w-56 shrink-0 max-sm:w-full">
      <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
        변환
      </span>
      <div className="space-y-2">
        {/* Input */}
        <div className="border border-border p-2 bg-surface">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[0.6875rem] font-mono text-text">
              {step.input}
            </span>
            <TypeBadge type={step.inputType} />
          </div>
        </div>

        {/* Arrow + Operation */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-muted text-[0.75rem]">↓</span>
          <span className="text-[0.625rem] font-mono text-accent font-semibold">
            {step.operation}
          </span>
          <span className="text-muted text-[0.75rem]">↓</span>
        </div>

        {/* Result */}
        <div className="border border-border p-2 bg-surface">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[0.6875rem] font-mono text-text font-semibold">
              {step.result}
            </span>
            <TypeBadge type={step.resultType} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface TypeCoercionProps {
  preset?: string;
}

export function TypeCoercion({ preset = "to-number" }: TypeCoercionProps) {
  const data = presets[preset] ?? presets["to-number"];
  const lines = data.code.split("\n");

  const stepNodes = data.steps.map((step, idx) => (
    <div key={idx}>
      <div className="flex gap-4 max-sm:flex-col">
        <CodePanel lines={lines} activeLines={step.activeLines} />
        <ConversionPanel step={step} />
      </div>

      <span className="mt-4 block border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </span>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
