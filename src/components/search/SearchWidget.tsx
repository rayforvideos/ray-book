"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    PagefindUI: new (options: Record<string, unknown>) => unknown;
  }
}

export function SearchWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">(
    "loading"
  );

  useEffect(() => {
    // Load pagefind-ui.js via script tag to bypass bundler
    const script = document.createElement("script");
    script.src = "/pagefind/pagefind-ui.js";
    script.onload = () => {
      if (containerRef.current && window.PagefindUI) {
        new window.PagefindUI({
          element: containerRef.current,
          showSubResults: true,
          showImages: false,
        });
        setStatus("ready");
      }
    };
    script.onerror = () => {
      setStatus("unavailable");
    };
    document.head.appendChild(script);

    // Load CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/pagefind/pagefind-ui.css";
    document.head.appendChild(link);

    return () => {
      script.remove();
      link.remove();
    };
  }, []);

  if (status === "unavailable") {
    return (
      <p className="text-muted">
        검색은 프로덕션 빌드에서만 사용할 수 있습니다.
      </p>
    );
  }

  return <div ref={containerRef} />;
}
