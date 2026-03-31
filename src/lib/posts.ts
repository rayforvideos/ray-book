import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { frontmatterSchema, type Post, type PostMeta } from "@/types/post";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

let postMetasCache: PostMeta[] | null = null;

function parseFrontmatter(raw: Record<string, unknown>, slug: string) {
  const result = frontmatterSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `Invalid frontmatter in ${slug}.mdx: ${result.error.message}`
    );
  }
  return result.data;
}

export function getAllPostMetas(): PostMeta[] {
  if (postMetasCache) return postMetasCache;

  if (!fs.existsSync(POSTS_DIR)) return [];

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));

  postMetasCache = files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
      const { data } = matter(raw);
      const frontmatter = parseFrontmatter(data, slug);
      return { slug, frontmatter };
    })
    .filter((post) => !post.frontmatter.draft)
    .sort(
      (a, b) =>
        b.frontmatter.date.getTime() - a.frontmatter.date.getTime()
    );

  return postMetasCache;
}

export function getPostBySlug(slug: string): Post {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const frontmatter = parseFrontmatter(data, slug);
  return { slug, frontmatter, content };
}

export function getPostsBySeries(series: string): PostMeta[] {
  return getAllPostMetas()
    .filter((post) => post.frontmatter.series === series)
    .sort(
      (a, b) =>
        (a.frontmatter.seriesOrder ?? 0) - (b.frontmatter.seriesOrder ?? 0)
    );
}

export function getAllSlugs(): string[] {
  return getAllPostMetas().map((post) => post.slug);
}
