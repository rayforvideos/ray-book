# 프레임워크의 철학 시리즈 설계

## 개요

- **시리즈 슬러그**: `framework-philosophies`
- **시리즈 제목**: 프레임워크의 철학
- **카테고리**: JavaScript
- **총 글 수**: 8편
- **핵심 메시지**: 프레임워크는 도구일 뿐이다. React, Vue, Angular, Svelte는 같은 문제를 다른 철학으로 풀었을 뿐이고, 그 철학을 이해하면 어떤 프레임워크든 빠르게 익힐 수 있다.
- **톤**: 중립 비교 — 각 접근을 동등하게 나열하고 독자가 판단하게 함
- **구조**: 1편 조감도 + 7편 문제별 심층

## 글 목록 및 시각화

### 1. 왜 프레임워크가 필요했는가

- **파일명**: `why-frameworks.mdx`
- **seriesOrder**: 1
- **핵심 질문**: jQuery 시대에 무엇이 문제였고, 선언적 UI가 어떻게 등장했는가
- **내용**:
  - 명령형 DOM 조작의 고통 (상태와 UI의 동기화 문제)
  - "상태가 바뀌면 UI가 자동으로 바뀌면 좋겠다" — 선언적 UI의 핵심 아이디어
  - 4개 프레임워크가 같은 시대에 다른 답을 내놓은 배경
  - Angular (2010): 풀스택 프레임워크, 양방향 바인딩
  - React (2013): UI 라이브러리, 단방향 데이터 흐름, Virtual DOM
  - Vue (2014): 점진적 프레임워크, Angular + React의 좋은 점 조합
  - Svelte (2016): 컴파일러 접근, "런타임 없는 프레임워크"
- **시각화**: 타임라인 — jQuery(2006) → Angular(2010) → React(2013) → Vue(2014) → Svelte(2016) → 현재. 각 등장 시점의 핵심 아이디어를 스텝별로
- **컴포넌트**: `FrameworkTimeline.tsx`

### 2. 반응성 — 변경을 어떻게 감지하는가

- **파일명**: `reactivity-compared.mdx`
- **seriesOrder**: 2
- **핵심 질문**: 상태가 바뀌면 UI를 어떻게 업데이트하는가?
- **내용**:
  - 문제: 상태와 DOM의 동기화
  - React: setState → 렌더 함수 재실행 → Virtual DOM diff → DOM 패치
  - Vue: Proxy 기반 의존성 추적 → 변경된 부분만 자동 업데이트
  - Angular: Zone.js로 비동기 작업 감지 → Change Detection 사이클
  - Svelte: 컴파일 타임에 반응성 코드 생성 → 런타임 오버헤드 없음
  - 트레이드오프: 명시적 vs 암시적, 런타임 vs 컴파일 타임
- **시각화**: StepPlayer — 같은 카운터 앱(count++ → UI 업데이트)의 내부 흐름을 4가지로
- **코드 비교**: CodeTabs — 같은 카운터를 React/Vue/Angular/Svelte로 구현
- **컴포넌트**: `ReactivityCompared.tsx`
- **기존 연결**: Proxy 패턴 (디자인 패턴 시리즈), browser-rendering-pipeline 시리즈

### 3. 컴포넌트 모델 — UI를 어떻게 나누는가

- **파일명**: `component-model-compared.mdx`
- **seriesOrder**: 3
- **핵심 질문**: 컴포넌트란 무엇이고, 어떻게 구성하고 통신하는가?
- **내용**:
  - 컴포넌트의 정의: 함수(React), 옵션 객체/SFC(Vue), 클래스/standalone(Angular), .svelte 파일(Svelte)
  - Props 전달과 이벤트/콜백
  - Children/Slots: React의 children, Vue의 slots, Angular의 ng-content, Svelte의 slots
  - 라이프사이클: mount → update → destroy 의 4가지 표현
  - 합성(Composition) vs 상속
- **시각화**: StepPlayer — 컴포넌트 트리에서 props가 내려가고 이벤트가 올라오는 과정
- **코드 비교**: CodeTabs — 같은 TodoItem을 4가지로 구현
- **컴포넌트**: `ComponentModelCompared.tsx`

### 4. 렌더링 전략 — DOM을 어떻게 다루는가

