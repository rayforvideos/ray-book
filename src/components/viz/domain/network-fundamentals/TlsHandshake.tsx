"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TlsPhase =
  | "init"
  | "client-hello"
  | "server-hello"
  | "key-exchange"
  | "encrypted"
  | "complete";

interface TlsStep {
  phase: TlsPhase;
  direction: "right" | "left" | "both" | "none";
  client: string;
  server: string;
  description: string;
}

/* ------------------------------------------------------------------ */
/*  Phase styles                                                       */
/* ------------------------------------------------------------------ */

const phaseStyles: Record<
  TlsPhase,
  { label: string; bg: string; text: string }
> = {
  init: {
    label: "TCP 연결",
    bg: "bg-stone-100 dark:bg-stone-800/40",
    text: "text-stone-700 dark:text-stone-200",
  },
  "client-hello": {
    label: "ClientHello",
    bg: "bg-sky-50 dark:bg-sky-950/40",
    text: "text-sky-900 dark:text-sky-100",
  },
  "server-hello": {
    label: "ServerHello + Certificate",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-900 dark:text-emerald-100",
  },
  "key-exchange": {
    label: "Key Exchange",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-900 dark:text-amber-100",
  },
  encrypted: {
    label: "Encrypted Data",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-900 dark:text-violet-100",
  },
  complete: {
    label: "Handshake 완료",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-900 dark:text-emerald-100",
  },
};

/* ------------------------------------------------------------------ */
/*  Steps (TLS 1.3 — 1-RTT handshake per RFC 8446)                    */
/* ------------------------------------------------------------------ */

const steps: TlsStep[] = [
  {
    phase: "init",
    direction: "both",
    client: "TCP SYN\nTCP SYN-ACK\nTCP ACK",
    server: "TCP 3-way handshake 완료\n포트 443 연결 수립",
    description:
      "TLS 핸드셰이크에 앞서 TCP 3-way handshake로 연결을 수립합니다. HTTPS는 기본 포트 443을 사용합니다.",
  },
  {
    phase: "client-hello",
    direction: "right",
    client:
      "ClientHello\n- TLS 버전: 1.3\n- 지원 cipher suites:\n  TLS_AES_256_GCM_SHA384\n  TLS_AES_128_GCM_SHA256\n  TLS_CHACHA20_POLY1305_SHA256\n- 클라이언트 랜덤 (32 bytes)\n- key_share: ECDHE 공개키\n- supported_groups: x25519, P-256\n- signature_algorithms: ECDSA, RSA-PSS\n- SNI: example.com",
    server: "",
    description:
      "클라이언트가 지원하는 암호화 스위트, TLS 버전, ECDHE 공개키를 서버에 보냅니다. TLS 1.3에서는 key_share 확장을 통해 첫 메시지에서 바로 키 교환을 시작합니다. SNI (Server Name Indication) 로 접속할 도메인을 알려줍니다.",
  },
  {
    phase: "server-hello",
    direction: "left",
    client: "",
    server:
      "ServerHello\n- 선택 cipher suite:\n  TLS_AES_256_GCM_SHA384\n- 서버 랜덤 (32 bytes)\n- key_share: ECDHE 공개키\n\nEncryptedExtensions\n\nCertificate\n- 서버 인증서 (example.com)\n- 중간 CA 인증서\n\nCertificateVerify\n- 핸드셰이크 서명 (ECDSA)\n\nFinished\n- 핸드셰이크 MAC 검증",
    description:
      "서버가 cipher suite를 선택하고, 자신의 ECDHE 공개키와 인증서를 보냅니다. TLS 1.3에서는 ServerHello 이후 메시지가 이미 암호화됩니다. CertificateVerify로 서버가 인증서의 실제 소유자임을 증명합니다.",
  },
  {
    phase: "key-exchange",
    direction: "right",
    client:
      "Finished\n- 핸드셰이크 MAC 검증\n\n[양쪽 모두 마스터 시크릿 계산 완료]\n- ECDHE 공유 비밀\n  + HKDF로 세션 키 유도\n- 클라이언트 write key\n- 서버 write key",
    server: "",
    description:
      "클라이언트가 서버의 인증서를 검증하고 Finished 메시지를 보냅니다. 양쪽 모두 ECDHE 공유 비밀로부터 HKDF를 사용해 동일한 세션 키를 유도합니다. 이 시점에서 1-RTT 핸드셰이크가 완료됩니다.",
  },
  {
    phase: "encrypted",
    direction: "both",
    client:
      "GET / HTTP/1.1\nHost: example.com\n\n(AES-256-GCM으로 암호화)",
    server:
      "HTTP/1.1 200 OK\nContent-Type: text/html\n\n(AES-256-GCM으로 암호화)",
    description:
      "핸드셰이크 완료 후 모든 애플리케이션 데이터는 합의된 대칭 키 (AES-256-GCM) 로 암호화됩니다. 각 방향마다 별도의 키를 사용하고, 레코드마다 고유한 nonce를 적용합니다.",
  },
  {
    phase: "complete",
    direction: "none",
    client:
      "보안 속성 확인:\n- 인증서 유효성 (CA 서명)\n- 도메인 일치 (SNI)\n- 완전 순방향 비밀성 (PFS)\n- AEAD 암호화",
    server:
      "세션 정보:\n- TLS 1.3\n- TLS_AES_256_GCM_SHA384\n- x25519 (ECDHE)\n- 유효 기간: 인증서 TTL\n- 0-RTT 재개 가능 (PSK)",
    description:
      "TLS 1.3 핸드셰이크가 단 1-RTT만에 완료되었습니다. 이전 TLS 1.2가 2-RTT 필요했던 것에 비해 지연이 줄었습니다. 세션 재개 시 0-RTT (Early Data) 도 가능하지만, 재전송 공격 위험이 있어 안전한 요청에만 사용합니다.",
  },
];

