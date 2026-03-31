import type { PostMeta } from "@/types/post";
import { PostCard } from "./PostCard";

interface PostListProps {
  posts: PostMeta[];
}

export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <p className="text-[0.875rem] text-muted">
        아직 작성된 글이 없습니다.
      </p>
    );
  }

  return (
    <div className="divide-y divide-border">
      {posts.map((post) => (
        <div key={post.slug} className="py-6 first:pt-0 last:pb-0">
          <PostCard post={post} />
        </div>
      ))}
    </div>
  );
}
