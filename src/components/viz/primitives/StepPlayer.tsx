"use client";

import { useState, useCallback } from "react";

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

  const goTo = useCallback(
    (step: number) => {
      const clamped = Math.max(0, Math.min(step, totalSteps - 1));
      setCurrentStep(clamped);
      onStepChange(clamped);
    },
    [totalSteps, onStepChange]
  );

  return (
    <div className="my-8 border border-border p-5">
      <div>{children}</div>
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
                  ? "w-4 bg-accent dark:bg-accent-dark"
                  : i <= currentStep
                    ? "w-1.5 bg-muted/40 dark:bg-muted-dark/40"
                    : "w-1.5 bg-border dark:bg-border-dark"
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
