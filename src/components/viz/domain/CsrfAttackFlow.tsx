"use client";

import { StepPlayer } from "../primitives/StepPlayer";

interface CsrfStep {
  attacker: string;
  browser: string;
  server: string;
  description: string;
}

const steps: CsrfStep[] = [
  {
    attacker: "악성 페이지 준비:\nhttps://evil.com/trap.html\n\n<form action=\"https://bank.com/transfer\"\n      method=\"POST\" id=\"f\">\n  <input name=\"to\" value=\"attacker\">\n  <input name=\"amount\" value=\"1000000\">\n</form>\n<script>f.submit()</script>",
    browser: "",
    server: "",
    description: "공격자가 악성 페이지를 만듭니다. 이 페이지에는 은행 사이트로 송금 요청을 보내는 자동 제출 폼이 숨겨져 있습니다.",
  },
  {
    attacker: "",
    browser: "사용자가 evil.com 방문\n→ 폼이 자동 제출됨\n→ bank.com으로 POST 요청\n\n⚠ bank.com 쿠키가\n  자동으로 포함됨!",
    server: "",
    description: "피해자가 evil.com을 방문하면 폼이 자동 제출됩니다. 브라우저는 bank.com에 대한 쿠키를 자동으로 포함합니다 — 피해자가 bank.com에 로그인 상태이므로.",
  },
  {
    attacker: "",
    browser: "",
    server: "POST /transfer\nCookie: session=abc123\nto=attacker&amount=1000000\n\n→ 쿠키 유효 → 송금 실행!",
    description: "서버는 유효한 세션 쿠키를 확인하고 송금을 실행합니다. 서버 입장에서는 정상적인 요청과 구분할 수 없습니다.",
  },
  {
    attacker: "",
    browser: "SameSite=Lax 쿠키:\n→ cross-site POST에\n   쿠키 미포함",
    server: "POST /transfer\nCookie: (없음)\n\n→ 인증 실패 → 요청 거부",
    description: "방어: SameSite=Lax 쿠키는 다른 사이트에서 시작된 POST 요청에 쿠키를 포함하지 않습니다. 공격자의 폼 제출에 세션 쿠키가 빠지므로 서버가 요청을 거부합니다.",
  },
  {
    attacker: "",
    browser: "CSRF 토큰 확인:\n폼에 hidden 필드로\n서버가 발급한 토큰 포함",
    server: "토큰 검증:\n요청의 토큰 === 세션의 토큰?\n→ evil.com은 토큰을 모름\n→ 요청 거부",
    description: "방어: CSRF 토큰. 서버가 폼에 고유 토큰을 삽입합니다. 공격자는 이 토큰을 알 수 없으므로 (SOP가 읽기를 차단) 유효한 요청을 만들 수 없습니다.",
  },
];

export function CsrfAttackFlow() {
  const stepNodes = steps.map((step, idx) => (
    <div key={idx} className="space-y-3">
      <div className="flex gap-3 max-sm:flex-col">
        {step.attacker && (
          <div className="flex-1 min-w-0">
            <span className="mb-1 block text-[0.6875rem] uppercase tracking-wider text-muted">공격자</span>
            <pre className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-2.5 font-mono text-[0.5625rem] leading-relaxed text-text overflow-x-auto whitespace-pre">
              {step.attacker}
            </pre>
          </div>
        )}
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
  ));

  return <StepPlayer steps={stepNodes} />;
}
