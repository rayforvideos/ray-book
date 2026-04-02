"use client";

import { useState } from "react";

type Mode = "individual" | "delegation";

interface ListItem {
  id: number;
  label: string;
}

const items: ListItem[] = [
  { id: 1, label: "항목 1" },
  { id: 2, label: "항목 2" },
  { id: 3, label: "항목 3" },
  { id: 4, label: "➕ 동적 추가" },
];

const modeData: Record<Mode, { label: string; code: string; description: string; handlerCount: string; dynamicSupport: boolean }> = {
  individual: {
    label: "개별 바인딩",
    code: `items.forEach(li => {
  li.addEventListener("click", handleClick);
});

// 동적으로 추가된 항목은?
const newItem = document.createElement("li");
ul.appendChild(newItem);
// ❌ 핸들러가 없음 — 별도로 바인딩해야 함`,
    description: "각 <li>에 개별 핸들러를 등록합니다. 요소가 많아지면 메모리 사용량이 증가하고, 동적으로 추가된 요소에는 핸들러가 없습니다.",
    handlerCount: "N개 (요소 수만큼)",
    dynamicSupport: false,
  },
  delegation: {
    label: "이벤트 위임",
    code: `ul.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li || !ul.contains(li)) return;
  handleClick(li);
});

// 동적으로 추가된 항목도?
const newItem = document.createElement("li");
ul.appendChild(newItem);
// ✅ 자동으로 핸들링됨`,
    description: "부모 <ul>에 핸들러 하나만 등록합니다. 버블링을 이용해 자식 요소의 이벤트를 처리합니다. 동적 요소도 자동으로 핸들링됩니다.",
    handlerCount: "1개",
    dynamicSupport: true,
  },
};

export function EventDelegation() {
  const [mode, setMode] = useState<Mode>("individual");
  const [clicked, setClicked] = useState<number | null>(null);
  const data = modeData[mode];

  return (
    <div className="my-8 border border-border p-5">
      {/* Tabs */}
      <div className="mb-4 flex border-b border-border">
        {(["individual", "delegation"] as const).map((key) => (
          <button
            key={key}
            onClick={() => { setMode(key); setClicked(null); }}
            className={`px-4 py-2 text-[0.75rem] font-mono transition-colors border-b-2 -mb-px ${
              mode === key ? "border-accent text-accent" : "border-transparent text-muted hover:text-text"
            }`}
          >
            {modeData[key].label}
          </button>
        ))}
      </div>

      <div className="flex gap-5 max-sm:flex-col">
        {/* 시각화: ul > li 목록 */}
        <div className="flex-1 min-w-0">
          <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
            {mode === "delegation" ? "핸들러: <ul>" : "핸들러: 각 <li>"}
          </span>
          <div className={`border p-2 ${mode === "delegation" ? "border-accent/50 bg-accent/5" : "border-border"}`}>
            {mode === "delegation" && (
              <span className="mb-1 block text-[0.5rem] font-mono text-accent">← 핸들러</span>
            )}
            <div className="space-y-1">
              {items.map((item) => {
                const isDynamic = item.id === 4;
                const isClicked = clicked === item.id;
                const hasHandler = mode === "individual" && !isDynamic;
                return (
                  <button
                    key={item.id}
                    onClick={() => setClicked(item.id)}
                    className={`w-full text-left border px-2 py-1 font-mono text-[0.625rem] transition-all ${
                      isClicked
                        ? "bg-accent/10 border-accent text-accent"
                        : isDynamic
                          ? "border-dashed border-muted/30 text-muted/50"
                          : "border-border text-text hover:bg-surface"
                    } ${hasHandler ? "ring-1 ring-sky-300 dark:ring-sky-700" : ""}`}
                  >
                    {item.label}
                    {hasHandler && <span className="ml-1 text-[0.5rem] text-sky-500">← 핸들러</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 코드 + 설명 */}
        <div className="w-56 shrink-0 max-sm:w-full space-y-3">
          <div>
            <span className="mb-1 block text-[0.6875rem] uppercase tracking-wider text-muted">핸들러 수</span>
            <span className="font-mono text-[0.75rem] text-text">{data.handlerCount}</span>
          </div>
          <div>
            <span className="mb-1 block text-[0.6875rem] uppercase tracking-wider text-muted">동적 요소</span>
            <span className={`font-mono text-[0.75rem] ${data.dynamicSupport ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {data.dynamicSupport ? "✅ 자동 지원" : "❌ 별도 바인딩 필요"}
            </span>
          </div>
          {clicked !== null && (
            <div className="border-t border-border pt-2">
              <span className="text-[0.75rem] text-muted">
                {mode === "delegation"
                  ? `이벤트가 <li>에서 버블링 → <ul> 핸들러가 e.target.closest("li")로 처리`
                  : clicked === 4
                    ? "동적 요소에는 핸들러가 없어 아무 일도 일어나지 않습니다."
                    : `항목 ${clicked}의 개별 핸들러가 직접 실행됩니다.`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Code */}
      <pre className="mt-4 bg-surface border border-border p-3 font-mono text-[0.6875rem] leading-relaxed text-text overflow-x-auto">
        {data.code}
      </pre>

      <div className="mt-3 text-[0.8125rem] leading-relaxed text-muted">{data.description}</div>
    </div>
  );
}
