"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

type CachePhase = "request" | "cache-check" | "fresh" | "stale" | "validate" | "not-modified" | "updated" | "no-cache";

interface CacheStep {
  phase: CachePhase;
  cache: string;
  network: string;
  description: string;
}

const phaseStyles: Record<CachePhase, { label: string; bg: string; text: string }> = {
  request: { label: "요청", bg: "bg-stone-100 dark:bg-stone-800/40", text: "text-stone-700 dark:text-stone-200" },
  "cache-check": { label: "캐시 확인", bg: "bg-sky-50 dark:bg-sky-950/40", text: "text-sky-900 dark:text-sky-100" },
  fresh: { label: "캐시 히트", bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-900 dark:text-emerald-100" },
  stale: { label: "캐시 만료", bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-900 dark:text-amber-100" },
  validate: { label: "서버 검증", bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-900 dark:text-violet-100" },
  "not-modified": { label: "304 Not Modified", bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-900 dark:text-emerald-100" },
  updated: { label: "200 + 새 데이터", bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-900 dark:text-rose-100" },
  "no-cache": { label: "캐시 없음", bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-900 dark:text-rose-100" },
};

const steps: CacheStep[] = [
  {
    phase: "request",
    cache: "",
    network: "GET /style.css",
    description: "브라우저가 리소스를 요청합니다. 먼저 로컬 캐시를 확인합니다.",
  },
  {
    phase: "cache-check",
    cache: "Cache-Control: max-age=3600\n저장 시각: 10:00\n현재 시각: 10:30\n→ 아직 유효 (30분 < 60분)",
    network: "",
    description: "Cache-Control의 max-age와 저장 시각을 비교합니다. max-age=3600이고 30분만 지났으므로 캐시가 아직 신선(fresh)합니다.",
  },
  {
    phase: "fresh",
    cache: "✅ 캐시에서 바로 응답\n네트워크 요청 없음\n→ 0ms",
    network: "",
    description: "캐시가 유효하면 네트워크 요청 없이 즉시 응답합니다. 가장 빠른 경로입니다.",
  },
  {
    phase: "stale",
    cache: "Cache-Control: max-age=3600\n저장 시각: 08:00\n현재 시각: 10:30\n→ 만료됨 (150분 > 60분)",
    network: "",
    description: "2시간 30분이 지났으므로 캐시가 만료(stale)되었습니다. 서버에 변경 여부를 확인해야 합니다.",
  },
  {
    phase: "validate",
    cache: "ETag: \"abc123\"",
    network: "GET /style.css\nIf-None-Match: \"abc123\"",
    description: "브라우저가 저장된 ETag를 If-None-Match 헤더에 넣어 서버에 보냅니다. \"이 버전이 아직 유효한가요?\"",
  },
  {
    phase: "not-modified",
    cache: "✅ 기존 캐시 재사용\nETag 동일 → 변경 없음",
    network: "304 Not Modified\n(바디 없음)",
    description: "서버가 304를 반환하면 리소스가 변경되지 않은 것입니다. 바디를 전송하지 않으므로 대역폭을 절약합니다.",
  },
  {
    phase: "updated",
    cache: "⚠ 캐시 갱신\n새 ETag: \"def456\"",
    network: "200 OK\nETag: \"def456\"\nCache-Control: max-age=3600\n\n(새 CSS 내용)",
    description: "서버가 200을 반환하면 리소스가 변경된 것입니다. 새 응답을 캐시에 저장하고 사용합니다.",
  },
];

export function CacheStrategy() {
  const stepNodes = steps.map((step, idx) => {
    const ps = phaseStyles[step.phase];
    return (
      <div key={idx} className="space-y-3">
        <span className={`inline-block px-2 py-0.5 font-mono text-[0.6875rem] font-bold ${ps.bg} ${ps.text}`}>
          {ps.label}
        </span>

        <div className="flex gap-3 max-sm:flex-col">
          {step.cache && (
            <div className="flex-1 min-w-0">
              <span className="mb-1 block text-[0.6875rem] uppercase tracking-wider text-muted">브라우저 캐시</span>
              <pre className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-2.5 font-mono text-[0.5625rem] leading-relaxed text-text overflow-x-auto whitespace-pre">
                {step.cache}
              </pre>
            </div>
          )}
          {step.network && (
            <div className="flex-1 min-w-0">
              <span className="mb-1 block text-[0.6875rem] uppercase tracking-wider text-muted">네트워크</span>
              <pre className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 p-2.5 font-mono text-[0.5625rem] leading-relaxed text-text overflow-x-auto whitespace-pre">
                {step.network}
              </pre>
            </div>
          )}
        </div>

        <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
          {step.description}
        </div>
      </div>
    );
  });

  return <StepPlayer steps={stepNodes} />;
}
