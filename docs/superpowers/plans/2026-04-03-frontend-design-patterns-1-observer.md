# 프론트엔드 디자인 패턴 시리즈 — 인프라 + 1편 Observer/Pub-Sub 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 프론트엔드 디자인 패턴 시리즈의 인프라를 설정하고, 1편 Observer/Pub-Sub 글과 시각화 컴포넌트를 완성한다.

**Architecture:** 기존 블로그 인프라(Next.js + MDX + StepPlayer) 위에 새 시리즈를 추가한다. 시각화 컴포넌트는 `ObserverPubSub.tsx`로 생성하고(기존 `ObserverPattern.tsx`는 MutationObserver/IntersectionObserver용이므로 이름 충돌 방지), `mdx-components.tsx`에 등록한다.

**Tech Stack:** Next.js 15, MDX, React, Tailwind CSS v4, Framer Motion, StepPlayer primitive

**참고 — 기존 `ObserverPattern` 컴포넌트:** `src/components/viz/domain/ObserverPattern.tsx`는 `dom-and-events` 시리즈의 MutationObserver/IntersectionObserver 시각화다. 디자인 패턴 시리즈의 Observer 패턴과는 다른 주제이므로, 새 컴포넌트 이름은 `ObserverPubSub`으로 한다.

---

### Task 1: 시리즈 메타데이터 등록

**Files:**
- Modify: `content/series.json`

- [ ] **Step 1: `series.json`에 새 시리즈 추가**

`content/series.json`의 마지막 항목(`os-fundamentals`) 뒤에 새 시리즈를 추가한다:

```json
  {
    "slug": "os-fundamentals",
    "title": "운영체제 기초",
    "description": "코드가 실행되는 무대 뒤 — 프로세스, 스케줄링, 동기화, 메모리, I/O를 시각화합니다",
    "category": "CS"
  },
  {
    "slug": "frontend-design-patterns",
    "title": "프론트엔드 디자인 패턴",
    "description": "프론트엔드 코드에서 자주 만나는 디자인 패턴을 인터랙티브 시각화로 이해합니다",
    "category": "JavaScript"
  }
]
```

- [ ] **Step 2: 빌드 확인**

Run: `npm run build 2>&1 | tail -5`
Expected: 빌드 성공. 시리즈 메타데이터 파싱에 문제 없음.

- [ ] **Step 3: 커밋**

```bash
git add content/series.json
git commit -m "feat: add frontend-design-patterns series metadata"
```

---

### Task 2: ObserverPubSub 시각화 컴포넌트 생성

**Files:**
- Create: `src/components/viz/domain/ObserverPubSub.tsx`

이 컴포넌트는 세 가지 프리셋을 제공한다:
- `"basic"` — Subject + Observer 패턴의 구독/해제/알림 동작을 스텝별로 시각화
- `"pubsub"` — Pub/Sub 중간 채널을 통한 완전한 디커플링 시각화
- `"comparison"` — 직접 호출 vs Observer vs Pub/Sub 세 방식의 결합도 비교

**시각화 설계:**
- 노드(원) 기반 그래프: Subject(중앙)와 Observer들(주변)
- 구독 시 연결선 생성, 해제 시 연결선 제거 애니메이션
- 알림 시 Subject → 각 Observer로 펄스 전파 애니메이션
- StepPlayer 기반으로 스텝별 진행

- [ ] **Step 1: 컴포넌트 파일 생성**

`src/components/viz/domain/ObserverPubSub.tsx`를 생성한다.

컴포넌트 구조:
- `"use client"` 선언
- `StepPlayer` import
- 타입 정의: `Node` (id, label, x, y, color), `Connection` (from, to, active), `ObserverStep` (nodes, connections, description, label, highlight)
- 프리셋별 스텝 데이터를 상수로 정의
- `NodeGraph` 내부 컴포넌트: SVG 기반으로 노드와 연결선을 렌더링
- `ObserverPubSub` export: `preset` prop을 받아 해당 스텝 데이터를 `StepPlayer`에 전달

