"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ── Data ── */

interface Resource {
  name: string;
  size: string;
  sizeKB: number;
  loadMs: number;
  color: string;
  delay?: number;
}

interface Step {
  title: string;
  subtitle: string;
  description: string;
  resources: Resource[];
  totalTransfer: string;
}

const steps: Step[] = [
  {
    title: "Before — 단일 번들",
    subtitle: "하나의 거대한 JS 파일이 렌더링을 차단",
    description:
      "모든 코드가 하나의 번들에 포함됩니다. 브라우저는 800KB를 다운로드하고, 파싱하고, 컴파일하고, 실행을 마칠 때까지 화면에 아무것도 그릴 수 없습니다.",
    resources: [
      { name: "bundle.js", size: "800 KB", sizeKB: 800, loadMs: 2400, color: "bg-rose-500/70" },
    ],
    totalTransfer: "800 KB",
  },
  {
    title: "Code Splitting — 라우트별 청크",
    subtitle: "필요한 코드만 먼저, 나머지는 나중에",
    description:
      "dynamic import()와 React.lazy()로 라우트별 청크를 만듭니다. 초기 로드에 필요한 코드만 먼저 받고, 나머지는 사용자가 해당 페이지로 이동할 때 로드합니다.",
    resources: [
      { name: "vendor.js", size: "120 KB", sizeKB: 120, loadMs: 360, color: "bg-sky-500/70" },
      { name: "app.js", size: "80 KB", sizeKB: 80, loadMs: 240, color: "bg-sky-500/70", delay: 0 },
      { name: "home.js", size: "45 KB", sizeKB: 45, loadMs: 135, color: "bg-emerald-500/70", delay: 0 },
      { name: "dashboard.js", size: "95 KB", sizeKB: 95, loadMs: 285, color: "bg-muted/30", delay: 400 },
      { name: "settings.js", size: "60 KB", sizeKB: 60, loadMs: 180, color: "bg-muted/30", delay: 400 },
    ],
    totalTransfer: "245 KB (초기) / 400 KB (전체)",
  },
  {
    title: "Tree Shaking — 사용하지 않는 코드 제거",
    subtitle: "ESM의 정적 구조가 가능하게 하는 최적화",
    description:
      "ES 모듈의 import/export는 정적으로 분석할 수 있습니다. 번들러는 실제로 사용되는 코드만 포함하고, 나머지는 제거 (tree-shake) 합니다. lodash 전체 대신 lodash-es에서 필요한 함수만 가져오면 번들이 극적으로 줄어듭니다.",
    resources: [
      { name: "vendor.js", size: "75 KB", sizeKB: 75, loadMs: 225, color: "bg-sky-500/70" },
      { name: "app.js", size: "55 KB", sizeKB: 55, loadMs: 165, color: "bg-sky-500/70", delay: 0 },
      { name: "home.js", size: "30 KB", sizeKB: 30, loadMs: 90, color: "bg-emerald-500/70", delay: 0 },
    ],
    totalTransfer: "160 KB (초기)",
  },
  {
    title: "Compression — gzip / Brotli 압축",
    subtitle: "전송 크기를 60~75% 줄이는 마지막 단계",
    description:
      "서버에서 Brotli (br) 또는 gzip으로 압축하면 텍스트 기반 리소스의 전송 크기가 크게 줄어듭니다. Brotli는 gzip 대비 약 15~25% 더 작은 결과물을 만들지만 압축 속도가 느려, 정적 에셋에 적합합니다.",
    resources: [
      { name: "vendor.js.br", size: "22 KB", sizeKB: 22, loadMs: 66, color: "bg-violet-500/70" },
      { name: "app.js.br", size: "16 KB", sizeKB: 16, loadMs: 48, color: "bg-violet-500/70", delay: 0 },
      { name: "home.js.br", size: "9 KB", sizeKB: 9, loadMs: 27, color: "bg-emerald-500/70", delay: 0 },
    ],
    totalTransfer: "47 KB (초기, Brotli)",
  },
];

const MAX_KB = 800;
const MAX_MS = 2500;

/* ── Waterfall Bar ── */

function WaterfallBar({ resource, maxMs }: { resource: Resource; maxMs: number }) {
  const widthPct = Math.max((resource.loadMs / maxMs) * 100, 4);
  const offsetPct = resource.delay ? (resource.delay / maxMs) * 100 : 0;
  const isDeferred = resource.color.includes("muted");

  return (
    <div className="flex items-center gap-2">
      {/* Name */}
      <span
        className={`w-28 shrink-0 text-right font-mono text-[0.6875rem] truncate ${
          isDeferred ? "text-muted/50" : "text-muted"
        }`}
      >
        {resource.name}
      </span>

      {/* Bar */}
      <div className="flex-1 h-5 relative">
        <div
          className={`absolute inset-y-0 rounded transition-all duration-500 ${resource.color}`}
          style={{
            left: `${offsetPct}%`,
            width: `${widthPct}%`,
          }}
        />
      </div>

      {/* Size */}
      <span
        className={`w-16 shrink-0 font-mono text-[0.625rem] text-right ${
          isDeferred ? "text-muted/40" : "text-muted"
        }`}
      >
        {resource.size}
      </span>
    </div>
  );
}

/* ── Size Comparison ── */

function SizeBar({ label, kb }: { label: string; kb: number }) {
  const pct = Math.max((kb / MAX_KB) * 100, 2);
  return (
    <div className="flex items-center gap-2 text-[0.625rem] font-mono">
      <span className="w-10 text-right text-muted">{label}</span>
      <div className="flex-1 h-2 rounded bg-border/20">
        <div
          className="h-full rounded bg-accent/40 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-14 text-muted">{kb} KB</span>
    </div>
  );
}

/* ── Step Nodes ── */

const stepNodes = steps.map((step, idx) => {
  const initialKB = step.resources
    .filter((r) => !r.color.includes("muted"))
    .reduce((sum, r) => sum + r.sizeKB, 0);

  return (
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
          <WaterfallBar key={i} resource={r} maxMs={MAX_MS} />
        ))}
      </div>

      {/* Size comparison */}
      <div className="pt-2 space-y-1">
        <SizeBar label="원본" kb={MAX_KB} />
        <SizeBar label="현재" kb={initialKB} />
      </div>

      {/* Transfer info */}
      <div className="text-[0.6875rem] font-mono text-muted">
        전송 크기: {step.totalTransfer}
      </div>

      {/* Description */}
      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  );
});

/* ── Main Component ── */

export function BundleWaterfall() {
  return <StepPlayer steps={stepNodes} />;
}
