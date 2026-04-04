"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ─── Types ─── */

type BarHighlight = "comparing" | "swapping" | "sorted" | "pivot" | "partition" | "merging";

interface Bar {
  value: number;
  highlight?: BarHighlight;
}

interface Step {
  bars: Bar[];
  description: string;
  label?: string;
  comparisons: number;
}

/* ─── Styles ─── */

const highlightStyles: Record<BarHighlight, { bg: string; border: string }> = {
  comparing: {
    bg: "bg-sky-400 dark:bg-sky-500",
    border: "border-sky-500 dark:border-sky-400",
  },
  swapping: {
    bg: "bg-rose-400 dark:bg-rose-500",
    border: "border-rose-500 dark:border-rose-400",
  },
  sorted: {
    bg: "bg-emerald-400 dark:bg-emerald-500",
    border: "border-emerald-500 dark:border-emerald-400",
  },
  pivot: {
    bg: "bg-amber-400 dark:bg-amber-500",
    border: "border-amber-500 dark:border-amber-400",
  },
  partition: {
    bg: "bg-violet-400 dark:bg-violet-500",
    border: "border-violet-500 dark:border-violet-400",
  },
  merging: {
    bg: "bg-teal-400 dark:bg-teal-500",
    border: "border-teal-500 dark:border-teal-400",
  },
};

const defaultBar = {
  bg: "bg-muted/30",
  border: "border-border",
};

/* ─── Bar chart renderer ─── */

