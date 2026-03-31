# Ray Book Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static Next.js 15 blog for learning frontend/web platform concepts with interactive visualizations, deployed to Cloudflare Pages.

**Architecture:** Next.js 15 App Router with `output: 'export'` for SSG. MDX content with RSC-compatible rendering via `next-mdx-remote/rsc`. Three-layer visualization system (primitives → domain → custom). Tailwind CSS v4 with CSS-first config for styling and dark mode.

**Tech Stack:** Next.js 15, Tailwind CSS v4, next-mdx-remote, next-themes, Shiki, Framer Motion, Zod, Pagefind

**Spec:** `docs/superpowers/specs/2026-03-31-ray-book-design.md`

---

## File Structure

```
ray-book/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout: ThemeProvider, Header, Footer
│   │   ├── page.tsx                      # Home: latest posts + series highlights
│   │   ├── globals.css                   # Tailwind v4 CSS-first config + custom styles
│   │   ├── posts/
│   │   │   └── [slug]/
│   │   │       └── page.tsx              # Post detail: MDX render + TOC + series nav
│   │   ├── series/
│   │   │   ├── page.tsx                  # Series listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx              # Series detail: ordered posts
│   │   └── search/
│   │       └── page.tsx                  # Pagefind search UI
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx                # Site header with nav + theme toggle
│   │   │   ├── Footer.tsx                # Site footer
│   │   │   └── ThemeToggle.tsx           # Dark/light mode toggle button
│   │   ├── post/
│   │   │   ├── PostCard.tsx              # Post preview card for listings
│   │   │   ├── PostList.tsx              # Grid/list of PostCards
│   │   │   ├── TableOfContents.tsx       # Auto-generated TOC from headings
│   │   │   ├── SeriesNav.tsx             # Prev/next navigation within series
│   │   │   └── TagList.tsx               # Tag badges with links
│   │   ├── search/
│   │   │   └── SearchWidget.tsx          # Pagefind search client component
│   │   └── viz/
│   │       └── primitives/
│   │           ├── StepPlayer.tsx        # Step-by-step playback controls
│   │           ├── AnimatedBox.tsx       # Framer Motion animated container
│   │           └── CodeBlock.tsx         # Shiki syntax-highlighted code
│   ├── lib/
│   │   ├── posts.ts                      # MDX parsing, frontmatter, content queries
│   │   ├── series.ts                     # Series metadata utilities
│   │   └── mdx-components.ts            # MDX component mapping for next-mdx-remote
│   └── types/
│       └── post.ts                       # Post, Series, Frontmatter types + Zod schemas
├── content/
│   ├── posts/
│   │   └── hello-world.mdx              # Sample post
│   └── series.json                       # Series metadata
├── public/
├── next.config.ts
├── tsconfig.json
├── package.json
└── postcss.config.mjs
```

---

### Task 1: Project Scaffolding & Configuration

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.mjs`
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`

- [ ] **Step 1: Initialize Next.js 15 project**

Run:
```bash
cd /Users/guest-user/workspace/ray-book
npx create-next-app@15 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Expected: Project scaffolded with Next.js 15, TypeScript, Tailwind CSS, App Router, `src/` directory.

- [ ] **Step 2: Install additional dependencies**

```bash
npm install next-mdx-remote gray-matter next-themes zod framer-motion shiki
npm install -D @types/node
```

- [ ] **Step 3: Configure Next.js for static export**

Replace `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

`images.unoptimized` is required because `output: 'export'` does not support Next.js image optimization.

- [ ] **Step 4: Configure Tailwind CSS v4 with CSS-first config**

Replace `src/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-primary: #2563eb;
  --color-primary-dark: #3b82f6;
  --color-bg: #ffffff;
  --color-bg-dark: #0f172a;
  --color-text: #1e293b;
  --color-text-dark: #e2e8f0;
  --color-muted: #64748b;
  --color-muted-dark: #94a3b8;
  --color-border: #e2e8f0;
  --color-border-dark: #334155;
  --color-surface: #f8fafc;
  --color-surface-dark: #1e293b;

  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}

/* Base styles */
body {
  @apply bg-bg text-text antialiased;
  font-family: var(--font-sans);
}

:is(.dark) body {
  @apply bg-bg-dark text-text-dark;
}

/* Prose styles for MDX content */
.prose h2 {
  @apply text-2xl font-bold mt-10 mb-4 text-text;
}
:is(.dark) .prose h2 {
  @apply text-text-dark;
}

.prose h3 {
  @apply text-xl font-semibold mt-8 mb-3 text-text;
}
:is(.dark) .prose h3 {
  @apply text-text-dark;
}

.prose p {
  @apply leading-7 mb-4;
}

.prose ul {
  @apply list-disc pl-6 mb-4;
}

.prose ol {
  @apply list-decimal pl-6 mb-4;
}

.prose li {
  @apply mb-2;
}

.prose a {
  @apply text-primary underline;
}
:is(.dark) .prose a {
  @apply text-primary-dark;
}

.prose blockquote {
  @apply border-l-4 border-primary pl-4 italic text-muted;
}
:is(.dark) .prose blockquote {
  @apply border-primary-dark text-muted-dark;
}

.prose pre {
  @apply rounded-lg p-4 overflow-x-auto my-6;
}

.prose code:not(pre code) {
  @apply bg-surface px-1.5 py-0.5 rounded text-sm font-mono;
}
:is(.dark) .prose code:not(pre code) {
  @apply bg-surface-dark;
}

.prose img {
  @apply rounded-lg my-6;
}

.prose hr {
  @apply border-border my-8;
}
:is(.dark) .prose hr {
  @apply border-border-dark;
}
```

