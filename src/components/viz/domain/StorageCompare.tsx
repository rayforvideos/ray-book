"use client";

import { useState } from "react";

type StorageType = "cookie" | "localStorage" | "sessionStorage" | "indexedDB";

interface StorageInfo {
  label: string;
  capacity: string;
  scope: string;
  expiration: string;
  sentWithRequests: string;
  accessibleVia: string;
  xssVulnerable: string;
  csrfVulnerable: string;
  useCase: string;
}

const storageData: Record<StorageType, StorageInfo> = {
  cookie: {
    label: "Cookie",
    capacity: "~4KB per cookie",
    scope: "도메인 + 경로",
    expiration: "Expires/Max-Age (또는 세션)",
    sentWithRequests: "모든 HTTP 요청에 자동 포함",
    accessibleVia: "document.cookie (HttpOnly가 아닌 경우)",
    xssVulnerable: "HttpOnly로 방어 가능",
    csrfVulnerable: "자동 전송되므로 취약 — SameSite로 방어",
    useCase: "세션 인증, 서버와 공유할 데이터",
  },
  localStorage: {
    label: "localStorage",
    capacity: "~5-10MB",
    scope: "출처(Origin) 단위",
    expiration: "만료 없음 (직접 삭제까지 유지)",
    sentWithRequests: "전송되지 않음",
    accessibleVia: "window.localStorage (JavaScript)",
    xssVulnerable: "XSS로 접근 가능 — 민감 데이터 저장 금지",
    csrfVulnerable: "요청에 포함 안 됨 — CSRF 안전",
    useCase: "UI 설정, 테마, 캐시 데이터",
  },
  sessionStorage: {
    label: "sessionStorage",
    capacity: "~5-10MB",
    scope: "출처 + 탭 단위",
    expiration: "탭 닫으면 삭제",
    sentWithRequests: "전송되지 않음",
    accessibleVia: "window.sessionStorage (JavaScript)",
    xssVulnerable: "XSS로 접근 가능",
    csrfVulnerable: "요청에 포함 안 됨 — CSRF 안전",
    useCase: "임시 폼 데이터, 탭별 상태",
  },
  indexedDB: {
    label: "IndexedDB",
    capacity: "수백 MB ~ GB",
    scope: "출처(Origin) 단위",
    expiration: "만료 없음 (직접 삭제까지 유지)",
    sentWithRequests: "전송되지 않음",
    accessibleVia: "window.indexedDB (JavaScript, 비동기)",
    xssVulnerable: "XSS로 접근 가능",
    csrfVulnerable: "요청에 포함 안 됨 — CSRF 안전",
    useCase: "오프라인 데이터, 대용량 캐시, 파일",
  },
};

const types: StorageType[] = ["cookie", "localStorage", "sessionStorage", "indexedDB"];

const rows: { label: string; key: keyof StorageInfo }[] = [
  { label: "용량", key: "capacity" },
  { label: "범위", key: "scope" },
  { label: "만료", key: "expiration" },
  { label: "HTTP 요청 포함", key: "sentWithRequests" },
  { label: "접근 방법", key: "accessibleVia" },
  { label: "XSS 취약성", key: "xssVulnerable" },
  { label: "CSRF 취약성", key: "csrfVulnerable" },
  { label: "사용 예", key: "useCase" },
];

export function StorageCompare() {
  const [active, setActive] = useState<StorageType>("cookie");
  const data = storageData[active];

  return (
    <div className="my-8 border border-border p-5">
      {/* Tabs */}
      <div className="mb-4 flex flex-wrap border-b border-border">
        {types.map((key) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`px-3 py-2 text-[0.75rem] font-mono transition-colors border-b-2 -mb-px ${
              active === key ? "border-accent text-accent" : "border-transparent text-muted hover:text-text"
            }`}
          >
            {storageData[key].label}
          </button>
        ))}
      </div>

      {/* Properties */}
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.key} className="flex gap-3 max-sm:flex-col max-sm:gap-0.5">
            <span className="w-28 shrink-0 text-[0.6875rem] uppercase tracking-wider text-muted max-sm:w-full">
              {row.label}
            </span>
            <span className={`flex-1 text-[0.75rem] text-text ${
              row.key === "xssVulnerable" || row.key === "csrfVulnerable"
                ? data[row.key].includes("안전") || data[row.key].includes("방어")
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-rose-700 dark:text-rose-300"
                : ""
            }`}>
              {data[row.key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
