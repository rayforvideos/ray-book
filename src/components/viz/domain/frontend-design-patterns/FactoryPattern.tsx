"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ─── Types ─── */

interface Product {
  id: string;
  label: string;
  type: string;
  color: "button" | "input" | "card" | "factory" | "highlight";
}

interface Step {
  input: string;
  factory: string;
  products: Product[];
  activeProduct: string | null;
  label: string;
  description: string;
  codeSnippet?: string;
}

/* ─── Color Map ─── */

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
  factory: {
    bg: "fill-amber-50 dark:fill-amber-950",
    border: "stroke-amber-500 dark:stroke-amber-400",
    text: "fill-amber-800 dark:fill-amber-200",
  },
  button: {
    bg: "fill-sky-50 dark:fill-sky-950",
    border: "stroke-sky-500 dark:stroke-sky-400",
    text: "fill-sky-800 dark:fill-sky-200",
  },
  input: {
    bg: "fill-emerald-50 dark:fill-emerald-950",
    border: "stroke-emerald-500 dark:stroke-emerald-400",
    text: "fill-emerald-800 dark:fill-emerald-200",
  },
  card: {
    bg: "fill-violet-50 dark:fill-violet-950",
    border: "stroke-violet-500 dark:stroke-violet-400",
    text: "fill-violet-800 dark:fill-violet-200",
  },
  highlight: {
    bg: "fill-rose-50 dark:fill-rose-950",
    border: "stroke-rose-500 dark:stroke-rose-400",
    text: "fill-rose-800 dark:fill-rose-200",
  },
};

/* ─── Factory Diagram ─── */