- [ ] **Step 5: Set up root layout with theme support**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ray Book",
  description: "프론트엔드 개념을 시각화로 이해하는 학습 블로그",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Create minimal home page placeholder**

Replace `src/app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold">Ray Book</h1>
      <p className="mt-4 text-muted dark:text-muted-dark">
        프론트엔드 개념을 시각화로 이해하는 학습 블로그
      </p>
    </main>
  );
}
```

- [ ] **Step 7: Verify build works**

Run:
```bash
npm run build
```

Expected: Build succeeds, `out/` directory created with static HTML.

- [ ] **Step 8: Initialize git and commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Next.js 15 project with Tailwind v4, static export, dark mode"
```

---

### Task 2: Content System — Types, Schemas & Query Functions

**Files:**
- Create: `src/types/post.ts`
- Create: `src/lib/posts.ts`
- Create: `src/lib/series.ts`
- Create: `content/series.json`
- Create: `content/posts/hello-world.mdx`

- [ ] **Step 1: Define types and Zod schemas**

Create `src/types/post.ts`:

```typescript
import { z } from "zod";

export const frontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  series: z.string().optional(),
  seriesOrder: z.number().optional(),
  draft: z.boolean().default(false),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;

export interface Post {
  slug: string;
  frontmatter: Frontmatter;
  content: string;
}

export interface PostMeta {
  slug: string;
  frontmatter: Frontmatter;
}

export interface Series {
  slug: string;
  title: string;
  description: string;
}
```

- [ ] **Step 2: Create series metadata**

Create `content/series.json`:

```json
[
  {
    "slug": "browser-internals",
    "title": "브라우저 내부 동작",
    "description": "브라우저가 코드를 어떻게 실행하는지 깊이 파헤치기"
  }
]
```

- [ ] **Step 3: Implement posts library**

Create `src/lib/posts.ts`:

```typescript
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { frontmatterSchema, type Post, type PostMeta } from "@/types/post";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

function parseFrontmatter(raw: Record<string, unknown>, slug: string) {
  const result = frontmatterSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `Invalid frontmatter in ${slug}.mdx: ${result.error.message}`
    );
  }
  return result.data;
}

export function getAllPostMetas(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
      const { data } = matter(raw);
      const frontmatter = parseFrontmatter(data, slug);
      return { slug, frontmatter };
    })
    .filter((post) => !post.frontmatter.draft)
    .sort(
      (a, b) =>
        b.frontmatter.date.getTime() - a.frontmatter.date.getTime()
    );
}

export function getPostBySlug(slug: string): Post {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const frontmatter = parseFrontmatter(data, slug);
  return { slug, frontmatter, content };
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPostMetas().filter((post) =>
    post.frontmatter.tags.includes(tag)
  );
}

export function getPostsBySeries(series: string): PostMeta[] {
  return getAllPostMetas()
    .filter((post) => post.frontmatter.series === series)
    .sort(
      (a, b) =>
        (a.frontmatter.seriesOrder ?? 0) - (b.frontmatter.seriesOrder ?? 0)
    );
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const post of getAllPostMetas()) {
    for (const tag of post.frontmatter.tags) {
      tags.add(tag);
    }
  }
  return Array.from(tags).sort();
}

export function getAllSlugs(): string[] {
  return getAllPostMetas().map((post) => post.slug);
}
```

- [ ] **Step 4: Implement series library**

Create `src/lib/series.ts`:

```typescript
import fs from "fs";
import path from "path";
import type { Series } from "@/types/post";
import { getPostsBySeries } from "./posts";

const SERIES_FILE = path.join(process.cwd(), "content/series.json");

export function getAllSeries(): Series[] {
  if (!fs.existsSync(SERIES_FILE)) return [];
  const raw = fs.readFileSync(SERIES_FILE, "utf-8");
  return JSON.parse(raw) as Series[];
}

export function getSeriesBySlug(slug: string): Series | undefined {
  return getAllSeries().find((s) => s.slug === slug);
}

export function getAllSeriesSlugs(): string[] {
  return getAllSeries().map((s) => s.slug);
}