function BarChart({ bars }: { bars: Bar[] }) {
  const maxVal = Math.max(...bars.map((b) => b.value));

  return (
    <div
      className="flex items-end justify-center gap-1.5"
      style={{ height: 160 }}
      role="img"
      aria-label="정렬 배열 시각화"
    >
      {bars.map((bar, i) => {
        const style = bar.highlight ? highlightStyles[bar.highlight] : defaultBar;
        const heightPercent = (bar.value / maxVal) * 100;

        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={`w-7 rounded-sm border ${style.border} ${style.bg} transition-all duration-200`}
              style={{ height: `${heightPercent * 1.4}px`, minHeight: 8 }}
            />
            <span className="font-mono text-xs font-bold text-muted">
              {bar.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Legend ─── */

function Legend({ preset }: { preset: string }) {
  const commonItems = [
    { color: "bg-sky-400 dark:bg-sky-500", label: "비교 중" },
    { color: "bg-rose-400 dark:bg-rose-500", label: "교환" },
    { color: "bg-emerald-400 dark:bg-emerald-500", label: "정렬 완료" },
  ];

  const extraItems: Record<string, { color: string; label: string }[]> = {
    bubble: [],
    merge: [
      { color: "bg-teal-400 dark:bg-teal-500", label: "병합 중" },
    ],
    quick: [
      { color: "bg-amber-400 dark:bg-amber-500", label: "피벗" },
      { color: "bg-violet-400 dark:bg-violet-500", label: "분할 영역" },
    ],
  };

  const items = [...commonItems, ...(extraItems[preset] ?? [])];

  return (
    <div className="flex flex-wrap gap-3 text-[0.6875rem] text-muted">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${it.color}`} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

/* ─── Helper: create bars from array ─── */

function makeBars(arr: number[], highlights?: Record<number, BarHighlight>): Bar[] {
  return arr.map((value, i) => ({
    value,
    highlight: highlights?.[i],
  }));
}

/* ─── Bubble Sort Steps ─── */

const bubbleSteps: Step[] = (() => {
  const arr = [5, 3, 8, 1, 7, 2, 6, 4];
  const steps: Step[] = [];
  const a = [...arr];
  let comparisons = 0;

  steps.push({
    bars: makeBars(a),
    description:
      "8개의 숫자를 버블 정렬합니다. 인접한 두 원소를 비교하여 순서가 잘못되었으면 교환합니다. 배열 끝에서부터 큰 값이 확정됩니다.",
    label: "초기 상태",
    comparisons: 0,
  });

  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      comparisons++;
      const sorted: Record<number, BarHighlight> = {};
      for (let k = n - i; k < n; k++) sorted[k] = "sorted";

      // Show comparison
      steps.push({
        bars: makeBars([...a], { ...sorted, [j]: "comparing", [j + 1]: "comparing" }),
        description: `${a[j]}과 ${a[j + 1]}을 비교합니다.${a[j] > a[j + 1] ? ` ${a[j]} > ${a[j + 1]}이므로 교환합니다.` : " 이미 올바른 순서입니다."}`,
        label: `Pass ${i + 1} - 비교 ${j + 1}`,
        comparisons,
      });

      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({
          bars: makeBars([...a], { ...sorted, [j]: "swapping", [j + 1]: "swapping" }),
          description: `교환 완료. 큰 값이 오른쪽으로 이동합니다.`,
          label: `Pass ${i + 1} - 교환`,
          comparisons,
        });
      }
    }

    // Mark the newly sorted element
    const sorted: Record<number, BarHighlight> = {};
    for (let k = n - 1 - i; k < n; k++) sorted[k] = "sorted";
    steps.push({
      bars: makeBars([...a], sorted),
      description: `Pass ${i + 1} 완료. ${a[n - 1 - i]}이 제 위치에 확정되었습니다. 가장 큰 미정렬 원소가 거품처럼 올라갑니다.`,
      label: `Pass ${i + 1} 완료`,
      comparisons,
    });

    // Early termination check - skip for brevity after pass 3
    if (i >= 2) {
      // Show condensed remaining
      break;
    }
  }

  // Show final sorted state
  const allSorted: Record<number, BarHighlight> = {};
  const finalArr = [...arr].sort((x, y) => x - y);
  for (let k = 0; k < finalArr.length; k++) allSorted[k] = "sorted";
  steps.push({
    bars: makeBars(finalArr, allSorted),
    description: `버블 정렬 완료! 총 비교 횟수: 28회. n(n-1)/2 = 8(7)/2 = 28. 시간 복잡도 O(n\u00B2)을 직접 확인할 수 있습니다.`,
    label: "정렬 완료",
    comparisons: 28,
  });

  return steps;
})();

/* ─── Merge Sort Steps ─── */

const mergeSteps: Step[] = (() => {
  const arr = [5, 3, 8, 1, 7, 2, 6, 4];
  const steps: Step[] = [];

  steps.push({
    bars: makeBars(arr),
    description:
      "같은 배열을 병합 정렬합니다. 배열을 반으로 나눈 뒤, 각 부분을 정렬하고 병합합니다. 분할 정복 (Divide and Conquer) 전략입니다.",
    label: "초기 상태",
    comparisons: 0,
  });

  // Step: divide into halves
  const hl1: Record<number, BarHighlight> = { 0: "comparing", 1: "comparing", 2: "comparing", 3: "comparing" };
  const hl2: Record<number, BarHighlight> = { 4: "partition", 5: "partition", 6: "partition", 7: "partition" };
  steps.push({
    bars: makeBars(arr, { ...hl1, ...hl2 }),
    description: "[5,3,8,1]과 [7,2,6,4]로 분할합니다. 각 절반을 재귀적으로 다시 분할합니다.",
    label: "1단계: 분할",
    comparisons: 0,
  });

  // Step: divide further left: [5,3] [8,1]
  steps.push({
    bars: makeBars(arr, { 0: "comparing", 1: "comparing", 2: "partition", 3: "partition" }),
    description: "왼쪽 절반 [5,3,8,1]을 다시 [5,3]과 [8,1]로 분할합니다. 원소가 1~2개가 될 때까지 나눕니다.",
    label: "2단계: 왼쪽 분할",
    comparisons: 0,
  });

  // Step: merge [5,3] -> [3,5]
  steps.push({
    bars: makeBars([3, 5, 8, 1, 7, 2, 6, 4], { 0: "merging", 1: "merging" }),
    description: "[5,3]을 병합합니다. 3 < 5이므로 3이 먼저 옵니다. 결과: [3,5]. 비교 1회.",
    label: "3단계: [5,3] 병합",
    comparisons: 1,
  });

  // Step: merge [8,1] -> [1,8]
  steps.push({
    bars: makeBars([3, 5, 1, 8, 7, 2, 6, 4], { 2: "merging", 3: "merging" }),
    description: "[8,1]을 병합합니다. 1 < 8이므로 1이 먼저 옵니다. 결과: [1,8]. 비교 1회.",
    label: "4단계: [8,1] 병합",
    comparisons: 2,
  });

  // Step: merge [3,5] + [1,8] -> [1,3,5,8]
  steps.push({
    bars: makeBars([1, 3, 5, 8, 7, 2, 6, 4], { 0: "merging", 1: "merging", 2: "merging", 3: "merging" }),
    description:
      "[3,5]와 [1,8]을 병합합니다. 1 < 3 -> 1, 3 < 8 -> 3, 5 < 8 -> 5, 8. 결과: [1,3,5,8]. 비교 3회.",
    label: "5단계: 왼쪽 절반 병합",
    comparisons: 5,
  });

  // Step: right half divide and merge [7,2] -> [2,7]
  steps.push({
    bars: makeBars([1, 3, 5, 8, 2, 7, 6, 4], { 4: "merging", 5: "merging" }),
    description: "오른쪽 절반도 같은 과정을 거칩니다. [7,2] -> [2,7]. 비교 1회.",
    label: "6단계: [7,2] 병합",
    comparisons: 6,
  });

  // Step: [6,4] -> [4,6]
  steps.push({
    bars: makeBars([1, 3, 5, 8, 2, 7, 4, 6], { 6: "merging", 7: "merging" }),
    description: "[6,4] -> [4,6]. 비교 1회.",
    label: "7단계: [6,4] 병합",
    comparisons: 7,
  });

  // Step: merge [2,7] + [4,6] -> [2,4,6,7]
  steps.push({
    bars: makeBars([1, 3, 5, 8, 2, 4, 6, 7], { 4: "merging", 5: "merging", 6: "merging", 7: "merging" }),
    description:
      "[2,7]과 [4,6]을 병합합니다. 2 < 4 -> 2, 4 < 7 -> 4, 6 < 7 -> 6, 7. 결과: [2,4,6,7]. 비교 3회.",
    label: "8단계: 오른쪽 절반 병합",
    comparisons: 10,
  });

  // Step: final merge [1,3,5,8] + [2,4,6,7] -> [1,2,3,4,5,6,7,8]
  const allMerging: Record<number, BarHighlight> = {};
  for (let i = 0; i < 8; i++) allMerging[i] = "merging";
  steps.push({
    bars: makeBars([1, 2, 3, 4, 5, 6, 7, 8], allMerging),
    description:
      "최종 병합: [1,3,5,8]과 [2,4,6,7]을 합칩니다. 양쪽의 가장 작은 원소를 반복적으로 비교합니다. 비교 약 7회.",
    label: "9단계: 최종 병합",
    comparisons: 17,
  });

  // Final
  const allSorted: Record<number, BarHighlight> = {};
  for (let i = 0; i < 8; i++) allSorted[i] = "sorted";
  steps.push({
    bars: makeBars([1, 2, 3, 4, 5, 6, 7, 8], allSorted),
    description:
      "병합 정렬 완료! 총 비교 횟수: 약 17회. 버블 정렬의 28회보다 적습니다. 분할 단계 O(log n) x 병합 단계 O(n) = O(n log n).",
    label: "정렬 완료",
    comparisons: 17,
  });

  return steps;
})();

/* ─── Quick Sort Steps ─── */

const quickSteps: Step[] = (() => {
  const arr = [5, 3, 8, 1, 7, 2, 6, 4];
  const steps: Step[] = [];

  steps.push({
    bars: makeBars(arr),
    description:
      "같은 배열을 퀵 정렬합니다. 피벗을 선택하고, 피벗보다 작은 값은 왼쪽, 큰 값은 오른쪽으로 분할합니다.",
    label: "초기 상태",
    comparisons: 0,
  });

  // Step: pick pivot = 4 (last element)
  steps.push({
    bars: makeBars(arr, { 7: "pivot" }),
    description:
      "마지막 원소 4를 피벗으로 선택합니다. 피벗보다 작은 값은 왼쪽, 큰 값은 오른쪽으로 보냅니다.",
    label: "1단계: 피벗 선택 (4)",
    comparisons: 0,
  });

  // Step: partition around 4
  // Compare each element with pivot
  steps.push({
    bars: makeBars([5, 3, 8, 1, 7, 2, 6, 4], {
      0: "comparing", 1: "comparing", 2: "comparing", 3: "comparing",
      4: "comparing", 5: "comparing", 6: "comparing", 7: "pivot",
    }),
    description:
      "각 원소를 피벗 4와 비교합니다. 3, 1, 2는 4보다 작고, 5, 8, 7, 6은 4보다 큽니다. 비교 7회.",
    label: "1단계: 분할 비교",
    comparisons: 7,
  });

  // Step: after partition [3,1,2, 4, 5,8,7,6]
  steps.push({
    bars: makeBars([3, 1, 2, 4, 5, 8, 7, 6], {
      0: "partition", 1: "partition", 2: "partition",
      3: "sorted",
      4: "partition", 5: "partition", 6: "partition", 7: "partition",
    }),
    description:
      "분할 완료: [3,1,2] | 4 | [5,8,7,6]. 피벗 4는 최종 위치에 확정됩니다. 왼쪽은 모두 4보다 작고, 오른쪽은 모두 4보다 큽니다.",
    label: "1단계: 분할 완료",
    comparisons: 7,
  });

  // Step: recurse left [3,1,2], pivot = 2
  steps.push({
    bars: makeBars([3, 1, 2, 4, 5, 8, 7, 6], {
      0: "comparing", 1: "comparing", 2: "pivot", 3: "sorted",
    }),
    description:
      "왼쪽 부분 [3,1,2]을 재귀 처리합니다. 피벗 2를 선택합니다. 1은 2보다 작고, 3은 2보다 큽니다. 비교 2회.",
    label: "2단계: 왼쪽 분할 (피벗 2)",
    comparisons: 9,
  });

  // Step: after left partition [1, 2, 3, 4, ...]
  steps.push({
    bars: makeBars([1, 2, 3, 4, 5, 8, 7, 6], {
      0: "sorted", 1: "sorted", 2: "sorted", 3: "sorted",
    }),
    description:
      "[1] | 2 | [3]. 원소가 1개면 이미 정렬된 것입니다. 왼쪽 절반이 모두 확정되었습니다: [1,2,3,4].",
    label: "2단계: 왼쪽 완료",
    comparisons: 9,
  });

  // Step: recurse right [5,8,7,6], pivot = 6
  steps.push({
    bars: makeBars([1, 2, 3, 4, 5, 8, 7, 6], {
      0: "sorted", 1: "sorted", 2: "sorted", 3: "sorted",
      4: "comparing", 5: "comparing", 6: "comparing", 7: "pivot",
    }),
    description:
      "오른쪽 부분 [5,8,7,6]을 처리합니다. 피벗 6을 선택합니다. 5는 6보다 작고, 8과 7은 6보다 큽니다. 비교 3회.",
    label: "3단계: 오른쪽 분할 (피벗 6)",
    comparisons: 12,
  });

  // Step: after right partition [1,2,3,4, 5, 6, 8,7]
  steps.push({
    bars: makeBars([1, 2, 3, 4, 5, 6, 8, 7], {
      0: "sorted", 1: "sorted", 2: "sorted", 3: "sorted",
      4: "sorted", 5: "sorted",
      6: "comparing", 7: "comparing",
    }),
    description:
      "[5] | 6 | [8,7]. 5와 6이 확정됩니다. 남은 [8,7]을 처리합니다. 비교 1회.",
    label: "4단계: [8,7] 분할",
    comparisons: 13,
  });

  // Step: final sorted
  const allSorted: Record<number, BarHighlight> = {};
  for (let i = 0; i < 8; i++) allSorted[i] = "sorted";
  steps.push({
    bars: makeBars([1, 2, 3, 4, 5, 6, 7, 8], allSorted),
    description:
      "퀵 정렬 완료! 총 비교 횟수: 약 13회. 평균 O(n log n). 피벗 선택이 좋으면 균등 분할이 되어 효율적입니다. 최악의 경우 (이미 정렬된 배열에서 첫/마지막 원소를 피벗으로 선택)는 O(n\u00B2)입니다.",
    label: "정렬 완료",
    comparisons: 13,
  });

  return steps;
})();

/* ─── Presets ─── */

const presets: Record<string, Step[]> = {
  bubble: bubbleSteps,
  merge: mergeSteps,
  quick: quickSteps,
};

/* ─── Main component ─── */

interface SortingCompareProps {
  preset?: string;
}

export function SortingCompare({ preset = "bubble" }: SortingCompareProps) {
  const steps = presets[preset] ?? presets["bubble"];

  const stepNodes = steps.map((step, idx) => (
    <div key={idx} className="space-y-4">
      {step.label && (
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-bold text-accent">
            {step.label}
          </span>
          <span className="text-[0.6875rem] text-muted">
            {idx + 1} / {steps.length}
          </span>
        </div>
      )}

      <BarChart bars={step.bars} />

      <div className="flex items-center gap-2 text-sm">
        <span className="font-mono font-bold text-accent">비교 횟수:</span>
        <span className="font-mono text-muted">{step.comparisons}</span>
      </div>

      <Legend preset={preset} />

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