```tsx
"use client";

import { StepPlayer } from "../primitives/StepPlayer";

/* ─── Types ─── */

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  type: "subject" | "observer" | "channel";
  active?: boolean;
}

interface Connection {
  from: string;
  to: string;
  active?: boolean;
  label?: string;
}

interface Step {
  nodes: Node[];
  connections: Connection[];
  description: string;
  label: string;
  codeSnippet?: string;
}

/* ─── Node Graph Renderer ─── */

function NodeGraph({ nodes, connections }: { nodes: Node[]; connections: Connection[] }) {
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  const typeStyles: Record<string, { bg: string; border: string; text: string }> = {
    subject: {
      bg: "fill-amber-400 dark:fill-amber-500",
      border: "stroke-amber-600 dark:stroke-amber-400",
      text: "fill-amber-900 dark:fill-amber-100",
    },
    observer: {
      bg: "fill-sky-400 dark:fill-sky-500",
      border: "stroke-sky-600 dark:stroke-sky-400",
      text: "fill-sky-900 dark:fill-sky-100",
    },
    channel: {
      bg: "fill-violet-400 dark:fill-violet-500",
      border: "stroke-violet-600 dark:stroke-violet-400",
      text: "fill-violet-900 dark:fill-violet-100",
    },
  };

  return (
    <svg viewBox="0 0 400 200" className="w-full" style={{ maxHeight: 200 }}>
      {/* Connections */}
      {connections.map((conn, i) => {
        const from = nodeMap[conn.from];
        const to = nodeMap[conn.to];
        if (!from || !to) return null;
        return (
          <line
            key={i}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            className={conn.active
              ? "stroke-accent stroke-2 transition-all duration-300"
              : "stroke-border stroke-1 transition-all duration-300"}
            strokeDasharray={conn.active ? "none" : "4 4"}
          />
        );
      })}
      {/* Nodes */}
      {nodes.map((node) => {
        const style = typeStyles[node.type];
        return (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r={node.active ? 26 : 22}
              className={`${style.bg} ${style.border} stroke-2 transition-all duration-300`}
              opacity={node.active === false ? 0.3 : 1}
            />
            <text
              x={node.x}
              y={node.y + 1}
              textAnchor="middle"
              dominantBaseline="central"
              className={`${style.text} text-[0.55rem] font-bold`}
            >
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Legend ─── */

function Legend({ showChannel }: { showChannel?: boolean }) {
  const items = [
    { color: "bg-amber-400 dark:bg-amber-500", label: "Subject / Publisher" },
    { color: "bg-sky-400 dark:bg-sky-500", label: "Observer / Subscriber" },
    ...(showChannel ? [{ color: "bg-violet-400 dark:bg-violet-500", label: "Event Channel" }] : []),
  ];

  return (
    <div className="flex flex-wrap gap-3 text-[0.6875rem] text-muted">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${it.color}`} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

/* ─── Basic Observer Steps ─── */

