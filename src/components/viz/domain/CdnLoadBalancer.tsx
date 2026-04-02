"use client";

import { StepPlayer } from "../primitives/StepPlayer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface InfraNode {
  id: string;
  label: string;
  sublabel: string;
  color: {
    bg: string;
    border: string;
    text: string;
    activeBg: string;
  };
}

interface PathStep {
  activeNodeId: string;
  direction: "right" | "left" | "skip";
  badge: string;
  badgeColor: string;
  label: string;
  description: string;
}

/* ------------------------------------------------------------------ */
/*  Infra nodes                                                        */
/* ------------------------------------------------------------------ */

const infraNodes: InfraNode[] = [
  {
    id: "user",
    label: "User",
    sublabel: "GET /assets/hero.webp",
    color: {
      bg: "bg-sky-50 dark:bg-sky-950/40",
      border: "border-sky-400/50 dark:border-sky-500/40",
      text: "text-sky-700 dark:text-sky-300",
      activeBg: "bg-sky-100 dark:bg-sky-900/50",
    },
  },
  {
    id: "dns",
    label: "DNS (Anycast)",
    sublabel: "cdn.example.com -> nearest POP",
    color: {
      bg: "bg-indigo-50 dark:bg-indigo-950/40",
      border: "border-indigo-400/50 dark:border-indigo-500/40",
      text: "text-indigo-700 dark:text-indigo-300",
      activeBg: "bg-indigo-100 dark:bg-indigo-900/50",
    },
  },
  {
    id: "edge",
    label: "CDN Edge Server",
    sublabel: "POP: Seoul (ICN)",
    color: {
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      border: "border-emerald-400/50 dark:border-emerald-500/40",
      text: "text-emerald-700 dark:text-emerald-300",
      activeBg: "bg-emerald-100 dark:bg-emerald-900/50",
    },
  },
  {
    id: "shield",
    label: "Shield / Mid-tier Cache",
    sublabel: "Regional cache (Tokyo)",
    color: {
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-400/50 dark:border-amber-500/40",
      text: "text-amber-700 dark:text-amber-300",
      activeBg: "bg-amber-100 dark:bg-amber-900/50",
    },
  },
  {
    id: "lb",
    label: "Load Balancer",
    sublabel: "L7 reverse proxy",
    color: {
      bg: "bg-violet-50 dark:bg-violet-950/40",
      border: "border-violet-400/50 dark:border-violet-500/40",
      text: "text-violet-700 dark:text-violet-300",
      activeBg: "bg-violet-100 dark:bg-violet-900/50",
    },
  },
  {
    id: "origin",
    label: "Origin Server",
    sublabel: "us-east-1 (app + storage)",
    color: {
      bg: "bg-rose-50 dark:bg-rose-950/40",
      border: "border-rose-400/50 dark:border-rose-500/40",
      text: "text-rose-700 dark:text-rose-300",
      activeBg: "bg-rose-100 dark:bg-rose-900/50",
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Presets                                                            */
/* ------------------------------------------------------------------ */

const cacheMissSteps: PathStep[] = [
  {
    activeNodeId: "user",
    direction: "right",
    badge: "Request",
    badgeColor:
      "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300",
    label: "사용자 요청 시작",
    description:
      "사용자가 브라우저에서 cdn.example.com/assets/hero.webp를 요청합니다. 브라우저는 이 도메인의 IP 주소를 알아내기 위해 DNS 질의를 시작합니다.",
  },
  {
    activeNodeId: "dns",
    direction: "right",
    badge: "Anycast",
    badgeColor:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300",
    label: "Anycast DNS 응답",
    description:
      "DNS 서버가 Anycast 라우팅으로 사용자에게 가장 가까운 CDN POP (Point of Presence) 의 IP를 응답합니다. 동일한 IP 주소가 전 세계 여러 POP에서 광고되고, BGP 라우팅이 물리적으로 가장 가까운 POP으로 트래픽을 보냅니다.",
  },
  {
    activeNodeId: "edge",
    direction: "right",
    badge: "MISS",
    badgeColor:
      "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300",
    label: "에지 서버 캐시 미스",
    description:
      "요청이 서울 POP의 에지 서버에 도착합니다. 에지 서버가 로컬 캐시를 확인하지만, 해당 리소스가 없거나 TTL이 만료되어 캐시 미스가 발생합니다. 에지 서버는 상위 캐시 계층으로 요청을 전달합니다.",
  },
  {
    activeNodeId: "shield",
    direction: "right",
    badge: "MISS",
    badgeColor:
      "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300",
    label: "쉴드 캐시 미스",
    description:
      "쉴드 (Shield) 는 여러 에지 서버 앞단에 위치한 중간 캐시 계층입니다. 같은 리전의 에지 서버들이 동일 리소스를 오리진에 중복 요청하는 것을 방지합니다. 여기에서도 캐시 미스가 발생해 오리진으로 요청을 전달합니다.",
  },
  {
    activeNodeId: "lb",
    direction: "right",
    badge: "Route",
    badgeColor:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300",
    label: "로드밸런서 라우팅",
    description:
      "오리진 앞단의 L7 로드밸런서가 요청을 수신합니다. URL 경로 (/assets/*), Host 헤더, 쿠키 등 HTTP 정보를 분석해 적절한 백엔드 서버로 라우팅합니다. 여러 오리진 서버 중 가장 여유 있는 서버를 선택합니다.",
  },
  {
    activeNodeId: "origin",
    direction: "left",
    badge: "200 OK",
    badgeColor:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
    label: "오리진 응답",
    description:
      "오리진 서버가 리소스를 생성하거나 스토리지에서 읽어 응답합니다. 응답 헤더에 Cache-Control: public, max-age=31536000 을 포함해 CDN이 이 리소스를 캐시할 수 있도록 합니다.",
  },
  {
    activeNodeId: "edge",
    direction: "left",
    badge: "Cache + Respond",
    badgeColor:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
    label: "에지 캐시 저장 + 사용자 응답",
    description:
      "응답이 쉴드, 에지 서버를 거치며 각 계층에 캐시됩니다. 에지 서버가 사용자에게 최종 응답을 전달합니다. 이후 같은 POP의 다른 사용자가 동일 리소스를 요청하면 에지 캐시에서 바로 응답합니다.",
  },
];

const cacheHitSteps: PathStep[] = [
  {
    activeNodeId: "user",
    direction: "right",
    badge: "Request",
    badgeColor:
      "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300",
    label: "사용자 요청 시작",
    description:
      "다른 사용자가 동일한 리소스를 요청합니다. DNS Anycast가 마찬가지로 서울 POP의 에지 서버로 라우팅합니다.",
  },
  {
    activeNodeId: "dns",
    direction: "right",
    badge: "Anycast",
    badgeColor:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300",
    label: "Anycast DNS 응답",
    description:
      "Anycast DNS가 이전과 동일하게 가장 가까운 서울 POP의 IP를 반환합니다. DNS 캐시가 있다면 이 단계는 생략될 수 있습니다.",
  },
  {
    activeNodeId: "edge",
    direction: "skip",
    badge: "HIT",
    badgeColor:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
    label: "에지 캐시 히트 (shortcut)",
    description:
      "에지 서버의 로컬 캐시에 해당 리소스가 있고 TTL이 유효합니다. 쉴드, 로드밸런서, 오리진까지 갈 필요 없이 에지 서버가 바로 응답합니다. 이것이 CDN의 핵심 이점입니다. 오리진 서버의 부하를 줄이고, 사용자에게 수 밀리초 이내에 응답합니다.",
  },
  {
    activeNodeId: "user",
    direction: "left",
    badge: "200 OK (cached)",
    badgeColor:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
    label: "사용자 응답 완료",
    description:
      "사용자가 에지 서버에서 직접 응답을 받습니다. 응답 헤더에 X-Cache: HIT 또는 CF-Cache-Status: HIT 같은 헤더가 포함됩니다. 오리진 서버까지의 왕복이 생략되어 레이턴시가 크게 감소합니다.",
  },
];

const presets: Record<string, PathStep[]> = {
  "cache-miss": cacheMissSteps,
  "cache-hit": cacheHitSteps,
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function NodeStack({
  activeNodeId,
  direction,
}: {
  activeNodeId: string;
  direction: "right" | "left" | "skip";
}) {
  const activeIdx = infraNodes.findIndex((n) => n.id === activeNodeId);

  return (
    <div className="w-full">
      <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
        Request Path
      </span>
      <div className="space-y-1">
        {infraNodes.map((node, idx) => {
          const isActive = idx === activeIdx;
          const isVisited =
            direction === "left" ? idx > activeIdx : idx < activeIdx;
          const isSkipped =
            direction === "skip" && idx > activeIdx;

          return (
            <div key={node.id} className="flex items-center gap-2">
              {/* Connector */}
              <div className="flex w-4 shrink-0 flex-col items-center">
                {idx > 0 && (
                  <div
                    className={`h-1 w-px ${
                      isActive || isVisited
                        ? "bg-accent"
                        : isSkipped
                          ? "bg-border/30"
                          : "bg-border"
                    }`}
                  />
                )}
                <div
                  className={`h-2 w-2 rounded-full border transition-all duration-200 ${
                    isActive
                      ? `${node.color.border} ${node.color.activeBg} scale-125`
                      : isVisited
                        ? `${node.color.border} ${node.color.bg}`
                        : isSkipped
                          ? "border-border/30 bg-surface/50"
                          : "border-border bg-surface"
                  }`}
                />
              </div>

              {/* Node card */}
              <div
                className={`flex flex-1 items-center justify-between border p-2 transition-all duration-200 ${
                  isActive
                    ? `${node.color.border} ${node.color.activeBg}`
                    : isVisited
                      ? `${node.color.border} ${node.color.bg} opacity-60`
                      : isSkipped
                        ? "border-border/30 bg-surface/50 opacity-30"
                        : "border-border bg-surface"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[0.6875rem] font-bold ${
                      isActive
                        ? node.color.text
                        : isVisited
                          ? node.color.text
                          : isSkipped
                            ? "text-muted/30"
                            : "text-muted/50"
                    }`}
                  >
                    {node.label}
                  </span>
                  {isActive && (
                    <span className="text-accent text-[0.625rem]">
                      &#9668;
                    </span>
                  )}
                  {isSkipped && (
                    <span className="font-mono text-[0.5rem] text-muted/40">
                      skipped
                    </span>
                  )}
                </div>
                <span
                  className={`font-mono text-[0.5625rem] ${
                    isActive
                      ? node.color.text
                      : isVisited
                        ? "text-muted/40"
                        : "text-muted/30"
                  }`}
                >
                  {node.sublabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface CdnLoadBalancerProps {
  preset?: string;
}

export function CdnLoadBalancer({
  preset = "cache-miss",
}: CdnLoadBalancerProps) {
  const steps = presets[preset] ?? presets["cache-miss"];

  const stepNodes = steps.map((step, idx) => (
    <div key={idx} className="space-y-4">
      {/* Badge + label */}
      <div className="flex items-center gap-2">
        <span
          className={`px-2 py-0.5 font-mono text-[0.5625rem] font-bold ${step.badgeColor}`}
        >
          {step.badge}
        </span>
        <span className="text-[0.8125rem] font-bold text-text">
          {step.label}
        </span>
      </div>

      {/* Node stack */}
      <NodeStack
        activeNodeId={step.activeNodeId}
        direction={step.direction}
      />

      {/* Description */}
      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
