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
