"use client";

import { StepPlayer } from "../primitives/StepPlayer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface RequestBlock {
  id: string;
  label: string;
  color: string;
  startMs: number;
  durationMs: number;
  type: "request" | "response" | "blocked" | "push";
}

interface ConnectionLane {
  label: string;
  requests: RequestBlock[];
}

interface TimelineStep {
  title: string;
  description: string;
  connections: ConnectionLane[];
  totalMs: number;
  annotation?: string;
}

/* ------------------------------------------------------------------ */
/*  Color tokens                                                       */
/* ------------------------------------------------------------------ */

const reqColors = {
  html: {
    req: "bg-sky-400 dark:bg-sky-500",
    res: "bg-sky-200 dark:bg-sky-700",
  },
  css: {
    req: "bg-emerald-400 dark:bg-emerald-500",
    res: "bg-emerald-200 dark:bg-emerald-700",
  },
  js: {
    req: "bg-amber-400 dark:bg-amber-500",
    res: "bg-amber-200 dark:bg-amber-700",
  },
  img: {
    req: "bg-violet-400 dark:bg-violet-500",
    res: "bg-violet-200 dark:bg-violet-700",
  },
  font: {
    req: "bg-rose-400 dark:bg-rose-500",
    res: "bg-rose-200 dark:bg-rose-700",
  },
  api: {
    req: "bg-orange-400 dark:bg-orange-500",
    res: "bg-orange-200 dark:bg-orange-700",
  },
};

const blockedColor = "bg-rose-100 dark:bg-rose-900/40";
const pushColor = "bg-teal-300 dark:bg-teal-600";

/* ------------------------------------------------------------------ */
/*  Presets                                                            */
/* ------------------------------------------------------------------ */

