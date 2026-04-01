import { getAllPostMetas } from "@/lib/posts";
import { getSeriesWithPosts } from "@/lib/series";
import { ExpandablePostList } from "@/components/post/ExpandablePostList";
import { ExpandableSeriesList } from "@/components/post/ExpandableSeriesList";

export default function Home() {
  const posts = getAllPostMetas();
  const seriesWithPosts = getSeriesWithPosts().filter(
    (s) => s.posts.length > 0
  );

  return (
    <main className="mx-auto max-w-2xl px-6 pt-20 pb-16">
      <section>
        <h1 className="font-serif text-4xl tracking-tight">Ray Book</h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
          프론트엔드 개념을 시각화로 이해하는 학습 블로그
        </p>
      </section>

      {seriesWithPosts.length > 0 && (
        <section className="mt-20">
          <h2 className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-muted">
            시리즈
          </h2>
          <div className="mt-5">
            <ExpandableSeriesList series={seriesWithPosts} />
          </div>
        </section>
      )}

      <section className="mt-20">
        <h2 className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-muted">
          최신 글
        </h2>
        <div className="mt-5">
          <ExpandablePostList posts={posts} />
        </div>
      </section>
    </main>
  );
}
