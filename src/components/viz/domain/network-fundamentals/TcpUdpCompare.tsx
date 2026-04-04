"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CompareStep {
  title: string;
  tcp: {
    label: string;
    packets: PacketInfo[];
    description: string;
  };
  udp: {
    label: string;
    packets: PacketInfo[];
    description: string;
  };
  summary: string;
}

interface PacketInfo {
  from: "client" | "server";
  label: string;
  status: "success" | "pending" | "none";
}

/* ------------------------------------------------------------------ */
/*  Color tokens                                                       */
/* ------------------------------------------------------------------ */

const tcpColor = {
  bg: "bg-sky-50 dark:bg-sky-950/40",
  border: "border-sky-400/50 dark:border-sky-500/40",
  text: "text-sky-700 dark:text-sky-300",
  badge: "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300",
  packetBg: "bg-sky-100 dark:bg-sky-900/50",
};

const udpColor = {
  bg: "bg-amber-50 dark:bg-amber-950/40",
  border: "border-amber-400/50 dark:border-amber-500/40",
  text: "text-amber-700 dark:text-amber-300",
  badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
  packetBg: "bg-amber-100 dark:bg-amber-900/50",
};

/* ------------------------------------------------------------------ */
/*  Steps                                                              */
/* ------------------------------------------------------------------ */

