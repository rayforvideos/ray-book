"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

interface ScopeBox {
  name: string;
  type: "global" | "function" | "block";
  variables: { name: string; value: string }[];
  highlight?: boolean;
}

interface LookupArrow {
  from: string;
  variable: string;
  found: boolean;
}

interface ScopeStep {
  code: string;
  activeLine: number | null;
  scopes: ScopeBox[];
  lookup?: LookupArrow[];
  description: string;
}

interface PresetData {
  code: string;
  steps: ScopeStep[];
}

const scopeStyles = {
  global: {
    border: "border-stone-400/50 dark:border-stone-500/40",
    bg: "bg-stone-50 dark:bg-stone-900/40",
    label: "text-stone-600 dark:text-stone-300",
  },
  function: {
    border: "border-sky-400/50 dark:border-sky-500/40",
    bg: "bg-sky-50 dark:bg-sky-950/40",
    label: "text-sky-800 dark:text-sky-100",
  },
  block: {
    border: "border-violet-400/50 dark:border-violet-500/40",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    label: "text-violet-800 dark:text-violet-100",
  },
};

const presets: Record<string, PresetData> = {
  "lexical-scope": {
    code: `var a = "global";
function outer() {
  var b = "outer";
  function inner() {
    var c = "inner";
    console.log(a, b, c);
  }
  inner();
}
outer();`,
    steps: [
      {
        code: "// 전체 스코프 구조",
        activeLine: null,
        scopes: [
          { name: "Global Scope", type: "global", variables: [{ name: "a", value: '"global"' }, { name: "outer", value: "function" }] },
        ],
        description: "코드가 로드되면 전역 스코프가 만들어집니다. var a와 function outer가 이 스코프에 속합니다.",
      },
      {
        code: "outer() 호출",
        activeLine: 9,
        scopes: [
          { name: "Global Scope", type: "global", variables: [{ name: "a", value: '"global"' }, { name: "outer", value: "function" }] },
          { name: "outer Scope", type: "function", variables: [{ name: "b", value: '"outer"' }, { name: "inner", value: "function" }] },
        ],
        description: "outer()가 호출되면 outer의 스코프가 생성됩니다. 이 스코프는 전역 스코프를 외부 참조로 가리킵니다.",
      },
      {
        code: "inner() 호출",
        activeLine: 7,
        scopes: [
          { name: "Global Scope", type: "global", variables: [{ name: "a", value: '"global"' }, { name: "outer", value: "function" }] },
          { name: "outer Scope", type: "function", variables: [{ name: "b", value: '"outer"' }, { name: "inner", value: "function" }] },
          { name: "inner Scope", type: "function", variables: [{ name: "c", value: '"inner"' }], highlight: true },
        ],
        description: "inner()가 호출되면 inner의 스코프가 생성됩니다. 스코프 체인: inner → outer → Global.",
      },
      {
        code: "console.log(a, b, c)",
        activeLine: 5,
        scopes: [
          { name: "Global Scope", type: "global", variables: [{ name: "a", value: '"global"' }], highlight: true },
          { name: "outer Scope", type: "function", variables: [{ name: "b", value: '"outer"' }], highlight: true },
          { name: "inner Scope", type: "function", variables: [{ name: "c", value: '"inner"' }], highlight: true },
        ],
        lookup: [
          { from: "inner", variable: "c", found: true },
          { from: "outer", variable: "b", found: true },
          { from: "Global", variable: "a", found: true },
        ],
        description: "c는 inner에서 바로 찾음. b는 inner에 없으므로 outer로 올라가서 찾음. a는 outer에도 없으므로 Global까지 올라가서 찾음. 이것이 스코프 체인 탐색입니다.",
      },
    ],
  },
  "block-scope": {
    code: `function example() {
  var x = 1;
  let y = 2;
  if (true) {
    var z = 3;
    let w = 4;
    console.log(x, y, z, w);
  }
  console.log(x, y, z, w);
}`,
    steps: [
      {
        code: "// 함수 스코프 vs 블록 스코프",
        activeLine: null,
        scopes: [
          { name: "example Scope (var)", type: "function", variables: [{ name: "x", value: "1" }, { name: "z", value: "3" }] },
          { name: "함수 본문 Block (let)", type: "block", variables: [{ name: "y", value: "2" }] },
        ],
        description: "var x, var z는 함수 스코프에, let y는 함수 본문의 블록 스코프에 속합니다. var는 블록을 무시하고 함수 스코프에 등록되지만, let은 가장 가까운 블록에 등록됩니다.",
      },
      {
        code: "if 블록 안",
        activeLine: 6,
        scopes: [
          { name: "example Scope (var)", type: "function", variables: [{ name: "x", value: "1" }, { name: "z", value: "3" }] },
          { name: "함수 본문 Block (let)", type: "block", variables: [{ name: "y", value: "2" }] },
          { name: "if Block Scope", type: "block", variables: [{ name: "w", value: "4" }], highlight: true },
        ],
        description: "let w는 if 블록 스코프에 속합니다. 블록 안에서 x, y, z, w 모두 접근 가능합니다. var z는 if 블록 안에서 선언되었지만 함수 스코프에 등록됩니다.",
      },
      {
        code: "if 블록 밖",
        activeLine: 8,
        scopes: [
          { name: "example Scope (var)", type: "function", variables: [{ name: "x", value: "1" }, { name: "z", value: "3" }] },
          { name: "함수 본문 Block (let)", type: "block", variables: [{ name: "y", value: "2" }], highlight: true },
        ],
        lookup: [
          { from: "example", variable: "w", found: false },
        ],
        description: "블록을 벗어나면 if Block Scope가 사라집니다. w는 더 이상 접근할 수 없어 ReferenceError가 발생합니다. 하지만 var z는 함수 스코프에 있으므로 여전히 접근 가능합니다.",
      },
    ],
  },
};

