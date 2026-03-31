import type { Metadata } from "next";
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
        글 제목, 내용, 태그로 검색할 수 있습니다
      </p>
      <SearchWidget />
    </main>
  );
}
