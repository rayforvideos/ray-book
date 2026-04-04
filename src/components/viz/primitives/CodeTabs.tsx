"use client";

import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

interface Tab {
  label: string;
  lang: string;
  code: string;
}

interface CodeTabsProps {
  tabs: Tab[];
}

const STORAGE_KEY = "ray-book-code-tab";

const FRAMEWORK_COLORS: Record<string, string> = {
  React: "sky",
  Vue: "emerald",
  Angular: "rose",
  Svelte: "orange",
};

const INDICATOR_CLASSES: Record<string, string> = {
  React: "bg-sky-500",
  Vue: "bg-emerald-500",
  Angular: "bg-rose-500",
  Svelte: "bg-orange-500",
};

const TEXT_CLASSES: Record<string, string> = {
  React: "text-sky-600 dark:text-sky-400",
  Vue: "text-emerald-600 dark:text-emerald-400",
  Angular: "text-rose-600 dark:text-rose-400",
  Svelte: "text-orange-600 dark:text-orange-400",
};

function getDefaultTab(tabs: Tab[]): string {
  if (typeof window === "undefined") return tabs[0]?.label ?? "";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && tabs.some((t) => t.label === stored)) return stored;
  return tabs[0]?.label ?? "";
}

export function CodeTabs({ tabs }: CodeTabsProps) {
  const [activeLabel, setActiveLabel] = useState<string>(
    () => tabs[0]?.label ?? ""
  );
  const [htmlCache, setHtmlCache] = useState<Record<string, string>>({});

  // Restore from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && tabs.some((t) => t.label === stored)) {
      setActiveLabel(stored);
    }
  }, [tabs]);

  // Highlight active tab lazily
  useEffect(() => {
    if (!activeLabel) return;
    if (htmlCache[activeLabel]) return;

    const tab = tabs.find((t) => t.label === activeLabel);
    if (!tab) return;

    codeToHtml(tab.code, {
      lang: tab.lang,
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      defaultColor: false,
    }).then((html) => {
      setHtmlCache((prev) => ({ ...prev, [activeLabel]: html }));
    });
  }, [activeLabel, tabs, htmlCache]);

  function handleTabClick(label: string) {
    setActiveLabel(label);
    localStorage.setItem(STORAGE_KEY, label);
  }

  const activeHtml = htmlCache[activeLabel] ?? "";

  return (
    <div className="my-8 border border-border rounded-md overflow-hidden">
      {/* Tab bar */}
      <div className="border-b border-border flex">
        {tabs.map((tab) => {
          const isActive = tab.label === activeLabel;
          const indicatorClass =
            INDICATOR_CLASSES[tab.label] ?? "bg-zinc-500";
          const textClass = TEXT_CLASSES[tab.label] ?? "text-zinc-600 dark:text-zinc-400";

          return (
            <button
              key={tab.label}
              onClick={() => handleTabClick(tab.label)}
              className={[
                "relative px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? textClass
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {tab.label}
              {isActive && (
                <span
                  className={[
                    "absolute bottom-0 left-0 right-0 h-0.5",
                    indicatorClass,
                  ].join(" ")}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Code area */}
      <div
        className="overflow-x-auto text-[0.8125rem] [&_pre]:p-5 [&_pre]:leading-relaxed"
        style={{ minHeight: "120px" }}
      >
        {activeHtml ? (
          <div dangerouslySetInnerHTML={{ __html: activeHtml }} />
        ) : (
          <pre className="p-5 leading-relaxed text-muted-foreground">
            {tabs.find((t) => t.label === activeLabel)?.code ?? ""}
          </pre>
        )}
      </div>
    </div>
  );
}