interface ScopeChainProps {
  preset?: string;
}

export function ScopeChain({ preset = "lexical-scope" }: ScopeChainProps) {
  const data = presets[preset] ?? presets["lexical-scope"];
  const lines = data.code.split("\n");

  const stepNodes = data.steps.map((step, idx) => (
    <div key={idx}>
      <div className="flex gap-4 max-sm:flex-col">
        <div className="flex-1 min-w-0">
          <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">코드</span>
          <div className="rounded-sm bg-surface font-mono text-[0.75rem] leading-relaxed overflow-x-auto">
            {lines.map((line, i) => {
              const isActive = step.activeLine === i;
              return (
                <div key={i} className={`flex transition-colors duration-150 ${isActive ? "bg-accent/10" : ""}`}>
                  <span className={`select-none w-8 shrink-0 text-right pr-3 ${isActive ? "text-accent" : "text-muted/50"}`}>{i + 1}</span>
                  <span className={`flex-1 pr-3 py-px whitespace-pre ${isActive ? "text-text" : step.activeLine === null ? "text-muted/70" : "text-muted/50"}`}>{line || "\u00A0"}</span>
                  {isActive && <span className="shrink-0 pr-2 text-accent text-[0.625rem] pt-px">◄</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-52 shrink-0 max-sm:w-full">
          <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">스코프 체인</span>
          <div className="space-y-1.5">
            {step.scopes.map((scope, i) => {
              const s = scopeStyles[scope.type];
              return (
                <div key={`${scope.name}-${i}`}>
                  <div className={`border p-2 transition-all ${s.border} ${s.bg} ${scope.highlight ? "ring-1 ring-accent/30" : ""}`}>
                    <span className={`block text-[0.625rem] font-bold ${s.label}`}>{scope.name}</span>
                    <div className="mt-1 space-y-px">
                      {scope.variables.map((v) => (
                        <span key={v.name} className="flex items-baseline justify-between font-mono text-[0.625rem]">
                          <span className="text-muted">{v.name}</span>
                          <span className={v.value === "function" ? "text-violet-700 dark:text-violet-300" : "text-text"}>{v.value}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  {i < step.scopes.length - 1 && (
                    <div className="flex justify-center py-0.5">
                      <span className="text-[0.625rem] text-muted">↑ outer</span>
                    </div>
                  )}
                </div>
              );
            })}
            {step.lookup && (
              <div className="mt-2 border-t border-border pt-2 space-y-0.5">
                <span className="block text-[0.5625rem] uppercase tracking-wider text-muted mb-1">탐색 결과</span>
                {step.lookup.map((l, i) => (
                  <span key={i} className="flex items-baseline gap-1.5 font-mono text-[0.625rem]">
                    <span className={l.found ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}>{l.found ? "✓" : "✗"}</span>
                    <span className="text-text">{l.variable}</span>
                    <span className="text-muted">← {l.from}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <span className="mt-4 block border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </span>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
