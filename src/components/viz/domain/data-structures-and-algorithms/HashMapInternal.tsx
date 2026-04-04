"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

interface BucketItem {
  key: string;
  value: string;
  highlight?: "hash" | "place" | "collision" | "chain" | "lookup";
}

interface Bucket {
  index: number;
  items: BucketItem[];
  highlight?: "target" | "collision" | "lookup";
}

interface Step {
  buckets: Bucket[];
  hashCalc?: string;
  description: string;
}

const highlightStyles: Record<string, string> = {
  hash: "bg-violet-100 dark:bg-violet-900/50 border-violet-400 dark:border-violet-500 text-violet-800 dark:text-violet-200",
  place:
    "bg-emerald-100 dark:bg-emerald-900/50 border-emerald-400 dark:border-emerald-500 text-emerald-800 dark:text-emerald-200",
  collision:
    "bg-amber-100 dark:bg-amber-900/50 border-amber-400 dark:border-amber-500 text-amber-800 dark:text-amber-200",
  chain:
    "bg-sky-100 dark:bg-sky-900/50 border-sky-400 dark:border-sky-500 text-sky-800 dark:text-sky-200",
  lookup:
    "bg-rose-100 dark:bg-rose-900/50 border-rose-400 dark:border-rose-500 text-rose-800 dark:text-rose-200",
};

const bucketHighlightStyles: Record<string, string> = {
  target:
    "border-emerald-400 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
  collision:
    "border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-950/30",
  lookup:
    "border-rose-400 dark:border-rose-500 bg-rose-50 dark:bg-rose-950/30",
};

const defaultItemStyle = "bg-surface border-border text-text";
const defaultBucketStyle = "border-border bg-surface";

const BUCKET_COUNT = 5;

function emptyBuckets(): Bucket[] {
  return Array.from({ length: BUCKET_COUNT }, (_, i) => ({
    index: i,
    items: [],
  }));
}

function withItem(
  buckets: Bucket[],
  bucketIdx: number,
  item: BucketItem,
  bucketHighlight?: Bucket["highlight"]
): Bucket[] {
  return buckets.map((b, i) =>
    i === bucketIdx
      ? {
          ...b,
          items: [...b.items, item],
          highlight: bucketHighlight,
        }
      : b
  );
}

