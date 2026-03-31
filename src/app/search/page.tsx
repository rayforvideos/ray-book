import type { Metadata } from "next";
import { UnifiedSearch } from "@/components/search/UnifiedSearch";

export const metadata: Metadata = {
  title: "검색 | Ray Book",
  description: "블로그 글 검색",
};

export default function SearchPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 pt-20 pb-16">
      <h1 className="font-serif text-3xl tracking-tight">검색</h1>
      <div className="mt-8">
        <UnifiedSearch />
      </div>
    </main>
  );
}
