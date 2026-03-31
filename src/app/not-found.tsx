import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-6 pt-20 pb-16">
      <h1 className="font-serif text-[2rem] leading-tight tracking-tight">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
        요청하신 페이지가 존재하지 않거나 삭제되었습니다.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block text-[0.9375rem] underline underline-offset-4 hover:text-accent"
      >
        홈으로 돌아가기
      </Link>
    </main>
  );
}
