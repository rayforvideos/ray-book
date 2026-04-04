"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

type ObserverType = "mutation" | "intersection";

interface IntersectionDiagramState {
  imagePosition: "below" | "entering" | "loaded";
}

interface ObserverStep {
  observer: ObserverType;
  domState: string;
  domDiagram?: IntersectionDiagramState;
  observerState: string;
  callbackQueue: string[];
  description: string;
}

const mutationSteps: ObserverStep[] = [
  {
    observer: "mutation",
    domState: '<ul>\n  <li>항목 1</li>\n  <li>항목 2</li>\n</ul>',
    observerState: "감시 중 (childList: true)",
    callbackQueue: [],
    description: "MutationObserver가 <ul>의 자식 변경을 감시합니다. observe(ul, { childList: true })로 등록.",
  },
  {
    observer: "mutation",
    domState: '<ul>\n  <li>항목 1</li>\n  <li>항목 2</li>\n  <li>항목 3</li>  ← NEW\n</ul>',
    observerState: "변경 감지!",
    callbackQueue: ["MutationRecord"],
    description: "ul.appendChild(li)로 자식이 추가됩니다. Observer가 변경을 감지하고 MutationRecord를 생성합니다.",
  },
  {
    observer: "mutation",
    domState: '<ul>\n  <li>항목 1</li>\n  <li>항목 2</li>\n  <li>항목 3</li>\n</ul>',
    observerState: "콜백 실행",
    callbackQueue: [],
    description: "현재 태스크가 끝나면 마이크로태스크 큐에서 콜백이 실행됩니다. (records) => { ... }에 MutationRecord 배열이 전달됩니다.",
  },
];

const intersectionSteps: ObserverStep[] = [
  {
    observer: "intersection",
    domState: "",
    domDiagram: { imagePosition: "below" },
    observerState: "감시 중 (threshold: 0)",
    callbackQueue: [],
    description: "IntersectionObserver가 이미지 요소를 감시합니다. 아직 뷰포트 밖에 있습니다.",
  },
  {
    observer: "intersection",
    domState: "",
    domDiagram: { imagePosition: "entering" },
    observerState: "교차 감지! (isIntersecting: true)",
    callbackQueue: ["IntersectionEntry"],
    description: "사용자가 스크롤하여 이미지가 뷰포트에 진입합니다. isIntersecting이 true로 바뀝니다.",
  },
  {
    observer: "intersection",
    domState: "",
    domDiagram: { imagePosition: "loaded" },
    observerState: "unobserve (감시 해제)",
    callbackQueue: [],
    description: "콜백에서 img.src를 설정하고 observer.unobserve(img)로 감시를 해제합니다. 레이지 로딩 완료.",
  },
];

const observerStyles: Record<ObserverType, { bg: string; text: string; border: string }> = {
  mutation: { bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-900 dark:text-violet-100", border: "border-violet-300 dark:border-violet-700" },
  intersection: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-900 dark:text-emerald-100", border: "border-emerald-300 dark:border-emerald-700" },
};

function IntersectionDiagram({ imagePosition }: IntersectionDiagramState) {
  const isInside = imagePosition === "entering" || imagePosition === "loaded";
  const isHighlighted = imagePosition === "entering";
  const isLoaded = imagePosition === "loaded";

  return (
    <div className="flex flex-col items-start gap-2 py-2">
      {/* Viewport box */}
      <div className="relative w-48 border-2 border-dashed border-emerald-400 dark:border-emerald-600 p-3">
        <span className="absolute -top-2.5 left-3 bg-surface px-1 text-[0.625rem] text-muted">
          뷰포트
        </span>
        <div className="min-h-[2.5rem] flex items-center justify-center">
          {isInside ? (
            <div
              className={`w-full border-2 px-3 py-2 text-center text-[0.6875rem] font-mono transition-colors ${
                isHighlighted
                  ? "border-emerald-500 bg-emerald-100 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-900/50 dark:text-emerald-200"
                  : isLoaded
                    ? "border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "border-border text-muted"
              }`}
            >
              {isLoaded ? "이미지 ✓" : "이미지"}
              {isHighlighted && (
                <span className="ml-2 text-[0.5625rem] text-emerald-600 dark:text-emerald-300">← 스크롤</span>
              )}
              {isLoaded && (
                <span className="ml-2 text-[0.5625rem] text-emerald-500 dark:text-emerald-400">로딩 완료</span>
              )}
            </div>
          ) : (
            <span className="text-[0.625rem] text-muted/40">(비어 있음)</span>
          )}
        </div>
      </div>

      {/* Image below viewport */}
      {!isInside && (
        <div className="ml-4 w-40 border border-dashed border-border px-3 py-2 text-center text-[0.6875rem] font-mono text-muted">
          이미지
          <span className="ml-2 text-[0.5625rem] text-muted/60">(아래에 있음)</span>
        </div>
      )}
    </div>
  );
}

interface ObserverPatternProps {
  type?: ObserverType;
}

export function ObserverPattern({ type = "mutation" }: ObserverPatternProps) {
  const data = type === "mutation" ? mutationSteps : intersectionSteps;
  const style = observerStyles[type];

  const stepNodes = data.map((step, idx) => (
    <div key={idx} className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 font-mono text-[0.6875rem] font-bold border ${style.bg} ${style.text} ${style.border}`}>
          {type === "mutation" ? "MutationObserver" : "IntersectionObserver"}
        </span>
        <span className="text-[0.6875rem] text-muted">{step.observerState}</span>
      </div>

      <div className="flex gap-3 max-sm:flex-col">
        <div className="flex-1 min-w-0">
          <span className="mb-1 block text-[0.6875rem] uppercase tracking-wider text-muted">DOM 상태</span>
          {step.domDiagram ? (
            <div className="bg-surface border border-border p-3">
              <IntersectionDiagram {...step.domDiagram} />
            </div>
          ) : (
            <pre className="bg-surface border border-border p-3 font-mono text-[0.625rem] leading-relaxed text-text overflow-x-auto whitespace-pre">
              {step.domState}
            </pre>
          )}
        </div>

        <div className="w-40 shrink-0 max-sm:w-full">
          <span className="mb-1 block text-[0.6875rem] uppercase tracking-wider text-muted">콜백 큐</span>
          <div className="min-h-[2rem] border border-border bg-surface p-1.5">
            {step.callbackQueue.length > 0 ? (
              step.callbackQueue.map((item, i) => (
                <span key={i} className={`block px-1.5 py-0.5 font-mono text-[0.5625rem] ${style.bg} ${style.text}`}>
                  {item}
                </span>
              ))
            ) : (
              <span className="text-[0.5625rem] text-muted/30">empty</span>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
