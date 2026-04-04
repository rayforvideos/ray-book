# 프론트엔드 성능 최적화 시리즈 설계

## 개요

- **시리즈 슬러그**: `frontend-performance`
- **시리즈 제목**: 프론트엔드 성능 최적화
- **카테고리**: Browser
- **총 글 수**: 7편
- **핵심 흐름**: 측정 → 진단 → 해결. "추측하지 말고 측정하라"
- **톤**: 실전 중심, 코드와 DevTools 스크린샷 기반

## 글 목록 및 시각화

### 1. 성능을 측정하라 — Core Web Vitals

- **파일명**: `core-web-vitals.mdx`
- **seriesOrder**: 1
- **핵심 질문**: LCP, INP, CLS가 무엇이고 왜 이 세 가지인가?
- **내용**:
  - 성능이란 무엇인가 — "빠르다"는 주관적, 측정 가능한 지표가 필요
  - LCP (Largest Contentful Paint): 사용자가 "콘텐츠가 보인다"고 느끼는 시점
  - INP (Interaction to Next Paint): 사용자가 "반응한다"고 느끼는 시점 (FID를 대체)
  - CLS (Cumulative Layout Shift): 사용자가 "안정적이다"고 느끼는 정도
  - 각 메트릭의 좋은/나쁜 기준 (Good < 2.5s, Needs Improvement, Poor)
  - Lighthouse, Chrome DevTools Performance 탭, web-vitals 라이브러리로 측정하는 법
  - Field data vs Lab data의 차이 (CrUX, PageSpeed Insights)
- **시각화**: StepPlayer — 페이지 로드 타임라인에서 FP → FCP → LCP → TTI 순서로 각 메트릭이 측정되는 시점을 하이라이트
- **컴포넌트**: `WebVitalsTimeline.tsx`
- **기존 연결**: browser-rendering-pipeline 시리즈

### 2. 네트워크 병목 — 바이트를 줄여라

- **파일명**: `bundle-optimization.mdx`
- **seriesOrder**: 2
- **핵심 질문**: 번들이 크면 왜 느린가? 어떻게 줄이는가?
- **내용**:
  - Critical rendering path에서 JS 번들의 역할 — 파싱 + 컴파일 + 실행
  - 번들 분석: webpack-bundle-analyzer, source-map-explorer
  - 코드 스플리팅: dynamic import(), React.lazy, route-based splitting
  - 트리 쉐이킹: ESM의 정적 구조가 가능하게 하는 것, sideEffects 설정
  - 압축: gzip vs Brotli, Content-Encoding 헤더
  - 실전: Next.js의 자동 코드 스플리팅
- **시각화**: StepPlayer — 요청 워터폴 (최적화 전: 하나의 거대 번들 vs 최적화 후: 분할된 청크 병렬 로딩)
- **컴포넌트**: `BundleWaterfall.tsx`
- **기존 연결**: module-system 시리즈 (트리 쉐이킹)

### 3. 리소스 로딩 — 우선순위를 정하라

- **파일명**: `resource-loading.mdx`
- **seriesOrder**: 3
- **핵심 질문**: 브라우저는 리소스를 어떤 순서로 로드하는가? 우리가 어떻게 제어하는가?
- **내용**:
  - 브라우저의 리소스 우선순위 (Highest → Low): HTML > CSS > 폰트 > 동기 JS > 이미지 > async JS
  - preload: 현재 페이지에 반드시 필요한 리소스 (폰트, 히어로 이미지)
  - prefetch: 다음 페이지에 필요할 수 있는 리소스
  - preconnect: DNS + TCP + TLS 미리 연결
  - fetchpriority: High/Low로 힌트 주기
  - lazy loading: loading="lazy", Intersection Observer
  - async vs defer 스크립트
- **시각화**: StepPlayer — 리소스 로딩 워터폴에서 preload/lazy 적용 전후 비교
- **컴포넌트**: `ResourcePriority.tsx`
- **기존 연결**: network-and-communication 시리즈

### 4. 렌더링 성능 — 60fps를 지켜라

- **파일명**: `rendering-performance.mdx`
- **seriesOrder**: 4
- **핵심 질문**: 왜 스크롤이 버벅이는가? 60fps를 유지하려면?
- **내용**:
  - 16.67ms 프레임 예산 (60fps = 1000ms / 60)
  - Layout thrashing: DOM 읽기/쓰기 교차의 위험
  - 강제 동기 레이아웃: offsetWidth 읽기가 reflow를 강제하는 이유
  - 합성 전용 속성: transform, opacity만으로 애니메이션
  - will-change: GPU 레이어 프로모션의 득과 실
  - requestAnimationFrame: 프레임 동기화
  - contain: CSS Containment로 reflow 범위 제한
- **시각화**: StepPlayer — 렌더링 파이프라인에서 각 최적화가 어떤 단계를 건너뛰는지 (Layout → Paint → Composite vs Composite only)
- **컴포넌트**: `RenderingPipeline.tsx` (기존 browser-rendering-pipeline의 PipelineTrigger와 유사하지만 최적화 관점)
- **기존 연결**: browser-rendering-pipeline 시리즈 (PipelineTrigger, CompositorLayers)

