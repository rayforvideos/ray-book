"use client";

import { useState, useCallback } from "react";
import { StepPlayer } from "../primitives/StepPlayer";

interface ASTNode {
  type: string;
  label?: string;
  children?: ASTNode[];
}

interface ASTStep {
  tree: ASTNode;
  highlight: string;
  description: string;
}

const nodeStyles: Record<string, { bg: string; text: string }> = {
  Program: {
    bg: "bg-stone-100 dark:bg-stone-800/40",
    text: "text-stone-800 dark:text-stone-200",
  },
  VariableDeclaration: {
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-950 dark:text-violet-100",
  },
  VariableDeclarator: {
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-950 dark:text-violet-100",
  },
  FunctionDeclaration: {
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-950 dark:text-violet-100",
  },
  BlockStatement: {
    bg: "bg-stone-100 dark:bg-stone-800/40",
    text: "text-stone-700 dark:text-stone-200",
  },
  ReturnStatement: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-950 dark:text-amber-100",
  },
  BinaryExpression: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-950 dark:text-amber-100",
  },
  Identifier: {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    text: "text-sky-950 dark:text-sky-100",
  },
  Literal: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-950 dark:text-emerald-100",
  },
};

const defaultStyle = {
  bg: "bg-stone-100 dark:bg-stone-800/40",
  text: "text-stone-700 dark:text-stone-200",
};

