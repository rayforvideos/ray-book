"use client";

import { useState, useCallback } from "react";
import { StepPlayer } from "../primitives/StepPlayer";

interface ICStep {
  code: string;
  state: "uninitialized" | "monomorphic" | "polymorphic" | "megamorphic";
  cache: { map: string; offset: string }[];
  description: string;
}

const stateStyles = {
  uninitialized: {
    label: "Uninitialized",
    bg: "bg-stone-100 dark:bg-stone-800/40",
    text: "text-stone-700 dark:text-stone-200",
    ring: "",
  },
  monomorphic: {
    label: "Monomorphic",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-950 dark:text-emerald-100",
    ring: "ring-1 ring-emerald-400/50 dark:ring-emerald-500/40",
  },
  polymorphic: {
    label: "Polymorphic",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-950 dark:text-amber-100",
    ring: "ring-1 ring-amber-400/50 dark:ring-amber-500/40",
  },
  megamorphic: {
    label: "Megamorphic",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-950 dark:text-rose-100",
    ring: "ring-1 ring-rose-400/50 dark:ring-rose-500/40",
  },
};

const presets: Record<string, ICStep[]> = {
  "property-access": [
    {
      code: "function getX(obj) { return obj.x; }",
      state: "uninitialized",
      cache: [],
      description: "함수가 정의되었지만 아직 호출되지 않았습니다. obj.x 접근에 대한 IC가 초기화되지 않은 상태입니다.",
    },
    {
      code: 'getX({ x: 1, y: 2 });  // Map2',
      state: "monomorphic",
      cache: [{ map: "Map2", offset: "@0" }],
      description: "첫 호출. IC가 Map2에서 x가 오프셋 0에 있다는 것을 캐싱합니다. 모노모픽 — 가장 빠른 상태입니다.",
    },
    {
      code: 'getX({ x: 3, y: 4 });  // Map2',
      state: "monomorphic",
      cache: [{ map: "Map2", offset: "@0" }],
      description: "같은 Hidden Class (Map2) 의 객체로 호출. 캐시 히트 — 딕셔너리 탐색 없이 오프셋 0에서 바로 읽습니다.",
    },
    {
      code: 'getX({ x: 5, z: 6 });  // Map7',
      state: "polymorphic",
      cache: [
        { map: "Map2", offset: "@0" },
        { map: "Map7", offset: "@0" },
      ],
      description: "다른 Hidden Class (Map7) 의 객체가 들어왔습니다. IC가 폴리모픽으로 전이 — 두 개의 캐시 엔트리를 유지합니다.",
    },
    {
      code: "getX(obj3); getX(obj4); getX(obj5); ...",
      state: "megamorphic",
      cache: [],
      description: "너무 많은 Hidden Class가 유입되었습니다. IC가 메가모픽으로 전이 — 캐싱을 포기하고 매번 느린 경로로 탐색합니다. TurboFan도 이 함수를 최적화하기 어렵습니다.",
    },
  ],
};

interface ICStateProps {
  preset?: string;
}

export function ICState({ preset = "property-access" }: ICStateProps) {
  const steps = presets[preset] ?? presets["property-access"];
  const [currentStep, setCurrentStep] = useState(0);

  const handleStepChange = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const step = steps[currentStep];
  const style = stateStyles[step.state];

  return (
    <StepPlayer totalSteps={steps.length} onStepChange={handleStepChange}>
      <div className="space-y-4">
        {/* Code */}
        <div>
          <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
            코드
          </span>
          <div className="rounded-sm bg-surface p-3 font-mono text-[0.8125rem]">
            {step.code}
          </div>
        </div>

        {/* IC State */}
        <div className="flex items-start gap-5">
          <div>
            <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
              IC 상태
            </span>
            <span
              className={`inline-block border border-transparent px-3 py-1.5 font-mono text-[0.75rem] font-bold ${style.bg} ${style.text} ${style.ring}`}
            >
              {style.label}
            </span>
          </div>

          <div className="flex-1">
            <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
              캐시
            </span>
            {step.cache.length > 0 ? (
              <div className="space-y-1">
                {step.cache.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-baseline gap-2 font-mono text-[0.6875rem]"
                  >
                    <span className="text-violet-950 dark:text-violet-100">
                      {entry.map}
                    </span>
                    <span className="text-muted">→</span>
                    <span className="text-sky-950 dark:text-sky-100">
                      x {entry.offset}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-[0.6875rem] text-muted/50">
                {step.state === "uninitialized" ? "(초기화 전)" : "(캐싱 포기)"}
              </span>
            )}
          </div>
        </div>

        {/* State indicators */}
        <div className="flex gap-1">
          {(["uninitialized", "monomorphic", "polymorphic", "megamorphic"] as const).map(
            (s) => {
              const sStyle = stateStyles[s];
              const isActive = s === step.state;
              return (
                <div
                  key={s}
                  className={`flex-1 py-1 text-center text-[0.5625rem] transition-all ${
                    isActive
                      ? `${sStyle.bg} ${sStyle.text} font-semibold`
                      : "bg-surface text-muted/40"
                  }`}
                >
                  {sStyle.label}
                </div>
              );
            }
          )}
        </div>

        {/* Description */}
        <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted min-h-[3.5rem]">
          {step.description}
        </div>
      </div>
    </StepPlayer>
  );
}
