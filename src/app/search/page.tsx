import type { Metadata } from "next";
import { ChosungSearch } from "@/components/search/ChosungSearch";
import { SearchWidget } from "@/components/search/SearchWidget";

export const metadata: Metadata = {
  title: "검색 | Ray Book",
  description: "블로그 글 검색",
};

export default function SearchPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 pt-20 pb-16">
      <h1 className="font-serif text-3xl tracking-tight">검색</h1>

      <div className="mt-8">
        <ChosungSearch />
      </div>

      <details className="mt-16 group">
        <summary className="cursor-pointer select-none text-[0.75rem] text-muted hover:text-text">
          본문 전체 검색 (Pagefind)
        </summary>
        <div className="mt-4">
          <SearchWidget />
        </div>
      </details>
    </main>
  );
}
