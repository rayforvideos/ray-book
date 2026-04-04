"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

interface ArrayCell {
  value: string;
  highlight?: "access" | "insert" | "shift" | "delete";
}

interface LinkedNode {
  value: string;
  highlight?: "access" | "traverse" | "insert" | "delete" | "pointer";
}

interface Step {
  arrayState: ArrayCell[];
  linkedState: LinkedNode[];
  arrayLabel?: string;
  linkedLabel?: string;
  bigO?: { array: string; linked: string };
  description: string;
}

const highlightStyles: Record<string, string> = {
  access:
    "bg-sky-100 dark:bg-sky-900/50 border-sky-400 dark:border-sky-500 text-sky-800 dark:text-sky-200",
  insert:
    "bg-emerald-100 dark:bg-emerald-900/50 border-emerald-400 dark:border-emerald-500 text-emerald-800 dark:text-emerald-200",
  shift:
    "bg-amber-100 dark:bg-amber-900/50 border-amber-400 dark:border-amber-500 text-amber-800 dark:text-amber-200",
  delete:
    "bg-rose-100 dark:bg-rose-900/50 border-rose-400 dark:border-rose-500 text-rose-800 dark:text-rose-200",
  traverse:
    "bg-violet-100 dark:bg-violet-900/50 border-violet-400 dark:border-violet-500 text-violet-800 dark:text-violet-200",
  pointer:
    "bg-stone-100 dark:bg-stone-800/50 border-stone-400 dark:border-stone-500 text-stone-700 dark:text-stone-300",
};

const defaultStyle =
  "bg-surface border-border text-text";

const presets: Record<string, Step[]> = {
  basic: [
    // Step 0: Initial state
    {
      arrayState: [
        { value: "A" },
        { value: "B" },
        { value: "C" },
        { value: "D" },
        { value: "E" },
      ],
      linkedState: [
        { value: "A" },
        { value: "B" },
        { value: "C" },
        { value: "D" },
        { value: "E" },
      ],
      description:
        "초기 상태입니다. 배열은 연속된 메모리 블록에 값을 저장합니다. 링크드 리스트는 각 노드가 값과 다음 노드를 가리키는 포인터를 가집니다. 메모리 배치 방식이 성능 차이를 만듭니다.",
    },
    // Step 1: Index access
    {
      arrayState: [
        { value: "A" },
        { value: "B" },
        { value: "C", highlight: "access" },
        { value: "D" },
        { value: "E" },
      ],
      linkedState: [
        { value: "A", highlight: "traverse" },
        { value: "B", highlight: "traverse" },
        { value: "C", highlight: "access" },
        { value: "D" },
        { value: "E" },
      ],
      arrayLabel: "arr[2] -> O(1)",
      linkedLabel: "head -> next -> next -> O(n)",
      bigO: { array: "O(1)", linked: "O(n)" },
      description:
        "인덱스로 접근: 배열은 시작 주소 + (인덱스 x 크기)로 바로 접근합니다 (O(1)). 링크드 리스트는 head부터 포인터를 따라 순회해야 합니다 (O(n)). 보라색 노드가 순회 경로입니다.",
    },
    // Step 2: Insertion at middle
    {
      arrayState: [
        { value: "A" },
        { value: "B" },
        { value: "X", highlight: "insert" },
        { value: "C", highlight: "shift" },
        { value: "D", highlight: "shift" },
        { value: "E", highlight: "shift" },
      ],
      linkedState: [
        { value: "A" },
        { value: "B", highlight: "pointer" },
        { value: "X", highlight: "insert" },
        { value: "C" },
        { value: "D" },
        { value: "E" },
      ],
      arrayLabel: "삽입 후 뒤 요소 이동 -> O(n)",
      linkedLabel: "포인터 변경만 -> O(1)",
      bigO: { array: "O(n)", linked: "O(1)" },
      description:
        "중간 삽입: 배열은 X를 삽입하려면 C, D, E를 한 칸씩 뒤로 밀어야 합니다 (노란색, O(n)). 링크드 리스트는 B의 포인터만 X로 바꾸면 됩니다 (O(1)). 단, 삽입 위치를 찾는 데 O(n)이 걸릴 수 있습니다.",
    },
    // Step 3: Deletion at middle
    {
      arrayState: [
        { value: "A" },
        { value: "B" },
        { value: "C", highlight: "delete" },
        { value: "D", highlight: "shift" },
        { value: "E", highlight: "shift" },
      ],
      linkedState: [
        { value: "A" },
        { value: "B", highlight: "pointer" },
        { value: "C", highlight: "delete" },
        { value: "D" },
        { value: "E" },
      ],
      arrayLabel: "삭제 후 앞으로 이동 -> O(n)",
      linkedLabel: "포인터 우회 -> O(1)",
      bigO: { array: "O(n)", linked: "O(1)" },
      description:
        "중간 삭제: 배열은 C를 삭제하면 D, E를 앞으로 당겨야 합니다 (O(n)). 링크드 리스트는 B의 포인터를 D로 변경하면 C가 연결에서 제거됩니다 (O(1)). 빨간색이 삭제 대상, 노란색이 이동하는 요소입니다.",
    },
    // Step 4: Big-O Summary
    {
      arrayState: [
        { value: "A" },
        { value: "B" },
        { value: "C" },
        { value: "D" },
        { value: "E" },
      ],
      linkedState: [
        { value: "A" },
        { value: "B" },
        { value: "C" },
        { value: "D" },
        { value: "E" },
      ],
      description:
        "Big-O 비교 요약 -- 배열: 접근 O(1), 탐색 O(n), 삽입/삭제 O(n). 링크드 리스트: 접근 O(n), 탐색 O(n), 삽입/삭제 O(1) (위치를 알고 있을 때). 어느 쪽이 더 좋은 것이 아니라, 사용 패턴에 따라 선택합니다.",
    },
  ],
};