export function getSeriesWithPosts() {
  return getAllSeries().map((series) => ({
    ...series,
    posts: getPostsBySeries(series.slug),
  }));
}
```

- [ ] **Step 5: Create sample post**

Create `content/posts/hello-world.mdx`:

```mdx
---
title: "Hello World"
description: "Ray Book 첫 번째 글입니다"
date: 2026-03-31
tags: ["intro"]
draft: false
---

## 안녕하세요!

**Ray Book**에 오신 것을 환영합니다.

이 블로그에서는 프론트엔드 개발의 핵심 개념들을 **시각화**와 함께 설명합니다.

- JavaScript 엔진이 코드를 어떻게 실행하는지
- 브라우저가 화면을 어떻게 그리는지
- CSS가 어떤 과정을 거쳐 적용되는지
- 프론트엔드 프레임워크가 내부적으로 어떻게 동작하는지

이 모든 것을 **인터랙티브 시각화**로 확인해보세요.
```

- [ ] **Step 6: Commit**

```bash
git add src/types/post.ts src/lib/posts.ts src/lib/series.ts content/
git commit -m "feat: add content system with Zod-validated frontmatter and query functions"
```

---

### Task 3: MDX Rendering & Component Mapping

**Files:**
- Create: `src/lib/mdx-components.ts`
- Create: `src/components/viz/primitives/CodeBlock.tsx`
- Create: `src/app/posts/[slug]/page.tsx`

- [ ] **Step 1: Create CodeBlock component with Shiki**

Create `src/components/viz/primitives/CodeBlock.tsx`:

```tsx
import { codeToHtml } from "shiki";

interface CodeBlockProps {
  code: string;
  lang?: string;
}

