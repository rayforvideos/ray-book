# 웹 접근성 시리즈 설계

## 개요

- **시리즈 슬러그**: `web-accessibility`
- **시리즈 제목**: 웹 접근성
- **카테고리**: Browser
- **총 글 수**: 5편
- **핵심 메시지**: 시맨틱 HTML을 제대로 쓰면 접근성의 80%는 해결된다. ARIA는 HTML이 부족할 때만 쓴다.
- **톤**: 실전 중심, Before/After 코드 비교

## 글 목록 및 시각화

### 1. 접근성은 HTML이다

- **파일명**: `a11y-semantic-html.mdx`
- **seriesOrder**: 1
- **핵심 질문**: 왜 `<div onclick>`이 아니라 `<button>`인가?
- **내용**:
  - 접근성이란 무엇인가 — 장애인만의 문제가 아님 (일시적 장애, 상황적 제약)
  - 접근성 트리: 브라우저가 DOM에서 만드는 또 다른 트리
  - 시맨틱 HTML의 힘: button, a, nav, main, header, footer, article, section
  - div + onclick vs button — 같은 모양이지만 완전히 다른 접근성
    - button: 포커스 가능, Enter/Space 키 지원, role="button" 자동, 스크린 리더 인식
    - div: 아무것도 없음. 전부 수동으로 추가해야 함
  - Before/After 코드 비교: 네비게이션, 버튼, 폼, 모달
  - 접근성 검사 도구: axe DevTools, Lighthouse Accessibility, Chrome 접근성 트리
- **시각화**: StepPlayer — 같은 버튼 UI를 div vs button으로 만들었을 때 접근성 트리가 어떻게 다른지 비교
- **컴포넌트**: `AccessibilityTree.tsx`
- **기존 연결**: dom-and-events 시리즈

### 2. 키보드 네비게이션

- **파일명**: `a11y-keyboard.mdx`
- **seriesOrder**: 2
- **핵심 질문**: 마우스 없이 웹을 쓸 수 있는가?
- **내용**:
  - Tab 순서: DOM 순서 = Tab 순서. CSS로 시각 순서를 바꿔도 탭 순서는 그대로
  - tabindex: 0 (자연 순서에 포함), -1 (프로그래밍으로만 포커스), 양수 사용 금지 이유
  - 포커스 인디케이터: outline 제거의 위험. :focus-visible의 올바른 사용
  - Skip link: 반복 콘텐츠 건너뛰기
  - Focus trap: 모달, 드롭다운에서 포커스가 빠져나가지 않도록
  - 실전: inert 속성으로 모달 뒤 콘텐츠 비활성화
- **시각화**: StepPlayer — Tab 키로 페이지를 순회하는 과정. 각 스텝에서 포커스가 어떤 요소로 이동하는지 하이라이트
- **컴포넌트**: `KeyboardNavFlow.tsx`

### 3. 스크린 리더와 ARIA

- **파일명**: `a11y-screen-reader.mdx`
- **seriesOrder**: 3
- **핵심 질문**: 스크린 리더는 페이지를 어떻게 읽는가?
- **내용**:
  - 스크린 리더의 동작 원리: 접근성 트리를 순회하며 읽어줌
  - 랜드마크: header, nav, main, footer → 스크린 리더의 "목차"
  - ARIA의 첫 번째 규칙: "네이티브 HTML 요소로 충분하면 ARIA를 쓰지 마라"
  - 필수 ARIA:
    - role: 네이티브 역할이 없는 커스텀 위젯에만
    - aria-label / aria-labelledby: 보이지 않는 레이블
    - aria-hidden: 장식적 요소 숨기기
    - aria-live: 동적 콘텐츠 변경 알림 (polite, assertive)
    - aria-expanded, aria-controls: 아코디언, 드롭다운
  - 자주 하는 실수: aria-label을 div에 달기, role="button" 남용, aria-hidden으로 중요 콘텐츠 숨기기
- **시각화**: StepPlayer — 스크린 리더가 페이지를 읽는 순서. 랜드마크 → 헤딩 → 콘텐츠 순서로 접근성 트리를 탐색
- **컴포넌트**: `ScreenReaderFlow.tsx`

### 4. 색상, 대비, 모션

- **파일명**: `a11y-visual.mdx`
- **seriesOrder**: 4
- **핵심 질문**: 색상만으로 정보를 전달하고 있지 않은가?
- **내용**:
  - 색 대비: WCAG AA 4.5:1 (일반 텍스트), 3:1 (큰 텍스트, UI 컴포넌트)
  - 색맹 고려: 색상만으로 상태 구분 금지. 아이콘, 패턴, 텍스트 병행
  - 대비 검사 도구: Chrome DevTools 대비 비율, Stark 플러그인
  - 모션 감소: prefers-reduced-motion 미디어 쿼리
  - 다크 모드와 접근성: 대비 비율 유지의 중요성
  - 텍스트 크기: rem 기반, 최소 16px 본문, 브라우저 확대 200%에서도 깨지지 않아야
- **시각화**: StepPlayer — 같은 UI를 대비 비율 2:1, 4.5:1, 7:1로 보여주며 차이 비교
- **컴포넌트**: `ContrastCompare.tsx`

### 5. 폼과 에러 처리

- **파일명**: `a11y-forms.mdx`
- **seriesOrder**: 5
- **핵심 질문**: 폼을 제출했는데 무엇이 잘못되었는지 알 수 없다면?
- **내용**:
  - label과 input의 연결: for/id 또는 래핑. 연결이 없으면 스크린 리더가 무슨 필드인지 모름
  - placeholder는 label이 아니다 — 접근성과 UX 문제
  - 에러 메시지: aria-describedby로 필드와 연결, aria-invalid로 상태 표시
  - aria-live로 동적 에러 메시지 알림
  - 자동완성: autocomplete 속성으로 브라우저/스크린 리더에게 힌트
  - 필수 필드: required + aria-required
  - 실전: React Hook Form / Zod와 접근성 통합
- **시각화**: StepPlayer — 접근 가능한 폼 vs 불가능한 폼. 스크린 리더 관점에서 읽히는 순서와 정보의 차이
- **컴포넌트**: `AccessibleForm.tsx`

## 기술 구현

### 파일 구조

```
content/posts/
  a11y-semantic-html.mdx
  a11y-keyboard.mdx
  a11y-screen-reader.mdx
  a11y-visual.mdx
  a11y-forms.mdx

src/components/viz/domain/web-accessibility/
  index.ts
  AccessibilityTree.tsx
  KeyboardNavFlow.tsx
  ScreenReaderFlow.tsx
  ContrastCompare.tsx
  AccessibleForm.tsx
```

### 프론트매터 형식

```yaml
---
title: "제목"
description: "설명"
date: 2026-04-XX
tags: ["accessibility", "주제별 태그"]
series: "web-accessibility"
seriesOrder: N
draft: false
---
```

### 시리즈 메타데이터

```json
{
  "slug": "web-accessibility",
  "title": "웹 접근성",
  "description": "시맨틱 HTML을 제대로 쓰면 접근성의 80%는 해결된다 — 키보드, 스크린 리더, 색상, 폼까지",
  "category": "Browser"
}
```
