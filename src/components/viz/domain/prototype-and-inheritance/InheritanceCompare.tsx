"use client";

import { useState } from "react";

type TabKey = "class" | "composition" | "mixin";

interface TabData {
  label: string;
  code: string;
  diagram: React.ReactNode;
  pros: string[];
  cons: string[];
}

function Badge({ text, variant }: { text: string; variant: "pro" | "con" }) {
  const styles =
    variant === "pro"
      ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800"
      : "bg-red-100 dark:bg-red-900/70 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800";
  return (
    <span
      className={`inline-block border px-1.5 py-0.5 text-[0.5625rem] ${styles}`}
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

function VerticalArrow() {
  return (
    <div className="flex items-center justify-center py-0.5">
      <span className="text-[0.625rem] text-muted">↑ extends</span>
    </div>
  );
}

const classDiagram = (
  <div className="space-y-0">
    <DiagramBox
      label="GuideDog"
      color="border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/70"
    >
      <span className="text-[0.5625rem] text-muted">guide()</span>
    </DiagramBox>
    <VerticalArrow />
    <DiagramBox
      label="Dog"
      color="border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-900/70"
    >
      <span className="text-[0.5625rem] text-muted">bark()</span>
    </DiagramBox>
    <VerticalArrow />
    <DiagramBox
      label="Animal"
      color="border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800"
    >
      <span className="text-[0.5625rem] text-muted">speak(), name</span>
    </DiagramBox>
  </div>
);

const compositionDiagram = (
  <div className="space-y-2">
    <DiagramBox
      label="createDog(name)"
      color="border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/70"
    >
      <span className="mt-1 block text-[0.5625rem] text-muted">결과 객체:</span>
    </DiagramBox>
    <div className="flex gap-1.5">
      <div className="flex-1 border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-900/70 px-2 py-1.5 text-center">
        <span className="block font-mono text-[0.5625rem] font-semibold text-sky-800 dark:text-sky-200">
          swimmer
        </span>
        <span className="text-[0.5rem] text-muted">swim()</span>
      </div>
      <div className="flex items-center text-[0.5rem] text-muted">+</div>
      <div className="flex-1 border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/70 px-2 py-1.5 text-center">
        <span className="block font-mono text-[0.5625rem] font-semibold text-amber-800 dark:text-amber-200">
          barker
        </span>
        <span className="text-[0.5rem] text-muted">bark()</span>
      </div>
    </div>
    <div className="text-center text-[0.5rem] text-muted">
      독립 기능을 스프레드로 합침
    </div>
  </div>
);

const mixinDiagram = (
  <div className="space-y-2">
    <DiagramBox
      label="Dog.prototype"
      color="border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/70"
    >
      <span className="text-[0.5625rem] text-muted">bark()</span>
    </DiagramBox>
    <div className="flex items-center gap-1.5">
      <div className="flex-1 border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-900/70 px-2 py-1.5">
        <span className="block font-mono text-[0.5625rem] text-sky-800 dark:text-sky-200">
          Serializable
        </span>
        <span className="text-[0.5rem] text-muted">serialize()</span>
      </div>
      <span className="text-[0.5rem] text-accent">→</span>
      <span className="font-mono text-[0.5rem] text-muted">Object.assign</span>
      <span className="text-[0.5rem] text-accent">→</span>
      <span className="font-mono text-[0.5625rem] text-violet-700 dark:text-violet-300">
        prototype
      </span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="flex-1 border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/70 px-2 py-1.5">
        <span className="block font-mono text-[0.5625rem] text-amber-800 dark:text-amber-200">
          EventEmitter
        </span>
        <span className="text-[0.5rem] text-muted">on(), emit()</span>
      </div>
      <span className="text-[0.5rem] text-accent">→</span>
      <span className="font-mono text-[0.5rem] text-muted">Object.assign</span>
      <span className="text-[0.5rem] text-accent">→</span>
      <span className="font-mono text-[0.5625rem] text-violet-700 dark:text-violet-300">
        prototype
      </span>
    </div>
  </div>
);

const tabs: Record<TabKey, TabData> = {
  class: {
    label: "클래스 상속",
    code: `class Animal { speak() {} }
class Dog extends Animal { bark() {} }
class GuideDog extends Dog { guide() {} }`,
    diagram: classDiagram,
    pros: ["instanceof 가능", "명확한 계층"],
    cons: ["단일 상속만", "깊은 계층 위험"],
  },
  composition: {
    label: "조합",
    code: `function createDog(name) {
  const state = { name };
  return { name, ...swimmer(state), ...barker(state) };
}`,
    diagram: compositionDiagram,
    pros: ["다중 기능 조합", "느슨한 결합"],
    cons: ["instanceof 불가", "메서드 공유 없음"],
  },
  mixin: {
    label: "믹스인",
    code: `Object.assign(
  Dog.prototype,
  Serializable,
  EventEmitter
);`,
    diagram: mixinDiagram,
    pros: ["기존 class에 추가", "다중 소스"],
    cons: ["이름 충돌 위험", "출처 추적 어려움"],
  },
};

const tabKeys: TabKey[] = ["class", "composition", "mixin"];

export function InheritanceCompare() {
  const [active, setActive] = useState<TabKey>("class");
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
            {tab.pros.map((p, i) => (
              <Badge key={`pro-${i}`} text={`✓ ${p}`} variant="pro" />
            ))}
            {tab.cons.map((c, i) => (
              <Badge key={`con-${i}`} text={`✕ ${c}`} variant="con" />
            ))}
          </div>
        </div>

        {/* Right: diagram */}
        <div className="w-56 shrink-0 max-sm:w-full">
          <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
            구조
          </span>
          {tab.diagram}
        </div>
      </div>
    </div>
  );
}
