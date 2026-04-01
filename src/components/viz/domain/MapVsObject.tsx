"use client";

import { useState } from "react";

type TabKey = "map" | "object";

interface Feature {
  label: string;
  value: string;
}

interface TabData {
  label: string;
  features: Feature[];
  code: string;
  badges: { text: string; variant: "good" | "neutral" | "warn" }[];
}

function Badge({
  text,
  variant,
}: {
  text: string;
  variant: "good" | "neutral" | "warn";
}) {
  const styles = {
    good: "bg-emerald-100 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800",
    neutral:
      "bg-sky-100 dark:bg-sky-900/70 text-sky-800 dark:text-sky-200 border-sky-200 dark:border-sky-800",
    warn: "bg-amber-100 dark:bg-amber-900/70 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800",
  };

  return (
    <span
      className={`inline-block border px-1.5 py-0.5 text-[0.5625rem] font-semibold ${styles[variant]}`}
    >
      {text}
    </span>
  );
}

const tabs: Record<TabKey, TabData> = {
  map: {
    label: "Map",
    features: [
      { label: "키 타입", value: "모든 값 (객체, 함수, NaN 포함)" },
      { label: "순서 보장", value: "삽입 순서 유지" },
      { label: "크기 확인", value: ".size 프로퍼티" },
      { label: "이터러블", value: "for...of, keys(), values(), entries()" },
      { label: "프로토타입 오염", value: "안전 — 기본 키 없음" },
      { label: "직렬화", value: "JSON 직접 변환 불가 (수동 변환 필요)" },
    ],
    code: `const map = new Map();
map.set({ id: 1 }, "객체 키");
map.set("name", "문자열 키");
map.set(42, "숫자 키");

map.size;          // 3
map.get("name");   // "문자열 키"
map.has(42);       // true
map.delete(42);    // true`,
    badges: [
      { text: "모든 타입 키", variant: "good" },
      { text: "삽입 순서 보장", variant: "good" },
      { text: ".size O(1)", variant: "good" },
      { text: "프로토타입 안전", variant: "good" },
      { text: "JSON 직렬화 불가", variant: "warn" },
    ],
  },
  object: {
    label: "Object",
    features: [
      { label: "키 타입", value: "문자열과 Symbol만" },
      { label: "순서 보장", value: "정수 키 → 오름차순, 나머지 → 삽입 순서" },
      { label: "크기 확인", value: "Object.keys(obj).length (O(n))" },
      { label: "이터러블", value: "직접 이터러블 아님 (Object.entries 필요)" },
      { label: "프로토타입 오염", value: "위험 — toString, constructor 등 상속" },
      { label: "직렬화", value: "JSON.stringify/parse 직접 지원" },
    ],
    code: `const obj = {};
obj[{ id: 1 }] = "?";
// 키가 "[object Object]"로 변환됨!

obj["name"] = "문자열 키";
obj[42] = "숫자 → 문자열 변환";

Object.keys(obj).length; // 3
"name" in obj;           // true
// ⚠️ "toString" in obj → true (프로토타입)`,
    badges: [
      { text: "문자열/Symbol 키만", variant: "neutral" },
      { text: "JSON 직렬화 지원", variant: "good" },
      { text: "리터럴 문법 간편", variant: "good" },
      { text: "프로토타입 오염 위험", variant: "warn" },
      { text: "크기 확인 O(n)", variant: "warn" },
    ],
  },
};

const tabKeys: TabKey[] = ["map", "object"];

export function MapVsObject() {
  const [active, setActive] = useState<TabKey>("map");
  const tab = tabs[active];

  return (
    <div className="my-8 border border-border p-5">
      {/* Tabs */}
      <div className="mb-4 flex border-b border-border">
        {tabKeys.map((key) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`px-4 py-2 text-[0.75rem] font-mono transition-colors border-b-2 -mb-px ${
              active === key
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            {tabs[key].label}
          </button>
        ))}
      </div>

      <div className="flex gap-5 max-sm:flex-col">
        {/* Left: features + code */}
        <div className="flex-1 min-w-0">
          <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
            주요 특성
          </span>
          <div className="space-y-1">
            {tab.features.map((f, i) => (
              <div
                key={i}
                className="flex gap-2 text-[0.75rem] leading-relaxed"
              >
                <span className="shrink-0 font-mono font-semibold text-text w-28">
                  {f.label}
                </span>
                <span className="text-muted">{f.value}</span>
              </div>
            ))}
          </div>

          <span className="mt-4 mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
            코드
          </span>
          <pre className="bg-surface border border-border p-3 font-mono text-[0.6875rem] leading-relaxed text-text overflow-x-auto">
            {tab.code}
          </pre>
        </div>

        {/* Right: performance badges */}
        <div className="w-44 shrink-0 max-sm:w-full">
          <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
            특징
          </span>
          <div className="flex flex-col gap-1.5">
            {tab.badges.map((b, i) => (
              <Badge key={i} text={b.text} variant={b.variant} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