- **파일명**: `rendering-strategy-compared.mdx`
- **seriesOrder**: 4
- **핵심 질문**: Virtual DOM은 왜 등장했고, 왜 Svelte는 버렸는가?
- **내용**:
  - 문제: DOM 조작은 비싸다 → 최소한으로 하고 싶다
  - React: Virtual DOM → diff → 최소 패치. "충분히 빠른" 범용 해법
  - Vue: Virtual DOM + 컴파일러 힌트 (정적 호이스팅, 패치 플래그)
  - Angular: Incremental DOM → Angular Signals로 전환 중
  - Svelte: 컴파일 타임에 정확한 DOM 업데이트 코드 생성. VDOM 없음
  - 벤치마크는 무의미한가? — "충분히 빠른" 것과 "이론적으로 최적인" 것의 차이
- **시각화**: StepPlayer — 같은 리스트 아이템 추가가 VDOM diff vs Svelte 컴파일 결과로 어떻게 다르게 DOM을 업데이트하는지
- **컴포넌트**: `RenderingStrategyCompared.tsx`
- **기존 연결**: browser-rendering-pipeline 시리즈

### 5. 상태 관리 — 데이터를 어떻게 공유하는가

- **파일명**: `state-management-compared.mdx`
- **seriesOrder**: 5
- **핵심 질문**: 컴포넌트 간 상태 공유를 어떻게 해결하는가?
- **내용**:
  - 문제: prop drilling, 전역 상태의 필요성
  - 로컬 상태 → Context/Provide → 전역 스토어의 발전
  - React: useState → useContext → Redux/Zustand/Jotai
  - Vue: ref/reactive → provide/inject → Pinia
  - Angular: Service + DI → NgRx/Signals
  - Svelte: $state → stores → Runes ($state, $derived, $effect)
  - 단방향 vs 양방향 데이터 흐름의 트레이드오프
- **시각화**: StepPlayer — 상태 흐름 다이어그램 (컴포넌트 A의 상태 변경이 컴포넌트 B에 도달하는 경로)
- **코드 비교**: CodeTabs — 같은 전역 카운터 스토어를 4가지로 구현
- **컴포넌트**: `StateManagementCompared.tsx`
- **기존 연결**: Observer 패턴, Mediator 패턴 (디자인 패턴 시리즈)

### 6. 템플릿 vs JSX — 뷰를 어떻게 기술하는가

