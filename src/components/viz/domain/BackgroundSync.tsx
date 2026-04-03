"use client";

import { StepPlayer } from "../primitives/StepPlayer";

interface SyncStep {
  phase: string;
  state: "online" | "offline" | "recovering";
  description: string;
  detail: string;
}

const steps: SyncStep[] = [
  {
    phase: "1. 사용자 행동",
    state: "online",
    description: "사용자가 댓글을 작성하고 전송 버튼을 누릅니다.",
    detail:
      "fetch('/api/comments', { method: 'POST', ... })를 호출합니다. 온라인이면 정상적으로 전송됩니다.",
  },
  {
    phase: "2. 네트워크 실패",
    state: "offline",
    description: "터널 진입 — 네트워크가 끊어져 fetch가 실패합니다.",
    detail:
      "fetch()가 reject됩니다. 기존 방식이라면 사용자에게 에러를 표시하고 끝입니다.",
  },
  {
    phase: "3. Outbox 저장",
    state: "offline",
    description: "실패한 요청을 IndexedDB의 outbox에 저장합니다.",
    detail:
      "댓글 데이터를 IndexedDB에 저장합니다. localStorage가 아닌 IndexedDB를 사용하는 이유는 SW에서 접근할 수 있는 유일한 영속 저장소이기 때문입니다.",
  },
  {
    phase: "4. Sync 등록",
    state: "offline",
    description: "registration.sync.register('sync-comments')를 호출합니다.",
    detail:
      '브라우저에 "네트워크가 복구되면 sync-comments 태그로 SW를 깨워달라"고 등록합니다. 사용자에게 "온라인 복귀 시 자동 전송됩니다" 메시지를 표시합니다.',
  },
  {
    phase: "5. 네트워크 복구",
    state: "recovering",
    description: "터널을 벗어나 네트워크가 연결됩니다.",
    detail:
      "브라우저가 네트워크 상태 변화를 감지합니다. 등록된 sync 태그가 있으면 SW를 깨웁니다.",
  },
  {
    phase: "6. SW sync 이벤트",
    state: "recovering",
    description: "SW가 sync 이벤트를 받아 outbox의 작업을 처리합니다.",
    detail:
      "IndexedDB에서 보류 중인 댓글을 꺼내고, fetch로 서버에 전송합니다. 성공하면 outbox에서 삭제합니다. waitUntil()의 Promise가 거부되면 브라우저가 나중에 재시도합니다.",
  },
  {
    phase: "7. 동기화 완료",
    state: "online",
    description: "보류 중이던 댓글이 서버에 성공적으로 전송되었습니다.",
    detail:
      "사용자는 앱을 열지 않은 상태에서도 댓글이 자동으로 전송되었습니다. 다음에 앱을 열면 댓글이 이미 게시되어 있습니다.",
  },
];

const stateColors = {
  online: "bg-green-500/15 text-green-600 dark:text-green-400",
  offline: "bg-red-500/15 text-red-600 dark:text-red-400",
  recovering: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
};

const stateLabels = {
  online: "온라인",
  offline: "오프라인",
  recovering: "복구 중",
};

export function BackgroundSync() {
  const rendered = steps.map((step, i) => (
    <div key={i}>
      <div className="mb-3 flex items-center gap-3">
        <span className="text-sm font-semibold text-accent">{step.phase}</span>
        <span
          className={`rounded px-1.5 py-0.5 text-xs font-medium ${stateColors[step.state]}`}
        >
          {stateLabels[step.state]}
        </span>
      </div>

      <p className="mb-3 text-sm font-medium leading-relaxed">
        {step.description}
      </p>

      <div className="rounded bg-muted/5 border border-border px-4 py-3">
        <p className="text-sm leading-relaxed text-muted">{step.detail}</p>
      </div>

      {i === 3 && (
        <div className="mt-3 rounded border border-blue-500/20 bg-blue-500/5 px-4 py-3">
          <p className="text-sm leading-relaxed text-blue-600 dark:text-blue-400">
            <strong>핵심 패턴: Outbox</strong> — 실패한 요청을 로컬 DB에
            저장하고, 네트워크 복구 시 꺼내서 재시도합니다. 메시지 큐와 같은
            원리입니다.
          </p>
        </div>
      )}
    </div>
  ));

  return <StepPlayer steps={rendered} />;
}
