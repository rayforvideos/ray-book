"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

interface LifecycleStep {
  phase: string;
  status: string;
  description: string;
  detail: string;
  activeStates: string[];
}

const steps: LifecycleStep[] = [
  {
    phase: "등록",
    status: "register()",
    description: "페이지가 SW 파일의 위치를 브라우저에 알려줍니다.",
    detail:
      "navigator.serviceWorker.register('/sw.js')를 호출합니다. 브라우저가 SW 파일을 다운로드하고 파싱합니다.",
    activeStates: ["registering"],
  },
  {
    phase: "설치",
    status: "install 이벤트",
    description: "SW가 필요한 리소스를 미리 캐싱합니다.",
    detail:
      "install 이벤트가 발생합니다. event.waitUntil()로 캐싱이 완료될 때까지 설치를 유지합니다. 캐싱 실패 시 설치 자체가 실패합니다.",
    activeStates: ["installing"],
  },
  {
    phase: "대기",
    status: "waiting",
    description: "기존 SW가 제어하는 클라이언트가 모두 닫힐 때까지 대기합니다.",
    detail:
      "새 SW가 준비되었지만, 기존 SW가 아직 페이지를 제어하고 있습니다. 버전 불일치를 방지하기 위한 안전장치입니다. skipWaiting()으로 건너뛸 수 있습니다.",
    activeStates: ["installed", "waiting"],
  },
  {
    phase: "활성화",
    status: "activate 이벤트",
    description: "이전 버전의 캐시를 정리하고 제어를 시작합니다.",
    detail:
      "activate 이벤트에서 오래된 캐시를 삭제합니다. clients.claim()을 호출하면 현재 열린 페이지도 즉시 제어할 수 있습니다.",
    activeStates: ["activating"],
  },
  {
    phase: "제어 중",
    status: "fetch 이벤트 대기",
    description: "스코프 내의 모든 네트워크 요청을 가로챌 수 있습니다.",
    detail:
      "페이지의 fetch, 이미지 로드, 스크립트 요청 등 모든 네트워크 요청에 대해 fetch 이벤트가 발생합니다. 캐시 응답, 네트워크 요청, 또는 커스텀 응답을 반환할 수 있습니다.",
    activeStates: ["activated", "controlling"],
  },
  {
    phase: "업데이트 감지",
    status: "바이트 비교",
    description: "브라우저가 SW 파일의 변경을 감지합니다.",
    detail:
      "탐색 시마다 SW 파일을 확인합니다. 1바이트라도 다르면 새 SW를 설치합니다. HTTP 캐시는 최대 24시간만 존중합니다.",
    activeStates: ["update-found"],
  },
  {
    phase: "새 SW 설치",
    status: "install (v2)",
    description: "새 SW가 설치되고, 기존 SW 옆에서 대기합니다.",
    detail:
      "새 SW의 install 이벤트가 발생합니다. 기존 SW는 여전히 활성 상태입니다. 새 SW는 기존 SW의 모든 클라이언트가 닫힐 때까지 대기합니다.",
    activeStates: ["installing-v2", "waiting-v2"],
  },
  {
    phase: "교체 완료",
    status: "activate (v2)",
    description: "기존 SW가 퇴역하고 새 SW가 제어를 인계받습니다.",
    detail:
      "모든 탭이 닫히고 다시 열리면 새 SW가 활성화됩니다. 이전 캐시를 정리하고 새로운 캐시 전략으로 동작합니다.",
    activeStates: ["activated-v2"],
  },
];

const allPhases = [
  { id: "register", label: "등록" },
  { id: "install", label: "설치" },
  { id: "wait", label: "대기" },
  { id: "activate", label: "활성화" },
  { id: "control", label: "제어" },
];

function PhaseBar({ currentStep }: { currentStep: number }) {
  const phaseIndex = Math.min(currentStep, allPhases.length - 1);

  return (
    <div className="mb-6 flex items-center gap-1">
      {allPhases.map((phase, i) => (
        <div key={phase.id} className="flex items-center gap-1">
          <div
            className={`flex h-8 items-center rounded px-3 text-xs font-medium transition-colors ${
              i < phaseIndex
                ? "bg-accent/20 text-accent"
                : i === phaseIndex
                  ? "bg-accent text-white"
                  : "bg-muted/10 text-muted"
            }`}
          >
            {phase.label}
          </div>
          {i < allPhases.length - 1 && (
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              className={`shrink-0 ${i < phaseIndex ? "text-accent/40" : "text-border"}`}
            >
              <polyline
                points="4,2 8,6 4,10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

export function SwLifecycle() {
  const rendered = steps.map((step, i) => (
    <div key={i}>
      <PhaseBar currentStep={i} />

      <div className="mb-4 flex items-baseline gap-3">
        <span className="rounded bg-accent/15 px-2 py-0.5 text-sm font-semibold text-accent">
          {step.phase}
        </span>
        <code className="text-xs text-muted">{step.status}</code>
      </div>

      <p className="mb-3 text-sm font-medium leading-relaxed">
        {step.description}
      </p>

      <div className="rounded bg-muted/5 border border-border px-4 py-3">
        <p className="text-sm leading-relaxed text-muted">{step.detail}</p>
      </div>

      {i === 2 && (
        <div className="mt-3 rounded border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
          <p className="text-sm leading-relaxed text-yellow-600 dark:text-yellow-400">
            <strong>왜 대기하는가?</strong> — 열려 있는 탭들이 구 버전 SW로
            동작 중입니다. 새 SW를 갑자기 활성화하면 구 버전 HTML + 새 캐시 전략이
            만나 불일치가 발생합니다.
          </p>
        </div>
      )}

      {i === 5 && (
        <div className="mt-3 rounded border border-blue-500/20 bg-blue-500/5 px-4 py-3">
          <p className="text-sm leading-relaxed text-blue-600 dark:text-blue-400">
            <strong>24시간 규칙</strong> — 브라우저는 SW 파일의 HTTP 캐시를 최대
            24시간만 존중합니다. 잘못된 캐시 설정으로 SW가 영원히 갇히는 것을
            방지합니다.
          </p>
        </div>
      )}
    </div>
  ));

  return <StepPlayer steps={rendered} />;
}