const http1Steps: TimelineStep[] = [
  {
    title: "HTTP/1.1 — 순차 요청 (단일 연결)",
    description:
      "HTTP/1.1은 하나의 TCP 연결에서 한 번에 하나의 요청-응답만 처리합니다. 앞선 응답이 끝나야 다음 요청을 보낼 수 있습니다. 이를 Head-of-Line (HOL) blocking이라고 합니다.",
    totalMs: 600,
    connections: [
      {
        label: "TCP 연결 1",
        requests: [
          { id: "html", label: "GET index.html", color: reqColors.html.req, startMs: 0, durationMs: 40, type: "request" },
          { id: "html-r", label: "200 HTML", color: reqColors.html.res, startMs: 40, durationMs: 60, type: "response" },
          { id: "css", label: "GET style.css", color: reqColors.css.req, startMs: 100, durationMs: 40, type: "request" },
          { id: "css-r", label: "200 CSS", color: reqColors.css.res, startMs: 140, durationMs: 80, type: "response" },
          { id: "js", label: "GET app.js", color: reqColors.js.req, startMs: 220, durationMs: 40, type: "request" },
          { id: "js-r", label: "200 JS", color: reqColors.js.res, startMs: 260, durationMs: 120, type: "response" },
          { id: "img", label: "GET hero.png", color: reqColors.img.req, startMs: 380, durationMs: 40, type: "request" },
          { id: "img-r", label: "200 IMG", color: reqColors.img.res, startMs: 420, durationMs: 150, type: "response" },
        ],
      },
    ],
    annotation: "총 소요: ~570ms — 리소스가 직렬로 대기합니다",
  },
  {
    title: "HTTP/1.1 — 병렬 연결 (브라우저 우회)",
    description:
      "브라우저는 HOL blocking을 우회하기 위해 도메인당 6개의 TCP 연결을 동시에 엽니다. 하지만 각 연결마다 TCP 핸드셰이크 + TLS 핸드셰이크 비용이 발생합니다.",
    totalMs: 400,
    connections: [
      {
        label: "TCP 연결 1",
        requests: [
          { id: "html", label: "GET index.html", color: reqColors.html.req, startMs: 0, durationMs: 30, type: "request" },
          { id: "html-r", label: "200 HTML", color: reqColors.html.res, startMs: 30, durationMs: 60, type: "response" },
          { id: "img", label: "GET hero.png", color: reqColors.img.req, startMs: 90, durationMs: 30, type: "request" },
          { id: "img-r", label: "200 IMG", color: reqColors.img.res, startMs: 120, durationMs: 150, type: "response" },
        ],
      },
      {
        label: "TCP 연결 2",
        requests: [
          { id: "css", label: "GET style.css", color: reqColors.css.req, startMs: 0, durationMs: 30, type: "request" },
          { id: "css-r", label: "200 CSS", color: reqColors.css.res, startMs: 30, durationMs: 80, type: "response" },
          { id: "font", label: "GET font.woff2", color: reqColors.font.req, startMs: 110, durationMs: 30, type: "request" },
          { id: "font-r", label: "200 FONT", color: reqColors.font.res, startMs: 140, durationMs: 100, type: "response" },
        ],
      },
      {
        label: "TCP 연결 3",
        requests: [
          { id: "js", label: "GET app.js", color: reqColors.js.req, startMs: 0, durationMs: 30, type: "request" },
          { id: "js-r", label: "200 JS", color: reqColors.js.res, startMs: 30, durationMs: 120, type: "response" },
          { id: "api", label: "GET /api/data", color: reqColors.api.req, startMs: 150, durationMs: 30, type: "request" },
          { id: "api-r", label: "200 JSON", color: reqColors.api.res, startMs: 180, durationMs: 60, type: "response" },
        ],
      },
    ],
    annotation: "총 소요: ~270ms — 빨라졌지만 TCP 연결 3개의 핸드셰이크 오버헤드 발생",
  },
  {
    title: "HTTP/1.1 — HOL Blocking 문제",
    description:
      "큰 리소스 하나가 응답을 느리게 보내면, 같은 연결의 뒤따르는 요청들이 모두 대기합니다. 이것이 HTTP/1.1의 근본적인 한계입니다.",
    totalMs: 500,
    connections: [
      {
        label: "TCP 연결 1",
        requests: [
          { id: "js", label: "GET bundle.js (느림)", color: reqColors.js.req, startMs: 0, durationMs: 30, type: "request" },
          { id: "js-r", label: "200 JS (2MB, 느린 전송)", color: reqColors.js.res, startMs: 30, durationMs: 300, type: "response" },
          { id: "blocked", label: "css, img 대기 중...", color: blockedColor, startMs: 30, durationMs: 300, type: "blocked" },
          { id: "css", label: "GET style.css", color: reqColors.css.req, startMs: 330, durationMs: 30, type: "request" },
          { id: "css-r", label: "200 CSS", color: reqColors.css.res, startMs: 360, durationMs: 60, type: "response" },
        ],
      },
    ],
    annotation: "느린 응답 하나가 전체 연결을 블로킹합니다",
  },
];

