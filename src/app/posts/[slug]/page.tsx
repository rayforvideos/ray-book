import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { getAllSlugs, getPostBySlug, getPostsBySeries } from "@/lib/posts";
import { getSeriesBySlug } from "@/lib/series";
import { mdxComponents } from "@/lib/mdx-components";
import { TableOfContents } from "@/components/post/TableOfContents";
import { SeriesNav } from "@/components/post/SeriesNav";
import { TagList } from "@/components/post/TagList";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params;
  try {
    const post = getPostBySlug(slug);
    return {
      title: `${post.frontmatter.title} | Ray Book`,
      description: post.frontmatter.description,
    };
  } catch {
    return { title: "Not Found | Ray Book" };
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  const series = post.frontmatter.series
    ? getSeriesBySlug(post.frontmatter.series)
    : null;
  const seriesPosts = post.frontmatter.series
    ? getPostsBySeries(post.frontmatter.series)
    : [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">{post.frontmatter.title}</h1>
        <p className="mt-2 text-muted dark:text-muted-dark">
          {post.frontmatter.description}
        </p>
        <time
          className="mt-2 block text-sm text-muted dark:text-muted-dark"
          dateTime={post.frontmatter.date.toISOString()}
        >
          {post.frontmatter.date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        <div className="mt-3">
          <TagList tags={post.frontmatter.tags} />
        </div>
      </header>

      <TableOfContents content={post.content} />

      <article className="prose">
        <MDXRemote source={post.content} components={mdxComponents} />
      </article>

      {series && (
        <SeriesNav
          series={series}
          posts={seriesPosts}
          currentSlug={slug}
        />
      )}
    </main>
  );
}