### 5. JavaScript 실행 — 메인 스레드를 해방하라

- **파일명**: `main-thread-optimization.mdx`
- **seriesOrder**: 5
- **핵심 질문**: Long Task가 무엇이고 어떻게 해결하는가?
- **내용**:
  - Long Task: 50ms 이상 메인 스레드를 차지하는 작업
  - Long Task가 INP에 미치는 영향
  - Time slicing: 작업을 작은 단위로 나누고 yield
  - scheduler.yield(): 브라우저에게 제어권 반환
  - requestIdleCallback: 여유 시간에 작업 실행
  - Web Worker: 무거운 연산을 별도 스레드로
  - React의 Concurrent Mode / startTransition
- **시각화**: StepPlayer — 메인 스레드 타임라인 (하나의 긴 Long Task vs time-sliced 작은 태스크들 + 사이사이 이벤트 처리)
- **컴포넌트**: `MainThreadTimeline.tsx`
- **기존 연결**: js-engine-internals (이벤트 루프), web-workers 시리즈

### 6. 이미지와 폰트 — 시각 리소스를 최적화하라

- **파일명**: `image-font-optimization.mdx`
- **seriesOrder**: 6
- **핵심 질문**: 이미지와 폰트를 어떻게 최적화하는가?
- **내용**:
  - 이미지 포맷: JPEG vs PNG vs WebP vs AVIF — 각각의 특성과 사용 시점
  - responsive images: srcset, sizes, picture 태그
  - Next.js Image 컴포넌트의 자동 최적화
  - 폰트 최적화: font-display (swap, optional, fallback)
  - FOIT vs FOUT — Flash of Invisible/Unstyled Text
  - 폰트 서브세팅: 한글은 특히 중요 (유니코드 범위 지정)
  - CLS와 이미지/폰트의 관계: width/height 명시, aspect-ratio
- **시각화**: StepPlayer — 이미지 포맷별 크기/품질 트레이드오프 비교 바 차트
- **컴포넌트**: `ImageFormatCompare.tsx`

### 7. 캐싱 전략 — 두 번째 방문을 빠르게

- **파일명**: `caching-strategy.mdx`
- **seriesOrder**: 7
- **핵심 질문**: 첫 방문은 느려도 두 번째 방문은 빨라야 한다. 어떻게?
- **내용**:
  - HTTP 캐시: Cache-Control, ETag, Last-Modified
  - 캐시 전략: max-age + immutable, stale-while-revalidate
  - 해시 기반 파일명: app.abc123.js → 영구 캐싱
  - Service Worker 캐싱: Cache First, Network First, Stale While Revalidate
  - CDN: 엣지 서버에서 캐시 제공
  - 실전: Next.js의 캐싱 전략 (정적 자산, ISR, RSC 캐싱)
- **시각화**: StepPlayer — 첫 방문 (서버 응답) vs 재방문 (캐시 히트) 요청 흐름 시퀀스 다이어그램
- **컴포넌트**: `CachingFlow.tsx`
- **기존 연결**: network-and-communication (캐시), service-worker-and-pwa 시리즈

## 각 글 구조 (공통)

1. **측정** — 이 문제를 어떻게 발견하는가 (DevTools, Lighthouse, 코드)
2. **원인** — 왜 이것이 병목인가 (브라우저 내부 동작과 연결)
3. **시각화** — StepPlayer로 최적화 전/후 비교
4. **해결** — 구체적 코드와 설정
5. **체크리스트** — 바로 적용할 수 있는 액션 아이템
6. **다음 글 연결**

## 기술 구현

### 파일 구조

```
content/posts/
  core-web-vitals.mdx
  bundle-optimization.mdx
  resource-loading.mdx
  rendering-performance.mdx
  main-thread-optimization.mdx
  image-font-optimization.mdx
  caching-strategy.mdx

src/components/viz/domain/frontend-performance/
  index.ts
  WebVitalsTimeline.tsx
  BundleWaterfall.tsx
  ResourcePriority.tsx
  RenderingPipeline.tsx
  MainThreadTimeline.tsx
  ImageFormatCompare.tsx
  CachingFlow.tsx
```

### 프론트매터 형식

```yaml
---
title: "제목"
description: "설명"
date: 2026-04-XX
tags: ["performance", "주제별 태그"]
series: "frontend-performance"
seriesOrder: N
draft: false
---
```

### 시리즈 메타데이터

```json
{
  "slug": "frontend-performance",
  "title": "프론트엔드 성능 최적화",
  "description": "측정하고, 진단하고, 해결하라 — Core Web Vitals부터 캐싱 전략까지 프론트엔드 성능의 모든 것",
  "category": "Browser"
}
```

### 재활용할 기존 컴포넌트

- `StepPlayer` — 스텝 기반 시각화
- `CodeTabs` — (필요 시) 프레임워크별 최적화 코드 비교
- `Term` — 용어 팝오버
