"use client";

import { useState } from "react";
import Link from "next/link";

interface SeriesWithPosts {
  slug: string;
  title: string;
  description: string;
  category: string;
  posts: { slug: string }[];
}

interface ExpandableSeriesListProps {
  series: SeriesWithPosts[];
  initialCount?: number;
}

export function ExpandableSeriesList({
  series,
  initialCount = 3,
}: ExpandableSeriesListProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? series : series.slice(0, initialCount);
  const hasMore = !expanded && series.length > initialCount;

  const categories = Array.from(
    new Set(visible.map((s) => s.category))
  );

  return (
    <div>
      {categories.map((category) => {
        const items = visible.filter((s) => s.category === category);
        return (
          <div key={category} className="mb-8 last:mb-0">
            <span className="mb-3 block text-[0.625rem] font-medium uppercase tracking-[0.15em] text-muted">
              {category}
            </span>
            <div className="space-y-5">
              {items.map((s) => (
                <Link
                  key={s.slug}
                  href={`/series/${s.slug}`}
                  className="group block"
                >
                  <h3 className="font-serif text-lg tracking-tight group-hover:text-accent">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-[0.8125rem] text-muted">
                    {s.description}
                  </p>
                  <span className="mt-1.5 block text-[0.75rem] text-muted">
                    총 {s.posts.length}편
                  </span>
                </Link>
              ))}
            </div>
          </div>
        );
      })}

      {hasMore && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setExpanded(true)}
            className="text-[0.8125rem] text-muted hover:text-text transition-colors"
          >
            더 보기 ({series.length - initialCount}개 시리즈 더)
          </button>
        </div>
      )}
    </div>
  );
}
