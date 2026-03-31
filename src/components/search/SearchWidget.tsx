"use client";

import { useEffect, useRef, useState } from "react";

export function SearchWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    async function loadPagefind() {
      try {
        const pagefindUI = await import(
          // @ts-expect-error — Pagefind UI loaded from static assets
          /* webpackIgnore: true */ "/pagefind/pagefind-ui.js"
        );

        if (containerRef.current) {
          new pagefindUI.PagefindUI({
            element: containerRef.current,
            showSubResults: true,
            showImages: false,
          });
        }
      } catch {
        setUnavailable(true);
      }
    }

    loadPagefind();
  }, []);

  if (unavailable) {
    return (
      <p className="text-muted">
        검색은 프로덕션 빌드에서만 사용할 수 있습니다.
      </p>
    );
  }

  return (
    <>
      <link href="/pagefind/pagefind-ui.css" rel="stylesheet" />
      <div ref={containerRef} />
    </>
  );
}
