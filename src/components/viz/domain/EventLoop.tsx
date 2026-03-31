"use client";

import { useState, useCallback } from "react";
import { StepPlayer } from "../primitives/StepPlayer";
import { AnimatedBox } from "../primitives/AnimatedBox";

interface EventLoopStep {
  queue: "macrotask" | "microtask" | "render";
  item: string;
  description: string;
}

interface EventLoopProps {
  steps: EventLoopStep[];
}

const queueColors = {
  macrotask:
    "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200",
  microtask:
    "bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-200",
  render:
    "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-200",
};

const queueLabels = {
  macrotask: "Macrotask Queue",
  microtask: "Microtask Queue",
  render: "Render",
};

export function EventLoop({ steps = [] }: EventLoopProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleStepChange = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const visibleSteps = steps.slice(0, currentStep + 1);

  return (
    <StepPlayer totalSteps={steps.length} onStepChange={handleStepChange}>
      <div className="space-y-3">
        {/* Queue lanes */}
        {(["macrotask", "microtask", "render"] as const).map((queue) => {
          const queueSteps = visibleSteps.filter((s) => s.queue === queue);
          return (
            <div key={queue} className="flex items-start gap-3">
              <span className="w-32 shrink-0 pt-1 text-right text-xs font-medium text-muted dark:text-muted-dark">
                {queueLabels[queue]}
              </span>
              <div className="flex flex-1 flex-wrap gap-2">
                {queueSteps.map((step, i) => (
                  <AnimatedBox key={i} preset="scaleIn">
                    <span
                      className={`inline-block rounded border px-2 py-1 text-xs font-mono ${queueColors[queue]}`}
                    >
                      {step.item}
                    </span>
                  </AnimatedBox>
                ))}
                {queueSteps.length === 0 && (
                  <span className="pt-1 text-xs text-muted/50 dark:text-muted-dark/50">
                    (비어 있음)
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Current step description */}
        <div className="mt-4 rounded border border-border bg-surface p-3 text-sm dark:border-border-dark dark:bg-surface-dark">
          {steps[currentStep]?.description}
        </div>
      </div>
    </StepPlayer>
  );
}
