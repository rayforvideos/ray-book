import { getSeriesWithPosts } from "@/lib/series";
import { FilterableSeriesList } from "@/components/post/FilterableSeriesList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "시리즈 | Ray Book",
  description: "주제별로 묶인 학습 시리즈 목록",
};

export default function SeriesPage() {
  const seriesWithPosts = getSeriesWithPosts();

  const categories = Array.from(
    new Set(seriesWithPosts.map((s) => s.category))
  );

  const seriesData = seriesWithPosts.map((s) => ({
    slug: s.slug,
    title: s.title,
    description: s.description,
    category: s.category,
    postCount: s.posts.length,
  }));

  return (
    <main className="mx-auto max-w-2xl px-6 pt-20 pb-16">
      <h1 className="font-serif text-3xl tracking-tight">시리즈</h1>
      <p className="mt-3 text-[0.9375rem] text-muted">
        주제별로 묶인 학습 시리즈
      </p>

      <FilterableSeriesList series={seriesData} categories={categories} />
    </main>
  );
}
