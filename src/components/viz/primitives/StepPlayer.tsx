"use client";

import { useState, useCallback, useRef } from "react";

interface StepPlayerProps {
  steps: React.ReactNode[];
  onStepChange?: (step: number) => void;
}

export function StepPlayer({ steps, onStepChange }: StepPlayerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = steps.length;
  const contentRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (step: number) => {
      const clamped = Math.max(0, Math.min(step, totalSteps - 1));
      setCurrentStep(clamped);
      onStepChange?.(clamped);
    },
    [totalSteps, onStepChange]
  );

  return (
    <div className="my-8 border border-border p-5">
      <div ref={contentRef}>
        {steps[currentStep]}
      </div>

      {/* Controls */}
      <div className="mt-5 flex items-center justify-center gap-1">
        <button
          onClick={() => goTo(0)}
          disabled={currentStep === 0}
          aria-label="처음으로"
          className="p-1.5 text-muted hover:text-text disabled:opacity-20"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="4" x2="3" y2="12" />
            <polyline points="12,4 6,8 12,12" />
          </svg>
        </button>
        <button
          onClick={() => goTo(currentStep - 1)}
          disabled={currentStep === 0}
          aria-label="이전"
          className="p-1.5 text-muted hover:text-text disabled:opacity-20"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="11,4 5,8 11,12" />
          </svg>
        </button>

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
          className="p-1.5 text-muted hover:text-text disabled:opacity-20"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="5,4 11,8 5,12" />
          </svg>
        </button>
        <button
          onClick={() => goTo(totalSteps - 1)}
          disabled={currentStep === totalSteps - 1}
          aria-label="마지막으로"
          className="p-1.5 text-muted hover:text-text disabled:opacity-20"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4,4 10,8 4,12" />
            <line x1="13" y1="4" x2="13" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
