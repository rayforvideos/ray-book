"use client";

import { useState } from "react";

type Scenario = "allowed" | "blocked";

interface CspRule {
  directive: string;
  value: string;
  resource: string;
  result: "allow" | "block";
  explanation: string;
}

const rules: CspRule[] = [
  {
    directive: "script-src",
    value: "'self'",
    resource: "<script src=\"/app.js\">",
    result: "allow",
    explanation: "'self'는 같은 출처의 스크립트만 허용합니다. /app.js는 같은 출처이므로 실행됩니다.",
  },
  {
    directive: "script-src",
    value: "'self'",
    resource: "<script>alert('xss')</script>",
    result: "block",
    explanation: "인라인 스크립트는 'self'에 포함되지 않습니다. 'unsafe-inline'이 없으면 차단됩니다.",
  },
  {
    directive: "script-src",
    value: "'self'",
    resource: "<script src=\"https://evil.com/steal.js\">",
    result: "block",
    explanation: "evil.com은 허용된 출처가 아닙니다. 외부 스크립트가 차단되어 XSS 피해를 막습니다.",
  },
  {
    directive: "img-src",
    value: "'self' https://cdn.example.com",
    resource: "<img src=\"https://cdn.example.com/photo.jpg\">",
    result: "allow",
    explanation: "cdn.example.com이 img-src에 명시적으로 허용되어 있으므로 이미지가 로드됩니다.",
  },
  {
    directive: "style-src",
    value: "'self'",
    resource: "<div style=\"color:red\">",
    result: "block",
    explanation: "인라인 스타일도 'unsafe-inline' 없이는 차단됩니다. 외부 CSS 파일을 사용해야 합니다.",
  },
  {
    directive: "connect-src",
    value: "'self' https://api.example.com",
    resource: "fetch('https://tracking.com/pixel')",
    result: "block",
    explanation: "tracking.com은 connect-src에 없으므로 fetch 요청이 차단됩니다. 서드파티 추적도 방지할 수 있습니다.",
  },
];

export function CspPolicy() {
  const [filter, setFilter] = useState<Scenario | "all">("all");

  const filtered = filter === "all" ? rules : rules.filter(r =>
    filter === "allowed" ? r.result === "allow" : r.result === "block"
  );

  return (
    <div className="my-8 border border-border p-5">
      {/* Filter tabs */}
      <div className="mb-4 flex gap-2">
        {([["all", "전체"], ["allowed", "허용"], ["blocked", "차단"]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1 text-[0.75rem] font-mono transition-colors border ${
              filter === key ? "border-accent text-accent bg-accent/5" : "border-border text-muted hover:text-text"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Rules */}
      <div className="space-y-3">
        {filtered.map((rule, i) => (
          <div key={i} className={`border p-3 ${
            rule.result === "allow"
              ? "border-emerald-200 dark:border-emerald-800"
              : "border-rose-200 dark:border-rose-800"
          }`}>
            {/* Header: directive + value */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[0.625rem] font-bold text-text">{rule.directive}</span>
              <span className="font-mono text-[0.625rem] text-muted">{rule.value}</span>
            </div>

            {/* Resource */}
            <pre className="mt-2 bg-surface border border-border px-2.5 py-1.5 font-mono text-[0.5625rem] text-text overflow-x-auto whitespace-pre">
              {rule.resource}
            </pre>

            {/* Result */}
            <div className={`mt-2 flex items-center gap-1.5 text-[0.6875rem] font-mono font-bold ${
              rule.result === "allow"
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-rose-700 dark:text-rose-300"
            }`}>
              {rule.result === "allow" ? "\u2713 허용" : "\u2715 차단"}
            </div>

            {/* Explanation */}
            <p className="mt-1.5 text-[0.75rem] leading-relaxed text-muted">
              {rule.explanation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
