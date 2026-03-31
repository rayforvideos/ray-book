# Ray Book — 프론트엔드 학습 블로그 설계 문서

## 개요

프론트엔드/웹 플랫폼 개념을 시각화와 함께 설명하는 정적 학습 블로그. JavaScript, 브라우저 동작 원리, 렌더링, CSS, 프론트엔드 프레임워크 내부 구조 등을 다룬다.

## 기술 스택

| 영역 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 15 (App Router, `output: 'export'`) | SSG + RSC |
| 스타일링 | Tailwind CSS v4 | 빠른 개발, 다크모드 내장 |
| MDX | `next-mdx-remote/rsc` | RSC 호환 MDX 처리 |
| 테마 | `next-themes` | 다크/라이트 토글 |
| 검색 | Pagefind | 빌드 시 인덱싱, 클라이언트 사이드 검색 |
| 애니메이션 | Framer Motion | 시각화 애니메이션 |
| 코드 하이라이트 | Shiki | 빌드 타임 처리, 다크/라이트 테마 |
| 유효성 검증 | Zod | frontmatter 타입 안전 |
| 배포 | Cloudflare Pages | 정적 호스팅 |

## 아키텍처 원칙

- **RSC 최대 활용**: 클라이언트 컴포넌트는 인터랙티브 시각화에만 한정. `'use client'` 경계를 명확히 한다.
- **Zero runtime JS on non-interactive pages**: 시각화 없는 글은 JS 번들을 최소화한다.
- **콘텐츠는 빌드 타임 데이터**: `fs` + `gray-matter` + `next-mdx-remote`로 빌드 시 MDX를 처리하고, `generateStaticParams`로 모든 경로를 사전 생성한다.
- **순수 함수 분리**: 콘텐츠 조회/필터/정렬 로직은 순수 함수로 분리하여 테스트 용이성을 확보한다.

## 프로젝트 구조