const presets: Record<string, { steps: CompareStep[] }> = {
  basic: {
    steps: [
      {
        title: "연결 수립 (Connection Setup)",
        tcp: {
          label: "3-way Handshake",
          packets: [
            { from: "client", label: "SYN", status: "success" },
            { from: "server", label: "SYN-ACK", status: "success" },
            { from: "client", label: "ACK", status: "success" },
          ],
          description:
            "TCP는 데이터 전송 전 반드시 연결을 수립합니다. 클라이언트가 SYN을 보내고, 서버가 SYN-ACK로 응답하면, 클라이언트가 ACK로 확인합니다. 3번의 패킷 교환이 필요합니다.",
        },
        udp: {
          label: "연결 없음",
          packets: [],
          description:
            "UDP는 연결 수립 과정이 없습니다. 별도의 핸드셰이크 없이 바로 데이터를 전송할 수 있어 초기 지연이 0입니다.",
        },
        summary:
          "TCP는 안정적인 연결을 먼저 확보하고, UDP는 즉시 전송을 시작합니다.",
      },
      {
        title: "데이터 전송 (Data Transfer)",
        tcp: {
          label: "순서 보장 + ACK",
          packets: [
            { from: "client", label: "SEQ 1: Data", status: "success" },
            { from: "server", label: "ACK 2", status: "success" },
            { from: "client", label: "SEQ 2: Data", status: "success" },
            { from: "server", label: "ACK 3", status: "success" },
            { from: "client", label: "SEQ 3: Data", status: "success" },
            { from: "server", label: "ACK 4", status: "success" },
          ],
          description:
            "TCP는 각 세그먼트에 시퀀스 번호를 부여하고, 수신 측은 ACK로 수신을 확인합니다. 패킷이 유실되면 재전송하고, 순서가 바뀌면 재정렬합니다.",
        },
        udp: {
          label: "Fire-and-Forget",
          packets: [
            { from: "client", label: "Data 1", status: "success" },
            { from: "client", label: "Data 2", status: "success" },
            { from: "client", label: "Data 3", status: "none" },
          ],
          description:
            "UDP는 데이터를 보내고 잊습니다. ACK가 없으므로 패킷이 도착했는지 알 수 없고, 순서 보장도 없습니다. 하지만 오버헤드가 적어 빠릅니다.",
        },
        summary:
          "TCP는 모든 데이터의 도착을 보장하고, UDP는 속도를 위해 보장을 포기합니다.",
      },
      {
        title: "패킷 유실 시 (Packet Loss)",
        tcp: {
          label: "재전송 (Retransmission)",
          packets: [
            { from: "client", label: "SEQ 2: Data", status: "none" },
            { from: "server", label: "ACK 2 (중복)", status: "pending" },
            { from: "client", label: "SEQ 2: 재전송", status: "success" },
            { from: "server", label: "ACK 3", status: "success" },
          ],
          description:
            "패킷이 유실되면 수신 측이 중복 ACK를 보내거나, 타임아웃이 발생합니다. 송신 측은 유실된 세그먼트를 재전송하여 신뢰성을 보장합니다.",
        },
        udp: {
          label: "유실 무시",
          packets: [
            { from: "client", label: "Data 2", status: "none" },
          ],
          description:
            "UDP는 패킷이 유실되어도 아무런 조치를 취하지 않습니다. 유실 감지 자체가 프로토콜 수준에서 제공되지 않으며, 필요하면 애플리케이션이 직접 처리해야 합니다.",
        },
        summary:
          "TCP는 프로토콜 수준에서 유실을 복구하고, UDP는 애플리케이션에 맡깁니다.",
      },
      {
        title: "흐름 제어 (Flow Control)",
        tcp: {
          label: "슬라이딩 윈도우",
          packets: [
            { from: "server", label: "Window: 3", status: "success" },
            { from: "client", label: "SEQ 1~3 전송", status: "success" },
            { from: "server", label: "ACK + Window: 5", status: "success" },
            { from: "client", label: "SEQ 4~8 전송", status: "success" },
          ],
          description:
            "TCP는 수신 측이 처리할 수 있는 양만큼만 전송합니다. 수신 윈도우 크기를 알려주고, 송신 측은 이 범위 내에서만 데이터를 보냅니다. 수신 버퍼가 여유로워지면 윈도우가 확장됩니다.",
        },
        udp: {
          label: "흐름 제어 없음",
          packets: [
            { from: "client", label: "Data 1~10 한꺼번에", status: "success" },
          ],
          description:
            "UDP는 수신 측의 처리 능력을 고려하지 않습니다. 송신 측이 원하는 속도로 전송하므로, 수신 측의 버퍼가 넘치면 패킷이 폐기됩니다.",
        },
        summary:
          "TCP는 수신 측 상황에 맞춰 전송 속도를 조절하고, UDP는 제한 없이 전송합니다.",
      },
      {
        title: "혼잡 제어 (Congestion Control)",
        tcp: {
          label: "Slow Start / AIMD",
          packets: [
            { from: "client", label: "cwnd: 1 (시작)", status: "success" },
            { from: "client", label: "cwnd: 2 (증가)", status: "success" },
            { from: "client", label: "cwnd: 4 (지수 증가)", status: "success" },
            { from: "client", label: "유실 감지 -> cwnd 절반", status: "pending" },
          ],
          description:
            "TCP는 네트워크 혼잡을 감지하면 전송 속도를 줄입니다. Slow Start로 시작해 지수적으로 증가하다가, 혼잡이 감지되면 윈도우를 절반으로 줄이는 AIMD (Additive Increase, Multiplicative Decrease) 방식을 사용합니다.",
        },
        udp: {
          label: "혼잡 제어 없음",
          packets: [
            { from: "client", label: "일정 속도로 전송", status: "success" },
          ],
          description:
            "UDP는 네트워크 혼잡을 고려하지 않습니다. 네트워크가 혼잡해도 전송 속도를 줄이지 않으므로, 다른 TCP 연결에 영향을 줄 수 있습니다. QUIC 같은 UDP 기반 프로토콜은 자체적으로 혼잡 제어를 구현합니다.",
        },
        summary:
          "TCP는 네트워크 전체를 배려하는 혼잡 제어를 수행하고, UDP는 관여하지 않습니다.",
      },
      {
        title: "연결 종료 (Connection Teardown)",
        tcp: {
          label: "4-way Handshake",
          packets: [
            { from: "client", label: "FIN", status: "success" },
            { from: "server", label: "ACK", status: "success" },
            { from: "server", label: "FIN", status: "success" },
            { from: "client", label: "ACK", status: "success" },
          ],
          description:
            "TCP는 연결을 정리하기 위해 4-way handshake를 수행합니다. 양쪽 모두 FIN을 보내고 ACK를 받아야 연결이 완전히 종료됩니다. 이 과정에서 미전송 데이터가 안전하게 처리됩니다.",
        },
        udp: {
          label: "종료 없음",
          packets: [],
          description:
            "UDP는 연결 자체가 없으므로 종료 과정도 없습니다. 마지막 데이터그램을 보낸 후 아무 절차 없이 통신이 끝납니다.",
        },
        summary:
          "TCP는 양쪽이 합의하여 연결을 정리하고, UDP는 그냥 멈춥니다.",
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function Arrow({ from }: { from: "client" | "server" }) {
  return (
    <span className="text-[0.625rem] text-muted select-none">
      {from === "client" ? "-->" : "<--"}
    </span>
  );
}

function PacketRow({ packet }: { packet: PacketInfo }) {
  const statusStyle =
    packet.status === "success"
      ? "text-emerald-600 dark:text-emerald-400"
      : packet.status === "pending"
        ? "text-amber-600 dark:text-amber-400"
        : "text-rose-500 dark:text-rose-400 line-through";

  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="w-10 shrink-0 text-[0.5625rem] font-mono text-muted">
        {packet.from === "client" ? "Client" : "Server"}
      </span>
      <Arrow from={packet.from} />
      <span className={`font-mono text-[0.6875rem] font-medium ${statusStyle}`}>
        {packet.label}
      </span>
    </div>
  );
}

function ProtocolPanel({
  side,
  label,
  packets,
  description,
  color,
}: {
  side: "TCP" | "UDP";
  label: string;
  packets: PacketInfo[];
  description: string;
  color: typeof tcpColor;
}) {
  return (
    <div className={`flex-1 min-w-0 border ${color.border} ${color.bg} p-3`}>
      {/* Header */}
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`px-2 py-0.5 font-mono text-[0.625rem] font-bold ${color.badge}`}
        >
          {side}
        </span>
        <span className={`text-[0.6875rem] font-medium ${color.text}`}>
          {label}
        </span>
      </div>

      {/* Packets */}
      {packets.length > 0 ? (
        <div className="mb-2 space-y-0.5 border-b border-border/50 pb-2">
          {packets.map((pkt, i) => (
            <PacketRow key={i} packet={pkt} />
          ))}
        </div>
      ) : (
        <div className="mb-2 border-b border-border/50 pb-2 text-[0.6875rem] text-muted/60 italic">
          (패킷 교환 없음)
        </div>
      )}

      {/* Description */}
      <p className="text-[0.75rem] leading-relaxed text-muted">{description}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface TcpUdpCompareProps {
  preset?: string;
}

export function TcpUdpCompare({ preset = "basic" }: TcpUdpCompareProps) {
  const data = presets[preset] ?? presets["basic"];

  const stepNodes = data.steps.map((step, idx) => (
    <div key={idx} className="space-y-3">
      {/* Step title */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[0.625rem] font-bold text-accent">
          {String(idx + 1).padStart(2, "0")}
        </span>
        <span className="text-[0.8125rem] font-bold text-text">
          {step.title}
        </span>
      </div>

      {/* Side-by-side panels */}
      <div className="flex gap-3 max-sm:flex-col">
        <ProtocolPanel
          side="TCP"
          label={step.tcp.label}
          packets={step.tcp.packets}
          description={step.tcp.description}
          color={tcpColor}
        />
        <ProtocolPanel
          side="UDP"
          label={step.udp.label}
          packets={step.udp.packets}
          description={step.udp.description}
          color={udpColor}
        />
      </div>

      {/* Summary */}
      <div className="border-t border-border pt-2 text-[0.8125rem] leading-relaxed text-muted">
        {step.summary}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
