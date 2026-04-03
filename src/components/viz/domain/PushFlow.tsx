"use client";

import { StepPlayer } from "../primitives/StepPlayer";

interface PushStep {
  phase: string;
  actors: string[];
  description: string;
  detail: string;
}

const steps: PushStep[] = [
  {
    phase: "1. SW 등록",
    actors: ["클라이언트"],
    description: "페이지가 Service Worker를 등록합니다.",
    detail:
      "navigator.serviceWorker.register('/sw.js')로 SW를 등록합니다. Push를 받으려면 활성화된 SW가 필수입니다.",
  },
  {
    phase: "2. 권한 요청",
    actors: ["클라이언트", "사용자"],
    description: "사용자에게 알림 권한을 요청합니다.",
    detail:
      'Notification.requestPermission()을 호출합니다. 사용자가 "허용"을 선택해야 다음 단계로 진행할 수 있습니다. "거부" 시 코드로 재요청이 불가능합니다.',
  },
  {
    phase: "3. 구독 생성",
    actors: ["클라이언트", "푸시 서비스"],
    description: "브라우저가 푸시 서비스에 구독을 생성합니다.",
    detail:
      "pushManager.subscribe()를 호출하면 브라우저가 푸시 서비스(FCM, Mozilla Push Service 등)에 연결하고, 고유한 엔드포인트 URL과 암호화 키를 받습니다.",
  },
  {
    phase: "4. 구독 정보 전송",
    actors: ["클라이언트", "서버"],
    description: "구독 정보(엔드포인트, 키)를 앱 서버에 저장합니다.",
    detail:
      "subscription 객체를 서버의 API로 POST합니다. 서버는 이 정보를 DB에 저장해 두고, 나중에 Push를 보낼 때 사용합니다.",
  },
  {
    phase: "5. Push 전송",
    actors: ["서버", "푸시 서비스"],
    description: "서버가 푸시 서비스의 엔드포인트로 메시지를 보냅니다.",
    detail:
      "web-push 라이브러리로 VAPID 서명된 암호화 메시지를 푸시 서비스에 POST합니다. 푸시 서비스는 VAPID 서명을 검증하고 메시지를 대기열에 넣습니다.",
  },
  {
    phase: "6. 메시지 전달",
    actors: ["푸시 서비스", "브라우저"],
    description: "푸시 서비스가 브라우저에 메시지를 전달합니다.",
    detail:
      "브라우저가 온라인이면 즉시, 오프라인이면 온라인 복귀 시 전달합니다. 브라우저는 SW를 깨우고 push 이벤트를 발생시킵니다.",
  },
  {
    phase: "7. 알림 표시",
    actors: ["SW", "사용자"],
    description: "SW가 push 이벤트를 받아 알림을 표시합니다.",
    detail:
      "self.registration.showNotification()으로 OS 알림을 표시합니다. userVisibleOnly 약속에 따라 반드시 사용자에게 보이는 알림을 표시해야 합니다.",
  },
  {
    phase: "8. 알림 클릭",
    actors: ["사용자", "SW"],
    description: "사용자가 알림을 클릭하면 앱이 열립니다.",
    detail:
      "notificationclick 이벤트에서 clients.openWindow()로 페이지를 열거나, 이미 열린 탭에 focus()합니다. notification.data에 저장한 URL로 이동합니다.",
  },
];

function ActorBadges({ actors }: { actors: string[] }) {
  const colors: Record<string, string> = {
    클라이언트: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    서버: "bg-green-500/15 text-green-600 dark:text-green-400",
    "푸시 서비스": "bg-purple-500/15 text-purple-600 dark:text-purple-400",
    브라우저: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
    사용자: "bg-muted/15 text-muted",
    SW: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  };
  return (
    <div className="flex gap-1.5">
      {actors.map((a) => (
        <span
          key={a}
          className={`rounded px-1.5 py-0.5 text-xs font-medium ${colors[a] ?? "bg-muted/10 text-muted"}`}
        >
          {a}
        </span>
      ))}
    </div>
  );
}

export function PushFlow() {
  const rendered = steps.map((step, i) => (
    <div key={i}>
      <div className="mb-3 flex items-center gap-3">
        <span className="text-sm font-semibold text-accent">{step.phase}</span>
        <ActorBadges actors={step.actors} />
      </div>

      <p className="mb-3 text-sm font-medium leading-relaxed">
        {step.description}
      </p>

      <div className="rounded bg-muted/5 border border-border px-4 py-3">
        <p className="text-sm leading-relaxed text-muted">{step.detail}</p>
      </div>

      {i === 1 && (
        <div className="mt-3 rounded border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
          <p className="text-sm leading-relaxed text-yellow-600 dark:text-yellow-400">
            <strong>권한은 한 번뿐</strong> — 사용자가 &quot;거부&quot;하면
            코드로 재요청할 수 없습니다. 맥락이 있는 시점에 요청하세요.
          </p>
        </div>
      )}

      {i === 4 && (
        <div className="mt-3 rounded border border-blue-500/20 bg-blue-500/5 px-4 py-3">
          <p className="text-sm leading-relaxed text-blue-600 dark:text-blue-400">
            <strong>종단간 암호화</strong> — 메시지는 구독 시 교환한 키로
            암호화됩니다. 푸시 서비스(FCM 등)조차 내용을 읽을 수 없습니다.
          </p>
        </div>
      )}
    </div>
  ));

  return <StepPlayer steps={rendered} />;
}