```
ray-book/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 루트 레이아웃 (테마 프로바이더, 네비게이션)
│   │   ├── page.tsx                # 홈 (최신 글 목록)
│   │   ├── posts/
│   │   │   └── [slug]/
│   │   │       └── page.tsx        # 개별 글 페이지
│   │   ├── series/
│   │   │   ├── page.tsx            # 시리즈 목록
│   │   │   └── [slug]/
│   │   │       └── page.tsx        # 시리즈 상세 (소속 글 목록)
│   │   └── search/
│   │       └── page.tsx            # 검색 페이지
│   ├── components/
│   │   ├── layout/                 # Header, Footer, Nav, ThemeToggle
│   │   ├── post/                   # PostCard, PostList, TOC, SeriesNav
│   │   └── viz/                    # 시각화 컴포넌트
│   │       ├── primitives/         # StepPlayer, AnimatedBox, CodeBlock, InteractiveCanvas
│   │       └── domain/             # EventLoop, CallStack, RenderPipeline, DOMTree
│   └── lib/
│       ├── posts.ts                # MDX 파싱, frontmatter 처리, 글 목록 조회
│       └── series.ts               # 시리즈 메타데이터 유틸
├── content/
│   ├── posts/                      # MDX 파일들
│   └── series.json                 # 시리즈 메타데이터 (제목, 설명)
├── public/
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

## 콘텐츠 시스템

### Frontmatter 스키마

```yaml
---
title: "이벤트 루프 완벽 이해"
description: "브라우저 이벤트 루프의 동작 원리"
date: 2026-03-31
tags: ["javascript", "browser", "event-loop"]
series: "browser-internals"    # optional — series.json의 slug와 매칭
seriesOrder: 1                 # optional — 시리즈 내 순서
draft: false
---
```

Zod 스키마로 빌드 시 유효성 검증. 잘못된 frontmatter는 빌드 에러로 잡는다.

### 시리즈 관리

`content/series.json`:
```json
[
  {
    "slug": "browser-internals",
    "title": "브라우저 내부 동작",
    "description": "브라우저가 코드를 어떻게 실행하는지 깊이 파헤치기"
  }
]
```

각 글의 frontmatter `series` + `seriesOrder`로 자동 그룹핑. 별도 설정 파일 없이 frontmatter만으로도 동작하되, 시리즈 제목/설명은 `series.json`에서 관리.

### 콘텐츠 조회 API (`src/lib/posts.ts`)

- `getAllPosts()` — 전체 글 목록 (draft 제외, 날짜순 정렬)
- `getPostBySlug(slug)` — 개별 글 + MDX 소스
- `getPostsByTag(tag)` — 태그별 필터
- `getPostsBySeries(series)` — 시리즈별 글 목록 (seriesOrder 순)
- `getAllTags()` — 전체 태그 목록
- `getAllSeries()` — 전체 시리즈 목록 + 메타데이터

## 시각화 아키텍처

### 3-레이어 구조

```
┌─────────────────────────────────────────┐
│  MDX 글 (서버 컴포넌트)                   │
│  ┌───────────────────────────────────┐  │
│  │ <EventLoop steps={...} />         │  │  ← domain 컴포넌트
│  │ <CustomViz />                     │  │  ← 글별 커스텀 컴포넌트
│  └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  domain 컴포넌트 (클라이언트)              │
│  - EventLoop, CallStack, DOMTree        │
│  - RenderPipeline, CSSCascade           │
│  → primitives를 조합하여 특정 개념 표현     │
├─────────────────────────────────────────┤
│  primitives (클라이언트)                   │
│  - StepPlayer (단계별 재생 컨트롤)         │
│  - AnimatedBox (Framer Motion 래퍼)      │
│  - CodeBlock (Shiki 구문 강조 + 하이라이트)│
│  - InteractiveCanvas (드래그/클릭 영역)    │
└─────────────────────────────────────────┘
```

- **Primitives**: 재사용 가능한 저수준 UI 빌딩 블록. 도메인 지식 없음.
- **Domain**: 프리미티브를 조합하여 프론트엔드 개념을 표현. `EventLoop`, `CallStack` 등.
- **Custom**: 글마다 필요한 일회성 시각화. MDX 내에서 인라인으로 작성하거나 같은 디렉토리에 컴포넌트 파일로 둔다.

### MDX에서 시각화 사용 예시

```mdx
import { EventLoop } from '@/components/viz/domain/EventLoop'

## 이벤트 루프란?

이벤트 루프는 브라우저가 JavaScript를 실행하는 핵심 메커니즘입니다.

<EventLoop
  steps={[
    { queue: "macrotask", item: "setTimeout callback" },
    { queue: "microtask", item: "Promise.then" },
    { queue: "render", item: "requestAnimationFrame" }
  ]}
/>
```

## 검색

- **Pagefind**: `next build` 후 `pagefind --site out` 실행으로 정적 인덱스 생성
- 검색 UI는 `/search` 페이지에 Pagefind 클라이언트 위젯 연결
- 빌드 스크립트에 pagefind 단계를 포함하여 자동화

## 테마

- `next-themes`로 다크/라이트 모드 토글
- Tailwind CSS v4의 `dark:` variant 활용
- 시스템 설정 감지 + 수동 토글 지원
- Shiki 코드 블록도 테마에 맞게 전환 (css-variables 테마)

## 배포

- **Cloudflare Pages**: `@cloudflare/next-on-pages` 또는 순수 정적 export (`output: 'export'`) 사용
- 정적 export 방식 채택 — 서버 기능 불필요, 단순하고 안정적
- 빌드 커맨드: `next build && pagefind --site out`
- 출력 디렉토리: `out/`

## 페이지별 기능

| 페이지 | 설명 |
|--------|------|
| `/` | 최신 글 목록, 시리즈 하이라이트 |
| `/posts/[slug]` | 개별 글 (MDX 렌더링, TOC, 시리즈 네비게이션) |
| `/series` | 전체 시리즈 목록 |
| `/series/[slug]` | 시리즈 상세 — 소속 글 순서대로 나열 |
| `/search` | Pagefind 검색 |