- **파일명**: `template-vs-jsx.mdx`
- **seriesOrder**: 6
- **핵심 질문**: UI를 기술하는 방법이 왜 갈라졌는가?
- **내용**:
  - HTML 확장 (Vue template, Angular template, Svelte) vs JavaScript 확장 (JSX)
  - 조건부 렌더링: v-if vs {condition && ...} vs @if vs {#if}
  - 반복: v-for vs .map() vs @for vs {#each}
  - 이벤트 바인딩: @click vs onClick vs (click) vs on:click
  - 양방향 바인딩: v-model vs controlled input vs [(ngModel)] vs bind:value
  - 트레이드오프: 템플릿은 제약이 곧 최적화 기회, JSX는 자유가 곧 표현력
- **시각화**: 없음 (코드 비교가 주력)
- **코드 비교**: CodeTabs — 같은 필터링 가능한 리스트를 4가지 문법으로
- **컴포넌트**: 없음 (CodeTabs만 사용)

### 7. 빌드와 런타임 — 언제 일을 하는가

- **파일명**: `build-vs-runtime.mdx`
- **seriesOrder**: 7
- **핵심 질문**: 프레임워크는 컴파일 타임과 런타임 중 어디에 비중을 두는가?
- **내용**:
  - 스펙트럼: 순수 런타임(React) ↔ 컴파일러 중심(Svelte)
  - React: JSX → createElement, 거의 모든 것이 런타임
  - Vue: SFC 컴파일러가 템플릿 최적화, 런타임과 컴파일러의 협력
  - Angular: AOT 컴파일, 데코레이터 → 메타데이터, Ivy 렌더러
  - Svelte: .svelte → 순수 JS, 런타임 프레임워크 코드 거의 없음
  - 번들 사이즈 비교: 빈 앱 vs 실제 앱에서의 차이
  - DX 관점: HMR, 타입 지원, 에러 메시지
- **시각화**: StepPlayer — 빌드 파이프라인 비교 (소스 코드 → 컴파일 단계 → 번들 결과 → 런타임 실행)
- **컴포넌트**: `BuildPipelineCompared.tsx`

### 8. 프레임워크를 넘어서

- **파일명**: `beyond-frameworks.mdx`
- **seriesOrder**: 8
- **핵심 질문**: 프레임워크들이 수렴하고 있는가? 공통 패턴은 무엇인가?
- **내용**:
  - Signals의 수렴: React (useSignal 논의), Vue (ref), Angular (signal), Svelte (runes) — 모두 세밀한 반응성으로 향하고 있다
  - Server Components / Islands / Partial Hydration — 서버-클라이언트 경계의 재정의
  - Web Components: 프레임워크 독립적인 컴포넌트 표준
  - 프레임워크가 공유하는 핵심 개념 정리: 선언적 UI, 컴포넌트, 반응성, 단방향 흐름
  - "프레임워크를 배우지 말고, 문제를 이해하라"
- **시각화**: 벤 다이어그램 / 수렴 다이어그램 — 4개 프레임워크가 공유하는 개념이 점점 넓어지는 것
- **컴포넌트**: `FrameworkConvergence.tsx`

## 새 공통 컴포넌트: CodeTabs

### 용도

같은 기능의 코드를 4개 프레임워크로 나란히 비교하는 탭 전환 컴포넌트.

### 인터페이스

```tsx
interface CodeTabsProps {
  tabs: {
    label: string;    // "React", "Vue", "Angular", "Svelte"
    lang: string;     // Shiki 언어 식별자
    code: string;     // 코드 내용
  }[];
}
```

### 디자인

- 기존 `CodeBlock` (Shiki 하이라이팅) 위에 탭 UI를 얹은 형태
- 프레임워크별 색상: React=sky, Vue=emerald, Angular=rose, Svelte=orange
- 선택된 탭의 하단 인디케이터가 해당 프레임워크 색상
- 탭 전환 시 코드 영역만 교체 (높이 변화 최소화를 위해 min-height 설정)
- localStorage로 마지막 선택 탭을 기억하여 글 간 일관성 유지

### 파일 위치

`src/components/viz/primitives/CodeTabs.tsx` — 시리즈 특정이 아닌 범용 프리미티브

## 각 글 구조 (공통)

1. **핵심 질문** — 이 글이 답하려는 한 문장 질문으로 시작
2. **문제 상황** — 프레임워크 없이 이 문제를 겪어보기
3. **4가지 접근** — React, Vue, Angular, Svelte 각각의 해법
4. **코드 비교** — CodeTabs로 같은 기능의 4가지 구현 나란히
5. **트레이드오프 정리** — 표로 비교 (절대 우열이 아닌 상황별 적합성)
6. **다음 글 연결** — 다음 문제로의 자연스러운 연결

## 각 글 프론트매터 형식

```yaml
---
title: "제목"
description: "1-2문장 요약"
date: 2026-04-XX
tags: ["framework", "react", "vue", "angular", "svelte", "주제별 태그"]
series: "framework-philosophies"
seriesOrder: N
draft: false
---
```

## 기술 구현

### 파일 구조

```
content/posts/
  why-frameworks.mdx
  reactivity-compared.mdx
  component-model-compared.mdx
  rendering-strategy-compared.mdx
  state-management-compared.mdx
  template-vs-jsx.mdx
  build-vs-runtime.mdx
  beyond-frameworks.mdx

src/components/viz/primitives/
  CodeTabs.tsx              (새 공통 컴포넌트)

src/components/viz/domain/framework-philosophies/
  index.ts
  FrameworkTimeline.tsx     (1편)
  ReactivityCompared.tsx    (2편)
  ComponentModelCompared.tsx (3편)
  RenderingStrategyCompared.tsx (4편)
  StateManagementCompared.tsx (5편)
  BuildPipelineCompared.tsx (7편)
  FrameworkConvergence.tsx  (8편)
```

### 재활용할 기존 컴포넌트

- `StepPlayer` — 스텝 기반 시각화의 공통 네비게이션
- `CodeBlock` — Shiki 기반 코드 하이라이팅 (CodeTabs가 내부에서 사용)
- `Term` — 용어 팝오버

### 시리즈 메타데이터

`content/series.json`에 추가:

```json
{
  "slug": "framework-philosophies",
  "title": "프레임워크의 철학",
  "description": "React, Vue, Angular, Svelte — 같은 문제를 다른 철학으로 푸는 네 가지 방법을 비교합니다",
  "category": "JavaScript"
}
```