const basicSteps: Step[] = [
  {
    nodes: [
      { id: "subject", label: "Subject", x: 200, y: 100, type: "subject", active: true },
      { id: "obs1", label: "Obs A", x: 80, y: 40, type: "observer" },
      { id: "obs2", label: "Obs B", x: 80, y: 160, type: "observer" },
      { id: "obs3", label: "Obs C", x: 320, y: 100, type: "observer" },
    ],
    connections: [],
    description: "Subject(관찰 대상)와 Observer(관찰자) 3개가 있습니다. 아직 아무도 구독하지 않았습니다.",
    label: "초기 상태",
  },
  {
    nodes: [
      { id: "subject", label: "Subject", x: 200, y: 100, type: "subject", active: true },
      { id: "obs1", label: "Obs A", x: 80, y: 40, type: "observer", active: true },
      { id: "obs2", label: "Obs B", x: 80, y: 160, type: "observer" },
      { id: "obs3", label: "Obs C", x: 320, y: 100, type: "observer" },
    ],
    connections: [{ from: "subject", to: "obs1", active: true }],
    description: "Observer A가 Subject를 구독합니다. subject.subscribe(observerA) — Subject의 내부 리스트에 Observer A가 추가됩니다.",
    label: "구독: Observer A",
    codeSnippet: "subject.subscribe(observerA);",
  },
  {
    nodes: [
      { id: "subject", label: "Subject", x: 200, y: 100, type: "subject", active: true },
      { id: "obs1", label: "Obs A", x: 80, y: 40, type: "observer", active: true },
      { id: "obs2", label: "Obs B", x: 80, y: 160, type: "observer", active: true },
      { id: "obs3", label: "Obs C", x: 320, y: 100, type: "observer", active: true },
    ],
    connections: [
      { from: "subject", to: "obs1", active: true },
      { from: "subject", to: "obs2", active: true },
      { from: "subject", to: "obs3", active: true },
    ],
    description: "Observer B, C도 구독합니다. 이제 Subject의 구독자 목록에 3개의 Observer가 있습니다.",
    label: "전원 구독 완료",
    codeSnippet: "subject.subscribe(observerB);\nsubject.subscribe(observerC);",
  },
  {
    nodes: [
      { id: "subject", label: "Subject", x: 200, y: 100, type: "subject", active: true },
      { id: "obs1", label: "Obs A", x: 80, y: 40, type: "observer", active: true },
      { id: "obs2", label: "Obs B", x: 80, y: 160, type: "observer", active: true },
      { id: "obs3", label: "Obs C", x: 320, y: 100, type: "observer", active: true },
    ],
    connections: [
      { from: "subject", to: "obs1", active: true },
      { from: "subject", to: "obs2", active: true },
      { from: "subject", to: "obs3", active: true },
    ],
    description: "Subject의 상태가 변경됩니다! notify()가 호출되어 모든 Observer의 update() 메서드가 순차적으로 실행됩니다. Subject는 Observer가 누구인지, 몇 명인지 신경 쓰지 않습니다.",
    label: "상태 변경 → notify()",
    codeSnippet: "subject.notify(newState);\n// → observerA.update(newState)\n// → observerB.update(newState)\n// → observerC.update(newState)",
  },
  {
    nodes: [
      { id: "subject", label: "Subject", x: 200, y: 100, type: "subject", active: true },
      { id: "obs1", label: "Obs A", x: 80, y: 40, type: "observer" },
      { id: "obs2", label: "Obs B", x: 80, y: 160, type: "observer", active: true },
      { id: "obs3", label: "Obs C", x: 320, y: 100, type: "observer", active: true },
    ],
    connections: [
      { from: "subject", to: "obs2", active: true },
      { from: "subject", to: "obs3", active: true },
    ],
    description: "Observer A가 구독을 해제합니다. subject.unsubscribe(observerA) — 이후 notify()가 호출되어도 A에게는 알림이 가지 않습니다.",
    label: "구독 해제: Observer A",
    codeSnippet: "subject.unsubscribe(observerA);",
  },
  {
    nodes: [
      { id: "subject", label: "Subject", x: 200, y: 100, type: "subject", active: true },
      { id: "obs1", label: "Obs A", x: 80, y: 40, type: "observer" },
      { id: "obs2", label: "Obs B", x: 80, y: 160, type: "observer", active: true },
      { id: "obs3", label: "Obs C", x: 320, y: 100, type: "observer", active: true },
    ],
    connections: [
      { from: "subject", to: "obs2", active: true },
      { from: "subject", to: "obs3", active: true },
    ],
    description: "다시 상태가 변경됩니다. 이번에는 B와 C만 알림을 받습니다. 핵심: Subject와 Observer 사이의 결합은 subscribe/unsubscribe 인터페이스로만 이루어집니다.",
    label: "두 번째 notify()",
    codeSnippet: "subject.notify(anotherState);\n// → observerB.update(anotherState)\n// → observerC.update(anotherState)\n// observerA는 호출되지 않음",
  },
];

/* ─── Pub/Sub Steps ─── */

