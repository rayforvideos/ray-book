"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

interface TreeNode {
  tag: string;
  depth: number;
  type: "element" | "text" | "comment";
  children?: TreeNode[];
}

interface TraversalStep {
  highlighted: string[];
  api: string;
  description: string;
}

const sampleTree: TreeNode[] = [
  {
    tag: "html", depth: 0, type: "element", children: [
      {
        tag: "head", depth: 1, type: "element", children: [
          { tag: "title", depth: 2, type: "element" },
        ],
      },
      {
        tag: "body", depth: 1, type: "element", children: [
          { tag: "h1", depth: 2, type: "element" },
          {
            tag: "ul", depth: 2, type: "element", children: [
              { tag: "li", depth: 3, type: "element" },
              { tag: "li", depth: 3, type: "element" },
              { tag: "li", depth: 3, type: "element" },
            ],
          },
          { tag: "p", depth: 2, type: "element" },
        ],
      },
    ],
  },
];

const steps: TraversalStep[] = [
  {
    highlighted: ["html"],
    api: "document.documentElement",
    description: "document.documentElement은 항상 <html> 루트 요소를 가리킵니다.",
  },
  {
    highlighted: ["html", "html>body"],
    api: "document.body",
    description: "document.body는 <body> 요소에 대한 직접 참조입니다.",
  },
  {
    highlighted: ["html>body", "html>body>h1", "html>body>ul", "html>body>p"],
    api: ".children",
    description: "body.children은 자식 Element 노드만 반환합니다. 텍스트 노드는 포함되지 않습니다.",
  },
  {
    highlighted: ["html>body>ul"],
    api: "querySelector('ul')",
    description: "querySelector는 CSS 선택자로 첫 번째 일치하는 요소를 찾습니다.",
  },
  {
    highlighted: ["html>body>ul>li", "html>body>ul>li+1", "html>body>ul>li+2"],
    api: "querySelectorAll('li')",
    description: "querySelectorAll은 일치하는 모든 요소를 NodeList로 반환합니다.",
  },
  {
    highlighted: ["html>body>ul>li"],
    api: ".closest('body')",
    description: "closest()는 현재 요소에서 위로 올라가며 선택자에 일치하는 첫 조상을 찾습니다.",
  },
];

const nodeColors = {
  element: { bg: "bg-sky-50 dark:bg-sky-950/40", border: "border-sky-300 dark:border-sky-700", text: "text-sky-900 dark:text-sky-100" },
  active: { bg: "bg-accent/10", border: "border-accent", text: "text-accent" },
  muted: { bg: "bg-surface", border: "border-border", text: "text-muted/40" },
};

function flattenTree(nodes: TreeNode[], path = ""): { node: TreeNode; path: string }[] {
  const result: { node: TreeNode; path: string }[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const suffix = i > 0 && nodes[i - 1]?.tag === node.tag ? `+${i}` : "";
    const nodePath = path ? `${path}>${node.tag}${suffix}` : node.tag;
    result.push({ node, path: nodePath });
    if (node.children) {
      result.push(...flattenTree(node.children, nodePath));
    }
  }
  return result;
}

export function DomTreeTraversal() {
  const flat = flattenTree(sampleTree);

  const stepNodes = steps.map((step, idx) => (
    <div key={idx} className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[0.6875rem] font-bold text-accent">{step.api}</span>
      </div>

      <div className="space-y-0.5">
        {flat.map(({ node, path }, i) => {
          const isActive = step.highlighted.some(h => path.startsWith(h) || h === path);
          const colors = isActive ? nodeColors.active : nodeColors.muted;
          return (
            <div
              key={i}
              className="flex items-center"
              style={{ paddingLeft: `${node.depth * 20}px` }}
            >
              <span
                className={`inline-block border px-2 py-0.5 font-mono text-[0.625rem] transition-all duration-200 ${colors.bg} ${colors.border} ${colors.text}`}
              >
                &lt;{node.tag}&gt;
              </span>
              {node.depth > 0 && (
                <span className="ml-1 w-2 border-b border-muted/30" />
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