function FactoryDiagram({ input, factory, products, activeProduct }: {
  input: string;
  factory: string;
  products: Product[];
  activeProduct: string | null;
}) {
  const BOX_W = 90;
  const BOX_H = 38;
  const factoryStyle = colorMap.factory;
  const prodStartY = 130;
  const prodSpacing = products.length <= 3 ? 120 : 100;
  const prodStartX = 200 - ((products.length - 1) * prodSpacing) / 2;

  return (
    <svg viewBox="0 0 400 200" className="w-full" style={{ maxHeight: 200 }}>
      <defs>
        <marker id="factory-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" className="fill-amber-500 dark:fill-amber-400" />
        </marker>
        <marker id="factory-arrow-active" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" className="fill-rose-500 dark:fill-rose-400" />
        </marker>
      </defs>

      {/* Input label */}
      {input && (
        <text x={200} y={16} textAnchor="middle" className="fill-muted text-[0.5rem] font-mono">
          type: &quot;{input}&quot;
        </text>
      )}

      {/* Factory box */}
      <rect
        x={200 - BOX_W / 2} y={30}
        width={BOX_W} height={BOX_H} rx={6}
        className={`${factoryStyle.bg} ${factoryStyle.border} stroke-[1.5]`}
      />
      <text x={200} y={50} textAnchor="middle" className={`${factoryStyle.text} text-[0.6rem] font-bold`}>
        {factory}
      </text>

      {/* Arrows & Products */}
      {products.map((prod, i) => {
        const px = prodStartX + i * prodSpacing;
        const py = prodStartY;
        const isActive = prod.id === activeProduct;
        const style = isActive ? colorMap.highlight : colorMap[prod.color];

        return (
          <g key={prod.id}>
            {/* Arrow from factory to product */}
            <line
              x1={200} y1={30 + BOX_H}
              x2={px} y2={py - BOX_H / 2 + 4}
              className={isActive
                ? "stroke-rose-500 dark:stroke-rose-400 stroke-[1.5]"
                : "stroke-border stroke-1"
              }
              strokeDasharray={isActive ? "none" : "4 4"}
              markerEnd={isActive ? "url(#factory-arrow-active)" : "url(#factory-arrow)"}
            />
            {/* Product box */}
            <rect
              x={px - BOX_W / 2} y={py - BOX_H / 2}
              width={BOX_W} height={BOX_H} rx={6}
              className={`${style.bg} ${style.border} stroke-[1.5] transition-all duration-300`}
              opacity={activeProduct && !isActive ? 0.4 : 1}
            />
            <text
              x={px} y={py - 4}
              textAnchor="middle"
              className={`${style.text} text-[0.55rem] font-bold`}
            >
              {prod.label}
            </text>
            <text
              x={px} y={py + 8}
              textAnchor="middle"
              className="fill-muted text-[0.4rem] font-mono"
            >
              {prod.type}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Legend ─── */

function Legend() {
  const items = [
    { color: "bg-amber-400", label: "Factory" },
    { color: "bg-sky-400", label: "Button" },
    { color: "bg-emerald-400", label: "Input" },
    { color: "bg-violet-400", label: "Card" },
    { color: "bg-rose-400", label: "생성됨" },
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

/* ─── Steps: Component Factory ─── */

const products: Product[] = [
  { id: "btn", label: "<Button />", type: "button", color: "button" },
  { id: "inp", label: "<Input />", type: "input", color: "input" },
  { id: "card", label: "<Card />", type: "card", color: "card" },
];

const componentSteps: Step[] = [
  {
    input: "",
    factory: "createComponent",
    products,
    activeProduct: null,
    label: "팩토리 구조",
    description: "createComponent 팩토리가 type에 따라 서로 다른 컴포넌트를 생성합니다. 호출하는 쪽은 어떤 컴포넌트가 만들어지는지 신경 쓸 필요 없습니다.",
    codeSnippet: "const componentMap = {\n  button: Button,\n  input: Input,\n  card: Card,\n};\n\nfunction createComponent(type, props) {\n  const Component = componentMap[type];\n  if (!Component) throw new Error(`Unknown: ${type}`);\n  return <Component {...props} />;\n}",
  },
  {
    input: "button",
    factory: "createComponent",
    products,
    activeProduct: "btn",
    label: "type: 'button' → <Button />",
    description: "type이 'button'이면 Button 컴포넌트를 생성합니다. 팩토리 내부의 매핑만으로 결정되며, if/else 분기가 없습니다.",
    codeSnippet: "createComponent('button', { label: '제출' });\n// → <Button label=\"제출\" />",
  },
  {
    input: "input",
    factory: "createComponent",
    products,
    activeProduct: "inp",
    label: "type: 'input' → <Input />",
    description: "type이 'input'이면 Input 컴포넌트를 생성합니다. 같은 팩토리, 같은 인터페이스로 완전히 다른 컴포넌트가 만들어집니다.",
    codeSnippet: "createComponent('input', { placeholder: '이메일' });\n// → <Input placeholder=\"이메일\" />",
  },
  {
    input: "card",
    factory: "createComponent",
    products,
    activeProduct: "card",
    label: "type: 'card' → <Card />",
    description: "type이 'card'이면 Card 컴포넌트를 생성합니다. 새로운 컴포넌트 타입을 추가하고 싶으면? componentMap에 한 줄만 추가하면 됩니다.",
    codeSnippet: "createComponent('card', { title: '상품', image: '...' });\n// → <Card title=\"상품\" image=\"...\" />",
  },
  {
    input: "tooltip",
    factory: "createComponent",
    products: [
      ...products,
      { id: "tooltip", label: "<Tooltip />", type: "tooltip", color: "card" },
    ],
    activeProduct: "tooltip",
    label: "새 타입 추가 (OCP)",
    description: "새로운 'tooltip' 타입이 필요하면? componentMap에 한 줄 추가하면 됩니다. 팩토리 함수 자체는 수정하지 않습니다. if/else였다면 분기를 추가해야 했을 것입니다.",
    codeSnippet: "// 기존 코드 수정 없이 새 타입만 등록\ncomponentMap.tooltip = Tooltip;\n\ncreateComponent('tooltip', { text: '도움말' });\n// → <Tooltip text=\"도움말\" />",
  },
];

/* ─── Presets ─── */

const presets: Record<string, Step[]> = {
  component: componentSteps,
};

/* ─── Main Component ─── */

interface FactoryPatternProps {
  preset?: string;
}

export function FactoryPattern({ preset = "component" }: FactoryPatternProps) {
  const steps = presets[preset] ?? presets["component"];

  const stepNodes = steps.map((step, idx) => (
    <div key={idx} className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-bold text-accent">{step.label}</span>
        <span className="text-[0.6875rem] text-muted">{idx + 1} / {steps.length}</span>
      </div>

      <FactoryDiagram
        input={step.input}
        factory={step.factory}
        products={step.products}
        activeProduct={step.activeProduct}
      />

      <Legend />

      {step.codeSnippet && (
        <pre className="rounded border border-border bg-surface p-3 font-mono text-xs leading-relaxed text-muted">
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
