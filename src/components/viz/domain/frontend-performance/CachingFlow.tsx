"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ── Types ── */

interface Arrow {
  from: string;
  to: string;
  label: string;
  dashed?: boolean;
}

interface Preset {
  title: string;
  arrows: Arrow[];
  result: string;
  resultColor: string;
  latency: string;
  description: string;
}

/* ── Entity colors ── */

const entities = [
  {
    id: "client",
    label: "Client",
    color:
      "bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-600",
  },
  {
    id: "cache",
    label: "Cache",
    color:
      "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-600",
  },
  {
    id: "server",
    label: "Server",
    color:
      "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600",
  },
];

/* ── Presets ── */

const presets: Preset[] = [
  {
    title: "No cache — 매 요청마다 서버 왕복",
    arrows: [
      { from: "client", to: "cache", label: "요청" },
      { from: "cache", to: "server", label: "캐시 없음 → 전달", dashed: true },
      { from: "server", to: "cache", label: "200 OK + 데이터" },
      { from: "cache", to: "client", label: "응답 전달" },
    ],
    result: "매번 전체 응답을 다운로드",
    resultColor: "text-red-600 dark:text-red-400",
    latency: "100-500ms",
    description:
      "캐시가 없거나 Cache-Control: no-store가 설정된 경우입니다. 모든 요청이 서버까지 도달하고, 전체 응답 바디를 매번 전송합니다. 네트워크 지연과 서버 처리 시간이 모두 포함됩니다.",
  },
  {
    title: "HTTP cache hit — 즉시 반환",
    arrows: [
      { from: "client", to: "cache", label: "요청" },
      { from: "cache", to: "client", label: "max-age 유효 → 즉시 반환" },
    ],
    result: "네트워크 요청 없이 캐시에서 즉시 응답",
    resultColor: "text-emerald-600 dark:text-emerald-400",
    latency: "~0ms",
    description:
      "Cache-Control: max-age가 아직 유효하면 브라우저 캐시에서 즉시 응답합니다. 네트워크 요청이 전혀 발생하지 않으므로 가장 빠릅니다. 정적 자산에 긴 max-age와 immutable을 적용하면 이 경로를 최대한 활용합니다.",
  },
  {
    title: "Stale-while-revalidate — 캐시 반환 + 백그라운드 갱신",
    arrows: [
      { from: "client", to: "cache", label: "요청" },
      { from: "cache", to: "client", label: "stale 캐시 즉시 반환" },
      {
        from: "cache",
        to: "server",
        label: "백그라운드 재검증",
        dashed: true,
      },
      { from: "server", to: "cache", label: "200 → 캐시 갱신", dashed: true },
    ],
    result: "즉시 응답 + 백그라운드에서 최신 데이터로 갱신",
    resultColor: "text-amber-600 dark:text-amber-400",
    latency: "~0ms (사용자 체감)",
    description:
      "Cache-Control: max-age=60, stale-while-revalidate=3600 같은 설정입니다. 만료된 캐시를 즉시 반환하되, 백그라운드에서 서버에 재검증 요청을 보냅니다. 사용자는 즉시 응답을 받고, 다음 요청부터 갱신된 데이터를 사용합니다.",
  },
  {
    title: "Service Worker — 오프라인에서도 응답",
    arrows: [
      { from: "client", to: "cache", label: "요청 (fetch event)" },
      { from: "cache", to: "client", label: "SW 캐시에서 응답" },
    ],
    result: "오프라인에서도 캐시된 응답 제공",
    resultColor: "text-violet-600 dark:text-violet-400",
    latency: "~0ms (오프라인 가능)",
    description:
      "Service Worker가 fetch 이벤트를 가로채 Cache API에서 응답합니다. 네트워크 연결이 없어도 동작합니다. Cache First, Network First, Stale-While-Revalidate 등 프로그래밍 가능한 전략을 구현할 수 있습니다.",
  },
];

/* ── Sub-components ── */

function EntityBox({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <div
      className={`border px-3 py-2 text-center font-mono text-[0.75rem] font-medium ${color}`}
    >
      {label}
    </div>
  );
}

function ArrowRow({ arrow }: { arrow: Arrow }) {
  const fromIdx = entities.findIndex((e) => e.id === arrow.from);
  const toIdx = entities.findIndex((e) => e.id === arrow.to);
  const goingRight = toIdx > fromIdx;

  return (
    <div className="flex items-center gap-1 text-[0.6875rem]">
      {/* left spacer */}
      <div
        className="shrink-0"
        style={{ width: `${Math.min(fromIdx, toIdx) * 33 + 16}%` }}
      />
      {/* arrow line */}
      <div
        className={`flex items-center gap-1 ${
          arrow.dashed ? "opacity-60" : ""
        }`}
        style={{
          width: `${(Math.abs(toIdx - fromIdx) * 33)}%`,
        }}
      >
        {!goingRight && <span className="text-muted">←</span>}
        <div
          className={`flex-1 border-t ${
            arrow.dashed
              ? "border-dashed border-muted/50"
              : "border-text/40"
          }`}
        />
        <span className="shrink-0 px-1 text-muted font-mono text-[0.625rem]">
          {arrow.label}
        </span>
        <div
          className={`flex-1 border-t ${
            arrow.dashed
              ? "border-dashed border-muted/50"
              : "border-text/40"
          }`}
        />
        {goingRight && <span className="text-muted">→</span>}
      </div>
    </div>
  );
}

function SequenceDiagram({ arrows }: { arrows: Arrow[] }) {
  return (
    <div className="space-y-2">
      {/* Entity headers */}
      <div className="grid grid-cols-3 gap-4">
        {entities.map((e) => (
          <EntityBox key={e.id} label={e.label} color={e.color} />
        ))}
      </div>

      {/* Vertical lifelines indicator */}
      <div className="grid grid-cols-3 gap-4">
        {entities.map((e) => (
          <div
            key={e.id}
            className="h-1 mx-auto w-px border-l border-dashed border-muted/30"
          />
        ))}
      </div>

      {/* Arrows */}
      <div className="space-y-1.5">
        {arrows.map((arrow, i) => (
          <ArrowRow key={i} arrow={arrow} />
        ))}
      </div>
    </div>
  );
}

/* ── Main ── */

export function CachingFlow() {
  const stepNodes = presets.map((p, i) => (
    <div key={i} className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-2 py-0.5 font-mono text-[0.625rem] font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300">
          Step {i + 1}
        </span>
        <span className="text-[0.8125rem] font-medium text-text">
          {p.title}
        </span>
      </div>

      <SequenceDiagram arrows={p.arrows} />

      {/* Result summary */}
      <div className="flex items-center justify-between gap-2 bg-surface border border-border px-3 py-2">
        <span className={`font-mono text-[0.75rem] font-medium ${p.resultColor}`}>
          {p.result}
        </span>
        <span className="font-mono text-[0.6875rem] text-muted shrink-0">
          {p.latency}
        </span>
      </div>

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {p.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
