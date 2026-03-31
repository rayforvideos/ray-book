# Ray Book

프론트엔드 개념을 인터랙티브 시각화로 이해하는 학습 블로그.

## 기술 스택

- **Next.js 15** — App Router, Static Export
- **Tailwind CSS v4** — CSS-first config
- **MDX** — next-mdx-remote/rsc
- **Shiki** — 코드 하이라이팅
- **Framer Motion** — 시각화 애니메이션
- **Pagefind** — 클라이언트 사이드 검색
- **Cloudflare Pages** — 배포

## 개발

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

`next build` → `sitemap.xml 생성` → `pagefind 인덱싱`

## 글 작성

`content/posts/`에 MDX 파일을 추가합니다. 시각화 컴포넌트는 `src/components/viz/domain/`에 있습니다.

## 배포

Cloudflare Pages:
- Build command: `npm run build`
- Output directory: `out`
