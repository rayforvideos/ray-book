"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";

// --- Chosung logic ---

interface PostEntry {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  titleChosung: string;
  descriptionChosung: string;
  tagsChosung: string[];
}

const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;
const JUNG_COUNT = 21;
const JONG_COUNT = 28;
const CHOSUNG = [
  "ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ",
  "ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ",
];

function isChosung(ch: string) { return CHOSUNG.includes(ch); }

function getChosung(str: string) {
  return [...str].map((ch) => {
    const code = ch.charCodeAt(0);
    if (code >= HANGUL_START && code <= HANGUL_END) {
      return CHOSUNG[Math.floor((code - HANGUL_START) / (JUNG_COUNT * JONG_COUNT))];
    }
    return ch.toLowerCase();
  }).join("");
}

function matchChosung(query: string, target: string, targetChosung: string) {
  const q = query.toLowerCase();
  if (target.toLowerCase().includes(q)) return true;
  if ([...q].some(isChosung)) return targetChosung.includes(getChosung(q));
  return false;
}

// --- Pagefind types ---

interface PagefindResult {
  url: string;
  meta: { title: string };
  excerpt: string;
}

// --- Component ---

export function UnifiedSearch() {
  const [query, setQuery] = useState("");
  const [chosungIndex, setChosungIndex] = useState<PostEntry[]>([]);
  const [pagefindResults, setPagefindResults] = useState<PagefindResult[]>([]);
  const [pagefindReady, setPagefindReady] = useState(false);
  const pagefindRef = useRef<{ search: (q: string) => Promise<{ results: { data: () => Promise<PagefindResult> }[] }> } | null>(null);

  // Load chosung index
  useEffect(() => {
    fetch("/search/chosung-index.json")
      .then((res) => res.ok ? res.json() : [])
      .then(setChosungIndex)
      .catch(() => {});
  }, []);

  // Load pagefind
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/pagefind/pagefind.js";
    script.onload = async () => {
      try {
        // @ts-expect-error — pagefind loaded globally
        const pf = window.pagefind;
        if (pf) {
          await pf.init();
          pagefindRef.current = pf;
          setPagefindReady(true);
        }
      } catch { /* not available */ }
    };
    script.onerror = () => {};
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  // Chosung results
  const chosungResults = useMemo(() => {
    if (!query.trim() || chosungIndex.length === 0) return [];
    return chosungIndex.filter(
      (post) =>
        matchChosung(query, post.title, post.titleChosung) ||
        matchChosung(query, post.description, post.descriptionChosung) ||
        post.tags.some((tag, i) => matchChosung(query, tag, post.tagsChosung[i]))
    );
  }, [query, chosungIndex]);

  // Pagefind search (debounced)
  useEffect(() => {
    if (!query.trim() || !pagefindReady || !pagefindRef.current) {
      setPagefindResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const search = await pagefindRef.current!.search(query);
        const results = await Promise.all(
          search.results.slice(0, 10).map((r) => r.data())
        );
        // Filter out results already shown by chosung
        const chosungSlugs = new Set(chosungResults.map((p) => p.slug));
        setPagefindResults(
          results.filter((r) => {
            const slug = r.url.replace(/^\/posts\//, "").replace(/\/$/, "");
            return !chosungSlugs.has(slug);
          })
        );
      } catch {
        setPagefindResults([]);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query, pagefindReady, chosungResults]);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value),
    []
  );

  const hasResults = chosungResults.length > 0 || pagefindResults.length > 0;
  const totalCount = chosungResults.length + pagefindResults.length;

  return (
    <div>
      {/* Input */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/40"
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={handleInput}
          placeholder="검색어 또는 초성 입력"
          className="w-full border border-border bg-bg py-3 pl-11 pr-10 text-[0.9375rem] text-text placeholder:text-muted/40 focus:border-accent focus:outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[0.75rem] text-muted hover:text-text"
            aria-label="검색어 지우기"
          >
            ✕
          </button>
        )}
      </div>

      {/* Hint */}
      {!query.trim() && (
        <p className="mt-2 text-[0.75rem] text-muted/50">
          초성도 됩니다 — ㅇㅂㅌ → 이벤트, ㅋㄹㅈ → 클로저
        </p>
      )}

      {/* Results */}
      <div className="mt-6">
        {query.trim() && (
          hasResults ? (
            <>
              <p className="mb-4 text-[0.75rem] text-muted">
                {totalCount}개의 결과
              </p>
              <div className="space-y-5">
                {/* Chosung matches */}
                {chosungResults.map((post) => (
                  <Link key={post.slug} href={`/posts/${post.slug}`} className="group block">
                    <span className="font-serif text-[0.9375rem] text-text group-hover:text-accent">
                      {highlightMatch(post.title, query)}
                    </span>
                    <span className="mt-1 block text-[0.8125rem] leading-relaxed text-muted">
                      {post.description}
                    </span>
                    {post.tags.length > 0 && (
                      <span className="mt-1.5 flex gap-1.5">
                        {post.tags.map((tag) => (
                          <span key={tag} className="text-[0.6875rem] text-muted/50 before:content-['#']">{tag}</span>
                        ))}
                      </span>
                    )}
                  </Link>
                ))}

                {/* Pagefind matches (not already shown) */}
                {pagefindResults.map((result) => (
                  <Link key={result.url} href={result.url} className="group block">
                    <span className="font-serif text-[0.9375rem] text-text group-hover:text-accent">
                      {result.meta.title}
                    </span>
                    <span
                      className="mt-1 block text-[0.75rem] leading-relaxed text-muted [&_mark]:bg-accent/15 [&_mark]:text-accent"
                      dangerouslySetInnerHTML={{ __html: result.excerpt }}
                    />
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <p className="text-[0.875rem] text-muted">검색 결과가 없습니다</p>
          )
        )}
      </div>
    </div>
  );
}

function highlightMatch(text: string, query: string): React.ReactNode {
  const q = query.toLowerCase();
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="bg-accent/15 text-accent">{text.slice(idx, idx + q.length)}</span>
      {text.slice(idx + q.length)}
    </>
  );
}
