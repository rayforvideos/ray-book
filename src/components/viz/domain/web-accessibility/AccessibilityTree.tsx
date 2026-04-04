"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

interface TreeNode {
  role: string;
  name?: string;
  focusable?: boolean;
  extra?: string;
}

interface Step {
  title: string;
  label: string;
  html: string;
  tree: TreeNode[];
  description: string;
}

const steps: Step[] = [
  {
    title: "div 기반 버튼",
    label: "Bad",
    html: `<div class="btn" onclick="handleClick()">
  Click me
</div>`,
    tree: [
      { role: "generic", name: '"Click me"', extra: "역할 없음, 포커스 불가, 키보드 미지원" },
    ],
    description:
      "div는 접근성 트리에서 generic 요소로 표현됩니다. 역할(role)이 없고, 키보드로 포커스할 수 없으며, Enter나 Space로 클릭할 수 없습니다.",
  },
  {
    title: "시맨틱 버튼",
    label: "Good",
    html: `<button>
  Click me
</button>`,
    tree: [
      {
        role: "button",
        name: '"Click me"',
        focusable: true,
        extra: "Enter/Space 지원",
      },
    ],
    description:
      "button은 자동으로 role=button을 가지며, 포커스 가능하고 Enter와 Space 키로 클릭할 수 있습니다. CSS로 모양을 바꿔도 이 동작은 유지됩니다.",
  },
  {
    title: "div 기반 네비게이션",
    label: "Bad",
    html: `<div class="nav">
  <div class="link"
    onclick="goto('/')">
    Home
  </div>
  <div class="link"
    onclick="goto('/about')">
    About
  </div>
</div>`,
    tree: [
      { role: "generic", extra: "랜드마크 없음" },
      { role: "generic", name: '"Home"', extra: "링크 아님, 포커스 불가" },
      { role: "generic", name: '"About"', extra: "링크 아님, 포커스 불가" },
    ],
    description:
      "div로 만든 네비게이션은 랜드마크가 없습니다. 스크린 리더 사용자는 이 영역이 내비게이션인지 알 수 없고, 링크 목록으로 탐색할 수도 없습니다.",
  },
  {
    title: "시맨틱 네비게이션",
    label: "Good",
    html: `<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
</nav>`,
    tree: [
      { role: "navigation", extra: "랜드마크" },
      { role: "link", name: '"Home"', focusable: true, extra: "Enter로 이동" },
      { role: "link", name: '"About"', focusable: true, extra: "Enter로 이동" },
    ],
    description:
      "nav는 navigation 랜드마크로 인식되어 스크린 리더에서 바로 접근할 수 있습니다. a 태그는 link 역할을 가지며 키보드로 포커스하고 Enter로 이동할 수 있습니다.",
  },
];

function HtmlPanel({ code }: { code: string }) {
  return (
    <div className="flex-1 min-w-0">
      <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
        HTML
      </span>
      <pre className="bg-stone-100 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 p-3 font-mono text-[0.625rem] leading-relaxed text-text overflow-x-auto whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

function TreePanel({ nodes }: { nodes: TreeNode[] }) {
  return (
    <div className="flex-1 min-w-0">
      <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
        Accessibility Tree
      </span>
      <div className="space-y-1.5">
        {nodes.map((node, i) => (
          <div
            key={i}
            className={`border p-2.5 text-[0.6875rem] leading-relaxed ${
              node.focusable
                ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40"
                : "border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30"
            }`}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`font-mono font-semibold ${
                  node.focusable
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {node.role}
              </span>
              {node.name && (
                <span className="text-muted font-mono">{node.name}</span>
              )}
            </div>
            {node.extra && (
              <div className="mt-1 text-[0.625rem] text-muted">
                {node.focusable && (
                  <span className="inline-block mr-1.5 text-emerald-600 dark:text-emerald-400">
                    &#10003; focusable
                  </span>
                )}
                {node.extra}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AccessibilityTree() {
  const stepNodes = steps.map((step, idx) => (
    <div key={idx} className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`text-[0.625rem] font-mono font-semibold px-1.5 py-0.5 rounded ${
            step.label === "Good"
              ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
              : "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400"
          }`}
        >
          {step.label}
        </span>
        <span className="text-[0.8125rem] font-medium text-text">
          {step.title}
        </span>
      </div>
      <div className="flex gap-3 max-sm:flex-col">
        <HtmlPanel code={step.html} />
        <TreePanel nodes={step.tree} />
      </div>
      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
