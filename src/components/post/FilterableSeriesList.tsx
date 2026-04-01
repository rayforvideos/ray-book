"use client";

import { useState } from "react";
import Link from "next/link";

interface SeriesItem {
  slug: string;
  title: string;
  description: string;
  category: string;
  postCount: number;
}

interface FilterableSeriesListProps {
  series: SeriesItem[];
  categories: string[];
}

export function FilterableSeriesList({
  series,
  categories,
}: FilterableSeriesListProps) {
  const [active, setActive] = useState<string | null>(null);

  const filtered = active
    ? series.filter((s) => s.category === active)
    : series;

  const groupedCategories = Array.from(
    new Set(filtered.map((s) => s.category))
  );

  return (
    <div>
      {/* Filter buttons */}
      <div className="mt-8 flex flex-wrap gap-2">
        <button
          onClick={() => setActive(null)}
          className={`px-3 py-1.5 text-[0.75rem] border transition-colors ${
            active === null
              ? "border-accent text-accent bg-accent/10"
              : "border-border text-muted hover:text-text"
          }`}
        >
          전체
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(active === cat ? null : cat)}
            className={`px-3 py-1.5 text-[0.75rem] border transition-colors ${
              active === cat
                ? "border-accent text-accent bg-accent/10"
                : "border-border text-muted hover:text-text"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Series list grouped by category */}
      {groupedCategories.map((category) => {
        const items = filtered.filter((s) => s.category === category);
        return (
          <section key={category} className="mt-10">
            <h2 className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-muted">
              {category}
            </h2>
            <div className="mt-5 space-y-8">
              {items.map((s) => (
                <Link
                  key={s.slug}
                  href={`/series/${s.slug}`}
                  className="group block"
                >
                  <h3 className="font-serif text-xl tracking-tight group-hover:text-accent">
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-[0.875rem] leading-relaxed text-muted">
                    {s.description}
                  </p>
                  <span className="mt-2 block text-[0.75rem] text-muted">
                    총 {s.postCount}편
                  </span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      {filtered.length === 0 && (
        <p className="mt-12 text-[0.875rem] text-muted">
          해당 카테고리에 시리즈가 없습니다.
        </p>
      )}
    </div>
  );
}
