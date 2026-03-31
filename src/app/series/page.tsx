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
    <main className="mx-auto max-w-2xl px-6 pt-20 pb-16">
      <h1 className="font-serif text-3xl tracking-tight">시리즈</h1>
      <p className="mt-3 text-[0.9375rem] text-muted">
        주제별로 묶인 학습 시리즈
      </p>

      <div className="mt-12 space-y-10">
        {seriesWithPosts.map((series) => (
          <Link
            key={series.slug}
            href={`/series/${series.slug}`}
            className="group block"
          >
            <h2 className="font-serif text-xl tracking-tight group-hover:text-accent">
              {series.title}
            </h2>
            <p className="mt-1.5 text-[0.875rem] leading-relaxed text-muted">
              {series.description}
            </p>
            <span className="mt-2 block text-[0.75rem] text-muted/60">
              {series.posts.length}편
            </span>
          </Link>
        ))}

        {seriesWithPosts.length === 0 && (
          <p className="text-[0.875rem] text-muted">
            아직 시리즈가 없습니다.
          </p>
        )}
      </div>
    </main>
  );
}
