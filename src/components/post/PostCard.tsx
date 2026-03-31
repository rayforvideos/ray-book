import Link from "next/link";
import type { PostMeta } from "@/types/post";
import { TagList } from "./TagList";

interface PostCardProps {
  post: PostMeta;
}

export function PostCard({ post }: PostCardProps) {
  const { slug, frontmatter } = post;

  return (
    <article className="group">
      <Link href={`/posts/${slug}`} className="block">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-lg tracking-tight group-hover:text-accent">
            {frontmatter.title}
          </h2>
          <time
            className="shrink-0 text-[0.75rem] tabular-nums text-muted"
            dateTime={frontmatter.date.toISOString()}
          >
            {frontmatter.date.toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
        </div>
        <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted">
          {frontmatter.description}
        </p>
      </Link>
      <div className="mt-2.5">
        <TagList tags={frontmatter.tags} />
      </div>
    </article>
  );
}
