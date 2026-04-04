"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

interface SecurityStep {
  scenario: string;
  originA: string;
  originB: string;
  allowed: boolean;
  resource: string;
  description: string;
}

const steps: SecurityStep[] = [
  {
    scenario: "같은 출처",
    originA: "https://my-app.com",
    originB: "https://my-app.com/api/data",
    allowed: true,
    resource: "fetch, DOM 접근, 쿠키 읽기",
    description: "프로토콜(https), 호스트(my-app.com), 포트(443) 가 모두 같으면 같은 출처입니다. 모든 접근이 허용됩니다.",
  },
  {
    scenario: "프로토콜 다름",
    originA: "https://my-app.com",
    originB: "http://my-app.com",
    allowed: false,
    resource: "fetch 차단, DOM 접근 차단",
    description: "https와 http는 다른 프로토콜입니다. 같은 도메인이라도 프로토콜이 다르면 다른 출처로 취급됩니다.",
  },
  {
    scenario: "포트 다름",
    originA: "https://my-app.com",
    originB: "https://my-app.com:8080",
    allowed: false,
    resource: "fetch 차단, DOM 접근 차단",
    description: "기본 포트(443)와 8080은 다른 포트입니다. 개발 환경에서 자주 만나는 상황입니다.",
  },
  {
    scenario: "서브도메인 다름",
    originA: "https://app.my-site.com",
    originB: "https://api.my-site.com",
    allowed: false,
    resource: "fetch 차단 (CORS 필요)",
    description: "서브도메인이 다르면 다른 출처입니다. 같은 회사의 서비스라도 CORS 설정이 필요합니다.",
  },
  {
    scenario: "CORS로 허용",
    originA: "https://my-app.com",
    originB: "https://api.my-site.com",
    allowed: true,
    resource: "Access-Control-Allow-Origin 헤더로 허용",
    description: "서버가 CORS 헤더로 명시적으로 허용하면 교차 출처 요청이 가능합니다. 이전 시리즈에서 다뤘던 메커니즘입니다.",
  },
];

export function SecurityModel() {
  const stepNodes = steps.map((step, idx) => (
    <div key={idx} className="space-y-3">
      {/* Scenario badge */}
      <span className={`inline-block px-2 py-0.5 font-mono text-[0.6875rem] font-bold ${
        step.allowed
          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100"
          : "bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100"
      }`}>
        {step.scenario}
      </span>

      {/* Origins comparison */}
      <div className="flex items-center gap-3 max-sm:flex-col max-sm:items-start">
        <div className="flex-1 min-w-0">
          <span className="mb-1 block text-[0.6875rem] uppercase tracking-wider text-muted">페이지 출처</span>
          <span className="block font-mono text-[0.625rem] bg-surface border border-border px-2.5 py-1.5 text-text">
            {step.originA}
          </span>
        </div>
        <span className={`text-lg shrink-0 ${step.allowed ? "text-emerald-500" : "text-rose-500"}`}>
          {step.allowed ? "\u2192" : "\u2715"}
        </span>
        <div className="flex-1 min-w-0">
          <span className="mb-1 block text-[0.6875rem] uppercase tracking-wider text-muted">요청 대상</span>
          <span className="block font-mono text-[0.625rem] bg-surface border border-border px-2.5 py-1.5 text-text">
            {step.originB}
          </span>
        </div>
      </div>

      {/* Result */}
      <div className={`px-3 py-2 font-mono text-[0.625rem] ${
        step.allowed
          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800"
          : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800"
      }`}>
        {step.allowed ? "\u2713 " : "\u2715 "}{step.resource}
      </div>

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
