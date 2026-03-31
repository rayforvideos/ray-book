import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="pt-8 pb-6">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-serif text-lg tracking-tight text-text"
        >
          Ray Book
        </Link>
        <nav aria-label="메인 내비게이션" className="flex items-center gap-5">
          <Link
            href="/series"
            className="text-[0.8125rem] text-muted hover:text-text"
          >
            시리즈
          </Link>
          <Link
            href="/search"
            className="text-[0.8125rem] text-muted hover:text-text"
          >
            검색
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