const http2Steps: TimelineStep[] = [
  {
    title: "HTTP/2 — 단일 연결, 멀티플렉싱",
    description:
      "HTTP/2는 하나의 TCP 연결 안에서 여러 스트림을 동시에 전송합니다. 요청과 응답이 프레임 단위로 인터리빙되므로 HOL blocking이 없습니다.",
    totalMs: 300,
    connections: [
      {
        label: "TCP 연결 1 (멀티플렉싱)",
        requests: [
          { id: "html", label: "Stream 1: GET index.html", color: reqColors.html.req, startMs: 0, durationMs: 20, type: "request" },
          { id: "css", label: "Stream 2: GET style.css", color: reqColors.css.req, startMs: 5, durationMs: 20, type: "request" },
          { id: "js", label: "Stream 3: GET app.js", color: reqColors.js.req, startMs: 10, durationMs: 20, type: "request" },
          { id: "img", label: "Stream 4: GET hero.png", color: reqColors.img.req, startMs: 15, durationMs: 20, type: "request" },
          { id: "html-r", label: "Stream 1: 200 HTML", color: reqColors.html.res, startMs: 30, durationMs: 50, type: "response" },
          { id: "css-r", label: "Stream 2: 200 CSS", color: reqColors.css.res, startMs: 35, durationMs: 70, type: "response" },
          { id: "js-r", label: "Stream 3: 200 JS", color: reqColors.js.res, startMs: 40, durationMs: 110, type: "response" },
          { id: "img-r", label: "Stream 4: 200 IMG", color: reqColors.img.res, startMs: 50, durationMs: 130, type: "response" },
          { id: "font", label: "Stream 5: GET font.woff2", color: reqColors.font.req, startMs: 20, durationMs: 20, type: "request" },
          { id: "font-r", label: "Stream 5: 200 FONT", color: reqColors.font.res, startMs: 55, durationMs: 90, type: "response" },
          { id: "api", label: "Stream 6: GET /api/data", color: reqColors.api.req, startMs: 25, durationMs: 20, type: "request" },
          { id: "api-r", label: "Stream 6: 200 JSON", color: reqColors.api.res, startMs: 60, durationMs: 50, type: "response" },
        ],
      },
    ],
    annotation: "총 소요: ~180ms — 단일 연결로 모든 리소스를 동시에 전송",
  },
  {
    title: "HTTP/2 — 서버 푸시 (Server Push)",
    description:
      "서버가 클라이언트의 요청 없이도 필요한 리소스를 미리 보낼 수 있습니다. HTML을 파싱하기 전에 CSS와 JS가 이미 도착해 있으므로 로딩이 빨라집니다.",
    totalMs: 250,
    connections: [
      {
        label: "TCP 연결 1 (서버 푸시)",
        requests: [
          { id: "html", label: "Stream 1: GET index.html", color: reqColors.html.req, startMs: 0, durationMs: 20, type: "request" },
          { id: "html-r", label: "Stream 1: 200 HTML", color: reqColors.html.res, startMs: 30, durationMs: 50, type: "response" },
          { id: "css-push", label: "Stream 2: PUSH style.css", color: pushColor, startMs: 35, durationMs: 70, type: "push" },
          { id: "js-push", label: "Stream 4: PUSH app.js", color: pushColor, startMs: 40, durationMs: 100, type: "push" },
          { id: "img", label: "Stream 6: GET hero.png", color: reqColors.img.req, startMs: 80, durationMs: 20, type: "request" },
          { id: "img-r", label: "Stream 6: 200 IMG", color: reqColors.img.res, startMs: 110, durationMs: 120, type: "response" },
        ],
      },
    ],
    annotation: "서버가 CSS, JS를 PUSH — 클라이언트가 요청하기 전에 도착",
  },
  {
    title: "HTTP/2 — 스트림 우선순위 (Priority)",
    description:
      "클라이언트가 각 스트림에 우선순위를 지정할 수 있습니다. CSS와 HTML은 높은 우선순위로, 이미지는 낮은 우선순위로 전송하여 렌더링을 최적화합니다.",
    totalMs: 300,
    connections: [
      {
        label: "TCP 연결 1 (우선순위 적용)",
        requests: [
          { id: "html", label: "Stream 1 [W:256]: GET index.html", color: reqColors.html.req, startMs: 0, durationMs: 20, type: "request" },
          { id: "css", label: "Stream 2 [W:256]: GET style.css", color: reqColors.css.req, startMs: 5, durationMs: 20, type: "request" },
          { id: "js", label: "Stream 3 [W:220]: GET app.js", color: reqColors.js.req, startMs: 10, durationMs: 20, type: "request" },
          { id: "img", label: "Stream 4 [W:1]: GET hero.png", color: reqColors.img.req, startMs: 15, durationMs: 20, type: "request" },
          { id: "html-r", label: "Stream 1: 200 HTML (높은 우선순위)", color: reqColors.html.res, startMs: 30, durationMs: 40, type: "response" },
          { id: "css-r", label: "Stream 2: 200 CSS (높은 우선순위)", color: reqColors.css.res, startMs: 32, durationMs: 60, type: "response" },
          { id: "js-r", label: "Stream 3: 200 JS (보통 우선순위)", color: reqColors.js.res, startMs: 50, durationMs: 100, type: "response" },
          { id: "img-r", label: "Stream 4: 200 IMG (낮은 우선순위)", color: reqColors.img.res, startMs: 80, durationMs: 140, type: "response" },
        ],
      },
    ],
    annotation: "HTML, CSS 우선 전송 -> First Contentful Paint 단축",
  },
];

