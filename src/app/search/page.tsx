import type { Metadata } from "next";
import { SearchWidget } from "@/components/search/SearchWidget";

export const metadata: Metadata = {
  title: "검색 | Ray Book",
  description: "블로그 글 검색",
};

export default function SearchPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">검색</h1>
      <p className="mt-2 mb-8 text-muted dark:text-muted-dark">
        글 제목, 내용, 태그로 검색할 수 있습니다
      </p>
      <SearchWidget />
    </main>
  );
}
