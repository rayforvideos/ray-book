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
import { AsyncUtilPattern } from "@/components/viz/domain/AsyncUtilPattern";
import { PrototypeChain } from "@/components/viz/domain/PrototypeChain";
import { CallbackPyramid } from "@/components/viz/domain/CallbackPyramid";
import { PromiseStateMachine } from "@/components/viz/domain/PromiseStateMachine";
import { DebounceTimeline } from "@/components/viz/domain/DebounceTimeline";
import { DomCssomParser } from "@/components/viz/domain/DomCssomParser";
import { NewOperatorFlow } from "@/components/viz/domain/NewOperatorFlow";
import { InheritanceCompare } from "@/components/viz/domain/InheritanceCompare";
import { ModuleCompare } from "@/components/viz/domain/ModuleCompare";
import { TreeShaking } from "@/components/viz/domain/TreeShaking";
import { TypeCoercion } from "@/components/viz/domain/TypeCoercion";
import { EqualityCompare } from "@/components/viz/domain/EqualityCompare";
import { MapVsObject } from "@/components/viz/domain/MapVsObject";
import { IteratorFlow } from "@/components/viz/domain/IteratorFlow";
import { ProxyTrap } from "@/components/viz/domain/ProxyTrap";
import { ConfusingPatterns } from "@/components/viz/domain/ConfusingPatterns";
import { WorkerThread } from "@/components/viz/domain/WorkerThread";
import { TransferableCost } from "@/components/viz/domain/TransferableCost";
import { SharedMemoryRace } from "@/components/viz/domain/SharedMemoryRace";
import { RenderTreeLayout } from "@/components/viz/domain/RenderTreeLayout";
import { PaintRasterize } from "@/components/viz/domain/PaintRasterize";
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
  AsyncUtilPattern,
  PrototypeChain,
  CallbackPyramid,
  PromiseStateMachine,
  DebounceTimeline,
  DomCssomParser,
  NewOperatorFlow,
  InheritanceCompare,
  ModuleCompare,
  TreeShaking,
  TypeCoercion,
  EqualityCompare,
  MapVsObject,
  IteratorFlow,
  ProxyTrap,
  ConfusingPatterns,
  WorkerThread,
  TransferableCost,
  SharedMemoryRace,
  RenderTreeLayout,
  PaintRasterize,
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