const presets: Record<string, TimelineStep[]> = {
  http1: http1Steps,
  http2: http2Steps,
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function TimelineBar({
  block,
  totalMs,
}: {
  block: RequestBlock;
  totalMs: number;
}) {
  const left = (block.startMs / totalMs) * 100;
  const width = Math.max((block.durationMs / totalMs) * 100, 2);

  const typeLabel =
    block.type === "push"
      ? "PUSH"
      : block.type === "blocked"
        ? "BLOCKED"
        : "";

  const bgClass =
    block.type === "blocked"
      ? blockedColor
      : block.type === "push"
        ? pushColor
        : block.color;

  const borderClass =
    block.type === "blocked"
      ? "border border-dashed border-rose-400/60 dark:border-rose-500/40"
      : block.type === "push"
        ? "border border-teal-500/50 dark:border-teal-400/40"
        : "";

  return (
    <div
      className={`absolute top-0 h-full ${bgClass} ${borderClass} flex items-center overflow-hidden px-1`}
      style={{ left: `${left}%`, width: `${width}%` }}
      title={`${block.label} (${block.startMs}ms - ${block.startMs + block.durationMs}ms)`}
    >
      <span className="truncate font-mono text-[0.5rem] leading-none text-text/80 sm:text-[0.5625rem]">
        {typeLabel ? `[${typeLabel}] ` : ""}
        {block.label}
      </span>
    </div>
  );
}

function ConnectionTimeline({
  connection,
  totalMs,
}: {
  connection: ConnectionLane;
  totalMs: number;
}) {
  return (
    <div className="space-y-1">
      <span className="block text-[0.6875rem] font-medium text-muted">
        {connection.label}
      </span>
      <div className="relative h-auto min-h-[1.5rem] border border-border/60 bg-bg">
        <div className="flex flex-col">
          {connection.requests.map((block) => (
            <div key={block.id} className="relative h-5">
              <TimelineBar block={block} totalMs={totalMs} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TimeAxis({ totalMs }: { totalMs: number }) {
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  return (
    <div className="relative mt-1 h-4">
      {ticks.map((ratio) => (
        <span
          key={ratio}
          className="absolute -translate-x-1/2 font-mono text-[0.5rem] text-muted/60"
          style={{ left: `${ratio * 100}%` }}
        >
          {Math.round(totalMs * ratio)}ms
        </span>
      ))}
    </div>
  );
}

function Legend() {
  const items = [
    { label: "요청", color: "bg-sky-400 dark:bg-sky-500" },
    { label: "응답", color: "bg-sky-200 dark:bg-sky-700" },
    { label: "대기 (HOL)", color: blockedColor },
    { label: "서버 푸시", color: pushColor },
  ];

  return (
    <div className="flex flex-wrap gap-3 text-[0.625rem] text-muted">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1">
          <span className={`inline-block h-2.5 w-4 ${item.color}`} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface HttpEvolutionProps {
  preset?: string;
}

export function HttpEvolution({ preset = "http1" }: HttpEvolutionProps) {
  const steps = presets[preset] ?? presets["http1"];

  const stepNodes = steps.map((step, idx) => (
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

      {/* Legend */}
      <Legend />

      {/* Connection timelines */}
      <div className="space-y-3">
        {step.connections.map((conn, ci) => (
          <ConnectionTimeline
            key={ci}
            connection={conn}
            totalMs={step.totalMs}
          />
        ))}
      </div>

      {/* Time axis */}
      <TimeAxis totalMs={step.totalMs} />

      {/* Annotation */}
      {step.annotation && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300/50 dark:border-amber-700/40 px-3 py-1.5 text-[0.75rem] font-medium text-amber-800 dark:text-amber-200">
          {step.annotation}
        </div>
      )}

      {/* Description */}
      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
