"use client";

import { StepPlayer } from "../primitives/StepPlayer";

interface ClosureScope {
  name: string;
  type: "global" | "function" | "returned";
  variables: { name: string; value: string }[];
  closed?: boolean;
}

interface ClosureStep {
  codeLine: string;
  scopes: ClosureScope[];
  closureCapture?: { fn: string; captures: string[] };
  description: string;
}

const scopeStyles = {
  global: {
    border: "border-stone-400/50 dark:border-stone-500/40",
    bg: "bg-stone-50 dark:bg-stone-900/40",
    label: "text-stone-600 dark:text-stone-200",
  },
  function: {
    border: "border-sky-400/50 dark:border-sky-500/40",
    bg: "bg-sky-50 dark:bg-sky-950/40",
    label: "text-sky-800 dark:text-sky-100",
  },
  returned: {
    border: "border-emerald-400/50 dark:border-emerald-500/40",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    label: "text-emerald-800 dark:text-emerald-100",
  },
};

const presets: Record<string, { code: string; steps: ClosureStep[] }> = {
  "basic-closure": {
    code: `function makeCounter() {
  let count = 0;
  return function increment() {
    count++;
    return count;
  };
}
const counter = makeCounter();
counter(); // 1
counter(); // 2`,
    steps: [
      {
        codeLine: "makeCounter() 호출",
        scopes: [
          { name: "Global", type: "global", variables: [{ name: "makeCounter", value: "function" }] },
          { name: "makeCounter()", type: "function", variables: [{ name: "count", value: "0" }] },
        ],
        description: "makeCounter()가 호출되면 count = 0이 생성됩니다.",
      },
      {
        codeLine: "return function increment() {...}",
        scopes: [
          { name: "Global", type: "global", variables: [{ name: "makeCounter", value: "function" }, { name: "counter", value: "function" }] },
          { name: "makeCounter() 스코프", type: "function", variables: [{ name: "count", value: "0" }], closed: true },
        ],
        closureCapture: { fn: "increment", captures: ["count"] },
        description: "makeCounter()가 반환됩니다. 보통이라면 makeCounter의 스코프가 사라져야 하지만, 반환된 increment 함수가 count를 참조하고 있으므로 스코프가 유지됩니다. 이것이 클로저입니다.",
      },
      {
        codeLine: "counter() → 1",
        scopes: [
          { name: "Global", type: "global", variables: [{ name: "counter", value: "function" }] },
          { name: "makeCounter() 스코프", type: "function", variables: [{ name: "count", value: "1" }], closed: true },
          { name: "increment()", type: "returned", variables: [] },
        ],
        closureCapture: { fn: "increment", captures: ["count"] },
        description: "counter()를 호출하면 increment가 실행됩니다. 클로저를 통해 count에 접근하여 0 → 1로 증가시킵니다. count는 복사본이 아니라 원본 변수입니다.",
      },
      {
        codeLine: "counter() → 2",
        scopes: [
          { name: "Global", type: "global", variables: [{ name: "counter", value: "function" }] },
          { name: "makeCounter() 스코프", type: "function", variables: [{ name: "count", value: "2" }], closed: true },
          { name: "increment()", type: "returned", variables: [] },
        ],
        closureCapture: { fn: "increment", captures: ["count"] },
        description: "다시 호출하면 같은 count를 1 → 2로 증가시킵니다. 클로저가 유지하는 스코프는 호출 사이에 계속 살아있습니다. 이것이 클로저로 상태를 유지하는 방법입니다.",
      },
    ],
  },
  "independent-closures": {
    code: `function makeCounter() {
  let count = 0;
  return function() { return ++count; };
}
const a = makeCounter();
const b = makeCounter();
a(); // 1
a(); // 2
b(); // 1  ← a와 독립!`,
    steps: [
      {
        codeLine: "const a = makeCounter()",
        scopes: [
          { name: "Global", type: "global", variables: [{ name: "a", value: "function" }] },
          { name: "makeCounter() #1 스코프", type: "function", variables: [{ name: "count", value: "0" }], closed: true },
        ],
        closureCapture: { fn: "a", captures: ["count (#1)"] },
        description: "첫 번째 makeCounter() 호출로 a가 생성됩니다. a는 자신만의 count (#1) 를 클로저로 캡처합니다.",
      },
      {
        codeLine: "const b = makeCounter()",
        scopes: [
          { name: "Global", type: "global", variables: [{ name: "a", value: "function" }, { name: "b", value: "function" }] },
          { name: "makeCounter() #1 스코프", type: "function", variables: [{ name: "count", value: "0" }], closed: true },
          { name: "makeCounter() #2 스코프", type: "function", variables: [{ name: "count", value: "0" }], closed: true },
        ],
        closureCapture: { fn: "b", captures: ["count (#2)"] },
        description: "두 번째 makeCounter() 호출로 b가 생성됩니다. b는 완전히 별도의 count (#2) 를 캡처합니다. #1과 #2는 서로 다른 스코프입니다.",
      },
      {
        codeLine: "a() → 1, a() → 2",
        scopes: [
          { name: "Global", type: "global", variables: [{ name: "a", value: "function" }, { name: "b", value: "function" }] },
          { name: "makeCounter() #1 스코프", type: "function", variables: [{ name: "count", value: "2" }], closed: true },
          { name: "makeCounter() #2 스코프", type: "function", variables: [{ name: "count", value: "0" }], closed: true },
        ],
        description: "a()를 두 번 호출하면 #1의 count가 0 → 1 → 2로 증가합니다. #2의 count는 영향받지 않습니다.",
      },
      {
        codeLine: "b() → 1",
        scopes: [
          { name: "Global", type: "global", variables: [{ name: "a", value: "function" }, { name: "b", value: "function" }] },
          { name: "makeCounter() #1 스코프", type: "function", variables: [{ name: "count", value: "2" }], closed: true },
          { name: "makeCounter() #2 스코프", type: "function", variables: [{ name: "count", value: "1" }], closed: true },
        ],
        description: "b()를 호출하면 #2의 count가 0 → 1로 증가합니다. a의 count (2) 와 완전히 독립적입니다. 각 makeCounter() 호출은 독립된 클로저 스코프를 만듭니다.",
      },
    ],
  },
};

