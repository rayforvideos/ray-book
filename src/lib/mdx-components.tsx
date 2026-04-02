import type { MDXComponents } from "mdx/types";
import { CodeBlock } from "@/components/viz/primitives/CodeBlock";
import { EventLoop } from "@/components/viz/domain/EventLoop";
import { Tokenizer } from "@/components/viz/domain/Tokenizer";
import { ASTTree } from "@/components/viz/domain/ASTTree";
import { BytecodeView } from "@/components/viz/domain/BytecodeView";
import { JITPipeline } from "@/components/viz/domain/JITPipeline";
import { HiddenClass } from "@/components/viz/domain/HiddenClass";
import { HttpRequestFlow } from "@/components/viz/domain/HttpRequestFlow";
import { ICState } from "@/components/viz/domain/ICState";
import { GCHeap } from "@/components/viz/domain/GCHeap";
import { ExecutionContext } from "@/components/viz/domain/ExecutionContext";
import { ScopeChain } from "@/components/viz/domain/ScopeChain";
import { Closure } from "@/components/viz/domain/Closure";
import { Hoisting } from "@/components/viz/domain/Hoisting";
import { ThisBinding } from "@/components/viz/domain/ThisBinding";
import { EventDelegation } from "@/components/viz/domain/EventDelegation";
import { EventFlow } from "@/components/viz/domain/EventFlow";
import { EventLoopFull } from "@/components/viz/domain/EventLoopFull";
import { FetchLifecycle } from "@/components/viz/domain/FetchLifecycle";
import { PromiseChain } from "@/components/viz/domain/PromiseChain";
import { AsyncAwait } from "@/components/viz/domain/AsyncAwait";
import { AsyncErrorPattern } from "@/components/viz/domain/AsyncErrorPattern";
import { AsyncUtilPattern } from "@/components/viz/domain/AsyncUtilPattern";
import { PrototypeChain } from "@/components/viz/domain/PrototypeChain";
import { CallbackPyramid } from "@/components/viz/domain/CallbackPyramid";
import { PromiseStateMachine } from "@/components/viz/domain/PromiseStateMachine";
import { DebounceTimeline } from "@/components/viz/domain/DebounceTimeline";
import { DomCssomParser } from "@/components/viz/domain/DomCssomParser";
import { DomTreeTraversal } from "@/components/viz/domain/DomTreeTraversal";
import { NewOperatorFlow } from "@/components/viz/domain/NewOperatorFlow";
import { ObserverPattern } from "@/components/viz/domain/ObserverPattern";
import { InheritanceCompare } from "@/components/viz/domain/InheritanceCompare";
import { ModuleCompare } from "@/components/viz/domain/ModuleCompare";
import { TreeShaking } from "@/components/viz/domain/TreeShaking";
import { TypeCoercion } from "@/components/viz/domain/TypeCoercion";
import { EqualityCompare } from "@/components/viz/domain/EqualityCompare";
import { MapVsObject } from "@/components/viz/domain/MapVsObject";
import { IteratorFlow } from "@/components/viz/domain/IteratorFlow";
import { ProxyTrap } from "@/components/viz/domain/ProxyTrap";
import { RafTimeline } from "@/components/viz/domain/RafTimeline";
import { RealtimeCompare } from "@/components/viz/domain/RealtimeCompare";
import { ConfusingPatterns } from "@/components/viz/domain/ConfusingPatterns";
import { WorkerThread } from "@/components/viz/domain/WorkerThread";
import { TransferableCost } from "@/components/viz/domain/TransferableCost";
import { SecurityModel } from "@/components/viz/domain/SecurityModel";
import { SharedMemoryRace } from "@/components/viz/domain/SharedMemoryRace";
import { StorageCompare } from "@/components/viz/domain/StorageCompare";
import { RenderTreeLayout } from "@/components/viz/domain/RenderTreeLayout";
import { PaintRasterize } from "@/components/viz/domain/PaintRasterize";
import { CompositorLayers } from "@/components/viz/domain/CompositorLayers";
import { PipelineTrigger } from "@/components/viz/domain/PipelineTrigger";
import { PipelineMetrics } from "@/components/viz/domain/PipelineMetrics";
import { CacheStrategy } from "@/components/viz/domain/CacheStrategy";
import { CorsFlow } from "@/components/viz/domain/CorsFlow";
import { CspPolicy } from "@/components/viz/domain/CspPolicy";
import { CsrfAttackFlow } from "@/components/viz/domain/CsrfAttackFlow";
import { XssAttackFlow } from "@/components/viz/domain/XssAttackFlow";
import { ArrayVsLinkedList } from "@/components/viz/domain/ArrayVsLinkedList";
import { StackAndQueue } from "@/components/viz/domain/StackAndQueue";
import { HashMapInternal } from "@/components/viz/domain/HashMapInternal";
import { BSTOperations } from "@/components/viz/domain/BSTOperations";
import { GraphTraversal } from "@/components/viz/domain/GraphTraversal";
import { SortingCompare } from "@/components/viz/domain/SortingCompare";
import { TcpIpLayers } from "@/components/viz/domain/TcpIpLayers";
import { TcpUdpCompare } from "@/components/viz/domain/TcpUdpCompare";
import { Term } from "@/components/viz/primitives/Term";

export const mdxComponents: MDXComponents = {
  EventLoop,
  Tokenizer,
  ASTTree,
  BytecodeView,
  JITPipeline,
  HiddenClass,
  HttpRequestFlow,
  ICState,
  GCHeap,
  ExecutionContext,
  ScopeChain,
  Closure,
  Hoisting,
  ThisBinding,
  EventDelegation,
  EventFlow,
  EventLoopFull,
  FetchLifecycle,
  PromiseChain,
  AsyncAwait,
  AsyncErrorPattern,
  AsyncUtilPattern,
  PrototypeChain,
  CallbackPyramid,
  PromiseStateMachine,
  DebounceTimeline,
  DomCssomParser,
  DomTreeTraversal,
  NewOperatorFlow,
  ObserverPattern,
  InheritanceCompare,
  ModuleCompare,
  TreeShaking,
  TypeCoercion,
  EqualityCompare,
  MapVsObject,
  IteratorFlow,
  ProxyTrap,
  RafTimeline,
  RealtimeCompare,
  ConfusingPatterns,
  WorkerThread,
  TransferableCost,
  SecurityModel,
  SharedMemoryRace,
  StorageCompare,
  RenderTreeLayout,
  PaintRasterize,
  CompositorLayers,
  PipelineTrigger,
  PipelineMetrics,
  CacheStrategy,
  CorsFlow,
  CspPolicy,
  CsrfAttackFlow,
  XssAttackFlow,
  ArrayVsLinkedList,
  StackAndQueue,
  HashMapInternal,
  BSTOperations,
  GraphTraversal,
  SortingCompare,
  TcpIpLayers,
  TcpUdpCompare,
  Term,
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
