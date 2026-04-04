"use client";

import { useState } from "react";
import { StepPlayer } from "../../primitives/StepPlayer";

type Mode = "polling" | "sse" | "websocket";

interface CommStep {
  client: string;
  server: string;
  description: string;
}

const modeConfig: Record<Mode, { label: string; color: string }> = {
  polling: { label: "Polling", color: "border-amber-400 text-amber-700 dark:text-amber-300" },
  sse: { label: "SSE", color: "border-emerald-400 text-emerald-700 dark:text-emerald-300" },
  websocket: { label: "WebSocket", color: "border-violet-400 text-violet-700 dark:text-violet-300" },
};

const pollingSteps: CommStep[] = [
  {
    client: "GET /api/messages\nAccept: application/json",
    server: "200 OK\n[]\n(새 메시지 없음)",
    description: "클라이언트가 주기적으로 서버에 요청합니다. 새 데이터가 없어도 매번 요청/응답이 오갑니다.",
  },
  {
    client: "GET /api/messages?since=100\n(3초 후 다시 요청)",
    server: "200 OK\n[]\n(아직 없음)",
    description: "3초마다 반복. 서버에 변경이 없으면 빈 응답이 돌아옵니다. 불필요한 네트워크 비용이 발생합니다.",
  },
  {
    client: "GET /api/messages?since=100\n(3초 후 다시 요청)",
    server: "200 OK\n[{id: 101, text: \"안녕\"}]",
    description: "드디어 새 메시지가 도착했습니다. 하지만 최대 3초의 지연이 있습니다. 간격을 줄이면 서버 부하가 증가합니다.",
  },
];

const sseSteps: CommStep[] = [
  {
    client: "GET /api/stream\nAccept: text/event-stream",
    server: "200 OK\nContent-Type: text/event-stream\nConnection: keep-alive",
    description: "EventSource로 연결을 열면 서버가 text/event-stream으로 응답합니다. 연결이 유지된 상태에서 서버가 데이터를 푸시합니다.",
  },
  {
    client: "(대기 중 — 연결 유지)",
    server: "data: {\"id\": 101, \"text\": \"안녕\"}\n\n",
    description: "서버가 새 데이터를 즉시 푸시합니다. 클라이언트는 요청하지 않아도 됩니다. 단방향: 서버 → 클라이언트만 가능.",
  },
  {
    client: "(대기 중 — 연결 유지)",
    server: "data: {\"id\": 102, \"text\": \"반가워\"}\n\n",
    description: "계속 같은 연결로 이벤트를 수신합니다. 자동 재연결, 이벤트 ID 지원. HTTP 기반이므로 CORS, 인증이 기존과 동일합니다.",
  },
];

const wsSteps: CommStep[] = [
  {
    client: "GET /ws HTTP/1.1\nUpgrade: websocket\nConnection: Upgrade\nSec-WebSocket-Key: ...",
    server: "101 Switching Protocols\nUpgrade: websocket\nSec-WebSocket-Accept: ...",
    description: "HTTP 요청으로 시작하여 101 응답과 함께 WebSocket 프로토콜로 업그레이드합니다. 이후 HTTP가 아닌 ws:// 프레임으로 통신합니다.",
  },
  {
    client: "→ {type: \"chat\", text: \"안녕\"}",
    server: "← {type: \"chat\", text: \"안녕\", from: \"Ray\"}",
    description: "양방향 통신. 클라이언트와 서버가 자유롭게 메시지를 주고받습니다. 헤더 오버헤드가 거의 없어 매우 가볍습니다.",
  },
  {
    client: "→ {type: \"typing\", user: \"Ray\"}",
    server: "← {type: \"typing\", user: \"Kim\"}\n← {type: \"chat\", text: \"반가워\"}",
    description: "서버도 언제든 메시지를 보낼 수 있습니다. 채팅, 게임, 실시간 협업에 적합합니다. 연결이 끊기면 직접 재연결 로직을 구현해야 합니다.",
  },
];

export function RealtimeCompare() {
  const [mode, setMode] = useState<Mode>("polling");
  const data = mode === "polling" ? pollingSteps : mode === "sse" ? sseSteps : wsSteps;

  const stepNodes = data.map((step, idx) => (
    <div key={idx} className="space-y-3">
      <div className="flex gap-3 max-sm:flex-col">
        <div className="flex-1 min-w-0">
          <span className="mb-1 block text-[0.6875rem] uppercase tracking-wider text-muted">클라이언트</span>
          <pre className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 p-2.5 font-mono text-[0.5625rem] leading-relaxed text-text overflow-x-auto whitespace-pre">
            {step.client}
          </pre>
        </div>
        <div className="flex-1 min-w-0">
          <span className="mb-1 block text-[0.6875rem] uppercase tracking-wider text-muted">서버</span>
          <pre className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-2.5 font-mono text-[0.5625rem] leading-relaxed text-text overflow-x-auto whitespace-pre">
            {step.server}
          </pre>
        </div>
      </div>
      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return (
    <div className="my-8 space-y-0">
      <div className="flex border-b border-border">
        {(["polling", "sse", "websocket"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`px-4 py-2 text-[0.75rem] font-mono transition-colors border-b-2 -mb-px ${
              mode === key ? "border-accent text-accent" : "border-transparent text-muted hover:text-text"
            }`}
          >
            {modeConfig[key].label}
          </button>
        ))}
      </div>
      <StepPlayer steps={stepNodes} />
    </div>
  );
}
