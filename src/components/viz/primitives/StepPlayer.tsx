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
    <div className="my-6 rounded-lg border border-border p-4 dark:border-border-dark">
      <div>{children}</div>
      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          onClick={() => goTo(0)}
          disabled={currentStep === 0}
          className="rounded px-2 py-1 text-sm text-muted hover:text-text disabled:opacity-30 dark:text-muted-dark dark:hover:text-text-dark"
        >
          ⏮
        </button>
        <button
          onClick={() => goTo(currentStep - 1)}
          disabled={currentStep === 0}
          className="rounded px-2 py-1 text-sm text-muted hover:text-text disabled:opacity-30 dark:text-muted-dark dark:hover:text-text-dark"
        >
          ◀
        </button>
        <span className="min-w-[60px] text-center text-sm text-muted dark:text-muted-dark">
          {currentStep + 1} / {totalSteps}
        </span>
        <button
          onClick={() => goTo(currentStep + 1)}
          disabled={currentStep === totalSteps - 1}
          className="rounded px-2 py-1 text-sm text-muted hover:text-text disabled:opacity-30 dark:text-muted-dark dark:hover:text-text-dark"
        >
          ▶
        </button>
        <button
          onClick={() => goTo(totalSteps - 1)}
          disabled={currentStep === totalSteps - 1}
          className="rounded px-2 py-1 text-sm text-muted hover:text-text disabled:opacity-30 dark:text-muted-dark dark:hover:text-text-dark"
        >
          ⏭
        </button>
      </div>
    </div>
  );
}
