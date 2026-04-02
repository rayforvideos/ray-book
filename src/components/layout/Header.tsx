"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const accumulatedDelta = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const THRESHOLD = 12;

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const isMobile = window.innerWidth < 640;
        const delta = currentY - lastScrollY.current;

        if (isMobile && currentY > 60) {
          if (Math.sign(delta) === Math.sign(accumulatedDelta.current)) {
            accumulatedDelta.current += delta;
          } else {
            accumulatedDelta.current = delta;
          }

          if (accumulatedDelta.current > THRESHOLD) {
            setHidden(true);
          } else if (accumulatedDelta.current < -THRESHOLD) {
            setHidden(false);
          }
        } else {
          setHidden(false);
          accumulatedDelta.current = 0;
        }

        lastScrollY.current = currentY;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 bg-bg pt-8 pb-6"
      style={{
        transform: hidden ? "translateY(-100%)" : "translateY(0)",
        opacity: hidden ? 0 : 1,
        transition: hidden
          ? "transform 0.25s cubic-bezier(0.4, 0, 0.6, 1), opacity 0.15s ease"
          : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease 0.05s",
      }}
    >
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
