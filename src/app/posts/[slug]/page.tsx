import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
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
      openGraph: {
        type: "article",
        publishedTime: post.frontmatter.date.toISOString(),
        tags: post.frontmatter.tags,
      },
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
    <main className="mx-auto max-w-2xl px-6 pt-20 pb-16 overflow-x-hidden">
      <header className="mb-12">
        <div className="flex items-center gap-3 text-[0.75rem] text-muted">
          <time dateTime={post.frontmatter.date.toISOString()}>
            {post.frontmatter.date.toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          {series && (
            <>
              <span className="text-border">/</span>
              <span className="font-serif italic">{series.title}</span>
            </>
          )}
        </div>
        <h1 className="mt-4 font-serif text-[2rem] leading-tight tracking-tight">
          {post.frontmatter.title}
        </h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
          {post.frontmatter.description}
        </p>
        <div className="mt-4">
          <TagList tags={post.frontmatter.tags} />
        </div>
      </header>

      <TableOfContents content={post.content} />

      <article className="prose">
        <MDXRemote
          source={post.content}
          components={mdxComponents}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } }}
        />
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
