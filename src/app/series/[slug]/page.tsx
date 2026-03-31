import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllSeriesSlugs, getSeriesBySlug } from "@/lib/series";
import { getPostsBySeries } from "@/lib/posts";

interface SeriesDetailProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllSeriesSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: SeriesDetailProps) {
  const { slug } = await params;
  const series = getSeriesBySlug(slug);
  if (!series) return { title: "Not Found | Ray Book" };
  return {
    title: `${series.title} | Ray Book`,
    description: series.description,
  };
}

export default async function SeriesDetailPage({ params }: SeriesDetailProps) {
  const { slug } = await params;
  const series = getSeriesBySlug(slug);
  if (!series) notFound();

  const posts = getPostsBySeries(slug);

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">{series.title}</h1>
      <p className="mt-2 text-muted dark:text-muted-dark">
        {series.description}
      </p>

      <ol className="mt-10 space-y-4">
        {posts.map((post, index) => (
          <li key={post.slug}>
            <Link
              href={`/posts/${post.slug}`}
              className="flex items-baseline gap-4 rounded-lg border border-border p-4 hover:border-primary dark:border-border-dark dark:hover:border-primary-dark"
            >
              <span className="text-2xl font-bold text-muted dark:text-muted-dark">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="font-semibold">{post.frontmatter.title}</h2>
                <p className="mt-1 text-sm text-muted dark:text-muted-dark">
                  {post.frontmatter.description}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>

      {posts.length === 0 && (
        <p className="mt-10 text-muted dark:text-muted-dark">
          이 시리즈에 아직 글이 없습니다.
        </p>
      )}
    </main>
  );
}
