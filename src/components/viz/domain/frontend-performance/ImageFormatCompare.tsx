"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ── Types ── */

interface FormatInfo {
  name: string;
  sizeKB: number;
  features: string[];
  pros: string;
  cons: string;
  color: string;
  description: string;
}

/* ── Data ── */

const baselineKB = 200; // reference JPEG size

const formats: FormatInfo[] = [
  {
    name: "JPEG",
    sizeKB: 200,
    features: ["손실 압축", "사진에 최적"],
    pros: "보편적 지원, 좋은 압축률",
    cons: "투명도 없음, 인코딩 아티팩트",
    color: "bg-amber-400 dark:bg-amber-500",
    description:
      "JPEG는 사진 이미지에 가장 널리 사용되는 손실 압축 포맷입니다. 압축률이 좋지만 투명도를 지원하지 않고, 반복 저장 시 품질이 저하됩니다. 텍스트나 선명한 경계가 있는 이미지에서는 눈에 띄는 아티팩트가 나타납니다.",
  },
  {
    name: "PNG",
    sizeKB: 500,
    features: ["무손실 압축", "투명도 지원"],
    pros: "품질 손실 없음, 알파 채널",
    cons: "파일 크기 큼 (JPEG 대비 2.5x)",
    color: "bg-sky-400 dark:bg-sky-500",
    description:
      "PNG는 무손실 압축으로 품질 저하 없이 이미지를 저장합니다. 알파 채널을 통한 투명도를 지원하여 아이콘, 로고, UI 요소에 적합합니다. 다만 사진 이미지에서는 JPEG 대비 2~5배 큰 파일 크기가 단점입니다.",
  },
  {
    name: "WebP",
    sizeKB: 140,
    features: ["손실/무손실", "투명도 지원", "애니메이션"],
    pros: "JPEG 대비 25-34% 작음, 투명도 지원",
    cons: "인코딩 속도 느림",
    color: "bg-emerald-400 dark:bg-emerald-500",
    description:
      "Google이 개발한 WebP는 JPEG 대비 25-34% 작은 파일을 생성하면서 유사한 화질을 유지합니다. 손실/무손실 압축 모두 지원하고 투명도와 애니메이션도 가능합니다. 2024년 기준 모든 주요 브라우저가 지원합니다.",
  },
  {
    name: "AVIF",
    sizeKB: 110,
    features: ["손실/무손실", "투명도 지원", "HDR"],
    pros: "JPEG 대비 50% 작음, WebP 대비 20% 작음",
    cons: "인코딩 매우 느림, 점진적 로딩 미흡",
    color: "bg-violet-400 dark:bg-violet-500",
    description:
      "AV1 비디오 코덱 기반의 AVIF는 현재 가장 효율적인 이미지 포맷입니다. JPEG 대비 약 50%, WebP 대비 약 20% 작은 파일을 생성합니다. HDR과 넓은 색역을 지원하지만, 인코딩 속도가 느려 빌드 타임에 영향을 줄 수 있습니다.",
  },
];

const maxKB = 500; // PNG as max for bar scaling

/* ── Sub-components ── */

function SizeBar({
  sizeKB,
  color,
  maxWidth,
}: {
  sizeKB: number;
  color: string;
  maxWidth: number;
}) {
  const pct = (sizeKB / maxWidth) * 100;
  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-6 ${color} transition-all duration-300`}
        style={{ width: `${pct}%`, minWidth: "2rem" }}
      />
      <span className="font-mono text-[0.75rem] text-text shrink-0">
        {sizeKB} KB
      </span>
    </div>
  );
}

function FeatureBadge({ text }: { text: string }) {
  return (
    <span className="inline-block px-1.5 py-0.5 text-[0.625rem] font-mono bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
      {text}
    </span>
  );
}

function Savings({ sizeKB }: { sizeKB: number }) {
  if (sizeKB >= baselineKB) return null;
  const pct = Math.round(((baselineKB - sizeKB) / baselineKB) * 100);
  return (
    <span className="text-[0.6875rem] font-mono text-emerald-600 dark:text-emerald-400">
      JPEG 대비 -{pct}%
    </span>
  );
}

/* ── Main ── */

export function ImageFormatCompare() {
  const stepNodes = formats.map((fmt, i) => (
    <div key={i} className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-2 py-0.5 font-mono text-[0.625rem] font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300">
          {fmt.name}
        </span>
        <div className="flex gap-1 flex-wrap">
          {fmt.features.map((f) => (
            <FeatureBadge key={f} text={f} />
          ))}
        </div>
      </div>

      {/* Size comparison */}
      <div className="space-y-1">
        <div className="text-[0.6875rem] text-muted uppercase tracking-wider">
          동일 품질 기준 파일 크기
        </div>
        <SizeBar sizeKB={fmt.sizeKB} color={fmt.color} maxWidth={maxKB} />
        <Savings sizeKB={fmt.sizeKB} />
      </div>

      {/* Reference bars */}
      <div className="space-y-1 opacity-40">
        {formats
          .filter((f) => f.name !== fmt.name)
          .map((f) => (
            <div key={f.name} className="flex items-center gap-2">
              <span className="shrink-0 w-10 text-right font-mono text-[0.5625rem] text-muted">
                {f.name}
              </span>
              <div
                className={`h-3 ${f.color}/50`}
                style={{
                  width: `${(f.sizeKB / maxKB) * 100}%`,
                  minWidth: "1rem",
                }}
              />
              <span className="font-mono text-[0.5625rem] text-muted">
                {f.sizeKB} KB
              </span>
            </div>
          ))}
      </div>

      {/* Pros & Cons */}
      <div className="grid grid-cols-2 gap-2 text-[0.75rem]">
        <div>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            장점:
          </span>{" "}
          <span className="text-muted">{fmt.pros}</span>
        </div>
        <div>
          <span className="text-red-600 dark:text-red-400 font-medium">
            단점:
          </span>{" "}
          <span className="text-muted">{fmt.cons}</span>
        </div>
      </div>

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {fmt.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
