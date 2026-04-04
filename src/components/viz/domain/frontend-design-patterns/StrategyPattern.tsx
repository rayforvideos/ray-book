"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ─── Types ─── */

interface StrategyBox {
  id: string;
  label: string;
  type: "context" | "strategy" | "active-strategy";
  x: number;
  y: number;
  code?: string;
}

interface Arrow {
  from: string;
  to: string;
  label?: string;
  active?: boolean;
}

interface Step {
  boxes: StrategyBox[];
  arrows: Arrow[];
  label: string;
  description: string;
  codeSnippet?: string;
  result?: string;
}

/* ─── Box Renderer ─── */

function StrategyDiagram({ boxes, arrows }: { boxes: StrategyBox[]; arrows: Arrow[] }) {
  const boxMap = Object.fromEntries(boxes.map((b) => [b.id, b]));

  const typeStyles: Record<string, { bg: string; border: string; text: string }> = {
    context: {
      bg: "fill-amber-50 dark:fill-amber-950",
      border: "stroke-amber-500 dark:stroke-amber-400",
      text: "fill-amber-800 dark:fill-amber-200",
    },
    strategy: {
      bg: "fill-stone-50 dark:fill-stone-900",
      border: "stroke-border",
      text: "fill-muted",
    },
    "active-strategy": {
      bg: "fill-emerald-50 dark:fill-emerald-950",
      border: "stroke-emerald-500 dark:stroke-emerald-400",
      text: "fill-emerald-800 dark:fill-emerald-200",
    },
  };

  const hasMany = boxes.length > 4;
  const BOX_W = hasMany ? 80 : 110;
  const BOX_H = 44;

  return (
    <svg viewBox="0 0 400 220" className="w-full" style={{ maxHeight: 220 }}>
      {/* Arrows */}
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" className="fill-muted/60" />
        </marker>
        <marker id="arrowhead-active" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" className="fill-emerald-500 dark:fill-emerald-400" />
        </marker>
      </defs>
      {arrows.map((arrow, i) => {
        const from = boxMap[arrow.from];
        const to = boxMap[arrow.to];
        if (!from || !to) return null;
        const fromY = from.y + BOX_H / 2;
        const toY = to.y - BOX_H / 2 + 4;
        return (
          <g key={i}>
            <line
              x1={from.x}
              y1={fromY}
              x2={to.x}
              y2={toY}
              className={arrow.active
                ? "stroke-emerald-500 dark:stroke-emerald-400 stroke-[1.5] transition-all duration-300"
                : "stroke-border stroke-1 transition-all duration-300"}
              strokeDasharray={arrow.active ? "none" : "4 4"}
              markerEnd={arrow.active ? "url(#arrowhead-active)" : "url(#arrowhead)"}
            />
            {arrow.label && (
              <text
                x={(from.x + to.x) / 2 + 8}
                y={(fromY + toY) / 2}
                className="text-[0.5rem] fill-muted"
                textAnchor="start"
              >
                {arrow.label}
              </text>
            )}
          </g>
        );
      })}
      {/* Boxes */}
      {boxes.map((box) => {
        const style = typeStyles[box.type];
        return (
          <g key={box.id}>
            <rect
              x={box.x - BOX_W / 2}
              y={box.y - BOX_H / 2}
              width={BOX_W}
              height={BOX_H}
              rx={6}
              className={`${style.bg} ${style.border} stroke-[1.5] transition-all duration-300`}
              opacity={box.type === "strategy" ? 0.5 : 1}
            />
            <text
              x={box.x}
              y={box.y - 4}
              textAnchor="middle"
              className={`${style.text} text-[0.6rem] font-bold`}
            >
              {box.label}
            </text>
            {box.code && (
              <text
                x={box.x}
                y={box.y + 10}
                textAnchor="middle"
                className="fill-muted text-[0.4rem] font-mono"
              >
                {box.code}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Legend ─── */

function Legend() {
  const items = [
    { color: "bg-amber-400 dark:bg-amber-500", label: "Context" },
    { color: "bg-emerald-400 dark:bg-emerald-500", label: "Active Strategy" },
    { color: "bg-stone-300 dark:bg-stone-600", label: "Strategy" },
  ];
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

/* ─── Steps: Sorting Strategies ─── */

const sortSteps: Step[] = [
  {
    boxes: [
      { id: "ctx", label: "ProductList", type: "context", x: 200, y: 40, code: "sort(strategy)" },
      { id: "price", label: "가격순", type: "strategy", x: 80, y: 150, code: "price 비교" },
      { id: "name", label: "이름순", type: "strategy", x: 200, y: 150, code: "name 비교" },
      { id: "rating", label: "평점순", type: "strategy", x: 320, y: 150, code: "rating 비교" },
    ],
    arrows: [
      { from: "ctx", to: "price" },
      { from: "ctx", to: "name" },
      { from: "ctx", to: "rating" },
    ],
    label: "구조 파악",
    description: "Context(ProductList)가 세 가지 정렬 전략을 사용할 수 있습니다. 아직 어떤 전략도 선택되지 않았습니다.",
  },
  {
    boxes: [
      { id: "ctx", label: "ProductList", type: "context", x: 200, y: 40, code: "sort(priceAsc)" },
      { id: "price", label: "가격순 ✓", type: "active-strategy", x: 80, y: 150, code: "price 비교" },
      { id: "name", label: "이름순", type: "strategy", x: 200, y: 150, code: "name 비교" },
      { id: "rating", label: "평점순", type: "strategy", x: 320, y: 150, code: "rating 비교" },
    ],
    arrows: [
      { from: "ctx", to: "price", active: true, label: "사용 중" },
      { from: "ctx", to: "name" },
      { from: "ctx", to: "rating" },
    ],
    label: "가격순 전략 선택",
    description: "사용자가 '가격순'을 선택합니다. Context는 가격 비교 함수를 전달받아 정렬을 실행합니다. Context 내부의 정렬 로직은 전혀 변경되지 않습니다.",
    codeSnippet: "const priceAsc = (a, b) => a.price - b.price;\nproducts.sort(priceAsc);\n// [₩12,000, ₩35,000, ₩89,000]",
    result: "키보드 ₩12,000 → 마우스 ₩35,000 → 모니터 ₩89,000",
  },
  {
    boxes: [
      { id: "ctx", label: "ProductList", type: "context", x: 200, y: 40, code: "sort(byName)" },
      { id: "price", label: "가격순", type: "strategy", x: 80, y: 150, code: "price 비교" },
      { id: "name", label: "이름순 ✓", type: "active-strategy", x: 200, y: 150, code: "name 비교" },
      { id: "rating", label: "평점순", type: "strategy", x: 320, y: 150, code: "rating 비교" },
    ],
    arrows: [
      { from: "ctx", to: "price" },
      { from: "ctx", to: "name", active: true, label: "사용 중" },
      { from: "ctx", to: "rating" },
    ],
    label: "이름순으로 교체",
    description: "전략을 '이름순'으로 교체합니다. Context의 코드는 한 글자도 바뀌지 않았습니다 — 전달하는 함수만 바꿨을 뿐입니다. 이것이 Strategy 패턴의 핵심입니다.",
    codeSnippet: "const byName = (a, b) => a.name.localeCompare(b.name);\nproducts.sort(byName);\n// [마우스, 모니터, 키보드]",
    result: "마우스 → 모니터 → 키보드 (가나다순)",
  },
  {
    boxes: [
      { id: "ctx", label: "ProductList", type: "context", x: 200, y: 40, code: "sort(byRating)" },
      { id: "price", label: "가격순", type: "strategy", x: 80, y: 150, code: "price 비교" },
      { id: "name", label: "이름순", type: "strategy", x: 200, y: 150, code: "name 비교" },
      { id: "rating", label: "평점순 ✓", type: "active-strategy", x: 320, y: 150, code: "rating 비교" },
    ],
    arrows: [
      { from: "ctx", to: "price" },
      { from: "ctx", to: "name" },
      { from: "ctx", to: "rating", active: true, label: "사용 중" },
    ],
    label: "평점순으로 교체",
    description: "다시 '평점순'으로 교체합니다. 전략을 추가하고 싶으면? 새 함수를 만들어 전달하면 됩니다. if/else를 수정할 필요 없이, Open/Closed Principle을 자연스럽게 따릅니다.",
    codeSnippet: "const byRating = (a, b) => b.rating - a.rating;\nproducts.sort(byRating);\n// [모니터 ★4.8, 키보드 ★4.5, 마우스 ★4.2]",
    result: "모니터 ★4.8 → 키보드 ★4.5 → 마우스 ★4.2",
  },
  {
    boxes: [
      { id: "ctx", label: "ProductList", type: "context", x: 200, y: 40, code: "sort(strategy)" },
      { id: "price", label: "가격순", type: "strategy", x: 50, y: 150, code: "a.price - b.price" },
      { id: "name", label: "이름순", type: "strategy", x: 137, y: 150, code: "localeCompare" },
      { id: "rating", label: "평점순", type: "strategy", x: 224, y: 150, code: "b.rating - a.rating" },
      { id: "new", label: "🆕 할인율순", type: "active-strategy", x: 330, y: 150, code: "discount 비교" },
    ],
    arrows: [
      { from: "ctx", to: "price" },
      { from: "ctx", to: "name" },
      { from: "ctx", to: "rating" },
      { from: "ctx", to: "new", active: true, label: "새 전략 추가" },
    ],
    label: "새 전략 추가 (OCP)",
    description: "새로운 '할인율순' 전략이 필요하면? 함수 하나를 작성하고 전달하면 끝입니다. 기존 코드를 전혀 수정하지 않습니다. if/else였다면 분기를 또 추가해야 했을 것입니다.",
    codeSnippet: "// 기존 코드 수정 없이 새 전략만 추가\nconst byDiscount = (a, b) => b.discount - a.discount;\nproducts.sort(byDiscount);",
  },
];

/* ─── Steps: Validation Strategies ─── */

const validationSteps: Step[] = [
  {
    boxes: [
      { id: "ctx", label: "FormValidator", type: "context", x: 200, y: 40, code: "validate(v, rules)" },
      { id: "required", label: "required", type: "strategy", x: 80, y: 150, code: "trim().length > 0" },
      { id: "email", label: "email", type: "strategy", x: 200, y: 150, code: "이메일 형식 검증" },
      { id: "minLen", label: "minLength", type: "strategy", x: 320, y: 150, code: "length >= min" },
    ],
    arrows: [
      { from: "ctx", to: "required" },
      { from: "ctx", to: "email" },
      { from: "ctx", to: "minLen" },
    ],
    label: "검증 전략 구조",
    description: "FormValidator(Context)가 여러 검증 전략을 조합해서 사용합니다. 각 전략은 하나의 규칙만 담당합니다.",
  },
  {
    boxes: [
      { id: "ctx", label: "FormValidator", type: "context", x: 200, y: 40, code: "validate('', [...])" },
      { id: "required", label: "required ✗", type: "active-strategy", x: 80, y: 150, code: "'' → false" },
      { id: "email", label: "email", type: "strategy", x: 200, y: 150, code: "이메일 형식 검증" },
      { id: "minLen", label: "minLength", type: "strategy", x: 320, y: 150, code: "length >= min" },
    ],
    arrows: [
      { from: "ctx", to: "required", active: true, label: "실패!" },
    ],
    label: "빈 값 → required 실패",
    description: "빈 문자열을 검증합니다. required 전략이 false를 반환합니다. 나머지 전략은 실행되지 않습니다.",
    codeSnippet: "validate('', [required]);\n// → '필수 입력 항목입니다'",
  },
  {
    boxes: [
      { id: "ctx", label: "FormValidator", type: "context", x: 200, y: 40, code: "validate('hi', [...])" },
      { id: "required", label: "required ✓", type: "active-strategy", x: 80, y: 150, code: "'hi' → true" },
      { id: "email", label: "email ✗", type: "active-strategy", x: 200, y: 150, code: "'hi' → false" },
      { id: "minLen", label: "minLength", type: "strategy", x: 320, y: 150, code: "length >= min" },
    ],
    arrows: [
      { from: "ctx", to: "required", active: true, label: "통과" },
      { from: "ctx", to: "email", active: true, label: "실패!" },
    ],
    label: "email 형식 검증 실패",
    description: "required는 통과하지만, email 전략이 'hi'를 유효한 이메일로 인식하지 않습니다. 전략을 조합하여 파이프라인처럼 검증을 구성합니다.",
    codeSnippet: "validate('hi', [required, email]);\n// → '유효한 이메일 주소를 입력하세요'",
  },
  {
    boxes: [
      { id: "ctx", label: "FormValidator", type: "context", x: 200, y: 40, code: "validate(email, [...])" },
      { id: "required", label: "required ✓", type: "active-strategy", x: 80, y: 150, code: "true" },
      { id: "email", label: "email ✓", type: "active-strategy", x: 200, y: 150, code: "true" },
      { id: "minLen", label: "minLength", type: "strategy", x: 320, y: 150, code: "length >= min" },
    ],
    arrows: [
      { from: "ctx", to: "required", active: true, label: "통과" },
      { from: "ctx", to: "email", active: true, label: "통과" },
    ],
    label: "모든 검증 통과",
    description: "유효한 이메일을 입력하면 모든 전략이 통과합니다. 핵심: 새 검증 규칙(예: 도메인 제한)을 추가할 때 기존 전략 코드는 전혀 수정하지 않습니다.",
    codeSnippet: "validate('user@company.com', [required, email]);\n// → null (에러 없음, 통과!)",
  },
];

/* ─── Presets ─── */

const presets: Record<string, Step[]> = {
  sort: sortSteps,
  validation: validationSteps,
};

/* ─── Main Component ─── */

interface StrategyPatternProps {
  preset?: string;
}

export function StrategyPattern({ preset = "sort" }: StrategyPatternProps) {
  const steps = presets[preset] ?? presets["sort"];

  const stepNodes = steps.map((step, idx) => (
    <div key={idx} className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-bold text-accent">
          {step.label}
        </span>
        <span className="text-[0.6875rem] text-muted">
          {idx + 1} / {steps.length}
        </span>
      </div>

      <StrategyDiagram boxes={step.boxes} arrows={step.arrows} />

      <Legend />

      {step.result && (
        <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 font-mono text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          → {step.result}
        </div>
      )}

      {step.codeSnippet && (
        <pre className="overflow-x-auto rounded border border-border bg-surface p-3 font-mono text-xs leading-relaxed text-muted">
          {step.codeSnippet}
        </pre>
      )}

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
