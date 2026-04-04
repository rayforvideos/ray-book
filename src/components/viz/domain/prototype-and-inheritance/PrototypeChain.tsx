"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ProtoObject {
  name: string;
  type: "instance" | "prototype" | "null";
  properties: { key: string; value: string; own?: boolean }[];
  highlight?: boolean;
}

interface ProtoStep {
  objects: ProtoObject[];
  activeLines: number[];
  lookup?: { property: string; found?: string };
  description: string;
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const typeStyles = {
  instance: {
    border: "border-sky-400/50 dark:border-sky-500/40",
    bg: "bg-sky-50 dark:bg-sky-950/40",
    label: "text-sky-800 dark:text-sky-200",
  },
  prototype: {
    border: "border-amber-400/50 dark:border-amber-500/40",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    label: "text-amber-800 dark:text-amber-200",
  },
  null: {
    border: "border-stone-400/50 dark:border-stone-500/40",
    bg: "bg-stone-50 dark:bg-stone-900/40",
    label: "text-stone-500 dark:text-stone-400",
  },
};

/* ------------------------------------------------------------------ */
/*  Presets                                                            */
/* ------------------------------------------------------------------ */

const presets: Record<string, { code: string; steps: ProtoStep[] }> = {
  /* ---- __proto__ 기본 --------------------------------------------- */
  "proto-basics": {
    code: [
      `const animal = {`,
      `  eats: true,`,
      `  walk() { return "walking"; }`,
      `};`,
      ``,
      `const rabbit = {`,
      `  jumps: true,`,
      `  __proto__: animal`,
      `};`,
      ``,
      `rabbit.jumps;  // true (자신의 속성)`,
      `rabbit.eats;   // true (animal에서 상속)`,
      `rabbit.walk();  // "walking" (animal에서 상속)`,
    ].join("\n"),

    steps: [
      {
        activeLines: [0, 1, 2, 3],
        objects: [
          {
            name: "animal",
            type: "instance",
            properties: [
              { key: "eats", value: "true", own: true },
              { key: "walk", value: "function", own: true },
            ],
          },
        ],
        description:
          "animal 객체를 생성합니다. eats와 walk을 자체 속성으로 가집니다.",
      },
      {
        activeLines: [5, 6, 7, 8],
        objects: [
          {
            name: "rabbit",
            type: "instance",
            properties: [
              { key: "jumps", value: "true", own: true },
              { key: "[[Prototype]]", value: "→ animal" },
            ],
          },
          {
            name: "animal",
            type: "prototype",
            properties: [
              { key: "eats", value: "true", own: true },
              { key: "walk", value: "function", own: true },
            ],
          },
        ],
        description:
          "rabbit 객체를 생성하고 __proto__를 animal로 설정합니다. " +
          "rabbit의 [[Prototype]] 내부 슬롯이 animal을 가리킵니다.",
      },
      {
        activeLines: [10],
        objects: [
          {
            name: "rabbit",
            type: "instance",
            highlight: true,
            properties: [
              { key: "jumps", value: "true ✓", own: true },
              { key: "[[Prototype]]", value: "→ animal" },
            ],
          },
          {
            name: "animal",
            type: "prototype",
            properties: [
              { key: "eats", value: "true", own: true },
              { key: "walk", value: "function", own: true },
            ],
          },
        ],
        lookup: { property: "jumps", found: "rabbit" },
        description:
          "rabbit.jumps — rabbit 자체에 jumps가 있으므로 즉시 반환합니다. " +
          "프로토타입 체인을 올라갈 필요가 없습니다.",
      },
      {
        activeLines: [11],
        objects: [
          {
            name: "rabbit",
            type: "instance",
            properties: [
              { key: "jumps", value: "true", own: true },
              { key: "[[Prototype]]", value: "→ animal" },
            ],
          },
          {
            name: "animal",
            type: "prototype",
            highlight: true,
            properties: [
              { key: "eats", value: "true ✓", own: true },
              { key: "walk", value: "function", own: true },
            ],
          },
        ],
        lookup: { property: "eats", found: "animal" },
        description:
          "rabbit.eats — rabbit에 eats가 없으므로 [[Prototype]]을 따라 " +
          "animal에서 찾습니다. 마치 rabbit의 속성처럼 사용할 수 있습니다.",
      },
    ],
  },

  /* ---- 체인 탐색 -------------------------------------------------- */
  "chain-lookup": {
    code: [
      `const base = { type: "animal" };`,
      `const dog = { bark: true, __proto__: base };`,
      `const puppy = { age: 1, __proto__: dog };`,
      ``,
      `puppy.age;   // 1     (puppy)`,
      `puppy.bark;  // true  (dog)`,
      `puppy.type;  // "animal" (base)`,
      `puppy.fly;   // undefined (null에 도달)`,
    ].join("\n"),

    steps: [
      {
        activeLines: [0, 1, 2],
        objects: [
          {
            name: "puppy",
            type: "instance",
            properties: [
              { key: "age", value: "1", own: true },
              { key: "[[Prototype]]", value: "→ dog" },
            ],
          },
          {
            name: "dog",
            type: "prototype",
            properties: [
              { key: "bark", value: "true", own: true },
              { key: "[[Prototype]]", value: "→ base" },
            ],
          },
          {
            name: "base",
            type: "prototype",
            properties: [
              { key: "type", value: '"animal"', own: true },
              { key: "[[Prototype]]", value: "→ Object.prototype" },
            ],
          },
          {
            name: "Object.prototype",
            type: "prototype",
            properties: [
              { key: "toString", value: "function", own: true },
              { key: "[[Prototype]]", value: "→ null" },
            ],
          },
          { name: "null", type: "null", properties: [] },
        ],
        description:
          "3단계 프로토타입 체인: puppy → dog → base → Object.prototype → null. " +
          "모든 체인은 결국 null에서 끝납니다.",
      },
      {
        activeLines: [6],
        objects: [
          {
            name: "puppy",
            type: "instance",
            properties: [
              { key: "age", value: "1", own: true },
              { key: "[[Prototype]]", value: "→ dog" },
            ],
          },
          {
            name: "dog",
            type: "prototype",
            properties: [
              { key: "bark", value: "true", own: true },
              { key: "[[Prototype]]", value: "→ base" },
            ],
          },
          {
            name: "base",
            type: "prototype",
            highlight: true,
            properties: [
              { key: "type", value: '"animal" ✓', own: true },
              { key: "[[Prototype]]", value: "→ Object.prototype" },
            ],
          },
        ],
        lookup: { property: "type", found: "base" },
        description:
          "puppy.type — puppy에 없고 → dog에도 없고 → base에서 발견. " +
          "체인을 따라 올라가며 첫 번째로 찾은 값을 반환합니다.",
      },
      {
        activeLines: [7],
        objects: [
          {
            name: "puppy",
            type: "instance",
            properties: [
              { key: "age", value: "1", own: true },
              { key: "[[Prototype]]", value: "→ dog" },
            ],
          },
          {
            name: "dog",
            type: "prototype",
            properties: [
              { key: "bark", value: "true", own: true },
              { key: "[[Prototype]]", value: "→ base" },
            ],
          },
          {
            name: "base",
            type: "prototype",
            properties: [
              { key: "type", value: '"animal"', own: true },
              { key: "[[Prototype]]", value: "→ Object.prototype" },
            ],
          },
          {
            name: "Object.prototype",
            type: "prototype",
            properties: [
              { key: "[[Prototype]]", value: "→ null" },
            ],
          },
          { name: "null", type: "null", properties: [], highlight: true },
        ],
        lookup: { property: "fly" },
        description:
          "puppy.fly — 체인 끝(null)까지 찾아도 없으면 undefined를 반환합니다. " +
          "에러가 아니라 undefined입니다.",
      },
    ],
  },

  /* ---- new와 constructor ------------------------------------------ */
  "constructor-new": {
    code: [
      `function Dog(name) {`,
      `  this.name = name;`,
      `}`,
      `Dog.prototype.bark = function() {`,
      `  return this.name + " barks!";`,
      `};`,
      ``,
      `const d = new Dog("Rex");`,
      `d.name;        // "Rex"`,
      `d.bark();      // "Rex barks!"`,
      `d instanceof Dog; // true`,
    ].join("\n"),

    steps: [
      {
        activeLines: [0, 1, 2, 3, 4, 5],
        objects: [
          {
            name: "Dog (함수)",
            type: "instance",
            properties: [
              { key: "prototype", value: "→ Dog.prototype", own: true },
            ],
          },
          {
            name: "Dog.prototype",
            type: "prototype",
            properties: [
              { key: "constructor", value: "→ Dog", own: true },
              { key: "bark", value: "function", own: true },
            ],
          },
        ],
        description:
          "함수를 선언하면 자동으로 prototype 객체가 생성됩니다. " +
          "prototype.constructor는 함수 자신을 가리킵니다. " +
          "bark 메서드를 prototype에 추가합니다.",
      },
      {
        activeLines: [7],
        objects: [
          {
            name: "d (인스턴스)",
            type: "instance",
            highlight: true,
            properties: [
              { key: "name", value: '"Rex"', own: true },
              { key: "[[Prototype]]", value: "→ Dog.prototype" },
            ],
          },
          {
            name: "Dog.prototype",
            type: "prototype",
            properties: [
              { key: "constructor", value: "→ Dog", own: true },
              { key: "bark", value: "function", own: true },
            ],
          },
        ],
        description:
          "new Dog(\"Rex\")가 하는 일: " +
          "① 빈 객체 생성 → " +
          "② [[Prototype]]을 Dog.prototype으로 설정 → " +
          "③ this를 바인딩하여 생성자 실행 → " +
          "④ 객체 반환.",
      },
      {
        activeLines: [9],
        objects: [
          {
            name: "d (인스턴스)",
            type: "instance",
            properties: [
              { key: "name", value: '"Rex"', own: true },
              { key: "[[Prototype]]", value: "→ Dog.prototype" },
            ],
          },
          {
            name: "Dog.prototype",
            type: "prototype",
            highlight: true,
            properties: [
              { key: "constructor", value: "→ Dog", own: true },
              { key: "bark", value: "function ✓", own: true },
            ],
          },
        ],
        lookup: { property: "bark()", found: "Dog.prototype" },
        description:
          "d.bark() — d에 bark가 없으므로 Dog.prototype에서 찾습니다. " +
          "메서드는 prototype에 한 번만 존재하고, " +
          "모든 인스턴스가 공유합니다. 메모리 효율적입니다.",
      },
    ],
  },

  /* ---- class 실체 ------------------------------------------------- */
  "class-desugar": {
    code: [
      `class Animal {`,
      `  constructor(name) {`,
      `    this.name = name;`,
      `  }`,
      `  speak() {`,
      `    return this.name + " speaks";`,
      `  }`,
      `}`,
      ``,
      `class Dog extends Animal {`,
      `  bark() {`,
      `    return this.name + " barks";`,
      `  }`,
      `}`,
      ``,
      `const d = new Dog("Rex");`,
    ].join("\n"),

    steps: [
      {
        activeLines: [0, 1, 2, 3, 4, 5, 6, 7],
        objects: [
          {
            name: "Animal (함수)",
            type: "instance",
            properties: [
              { key: "prototype", value: "→ Animal.prototype", own: true },
            ],
          },
          {
            name: "Animal.prototype",
            type: "prototype",
            properties: [
              { key: "constructor", value: "→ Animal", own: true },
              { key: "speak", value: "function", own: true },
            ],
          },
        ],
        description:
          "class Animal은 내부적으로 함수입니다. typeof Animal === \"function\". " +
          "메서드(speak)는 Animal.prototype에 들어갑니다. " +
          "생성자 함수 + prototype과 동일한 구조입니다.",
      },
      {
        activeLines: [9, 10, 11, 12, 13],
        objects: [
          {
            name: "Dog (함수)",
            type: "instance",
            properties: [
              { key: "prototype", value: "→ Dog.prototype", own: true },
              { key: "[[Prototype]]", value: "→ Animal" },
            ],
          },
          {
            name: "Dog.prototype",
            type: "prototype",
            properties: [
              { key: "bark", value: "function", own: true },
              { key: "[[Prototype]]", value: "→ Animal.prototype" },
            ],
          },
          {
            name: "Animal.prototype",
            type: "prototype",
            properties: [
              { key: "speak", value: "function", own: true },
            ],
          },
        ],
        description:
          "extends는 두 개의 프로토타입 링크를 설정합니다: " +
          "① Dog.prototype.[[Prototype]] → Animal.prototype (인스턴스 메서드 상속) " +
          "② Dog.[[Prototype]] → Animal (정적 메서드 상속).",
      },
      {
        activeLines: [15],
        objects: [
          {
            name: "d (인스턴스)",
            type: "instance",
            highlight: true,
            properties: [
              { key: "name", value: '"Rex"', own: true },
              { key: "[[Prototype]]", value: "→ Dog.prototype" },
            ],
          },
          {
            name: "Dog.prototype",
            type: "prototype",
            properties: [
              { key: "bark", value: "function", own: true },
              { key: "[[Prototype]]", value: "→ Animal.prototype" },
            ],
          },
          {
            name: "Animal.prototype",
            type: "prototype",
            properties: [
              { key: "speak", value: "function", own: true },
            ],
          },
        ],
        description:
          "d → Dog.prototype → Animal.prototype → Object.prototype → null. " +
          "d.bark()는 Dog.prototype에서, d.speak()는 Animal.prototype에서 찾습니다. " +
          "class는 프로토타입 체인의 문법적 설탕일 뿐입니다.",
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function CodePanel({ lines, activeLines }: { lines: string[]; activeLines: number[] }) {
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
              <span className={`select-none w-8 shrink-0 text-right pr-3 ${isActive ? "text-accent" : "text-muted/50"}`}>
                {i + 1}
              </span>
              <span className={`flex-1 pr-3 py-px whitespace-pre ${isActive ? "text-text" : "text-muted/50"}`}>
                {line || "\u00A0"}
              </span>
              {isActive && (
                <span className="shrink-0 pr-2 text-accent text-[0.625rem] pt-px">◄</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ObjectCard({ obj }: { obj: ProtoObject }) {
  const s = typeStyles[obj.type];
  return (
    <div
      className={`border p-2 transition-all ${s.border} ${s.bg} ${obj.highlight ? "ring-1 ring-accent" : ""}`}
    >
      <span className={`text-[0.625rem] font-bold ${s.label}`}>
        {obj.name}
      </span>
      {obj.properties.length > 0 && (
        <div className="mt-1 space-y-px">
          {obj.properties.map((p) => (
            <div
              key={p.key}
              className="flex items-baseline justify-between font-mono text-[0.625rem]"
            >
              <span className={p.own ? "text-text" : "text-muted"}>
                {p.key}
              </span>
              <span
                className={
                  p.value.includes("function")
                    ? "text-violet-700 dark:text-violet-300"
                    : p.value.includes("→")
                      ? "text-amber-800 dark:text-amber-300"
                      : "text-text"
                }
              >
                {p.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChainPanel({
  objects,
  lookup,
}: {
  objects: ProtoObject[];
  lookup?: { property: string; found?: string };
}) {
  return (
    <div className="w-52 shrink-0 max-sm:w-full">
      <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
        프로토타입 체인
      </span>
      <div className="space-y-1">
        {objects.map((obj, i) => (
          <div key={`${obj.name}-${i}`}>
            <ObjectCard obj={obj} />
            {i < objects.length - 1 && obj.type !== "null" && (
              <div className="flex justify-center py-0.5">
                <span className="text-[0.625rem] text-muted/40">↓</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {lookup && (
        <div className="mt-2 border-t border-border pt-2">
          <span className="block text-[0.5625rem] uppercase tracking-wider text-muted mb-1">
            속성 탐색
          </span>
          <div className="font-mono text-[0.625rem]">
            <span className="text-text">{lookup.property}</span>
            {lookup.found ? (
              <span className="text-emerald-700 dark:text-emerald-300">
                {" "}→ {lookup.found}에서 발견
              </span>
            ) : (
              <span className="text-red-700 dark:text-red-300">
                {" "}→ 없음 (undefined)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface PrototypeChainProps {
  preset?: string;
}

export function PrototypeChain({ preset = "proto-basics" }: PrototypeChainProps) {
  const data = presets[preset] ?? presets["proto-basics"];
  const lines = data.code.split("\n");

  const stepNodes = data.steps.map((step, idx) => (
    <div key={idx}>
      <div className="flex gap-4 max-sm:flex-col">
        <CodePanel lines={lines} activeLines={step.activeLines} />
        <ChainPanel objects={step.objects} lookup={step.lookup} />
      </div>

      <span className="mt-4 block border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </span>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
