"use client";

import { useState } from "react";

type TabKey = "cjs" | "esm";

interface TabData {
  label: string;
  code: string;
  characteristics: { text: string; color: string }[];
  diagram: React.ReactNode;
}

function CharBadge({ text, color }: { text: string; color: string }) {
  return (
    <span
      className={`inline-block border px-1.5 py-0.5 text-[0.5625rem] font-semibold ${color}`}
    >
      {text}
    </span>
  );
}

function DiagramBox({
  label,
  color,
  children,
}: {
  label: string;
  color: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`border px-3 py-2 ${color}`}>
      <span className="block font-mono text-[0.6875rem] font-semibold text-text">
        {label}
      </span>
      {children}
    </div>
  );
}

const cjsDiagram = (
  <div className="space-y-2">
    <DiagramBox
      label="app.js"
      color="border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/70"
    >
      <span className="text-[0.5625rem] text-muted">{"require('./math')"}</span>
    </DiagramBox>
    <div className="flex items-center justify-center py-0.5">
      <span className="text-[0.625rem] text-muted">--- 동기 로드 ---</span>
    </div>
    <DiagramBox
      label="math.js"
      color="border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/70"
    >
      <span className="text-[0.5625rem] text-muted">
        module.exports = {"{ add, sub }"}
      </span>
    </DiagramBox>
    <div className="flex items-center justify-center py-0.5">
      <span className="text-[0.625rem] text-muted">--- 값 복사 ---</span>
    </div>
    <DiagramBox
      label="결과"
      color="border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800"
    >
      <span className="text-[0.5625rem] text-muted">
        add, sub 값을 복사하여 사용
      </span>
    </DiagramBox>
  </div>
);

const esmDiagram = (
  <div className="space-y-2">
    <DiagramBox
      label="app.mjs"
      color="border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/70"
    >
      <span className="text-[0.5625rem] text-muted">
        {"import { add } from './math'"}
      </span>
    </DiagramBox>
    <div className="flex items-center justify-center py-0.5">
      <span className="text-[0.625rem] text-muted">--- 비동기 로드 ---</span>
    </div>
    <DiagramBox
      label="math.mjs"
      color="border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/70"
    >
      <span className="text-[0.5625rem] text-muted">
        export {"{ add, sub }"}
      </span>
    </DiagramBox>
    <div className="flex items-center justify-center py-0.5">
      <span className="text-[0.625rem] text-muted">--- 라이브 바인딩 ---</span>
    </div>
    <DiagramBox
      label="결과"
      color="border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800"
    >
      <span className="text-[0.5625rem] text-muted">
        add 참조를 공유 (원본 변경 반영)
      </span>
    </DiagramBox>
  </div>
);

const tabs: Record<TabKey, TabData> = {
  cjs: {
    label: "CommonJS",
    code: `// math.js
const add = (a, b) => a + b;
const sub = (a, b) => a - b;
module.exports = { add, sub };

// app.js
const { add, sub } = require('./math');
console.log(add(1, 2)); // 3`,
    characteristics: [
      {
        text: "동기 로딩",
        color:
          "bg-amber-100 dark:bg-amber-900/70 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800",
      },
      {
        text: "런타임 해석",
        color:
          "bg-amber-100 dark:bg-amber-900/70 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800",
      },
      {
        text: "값 복사",
        color:
          "bg-amber-100 dark:bg-amber-900/70 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800",
      },
      {
        text: "this === module.exports",
        color:
          "bg-amber-100 dark:bg-amber-900/70 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800",
      },
    ],
    diagram: cjsDiagram,
  },
  esm: {
    label: "ESM",
    code: `// math.mjs
export const add = (a, b) => a + b;
export const sub = (a, b) => a - b;

// app.mjs
import { add, sub } from './math.mjs';
console.log(add(1, 2)); // 3`,
    characteristics: [
      {
        text: "비동기 로딩",
        color:
          "bg-emerald-100 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800",
      },
      {
        text: "정적 분석",
        color:
          "bg-emerald-100 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800",
      },
      {
        text: "라이브 바인딩",
        color:
          "bg-emerald-100 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800",
      },
      {
        text: "this === undefined",
        color:
          "bg-emerald-100 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800",
      },
    ],
    diagram: esmDiagram,
  },
};

const tabKeys: TabKey[] = ["cjs", "esm"];

export function ModuleCompare() {
  const [active, setActive] = useState<TabKey>("cjs");
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
        {/* Left: code + badges */}
        <div className="flex-1 min-w-0">
          <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
            코드
          </span>
          <pre className="bg-surface border border-border p-3 font-mono text-[0.6875rem] leading-relaxed text-text overflow-x-auto">
            {tab.code}
          </pre>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tab.characteristics.map((c, i) => (
              <CharBadge key={i} text={c.text} color={c.color} />
            ))}
          </div>
        </div>

        {/* Right: diagram */}
        <div className="w-56 shrink-0 max-sm:w-full">
          <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
            로딩 방식
          </span>
          {tab.diagram}
        </div>
      </div>
    </div>
  );
}
