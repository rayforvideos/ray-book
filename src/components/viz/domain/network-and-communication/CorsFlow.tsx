"use client";

import { useState } from "react";
import { StepPlayer } from "../../primitives/StepPlayer";

type CorsPhase = "check" | "preflight-req" | "preflight-res" | "blocked" | "actual-req" | "actual-res" | "done";

interface CorsStep {
  phase: CorsPhase;
  browser: string;
  server: string;
  description: string;
}

const phaseStyles: Record<CorsPhase, { label: string; bg: string; text: string }> = {
  check: { label: "출처 확인", bg: "bg-stone-100 dark:bg-stone-800/40", text: "text-stone-700 dark:text-stone-200" },
  "preflight-req": { label: "Preflight 요청", bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-900 dark:text-violet-100" },
  "preflight-res": { label: "Preflight 응답", bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-900 dark:text-emerald-100" },
  blocked: { label: "차단됨", bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-900 dark:text-rose-100" },
  "actual-req": { label: "실제 요청", bg: "bg-sky-50 dark:bg-sky-950/40", text: "text-sky-900 dark:text-sky-100" },
  "actual-res": { label: "실제 응답", bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-900 dark:text-amber-100" },
  done: { label: "완료", bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-900 dark:text-emerald-100" },
};

const simpleSteps: CorsStep[] = [
  {
    phase: "check",
    browser: "Origin: https://my-app.com",
    server: "",
    description: "브라우저가 요청의 Origin 헤더를 확인합니다. GET + 단순 헤더만 사용하는 경우 preflight 없이 바로 요청합니다.",
  },
  {
    phase: "actual-req",
    browser: "GET /api/data HTTP/1.1\nOrigin: https://my-app.com\nAccept: application/json",
    server: "",
    description: "단순 요청 (Simple Request) — GET/HEAD/POST + Content-Type이 text/plain, multipart/form-data, application/x-www-form-urlencoded 중 하나.",
  },
  {
    phase: "actual-res",
    browser: "",
    server: "HTTP/1.1 200 OK\nAccess-Control-Allow-Origin: https://my-app.com",
    description: "서버가 Access-Control-Allow-Origin 헤더로 허용된 출처를 응답합니다. 브라우저가 이 헤더를 확인하여 JavaScript에 응답을 전달합니다.",
  },
  {
    phase: "done",
    browser: "response.json() 접근 가능",
    server: "",
    description: "Origin이 허용 목록에 포함되어 있으므로 JavaScript가 응답 데이터에 접근할 수 있습니다.",
  },
];

const preflightSteps: CorsStep[] = [
  {
    phase: "check",
    browser: "Origin: https://my-app.com\nContent-Type: application/json\n→ 단순 요청 아님!",
    server: "",
    description: "Content-Type이 application/json이거나, 커스텀 헤더(Authorization 등)를 사용하면 단순 요청이 아닙니다. 브라우저가 자동으로 preflight를 보냅니다.",
  },
  {
    phase: "preflight-req",
    browser: "OPTIONS /api/data HTTP/1.1\nOrigin: https://my-app.com\nAccess-Control-Request-Method: POST\nAccess-Control-Request-Headers: Content-Type",
    server: "",
    description: "브라우저가 OPTIONS 메서드로 preflight 요청을 보냅니다. \"이 메서드와 헤더를 사용해도 되나요?\" 라고 서버에 묻습니다.",
  },
  {
    phase: "preflight-res",
    browser: "",
    server: "HTTP/1.1 204 No Content\nAccess-Control-Allow-Origin: https://my-app.com\nAccess-Control-Allow-Methods: POST, GET\nAccess-Control-Allow-Headers: Content-Type\nAccess-Control-Max-Age: 86400",
    description: "서버가 허용하는 메서드, 헤더, 출처를 응답합니다. Max-Age는 preflight 결과를 캐시하는 시간(초)입니다.",
  },
  {
    phase: "actual-req",
    browser: "POST /api/data HTTP/1.1\nOrigin: https://my-app.com\nContent-Type: application/json\n\n{\"name\": \"Ray\"}",
    server: "",
    description: "preflight가 통과하면 브라우저가 실제 요청을 전송합니다.",
  },
  {
    phase: "actual-res",
    browser: "",
    server: "HTTP/1.1 201 Created\nAccess-Control-Allow-Origin: https://my-app.com\n\n{\"id\": 1, \"name\": \"Ray\"}",
    description: "서버가 실제 응답을 반환합니다. 이 응답에도 Access-Control-Allow-Origin이 필요합니다.",
  },
  {
    phase: "done",
    browser: "response.json() 접근 가능",
    server: "",
    description: "전체 흐름: preflight OPTIONS → 허용 확인 → 실제 요청 → 응답. Max-Age 동안은 같은 요청에 preflight를 생략합니다.",
  },
];

type Mode = "simple" | "preflight";

export function CorsFlow() {
  const [mode, setMode] = useState<Mode>("simple");
  const data = mode === "simple" ? simpleSteps : preflightSteps;

  const stepNodes = data.map((step, idx) => {
    const ps = phaseStyles[step.phase];
    return (
      <div key={idx} className="space-y-3">
        <span className={`inline-block px-2 py-0.5 font-mono text-[0.6875rem] font-bold ${ps.bg} ${ps.text}`}>
          {ps.label}
        </span>

        <div className="flex gap-3 max-sm:flex-col">
          {step.browser && (
            <div className="flex-1 min-w-0">
              <span className="mb-1 block text-[0.6875rem] uppercase tracking-wider text-muted">브라우저</span>
              <pre className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 p-2.5 font-mono text-[0.5625rem] leading-relaxed text-text overflow-x-auto whitespace-pre">
                {step.browser}
              </pre>
            </div>
          )}
          {step.server && (
            <div className="flex-1 min-w-0">
              <span className="mb-1 block text-[0.6875rem] uppercase tracking-wider text-muted">서버</span>
              <pre className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-2.5 font-mono text-[0.5625rem] leading-relaxed text-text overflow-x-auto whitespace-pre">
                {step.server}
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

  return (
    <div className="my-8 space-y-0">
      {/* Tabs */}
      <div className="flex border-b border-border">
        {(["simple", "preflight"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`px-4 py-2 text-[0.75rem] font-mono transition-colors border-b-2 -mb-px ${
              mode === key ? "border-accent text-accent" : "border-transparent text-muted hover:text-text"
            }`}
          >
            {key === "simple" ? "단순 요청" : "Preflight 요청"}
          </button>
        ))}
      </div>
      <StepPlayer steps={stepNodes} />
    </div>
  );
}