/* ------------------------------------------------------------------ */
/*  Arrow indicator                                                    */
/* ------------------------------------------------------------------ */

function DirectionArrow({ direction }: { direction: TlsStep["direction"] }) {
  if (direction === "none") return null;

  const arrows: Record<string, string> = {
    right: "Client  --->  Server",
    left: "Client  <---  Server",
    both: "Client  <-->  Server",
  };

  return (
    <div className="flex justify-center py-1">
      <span className="font-mono text-[0.625rem] tracking-widest text-accent">
        {arrows[direction]}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface TlsHandshakeProps {
  preset?: string;
}

export function TlsHandshake({ preset: _preset }: TlsHandshakeProps) {
  void _preset;

  const stepNodes = steps.map((step, idx) => {
    const ps = phaseStyles[step.phase];
    return (
      <div key={idx} className="space-y-3">
        {/* Phase badge */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-block px-2 py-0.5 font-mono text-[0.6875rem] font-bold ${ps.bg} ${ps.text}`}
          >
            {ps.label}
          </span>
          <span className="text-[0.625rem] text-muted">
            Step {idx + 1} / {steps.length}
          </span>
        </div>

        {/* Direction arrow */}
        <DirectionArrow direction={step.direction} />

        {/* Two-column layout: Client / Server */}
        <div className="flex gap-3 max-sm:flex-col">
          {step.client && (
            <div className="flex-1 min-w-0">
              <span className="mb-1 block text-[0.6875rem] uppercase tracking-wider text-muted">
                Client
              </span>
              <pre className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 p-2.5 font-mono text-[0.5625rem] leading-relaxed text-text overflow-x-auto whitespace-pre">
                {step.client}
              </pre>
            </div>
          )}
          {step.server && (
            <div className="flex-1 min-w-0">
              <span className="mb-1 block text-[0.6875rem] uppercase tracking-wider text-muted">
                Server
              </span>
              <pre className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-2.5 font-mono text-[0.5625rem] leading-relaxed text-text overflow-x-auto whitespace-pre">
                {step.server}
              </pre>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
          {step.description}
        </div>
      </div>
    );
  });

  return <StepPlayer steps={stepNodes} />;
}
