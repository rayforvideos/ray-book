"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";

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
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

function isChosung(ch: string): boolean {
  return CHOSUNG.includes(ch);
}

function getChosung(str: string): string {
  return [...str]
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code >= HANGUL_START && code <= HANGUL_END) {
        const index = Math.floor(
          (code - HANGUL_START) / (JUNG_COUNT * JONG_COUNT)
        );
        return CHOSUNG[index];
      }
      return ch.toLowerCase();
    })
    .join("");
}

function isChosungQuery(query: string): boolean {
  return [...query].some((ch) => isChosung(ch));
}

function matchChosung(query: string, target: string, targetChosung: string): boolean {
  const q = query.toLowerCase();

  // Direct substring match first
  if (target.toLowerCase().includes(q)) return true;

  // Chosung match
  if (isChosungQuery(q)) {
    const queryChosung = getChosung(q);
    return targetChosung.includes(queryChosung);
  }

  return false;
}

export function ChosungSearch() {
  const [index, setIndex] = useState<PostEntry[]>([]);
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/search/chosung-index.json")
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setIndex(data);
        setLoaded(true);
      })
      .catch(() => {
        setLoaded(true);
      });
  }, []);

  const results = useMemo(() => {
    if (!query.trim() || index.length === 0) return [];

    return index.filter(
      (post) =>
        matchChosung(query, post.title, post.titleChosung) ||
        matchChosung(query, post.description, post.descriptionChosung) ||
        post.tags.some((tag, i) =>
          matchChosung(query, tag, post.tagsChosung[i])
        )
    );
  }, [query, index]);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    []
  );

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInput}
          placeholder={
            loaded ? "검색어 또는 초성 입력 (ㅇㅂㅌ → 이벤트)" : "로딩 중..."
          }
          className="w-full border border-border bg-bg px-4 py-3 text-[0.875rem] text-text placeholder:text-muted/50 focus:border-accent focus:outline-none"
          disabled={!loaded}
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

      {/* Results */}
      <div className="mt-5 min-h-[4rem]">
        {!query.trim() ? (
          <p className="text-[0.8125rem] text-muted/40">
            제목, 설명, 태그에서 검색합니다
          </p>
        ) : results.length > 0 ? (
          <>
            <p className="mb-3 text-[0.6875rem] text-muted/50">
              {results.length}개의 글
            </p>
            <div className="divide-y divide-border">
              {results.map((post) => (
                <Link
                  key={post.slug}
                  href={`/posts/${post.slug}`}
                  className="group block py-4 first:pt-0"
                >
                  <span className="text-[0.875rem] font-medium text-text group-hover:text-accent">
                    {highlightMatch(post.title, query)}
                  </span>
                  <span className="mt-1 block text-[0.75rem] leading-relaxed text-muted">
                    {post.description}
                  </span>
                  {post.tags.length > 0 && (
                    <span className="mt-1.5 flex gap-1.5">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[0.625rem] text-muted/50 before:content-['#']"
                        >
                          {tag}
                        </span>
                      ))}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </>
        ) : (
          <p className="text-[0.8125rem] text-muted">
            검색 결과가 없습니다
          </p>
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
