"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

interface PageElement {
  id: string;
  label: string;
  area: "skip" | "nav" | "main" | "form";
  type: string;
}

interface Step {
  focusedId: string;
  key: string;
  announcement: string;
  description: string;
}

const elements: PageElement[] = [
  { id: "skip", label: "Skip to content", area: "skip", type: "link" },
  { id: "nav-home", label: "Home", area: "nav", type: "link" },
  { id: "nav-about", label: "About", area: "nav", type: "link" },
  { id: "nav-blog", label: "Blog", area: "nav", type: "link" },
  { id: "main-link", label: "Read more", area: "main", type: "link" },
  { id: "input-name", label: "Name", area: "form", type: "input" },
  { id: "input-email", label: "Email", area: "form", type: "input" },
  { id: "btn-submit", label: "Submit", area: "form", type: "button" },
];

const steps: Step[] = [
  {
    focusedId: "skip",
    key: "Tab",
    announcement: "Skip Link에 포커스",
    description:
      "페이지에 처음 Tab을 누르면 Skip Link에 포커스됩니다. 보통 화면에 숨겨져 있다가 포커스를 받으면 나타납니다. Enter를 누르면 메인 콘텐츠로 바로 이동합니다.",
  },
  {
    focusedId: "nav-home",
    key: "Tab",
    announcement: "Navigation 영역으로 이동",
    description:
      "Tab을 계속 누르면 네비게이션의 링크들을 순서대로 탐색합니다. DOM 순서가 곧 Tab 순서입니다.",
  },
  {
    focusedId: "main-link",
    key: "Tab",
    announcement: "Main 영역의 첫 번째 인터랙티브 요소",
    description:
      "네비게이션을 지나면 메인 콘텐츠의 첫 번째 인터랙티브 요소에 포커스됩니다. 텍스트 단락은 건너뛰고 링크, 버튼 같은 요소만 포커스를 받습니다.",
  },
  {
    focusedId: "input-name",
    key: "Tab",
    announcement: "폼 필드 순차 탐색",
    description:
      "폼 영역에서는 input, select, button 등이 순서대로 포커스됩니다. label이 input과 연결되어 있으면 스크린 리더가 필드 이름을 읽어줍니다.",
  },
  {
    focusedId: "nav-blog",
    key: "Shift+Tab",
    announcement: "역순 이동",
    description:
      "Shift+Tab은 반대 방향으로 이동합니다. 폼에서 네비게이션까지 역순으로 돌아갈 수 있습니다. Tab 순서와 시각적 순서가 일치해야 사용자가 혼란스럽지 않습니다.",
  },
];

const areaLabels: Record<string, string> = {
  skip: "Skip Link",
  nav: "Navigation",
  main: "Main Content",
  form: "Form",
};

const areaBorders: Record<string, string> = {
  skip: "border-violet-200 dark:border-violet-800",
  nav: "border-sky-200 dark:border-sky-800",
  main: "border-stone-200 dark:border-stone-700",
  form: "border-amber-200 dark:border-amber-800",
};

const areaBgs: Record<string, string> = {
  skip: "bg-violet-50/50 dark:bg-violet-950/20",
  nav: "bg-sky-50/50 dark:bg-sky-950/20",
  main: "bg-stone-50/50 dark:bg-stone-800/20",
  form: "bg-amber-50/50 dark:bg-amber-950/20",
};

function PageLayout({ focusedId }: { focusedId: string }) {
  const areas = ["skip", "nav", "main", "form"] as const;

  return (
    <div className="space-y-2">
      {areas.map((area) => {
        const areaElements = elements.filter((el) => el.area === area);
        return (
          <div
            key={area}
            className={`border rounded p-2.5 ${areaBorders[area]} ${areaBgs[area]}`}
          >
            <span className="block text-[0.5625rem] uppercase tracking-wider text-muted mb-1.5">
              {areaLabels[area]}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {areaElements.map((el) => {
                const isFocused = el.id === focusedId;
                return (
                  <span
                    key={el.id}
                    className={`inline-flex items-center gap-1 px-2 py-1 text-[0.6875rem] font-mono rounded transition-all ${
                      isFocused
                        ? "ring-2 ring-accent bg-accent/10 text-accent font-semibold shadow-sm"
                        : "bg-white dark:bg-stone-900 border border-border text-muted"
                    }`}
                  >
                    <span className="text-[0.5625rem] opacity-60">
                      {el.type === "link" && "🔗"}
                      {el.type === "input" && "✏️"}
                      {el.type === "button" && "🔘"}
                    </span>
                    {el.label}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function KeyboardNavFlow() {
  const stepNodes = steps.map((step, idx) => (
    <div key={idx} className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 dark:bg-stone-800 rounded font-mono text-[0.6875rem] font-semibold text-text">
          <kbd className="text-accent">{step.key}</kbd>
        </span>
        <span className="text-[0.8125rem] text-muted">{step.announcement}</span>
      </div>
      <PageLayout focusedId={step.focusedId} />
      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