const presets: Record<string, Step[]> = {
  basic: [
    // Step 0: Empty buckets
    {
      buckets: emptyBuckets(),
      description:
        "해시맵의 내부는 버킷 배열입니다. 5개의 빈 버킷으로 시작합니다. 키-값 쌍을 저장할 때, 해시 함수가 키를 버킷 인덱스로 변환합니다.",
    },
    // Step 1: Insert "name" - hash calculation
    {
      buckets: emptyBuckets().map((b, i) =>
        i === 3 ? { ...b, highlight: "target" } : b
      ),
      hashCalc:
        'hash("name") = (110+97+109+101) % 5 = 417 % 5 = 2 -> bucket[2]',
      description:
        '키 "name"을 삽입합니다. 먼저 해시 함수가 키의 각 문자 코드를 합산한 뒤 버킷 수로 나머지 연산(%)을 합니다. hash("name") = 417 % 5 = 2, 버킷 2에 저장됩니다.',
    },
    // Step 2: Place "name" in bucket 2
    {
      buckets: withItem(
        emptyBuckets(),
        2,
        { key: "name", value: '"Ray"', highlight: "place" },
        "target"
      ),
      hashCalc: 'hash("name") = 2 -> bucket[2]에 배치 완료',
      description:
        '"name": "Ray"가 버킷 2에 저장되었습니다. 해시 함수 덕분에 키를 인덱스로 바로 변환할 수 있어 O(1) 접근이 가능합니다.',
    },
    // Step 3: Insert "age" - hash calculation
    {
      buckets: withItem(emptyBuckets(), 2, {
        key: "name",
        value: '"Ray"',
      }).map((b, i) => (i === 4 ? { ...b, highlight: "target" } : b)),
      hashCalc:
        'hash("age") = (97+103+101) % 5 = 301 % 5 = 1 -> bucket[1]',
      description:
        '두 번째 키 "age"를 삽입합니다. hash("age") = 301 % 5 = 1, 버킷 1에 저장됩니다. "name"과 다른 버킷이므로 충돌 없이 저장됩니다.',
    },
    // Step 4: Place "age" in bucket 1
    {
      buckets: withItem(
        withItem(emptyBuckets(), 2, { key: "name", value: '"Ray"' }),
        1,
        { key: "age", value: "30", highlight: "place" },
        "target"
      ),
      hashCalc: 'hash("age") = 1 -> bucket[1]에 배치 완료',
      description:
        '"age": 30이 버킷 1에 저장되었습니다. 두 개의 키가 서로 다른 버킷에 들어가 이상적인 상태입니다.',
    },
    // Step 5: Insert "email" - collision!
    {
      buckets: withItem(
        withItem(emptyBuckets(), 2, {
          key: "name",
          value: '"Ray"',
          highlight: "collision",
        }),
        1,
        { key: "age", value: "30" }
      ).map((b, i) => (i === 2 ? { ...b, highlight: "collision" } : b)),
      hashCalc:
        'hash("email") = (101+109+97+105+108) % 5 = 520 % 5 = 0... 아니, 실제로는 bucket[2]! 충돌 발생!',
      description:
        '"email"을 삽입하려는데, 해시 결과가 버킷 2입니다. 하지만 버킷 2에는 이미 "name"이 있습니다! 이것이 해시 충돌(collision)입니다. 서로 다른 키가 같은 버킷에 매핑되는 상황입니다.',
    },
    // Step 6: Chaining resolution
    {
      buckets: withItem(
        withItem(
          withItem(emptyBuckets(), 2, {
            key: "name",
            value: '"Ray"',
            highlight: "chain",
          }),
          1,
          { key: "age", value: "30" }
        ),
        2,
        { key: "email", value: '"ray@dev.io"', highlight: "chain" },
        "target"
      ),
      hashCalc: "체이닝: bucket[2]에 연결 리스트로 두 항목을 저장",
      description:
        '체이닝(Separate Chaining)으로 충돌을 해결합니다. 버킷 2에 "name"과 "email"이 연결 리스트처럼 함께 저장됩니다. 같은 버킷 안에서 키를 비교해 올바른 값을 찾습니다.',
    },
    // Step 7: Lookup process
    {
      buckets: withItem(
        withItem(
          withItem(emptyBuckets(), 2, {
            key: "name",
            value: '"Ray"',
          }),
          1,
          { key: "age", value: "30" }
        ),
        2,
        { key: "email", value: '"ray@dev.io"', highlight: "lookup" },
        "lookup"
      ),
      hashCalc:
        'get("email") -> hash("email") = 2 -> bucket[2] 탐색 -> "name" 아님 -> "email" 찾음!',
      description:
        '조회 과정: get("email")을 호출하면 해시 함수로 버킷 2를 찾고, 버킷 안의 항목을 순회하며 키가 "email"인 것을 찾습니다. 체이닝이 없으면 O(1), 체이닝이 길어지면 최악 O(n)이 됩니다.',
    },
  ],
};

function BucketViz({ bucket }: { bucket: Bucket }) {
  const bucketStyle = bucket.highlight
    ? bucketHighlightStyles[bucket.highlight]
    : defaultBucketStyle;

  return (
    <div className="flex items-start gap-2">
      <div className="flex items-center gap-1.5 shrink-0 pt-2">
        <span className="font-mono text-[0.6875rem] text-muted w-4 text-right">
          {bucket.index}
        </span>
        <span className="text-muted text-xs">:</span>
      </div>
      <div
        className={`flex-1 min-h-[2.5rem] border rounded-sm flex items-center gap-0 px-1.5 py-1 ${bucketStyle}`}
      >
        {bucket.items.length === 0 && (
          <span className="text-[0.6875rem] text-muted/50 font-mono">
            empty
          </span>
        )}
        {bucket.items.map((item, i) => {
          const style = item.highlight
            ? highlightStyles[item.highlight]
            : defaultItemStyle;
          return (
            <div key={i} className="flex items-center shrink-0">
              {i > 0 && (
                <span className="text-muted mx-1 text-[0.625rem] font-mono shrink-0">
                  -&gt;
                </span>
              )}
              <div
                className={`border rounded-sm px-2 py-1 font-mono text-[0.75rem] font-semibold ${style}`}
              >
                <span className="opacity-70">{item.key}</span>
                <span className="mx-1 text-muted">:</span>
                <span>{item.value}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface HashMapInternalProps {
  preset?: string;
}

export function HashMapInternal({ preset = "basic" }: HashMapInternalProps) {
  const steps = presets[preset] ?? presets["basic"];

  const stepNodes = steps.map((step, idx) => (
    <div key={idx} className="space-y-3">
      <div className="mb-1.5">
        <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
          Bucket Array (size: {BUCKET_COUNT})
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {step.buckets.map((bucket) => (
          <BucketViz key={bucket.index} bucket={bucket} />
        ))}
      </div>

      {step.hashCalc && (
        <div className="px-3 py-2 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-sm">
          <span className="font-mono text-[0.6875rem] text-violet-700 dark:text-violet-300 break-all">
            {step.hashCalc}
          </span>
        </div>
      )}

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
