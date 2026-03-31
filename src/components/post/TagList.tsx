interface TagListProps {
  tags: string[];
}

export function TagList({ tags }: TagListProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="text-[0.6875rem] text-muted before:content-['#']"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
