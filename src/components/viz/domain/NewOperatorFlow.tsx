"use client";

import { StepPlayer } from "../primitives/StepPlayer";

interface FlowStep {
  number: number;
  title: string;
  detail: string;
  objectState: string;
  description: string;
}

const flowSteps: FlowStep[] = [
  {
    number: 1,
    title: "빈 객체 생성",
    detail: "const obj = {}",
    objectState: "{ }",
    description:
      "new를 호출하면 엔진이 먼저 빈 객체를 만듭니다. 이 객체가 최종 인스턴스의 시작점입니다.",
  },
  {
    number: 2,
    title: "[[Prototype]] 설정",
    detail: "Object.setPrototypeOf(obj, Dog.prototype)",
    objectState: "{ } → Dog.prototype",
    description:
      "빈 객체의 [[Prototype]]을 생성자 함수의 prototype으로 연결합니다. 이후 obj에서 Dog.prototype의 메서드를 탐색할 수 있습니다.",
  },
  {
    number: 3,
    title: "생성자 실행 (this 바인딩)",
    detail: "Dog.apply(obj, [\"Rex\"])",
    objectState: '{ name: "Rex" }',
    description:
      "생성자 함수를 호출하되, this를 1단계에서 만든 obj로 바인딩합니다. this.name = name이 실행되어 obj에 속성이 추가됩니다.",
  },
  {
    number: 4,
    title: "객체 반환",
    detail: "return obj",
    objectState: '{ name: "Rex", __proto__: Dog.prototype }',
    description:
      "생성자가 명시적으로 객체를 반환하지 않으면, 1단계에서 만든 obj가 반환됩니다. 이것이 new Dog(\"Rex\")의 결과입니다.",
  },
];

const stepColors = [
  { badge: "bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200", border: "border-stone-300 dark:border-stone-600" },
  { badge: "bg-sky-200 dark:bg-sky-800 text-sky-800 dark:text-sky-200", border: "border-sky-300 dark:border-sky-600" },
  { badge: "bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200", border: "border-amber-300 dark:border-amber-600" },
  { badge: "bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200", border: "border-emerald-300 dark:border-emerald-600" },
];

export function NewOperatorFlow() {
  const stepNodes = flowSteps.map((_, currentIdx) => {
    const visibleSteps = flowSteps.slice(0, currentIdx + 1);
    const currentObject = flowSteps[currentIdx];

    return (
      <div key={currentIdx} className="flex gap-5 max-sm:flex-col">
        {/* Left: step cards */}
        <div className="flex-1 min-w-0 space-y-2">
          <span className="mb-2 block text-[0.6875rem] uppercase tracking-wider text-muted">
            진행 단계
          </span>
          {visibleSteps.map((step, i) => {
            const color = stepColors[i];
            const isCurrent = i === currentIdx;
            return (
              <div
                key={i}
                className={`border px-3 py-2.5 transition-all duration-200 ${color.border} ${
                  isCurrent ? "bg-accent/5 ring-1 ring-accent/30" : "bg-surface"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-bold ${color.badge}`}
                  >
                    {step.number}
                  </span>
                  <span className={`text-[0.75rem] font-semibold ${isCurrent ? "text-text" : "text-muted"}`}>
                    {step.title}
                  </span>
                </div>
                <div className="mt-1.5 ml-[30px]">
                  <code className="bg-surface px-1.5 py-0.5 text-[0.6875rem] font-mono rounded-sm border border-border text-muted">
                    {step.detail}
                  </code>
                </div>
                {/* Arrow to next (except last visible) */}
                {i < visibleSteps.length - 1 && (
                  <div className="ml-[9px] mt-1 mb-[-8px] text-[0.75rem] text-muted">
                    ↓
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: object state */}
        <div className="w-56 shrink-0 max-sm:w-full">
          <span className="mb-2 block text-[0.6875rem] uppercase tracking-wider text-muted">
            객체 상태
          </span>
          <div className="border border-border bg-surface p-4">
            <pre className="font-mono text-[0.75rem] leading-relaxed text-text whitespace-pre-wrap">
              {currentObject.objectState}
            </pre>
          </div>
        </div>

        {/* Bottom: description */}
        <div className="hidden">
          {/* Rendered below via separate block */}
        </div>
      </div>
    );
  });

  // Wrap each stepNode with a description underneath
  const wrappedNodes = flowSteps.map((step, idx) => (
    <div key={idx}>
      {stepNodes[idx]}
      <span className="mt-4 block border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </span>
    </div>
  ));

  return <StepPlayer steps={wrappedNodes} />;
}
