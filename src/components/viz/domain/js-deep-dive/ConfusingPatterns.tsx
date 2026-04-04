"use client";

import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TabKey = "object-create" | "clone" | "for-loops";

interface TabData {
  label: string;
  content: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Shared sub-components                                              */
/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
      {children}
    </span>
  );
}

function CodeBox({ children }: { children: string }) {
  return (
    <pre className="bg-surface border border-border p-3 font-mono text-[0.6875rem] leading-relaxed text-text overflow-x-auto whitespace-pre">
      {children}
    </pre>
  );
}

function PropRow({
  name,
  exists,
  value,
}: {
  name: string;
  exists: boolean;
  value?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 font-mono text-[0.625rem]">
      <span className="text-text font-semibold">{name}</span>
      {exists ? (
        <span className="text-emerald-700 dark:text-emerald-300">
          {value ?? "OK"}
        </span>
      ) : (
        <span className="text-red-700 dark:text-red-300">
          {value ?? "없음"}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 1: Object.create(null) vs {}                                   */
/* ------------------------------------------------------------------ */

function ObjectCreateTab() {
  return (
    <div className="space-y-4">
      <CodeBox>{`const dict = Object.create(null);
dict.key = "value";

const obj = {};
obj.key = "value";`}</CodeBox>

      <div className="flex gap-4 max-sm:flex-col">
        {/* Object.create(null) */}
        <div className="flex-1 min-w-0">
          <SectionLabel>Object.create(null)</SectionLabel>
          <div className="border border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/70 p-3 space-y-1.5">
            <div className="font-mono text-[0.625rem] font-semibold text-violet-800 dark:text-violet-200">
              dict
            </div>
            <PropRow name="key" exists={true} value={'"value"'} />
            <div className="mt-2 border-t border-violet-200 dark:border-violet-800 pt-2">
              <span className="text-[0.5625rem] text-muted">
                [[Prototype]]: null
              </span>
            </div>
            <PropRow name="toString" exists={false} />
            <PropRow name="hasOwnProperty" exists={false} />
            <PropRow name="valueOf" exists={false} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="inline-block border bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 text-[0.5625rem]">
              프로토타입 오염 없음
            </span>
            <span className="inline-block border bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 text-[0.5625rem]">
              순수 딕셔너리
            </span>
          </div>
        </div>

        {/* {} */}
        <div className="flex-1 min-w-0">
          <SectionLabel>{"{}"}</SectionLabel>
          <div className="border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-900/70 p-3 space-y-1.5">
            <div className="font-mono text-[0.625rem] font-semibold text-sky-800 dark:text-sky-200">
              obj
            </div>
            <PropRow name="key" exists={true} value={'"value"'} />
            <div className="mt-2 border-t border-sky-200 dark:border-sky-800 pt-2">
              <span className="text-[0.5625rem] text-muted">
                [[Prototype]]: Object.prototype
              </span>
            </div>
            <PropRow name="toString" exists={true} value="[Function]" />
            <PropRow name="hasOwnProperty" exists={true} value="[Function]" />
            <PropRow name="valueOf" exists={true} value="[Function]" />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="inline-block border bg-amber-100 dark:bg-amber-900/70 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800 px-1.5 py-0.5 text-[0.5625rem]">
              상속 메서드 포함
            </span>
            <span className="inline-block border bg-amber-100 dark:bg-amber-900/70 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800 px-1.5 py-0.5 text-[0.5625rem]">
              키 충돌 가능
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2: structuredClone vs JSON                                     */
/* ------------------------------------------------------------------ */

interface CloneResult {
  type: string;
  structuredClone: string;
  json: string;
  scOk: boolean;
  jsonOk: boolean;
}

const cloneResults: CloneResult[] = [
  { type: "Date", structuredClone: "Date 객체 유지", json: "문자열로 변환", scOk: true, jsonOk: false },
  { type: "RegExp", structuredClone: "RegExp 유지", json: "빈 객체 {}", scOk: true, jsonOk: false },
  { type: "Map / Set", structuredClone: "Map / Set 유지", json: "빈 객체 {}", scOk: true, jsonOk: false },
  { type: "undefined", structuredClone: "undefined 유지", json: "속성 제거됨", scOk: true, jsonOk: false },
  { type: "순환 참조", structuredClone: "순환 구조 복제", json: "TypeError 발생", scOk: true, jsonOk: false },
  { type: "함수", structuredClone: "DataCloneError", json: "속성 제거됨", scOk: false, jsonOk: false },
  { type: "Symbol 속성", structuredClone: "속성 제거됨", json: "속성 제거됨", scOk: false, jsonOk: false },
];

function CloneTab() {
  return (
    <div className="space-y-4">
      <CodeBox>{`const source = {
  date: new Date(),
  regex: /abc/g,
  map: new Map([["a", 1]]),
  undef: undefined,
  fn: () => {},
};
source.self = source; // 순환 참조

const a = structuredClone(source);
const b = JSON.parse(JSON.stringify(source)); // TypeError!`}</CodeBox>

      <div className="overflow-x-auto">
        <table className="w-full text-[0.6875rem]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-3 font-semibold text-text">타입</th>
              <th className="text-left py-2 px-3 font-semibold text-text">structuredClone</th>
              <th className="text-left py-2 pl-3 font-semibold text-text">JSON 왕복</th>
            </tr>
          </thead>
          <tbody>
            {cloneResults.map((row) => (
              <tr key={row.type} className="border-b border-border last:border-b-0">
                <td className="py-1.5 pr-3 font-mono font-semibold text-text">
                  {row.type}
                </td>
                <td className="py-1.5 px-3">
                  <span
                    className={`font-mono text-[0.625rem] ${
                      row.scOk
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-red-700 dark:text-red-300"
                    }`}
                  >
                    {row.structuredClone}
                  </span>
                </td>
                <td className="py-1.5 pl-3">
                  <span
                    className={`font-mono text-[0.625rem] ${
                      row.jsonOk
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-red-700 dark:text-red-300"
                    }`}
                  >
                    {row.json}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3: for...in vs for...of                                        */
/* ------------------------------------------------------------------ */

function ForLoopsTab() {
  return (
    <div className="space-y-4">
      <CodeBox>{`Object.prototype.inherited = "yes";
const arr = [10, 20, 30];
arr.custom = "hello";

for (const key in arr) {
  console.log(key);
}
// "0", "1", "2", "custom", "inherited"

for (const val of arr) {
  console.log(val);
}
// 10, 20, 30`}</CodeBox>

      <div className="flex gap-4 max-sm:flex-col">
        {/* for...in */}
        <div className="flex-1 min-w-0">
          <SectionLabel>for...in</SectionLabel>
          <div className="border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/70 p-3 space-y-1">
            <div className="font-mono text-[0.625rem] font-semibold text-amber-800 dark:text-amber-200 mb-2">
              열거 가능한 문자열 속성 (상속 포함)
            </div>
            {["0", "1", "2", "custom", "inherited"].map((key, i) => (
              <div key={key} className="flex items-center gap-2 font-mono text-[0.625rem]">
                <span className="text-amber-700 dark:text-amber-300 w-16">{key}</span>
                <span className="text-muted">
                  {i < 3
                    ? "own (인덱스)"
                    : i === 3
                      ? "own (추가 속성)"
                      : "상속 (prototype)"}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="inline-block border bg-amber-100 dark:bg-amber-900/70 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800 px-1.5 py-0.5 text-[0.5625rem]">
              키(문자열) 반복
            </span>
            <span className="inline-block border bg-amber-100 dark:bg-amber-900/70 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800 px-1.5 py-0.5 text-[0.5625rem]">
              상속 포함
            </span>
            <span className="inline-block border bg-amber-100 dark:bg-amber-900/70 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800 px-1.5 py-0.5 text-[0.5625rem]">
              Symbol 제외
            </span>
          </div>
        </div>

        {/* for...of */}
        <div className="flex-1 min-w-0">
          <SectionLabel>for...of</SectionLabel>
          <div className="border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/70 p-3 space-y-1">
            <div className="font-mono text-[0.625rem] font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
              이터러블의 값 ([Symbol.iterator])
            </div>
            {[
              { val: "10", note: "arr[0]" },
              { val: "20", note: "arr[1]" },
              { val: "30", note: "arr[2]" },
            ].map((item) => (
              <div key={item.val} className="flex items-center gap-2 font-mono text-[0.625rem]">
                <span className="text-emerald-700 dark:text-emerald-300 w-16">
                  {item.val}
                </span>
                <span className="text-muted">{item.note}</span>
              </div>
            ))}
            <div className="mt-2 border-t border-emerald-200 dark:border-emerald-800 pt-1.5">
              <span className="text-[0.5625rem] text-muted">
                custom, inherited는 나타나지 않음
              </span>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="inline-block border bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 text-[0.5625rem]">
              값 반복
            </span>
            <span className="inline-block border bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 text-[0.5625rem]">
              이터러블만
            </span>
            <span className="inline-block border bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 text-[0.5625rem]">
              일반 객체 불가
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab config                                                         */
/* ------------------------------------------------------------------ */

const tabKeys: TabKey[] = ["object-create", "clone", "for-loops"];

const tabs: Record<TabKey, TabData> = {
  "object-create": {
    label: "Object.create(null) vs {}",
    content: <ObjectCreateTab />,
  },
  clone: {
    label: "structuredClone vs JSON",
    content: <CloneTab />,
  },
  "for-loops": {
    label: "for...in vs for...of",
    content: <ForLoopsTab />,
  },
};

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function ConfusingPatterns() {
  const [active, setActive] = useState<TabKey>("object-create");

  return (
    <div className="my-8 border border-border p-5">
      {/* Tabs */}
      <div className="mb-4 flex border-b border-border overflow-x-auto">
        {tabKeys.map((key) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`shrink-0 px-4 py-2 text-[0.75rem] font-mono transition-colors border-b-2 -mb-px ${
              active === key
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            {tabs[key].label}
          </button>
        ))}
      </div>

      {tabs[active].content}
    </div>
  );
}
