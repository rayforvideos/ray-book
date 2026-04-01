"use client";

import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const values = [
  { label: "0", raw: 0 },
  { label: '""', raw: "" },
  { label: "false", raw: false },
  { label: "null", raw: null },
  { label: "undefined", raw: undefined },
  { label: "NaN", raw: NaN },
  { label: "[]", raw: "[]" },
  { label: "{}", raw: "{}" },
] as const;

type CellKey = `${number}-${number}`;

/* Pre-compute == and === results */
function computeResults() {
  const rawValues: unknown[] = [0, "", false, null, undefined, NaN, [], {}];

  const loose: Record<CellKey, boolean> = {};
  const strict: Record<CellKey, boolean> = {};

  for (let r = 0; r < rawValues.length; r++) {
    for (let c = 0; c < rawValues.length; c++) {
      const key: CellKey = `${r}-${c}`;
      loose[key] = rawValues[r] == rawValues[c];
      strict[key] = rawValues[r] === rawValues[c];
    }
  }
  /* eslint-enable eqeqeq, no-self-compare */

  return { loose, strict };
}

const { loose, strict } = computeResults();

/* ------------------------------------------------------------------ */
/*  Explanations                                                       */
/* ------------------------------------------------------------------ */

const explanations: Record<string, string> = {
  // == true cases
  'loose:0-1': '0 == "" → ToNumber("") = 0 → 0 == 0 → true',
  'loose:0-2': "0 == false → ToNumber(false) = 0 → 0 == 0 → true",
  'loose:1-2': 'false == "" → ToNumber(false) = 0, ToNumber("") = 0 → 0 == 0 → true',
  'loose:1-0': '"" == 0 → ToNumber("") = 0 → 0 == 0 → true',
  'loose:2-0': "false == 0 → ToNumber(false) = 0 → 0 == 0 → true",
  'loose:2-1': 'false == "" → ToNumber(false) = 0, ToNumber("") = 0 → true',
  'loose:3-4': "null == undefined → 명세에 의해 항상 true (특수 규칙)",
  'loose:4-3': "undefined == null → 명세에 의해 항상 true (특수 규칙)",
  // == false interesting cases
  'loose:0-3': "0 == null → null은 undefined와만 == true. 다른 값과는 모두 false",
  'loose:0-4': "0 == undefined → undefined는 null과만 == true",
  'loose:0-5': "0 == NaN → NaN은 어떤 값과도 == true가 되지 않습니다 (NaN 자신 포함)",
  'loose:5-5': "NaN == NaN → false! NaN은 자기 자신과도 같지 않은 유일한 값입니다",
  'loose:0-6': '0 == [] → ToPrimitive([]) = "" → ToNumber("") = 0 → 0 == 0 → true',
  'loose:6-0': '[] == 0 → ToPrimitive([]) = "" → ToNumber("") = 0 → true',
  'loose:1-6': '"" == [] → ToPrimitive([]) = "" → "" == "" → true',
  'loose:6-1': '[] == "" → ToPrimitive([]) = "" → "" == "" → true',
  'loose:2-6': 'false == [] → ToNumber(false) = 0, ToPrimitive([]) = "" → ToNumber("") = 0 → true',
  'loose:6-2': '[] == false → ToPrimitive([]) = "" → ToNumber("") = 0, ToNumber(false) = 0 → true',
  // === cases
  'strict:0-0': "0 === 0 → 같은 타입, 같은 값 → true",
  'strict:1-1': '"" === "" → 같은 타입, 같은 값 → true',
  'strict:2-2': "false === false → 같은 타입, 같은 값 → true",
  'strict:5-5': "NaN === NaN → false! ===에서도 NaN은 자기 자신과 같지 않습니다",
  'strict:0-1': '0 === "" → 타입이 다름 (number vs string) → 즉시 false',
  'strict:0-2': "0 === false → 타입이 다름 (number vs boolean) → 즉시 false",
  'strict:3-4': "null === undefined → 타입이 다름 → false (==와 다른 결과!)",
  'strict:6-6': "[] === [] → 참조가 다른 별개의 배열 객체 → false",
  'strict:7-7': "{} === {} → 참조가 다른 별개의 객체 → false",
};

function getExplanation(mode: "loose" | "strict", row: number, col: number): string {
  const key = `${mode}:${row}-${col}`;
  if (explanations[key]) return explanations[key];

  const a = values[row].label;
  const b = values[col].label;
  const op = mode === "loose" ? "==" : "===";
  const result = (mode === "loose" ? loose : strict)[`${row}-${col}`];
  return `${a} ${op} ${b} → ${result}`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function EqualityCompare() {
  const [mode, setMode] = useState<"loose" | "strict">("loose");
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(
    null
  );

  const results = mode === "loose" ? loose : strict;

  return (
    <div className="my-8 border border-border p-5">
      {/* Toggle */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => { setMode("loose"); setSelected(null); }}
          className={`rounded-sm px-3 py-1.5 text-[0.75rem] font-mono font-semibold transition-colors ${
            mode === "loose"
              ? "bg-accent text-white"
              : "bg-surface text-muted hover:text-text"
          }`}
        >
          == (loose)
        </button>
        <button
          onClick={() => { setMode("strict"); setSelected(null); }}
          className={`rounded-sm px-3 py-1.5 text-[0.75rem] font-mono font-semibold transition-colors ${
            mode === "strict"
              ? "bg-accent text-white"
              : "bg-surface text-muted hover:text-text"
          }`}
        >
          === (strict)
        </button>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="border-collapse text-[0.6875rem]">
          <thead>
            <tr>
              <th className="bg-surface text-text font-mono p-1.5 min-w-[3.5rem] border border-border">
                {mode === "loose" ? "==" : "==="}
              </th>
              {values.map((v, i) => (
                <th
                  key={i}
                  className="bg-surface text-text font-mono p-1.5 min-w-[3.5rem] border border-border"
                >
                  {v.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {values.map((rowVal, r) => (
              <tr key={r}>
                <td className="bg-surface text-text font-mono p-1.5 font-semibold border border-border">
                  {rowVal.label}
                </td>
                {values.map((_, c) => {
                  const key: CellKey = `${r}-${c}`;
                  const isEqual = results[key];
                  const isSelected =
                    selected?.row === r && selected?.col === c;

                  return (
                    <td
                      key={c}
                      onClick={() => setSelected({ row: r, col: c })}
                      className={`p-1.5 text-center cursor-pointer border border-border transition-colors ${
                        isEqual
                          ? "bg-emerald-50 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300"
                          : "bg-surface text-muted"
                      } ${isSelected ? "ring-2 ring-accent ring-inset" : ""}`}
                    >
                      <span className="font-semibold">
                        {isEqual ? "✓" : "✕"}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Explanation */}
      {selected && (
        <div className="mt-4 border-t border-border pt-3">
          <span className="text-[0.8125rem] leading-relaxed text-muted font-mono">
            {getExplanation(mode, selected.row, selected.col)}
          </span>
        </div>
      )}

      {!selected && (
        <div className="mt-4 border-t border-border pt-3">
          <span className="text-[0.8125rem] leading-relaxed text-muted">
            셀을 클릭하면 비교 과정을 확인할 수 있습니다.
          </span>
        </div>
      )}
    </div>
  );
}
