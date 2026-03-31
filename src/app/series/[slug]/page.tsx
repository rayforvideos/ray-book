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
    openGraph: {
      title: `${series.title} | Ray Book`,
      description: series.description,
    },
  };
}

export default async function SeriesDetailPage({
  params,
}: SeriesDetailProps) {
  const { slug } = await params;
  const series = getSeriesBySlug(slug);
  if (!series) notFound();

  const posts = getPostsBySeries(slug);

  return (
    <main className="mx-auto max-w-2xl px-6 pt-20 pb-16">
      <h1 className="font-serif text-3xl tracking-tight">{series.title}</h1>
      <p className="mt-3 text-[0.9375rem] text-muted">
        {series.description}
      </p>

      <ol className="mt-12 space-y-0 divide-y divide-border">
        {posts.map((post, index) => (
          <li key={post.slug}>
            <Link
              href={`/posts/${post.slug}`}
              className="group flex items-baseline gap-5 py-5"
            >
              <span className="shrink-0 font-mono text-[0.75rem] tabular-nums text-muted/40">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="text-[0.9375rem] font-medium group-hover:text-accent">
                  {post.frontmatter.title}
                </h2>
                <p className="mt-0.5 text-[0.8125rem] text-muted">
                  {post.frontmatter.description}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>

      {posts.length === 0 && (
        <p className="mt-12 text-[0.875rem] text-muted">
          이 시리즈에 아직 글이 없습니다.
        </p>
      )}
    </main>
  );
}
