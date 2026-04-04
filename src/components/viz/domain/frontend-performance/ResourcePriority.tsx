"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ── Data ── */

interface Resource {
  name: string;
  type: string;
  priority: "Highest" | "High" | "Medium" | "Low" | "Lowest";
  size: string;
  loadMs: number;
  color: string;
  deferred?: boolean;
  highlight?: boolean;
}

interface Step {
  title: string;
  subtitle: string;
  description: string;
  resources: Resource[];
}

const priorityColor: Record<string, string> = {
  Highest: "text-rose-500",
  High: "text-amber-500",
  Medium: "text-sky-500",
  Low: "text-emerald-500",
  Lowest: "text-muted/50",
};

const steps: Step[] = [
  {
    title: "기본 — 브라우저의 우선순위",
    subtitle: "브라우저는 리소스 유형에 따라 우선순위를 자동 결정",
    description:
      "브라우저는 리소스 유형별로 내부 우선순위를 부여합니다. HTML과 CSS는 렌더링에 필수이므로 Highest, 동기 스크립트는 High, 이미지는 뷰포트 내 여부에 따라 Medium 또는 Low입니다.",
    resources: [
      { name: "index.html", type: "document", priority: "Highest", size: "12 KB", loadMs: 100, color: "bg-rose-500/70" },
      { name: "style.css", type: "stylesheet", priority: "Highest", size: "35 KB", loadMs: 150, color: "bg-rose-500/70" },
      { name: "app.js", type: "script", priority: "High", size: "120 KB", loadMs: 400, color: "bg-amber-500/70" },
      { name: "hero.webp", type: "image", priority: "Medium", size: "85 KB", loadMs: 350, color: "bg-sky-500/70" },
      { name: "analytics.js", type: "script", priority: "Low", size: "45 KB", loadMs: 200, color: "bg-emerald-500/70" },
      { name: "footer-img.webp", type: "image", priority: "Low", size: "60 KB", loadMs: 250, color: "bg-emerald-500/70" },
    ],
  },
  {
    title: "preload / preconnect — 일찍 시작하라",
    subtitle: "중요한 리소스를 미리 발견시키는 힌트",
    description:
      "preload는 현재 페이지에 반드시 필요한 리소스를 일찍 발견시킵니다. preconnect는 외부 도메인과의 연결 (DNS + TCP + TLS) 을 미리 수립합니다. fetchpriority=\"high\"를 추가하면 LCP 이미지를 더 높은 우선순위로 로드할 수 있습니다.",
    resources: [
      { name: "index.html", type: "document", priority: "Highest", size: "12 KB", loadMs: 100, color: "bg-rose-500/70" },
      { name: "style.css", type: "stylesheet", priority: "Highest", size: "35 KB", loadMs: 150, color: "bg-rose-500/70" },
      { name: "hero.webp", type: "image (preload)", priority: "High", size: "85 KB", loadMs: 200, color: "bg-amber-500/70", highlight: true },
      { name: "font.woff2", type: "font (preload)", priority: "High", size: "28 KB", loadMs: 120, color: "bg-amber-500/70", highlight: true },
      { name: "app.js", type: "script", priority: "High", size: "120 KB", loadMs: 400, color: "bg-amber-500/70" },
      { name: "analytics.js", type: "script", priority: "Low", size: "45 KB", loadMs: 200, color: "bg-emerald-500/70" },
      { name: "footer-img.webp", type: "image", priority: "Low", size: "60 KB", loadMs: 250, color: "bg-emerald-500/70" },
    ],
  },
  {
    title: "Lazy Loading — 보이면 그때 로드",
    subtitle: "뷰포트 밖 리소스를 지연 로드하여 초기 전송량 절약",
    description:
      "loading=\"lazy\"는 이미지나 iframe이 뷰포트에 가까워질 때까지 로드를 미룹니다. Intersection Observer API를 직접 사용하면 커스텀 트리거 거리, 애니메이션 등 더 세밀한 제어가 가능합니다.",
    resources: [
      { name: "index.html", type: "document", priority: "Highest", size: "12 KB", loadMs: 100, color: "bg-rose-500/70" },
      { name: "style.css", type: "stylesheet", priority: "Highest", size: "35 KB", loadMs: 150, color: "bg-rose-500/70" },
      { name: "hero.webp", type: "image (preload)", priority: "High", size: "85 KB", loadMs: 200, color: "bg-amber-500/70", highlight: true },
      { name: "app.js", type: "script", priority: "High", size: "120 KB", loadMs: 400, color: "bg-amber-500/70" },
      { name: "footer-img.webp", type: "image (lazy)", priority: "Lowest", size: "60 KB", loadMs: 250, color: "bg-muted/30", deferred: true },
      { name: "carousel-1.webp", type: "image (lazy)", priority: "Lowest", size: "70 KB", loadMs: 280, color: "bg-muted/30", deferred: true },
    ],
  },
  {
    title: "async / defer — 스크립트 전략",
    subtitle: "HTML 파싱을 차단하지 않는 스크립트 로딩",
    description:
      "async 스크립트는 다운로드가 끝나는 즉시 실행되므로 순서를 보장하지 않습니다 — 분석 스크립트처럼 독립적인 코드에 적합합니다. defer 스크립트는 HTML 파싱이 완료된 후 문서 순서대로 실행됩니다 — 앱 로직에 적합합니다.",
    resources: [
      { name: "index.html", type: "document", priority: "Highest", size: "12 KB", loadMs: 100, color: "bg-rose-500/70" },
      { name: "style.css", type: "stylesheet", priority: "Highest", size: "35 KB", loadMs: 150, color: "bg-rose-500/70" },
      { name: "hero.webp", type: "image (preload)", priority: "High", size: "85 KB", loadMs: 200, color: "bg-amber-500/70", highlight: true },
      { name: "app.js", type: "script (defer)", priority: "High", size: "120 KB", loadMs: 400, color: "bg-sky-500/70", highlight: true },
      { name: "vendor.js", type: "script (defer)", priority: "High", size: "90 KB", loadMs: 300, color: "bg-sky-500/70", highlight: true },
      { name: "analytics.js", type: "script (async)", priority: "Low", size: "45 KB", loadMs: 200, color: "bg-violet-500/70", highlight: true },
    ],
  },
];

