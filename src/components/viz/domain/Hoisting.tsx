"use client";

import { StepPlayer } from "../primitives/StepPlayer";

interface Binding {
  name: string;
  keyword: "var" | "let" | "const" | "function";
  value: string;
  state: "uninitialized" | "undefined" | "initialized" | "tdz";
}

interface HoistingStep {
  phase: "creation" | "execution";
  activeLine: number | null;
  bindings: Binding[];
  output?: string;
  error?: string;
  description: string;
}

const stateStyles = {
  uninitialized: { bg: "bg-stone-100 dark:bg-stone-800/40", text: "text-stone-600 dark:text-stone-400", label: "미등록" },
  undefined: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-800 dark:text-amber-200", label: "undefined" },
  initialized: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-900 dark:text-emerald-100", label: "초기화됨" },
  tdz: { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-900 dark:text-rose-100", label: "TDZ" },
};

const keywordStyles = {
  var: "text-amber-700 dark:text-amber-300",
  let: "text-sky-700 dark:text-sky-300",
  const: "text-violet-700 dark:text-violet-300",
  function: "text-emerald-700 dark:text-emerald-300",
};

const presets: Record<string, { code: string; steps: HoistingStep[] }> = {
  "all-types": {
    code: `console.log(a);
console.log(b);
console.log(c);
console.log(foo);

var a = 1;
let b = 2;
const c = 3;
function foo() {}`,
    steps: [
      {
        phase: "creation",
        activeLine: null,
        bindings: [
          { name: "a", keyword: "var", value: "undefined", state: "undefined" },
          { name: "b", keyword: "let", value: "—", state: "tdz" },
          { name: "c", keyword: "const", value: "—", state: "tdz" },
          { name: "foo", keyword: "function", value: "function", state: "initialized" },
        ],
        description: "생성 단계. var a는 undefined로 초기화됩니다. let b, const c는 등록되지만 초기화되지 않습니다 (TDZ 진입). function foo는 함수 객체로 완전히 초기화됩니다.",
      },
      {
        phase: "execution",
        activeLine: 0,
        bindings: [
          { name: "a", keyword: "var", value: "undefined", state: "undefined" },
          { name: "b", keyword: "let", value: "—", state: "tdz" },
          { name: "c", keyword: "const", value: "—", state: "tdz" },
          { name: "foo", keyword: "function", value: "function", state: "initialized" },
        ],
        output: "undefined",
        description: "console.log(a) — var는 생성 단계에서 undefined로 초기화되었으므로 접근 가능. 값은 undefined.",
      },
      {
        phase: "execution",
        activeLine: 1,
        bindings: [
          { name: "a", keyword: "var", value: "undefined", state: "undefined" },
          { name: "b", keyword: "let", value: "—", state: "tdz" },
          { name: "c", keyword: "const", value: "—", state: "tdz" },
          { name: "foo", keyword: "function", value: "function", state: "initialized" },
        ],
        error: "ReferenceError: Cannot access 'b' before initialization",
        description: "console.log(b) — let은 TDZ에 있으므로 접근 시 ReferenceError. 변수는 존재하지만 (등록됨) 아직 초기화되지 않았습니다.",
      },
      {
        phase: "execution",
        activeLine: 2,
        bindings: [
          { name: "a", keyword: "var", value: "undefined", state: "undefined" },
          { name: "b", keyword: "let", value: "—", state: "tdz" },
          { name: "c", keyword: "const", value: "—", state: "tdz" },
          { name: "foo", keyword: "function", value: "function", state: "initialized" },
        ],
        error: "ReferenceError: Cannot access 'c' before initialization",
        description: "console.log(c) — const도 let과 동일하게 TDZ. 초기화 전 접근 불가.",
      },
      {
        phase: "execution",
        activeLine: 3,
        bindings: [
          { name: "a", keyword: "var", value: "undefined", state: "undefined" },
          { name: "b", keyword: "let", value: "—", state: "tdz" },
          { name: "c", keyword: "const", value: "—", state: "tdz" },
          { name: "foo", keyword: "function", value: "function", state: "initialized" },
        ],
        output: "function foo() {}",
        description: "console.log(foo) — 함수 선언은 생성 단계에서 전체가 초기화되므로 선언 전에도 호출/참조 가능. 이것이 함수 호이스팅.",
      },
      {
        phase: "execution",
        activeLine: 5,
        bindings: [
          { name: "a", keyword: "var", value: "1", state: "initialized" },
          { name: "b", keyword: "let", value: "—", state: "tdz" },
          { name: "c", keyword: "const", value: "—", state: "tdz" },
          { name: "foo", keyword: "function", value: "function", state: "initialized" },
        ],
        description: "var a = 1 실행. 이제 a가 undefined에서 1로 할당됩니다.",
      },
      {
        phase: "execution",
        activeLine: 6,
        bindings: [
          { name: "a", keyword: "var", value: "1", state: "initialized" },
          { name: "b", keyword: "let", value: "2", state: "initialized" },
          { name: "c", keyword: "const", value: "—", state: "tdz" },
          { name: "foo", keyword: "function", value: "function", state: "initialized" },
        ],
        description: "let b = 2 실행. 이 시점에서 b가 TDZ를 벗어나 초기화됩니다. 이후부터 정상 접근 가능.",
      },
      {
        phase: "execution",
        activeLine: 7,
        bindings: [
          { name: "a", keyword: "var", value: "1", state: "initialized" },
          { name: "b", keyword: "let", value: "2", state: "initialized" },
          { name: "c", keyword: "const", value: "3", state: "initialized" },
          { name: "foo", keyword: "function", value: "function", state: "initialized" },
        ],
        description: "const c = 3 실행. c도 TDZ를 벗어남. const는 이후 재할당 불가.",
      },
    ],
  },
};

interface HoistingProps {
  preset?: string;
}

export function Hoisting({ preset = "all-types" }: HoistingProps) {
  const data = presets[preset] ?? presets["all-types"];
  const lines = data.code.split("\n");

  const stepNodes = data.steps.map((step, idx) => (
    <div key={idx}>
      <div className="flex gap-4 max-sm:flex-col">
        {/* Code */}
        <div className="flex-1 min-w-0">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-[0.6875rem] uppercase tracking-wider text-muted">코드</span>
            <span className={`font-mono text-[0.5625rem] px-1.5 py-px ${step.phase === "creation" ? "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200" : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"}`}>
              {step.phase === "creation" ? "생성 단계" : "실행 단계"}
            </span>
          </div>
          <div className="rounded-sm bg-surface font-mono text-[0.75rem] leading-relaxed overflow-x-auto">
            {lines.map((line, i) => {
              const isActive = step.activeLine === i;
              return (
                <div key={i} className={`flex transition-colors duration-150 ${isActive ? "bg-accent/10" : ""}`}>
                  <span className={`select-none w-8 shrink-0 text-right pr-3 ${isActive ? "text-accent" : "text-muted/50"}`}>{i + 1}</span>
                  <span className={`flex-1 pr-3 py-px ${isActive ? "text-text" : step.activeLine === null ? "text-muted/70" : "text-muted/50"}`}>{line || "\u00A0"}</span>
                  {isActive && <span className="shrink-0 pr-2 text-accent text-[0.625rem] pt-px">◄</span>}
                </div>
              );
            })}
          </div>

          {/* Output / Error */}
          {(step.output || step.error) && (
            <div className={`mt-2 px-3 py-1.5 font-mono text-[0.6875rem] ${step.error ? "bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100" : "bg-surface text-muted"}`}>
              {step.error ? `✗ ${step.error}` : `→ ${step.output}`}
            </div>
          )}
        </div>

        {/* Bindings */}
        <div className="w-52 shrink-0 max-sm:w-full">
          <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">변수 상태</span>
          <div className="space-y-1">
            {step.bindings.map((b) => {
              const ss = stateStyles[b.state];
              const kw = keywordStyles[b.keyword];
              return (
                <div key={b.name} className={`border border-transparent p-2 ${ss.bg}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-mono text-[0.5625rem] font-bold ${kw}`}>{b.keyword}</span>
                      <span className="font-mono text-[0.6875rem] font-semibold text-text">{b.name}</span>
                    </div>
                    <span className={`text-[0.5rem] font-bold uppercase ${ss.text}`}>{ss.label}</span>
                  </div>
                  <span className={`mt-0.5 block font-mono text-[0.625rem] ${ss.text}`}>{b.value}</span>
                </div>
              );
            })}
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
