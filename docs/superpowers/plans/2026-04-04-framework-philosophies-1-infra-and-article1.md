# Framework Philosophies — Infra + Article 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 시리즈 인프라(series.json, CodeTabs 컴포넌트)와 1편 "왜 프레임워크가 필요했는가"를 구현한다.

**Architecture:** CodeTabs는 기존 CodeBlock(Shiki) 위에 탭 UI를 올린 클라이언트 컴포넌트. FrameworkTimeline은 StepPlayer 기반 타임라인 시각화. MDX 글은 기존 시리즈 패턴을 따른다.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS v4, Shiki, next-mdx-remote, Framer Motion

---

### Task 1: 시리즈 메타데이터 등록

**Files:**
- Modify: `content/series.json`

- [ ] **Step 1: series.json에 framework-philosophies 추가**

`content/series.json`의 배열 마지막에 추가:

```json
{
  "slug": "framework-philosophies",
  "title": "프레임워크의 철학",
  "description": "React, Vue, Angular, Svelte — 같은 문제를 다른 철학으로 푸는 네 가지 방법을 비교합니다",
  "category": "JavaScript"
}
```

- [ ] **Step 2: 빌드 확인**

Run: `npx next build 2>&1 | tail -5`
Expected: 빌드 성공, `/series/framework-philosophies` 경로가 생성됨

- [ ] **Step 3: 커밋**

```bash
git add content/series.json
git commit -m "feat: add framework-philosophies series metadata"
```

---

### Task 2: CodeTabs 프리미티브 컴포넌트

**Files:**
- Create: `src/components/viz/primitives/CodeTabs.tsx`

- [ ] **Step 1: CodeTabs 컴포넌트 작성**

