"use client";

import { useState } from "react";
import type { PostMeta } from "@/types/post";
import { PostCard } from "./PostCard";

interface ExpandablePostListProps {
  posts: PostMeta[];
  initialCount?: number;
  maxCount?: number;
}

export function ExpandablePostList({
  posts,
  initialCount = 5,
  maxCount = 10,
}: ExpandablePostListProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = posts.slice(0, expanded ? maxCount : initialCount);
  const hasMore = !expanded && posts.length > initialCount;

  if (posts.length === 0) {
    return (
      <p className="text-[0.875rem] text-muted">
        아직 작성된 글이 없습니다.
      </p>
    );
  }

  return (
    <div>
      <div className="divide-y divide-border">
        {visible.map((post) => (
          <div key={post.slug} className="py-6 first:pt-0 last:pb-0">
            <PostCard post={post} />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setExpanded(true)}
            className="text-[0.8125rem] text-muted hover:text-text transition-colors"
          >
            더 보기 ({Math.min(posts.length, maxCount) - initialCount}편 더)
          </button>
        </div>
      )}
    </div>
  );
}
