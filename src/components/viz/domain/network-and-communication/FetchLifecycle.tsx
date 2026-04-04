"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

type FetchPhase = "init" | "sending" | "headers" | "body" | "done" | "abort";

interface FetchStep {
  phase: FetchPhase;
  code: string;
  promiseState: string;
  description: string;
}

const phaseStyles: Record<FetchPhase, { label: string; bg: string; text: string }> = {
  init: { label: "Request 생성", bg: "bg-stone-100 dark:bg-stone-800/40", text: "text-stone-700 dark:text-stone-200" },
  sending: { label: "요청 전송", bg: "bg-sky-50 dark:bg-sky-950/40", text: "text-sky-900 dark:text-sky-100" },
  headers: { label: "응답 헤더 수신", bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-900 dark:text-emerald-100" },
  body: { label: "응답 바디 파싱", bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-900 dark:text-amber-100" },
  done: { label: "완료", bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-900 dark:text-violet-100" },
  abort: { label: "중단됨", bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-900 dark:text-rose-100" },
};

const steps: FetchStep[] = [
  {
    phase: "init",
    code: `const controller = new AbortController();

const response = await fetch("/api/data", {
  method: "GET",
  headers: { "Accept": "application/json" },
  signal: controller.signal,
});`,
    promiseState: "fetch() → Promise<Response> [pending]",
    description: "fetch()를 호출하면 Request 객체가 생성되고 Promise<Response>가 반환됩니다. AbortController의 signal을 전달하면 요청을 중단할 수 있습니다.",
  },
  {
    phase: "sending",
    code: `// 브라우저가 네트워크 요청을 전송
// DNS → TCP → TLS → HTTP (이전 글 참조)`,
    promiseState: "fetch() → Promise<Response> [pending]",
    description: "브라우저가 이전 글에서 다뤘던 HTTP 파이프라인을 통해 요청을 전송합니다. Promise는 아직 pending 상태입니다.",
  },
  {
    phase: "headers",
    code: `// 응답 헤더가 도착한 시점
console.log(response.status);  // 200
console.log(response.ok);      // true
console.log(response.headers.get("Content-Type"));
// "application/json"`,
    promiseState: "fetch() → Promise<Response> [fulfilled]",
    description: "응답 헤더가 도착하면 fetch의 Promise가 resolve됩니다. 이 시점에서 status, headers에 접근할 수 있지만, 바디는 아직 스트리밍 중입니다.",
  },
  {
    phase: "body",
    code: `// 바디를 JSON으로 파싱 (스트림을 끝까지 읽음)
const data = await response.json();
// → Promise<any> [pending → fulfilled]`,
    promiseState: "response.json() → Promise [pending]",
    description: "response.json()은 바디 스트림을 끝까지 읽고 JSON으로 파싱합니다. 바디를 한 번 읽으면 다시 읽을 수 없습니다 (ReadableStream).",
  },
  {
    phase: "done",
    code: `console.log(data);
// { users: [...], total: 100 }`,
    promiseState: "완료 — data 사용 가능",
    description: "바디 파싱이 완료되면 데이터를 사용할 수 있습니다. 전체 흐름: fetch() 호출 → 헤더 도착(Promise resolve) → 바디 파싱 → 데이터.",
  },
  {
    phase: "abort",
    code: `// 3초 후 요청 중단
setTimeout(() => controller.abort(), 3000);

try {
  const response = await fetch(url, { signal });
} catch (e) {
  if (e.name === "AbortError") {
    console.log("요청이 중단되었습니다");
  }
}`,
    promiseState: "fetch() → Promise<Response> [rejected: AbortError]",
    description: "controller.abort()를 호출하면 fetch의 Promise가 AbortError로 reject됩니다. 타임아웃, 페이지 이동, 사용자 취소에 활용합니다.",
  },
];

export function FetchLifecycle() {
  const stepNodes = steps.map((step, idx) => {
    const ps = phaseStyles[step.phase];
    return (
      <div key={idx} className="space-y-3">
        <span className={`inline-block px-2 py-0.5 font-mono text-[0.6875rem] font-bold ${ps.bg} ${ps.text}`}>
          {ps.label}
        </span>

        {/* Code */}
        <pre className="bg-surface border border-border p-3 font-mono text-[0.625rem] leading-relaxed text-text overflow-x-auto whitespace-pre">
          {step.code}
        </pre>

        {/* Promise state */}
        <div className="flex items-center gap-2">
          <span className="text-[0.6875rem] uppercase tracking-wider text-muted">Promise</span>
          <span className={`font-mono text-[0.625rem] px-1.5 py-0.5 ${ps.bg} ${ps.text}`}>
            {step.promiseState}
          </span>
        </div>

        <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
          {step.description}
        </div>
      </div>
    );
  });

  return <StepPlayer steps={stepNodes} />;
}