const pubsubSteps: Step[] = [
  {
    nodes: [
      { id: "pub", label: "Publisher", x: 60, y: 100, type: "subject", active: true },
      { id: "channel", label: "Event\nChannel", x: 200, y: 100, type: "channel", active: true },
      { id: "sub1", label: "Sub A", x: 340, y: 40, type: "observer" },
      { id: "sub2", label: "Sub B", x: 340, y: 160, type: "observer" },
    ],
    connections: [],
    description: "Pub/Sub 패턴에서는 Publisher와 Subscriber가 서로를 직접 알지 못합니다. 중간의 Event Channel(또는 Event Bus)이 메시지를 중계합니다.",
    label: "초기 상태",
  },
  {
    nodes: [
      { id: "pub", label: "Publisher", x: 60, y: 100, type: "subject", active: true },
      { id: "channel", label: "Event\nChannel", x: 200, y: 100, type: "channel", active: true },
      { id: "sub1", label: "Sub A", x: 340, y: 40, type: "observer", active: true },
      { id: "sub2", label: "Sub B", x: 340, y: 160, type: "observer" },
    ],
    connections: [{ from: "channel", to: "sub1", active: true }],
    description: "Subscriber A가 'userLogin' 이벤트를 구독합니다. Channel에 등록할 뿐, Publisher가 누구인지는 모릅니다.",
    label: "구독: 'userLogin'",
    codeSnippet: "eventBus.on('userLogin', subscriberA);",
  },
  {
    nodes: [
      { id: "pub", label: "Publisher", x: 60, y: 100, type: "subject", active: true },
      { id: "channel", label: "Event\nChannel", x: 200, y: 100, type: "channel", active: true },
      { id: "sub1", label: "Sub A", x: 340, y: 40, type: "observer", active: true },
      { id: "sub2", label: "Sub B", x: 340, y: 160, type: "observer", active: true },
    ],
    connections: [
      { from: "channel", to: "sub1", active: true },
      { from: "channel", to: "sub2", active: true },
    ],
    description: "Subscriber B도 같은 이벤트를 구독합니다. Publisher는 구독자가 몇 명인지, 누구인지 전혀 알 수 없습니다.",
    label: "구독: Sub B 추가",
    codeSnippet: "eventBus.on('userLogin', subscriberB);",
  },
  {
    nodes: [
      { id: "pub", label: "Publisher", x: 60, y: 100, type: "subject", active: true },
      { id: "channel", label: "Event\nChannel", x: 200, y: 100, type: "channel", active: true },
      { id: "sub1", label: "Sub A", x: 340, y: 40, type: "observer", active: true },
      { id: "sub2", label: "Sub B", x: 340, y: 160, type: "observer", active: true },
    ],
    connections: [
      { from: "pub", to: "channel", active: true },
      { from: "channel", to: "sub1", active: true },
      { from: "channel", to: "sub2", active: true },
    ],
    description: "Publisher가 'userLogin' 이벤트를 발행합니다. Channel이 해당 이벤트의 모든 구독자에게 메시지를 전달합니다. Publisher → Channel → Subscribers. 완전한 디커플링!",
    label: "이벤트 발행",
    codeSnippet: "eventBus.emit('userLogin', { userId: 42 });\n// Channel이 Sub A, Sub B에게 전달",
  },
  {
    nodes: [
      { id: "pub", label: "Publisher", x: 60, y: 100, type: "subject", active: true },
      { id: "channel", label: "Event\nChannel", x: 200, y: 100, type: "channel", active: true },
      { id: "sub1", label: "Sub A", x: 340, y: 40, type: "observer" },
      { id: "sub2", label: "Sub B", x: 340, y: 160, type: "observer", active: true },
    ],
    connections: [
      { from: "channel", to: "sub2", active: true },
    ],
    description: "Observer 패턴과의 차이: Observer에서는 Subject가 Observer 목록을 직접 관리합니다. Pub/Sub에서는 Channel이 중재자 역할을 하므로 Publisher와 Subscriber가 완전히 분리됩니다.",
    label: "Observer vs Pub/Sub",
    codeSnippet: "// Observer: subject.subscribe(observer)\n//   → Subject가 Observer를 직접 앎\n// Pub/Sub: bus.on('event', handler)\n//   → Publisher는 Subscriber를 모름",
  },
];

/* ─── Presets ─── */

const presets: Record<string, { steps: Step[]; showChannel: boolean }> = {
  basic: { steps: basicSteps, showChannel: false },
  pubsub: { steps: pubsubSteps, showChannel: true },
};

/* ─── Main Component ─── */

interface ObserverPubSubProps {
  preset?: string;
}

