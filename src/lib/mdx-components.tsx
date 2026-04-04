import type { MDXComponents } from "mdx/types";
import { CodeBlock } from "@/components/viz/primitives/CodeBlock";
import { CodeTabs } from "@/components/viz/primitives/CodeTabs";
import { Term } from "@/components/viz/primitives/Term";
import * as domainComponents from "@/components/viz/domain";

export const mdxComponents: MDXComponents = {
  ...domainComponents,
  Term,
  CodeTabs,
  table: ({ children, ...props }: React.ComponentProps<"table">) => (
    <div className="table-wrapper">
      <table {...props}>{children}</table>
    </div>
  ),
  pre: ({ children, ...props }: React.ComponentProps<"pre">) => {
    const codeElement = children as React.ReactElement<{
      children: string;
      className?: string;
    }>;

    if (
      codeElement &&
      typeof codeElement === "object" &&
      "props" in codeElement
    ) {
      const code = codeElement.props.children?.trim() ?? "";
      const lang =
        codeElement.props.className?.replace("language-", "") ?? "text";

      return <CodeBlock code={code} lang={lang} />;
    }

    return <pre {...props}>{children}</pre>;
  },
};
