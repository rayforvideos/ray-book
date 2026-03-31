import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="border-b border-border dark:border-border-dark">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold">
          Ray Book
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/series"
            className="text-sm text-muted hover:text-text dark:text-muted-dark dark:hover:text-text-dark"
          >
            시리즈
          </Link>
          <Link
            href="/search"
            className="text-sm text-muted hover:text-text dark:text-muted-dark dark:hover:text-text-dark"
          >
            검색
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
