import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content/posts");
const OUT_DIR = path.join(process.cwd(), "out");

// Korean Unicode ranges
const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;
const CHO_COUNT = 21;
const JUNG_COUNT = 21;
const JONG_COUNT = 28;

const CHOSUNG = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

function getChosung(str) {
  return [...str]
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code >= HANGUL_START && code <= HANGUL_END) {
        const index = Math.floor((code - HANGUL_START) / (JUNG_COUNT * JONG_COUNT));
        return CHOSUNG[index];
      }
      return ch.toLowerCase();
    })
    .join("");
}

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
        title: data.title || "",
        description: data.description || "",
        tags: data.tags || [],
      };
    })
    .filter(Boolean);
}

const posts = getPosts();

const index = posts.map((post) => ({
  slug: post.slug,
  title: post.title,
  description: post.description,
  tags: post.tags,
  // Pre-computed chosung for matching
  titleChosung: getChosung(post.title),
  descriptionChosung: getChosung(post.description),
  tagsChosung: post.tags.map((t) => getChosung(t)),
}));

fs.mkdirSync(path.join(OUT_DIR, "search"), { recursive: true });
fs.writeFileSync(
  path.join(OUT_DIR, "search", "chosung-index.json"),
  JSON.stringify(index)
);

console.log(`Chosung index generated with ${index.length} posts`);
