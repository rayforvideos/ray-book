"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ── Types ── */

interface ContrastStep {
  title: string;
  badge: string;
  badgeColor: string;
  samples: Sample[];
  description: string;
}

interface Sample {
  bg: string;
  fg: string;
  text: string;
  ratio: string;
  label: string;
}

/* ── Contrast ratio calculation (relative luminance per WCAG 2.1) ── */

function sRGBtoLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * sRGBtoLinear(r) + 0.7152 * sRGBtoLinear(g) + 0.0722 * sRGBtoLinear(b);
}

function contrastRatio(hex1: string, hex2: string): string {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return ((lighter + 0.05) / (darker + 0.05)).toFixed(1);
}

/* ── Steps ── */

const steps: ContrastStep[] = [
  {
    title: "낮은 대비 — WCAG 실패",
    badge: "FAIL",
    badgeColor: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300",
    samples: [
      {
        bg: "#ffffff",
        fg: "#aaaaaa",
        text: "이 텍스트는 읽기 어렵습니다",
        ratio: contrastRatio("#ffffff", "#aaaaaa"),
        label: "흰 배경 + 밝은 회색 텍스트",
      },
      {
        bg: "#f0f0f0",
        fg: "#c0c0c0",
        text: "배경과 구분이 안 됩니다",
        ratio: contrastRatio("#f0f0f0", "#c0c0c0"),
        label: "밝은 회색 배경 + 회색 텍스트",
      },
    ],
    description:
      "대비 비율이 4.5:1 미만이면 저시력 사용자는 텍스트를 읽을 수 없습니다. 화면 밝기를 낮추거나 햇빛 아래서 보면 일반 사용자도 힘들어집니다.",
  },
  {
    title: "AA 기준 통과 (4.5:1 이상)",
    badge: "AA",
    badgeColor: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
    samples: [
      {
        bg: "#ffffff",
        fg: "#595959",
        text: "이 텍스트는 충분히 읽힙니다",
        ratio: contrastRatio("#ffffff", "#595959"),
        label: "흰 배경 + 진한 회색 텍스트",
      },
      {
        bg: "#1e3a5f",
        fg: "#ffffff",
        text: "어두운 배경에 흰 텍스트",
        ratio: contrastRatio("#1e3a5f", "#ffffff"),
        label: "남색 배경 + 흰 텍스트",
      },
    ],
    description:
      "WCAG AA는 일반 텍스트 4.5:1, 큰 텍스트 (24px 이상 또는 18.66px 볼드) 3:1을 요구합니다. 대부분의 웹사이트가 목표로 하는 기준입니다.",
  },
  {
    title: "AAA 기준 통과 (7:1 이상)",
    badge: "AAA",
    badgeColor: "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300",
    samples: [
      {
        bg: "#ffffff",
        fg: "#333333",
        text: "높은 대비로 매우 선명합니다",
        ratio: contrastRatio("#ffffff", "#333333"),
        label: "흰 배경 + 거의 검정 텍스트",
      },
      {
        bg: "#0a0a0a",
        fg: "#f5f5f5",
        text: "어두운 배경의 높은 대비",
        ratio: contrastRatio("#0a0a0a", "#f5f5f5"),
        label: "거의 검정 배경 + 거의 흰 텍스트",
      },
    ],
    description:
      "WCAG AAA는 일반 텍스트 7:1, 큰 텍스트 4.5:1을 요구합니다. 가장 높은 수준의 접근성을 제공하며, 심한 저시력 사용자에게도 읽기 쉽습니다.",
  },
  {
    title: "색상만으로 정보 전달 — 아이콘 병행",
    badge: "색 + 아이콘",
    badgeColor: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
    samples: [],
    description:
      "적록 색맹 (남성의 약 8%) 은 빨간색과 초록색을 구분하지 못합니다. 색상에만 의존하면 정보가 전달되지 않습니다. 아이콘, 텍스트, 패턴을 함께 사용해야 합니다.",
  },
];

/* ── Sub-components ── */

function SampleCard({ sample }: { sample: Sample }) {
  return (
    <div className="border border-border overflow-hidden">
      <div
        className="px-4 py-3 text-[0.9375rem] leading-relaxed font-medium"
        style={{ backgroundColor: sample.bg, color: sample.fg }}
      >
        {sample.text}
      </div>
      <div className="flex items-center justify-between px-3 py-1.5 bg-surface text-[0.6875rem]">
        <span className="text-muted">{sample.label}</span>
        <span className="font-mono font-bold text-text">{sample.ratio}:1</span>
      </div>
    </div>
  );
}

function ColorOnlyDemo() {
  return (
    <div className="space-y-3">
      {/* Bad: color only */}
      <div>
        <div className="text-[0.6875rem] font-medium text-muted mb-1.5">
          ❌ 색상만 사용
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 border border-border">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#22c55e" }} />
            <span className="text-[0.8125rem]">성공</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 border border-border">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#ef4444" }} />
            <span className="text-[0.8125rem]">실패</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 border border-border">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#eab308" }} />
            <span className="text-[0.8125rem]">경고</span>
          </div>
        </div>
        <div className="text-[0.6875rem] text-red-600 dark:text-red-400 mt-1">
          적록 색맹 사용자에게 성공/실패가 동일하게 보입니다
        </div>
      </div>

      {/* Good: color + icon + text */}
      <div>
        <div className="text-[0.6875rem] font-medium text-muted mb-1.5">
          ✅ 색상 + 아이콘 + 텍스트 병행
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 border border-border">
            <span style={{ color: "#22c55e" }}>✓</span>
            <span className="text-[0.8125rem]">성공</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 border border-border">
            <span style={{ color: "#ef4444" }}>✕</span>
            <span className="text-[0.8125rem]">실패</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 border border-border">
            <span style={{ color: "#eab308" }}>⚠</span>
            <span className="text-[0.8125rem]">경고</span>
          </div>
        </div>
        <div className="text-[0.6875rem] text-emerald-600 dark:text-emerald-400 mt-1">
          색을 구분하지 못해도 아이콘과 텍스트로 상태를 알 수 있습니다
        </div>
      </div>
    </div>
  );
}

/* ── Main ── */

export function ContrastCompare() {
  const stepNodes = steps.map((step, i) => (
    <div key={i} className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`px-2 py-0.5 font-mono text-[0.625rem] font-bold ${step.badgeColor}`}>
          {step.badge}
        </span>
        <span className="text-[0.8125rem] font-medium text-text">
          {step.title}
        </span>
      </div>

      {step.samples.length > 0 ? (
        <div className="space-y-2">
          {step.samples.map((sample, j) => (
            <SampleCard key={j} sample={sample} />
          ))}
        </div>
      ) : (
        <ColorOnlyDemo />
      )}

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
