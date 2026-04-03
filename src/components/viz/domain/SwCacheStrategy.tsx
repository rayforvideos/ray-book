"use client";

import { useState } from "react";

interface Strategy {
  name: string;
  id: string;
  flow: string[];
  useCase: string;
  tradeoff: string;
  speed: "즉시" | "빠름" | "네트워크 의존";
  freshness: "낮음" | "한 박자 느림" | "항상 최신" | "보장";
}

const strategies: Strategy[] = [
  {
    name: "Cache First",
    id: "cache-first",
    flow: [
      "요청 → 캐시 확인",
      "캐시 히트 → 즉시 반환",
      "캐시 미스 → 네트워크 요청 → 캐시 저장 → 반환",
    ],
    useCase: "폰트, 이미지, 해시된 JS/CSS",
    tradeoff: "가장 빠르지만 캐시된 버전이 오래될 수 있음",
    speed: "즉시",
    freshness: "낮음",
  },
  {
    name: "Network First",
    id: "network-first",
    flow: [
      "요청 → 네트워크 시도",
      "성공 → 캐시 저장 → 반환",
      "실패 → 캐시 폴백 → 반환",
    ],
    useCase: "HTML 문서, API 응답, 뉴스 피드",
    tradeoff: "항상 최신이지만 네트워크가 느리면 응답도 느림",
    speed: "네트워크 의존",
    freshness: "항상 최신",
  },
  {
    name: "Stale-While-Revalidate",
    id: "swr",
    flow: [
      "요청 → 캐시 확인",
      "캐시 히트 → 즉시 반환 (stale)",
      "동시에 → 백그라운드 네트워크 요청 → 캐시 갱신",
    ],
    useCase: "아바타, 소셜 피드, 자주 바뀌는 이미지",
    tradeoff: "빠른 응답 + 점진적 갱신, 이번 요청은 이전 캐시",
    speed: "즉시",
    freshness: "한 박자 느림",
  },
  {
    name: "Network Only",
    id: "network-only",
    flow: ["요청 → 네트워크 요청 → 반환", "캐시를 사용하지 않음"],
    useCase: "결제, 인증, 분석 요청",
    tradeoff: "오프라인 시 실패, 캐시 오염 방지",
    speed: "네트워크 의존",
    freshness: "보장",
  },
  {
    name: "Cache Only",
    id: "cache-only",
    flow: ["요청 → 캐시 확인 → 반환", "네트워크를 사용하지 않음"],
    useCase: "Precache된 앱 셸 리소스",
    tradeoff: "가장 빠르고 안정적, Precache 필수",
    speed: "즉시",
    freshness: "낮음",
  },
];

function SpeedBadge({ speed }: { speed: Strategy["speed"] }) {
  const colors = {
    즉시: "bg-green-500/15 text-green-600 dark:text-green-400",
    빠름: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    "네트워크 의존": "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  };
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${colors[speed]}`}>
      {speed}
    </span>
  );
}

function FreshnessBadge({ freshness }: { freshness: Strategy["freshness"] }) {
  const colors = {
    낮음: "bg-muted/15 text-muted",
    "한 박자 느림": "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
    "항상 최신": "bg-green-500/15 text-green-600 dark:text-green-400",
    보장: "bg-green-500/15 text-green-600 dark:text-green-400",
  };
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${colors[freshness]}`}>
      {freshness}
    </span>
  );
}

export function SwCacheStrategy() {
  const [selected, setSelected] = useState(0);
  const strategy = strategies[selected];

  return (
    <div className="my-8 border border-border p-5">
      {/* Tab buttons */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {strategies.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setSelected(i)}
            className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              i === selected
                ? "bg-accent text-white"
                : "bg-muted/10 text-muted hover:text-text"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Strategy detail */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <h4 className="text-base font-semibold">{strategy.name}</h4>
          <SpeedBadge speed={strategy.speed} />
          <FreshnessBadge freshness={strategy.freshness} />
        </div>

        {/* Flow visualization */}
        <div className="mb-4 space-y-2">
          {strategy.flow.map((step, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-medium text-accent">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed">{step}</span>
            </div>
          ))}
        </div>

        {/* Details */}
        <div className="space-y-2 rounded bg-muted/5 border border-border px-4 py-3">
          <div className="flex items-start gap-2 text-sm">
            <span className="shrink-0 font-medium text-muted">적합:</span>
            <span>{strategy.useCase}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <span className="shrink-0 font-medium text-muted">트레이드오프:</span>
            <span className="text-muted">{strategy.tradeoff}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
