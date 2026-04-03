# 프론트엔드 디자인 패턴 시리즈 설계

## 개요

- **시리즈 슬러그**: `frontend-design-patterns`
- **시리즈 제목**: 프론트엔드 디자인 패턴
- **카테고리**: JavaScript
- **총 글 수**: 8편
- **접근 방식**: 프론트엔드 실전 중심 — GoF 이론보다 "이 코드가 왜 이렇게 생겼는지"에 집중
- **핵심 차별점**: 각 글마다 인터랙티브 시각화 컴포넌트로 패턴의 동작을 체험

## 글 목록 및 시각화

### 1. Observer / Pub-Sub — 이벤트 기반 소통

- **파일명**: `observer-and-pubsub.mdx`
- **문제 상황**: 여러 UI 컴포넌트가 하나의 상태 변경에 반응해야 할 때, 직접 참조하면 결합도 폭발
- **시각화**: 중앙 Subject 노드에서 여러 Observer 노드로 이벤트가 퍼져나가는 애니메이션. 구독/해제 버튼으로 Observer를 동적으로 추가·제거하면 실시간으로 전파 경로가 바뀜
- **실전 사례**: DOM EventListener, Redux store subscribe, RxJS Observable
- **기존 연결**: dom-and-events 시리즈, async-javascript 시리즈
- **컴포넌트**: `ObserverPatternViz.tsx`

### 2. Strategy — 행동을 교체하라

- **파일명**: `strategy-pattern.mdx`
- **문제 상황**: if/else 또는 switch 분기가 점점 늘어나는 정렬/필터/유효성 검증 로직
- **시각화**: 같은 데이터 리스트에 서로 다른 전략(가격순, 이름순, 평점순)을 드롭다운으로 교체. 전략 객체의 코드가 하이라이트되면서 "지금 이 함수가 실행 중"임을 보여줌. if/else 분기 vs Strategy 패턴 코드 비교 포함
- **실전 사례**: Array.sort() 비교 함수, 폼 유효성 검증, 렌더링 전략 교체
- **기존 연결**: data-structures-and-algorithms 시리즈 (정렬)
- **컴포넌트**: `StrategyPatternViz.tsx`

### 3. Iterator — 순회를 추상화하라

- **파일명**: `iterator-pattern.mdx`
- **문제 상황**: 배열, 트리, API 페이지네이션 등 다양한 자료구조를 순회할 때마다 다른 로직을 작성
- **시각화**: 트리, 링크드 리스트, 페이지네이션 API 등 다양한 자료구조를 같은 for...of 루프로 순회하는 과정을 스텝별로 시각화. 커서가 이동하면서 현재 위치와 next() 호출 결과를 보여줌
- **실전 사례**: for...of와 Symbol.iterator, 제너레이터 기반 이터레이터, 커스텀 이터러블 컬렉션
- **기존 연결**: js-deep-dive 시리즈 (이터레이터와 제너레이터)
- **컴포넌트**: `IteratorPatternViz.tsx`

### 4. Decorator — 기능을 감싸라

- **파일명**: `decorator-pattern.mdx`
- **문제 상황**: 인증, 로깅, 캐싱 등 횡단 관심사를 매 함수/컴포넌트마다 반복 작성
- **시각화**: 기본 컴포넌트 위에 withAuth, withLogging, withCache 같은 데코레이터를 하나씩 쌓아올리는 시각화. 요청이 바깥 레이어부터 안쪽으로 통과하는 과정을 애니메이션으로. 미들웨어 파이프라인(Express/Koa)과 HOC를 나란히 비교
- **실전 사례**: HOC (Higher-Order Component), Express/Koa 미들웨어, TC39 데코레이터 제안
- **기존 연결**: prototype-and-inheritance 시리즈
- **컴포넌트**: `DecoratorPatternViz.tsx`

### 5. Proxy — 접근을 가로채라

- **파일명**: `proxy-pattern.mdx`
- **문제 상황**: 객체 접근 시 유효성 검증, 캐싱, 지연 로딩 등 부가 로직을 원본 수정 없이 끼워넣기
- **시각화**: 객체 접근(get/set) 시 Proxy가 중간에서 요청을 가로채는 과정을 시퀀스 다이어그램으로. 캐싱 Proxy, 유효성 검증 Proxy, Vue reactivity의 세 가지 시나리오를 탭으로 전환. 트랩이 발동될 때 하이라이트
- **실전 사례**: Vue 3 reactivity, 캐싱 프록시, 유효성 검증, 지연 로딩
- **기존 연결**: js-deep-dive 시리즈 (Proxy와 Reflect)
- **컴포넌트**: `ProxyPatternViz.tsx`

