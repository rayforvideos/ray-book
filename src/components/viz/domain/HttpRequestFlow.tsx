"use client";

import { StepPlayer } from "../primitives/StepPlayer";

type Phase = "dns" | "tcp" | "tls" | "request" | "response" | "done";

interface FlowStep {
  phase: Phase;
  description: string;
  detail?: string;
}

const phaseConfig: Record<Phase, { label: string; bg: string; text: string }> = {
  dns: { label: "DNS 조회", bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-900 dark:text-violet-100" },
  tcp: { label: "TCP 연결", bg: "bg-sky-50 dark:bg-sky-950/40", text: "text-sky-900 dark:text-sky-100" },
  tls: { label: "TLS 핸드셰이크", bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-900 dark:text-emerald-100" },
  request: { label: "HTTP 요청", bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-900 dark:text-amber-100" },
  response: { label: "HTTP 응답", bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-900 dark:text-rose-100" },
  done: { label: "완료", bg: "bg-stone-100 dark:bg-stone-800/40", text: "text-stone-700 dark:text-stone-200" },
};

const phases: Phase[] = ["dns", "tcp", "tls", "request", "response", "done"];

const steps: FlowStep[] = [
  {
    phase: "dns",
    description: "브라우저가 도메인 이름을 IP 주소로 변환합니다.",
    detail: "example.com → 93.184.216.34\n캐시 순서: 브라우저 → OS → 라우터 → ISP → 루트 DNS",
  },
  {
    phase: "tcp",
    description: "서버와 TCP 연결을 수립합니다. 3-way handshake.",
    detail: "클라이언트 → SYN →\n서버 → SYN+ACK →\n클라이언트 → ACK →\n연결 수립 (1 RTT)",
  },
  {
    phase: "tls",
    description: "HTTPS인 경우 TLS 핸드셰이크로 암호화를 설정합니다.",
    detail: "ClientHello → ServerHello →\n인증서 검증 → 키 교환 →\n암호화 채널 수립 (1-2 RTT)",
  },
  {
    phase: "request",
    description: "브라우저가 HTTP 요청을 전송합니다.",
    detail: "GET /index.html HTTP/2\nHost: example.com\nAccept: text/html\nCookie: session=abc",
  },
  {
    phase: "response",
    description: "서버가 HTTP 응답을 반환합니다.",
    detail: "HTTP/2 200 OK\nContent-Type: text/html\nCache-Control: max-age=3600\n\n<!DOCTYPE html>...",
  },
  {
    phase: "done",
    description: "응답 수신 완료. 브라우저가 HTML을 파싱하고 렌더링 파이프라인을 시작합니다.",
    detail: "HTML 파싱 → DOM 구축 → CSSOM → 렌더 트리 → 페인트",
  },
];

export function HttpRequestFlow() {
  const stepNodes = steps.map((step, idx) => {
    const activeIdx = phases.indexOf(step.phase);
    const cfg = phaseConfig[step.phase];

    return (
      <div key={idx} className="space-y-3">
        {/* Pipeline */}
        <div className="flex gap-0.5 overflow-x-auto">
          {phases.map((p, i) => {
            const c = phaseConfig[p];
            const isActive = i === activeIdx;
            const isPast = i < activeIdx;
            return (
              <div
                key={p}
                className={`flex-1 min-w-[3rem] px-1.5 py-1.5 text-center transition-all ${c.bg} ${
                  isActive ? `ring-2 ring-offset-1 ${c.text} font-bold` : ""
                } ${!isActive && !isPast ? "opacity-30" : ""}`}

              >
                <span className={`block text-[0.5rem] leading-tight ${isActive ? c.text : isPast ? c.text : "text-muted"}`}>
                  {c.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Phase badge */}
        <span className={`inline-block px-2 py-0.5 font-mono text-[0.6875rem] font-bold ${cfg.bg} ${cfg.text}`}>
          {cfg.label}
        </span>

        {/* Detail */}
        {step.detail && (
          <pre className="bg-surface border border-border p-3 font-mono text-[0.625rem] leading-relaxed text-text overflow-x-auto whitespace-pre">
            {step.detail}
          </pre>
        )}

        <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
          {step.description}
        </div>
      </div>
    );
  });

  return <StepPlayer steps={stepNodes} />;
}
