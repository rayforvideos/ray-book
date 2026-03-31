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
  const next =
    currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  return (
    <div className="mt-16 border-t border-border pt-8">
      <div className="flex items-baseline justify-between">
        <Link
          href={`/series/${series.slug}`}
          className="font-serif text-[0.875rem] italic text-muted hover:text-text"
        >
          {series.title}
        </Link>
        <span className="text-[0.75rem] tabular-nums text-muted">
          {currentIndex + 1} / {posts.length}
        </span>
      </div>

      <div className="mt-5 flex justify-between gap-8">
        {prev ? (
          <Link
            href={`/posts/${prev.slug}`}
            className="group flex flex-col"
          >
            <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
              이전
            </span>
            <span className="mt-0.5 text-[0.8125rem] text-text group-hover:text-accent">
              {prev.frontmatter.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/posts/${next.slug}`}
            className="group flex flex-col items-end text-right"
          >
            <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
              다음
            </span>
            <span className="mt-0.5 text-[0.8125rem] text-text group-hover:text-accent">
              {next.frontmatter.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