### 6. Factory — 생성을 위임하라

- **파일명**: `factory-pattern.mdx`
- **문제 상황**: 조건에 따라 다른 객체/컴포넌트를 생성할 때 new 호출이 곳곳에 흩어짐
- **시각화**: 입력값(type: "button" | "input" | "card")에 따라 다른 컴포넌트가 생성되는 과정을 시각화. 팩토리 함수 내부의 분기 로직이 하이라이트되고, 결과물이 실시간으로 렌더링됨. Simple Factory → Factory Method → Abstract Factory 단계별 비교
- **실전 사례**: React.createElement, 동적 컴포넌트 매핑, API 클라이언트 팩토리
- **컴포넌트**: `FactoryPatternViz.tsx`

### 7. Command — 동작을 객체로 만들어라

- **파일명**: `command-pattern.mdx`
- **문제 상황**: Undo/Redo, 매크로 기록, 트랜잭션 처리 등 동작의 이력 관리가 필요할 때
- **시각화**: 간단한 그리기/텍스트 에디터에서 각 동작이 Command 객체로 기록되는 과정을 시각화. 명령 히스토리 스택이 쌓이고, Undo/Redo 시 스택 포인터가 이동하는 것을 실시간으로. 실제로 조작 가능한 미니 에디터
- **실전 사례**: 텍스트 에디터, 상태 관리의 action dispatch, 매크로/단축키 시스템
- **컴포넌트**: `CommandPatternViz.tsx`

### 8. Mediator — 소통을 중재하라

- **파일명**: `mediator-pattern.mdx`
- **문제 상황**: 컴포넌트 간 직접 통신이 늘어나면서 의존성 그래프가 스파게티화
- **시각화**: 여러 컴포넌트가 서로 직접 통신하는 스파게티 vs 중앙 Mediator를 통한 통신을 나란히 비교. 컴포넌트 수가 늘어날수록 연결선이 폭발적으로 증가하는 것을 애니메이션으로 보여주고, Mediator 도입 후 정리되는 과정
- **실전 사례**: 이벤트 버스, 상태 관리 라이브러리(Redux/Zustand)의 store, 채팅방 서버
- **컴포넌트**: `MediatorPatternViz.tsx`

## 각 글 구조 (공통)

1. **문제 상황** — 패턴 없는 코드의 고통을 실제 프론트엔드 시나리오로 제시
2. **패턴 소개** — GoF 원본 간단 언급 + 핵심 구조 (UML 대신 코드 구조로 설명)
3. **인터랙티브 시각화** — 패턴 동작 과정을 스텝별로 체험 (StepPlayer 기반)
4. **Before/After 코드** — 패턴 적용 전후 리팩터링 과정
5. **프론트엔드 실전 사례** — DOM API, React, 라이브러리에서의 활용
6. **다음 글 연결** — 다음 패턴과의 자연스러운 연결

## 기술 구현

### 파일 구조

```
content/posts/
  observer-and-pubsub.mdx
  strategy-pattern.mdx
  iterator-pattern.mdx
  decorator-pattern.mdx
  proxy-pattern.mdx
  factory-pattern.mdx
  command-pattern.mdx
  mediator-pattern.mdx

src/components/viz/domain/
  ObserverPatternViz.tsx
  StrategyPatternViz.tsx
  IteratorPatternViz.tsx
  DecoratorPatternViz.tsx
  ProxyPatternViz.tsx
  FactoryPatternViz.tsx
  CommandPatternViz.tsx
  MediatorPatternViz.tsx
```

### 시리즈 메타데이터

`content/series.json`에 추가:

```json
{
  "slug": "frontend-design-patterns",
  "title": "프론트엔드 디자인 패턴",
  "description": "프론트엔드 코드에서 자주 만나는 디자인 패턴을 인터랙티브 시각화로 이해합니다.",
  "category": "javascript"
}
```

### 각 글 프론트매터 형식

```yaml
---
title: "패턴 제목"
description: "1-2문장 요약"
date: 2026-04-03
tags: ["design-pattern", "패턴명"]
series: "frontend-design-patterns"
seriesOrder: N
draft: false
---
```

### 재활용할 기존 컴포넌트

- `StepPlayer` — 스텝 기반 시각화의 공통 네비게이션
- `Term` — 용어 팝오버 (새 패턴 용어 추가)
- 기존 `viz/domain/` 컴포넌트의 스타일 패턴 (BarChart, 하이라이트 등)

### 새로 만들 공통 요소

- 패턴별 도메인 시각화 컴포넌트 8개 (위 목록 참조)
- MDX에서 import할 수 있도록 `src/components/viz/index.ts`에 export 추가
