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
      <p className="mt-3 mb-10 text-[0.9375rem] text-muted">
        초성으로 빠르게 찾거나, 본문 전체를 검색할 수 있습니다
      </p>

      <ChosungSearch />

      <div className="mt-16 border-t border-border pt-8">
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-muted">
          본문 검색
        </span>
        <p className="mt-1 mb-4 text-[0.75rem] text-muted/60">
          글 내용까지 검색합니다 (프로덕션 빌드 전용)
        </p>
        <SearchWidget />
      </div>
    </main>
  );
}
