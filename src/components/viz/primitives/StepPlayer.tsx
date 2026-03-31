"use client";

import { useState, useCallback, useRef, useLayoutEffect } from "react";

interface StepPlayerProps {
  totalSteps: number;
  onStepChange: (step: number) => void;
  children: React.ReactNode;
}

export function StepPlayer({
  totalSteps,
  onStepChange,
  children,
}: StepPlayerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [fixedHeight, setFixedHeight] = useState<number | undefined>(undefined);
  const measuredSteps = useRef(new Set<number>());
  const maxHeight = useRef(0);

  const goTo = useCallback(
    (step: number) => {
      const clamped = Math.max(0, Math.min(step, totalSteps - 1));
      setCurrentStep(clamped);
      onStepChange(clamped);
    },
    [totalSteps, onStepChange]
  );

  // Measure after every render, lock once all steps seen
  useLayoutEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      if (height > maxHeight.current) {
        maxHeight.current = height;
        setFixedHeight(height);
      }
      measuredSteps.current.add(currentStep);
    }
  }, [currentStep]);

  return (
    <div className="my-8 border border-border p-5">
      <div
        ref={contentRef}
        style={{ minHeight: fixedHeight }}
      >
        {children}
      </div>
      <div className="mt-5 flex items-center justify-center gap-1">
        <button
          onClick={() => goTo(0)}
          disabled={currentStep === 0}
          aria-label="처음으로"
          className="px-2 py-1.5 text-[0.75rem] text-muted hover:text-text disabled:opacity-20"
        >
          ⏮
        </button>
        <button
          onClick={() => goTo(currentStep - 1)}
          disabled={currentStep === 0}
          aria-label="이전"
          className="px-2 py-1.5 text-[0.75rem] text-muted hover:text-text disabled:opacity-20"
        >
          ◀
        </button>

        {/* Step dots */}
        <div className="flex items-center gap-1 px-3">
          {Array.from({ length: totalSteps }, (_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === currentStep
                  ? "w-4 bg-accent"
                  : i <= currentStep
                    ? "w-1.5 bg-muted/40"
                    : "w-1.5 bg-border"
              }`}
              aria-label={`Step ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => goTo(currentStep + 1)}
          disabled={currentStep === totalSteps - 1}
          aria-label="다음"
          className="px-2 py-1.5 text-[0.75rem] text-muted hover:text-text disabled:opacity-20"
        >
          ▶
        </button>
        <button
          onClick={() => goTo(totalSteps - 1)}
          disabled={currentStep === totalSteps - 1}
          aria-label="마지막으로"
          className="px-2 py-1.5 text-[0.75rem] text-muted hover:text-text disabled:opacity-20"
        >
          ⏭
        </button>
      </div>
    </div>
  );
}
