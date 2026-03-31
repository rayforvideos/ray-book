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
        <h2 className="text-lg font-semibold group-hover:text-primary dark:group-hover:text-primary-dark">
          {frontmatter.title}
        </h2>
        <p className="mt-1 text-sm text-muted dark:text-muted-dark">
          {frontmatter.description}
        </p>
        <time
          className="mt-2 block text-xs text-muted dark:text-muted-dark"
          dateTime={frontmatter.date.toISOString()}
        >
          {frontmatter.date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </Link>
      <div className="mt-2">
        <TagList tags={frontmatter.tags} />
      </div>
    </article>
  );
}
