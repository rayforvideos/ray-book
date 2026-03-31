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
