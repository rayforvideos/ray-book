"use client";

import { StepPlayer } from "../primitives/StepPlayer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface LayerInfo {
  name: string;
  protocol: string;
  headerLabel: string;
  color: {
    bg: string;
    border: string;
    text: string;
    headerBg: string;
  };
}

interface PacketStep {
  phase: "encapsulation" | "decapsulation";
  activeLayerIdx: number;
  headers: number[]; // indices of layers whose headers are visible
  description: string;
}

/* ------------------------------------------------------------------ */
/*  Layer definitions                                                   */
/* ------------------------------------------------------------------ */

const layers: LayerInfo[] = [
  {
    name: "Application",
    protocol: "HTTP, DNS, FTP",
    headerLabel: "HTTP Header",
    color: {
      bg: "bg-sky-50 dark:bg-sky-950/40",
      border: "border-sky-400/50 dark:border-sky-500/40",
      text: "text-sky-700 dark:text-sky-300",
      headerBg: "bg-sky-200 dark:bg-sky-800/60",
    },
  },
  {
    name: "Transport",
    protocol: "TCP, UDP",
    headerLabel: "TCP Header",
    color: {
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-400/50 dark:border-amber-500/40",
      text: "text-amber-700 dark:text-amber-300",
      headerBg: "bg-amber-200 dark:bg-amber-800/60",
    },
  },
  {
    name: "Internet",
    protocol: "IP, ICMP, ARP",
    headerLabel: "IP Header",
    color: {
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      border: "border-emerald-400/50 dark:border-emerald-500/40",
      text: "text-emerald-700 dark:text-emerald-300",
      headerBg: "bg-emerald-200 dark:bg-emerald-800/60",
    },
  },
  {
    name: "Network Access",
    protocol: "Ethernet, Wi-Fi",
    headerLabel: "Frame Header",
    color: {
      bg: "bg-violet-50 dark:bg-violet-950/40",
      border: "border-violet-400/50 dark:border-violet-500/40",
      text: "text-violet-700 dark:text-violet-300",
      headerBg: "bg-violet-200 dark:bg-violet-800/60",
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Presets                                                            */
/* ------------------------------------------------------------------ */

const presets: Record<string, { steps: PacketStep[] }> = {
  basic: {
    steps: [
      {
        phase: "encapsulation",
        activeLayerIdx: -1,
        headers: [],
        description:
          "사용자가 브라우저에서 URL을 입력합니다. 아직 네트워크 계층을 거치기 전, 순수한 데이터(Data)만 존재합니다.",
      },
      {
        phase: "encapsulation",
        activeLayerIdx: 0,
        headers: [0],
        description:
          "Application 계층: HTTP 프로토콜이 요청 메서드, URL, 헤더 등을 데이터 앞에 붙입니다. 이제 HTTP 메시지가 됩니다.",
      },
      {
        phase: "encapsulation",
        activeLayerIdx: 1,
        headers: [0, 1],
        description:
          "Transport 계층: TCP가 출발지/목적지 포트 번호, 시퀀스 번호, 체크섬 등을 추가합니다. 이 단위를 세그먼트(Segment)라 부릅니다.",
      },
      {
        phase: "encapsulation",
        activeLayerIdx: 2,
        headers: [0, 1, 2],
        description:
          "Internet 계층: IP가 출발지/목적지 IP 주소, TTL 등을 추가합니다. 이 단위를 패킷(Packet)이라 부릅니다. 라우터는 이 IP 주소를 보고 경로를 결정합니다.",
      },
      {
        phase: "encapsulation",
        activeLayerIdx: 3,
        headers: [0, 1, 2, 3],
        description:
          "Network Access 계층: Ethernet이 MAC 주소를 담은 프레임 헤더와 트레일러(FCS)를 추가합니다. 이 단위를 프레임(Frame)이라 부르며, 물리적 매체를 통해 전송됩니다.",
      },
      {
        phase: "decapsulation",
        activeLayerIdx: 3,
        headers: [0, 1, 2],
        description:
          "수신 측 Network Access 계층: 프레임 헤더를 제거하고 MAC 주소를 확인합니다. 데이터를 상위 계층으로 전달합니다.",
      },
      {
        phase: "decapsulation",
        activeLayerIdx: 2,
        headers: [0, 1],
        description:
          "수신 측 Internet 계층: IP 헤더를 제거하고 목적지 IP가 자신인지 확인합니다. 맞으면 상위 계층으로 전달합니다.",
      },
      {
        phase: "decapsulation",
        activeLayerIdx: 1,
        headers: [0],
        description:
          "수신 측 Transport 계층: TCP 헤더를 제거하고 포트 번호로 어떤 애플리케이션에 전달할지 결정합니다. 순서 보장, 재전송 처리도 이 계층에서 합니다.",
      },
      {
        phase: "decapsulation",
        activeLayerIdx: 0,
        headers: [],
        description:
          "수신 측 Application 계층: HTTP 헤더를 파싱하고 원본 데이터를 애플리케이션에 전달합니다. 서버는 요청을 처리하고 응답을 같은 과정으로 되돌려 보냅니다.",
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function PacketDiagram({
  headers,
  phase,
}: {
  headers: number[];
  phase: "encapsulation" | "decapsulation";
}) {
  // Build visible header segments (outermost first for display)
  const visibleHeaders = [...headers].reverse();

  return (
    <div className="w-full">
      <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
        {phase === "encapsulation" ? "송신 패킷" : "수신 패킷"}
      </span>
      <div className="flex items-center gap-0 overflow-x-auto">
        {visibleHeaders.map((layerIdx) => {
          const layer = layers[layerIdx];
          return (
            <div
              key={layerIdx}
              className={`shrink-0 px-2 py-1.5 font-mono text-[0.5625rem] font-bold transition-all duration-200 ${layer.color.headerBg} ${layer.color.text}`}
            >
              {layer.headerLabel}
            </div>
          );
        })}
        <div className="shrink-0 px-3 py-1.5 bg-stone-100 dark:bg-stone-800/60 font-mono text-[0.625rem] font-bold text-stone-600 dark:text-stone-300">
          Data
        </div>
        {/* Trailer for Network Access layer */}
        {headers.includes(3) && (
          <div
            className={`shrink-0 px-2 py-1.5 font-mono text-[0.5625rem] font-bold transition-all duration-200 ${layers[3].color.headerBg} ${layers[3].color.text}`}
          >
            FCS
          </div>
        )}
      </div>
    </div>
  );
}

function LayerStack({
  activeLayerIdx,
  phase,
}: {
  activeLayerIdx: number;
  phase: "encapsulation" | "decapsulation";
}) {
  return (
    <div className="w-full">
      <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
        {phase === "encapsulation" ? "송신 측" : "수신 측"} 계층
      </span>
      <div className="space-y-1">
        {layers.map((layer, idx) => {
          const isActive = idx === activeLayerIdx;
          return (
            <div
              key={idx}
              className={`flex items-center justify-between border p-2 transition-all duration-200 ${
                isActive
                  ? `${layer.color.border} ${layer.color.bg}`
                  : "border-border bg-surface"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-[0.6875rem] font-bold ${
                    isActive ? layer.color.text : "text-muted/50"
                  }`}
                >
                  {layer.name}
                </span>
                {isActive && (
                  <span className="text-accent text-[0.625rem]">◄</span>
                )}
              </div>
              <span
                className={`font-mono text-[0.5625rem] ${
                  isActive ? layer.color.text : "text-muted/30"
                }`}
              >
                {layer.protocol}
              </span>
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

interface TcpIpLayersProps {
  preset?: string;
}

export function TcpIpLayers({ preset = "basic" }: TcpIpLayersProps) {
  const data = presets[preset] ?? presets["basic"];

  const stepNodes = data.steps.map((step, idx) => (
    <div key={idx} className="space-y-4">
      {/* Phase indicator */}
      <div className="flex items-center gap-2">
        <span
          className={`px-2 py-0.5 font-mono text-[0.5625rem] font-bold ${
            step.phase === "encapsulation"
              ? "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300"
              : "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300"
          }`}
        >
          {step.phase === "encapsulation" ? "Encapsulation" : "Decapsulation"}
        </span>
        <span className="text-[0.625rem] text-muted">
          {step.activeLayerIdx >= 0
            ? layers[step.activeLayerIdx].name
            : "시작"}
        </span>
      </div>

      {/* Main content: layers + packet */}
      <div className="flex gap-4 max-sm:flex-col">
        <div className="flex-1 min-w-0">
          <LayerStack
            activeLayerIdx={step.activeLayerIdx}
            phase={step.phase}
          />
        </div>
        <div className="flex-1 min-w-0">
          <PacketDiagram headers={step.headers} phase={step.phase} />
        </div>
      </div>

      {/* Description */}
      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
