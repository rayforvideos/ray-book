import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BASE_URL = "https://ray-book.pages.dev";
const POSTS_DIR = path.join(process.cwd(), "content/posts");
const SERIES_FILE = path.join(process.cwd(), "content/series.json");
const OUT_DIR = path.join(process.cwd(), "out");

function getPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, f), "utf-8");
      const { data } = matter(raw);
      if (data.draft) return null;
      return {
        slug: f.replace(/\.mdx$/, ""),
        date: data.date ? new Date(data.date).toISOString().split("T")[0] : "",
      };
    })
    .filter(Boolean);
}

function getSeriesSlugs() {
  if (!fs.existsSync(SERIES_FILE)) return [];
  return JSON.parse(fs.readFileSync(SERIES_FILE, "utf-8")).map((s) => s.slug);
}

const posts = getPosts();
const seriesSlugs = getSeriesSlugs();
const today = new Date().toISOString().split("T")[0];

const urls = [
  `  <url>\n    <loc>${BASE_URL}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>1.0</priority>\n  </url>`,
  ...posts.map(
    (p) =>
      `  <url>\n    <loc>${BASE_URL}/posts/${p.slug}</loc>\n    <lastmod>${p.date}</lastmod>\n    <priority>0.7</priority>\n  </url>`
  ),
  ...seriesSlugs.map(
    (s) =>
      `  <url>\n    <loc>${BASE_URL}/series/${s}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>0.6</priority>\n  </url>`
  ),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

fs.writeFileSync(path.join(OUT_DIR, "sitemap.xml"), sitemap);
console.log(`Sitemap generated with ${urls.length} URLs`);