const presets: Record<string, { code: string; steps: ASTStep[] }> = {
  "let-hello": {
    code: 'let message = "hello";',
    steps: [
      {
        tree: { type: "Program", children: [] },
        highlight: "Program",
        description:
          "파서가 시작합니다. 최상위 노드인 Program을 생성합니다. 모든 코드는 이 노드의 자식이 됩니다.",
      },
      {
        tree: {
          type: "Program",
          children: [{ type: "VariableDeclaration", label: "let", children: [] }],
        },
        highlight: "VariableDeclaration",
        description:
          "첫 토큰 `let`을 읽고 변수 선언문 (VariableDeclaration) 노드를 만듭니다. kind 속성에 'let'이 기록됩니다.",
      },
      {
        tree: {
          type: "Program",
          children: [
            {
              type: "VariableDeclaration",
              label: "let",
              children: [{ type: "VariableDeclarator", children: [] }],
            },
          ],
        },
        highlight: "VariableDeclarator",
        description:
          "선언문 안에 VariableDeclarator 노드를 만듭니다. 하나의 선언문에 여러 변수를 선언할 수 있으므로 (예: `let a, b`) 이 레이어가 필요합니다.",
      },
      {
        tree: {
          type: "Program",
          children: [
            {
              type: "VariableDeclaration",
              label: "let",
              children: [
                {
                  type: "VariableDeclarator",
                  children: [{ type: "Identifier", label: "message" }],
                },
              ],
            },
          ],
        },
        highlight: "Identifier",
        description:
          "토큰 `message`를 읽고 Identifier 노드를 만듭니다. 이것이 VariableDeclarator의 id — 변수의 이름입니다.",
      },
      {
        tree: {
          type: "Program",
          children: [
            {
              type: "VariableDeclaration",
              label: "let",
              children: [
                {
                  type: "VariableDeclarator",
                  children: [
                    { type: "Identifier", label: "message" },
                    { type: "Literal", label: '"hello"' },
                  ],
                },
              ],
            },
          ],
        },
        highlight: "Literal",
        description:
          '`=` 뒤의 `"hello"`를 읽고 Literal 노드를 만듭니다. 이것이 VariableDeclarator의 init — 변수의 초기값입니다. 세미콜론을 만나 문이 끝납니다.',
      },
    ],
  },
  "function-add": {
    code: "function add(a, b) { return a + b; }",
    steps: [
      {
        tree: { type: "Program", children: [] },
        highlight: "Program",
        description: "최상위 Program 노드에서 시작합니다.",
      },
      {
        tree: {
          type: "Program",
          children: [
            {
              type: "FunctionDeclaration",
              children: [{ type: "Identifier", label: "add" }],
            },
          ],
        },
        highlight: "FunctionDeclaration",
        description:
          "`function` 키워드를 만나 FunctionDeclaration 노드를 생성합니다. 바로 뒤의 `add`가 함수 이름 (id) 이 됩니다.",
      },
      {
        tree: {
          type: "Program",
          children: [
            {
              type: "FunctionDeclaration",
              children: [
                { type: "Identifier", label: "add" },
                { type: "Identifier", label: "a" },
                { type: "Identifier", label: "b" },
              ],
            },
          ],
        },
        highlight: "Identifier",
        description:
          "괄호 안의 `a`, `b`를 읽고 각각 Identifier 노드로 만듭니다. 이것들이 함수의 params 배열에 들어갑니다.",
      },
      {
        tree: {
          type: "Program",
          children: [
            {
              type: "FunctionDeclaration",
              children: [
                { type: "Identifier", label: "add" },
                { type: "Identifier", label: "a" },
                { type: "Identifier", label: "b" },
                {
                  type: "BlockStatement",
                  children: [
                    {
                      type: "ReturnStatement",
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
        highlight: "ReturnStatement",
        description:
          "`{` 를 만나 BlockStatement (함수 본문) 를 시작합니다. 안에서 `return`을 만나 ReturnStatement 노드를 생성합니다.",
      },
      {
        tree: {
          type: "Program",
          children: [
            {
              type: "FunctionDeclaration",
              children: [
                { type: "Identifier", label: "add" },
                { type: "Identifier", label: "a" },
                { type: "Identifier", label: "b" },
                {
                  type: "BlockStatement",
                  children: [
                    {
                      type: "ReturnStatement",
                      children: [
                        {
                          type: "BinaryExpression",
                          label: "+",
                          children: [
                            { type: "Identifier", label: "a" },
                            { type: "Identifier", label: "b" },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        highlight: "BinaryExpression",
        description:
          "`a + b`를 파싱합니다. `+` 연산자를 중심으로 BinaryExpression 노드가 만들어지고, 왼쪽 (a) 과 오른쪽 (b) 이 자식 노드가 됩니다. `}` 를 만나 함수 선언이 완료됩니다.",
      },
    ],
  },
};

interface ASTTreeProps {
  preset?: string;
}

export function ASTTree({ preset = "let-hello" }: ASTTreeProps) {
  const data = presets[preset] ?? presets["let-hello"];
  const [currentStep, setCurrentStep] = useState(0);

  const handleStepChange = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const step = data.steps[currentStep];

  // Find the step with the most nodes (largest tree)
  const largestTree = data.steps.reduce((max, s) =>
    countNodes(s.tree) > countNodes(max.tree) ? s : max
  ).tree;

  return (
    <StepPlayer totalSteps={data.steps.length} onStepChange={handleStepChange}>
      <div className="space-y-4">
        {/* Source code */}
        <div>
          <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
            소스 코드
          </span>
          <div className="rounded-sm bg-surface p-3 font-mono text-[0.8125rem]">
            {data.code}
          </div>
        </div>

        {/* AST */}
        <div>
          <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
            AST
          </span>
          <div className="relative overflow-x-auto rounded-sm bg-surface p-4">
            {/* Hidden largest tree to reserve space */}
            <div className="invisible" aria-hidden="true">
              <TreeNode node={largestTree} highlight="" depth={0} />
            </div>
            {/* Visible current tree */}
            <div className="absolute inset-0 p-4">
              <TreeNode node={step.tree} highlight={step.highlight} depth={0} />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted min-h-[3.5rem]">
          {step.description}
        </div>
      </div>
    </StepPlayer>
  );
}

function countNodes(node: ASTNode): number {
  return 1 + (node.children?.reduce((sum, child) => sum + countNodes(child), 0) ?? 0);
}

function TreeNode({
  node,
  highlight,
  depth,
}: {
  node: ASTNode;
  highlight: string;
  depth: number;
}) {
  const style = nodeStyles[node.type] ?? defaultStyle;
  const isHighlighted = node.type === highlight;

  return (
    <div className={depth > 0 ? "ml-5 mt-1.5" : ""}>
      <div className="flex items-center gap-1.5">
        {depth > 0 && (
          <span className="mr-0.5 text-[0.6875rem] text-border">
            └
          </span>
        )}
        <span
          className={`inline-flex items-baseline gap-1.5 border px-2 py-0.5 font-mono text-[0.6875rem] transition-all ${style.bg} ${style.text} ${
            isHighlighted
              ? "ring-1 ring-accent/50 border-accent/30"
              : "border-transparent"
          }`}
        >
          <span className="opacity-60">{node.type}</span>
          {node.label && <span className="font-semibold">{node.label}</span>}
        </span>
      </div>
      {node.children?.map((child, i) => (
        <TreeNode key={i} node={child} highlight={highlight} depth={depth + 1} />
      ))}
    </div>
  );
}
