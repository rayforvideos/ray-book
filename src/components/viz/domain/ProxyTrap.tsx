"use client";

import { StepPlayer } from "../primitives/StepPlayer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TrapState {
  name: string;
  active: boolean;
}

interface ProxyStep {
  code: string;
  activeLines: number[];
  target: Record<string, string>;
  traps: TrapState[];
  operation: string;
  result: string;
  description: string;
}

/* ------------------------------------------------------------------ */
/*  Presets                                                            */
/* ------------------------------------------------------------------ */

const presets: Record<string, { code: string; steps: ProxyStep[] }> = {
  "get-set": {
    code: [
      `const handler = {`,
      `  get(target, prop, receiver) {`,
      `    console.log(\`GET \${prop}\`);`,
      `    return Reflect.get(target, prop, receiver);`,
      `  },`,
      `  set(target, prop, value, receiver) {`,
      `    console.log(\`SET \${prop} = \${value}\`);`,
      `    return Reflect.set(target, prop, value, receiver);`,
      `  },`,
      `};`,
      ``,
      `const target = { name: "Ray", age: 25 };`,
      `const proxy = new Proxy(target, handler);`,
      ``,
      `proxy.name;       // GET name → "Ray"`,
      `proxy.age = 26;   // SET age = 26 → true`,
      `proxy.job = "dev"; // SET job = dev → true`,
    ].join("\n"),

    steps: [
      {
        code: "const target = { name: \"Ray\", age: 25 }",
        activeLines: [11, 12],
        target: { name: '"Ray"', age: "25" },
        traps: [
          { name: "get", active: false },
          { name: "set", active: false },
        ],
        operation: "Proxy 생성",
        result: "target과 handler가 연결됨",
        description:
          "target 객체와 handler를 전달해 Proxy를 생성합니다. " +
          "handler의 메서드(trap)가 target에 대한 작업을 가로챕니다.",
      },
      {
        code: "proxy.name",
        activeLines: [1, 2, 3, 14],
        target: { name: '"Ray"', age: "25" },
        traps: [
          { name: "get", active: true },
          { name: "set", active: false },
        ],
        operation: 'GET "name"',
        result: '"Ray"',
        description:
          "proxy.name에 접근하면 handler.get() 트랩이 호출됩니다. " +
          "Reflect.get()으로 원래 동작을 수행하면서, 접근 로그를 남길 수 있습니다.",
      },
      {
        code: "proxy.age = 26",
        activeLines: [5, 6, 7, 15],
        target: { name: '"Ray"', age: "26" },
        traps: [
          { name: "get", active: false },
          { name: "set", active: true },
        ],
        operation: 'SET "age" = 26',
        result: "true (성공)",
        description:
          "proxy.age = 26은 handler.set() 트랩을 호출합니다. " +
          "Reflect.set()으로 실제 할당을 수행합니다. target의 age가 26으로 변경됩니다.",
      },
      {
        code: 'proxy.job = "dev"',
        activeLines: [5, 6, 7, 16],
        target: { name: '"Ray"', age: "26", job: '"dev"' },
        traps: [
          { name: "get", active: false },
          { name: "set", active: true },
        ],
        operation: 'SET "job" = "dev"',
        result: "true (새 속성 추가)",
        description:
          "존재하지 않는 속성을 할당해도 set 트랩이 동일하게 동작합니다. " +
          "target에 새 속성 job이 추가됩니다.",
      },
    ],
  },

  validation: {
    code: [
      `const handler = {`,
      `  set(target, prop, value) {`,
      `    if (prop === "age") {`,
      `      if (typeof value !== "number" || value < 0) {`,
      `        throw new TypeError("age must be a non-negative number");`,
      `      }`,
      `    }`,
      `    return Reflect.set(target, prop, value);`,
      `  },`,
      `};`,
      ``,
      `const person = new Proxy({ age: 25 }, handler);`,
      ``,
      `person.age = 30;  // OK`,
      `person.age = -1;  // TypeError!`,
      `person.name = "A"; // OK (age 아님)`,
    ].join("\n"),

    steps: [
      {
        code: "new Proxy({ age: 25 }, handler)",
        activeLines: [11],
        target: { age: "25" },
        traps: [{ name: "set", active: false }],
        operation: "Proxy 생성",
        result: "유효성 검사 Proxy 생성됨",
        description:
          "set 트랩에서 age 속성에 대한 유효성 검사를 수행하는 Proxy를 생성합니다.",
      },
      {
        code: "person.age = 30",
        activeLines: [1, 2, 3, 7, 13],
        target: { age: "30" },
        traps: [{ name: "set", active: true }],
        operation: 'SET "age" = 30',
        result: "true (유효성 통과)",
        description:
          "age에 30을 할당합니다. typeof 30은 'number'이고 30 >= 0이므로 " +
          "유효성 검사를 통과하고 Reflect.set()으로 실제 할당이 수행됩니다.",
      },
      {
        code: "person.age = -1",
        activeLines: [1, 2, 3, 4],
        target: { age: "30" },
        traps: [{ name: "set", active: true }],
        operation: 'SET "age" = -1',
        result: "TypeError 발생!",
        description:
          "age에 -1을 할당하려 합니다. -1 < 0이므로 유효성 검사에 실패하고 " +
          "TypeError가 발생합니다. target의 age는 30으로 유지됩니다.",
      },
      {
        code: 'person.name = "A"',
        activeLines: [1, 2, 7, 15],
        target: { age: "30", name: '"A"' },
        traps: [{ name: "set", active: true }],
        operation: 'SET "name" = "A"',
        result: "true (age가 아니므로 검사 생략)",
        description:
          "age가 아닌 속성은 유효성 검사를 건너뛰고 바로 할당됩니다. " +
          "이처럼 Proxy를 사용하면 객체에 투명한 검증 계층을 추가할 수 있습니다.",
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function CodePanel({
  lines,
  activeLines,
}: {
  lines: string[];
  activeLines: number[];
}) {
  return (
    <div className="flex-1 min-w-0">
      <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
        코드
      </span>
      <div className="rounded-sm bg-surface font-mono text-[0.6875rem] leading-relaxed overflow-x-auto">
        {lines.map((line, i) => {
          const isActive = activeLines.includes(i);
          return (
            <div
              key={i}
              className={`flex transition-colors duration-150 ${isActive ? "bg-accent/10" : ""}`}
            >
              <span
                className={`select-none w-8 shrink-0 text-right pr-3 ${isActive ? "text-accent" : "text-muted"}`}
              >
                {i + 1}
              </span>
              <span
                className={`flex-1 pr-3 py-px whitespace-pre ${isActive ? "text-text" : "text-muted"}`}
              >
                {line || "\u00A0"}
              </span>
              {isActive && (
                <span className="shrink-0 pr-2 text-accent text-[0.625rem] pt-px">
                  ◄
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TargetPanel({ target }: { target: Record<string, string> }) {
  return (
    <div>
      <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
        Target 객체
      </span>
      <div className="border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-900/70 p-2.5">
        {Object.entries(target).map(([key, val]) => (
          <div key={key} className="flex justify-between gap-3 font-mono text-[0.625rem]">
            <span className="text-sky-800 dark:text-sky-200 font-semibold">{key}</span>
            <span className="text-muted">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrapPanel({ traps }: { traps: TrapState[] }) {
  return (
    <div>
      <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
        Handler Traps
      </span>
      <div className="flex gap-1.5">
        {traps.map((trap) => (
          <span
            key={trap.name}
            className={`border px-2 py-1 font-mono text-[0.625rem] font-semibold transition-all ${
              trap.active
                ? "border-accent bg-accent/15 text-accent"
                : "border-border bg-surface text-muted"
            }`}
          >
            {trap.name}()
          </span>
        ))}
      </div>
    </div>
  );
}

function OperationPanel({
  operation,
  result,
}: {
  operation: string;
  result: string;
}) {
  const isError = result.includes("Error") || result.includes("TypeError");
  return (
    <div>
      <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
        인터셉트
      </span>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 font-mono text-[0.625rem]">
          <span className="text-amber-700 dark:text-amber-300 font-semibold">
            {operation}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[0.625rem]">
          <span className="text-muted">→</span>
          <span
            className={`font-semibold ${
              isError
                ? "text-red-700 dark:text-red-300"
                : "text-emerald-700 dark:text-emerald-300"
            }`}
          >
            {result}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface ProxyTrapProps {
  preset?: string;
}

export function ProxyTrap({ preset = "get-set" }: ProxyTrapProps) {
  const data = presets[preset] ?? presets["get-set"];
  const lines = data.code.split("\n");

  const stepNodes = data.steps.map((step, idx) => (
    <div key={idx}>
      <div className="flex gap-4 max-sm:flex-col">
        <CodePanel lines={lines} activeLines={step.activeLines} />

        <div className="w-52 shrink-0 max-sm:w-full space-y-3">
          <TargetPanel target={step.target} />
          <TrapPanel traps={step.traps} />
          <OperationPanel operation={step.operation} result={step.result} />
        </div>
      </div>

      <span className="mt-4 block border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </span>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
