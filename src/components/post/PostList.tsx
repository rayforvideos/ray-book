import type { PostMeta } from "@/types/post";
import { PostCard } from "./PostCard";

interface PostListProps {
  posts: PostMeta[];
}

export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <p className="text-muted dark:text-muted-dark">
        아직 작성된 글이 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
