"use client";

import { useEffect, useRef, useState } from "react";

export function SearchWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    async function loadPagefind() {
      try {
        // @ts-expect-error — Pagefind is loaded from static assets at runtime
        const pagefind = await import(/* webpackIgnore: true */ "/pagefind/pagefind.js");
        await pagefind.init();

        if (containerRef.current) {
          // @ts-expect-error — Pagefind UI loaded dynamically
          const PagefindUI = await import(/* webpackIgnore: true */ "/pagefind/pagefind-ui.js");
          new PagefindUI.PagefindUI({
            element: containerRef.current,
            showSubResults: true,
          });
        }
      } catch {
        // Pagefind not available in dev mode — expected
        setUnavailable(true);
      }
    }

    loadPagefind();
  }, []);

  return (
    <>
      <link href="/pagefind/pagefind-ui.css" rel="stylesheet" />
      {unavailable ? (
        <p className="text-muted">검색은 프로덕션 빌드에서만 사용할 수 있습니다.</p>
      ) : (
        <div ref={containerRef} />
      )}
    </>
  );
}
