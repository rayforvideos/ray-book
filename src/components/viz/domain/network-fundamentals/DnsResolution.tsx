"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DnsNode {
  label: string;
  sublabel: string;
  color: {
    bg: string;
    border: string;
    text: string;
    activeBg: string;
  };
}

interface DnsStep {
  phase: "query" | "response";
  activeNodeIdx: number;
  description: string;
  queryLabel?: string;
  responseLabel?: string;
}

/* ------------------------------------------------------------------ */
/*  DNS hierarchy nodes                                                */
/* ------------------------------------------------------------------ */

const nodes: DnsNode[] = [
  {
    label: "Browser Cache",
    sublabel: "로컬 DNS 캐시",
    color: {
      bg: "bg-sky-50 dark:bg-sky-950/40",
      border: "border-sky-400/50 dark:border-sky-500/40",
      text: "text-sky-700 dark:text-sky-300",
      activeBg: "bg-sky-100 dark:bg-sky-900/50",
    },
  },
  {
    label: "OS Cache",
    sublabel: "/etc/hosts, OS DNS cache",
    color: {
      bg: "bg-indigo-50 dark:bg-indigo-950/40",
      border: "border-indigo-400/50 dark:border-indigo-500/40",
      text: "text-indigo-700 dark:text-indigo-300",
      activeBg: "bg-indigo-100 dark:bg-indigo-900/50",
    },
  },
  {
    label: "Recursive Resolver",
    sublabel: "ISP / Public DNS (8.8.8.8)",
    color: {
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-400/50 dark:border-amber-500/40",
      text: "text-amber-700 dark:text-amber-300",
      activeBg: "bg-amber-100 dark:bg-amber-900/50",
    },
  },
  {
    label: "Root Name Server",
    sublabel: ". (13 root servers)",
    color: {
      bg: "bg-rose-50 dark:bg-rose-950/40",
      border: "border-rose-400/50 dark:border-rose-500/40",
      text: "text-rose-700 dark:text-rose-300",
      activeBg: "bg-rose-100 dark:bg-rose-900/50",
    },
  },
  {
    label: "TLD Name Server",
    sublabel: ".com, .org, .kr ...",
    color: {
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      border: "border-emerald-400/50 dark:border-emerald-500/40",
      text: "text-emerald-700 dark:text-emerald-300",
      activeBg: "bg-emerald-100 dark:bg-emerald-900/50",
    },
  },
  {
    label: "Authoritative NS",
    sublabel: "example.com의 네임서버",
    color: {
      bg: "bg-violet-50 dark:bg-violet-950/40",
      border: "border-violet-400/50 dark:border-violet-500/40",
      text: "text-violet-700 dark:text-violet-300",
      activeBg: "bg-violet-100 dark:bg-violet-900/50",
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Presets                                                            */
/* ------------------------------------------------------------------ */

const presets: Record<string, { steps: DnsStep[] }> = {
  basic: {
    steps: [
      {
        phase: "query",
        activeNodeIdx: 0,
        description:
          "사용자가 브라우저에 example.com을 입력합니다. 브라우저는 먼저 자신의 DNS 캐시를 확인합니다. 최근에 방문한 도메인이라면 여기서 IP 주소를 바로 찾을 수 있습니다.",
        queryLabel: "example.com의 IP는?",
      },
      {
        phase: "query",
        activeNodeIdx: 1,
        description:
          "브라우저 캐시에 없으면 OS 레벨 캐시를 확인합니다. /etc/hosts 파일과 OS DNS 캐시를 뒤집니다. hosts 파일에 직접 매핑을 추가하면 DNS 질의 없이 도메인을 해석할 수 있습니다.",
        queryLabel: "example.com의 IP는?",
      },
      {
        phase: "query",
        activeNodeIdx: 2,
        description:
          "로컬 캐시에도 없으면 재귀 리졸버 (Recursive Resolver) 에 질의합니다. 보통 ISP가 제공하거나, Google (8.8.8.8) / Cloudflare (1.1.1.1) 같은 공개 DNS를 사용합니다. 리졸버는 자체 캐시를 먼저 확인합니다.",
        queryLabel: "example.com의 IP는?",
      },
      {
        phase: "query",
        activeNodeIdx: 3,
        description:
          "재귀 리졸버의 캐시에도 없으면, 루트 네임서버에 질의합니다. 전 세계에 13개 루트 서버가 있으며, .com 도메인을 관리하는 TLD 서버의 주소를 알려줍니다.",
        queryLabel: "example.com은 어디서 관리하나요?",
        responseLabel: ".com TLD 서버 주소 응답",
      },
      {
        phase: "query",
        activeNodeIdx: 4,
        description:
          "루트 서버가 안내한 .com TLD 네임서버에 다시 질의합니다. TLD 서버는 example.com을 실제로 관리하는 권한 있는 네임서버 (Authoritative NS) 의 주소를 응답합니다.",
        queryLabel: "example.com의 네임서버는?",
        responseLabel: "ns1.example.com 주소 응답",
      },
      {
        phase: "query",
        activeNodeIdx: 5,
        description:
          "마지막으로 권한 있는 네임서버에 질의합니다. 이 서버가 example.com의 DNS 레코드를 직접 관리합니다. A 레코드에서 IP 주소 93.184.216.34를 찾아 응답합니다.",
        queryLabel: "example.com의 A 레코드는?",
        responseLabel: "93.184.216.34 (TTL: 3600)",
      },
      {
        phase: "response",
        activeNodeIdx: 2,
        description:
          "재귀 리졸버가 최종 IP 주소를 받습니다. 이 결과를 자체 캐시에 저장합니다. TTL (Time To Live) 값만큼 캐시를 유지하며, 같은 도메인의 다음 질의에 빠르게 응답할 수 있습니다.",
        responseLabel: "93.184.216.34 캐시 저장",
      },
      {
        phase: "response",
        activeNodeIdx: 0,
        description:
          "최종적으로 브라우저가 IP 주소 93.184.216.34를 받습니다. 브라우저는 이 IP를 로컬 캐시에 저장하고, TCP 연결을 시작합니다. 전체 과정은 보통 수십 밀리초 안에 완료됩니다.",
        responseLabel: "93.184.216.34 -> TCP 연결 시작",
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function NodeHierarchy({
  activeNodeIdx,
  phase,
  queryLabel,
  responseLabel,
}: {
  activeNodeIdx: number;
  phase: "query" | "response";
  queryLabel?: string;
  responseLabel?: string;
}) {
  return (
    <div className="w-full">
      <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
        DNS 계층
      </span>
      <div className="space-y-1">
        {nodes.map((node, idx) => {
          const isActive = idx === activeNodeIdx;
          const isVisited =
            phase === "query" ? idx < activeNodeIdx : idx > activeNodeIdx;

          return (
            <div key={idx} className="flex items-center gap-2">
              {/* Connector line */}
              <div className="flex w-4 shrink-0 flex-col items-center">
                {idx > 0 && (
                  <div
                    className={`h-1 w-px ${
                      isActive || isVisited
                        ? "bg-accent"
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
                      : "border-border bg-surface"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[0.6875rem] font-bold ${
                      isActive ? node.color.text : isVisited ? node.color.text : "text-muted/50"
                    }`}
                  >
                    {node.label}
                  </span>
                  {isActive && (
                    <span className="text-accent text-[0.625rem]">&#9668;</span>
                  )}
                </div>
                <span
                  className={`font-mono text-[0.5625rem] ${
                    isActive ? node.color.text : isVisited ? "text-muted/40" : "text-muted/30"
                  }`}
                >
                  {node.sublabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Query / Response labels */}
      <div className="mt-3 space-y-1">
        {queryLabel && (
          <div className="flex items-center gap-2">
            <span className="shrink-0 px-1.5 py-0.5 bg-sky-100 dark:bg-sky-900/60 font-mono text-[0.5625rem] font-bold text-sky-700 dark:text-sky-300">
              Q
            </span>
            <span className="text-[0.6875rem] text-muted">{queryLabel}</span>
          </div>
        )}
        {responseLabel && (
          <div className="flex items-center gap-2">
            <span className="shrink-0 px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 font-mono text-[0.5625rem] font-bold text-emerald-700 dark:text-emerald-300">
              A
            </span>
            <span className="text-[0.6875rem] text-muted">
              {responseLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface DnsResolutionProps {
  preset?: string;
}

export function DnsResolution({ preset = "basic" }: DnsResolutionProps) {
  const data = presets[preset] ?? presets["basic"];

  const stepNodes = data.steps.map((step, idx) => (
    <div key={idx} className="space-y-4">
      {/* Phase indicator */}
      <div className="flex items-center gap-2">
        <span
          className={`px-2 py-0.5 font-mono text-[0.5625rem] font-bold ${
            step.phase === "query"
              ? "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300"
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
          }`}
        >
          {step.phase === "query" ? "Query" : "Response"}
        </span>
        <span className="text-[0.625rem] text-muted">
          {nodes[step.activeNodeIdx].label}
        </span>
      </div>

      {/* Main content */}
      <NodeHierarchy
        activeNodeIdx={step.activeNodeIdx}
        phase={step.phase}
        queryLabel={step.queryLabel}
        responseLabel={step.responseLabel}
      />

      {/* Description */}
      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