`src/components/viz/primitives/CodeTabs.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { codeToHtml } from "shiki";

interface Tab {
  label: string;
  lang: string;
  code: string;
}

interface CodeTabsProps {
  tabs: Tab[];
}

const frameworkColors: Record<string, { active: string; indicator: string }> = {
  React: {
    active: "text-sky-700 dark:text-sky-300",
    indicator: "bg-sky-500 dark:bg-sky-400",
  },
  Vue: {
    active: "text-emerald-700 dark:text-emerald-300",
    indicator: "bg-emerald-500 dark:bg-emerald-400",
  },
  Angular: {
    active: "text-rose-700 dark:text-rose-300",
    indicator: "bg-rose-500 dark:bg-rose-400",
  },
  Svelte: {
    active: "text-orange-700 dark:text-orange-300",
    indicator: "bg-orange-500 dark:bg-orange-400",
  },
};

const STORAGE_KEY = "ray-book-code-tab";

export function CodeTabs({ tabs }: CodeTabsProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [htmlMap, setHtmlMap] = useState<Record<number, string>>({});

  // Restore last selected tab from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const idx = tabs.findIndex((t) => t.label === saved);
        if (idx >= 0) setActiveIdx(idx);
      }
    } catch {}
  }, [tabs]);

  // Highlight code with Shiki
  useEffect(() => {
    let cancelled = false;
    async function highlight() {
      const html = await codeToHtml(tabs[activeIdx].code, {
        lang: tabs[activeIdx].lang,
        themes: { light: "github-light", dark: "github-dark" },
        defaultColor: false,
      });
      if (!cancelled) {
        setHtmlMap((prev) => ({ ...prev, [activeIdx]: html }));
      }
    }
    if (!htmlMap[activeIdx]) {
      highlight();
    }
    return () => { cancelled = true; };
  }, [activeIdx, tabs, htmlMap]);

  function selectTab(idx: number) {
    setActiveIdx(idx);
    try {
      localStorage.setItem(STORAGE_KEY, tabs[idx].label);
    } catch {}
  }

  const activeTab = tabs[activeIdx];
  const colors = frameworkColors[activeTab.label] ?? {
    active: "text-accent",
    indicator: "bg-accent",
  };

  return (
    <div className="my-8 border border-border">
      {/* Tab bar */}
      <div className="flex border-b border-border">
        {tabs.map((tab, i) => {
          const isActive = i === activeIdx;
          const tabColors = frameworkColors[tab.label];
          return (
            <button
              key={tab.label}
              onClick={() => selectTab(i)}
              className={`
                relative px-4 py-2.5 text-[0.75rem] font-medium transition-colors
                ${isActive
                  ? tabColors?.active ?? "text-accent"
                  : "text-muted hover:text-text"
                }
              `}
            >
              {tab.label}
              {isActive && (
                <span
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${tabColors?.indicator ?? "bg-accent"}`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Code area */}
      <div
        className="overflow-x-auto text-[0.8125rem] [&_pre]:border-0 [&_pre]:p-5 [&_pre]:leading-relaxed"
        style={{ minHeight: 120 }}
        dangerouslySetInnerHTML={{ __html: htmlMap[activeIdx] ?? "" }}
      />
    </div>
  );
}
```

- [ ] **Step 2: MDX 컴포넌트 매핑에 등록**

`src/lib/mdx-components.tsx`의 import에 추가:

```tsx
import { CodeTabs } from "@/components/viz/primitives/CodeTabs";
```

그리고 `mdxComponents` 객체에 추가:

```tsx
export const mdxComponents: MDXComponents = {
  ...domainComponents,
  Term,
  CodeTabs,  // 추가
  table: ...
```

- [ ] **Step 3: 빌드 확인**

Run: `npx next build 2>&1 | tail -5`
Expected: 빌드 성공

- [ ] **Step 4: 커밋**

```bash
git add src/components/viz/primitives/CodeTabs.tsx src/lib/mdx-components.tsx
git commit -m "feat: add CodeTabs primitive for framework code comparison"
```

---

### Task 3: FrameworkTimeline 시각화 컴포넌트

**Files:**
- Create: `src/components/viz/domain/framework-philosophies/FrameworkTimeline.tsx`
- Create: `src/components/viz/domain/framework-philosophies/index.ts`

- [ ] **Step 1: 서브폴더 및 index.ts 생성**

`src/components/viz/domain/framework-philosophies/index.ts`:

```ts
export { FrameworkTimeline } from "./FrameworkTimeline";
```

- [ ] **Step 2: domain/index.ts에 re-export 추가**

`src/components/viz/domain/index.ts`에 추가:

```ts
export * from "./framework-philosophies";
```

- [ ] **Step 3: FrameworkTimeline 컴포넌트 작성**

`src/components/viz/domain/framework-philosophies/FrameworkTimeline.tsx`:

```tsx
"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

interface FrameworkEntry {
  year: number;
  name: string;
  color: string;
  tagline: string;
  detail: string;
}

const frameworks: FrameworkEntry[] = [
  {
    year: 2006,
    name: "jQuery",
    color: "bg-stone-400",
    tagline: "Write less, do more",
    detail: "DOM 조작을 간편하게 만들었지만, 앱이 커지면 상태와 UI의 동기화가 고통이 됩니다.",
  },
  {
    year: 2010,
    name: "Angular.js",
    color: "bg-rose-500 dark:bg-rose-400",
    tagline: "양방향 바인딩의 시작",
    detail: "HTML을 확장하여 선언적 UI를 도입했습니다. 양방향 데이터 바인딩으로 상태-UI 동기화 문제를 풀었지만, dirty checking의 성능 한계가 있었습니다.",
  },
  {
    year: 2013,
    name: "React",
    color: "bg-sky-500 dark:bg-sky-400",
    tagline: "UI를 함수로 표현하라",
    detail: "UI = f(state). 단방향 데이터 흐름과 Virtual DOM으로 예측 가능한 렌더링을 구현했습니다. '라이브러리'를 표방하며 뷰 레이어에만 집중합니다.",
  },
  {
    year: 2014,
    name: "Vue",
    color: "bg-emerald-500 dark:bg-emerald-400",
    tagline: "점진적으로 채택하라",
    detail: "Angular의 템플릿 + React의 컴포넌트 모델을 결합했습니다. 진입 장벽을 낮추면서도 대규모 앱까지 확장 가능한 '점진적 프레임워크'를 지향합니다.",
  },
  {
    year: 2016,
    name: "Svelte",
    color: "bg-orange-500 dark:bg-orange-400",
    tagline: "런타임을 없애라",
    detail: "프레임워크를 컴파일러로 재정의했습니다. 빌드 타임에 최적화된 순수 JS를 생성하여 런타임 오버헤드를 제거합니다. '프레임워크가 아닌 컴파일러'를 표방합니다.",
  },
];

function TimelineDot({ entry, isActive }: { entry: FrameworkEntry; isActive: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-center">
        <span className="font-mono text-[0.65rem] text-muted">{entry.year}</span>
        <span
          className={`mt-1 h-4 w-4 rounded-full transition-all duration-300 ${entry.color} ${
            isActive ? "scale-125 ring-2 ring-offset-2 ring-offset-bg" : "opacity-50"
          }`}
          style={isActive ? { boxShadow: "0 0 8px currentColor" } : {}}
        />
      </div>
      <div className={`transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-40"}`}>
        <span className="text-[0.8125rem] font-bold text-text">{entry.name}</span>
        <span className="ml-2 text-[0.6875rem] italic text-muted">{entry.tagline}</span>
      </div>
    </div>
  );
}

export function FrameworkTimeline() {
  const stepNodes = frameworks.map((entry, idx) => (
    <div key={entry.name} className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-bold text-accent">
          {entry.year} — {entry.name}
        </span>
        <span className="text-[0.6875rem] text-muted">
          {idx + 1} / {frameworks.length}
        </span>
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        {frameworks.map((fw, i) => (
          <TimelineDot key={fw.name} entry={fw} isActive={i <= idx} />
        ))}
      </div>

      {/* Detail */}
      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {entry.detail}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
```

- [ ] **Step 4: 빌드 확인**

Run: `npx next build 2>&1 | tail -5`
Expected: 빌드 성공

- [ ] **Step 5: 커밋**

```bash
git add src/components/viz/domain/framework-philosophies/ src/components/viz/domain/index.ts
git commit -m "feat: add FrameworkTimeline visualization component"
```

---

### Task 4: Article 1 — 왜 프레임워크가 필요했는가

**Files:**
- Create: `content/posts/why-frameworks.mdx`

- [ ] **Step 1: MDX 글 작성**

`content/posts/why-frameworks.mdx` — 아래 내용으로 작성:

프론트매터:
```yaml
---
title: "왜 프레임워크가 필요했는가"
description: "jQuery의 한계에서 선언적 UI의 등장까지 — React, Vue, Angular, Svelte가 같은 시대에 다른 답을 내놓은 이유"
date: 2026-04-05
tags: ["framework", "react", "vue", "angular", "svelte", "history"]
series: "framework-philosophies"
seriesOrder: 1
draft: false
---
```

글 구조:
1. **핵심 질문**: "왜 우리는 프레임워크를 쓰는가?"
2. **jQuery 시대의 고통**: 명령형 DOM 조작 예제 → 상태와 UI 동기화 문제
3. **선언적 UI의 아이디어**: "상태가 바뀌면 UI가 자동으로 바뀌면 좋겠다"
4. `<FrameworkTimeline />` 시각화
5. **4가지 답**: Angular(양방향 바인딩), React(단방향+VDOM), Vue(점진적), Svelte(컴파일러)
6. **CodeTabs로 같은 카운터 앱 4가지 구현 비교**
7. **다음 글 연결**: "반응성 — 변경을 어떻게 감지하는가"

**중요**: 글 작성 후 공식 문서 크로스체크 필수 — 각 프레임워크 최초 릴리스 연도, 핵심 철학 설명의 정확성

- [ ] **Step 2: 빌드 확인**

Run: `npx next build 2>&1 | tail -5`
Expected: 빌드 성공, `/posts/why-frameworks` 경로 생성

- [ ] **Step 3: Playwright 스크린샷 확인**

시각화 컴포넌트 렌더링 확인 — 텍스트 오버플로우, 겹침 체크

- [ ] **Step 4: 커밋**

```bash
git add content/posts/why-frameworks.mdx
git commit -m "feat: add article 1 — why frameworks were needed"
```

---

### Task 5: 최종 검증 및 푸시

- [ ] **Step 1: 전체 빌드**

Run: `npx next build 2>&1 | tail -10`
Expected: 빌드 성공, 모든 경로 정상

- [ ] **Step 2: 시리즈 페이지 확인**

`/series/framework-philosophies` 에서 1편이 목록에 나타나는지 확인

- [ ] **Step 3: 푸시**

```bash
git push origin main
```
