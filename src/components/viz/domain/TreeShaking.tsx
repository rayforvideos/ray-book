"use client";

import { useState } from "react";

interface ExportItem {
  name: string;
  used: boolean;
}

const exports: ExportItem[] = [
  { name: "add", used: true },
  { name: "subtract", used: true },
  { name: "multiply", used: false },
  { name: "divide", used: false },
];

export function TreeShaking() {
  const [shaken, setShaken] = useState(false);
  const usedCount = exports.filter((e) => e.used).length;
  const totalCount = exports.length;
  const percentage = Math.round((usedCount / totalCount) * 100);

  return (
    <div className="my-8 border border-border p-5">
      {/* Toggle */}
      <div className="mb-4 flex border-b border-border">
        <button
          onClick={() => setShaken(false)}
          className={`px-4 py-2 text-[0.75rem] font-mono transition-colors border-b-2 -mb-px ${
            !shaken
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-text"
          }`}
        >
          번들 전
        </button>
        <button
          onClick={() => setShaken(true)}
          className={`px-4 py-2 text-[0.75rem] font-mono transition-colors border-b-2 -mb-px ${
            shaken
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-text"
          }`}
        >
          번들 후
        </button>
      </div>

      <div className="flex gap-5 max-sm:flex-col">
        {/* Left: module exports */}
        <div className="flex-1 min-w-0">
          <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
            math.mjs
          </span>
          <div className="bg-surface border border-border p-3 space-y-2">
            {exports.map((item) => {
              const isRemoved = shaken && !item.used;
              return (
                <div
                  key={item.name}
                  className={`flex items-center gap-2 font-mono text-[0.6875rem] transition-all duration-300 ${
                    isRemoved ? "opacity-100" : ""
                  }`}
                >
                  <span
                    className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                      isRemoved
                        ? "bg-stone-300 dark:bg-stone-600"
                        : item.used
                          ? "bg-emerald-500 dark:bg-emerald-400"
                          : "bg-amber-500 dark:bg-amber-400"
                    }`}
                  />
                  <span
                    className={`transition-all duration-300 ${
                      isRemoved
                        ? "line-through text-muted"
                        : item.used
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-text"
                    }`}
                  >
                    export function {item.name}()
                  </span>
                  {shaken && !item.used && (
                    <span className="text-[0.5625rem] text-muted ml-auto">
                      제거됨
                    </span>
                  )}
                  {shaken && item.used && (
                    <span className="text-[0.5625rem] text-emerald-600 dark:text-emerald-400 ml-auto">
                      포함됨
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Import statement */}
          <div className="mt-3">
            <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
              app.mjs
            </span>
            <pre className="bg-surface border border-border p-3 font-mono text-[0.6875rem] leading-relaxed text-text">
              {"import { add, subtract } from './math.mjs';"}
            </pre>
          </div>
        </div>

        {/* Right: bundle size */}
        <div className="w-48 shrink-0 max-sm:w-full">
          <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
            번들 크기
          </span>
          <div className="border border-border p-3 space-y-3">
            {/* Before */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[0.5625rem] text-muted">원본</span>
                <span className="font-mono text-[0.5625rem] text-muted">
                  100%
                </span>
              </div>
              <div className="h-3 bg-stone-200 dark:bg-stone-700 w-full">
                <div className="h-full bg-amber-400 dark:bg-amber-500 w-full" />
              </div>
            </div>

            {/* After */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[0.5625rem] text-muted">
                  Tree-shaking 후
                </span>
                <span className="font-mono text-[0.5625rem] text-muted">
                  {percentage}%
                </span>
              </div>
              <div className="h-3 bg-stone-200 dark:bg-stone-700 w-full">
                <div
                  className={`h-full transition-all duration-500 ${
                    shaken
                      ? "bg-emerald-400 dark:bg-emerald-500"
                      : "bg-amber-400 dark:bg-amber-500"
                  }`}
                  style={{ width: shaken ? `${percentage}%` : "100%" }}
                />
              </div>
            </div>

            {/* Savings */}
            <div
              className={`text-center transition-opacity duration-300 ${
                shaken ? "opacity-100" : "opacity-0"
              }`}
            >
              <span className="font-mono text-[0.75rem] font-semibold text-emerald-600 dark:text-emerald-400">
                -{100 - percentage}%
              </span>
              <span className="block text-[0.5625rem] text-muted">
                사용하지 않는 코드 제거
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
