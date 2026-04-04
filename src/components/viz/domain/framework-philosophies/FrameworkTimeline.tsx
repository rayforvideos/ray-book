"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ─── Data ─── */

interface Framework {
  year: number;
  name: string;
  tagline: string;
  description: string;
  dotClass: string;
  ringClass: string;
}

const frameworks: Framework[] = [
  {
    year: 2006,
    name: "jQuery",
    tagline: "Write less, do more",
    description:
      "DOM 조작을 간편하게 만들었지만, 앱이 커지면 상태와 UI의 동기화가 고통이 됩니다.",
    dotClass: "bg-stone-400",
    ringClass: "ring-stone-400",
  },
  {
    year: 2010,
    name: "Angular.js",
    tagline: "양방향 바인딩의 시작",
    description:
      "HTML을 확장하여 선언적 UI를 도입했습니다. 양방향 데이터 바인딩으로 상태-UI 동기화 문제를 풀었지만, dirty checking의 성능 한계가 있었습니다.",
    dotClass: "bg-rose-500 dark:bg-rose-400",
    ringClass: "ring-rose-500 dark:ring-rose-400",
  },
  {
    year: 2013,
    name: "React",
    tagline: "UI를 함수로 표현하라",
    description:
      "UI = f(state). 단방향 데이터 흐름과 Virtual DOM으로 예측 가능한 렌더링을 구현했습니다. '라이브러리'를 표방하며 뷰 레이어에만 집중합니다.",
    dotClass: "bg-sky-500 dark:bg-sky-400",
    ringClass: "ring-sky-500 dark:ring-sky-400",
  },
  {
    year: 2014,
    name: "Vue",
    tagline: "점진적으로 채택하라",
    description:
      "Angular의 템플릿 + React의 컴포넌트 모델을 결합했습니다. 진입 장벽을 낮추면서도 대규모 앱까지 확장 가능한 '점진적 프레임워크'를 지향합니다.",
    dotClass: "bg-emerald-500 dark:bg-emerald-400",
    ringClass: "ring-emerald-500 dark:ring-emerald-400",
  },
  {
    year: 2016,
    name: "Svelte",
    tagline: "런타임을 없애라",
    description:
      "프레임워크를 컴파일러로 재정의했습니다. 빌드 타임에 최적화된 순수 JS를 생성하여 런타임 오버헤드를 제거합니다.",
    dotClass: "bg-orange-500 dark:bg-orange-400",
    ringClass: "ring-orange-500 dark:ring-orange-400",
  },
];

/* ─── Timeline List ─── */

function TimelineList({ activeIndex }: { activeIndex: number }) {
  return (
    <ol className="space-y-3">
      {frameworks.map((fw, i) => {
        const isActive = i <= activeIndex;
        const isCurrent = i === activeIndex;
        return (
          <li
            key={fw.name}
            className={`flex items-center gap-3 transition-all duration-300 ${
              isActive ? "opacity-100" : "opacity-40"
            }`}
          >
            {/* Year */}
            <span className="w-10 shrink-0 font-mono text-[0.6875rem] text-muted text-right">
              {fw.year}
            </span>

            {/* Dot */}
            <span
              className={`h-4 w-4 shrink-0 rounded-full transition-all duration-300 ${fw.dotClass} ${
                isCurrent
                  ? `scale-125 ring-2 ring-offset-2 ring-offset-bg ${fw.ringClass}`
                  : ""
              }`}
            />

            {/* Name + Tagline */}
            <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="font-bold text-sm leading-snug">{fw.name}</span>
              <span className="italic text-[0.75rem] text-muted leading-snug">
                {fw.tagline}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* ─── Step Nodes ─── */

const stepNodes = frameworks.map((fw, idx) => (
  <div key={idx} className="space-y-4">
    {/* Header */}
    <div className="flex items-center justify-between">
      <span className="font-mono text-sm font-bold text-accent">
        {fw.year} — {fw.name}
      </span>
      <span className="text-[0.6875rem] text-muted">
        {idx + 1} / {frameworks.length}
      </span>
    </div>

    {/* Timeline list */}
    <TimelineList activeIndex={idx} />

    {/* Description */}
    <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
      {fw.description}
    </div>
  </div>
));

/* ─── Main Component ─── */

export function FrameworkTimeline() {
  return <StepPlayer steps={stepNodes} />;
}
