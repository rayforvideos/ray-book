interface TagListProps {
  tags: string[];
}

export function TagList({ tags }: TagListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-surface px-2.5 py-0.5 text-xs text-muted dark:bg-surface-dark dark:text-muted-dark"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
