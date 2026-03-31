interface TocItem {
  text: string;
  slug: string;
  level: number;
}

function extractHeadings(content: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const text = match[2].trim();
    const slug = text
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, "")
      .replace(/\s+/g, "-");
    headings.push({ text, slug, level: match[1].length });
  }

  return headings;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const headings = extractHeadings(content);

  if (headings.length === 0) return null;

  return (
    <nav className="mb-10 rounded-lg border border-border p-4 dark:border-border-dark">
      <h2 className="mb-3 text-sm font-semibold">목차</h2>
      <ul className="space-y-1.5">
        {headings.map((heading) => (
          <li
            key={heading.slug}
            style={{ paddingLeft: `${(heading.level - 2) * 16}px` }}
          >
            <a
              href={`#${heading.slug}`}
              className="text-sm text-muted hover:text-text dark:text-muted-dark dark:hover:text-text-dark"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
