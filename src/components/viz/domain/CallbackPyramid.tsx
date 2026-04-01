"use client";

import { useState } from "react";

interface NestingLevel {
  fn: string;
  label: string;
}

const callbackLevels: NestingLevel[] = [
  { fn: "getUser", label: "사용자 조회" },
  { fn: "getOrders", label: "주문 목록" },
  { fn: "getOrderDetails", label: "주문 상세" },
  { fn: "getShippingInfo", label: "배송 정보" },
  { fn: "displayResult", label: "결과 표시" },
];

const nestColors = [
  { bg: "bg-stone-100 dark:bg-stone-800", border: "border-stone-300 dark:border-stone-600", text: "text-stone-700 dark:text-stone-200" },
  { bg: "bg-amber-50 dark:bg-amber-900/70", border: "border-amber-300 dark:border-amber-600", text: "text-amber-800 dark:text-amber-200" },
  { bg: "bg-orange-50 dark:bg-orange-900/70", border: "border-orange-300 dark:border-orange-600", text: "text-orange-800 dark:text-orange-200" },
  { bg: "bg-red-50 dark:bg-red-900/70", border: "border-red-300 dark:border-red-600", text: "text-red-800 dark:text-red-200" },
  { bg: "bg-rose-50 dark:bg-rose-900/70", border: "border-rose-300 dark:border-rose-600", text: "text-rose-800 dark:text-rose-200" },
];

export function CallbackPyramid() {
  const [view, setView] = useState<"callback" | "promise">("callback");

  return (
    <div className="my-8 border border-border p-5">
      {/* Toggle */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setView("callback")}
          className={`px-3 py-1.5 text-[0.75rem] font-mono border transition-colors ${
            view === "callback"
              ? "border-accent text-accent bg-accent/10"
              : "border-border text-muted hover:text-text"
          }`}
        >
          콜백
        </button>
        <button
          onClick={() => setView("promise")}
          className={`px-3 py-1.5 text-[0.75rem] font-mono border transition-colors ${
            view === "promise"
              ? "border-accent text-accent bg-accent/10"
              : "border-border text-muted hover:text-text"
          }`}
        >
          Promise
        </button>
      </div>

      {view === "callback" ? (
        <div>
          <span className="mb-3 block text-[0.6875rem] uppercase tracking-wider text-muted">
            콜백 지옥 — 들여쓰기가 깊어지는 피라미드
          </span>
          <div className="space-y-0">
            {callbackLevels.map((level, i) => {
              const color = nestColors[i];
              return (
                <div
                  key={i}
                  className="animate-[fadeSlideIn_0.3s_ease-out_both]"
                  style={{
                    marginLeft: `${i * 24}px`,
                    animationDelay: `${i * 120}ms`,
                  }}
                >
                  <div
                    className={`flex items-center gap-3 border-l-2 ${color.border} ${color.bg} px-3 py-2`}
                  >
                    {/* Depth indicator */}
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/80 dark:bg-white/10 text-[0.625rem] font-mono text-stone-600 dark:text-stone-300">
                      {i}
                    </span>
                    <span className={`font-mono text-[0.75rem] font-semibold ${color.text}`}>
                      {level.fn}()
                    </span>
                    <span className={`text-[0.6875rem] ${color.text}`}>
                      {level.label}
                    </span>
                    {i < callbackLevels.length - 1 && (
                      <span className={`ml-auto text-[0.625rem] ${color.text}`}>
                        {"(err, data) => {"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {/* Closing braces */}
            <div className="mt-1 font-mono text-[0.625rem] text-muted">
              {callbackLevels
                .slice(0, -1)
                .map((_, i) => (
                  <span key={i} style={{ marginLeft: `${(callbackLevels.length - 2 - i) * 24}px` }} className="block">
                    {"});"}
                  </span>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <span className="mb-3 block text-[0.6875rem] uppercase tracking-wider text-muted">
            Promise 체이닝 — 평탄한 구조
          </span>
          <div className="space-y-0">
            {callbackLevels.map((level, i) => (
              <div
                key={i}
                className="animate-[fadeSlideIn_0.3s_ease-out_both] flex items-center gap-3 border-l-2 border-emerald-400/50 dark:border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-900/50 px-3 py-2"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/80 dark:bg-white/10 text-[0.625rem] font-mono text-emerald-700 dark:text-emerald-300">
                  {i}
                </span>
                <span className="font-mono text-[0.75rem] font-semibold text-emerald-800 dark:text-emerald-200">
                  {i === 0 ? `${level.fn}(userId)` : `.then(${level.fn})`}
                </span>
                <span className="text-[0.6875rem] text-muted">
                  {level.label}
                </span>
                {i === callbackLevels.length - 1 && (
                  <span className="ml-auto font-mono text-[0.625rem] text-emerald-700 dark:text-emerald-300">
                    .catch(handleError)
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 text-[0.75rem] text-muted">
            들여쓰기 없이 위에서 아래로 읽히며, 에러 처리는 <code className="bg-surface px-1 py-0.5 text-[0.6875rem] font-mono rounded-sm border border-border">.catch()</code> 하나로 충분합니다.
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