function ArrayViz({
  cells,
  label,
}: {
  cells: ArrayCell[];
  label?: string;
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
          배열 (Array)
        </span>
        {label && (
          <span className="font-mono text-[0.625rem] text-muted">
            {label}
          </span>
        )}
      </div>
      <div className="flex items-center gap-0 overflow-x-auto pb-1">
        {cells.map((cell, i) => {
          const style = cell.highlight
            ? highlightStyles[cell.highlight]
            : defaultStyle;
          return (
            <div key={i} className="flex flex-col items-center shrink-0">
              <div
                className={`w-11 h-11 flex items-center justify-center border font-mono text-sm font-bold ${style} ${i > 0 ? "border-l-0" : ""}`}
              >
                {cell.value}
              </div>
              <span className="text-[0.5625rem] text-muted mt-0.5 font-mono">
                [{i}]
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-1 text-[0.5625rem] text-muted font-mono">
        연속 메모리: 0x00, 0x04, 0x08, ...
      </div>
    </div>
  );
}

function LinkedListViz({
  nodes,
  label,
}: {
  nodes: LinkedNode[];
  label?: string;
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
          링크드 리스트 (Linked List)
        </span>
        {label && (
          <span className="font-mono text-[0.625rem] text-muted">
            {label}
          </span>
        )}
      </div>
      <div className="flex items-center gap-0 overflow-x-auto pb-1">
        <span className="text-[0.625rem] text-muted font-mono mr-1 shrink-0">
          head
        </span>
        <span className="text-muted mr-1 shrink-0">-&gt;</span>
        {nodes.map((node, i) => {
          const style = node.highlight
            ? highlightStyles[node.highlight]
            : defaultStyle;
          const isDeleted = node.highlight === "delete";
          return (
            <div key={i} className="flex items-center shrink-0">
              <div
                className={`relative flex items-center border rounded-sm px-2 h-11 font-mono text-sm font-bold ${style} ${isDeleted ? "opacity-50" : ""}`}
              >
                <span>{node.value}</span>
                <span className="ml-2 text-[0.5rem] text-muted border-l border-border pl-1.5">
                  next
                </span>
              </div>
              {i < nodes.length - 1 && (
                <span className="text-muted mx-0.5 text-xs shrink-0">
                  -&gt;
                </span>
              )}
              {i === nodes.length - 1 && (
                <span className="text-muted ml-1 text-[0.625rem] font-mono shrink-0">
                  null
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-1 text-[0.5625rem] text-muted font-mono">
        비연속 메모리: 0x3A, 0x7F, 0x12, ...
      </div>
    </div>
  );
}

function BigOBadge({ array, linked }: { array: string; linked: string }) {
  return (
    <div className="flex gap-3 text-[0.6875rem]">
      <span className="px-2 py-0.5 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-mono rounded-sm">
        배열: {array}
      </span>
      <span className="px-2 py-0.5 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-mono rounded-sm">
        리스트: {linked}
      </span>
    </div>
  );
}

interface ArrayVsLinkedListProps {
  preset?: string;
}

export function ArrayVsLinkedList({
  preset = "basic",
}: ArrayVsLinkedListProps) {
  const steps = presets[preset] ?? presets["basic"];

  const stepNodes = steps.map((step, idx) => (
    <div key={idx} className="space-y-4">
      <div className="flex flex-col gap-4">
        <ArrayViz cells={step.arrayState} label={step.arrayLabel} />
        <LinkedListViz nodes={step.linkedState} label={step.linkedLabel} />
      </div>

      {step.bigO && (
        <div className="flex justify-center">
          <BigOBadge array={step.bigO.array} linked={step.bigO.linked} />
        </div>
      )}

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
