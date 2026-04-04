"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

interface Landmark {
  tag: string;
  role: string;
  children?: string[];
  highlight?: boolean;
}

interface Step {
  title: string;
  mode: string;
  landmarks: Landmark[];
  announcement: string;
  description: string;
}

const steps: Step[] = [
  {
    title: "랜드마크 탐색",
    mode: "Landmarks",
    landmarks: [
      { tag: "header", role: "banner", highlight: true },
      { tag: "nav", role: "navigation", highlight: true },
      { tag: "main", role: "main", highlight: true },
      { tag: "footer", role: "contentinfo", highlight: true },
    ],
    announcement: '"banner" → "navigation" → "main" → "contentinfo"',
    description:
      "스크린 리더는 랜드마크 단위로 페이지를 탐색할 수 있습니다. header는 banner, nav는 navigation, main은 main, footer는 contentinfo 역할을 자동으로 가집니다. 사용자는 단축키 하나로 원하는 영역에 바로 접근합니다.",
  },
  {
    title: "헤딩 탐색",
    mode: "Headings",
    landmarks: [
      { tag: "main", role: "main", children: ["h1: 페이지 제목", "h2: 첫 번째 섹션", "h2: 두 번째 섹션", "h3: 하위 섹션"], highlight: true },
    ],
    announcement: '"heading level 1, 페이지 제목" → "heading level 2, 첫 번째 섹션" → ...',
    description:
      "스크린 리더의 가장 일반적인 탐색 방법은 헤딩 레벨로 이동하는 것입니다. h1부터 h6까지의 계층 구조가 문서의 목차 역할을 합니다. 레벨을 건너뛰면 (h1 → h3) 사용자가 구조를 잘못 이해할 수 있습니다.",
  },
  {
    title: "요소 목록",
    mode: "Elements List",
    landmarks: [
      {
        tag: "page",
        role: "요소 목록 대화상자",
        children: [
          "링크: Home, About, Blog, Read more",
          "버튼: Submit, Toggle menu",
          "폼 컨트롤: Name, Email",
        ],
        highlight: true,
      },
    ],
    announcement: "Links: 4 items / Buttons: 2 items / Form controls: 2 items",
    description:
      "대부분의 스크린 리더는 페이지 내 모든 링크, 버튼, 폼 컨트롤을 목록으로 보여주는 기능이 있습니다. 요소의 이름(accessible name)이 명확해야 이 목록에서 원하는 항목을 찾을 수 있습니다.",
  },
  {
    title: "aria-live: 동적 알림",
    mode: "Live Region",
    landmarks: [
      { tag: "main", role: "main", children: ["...페이지 콘텐츠..."] },
      {
        tag: "div",
        role: 'status (aria-live="polite")',
        children: ['"저장되었습니다" ← 동적으로 추가됨'],
        highlight: true,
      },
    ],
    announcement: '"저장되었습니다"  (포커스 이동 없이 자동으로 읽힘)',
    description:
      'aria-live 영역의 내용이 변경되면 스크린 리더가 현재 읽고 있는 위치와 관계없이 변경 사항을 알려줍니다. "polite"는 현재 읽기가 끝난 후, "assertive"는 즉시 알려줍니다. 토스트 메시지, 저장 확인 등에 사용합니다.',
  },
  {
    title: "aria-expanded: 상태 전달",
    mode: "State",
    landmarks: [
      {
        tag: "button",
        role: "button",
        children: ['aria-expanded="true"', "FAQ 질문 1"],
        highlight: true,
      },
      {
        tag: "div",
        role: "region",
        children: ["FAQ 답변 내용이 여기에 표시됩니다..."],
        highlight: false,
      },
    ],
    announcement: '"FAQ 질문 1, button, expanded" → (답변 내용 읽힘)',
    description:
      "aria-expanded는 아코디언, 드롭다운 같은 토글 요소의 열림/닫힘 상태를 전달합니다. 스크린 리더는 \"expanded\" 또는 \"collapsed\"로 상태를 읽어주어 사용자가 현재 상태를 알 수 있습니다.",
  },
];

function LandmarkDiagram({ landmarks }: { landmarks: Landmark[] }) {
  return (
    <div className="space-y-1.5">
      {landmarks.map((lm, i) => (
        <div
          key={i}
          className={`border rounded p-2.5 transition-all ${
            lm.highlight
              ? "border-accent/50 bg-accent/5"
              : "border-border bg-stone-50 dark:bg-stone-800/30"
          }`}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[0.6875rem] font-semibold text-text">
              &lt;{lm.tag}&gt;
            </span>
            <span
              className={`font-mono text-[0.625rem] px-1.5 py-0.5 rounded ${
                lm.highlight
                  ? "bg-accent/10 text-accent"
                  : "bg-stone-100 dark:bg-stone-800 text-muted"
              }`}
            >
              role={lm.role}
            </span>
          </div>
          {lm.children && (
            <div className="mt-1.5 ml-3 space-y-0.5">
              {lm.children.map((child, j) => (
                <div
                  key={j}
                  className="text-[0.625rem] text-muted font-mono"
                >
                  {child}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function ScreenReaderFlow() {
  const stepNodes = steps.map((step, idx) => (
    <div key={idx} className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[0.625rem] font-mono font-semibold px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400">
          {step.mode}
        </span>
        <span className="text-[0.8125rem] font-medium text-text">
          {step.title}
        </span>
      </div>
      <LandmarkDiagram landmarks={step.landmarks} />
      <div className="border border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/20 rounded p-2.5">
        <span className="block text-[0.5625rem] uppercase tracking-wider text-muted mb-1">
          Screen Reader Announcement
        </span>
        <div className="font-mono text-[0.6875rem] text-violet-700 dark:text-violet-400 leading-relaxed">
          {step.announcement}
        </div>
      </div>
      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