export async function CodeBlock({ code, lang = "typescript" }: CodeBlockProps) {
  const html = await codeToHtml(code, {
    lang,
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
  });

  return (
    <div
      className="my-6 overflow-x-auto rounded-lg text-sm [&_pre]:p-4"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
```

Note: `CodeBlock` is an async server component — Shiki runs at build time. The dual-theme approach uses CSS `prefers-color-scheme` via Shiki's built-in multi-theme support.

- [ ] **Step 2: Create MDX component mapping**

Create `src/lib/mdx-components.ts`:

```typescript
import type { MDXComponents } from "mdx/types";
import { CodeBlock } from "@/components/viz/primitives/CodeBlock";

export const mdxComponents: MDXComponents = {
  pre: ({ children, ...props }: React.ComponentProps<"pre">) => {
    // Extract code content and language from <pre><code> structure
    const codeElement = children as React.ReactElement<{
      children: string;
      className?: string;
    }>;

    if (
      codeElement &&
      typeof codeElement === "object" &&
      "props" in codeElement
    ) {
      const code = codeElement.props.children?.trim() ?? "";
      const lang =
        codeElement.props.className?.replace("language-", "") ?? "text";

      // @ts-expect-error — CodeBlock is an async server component
      return <CodeBlock code={code} lang={lang} />;
    }

    return <pre {...props}>{children}</pre>;
  },
};
```

- [ ] **Step 3: Create post detail page**

Create `src/app/posts/[slug]/page.tsx`:

```tsx
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { getAllSlugs, getPostBySlug } from "@/lib/posts";
import { mdxComponents } from "@/lib/mdx-components";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params;
  try {
    const post = getPostBySlug(slug);
    return {
      title: `${post.frontmatter.title} | Ray Book`,
      description: post.frontmatter.description,
    };
  } catch {
    return { title: "Not Found | Ray Book" };
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">{post.frontmatter.title}</h1>
        <p className="mt-2 text-muted dark:text-muted-dark">
          {post.frontmatter.description}
        </p>
        <time
          className="mt-2 block text-sm text-muted dark:text-muted-dark"
          dateTime={post.frontmatter.date.toISOString()}
        >
          {post.frontmatter.date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </header>
      <article className="prose">
        <MDXRemote source={post.content} components={mdxComponents} />
      </article>
    </main>
  );
}
```

- [ ] **Step 4: Verify build with sample post**

Run:
```bash
npm run build
```

Expected: Build succeeds. `out/posts/hello-world.html` exists.

- [ ] **Step 5: Commit**

```bash
git add src/lib/mdx-components.ts src/components/viz/primitives/CodeBlock.tsx src/app/posts/
git commit -m "feat: add MDX rendering with Shiki code highlighting and post detail page"
```

---

### Task 4: Layout Components — Header, Footer, ThemeToggle

**Files:**
- Create: `src/components/layout/ThemeToggle.tsx`
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Footer.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create ThemeToggle component**

Create `src/components/layout/ThemeToggle.tsx`:

```tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-lg p-2 text-muted hover:bg-surface hover:text-text dark:text-muted-dark dark:hover:bg-surface-dark dark:hover:text-text-dark"
      aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
    >
      {theme === "dark" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
    </button>
  );
}
```

- [ ] **Step 2: Create Header component**

Create `src/components/layout/Header.tsx`:

```tsx
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="border-b border-border dark:border-border-dark">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold">
          Ray Book
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/series"
            className="text-sm text-muted hover:text-text dark:text-muted-dark dark:hover:text-text-dark"
          >
            시리즈
          </Link>
          <Link
            href="/search"
            className="text-sm text-muted hover:text-text dark:text-muted-dark dark:hover:text-text-dark"
          >
            검색
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Create Footer component**

Create `src/components/layout/Footer.tsx`:

```tsx
export function Footer() {
  return (
    <footer className="border-t border-border py-8 dark:border-border-dark">
      <div className="mx-auto max-w-3xl px-4 text-center text-sm text-muted dark:text-muted-dark">
        <p>Ray Book</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Update root layout to include Header and Footer**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ray Book",
  description: "프론트엔드 개념을 시각화로 이해하는 학습 블로그",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds with header/footer in all pages.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/ src/app/layout.tsx
git commit -m "feat: add Header, Footer, ThemeToggle layout components"
```

---

### Task 5: Home Page & Post Listing Components

**Files:**
- Create: `src/components/post/PostCard.tsx`
- Create: `src/components/post/PostList.tsx`
- Create: `src/components/post/TagList.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create TagList component**

Create `src/components/post/TagList.tsx`:

```tsx
interface TagListProps {
  tags: string[];
}

export function TagList({ tags }: TagListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-surface px-2.5 py-0.5 text-xs text-muted dark:bg-surface-dark dark:text-muted-dark"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create PostCard component**

Create `src/components/post/PostCard.tsx`:

```tsx
import Link from "next/link";
import type { PostMeta } from "@/types/post";
import { TagList } from "./TagList";

interface PostCardProps {
  post: PostMeta;
}

export function PostCard({ post }: PostCardProps) {
  const { slug, frontmatter } = post;

  return (
    <article className="group">
      <Link href={`/posts/${slug}`} className="block">
        <h2 className="text-lg font-semibold group-hover:text-primary dark:group-hover:text-primary-dark">
          {frontmatter.title}
        </h2>
        <p className="mt-1 text-sm text-muted dark:text-muted-dark">
          {frontmatter.description}
        </p>
        <time
          className="mt-2 block text-xs text-muted dark:text-muted-dark"
          dateTime={frontmatter.date.toISOString()}
        >
          {frontmatter.date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </Link>
      <div className="mt-2">
        <TagList tags={frontmatter.tags} />
      </div>
    </article>
  );
}
```

- [ ] **Step 3: Create PostList component**

Create `src/components/post/PostList.tsx`:

```tsx
import type { PostMeta } from "@/types/post";
import { PostCard } from "./PostCard";

interface PostListProps {
  posts: PostMeta[];
}

export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <p className="text-muted dark:text-muted-dark">
        아직 작성된 글이 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Update home page**

Replace `src/app/page.tsx`:

```tsx
import { getAllPostMetas } from "@/lib/posts";
import { getSeriesWithPosts } from "@/lib/series";
import { PostList } from "@/components/post/PostList";
import Link from "next/link";

export default function Home() {
  const posts = getAllPostMetas();
  const seriesWithPosts = getSeriesWithPosts().filter(
    (s) => s.posts.length > 0
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <section>
        <h1 className="text-4xl font-bold">Ray Book</h1>
        <p className="mt-4 text-muted dark:text-muted-dark">
          프론트엔드 개념을 시각화로 이해하는 학습 블로그
        </p>
      </section>

      {seriesWithPosts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold">시리즈</h2>
          <div className="mt-6 space-y-4">
            {seriesWithPosts.map((series) => (
              <Link
                key={series.slug}
                href={`/series/${series.slug}`}
                className="block rounded-lg border border-border p-4 hover:border-primary dark:border-border-dark dark:hover:border-primary-dark"
              >
                <h3 className="font-semibold">{series.title}</h3>
                <p className="mt-1 text-sm text-muted dark:text-muted-dark">
                  {series.description}
                </p>
                <p className="mt-2 text-xs text-muted dark:text-muted-dark">
                  {series.posts.length}개의 글
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-16">
        <h2 className="text-2xl font-bold">최신 글</h2>
        <div className="mt-6">
          <PostList posts={posts} />
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 5: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds. Home page renders with the sample post.

- [ ] **Step 6: Commit**

```bash
git add src/components/post/ src/app/page.tsx
git commit -m "feat: add home page with post listing and series highlights"
```

---

### Task 6: Series Pages

**Files:**
- Create: `src/app/series/page.tsx`
- Create: `src/app/series/[slug]/page.tsx`

- [ ] **Step 1: Create series listing page**

Create `src/app/series/page.tsx`:

```tsx
import Link from "next/link";
import { getSeriesWithPosts } from "@/lib/series";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "시리즈 | Ray Book",
  description: "주제별로 묶인 학습 시리즈 목록",
};

export default function SeriesPage() {
  const seriesWithPosts = getSeriesWithPosts();

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">시리즈</h1>
      <p className="mt-2 text-muted dark:text-muted-dark">
        주제별로 묶인 학습 시리즈
      </p>

      <div className="mt-10 space-y-6">
        {seriesWithPosts.map((series) => (
          <Link
            key={series.slug}
            href={`/series/${series.slug}`}
            className="block rounded-lg border border-border p-6 hover:border-primary dark:border-border-dark dark:hover:border-primary-dark"
          >
            <h2 className="text-xl font-semibold">{series.title}</h2>
            <p className="mt-2 text-muted dark:text-muted-dark">
              {series.description}
            </p>
            <p className="mt-3 text-sm text-muted dark:text-muted-dark">
              {series.posts.length}개의 글
            </p>
          </Link>
        ))}

        {seriesWithPosts.length === 0 && (
          <p className="text-muted dark:text-muted-dark">
            아직 시리즈가 없습니다.
          </p>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Create series detail page**

Create `src/app/series/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllSeriesSlugs, getSeriesBySlug } from "@/lib/series";
import { getPostsBySeries } from "@/lib/posts";

interface SeriesDetailProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllSeriesSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: SeriesDetailProps) {
  const { slug } = await params;
  const series = getSeriesBySlug(slug);
  if (!series) return { title: "Not Found | Ray Book" };
  return {
    title: `${series.title} | Ray Book`,
    description: series.description,
  };
}

export default async function SeriesDetailPage({ params }: SeriesDetailProps) {
  const { slug } = await params;
  const series = getSeriesBySlug(slug);
  if (!series) notFound();

  const posts = getPostsBySeries(slug);

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">{series.title}</h1>
      <p className="mt-2 text-muted dark:text-muted-dark">
        {series.description}
      </p>

      <ol className="mt-10 space-y-4">
        {posts.map((post, index) => (
          <li key={post.slug}>
            <Link
              href={`/posts/${post.slug}`}
              className="flex items-baseline gap-4 rounded-lg border border-border p-4 hover:border-primary dark:border-border-dark dark:hover:border-primary-dark"
            >
              <span className="text-2xl font-bold text-muted dark:text-muted-dark">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="font-semibold">{post.frontmatter.title}</h2>
                <p className="mt-1 text-sm text-muted dark:text-muted-dark">
                  {post.frontmatter.description}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>

      {posts.length === 0 && (
        <p className="mt-10 text-muted dark:text-muted-dark">
          이 시리즈에 아직 글이 없습니다.
        </p>
      )}
    </main>
  );
}
```

- [ ] **Step 3: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds. `/series` and `/series/browser-internals` pages generated.

- [ ] **Step 4: Commit**

```bash
git add src/app/series/
git commit -m "feat: add series listing and detail pages"
```

---

### Task 7: Post Detail Enhancements — TOC & Series Navigation

**Files:**
- Create: `src/components/post/TableOfContents.tsx`
- Create: `src/components/post/SeriesNav.tsx`
- Modify: `src/app/posts/[slug]/page.tsx`

- [ ] **Step 1: Create TableOfContents component**

Create `src/components/post/TableOfContents.tsx`:

```tsx
interface TocItem {
  text: string;
  slug: string;
  level: number;
}

function extractHeadings(content: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const text = match[2].trim();
    const slug = text
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, "")
      .replace(/\s+/g, "-");
    headings.push({ text, slug, level: match[1].length });
  }

  return headings;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const headings = extractHeadings(content);

  if (headings.length === 0) return null;

  return (
    <nav className="mb-10 rounded-lg border border-border p-4 dark:border-border-dark">
      <h2 className="mb-3 text-sm font-semibold">목차</h2>
      <ul className="space-y-1.5">
        {headings.map((heading) => (
          <li
            key={heading.slug}
            style={{ paddingLeft: `${(heading.level - 2) * 16}px` }}
          >
            <a
              href={`#${heading.slug}`}
              className="text-sm text-muted hover:text-text dark:text-muted-dark dark:hover:text-text-dark"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 2: Create SeriesNav component**

Create `src/components/post/SeriesNav.tsx`:

```tsx
import Link from "next/link";
import type { PostMeta, Series } from "@/types/post";

interface SeriesNavProps {
  series: Series;
  posts: PostMeta[];
  currentSlug: string;
}

export function SeriesNav({ series, posts, currentSlug }: SeriesNavProps) {
  const currentIndex = posts.findIndex((p) => p.slug === currentSlug);
  const prev = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const next = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  return (
    <div className="mt-12 rounded-lg border border-border p-6 dark:border-border-dark">
      <Link
        href={`/series/${series.slug}`}
        className="text-sm font-semibold text-primary dark:text-primary-dark"
      >
        {series.title}
      </Link>
      <p className="mt-1 text-xs text-muted dark:text-muted-dark">
        {currentIndex + 1} / {posts.length}
      </p>

      <div className="mt-4 flex justify-between gap-4">
        {prev ? (
          <Link
            href={`/posts/${prev.slug}`}
            className="text-sm text-muted hover:text-text dark:text-muted-dark dark:hover:text-text-dark"
          >
            ← {prev.frontmatter.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/posts/${next.slug}`}
            className="text-right text-sm text-muted hover:text-text dark:text-muted-dark dark:hover:text-text-dark"
          >
            {next.frontmatter.title} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update post detail page with TOC and SeriesNav**

Replace `src/app/posts/[slug]/page.tsx`:

```tsx
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { getAllSlugs, getPostBySlug, getPostsBySeries } from "@/lib/posts";
import { getSeriesBySlug } from "@/lib/series";
import { mdxComponents } from "@/lib/mdx-components";
import { TableOfContents } from "@/components/post/TableOfContents";
import { SeriesNav } from "@/components/post/SeriesNav";
import { TagList } from "@/components/post/TagList";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params;
  try {
    const post = getPostBySlug(slug);
    return {
      title: `${post.frontmatter.title} | Ray Book`,
      description: post.frontmatter.description,
    };
  } catch {
    return { title: "Not Found | Ray Book" };
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  const series = post.frontmatter.series
    ? getSeriesBySlug(post.frontmatter.series)
    : null;
  const seriesPosts = post.frontmatter.series
    ? getPostsBySeries(post.frontmatter.series)
    : [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">{post.frontmatter.title}</h1>
        <p className="mt-2 text-muted dark:text-muted-dark">
          {post.frontmatter.description}
        </p>
        <time
          className="mt-2 block text-sm text-muted dark:text-muted-dark"
          dateTime={post.frontmatter.date.toISOString()}
        >
          {post.frontmatter.date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        <div className="mt-3">
          <TagList tags={post.frontmatter.tags} />
        </div>
      </header>

      <TableOfContents content={post.content} />

      <article className="prose">
        <MDXRemote source={post.content} components={mdxComponents} />
      </article>

      {series && (
        <SeriesNav
          series={series}
          posts={seriesPosts}
          currentSlug={slug}
        />
      )}
    </main>
  );
}
```

- [ ] **Step 4: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds. Post page includes TOC and (when applicable) series navigation.

- [ ] **Step 5: Commit**

```bash
git add src/components/post/TableOfContents.tsx src/components/post/SeriesNav.tsx src/app/posts/
git commit -m "feat: add TOC and series navigation to post detail page"
```

---

### Task 8: Visualization Primitives — StepPlayer & AnimatedBox

**Files:**
- Create: `src/components/viz/primitives/StepPlayer.tsx`
- Create: `src/components/viz/primitives/AnimatedBox.tsx`

- [ ] **Step 1: Create StepPlayer component**

Create `src/components/viz/primitives/StepPlayer.tsx`:

```tsx
"use client";

import { useState, useCallback } from "react";

interface StepPlayerProps {
  totalSteps: number;
  onStepChange: (step: number) => void;
  children: React.ReactNode;
}

export function StepPlayer({
  totalSteps,
  onStepChange,
  children,
}: StepPlayerProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const goTo = useCallback(
    (step: number) => {
      const clamped = Math.max(0, Math.min(step, totalSteps - 1));
      setCurrentStep(clamped);
      onStepChange(clamped);
    },
    [totalSteps, onStepChange]
  );

  return (
    <div className="my-6 rounded-lg border border-border p-4 dark:border-border-dark">
      <div>{children}</div>
      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          onClick={() => goTo(0)}
          disabled={currentStep === 0}
          className="rounded px-2 py-1 text-sm text-muted hover:text-text disabled:opacity-30 dark:text-muted-dark dark:hover:text-text-dark"
        >
          ⏮
        </button>
        <button
          onClick={() => goTo(currentStep - 1)}
          disabled={currentStep === 0}
          className="rounded px-2 py-1 text-sm text-muted hover:text-text disabled:opacity-30 dark:text-muted-dark dark:hover:text-text-dark"
        >
          ◀
        </button>
        <span className="min-w-[60px] text-center text-sm text-muted dark:text-muted-dark">
          {currentStep + 1} / {totalSteps}
        </span>
        <button
          onClick={() => goTo(currentStep + 1)}
          disabled={currentStep === totalSteps - 1}
          className="rounded px-2 py-1 text-sm text-muted hover:text-text disabled:opacity-30 dark:text-muted-dark dark:hover:text-text-dark"
        >
          ▶
        </button>
        <button
          onClick={() => goTo(totalSteps - 1)}
          disabled={currentStep === totalSteps - 1}
          className="rounded px-2 py-1 text-sm text-muted hover:text-text disabled:opacity-30 dark:text-muted-dark dark:hover:text-text-dark"
        >
          ⏭
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create AnimatedBox component**

Create `src/components/viz/primitives/AnimatedBox.tsx`:

```tsx
"use client";

import { motion, type Variants } from "framer-motion";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

const slideLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const slideRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

const presets = { fadeIn, scaleIn, slideLeft, slideRight };

interface AnimatedBoxProps {
  preset?: keyof typeof presets;
  delay?: number;
  className?: string;
  children: React.ReactNode;
}

export function AnimatedBox({
  preset = "fadeIn",
  delay = 0,
  className,
  children,
}: AnimatedBoxProps) {
  return (
    <motion.div
      variants={presets[preset]}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 3: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/viz/primitives/StepPlayer.tsx src/components/viz/primitives/AnimatedBox.tsx
git commit -m "feat: add StepPlayer and AnimatedBox visualization primitives"
```

---

### Task 9: Search with Pagefind

**Files:**
- Create: `src/components/search/SearchWidget.tsx`
- Create: `src/app/search/page.tsx`
- Modify: `package.json` (build script)

- [ ] **Step 1: Install Pagefind**

```bash
npm install -D pagefind
```

- [ ] **Step 2: Create SearchWidget client component**

Create `src/components/search/SearchWidget.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";

export function SearchWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadPagefind() {
      try {
        // @ts-expect-error — Pagefind is loaded from static assets at runtime
        const pagefind = await import(/* webpackIgnore: true */ "/pagefind/pagefind.js");
        await pagefind.init();

        if (containerRef.current) {
          // @ts-expect-error — Pagefind UI loaded dynamically
          const PagefindUI = await import(/* webpackIgnore: true */ "/pagefind/pagefind-ui.js");
          new PagefindUI.PagefindUI({
            element: containerRef.current,
            showSubResults: true,
          });
        }
      } catch {
        // Pagefind not available in dev mode — expected
        if (containerRef.current) {
          containerRef.current.innerHTML =
            '<p class="text-muted dark:text-muted-dark">검색은 프로덕션 빌드에서만 사용할 수 있습니다.</p>';
        }
      }
    }

    loadPagefind();
  }, []);

  return (
    <>
      <link href="/pagefind/pagefind-ui.css" rel="stylesheet" />
      <div ref={containerRef} />
    </>
  );
}
```

- [ ] **Step 3: Create search page**

Create `src/app/search/page.tsx`:

```tsx
import type { Metadata } from "next";
import { SearchWidget } from "@/components/search/SearchWidget";

export const metadata: Metadata = {
  title: "검색 | Ray Book",
  description: "블로그 글 검색",
};

export default function SearchPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">검색</h1>
      <p className="mt-2 mb-8 text-muted dark:text-muted-dark">
        글 제목, 내용, 태그로 검색할 수 있습니다
      </p>
      <SearchWidget />
    </main>
  );
}
```

- [ ] **Step 4: Update build script in package.json**

In `package.json`, update the `build` script:

```json
{
  "scripts": {
    "build": "next build && npx pagefind --site out"
  }
}
```

- [ ] **Step 5: Verify build with Pagefind**

Run:
```bash
npm run build
```

Expected: Next.js build succeeds, then Pagefind indexes the `out/` directory and creates `out/pagefind/` with index files.

- [ ] **Step 6: Commit**

```bash
git add src/components/search/ src/app/search/ package.json
git commit -m "feat: add Pagefind search with client-side UI"
```

---

### Task 10: Sample Domain Visualization — EventLoop

**Files:**
- Create: `src/components/viz/domain/EventLoop.tsx`
- Create: `content/posts/event-loop-basics.mdx`

- [ ] **Step 1: Create EventLoop domain component**

Create `src/components/viz/domain/EventLoop.tsx`:

```tsx
"use client";

import { useState, useCallback } from "react";
import { StepPlayer } from "../primitives/StepPlayer";
import { AnimatedBox } from "../primitives/AnimatedBox";

interface EventLoopStep {
  queue: "macrotask" | "microtask" | "render";
  item: string;
  description: string;
}

interface EventLoopProps {
  steps: EventLoopStep[];
}

const queueColors = {
  macrotask:
    "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200",
  microtask:
    "bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-200",
  render:
    "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-200",
};

const queueLabels = {
  macrotask: "Macrotask Queue",
  microtask: "Microtask Queue",
  render: "Render",
};

export function EventLoop({ steps }: EventLoopProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleStepChange = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const visibleSteps = steps.slice(0, currentStep + 1);

  return (
    <StepPlayer totalSteps={steps.length} onStepChange={handleStepChange}>
      <div className="space-y-3">
        {/* Queue lanes */}
        {(["macrotask", "microtask", "render"] as const).map((queue) => {
          const queueSteps = visibleSteps.filter((s) => s.queue === queue);
          return (
            <div key={queue} className="flex items-start gap-3">
              <span className="w-32 shrink-0 pt-1 text-right text-xs font-medium text-muted dark:text-muted-dark">
                {queueLabels[queue]}
              </span>
              <div className="flex flex-1 flex-wrap gap-2">
                {queueSteps.map((step, i) => (
                  <AnimatedBox key={i} preset="scaleIn">
                    <span
                      className={`inline-block rounded border px-2 py-1 text-xs font-mono ${queueColors[queue]}`}
                    >
                      {step.item}
                    </span>
                  </AnimatedBox>
                ))}
                {queueSteps.length === 0 && (
                  <span className="pt-1 text-xs text-muted/50 dark:text-muted-dark/50">
                    (비어 있음)
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Current step description */}
        <div className="mt-4 rounded border border-border bg-surface p-3 text-sm dark:border-border-dark dark:bg-surface-dark">
          {steps[currentStep]?.description}
        </div>
      </div>
    </StepPlayer>
  );
}
```

- [ ] **Step 2: Create sample post using EventLoop visualization**

Create `content/posts/event-loop-basics.mdx`:

```mdx
---
title: "이벤트 루프 기초"
description: "브라우저 이벤트 루프가 JavaScript를 실행하는 방식을 시각화로 이해합니다"
date: 2026-03-31
tags: ["javascript", "browser", "event-loop"]
series: "browser-internals"
seriesOrder: 1
draft: false
---

## 이벤트 루프란?

브라우저에서 JavaScript는 **싱글 스레드**로 실행됩니다. 하지만 비동기 작업(타이머, 네트워크 요청, DOM 이벤트)은 어떻게 처리될까요?

바로 **이벤트 루프(Event Loop)**가 이를 관리합니다.

## 동작 과정

아래 시각화에서 단계별로 이벤트 루프가 어떻게 작업을 처리하는지 확인해보세요.

<EventLoop
  steps={[
    { queue: "macrotask", item: "script", description: "전체 스크립트가 macrotask로 실행됩니다." },
    { queue: "microtask", item: "Promise.then", description: "Promise.then 콜백이 microtask 큐에 추가됩니다." },
    { queue: "microtask", item: "queueMicrotask", description: "queueMicrotask 콜백도 microtask 큐에 추가됩니다." },
    { queue: "render", item: "rAF callback", description: "requestAnimationFrame 콜백이 렌더 단계에 예약됩니다." },
    { queue: "macrotask", item: "setTimeout", description: "setTimeout 콜백이 다음 macrotask로 큐에 들어갑니다." }
  ]}
/>

## 핵심 규칙

1. **Microtask는 항상 먼저** — 현재 macrotask가 끝나면 microtask 큐를 전부 비웁니다
2. **렌더링은 그 다음** — microtask가 끝나면 필요 시 렌더링 단계를 실행합니다
3. **다음 macrotask** — 렌더링 후 다음 macrotask를 꺼내 실행합니다

이 순서를 기억하면 `setTimeout`, `Promise`, `requestAnimationFrame`의 실행 순서를 예측할 수 있습니다.
```

- [ ] **Step 3: Register EventLoop in MDX components**

Update `src/lib/mdx-components.ts` — add EventLoop to the component map:

```typescript
import type { MDXComponents } from "mdx/types";
import { CodeBlock } from "@/components/viz/primitives/CodeBlock";
import { EventLoop } from "@/components/viz/domain/EventLoop";

export const mdxComponents: MDXComponents = {
  EventLoop,
  pre: ({ children, ...props }: React.ComponentProps<"pre">) => {
    const codeElement = children as React.ReactElement<{
      children: string;
      className?: string;
    }>;

    if (
      codeElement &&
      typeof codeElement === "object" &&
      "props" in codeElement
    ) {
      const code = codeElement.props.children?.trim() ?? "";
      const lang =
        codeElement.props.className?.replace("language-", "") ?? "text";

      // @ts-expect-error — CodeBlock is an async server component
      return <CodeBlock code={code} lang={lang} />;
    }

    return <pre {...props}>{children}</pre>;
  },
};
```

- [ ] **Step 4: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds. `out/posts/event-loop-basics.html` exists and contains the EventLoop visualization markup.

- [ ] **Step 5: Commit**

```bash
git add src/components/viz/domain/EventLoop.tsx content/posts/event-loop-basics.mdx src/lib/mdx-components.ts
git commit -m "feat: add EventLoop visualization component with sample post"
```

---

### Task 11: Cloudflare Pages Deployment Setup

**Files:**
- Create: `wrangler.toml` (optional, for `wrangler pages` CLI)

- [ ] **Step 1: Verify static export is complete and correct**

Run:
```bash
npm run build
ls -la out/
ls out/pagefind/
```

Expected: `out/` contains `index.html`, `posts/`, `series/`, `search/`. `out/pagefind/` contains Pagefind index files.

- [ ] **Step 2: Test locally with wrangler**

```bash
npx wrangler pages dev out
```

Expected: Site runs locally at `http://localhost:8788`. Navigate to `/`, `/posts/hello-world`, `/posts/event-loop-basics`, `/series`, `/search` — all pages load correctly.

- [ ] **Step 3: Commit deployment configuration**

```bash
git add -A
git commit -m "feat: finalize build pipeline for Cloudflare Pages deployment"
```

At this point the project is ready to be deployed to Cloudflare Pages. The user connects their git repository via the Cloudflare dashboard, sets:
- Build command: `npm run build`
- Build output directory: `out`