const MAX_MS = 500;

/* ── Waterfall Row ── */

function WaterfallRow({ resource }: { resource: Resource }) {
  const widthPct = Math.max((resource.loadMs / MAX_MS) * 100, 4);

  return (
    <div
      className={`flex items-center gap-2 ${resource.deferred ? "opacity-40" : ""}`}
    >
      {/* Name */}
      <span className="w-32 shrink-0 text-right font-mono text-[0.6875rem] text-muted truncate">
        {resource.name}
      </span>

      {/* Priority badge */}
      <span
        className={`w-14 shrink-0 text-center font-mono text-[0.5625rem] font-bold ${
          priorityColor[resource.priority]
        }`}
      >
        {resource.priority}
      </span>

      {/* Bar */}
      <div className="flex-1 h-4 relative">
        <div
          className={`absolute inset-y-0 left-0 rounded transition-all duration-500 ${resource.color} ${
            resource.highlight
              ? "ring-1 ring-offset-1 ring-offset-bg ring-accent"
              : ""
          }`}
          style={{ width: `${widthPct}%` }}
        />
      </div>

      {/* Size */}
      <span className="w-14 shrink-0 text-right font-mono text-[0.625rem] text-muted">
        {resource.size}
      </span>
    </div>
  );
}

/* ── Step Nodes ── */

const stepNodes = steps.map((step, idx) => (
  <div key={idx} className="space-y-4">
    {/* Header */}
    <div className="flex items-center justify-between">
      <span className="font-mono text-sm font-bold text-accent">{step.title}</span>
      <span className="text-[0.6875rem] text-muted">
        {idx + 1} / {steps.length}
      </span>
    </div>

    <p className="text-[0.75rem] text-muted italic">{step.subtitle}</p>

    {/* Waterfall */}
    <div className="space-y-1.5">
      {step.resources.map((r, i) => (
        <WaterfallRow key={i} resource={r} />
      ))}
    </div>

    {/* Description */}
    <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
      {step.description}
    </div>
  </div>
));

/* ── Main Component ── */

export function ResourcePriority() {
  return <StepPlayer steps={stepNodes} />;
}
