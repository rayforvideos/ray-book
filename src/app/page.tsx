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
