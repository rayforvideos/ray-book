import type { MDXComponents } from "mdx/types";
import { CodeBlock } from "@/components/viz/primitives/CodeBlock";
import { EventLoop } from "@/components/viz/domain/EventLoop";
import { Tokenizer } from "@/components/viz/domain/Tokenizer";
import { ASTTree } from "@/components/viz/domain/ASTTree";
import { BytecodeView } from "@/components/viz/domain/BytecodeView";
import { JITPipeline } from "@/components/viz/domain/JITPipeline";
import { HiddenClass } from "@/components/viz/domain/HiddenClass";
import { ICState } from "@/components/viz/domain/ICState";
import { GCHeap } from "@/components/viz/domain/GCHeap";
import { ExecutionContext } from "@/components/viz/domain/ExecutionContext";
import { ScopeChain } from "@/components/viz/domain/ScopeChain";
import { Closure } from "@/components/viz/domain/Closure";
import { Hoisting } from "@/components/viz/domain/Hoisting";
import { ThisBinding } from "@/components/viz/domain/ThisBinding";
import { EventLoopFull } from "@/components/viz/domain/EventLoopFull";
import { PromiseChain } from "@/components/viz/domain/PromiseChain";
import { AsyncAwait } from "@/components/viz/domain/AsyncAwait";
import { AsyncErrorPattern } from "@/components/viz/domain/AsyncErrorPattern";
import { Term } from "@/components/viz/primitives/Term";

export const mdxComponents: MDXComponents = {
  EventLoop,
  Tokenizer,
  ASTTree,
  BytecodeView,
  JITPipeline,
  HiddenClass,
  ICState,
  GCHeap,
  ExecutionContext,
  ScopeChain,
  Closure,
  Hoisting,
  ThisBinding,
  EventLoopFull,
  PromiseChain,
  AsyncAwait,
  AsyncErrorPattern,
  Term,
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