interface ClosureProps {
  preset?: string;
}

export function Closure({ preset = "basic-closure" }: ClosureProps) {
  const data = presets[preset] ?? presets["basic-closure"];
  const lines = data.code.split("\n");

  const stepNodes = data.steps.map((step, idx) => (
    <div key={idx}>
      <div className="flex gap-4 max-sm:flex-col">
        {/* Code */}
        <div className="flex-1 min-w-0">
          <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
            코드
          </span>
          <div className="rounded-sm bg-surface font-mono text-[0.75rem] leading-relaxed overflow-x-auto">
            {lines.map((line, i) => (
              <div key={i} className="flex">
                <span className="select-none w-8 shrink-0 text-right pr-3 text-muted/30">
                  {i + 1}
                </span>
                <span className="flex-1 pr-3 py-px text-muted/50">
                  {line || "\u00A0"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Scopes */}
        <div className="w-56 shrink-0 max-sm:w-full">
          <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
            스코프
          </span>
          <div className="space-y-1.5">
            {step.scopes.map((scope, i) => {
              const s = scopeStyles[scope.type];
              return (
                <div
                  key={`${scope.name}-${i}`}
                  className={`border p-2 transition-all ${s.border} ${s.bg} ${scope.closed ? "border-l-2 border-l-amber-500" : ""}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[0.625rem] font-bold ${s.label}`}>
                      {scope.name}
                    </span>
                    {scope.closed && (
                      <span className="text-[0.5rem] font-mono text-amber-700 dark:text-amber-300">
                        CLOSURE
                      </span>
                    )}
                  </div>
                  <div className="mt-1 space-y-px">
                    {scope.variables.map((v) => (
                      <span
                        key={v.name}
                        className="flex items-baseline justify-between font-mono text-[0.625rem]"
                      >
                        <span className="text-muted">{v.name}</span>
                        <span className={v.value === "function" ? "text-violet-700 dark:text-violet-300" : "text-text"}>
                          {v.value}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Closure capture info */}
            {step.closureCapture && (
              <div className="mt-2 border-t border-border pt-2">
                <span className="block text-[0.5625rem] uppercase tracking-wider text-muted mb-1">
                  캡처된 변수
                </span>
                <div className="flex items-baseline gap-1.5 font-mono text-[0.625rem]">
                  <span className="text-emerald-700 dark:text-emerald-300">{step.closureCapture.fn}</span>
                  <span className="text-muted">→</span>
                  <span className="text-amber-700 dark:text-amber-300">
                    {step.closureCapture.captures.join(", ")}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <span className="mt-4 block border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </span>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