export function ObserverPubSub({ preset = "basic" }: ObserverPubSubProps) {
  const config = presets[preset] ?? presets["basic"];

  const stepNodes = config.steps.map((step, idx) => (
    <div key={idx} className="space-y-4">
      {step.label && (
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-bold text-accent">
            {step.label}
          </span>
          <span className="text-[0.6875rem] text-muted">
            {idx + 1} / {config.steps.length}
          </span>
        </div>
      )}

      <NodeGraph nodes={step.nodes} connections={step.connections} />

      <Legend showChannel={config.showChannel} />

      {step.codeSnippet && (
        <pre className="rounded border border-border bg-surface p-3 font-mono text-xs leading-relaxed text-muted">
          {step.codeSnippet}
        </pre>
      )}

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
```

- [ ] **Step 2: TypeScript 타입 체크**

Run: `npx tsc --noEmit --pretty 2>&1 | grep -i "ObserverPubSub" || echo "No type errors"`
Expected: 타입 에러 없음.

---

### Task 3: MDX 컴포넌트 등록

**Files:**
- Modify: `src/lib/mdx-components.tsx`

- [ ] **Step 1: import 추가**

`src/lib/mdx-components.tsx`의 import 섹션, `PwaManifest` import 다음에 추가:

```typescript
import { ObserverPubSub } from "@/components/viz/domain/ObserverPubSub";
```

- [ ] **Step 2: mdxComponents 객체에 등록**

`mdxComponents` 객체에서 `PwaManifest,` 다음 줄에 추가:

```typescript
  ObserverPubSub,
```

- [ ] **Step 3: 빌드 확인**

Run: `npm run build 2>&1 | tail -5`
Expected: 빌드 성공.

- [ ] **Step 4: 커밋**

```bash
git add src/components/viz/domain/ObserverPubSub.tsx src/lib/mdx-components.tsx
git commit -m "feat: add ObserverPubSub visualization component"
```

---

### Task 4: Term 용어 추가

**Files:**
- Modify: `src/components/viz/primitives/Term.tsx`

- [ ] **Step 1: 디자인 패턴 관련 용어 추가**

`src/components/viz/primitives/Term.tsx`의 `terms` 객체에 다음 항목들을 추가한다 (기존 항목의 알파벳 순서에 맞춰 적절한 위치에 삽입):

```typescript
  "observer-pattern": {
    title: "옵저버 패턴",
    emoji: "👀",
    description: "객체의 상태가 변경될 때, 의존하는 모든 객체에게 자동으로 알림을 보내는 디자인 패턴. Subject(관찰 대상)와 Observer(관찰자)로 구성됩니다.",
    analogy: "유튜브 구독과 비슷합니다 — 채널(Subject)에 새 영상이 올라오면 구독자(Observer) 전원에게 알림이 갑니다.",
  },
  "pub-sub": {
    title: "Pub/Sub 패턴",
    emoji: "📡",
    description: "Publisher와 Subscriber가 서로를 직접 알지 못하고, 중간의 Event Channel을 통해 메시지를 주고받는 패턴. Observer 패턴보다 결합도가 더 낮습니다.",
    analogy: "라디오 방송과 비슷합니다 — 방송국(Publisher)은 청취자가 누구인지 모르고, 청취자(Subscriber)도 방송국의 내부를 모릅니다. 주파수(Channel)만 맞추면 됩니다.",
  },
  "design-pattern": {
    title: "디자인 패턴",
    emoji: "🧩",
    description: "소프트웨어 설계에서 자주 발생하는 문제에 대한 재사용 가능한 해결책. GoF(Gang of Four)가 정리한 23개 패턴이 대표적입니다.",
  },
```

- [ ] **Step 2: 빌드 확인**

Run: `npx tsc --noEmit --pretty 2>&1 | grep -i "Term" | head -5 || echo "No type errors"`
Expected: 타입 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add src/components/viz/primitives/Term.tsx
git commit -m "feat: add design pattern terms (observer, pub-sub, design-pattern)"
```

---

### Task 5: MDX 글 작성 — Observer/Pub-Sub

**Files:**
- Create: `content/posts/observer-and-pubsub.mdx`

- [ ] **Step 1: MDX 파일 생성**

`content/posts/observer-and-pubsub.mdx`를 생성한다. 기존 글들의 구조를 따르되, 스펙에 정의한 6단계 구조(문제 상황 → 패턴 소개 → 시각화 → Before/After → 실전 사례 → 다음 글 연결)를 적용한다.

프론트매터:

```yaml
---
title: "Observer와 Pub/Sub — 이벤트 기반 소통"
description: "상태 변경을 자동으로 전파하는 Observer 패턴과 완전한 디커플링을 제공하는 Pub/Sub 패턴을 시각화합니다"
date: 2026-04-03
tags: ["design-pattern", "observer", "pub-sub", "event-driven"]
series: "frontend-design-patterns"
seriesOrder: 1
draft: false
---
```

본문 구조 (주요 섹션):

```markdown
## 문제: 상태 변경을 어떻게 전파할까?

[장바구니 예시 — 아이템 추가 시 헤더의 배지 수, 합계 금액, 추천 상품이 모두 업데이트되어야 하는 상황]
[직접 호출 방식의 코드 — cart.addItem() 안에서 header.updateBadge(), total.recalculate(), recommend.refresh()를 직접 호출]
[문제점: 결합도 폭발, 새 기능 추가 시마다 cart.addItem 수정 필요]

## Observer 패턴

[GoF 정의 간단 언급 — "객체 사이에 1:N 의존 관계를 정의하여, 한 객체의 상태가 변경되면 의존 객체 모두에게 통지"]
[핵심 구조: Subject (subscribe, unsubscribe, notify) + Observer (update)]

<ObserverPubSub preset="basic" />

### 직접 구현

[Before/After 코드]
[Before: cart.addItem() 안에 직접 호출 코드]
[After: Subject 클래스 구현 + Observer 인터페이스]

### DOM에서의 Observer

[addEventListener가 Observer 패턴의 구현체라는 설명]
[코드 예시: button.addEventListener('click', handler)]

## Pub/Sub — 완전한 디커플링

[Observer와의 차이: Subject가 Observer를 직접 아는가 vs 모르는가]

<ObserverPubSub preset="pubsub" />

### Event Bus 구현

[간단한 EventBus 클래스 구현 코드]

## 프론트엔드 실전 사례

### 1. DOM EventTarget
[CustomEvent + dispatchEvent 예시]

### 2. Redux Store
[store.subscribe()가 Observer 패턴이라는 설명]

### 3. Node.js EventEmitter
[EventEmitter가 Pub/Sub 패턴이라는 설명]

## 언제 Observer, 언제 Pub/Sub?

[비교 표: 결합도, 타입 안전성, 디버깅 용이성, 사용 사례]

## 다음 글: Strategy 패턴

[예고: if/else 분기를 전략 객체로 교체하는 Strategy 패턴]
```

참고:
- `<Term id="observer-pattern">`, `<Term id="pub-sub">`, `<Term id="design-pattern">` 등 Term 컴포넌트를 적절히 활용
- 코드 예시는 ```javascript 코드블록 사용
- 기존 시리즈의 관련 글에 대한 언급(이벤트 루프, DOM 이벤트 등) 포함

- [ ] **Step 2: 빌드 확인**

Run: `npm run build 2>&1 | tail -10`
Expected: 빌드 성공. 새 글이 정상적으로 생성됨.

- [ ] **Step 3: 로컬에서 페이지 확인**

Run: `npm run dev &`
브라우저에서 해당 글 URL로 접속하여 시각화 컴포넌트가 정상적으로 렌더링되는지, StepPlayer 네비게이션이 작동하는지 확인.

- [ ] **Step 4: 커밋**

```bash
git add content/posts/observer-and-pubsub.mdx
git commit -m "feat: add article 1 — Observer and Pub/Sub pattern"
```

---

### Task 6: 최종 빌드 검증

- [ ] **Step 1: 전체 빌드 확인**

Run: `npm run build 2>&1 | tail -20`
Expected: 빌드 성공, 에러 없음.

- [ ] **Step 2: 정적 출력 확인**

Run: `ls out/ | grep observer`
Expected: observer 관련 페이지가 생성됨.

- [ ] **Step 3: 최종 커밋 (필요한 경우)**

빌드 과정에서 수정이 필요한 파일이 있었다면 여기서 커밋.
