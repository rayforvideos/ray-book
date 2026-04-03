"use client";

import { StepPlayer } from "../primitives/StepPlayer";

/* ─── Types ─── */

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  type: "subject" | "observer" | "channel";
  active?: boolean;
}

interface Connection {
  from: string;
  to: string;
  active?: boolean;
  label?: string;
}

interface Step {
  nodes: Node[];
  connections: Connection[];
  description: string;
  label: string;
  codeSnippet?: string;
}

/* ─── Node Graph Renderer ─── */

function NodeGraph({ nodes, connections }: { nodes: Node[]; connections: Connection[] }) {
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  const typeStyles: Record<string, { bg: string; border: string; text: string }> = {
    subject: {
      bg: "fill-amber-400 dark:fill-amber-500",
      border: "stroke-amber-600 dark:stroke-amber-400",
      text: "fill-amber-900 dark:fill-amber-100",
    },
    observer: {
      bg: "fill-sky-400 dark:fill-sky-500",
      border: "stroke-sky-600 dark:stroke-sky-400",
      text: "fill-sky-900 dark:fill-sky-100",
    },
    channel: {
      bg: "fill-violet-400 dark:fill-violet-500",
      border: "stroke-violet-600 dark:stroke-violet-400",
      text: "fill-violet-900 dark:fill-violet-100",
    },
  };

  return (
    <svg viewBox="0 0 400 200" className="w-full" style={{ maxHeight: 200 }}>
      {/* Connections */}
      {connections.map((conn, i) => {
        const from = nodeMap[conn.from];
        const to = nodeMap[conn.to];
        if (!from || !to) return null;
        return (
          <line
            key={i}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            className={conn.active
              ? "stroke-accent stroke-2 transition-all duration-300"
              : "stroke-border stroke-1 transition-all duration-300"}
            strokeDasharray={conn.active ? "none" : "4 4"}
          />
        );
      })}
      {/* Nodes */}
      {nodes.map((node) => {
        const style = typeStyles[node.type];
        return (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r={node.active ? 26 : 22}
              className={`${style.bg} ${style.border} stroke-2 transition-all duration-300`}
              opacity={node.active === false ? 0.3 : 1}
            />
            <text
              x={node.x}
              y={node.y + 1}
              textAnchor="middle"
              dominantBaseline="central"
              className={`${style.text} text-[0.55rem] font-bold`}
            >
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Legend ─── */

function Legend({ showChannel }: { showChannel?: boolean }) {
  const items = [
    { color: "bg-amber-400 dark:bg-amber-500", label: "Subject / Publisher" },
    { color: "bg-sky-400 dark:bg-sky-500", label: "Observer / Subscriber" },
    ...(showChannel ? [{ color: "bg-violet-400 dark:bg-violet-500", label: "Event Channel" }] : []),
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

/* ─── Basic Observer Steps ─── */

const basicSteps: Step[] = [
  {
    nodes: [
      { id: "subject", label: "Subject", x: 200, y: 100, type: "subject", active: true },
      { id: "obs1", label: "Obs A", x: 80, y: 40, type: "observer" },
      { id: "obs2", label: "Obs B", x: 80, y: 160, type: "observer" },
      { id: "obs3", label: "Obs C", x: 320, y: 100, type: "observer" },
    ],
    connections: [],
    description: "Subject(관찰 대상)와 Observer(관찰자) 3개가 있습니다. 아직 아무도 구독하지 않았습니다.",
    label: "초기 상태",
  },
  {
    nodes: [
      { id: "subject", label: "Subject", x: 200, y: 100, type: "subject", active: true },
      { id: "obs1", label: "Obs A", x: 80, y: 40, type: "observer", active: true },
      { id: "obs2", label: "Obs B", x: 80, y: 160, type: "observer" },
      { id: "obs3", label: "Obs C", x: 320, y: 100, type: "observer" },
    ],
    connections: [{ from: "subject", to: "obs1", active: true }],
    description: "Observer A가 Subject를 구독합니다. subject.subscribe(observerA) — Subject의 내부 리스트에 Observer A가 추가됩니다.",
    label: "구독: Observer A",
    codeSnippet: "subject.subscribe(observerA);",
  },
  {
    nodes: [
      { id: "subject", label: "Subject", x: 200, y: 100, type: "subject", active: true },
      { id: "obs1", label: "Obs A", x: 80, y: 40, type: "observer", active: true },
      { id: "obs2", label: "Obs B", x: 80, y: 160, type: "observer", active: true },
      { id: "obs3", label: "Obs C", x: 320, y: 100, type: "observer", active: true },
    ],
    connections: [
      { from: "subject", to: "obs1", active: true },
      { from: "subject", to: "obs2", active: true },
      { from: "subject", to: "obs3", active: true },
    ],
    description: "Observer B, C도 구독합니다. 이제 Subject의 구독자 목록에 3개의 Observer가 있습니다.",
    label: "전원 구독 완료",
    codeSnippet: "subject.subscribe(observerB);\nsubject.subscribe(observerC);",
  },
  {
    nodes: [
      { id: "subject", label: "Subject", x: 200, y: 100, type: "subject", active: true },
      { id: "obs1", label: "Obs A", x: 80, y: 40, type: "observer", active: true },
      { id: "obs2", label: "Obs B", x: 80, y: 160, type: "observer", active: true },
      { id: "obs3", label: "Obs C", x: 320, y: 100, type: "observer", active: true },
    ],
    connections: [
      { from: "subject", to: "obs1", active: true },
      { from: "subject", to: "obs2", active: true },
      { from: "subject", to: "obs3", active: true },
    ],
    description: "Subject의 상태가 변경됩니다! notify()가 호출되어 모든 Observer의 update() 메서드가 순차적으로 실행됩니다. Subject는 Observer가 누구인지, 몇 명인지 신경 쓰지 않습니다.",
    label: "상태 변경 → notify()",
    codeSnippet: "subject.notify(newState);\n// → observerA.update(newState)\n// → observerB.update(newState)\n// → observerC.update(newState)",
  },
  {
    nodes: [
      { id: "subject", label: "Subject", x: 200, y: 100, type: "subject", active: true },
      { id: "obs1", label: "Obs A", x: 80, y: 40, type: "observer" },
      { id: "obs2", label: "Obs B", x: 80, y: 160, type: "observer", active: true },
      { id: "obs3", label: "Obs C", x: 320, y: 100, type: "observer", active: true },
    ],
    connections: [
      { from: "subject", to: "obs2", active: true },
      { from: "subject", to: "obs3", active: true },
    ],
    description: "Observer A가 구독을 해제합니다. subject.unsubscribe(observerA) — 이후 notify()가 호출되어도 A에게는 알림이 가지 않습니다.",
    label: "구독 해제: Observer A",
    codeSnippet: "subject.unsubscribe(observerA);",
  },
  {
    nodes: [
      { id: "subject", label: "Subject", x: 200, y: 100, type: "subject", active: true },
      { id: "obs1", label: "Obs A", x: 80, y: 40, type: "observer" },
      { id: "obs2", label: "Obs B", x: 80, y: 160, type: "observer", active: true },
      { id: "obs3", label: "Obs C", x: 320, y: 100, type: "observer", active: true },
    ],
    connections: [
      { from: "subject", to: "obs2", active: true },
      { from: "subject", to: "obs3", active: true },
    ],
    description: "다시 상태가 변경됩니다. 이번에는 B와 C만 알림을 받습니다. 핵심: Subject와 Observer 사이의 결합은 subscribe/unsubscribe 인터페이스로만 이루어집니다.",
    label: "두 번째 notify()",
    codeSnippet: "subject.notify(anotherState);\n// → observerB.update(anotherState)\n// → observerC.update(anotherState)\n// observerA는 호출되지 않음",
  },
];

/* ─── Pub/Sub Steps ─── */

const pubsubSteps: Step[] = [
  {
    nodes: [
      { id: "pub", label: "Publisher", x: 60, y: 100, type: "subject", active: true },
      { id: "channel", label: "Event\nChannel", x: 200, y: 100, type: "channel", active: true },
      { id: "sub1", label: "Sub A", x: 340, y: 40, type: "observer" },
      { id: "sub2", label: "Sub B", x: 340, y: 160, type: "observer" },
    ],
    connections: [],
    description: "Pub/Sub 패턴에서는 Publisher와 Subscriber가 서로를 직접 알지 못합니다. 중간의 Event Channel(또는 Event Bus)이 메시지를 중계합니다.",
    label: "초기 상태",
  },
  {
    nodes: [
      { id: "pub", label: "Publisher", x: 60, y: 100, type: "subject", active: true },
      { id: "channel", label: "Event\nChannel", x: 200, y: 100, type: "channel", active: true },
      { id: "sub1", label: "Sub A", x: 340, y: 40, type: "observer", active: true },
      { id: "sub2", label: "Sub B", x: 340, y: 160, type: "observer" },
    ],
    connections: [{ from: "channel", to: "sub1", active: true }],
    description: "Subscriber A가 'userLogin' 이벤트를 구독합니다. Channel에 등록할 뿐, Publisher가 누구인지는 모릅니다.",
    label: "구독: 'userLogin'",
    codeSnippet: "eventBus.on('userLogin', subscriberA);",
  },
  {
    nodes: [
      { id: "pub", label: "Publisher", x: 60, y: 100, type: "subject", active: true },
      { id: "channel", label: "Event\nChannel", x: 200, y: 100, type: "channel", active: true },
      { id: "sub1", label: "Sub A", x: 340, y: 40, type: "observer", active: true },
      { id: "sub2", label: "Sub B", x: 340, y: 160, type: "observer", active: true },
    ],
    connections: [
      { from: "channel", to: "sub1", active: true },
      { from: "channel", to: "sub2", active: true },
    ],
    description: "Subscriber B도 같은 이벤트를 구독합니다. Publisher는 구독자가 몇 명인지, 누구인지 전혀 알 수 없습니다.",
    label: "구독: Sub B 추가",
    codeSnippet: "eventBus.on('userLogin', subscriberB);",
  },
  {
    nodes: [
      { id: "pub", label: "Publisher", x: 60, y: 100, type: "subject", active: true },
      { id: "channel", label: "Event\nChannel", x: 200, y: 100, type: "channel", active: true },
      { id: "sub1", label: "Sub A", x: 340, y: 40, type: "observer", active: true },
      { id: "sub2", label: "Sub B", x: 340, y: 160, type: "observer", active: true },
    ],
    connections: [
      { from: "pub", to: "channel", active: true },
      { from: "channel", to: "sub1", active: true },
      { from: "channel", to: "sub2", active: true },
    ],
    description: "Publisher가 'userLogin' 이벤트를 발행합니다. Channel이 해당 이벤트의 모든 구독자에게 메시지를 전달합니다. Publisher → Channel → Subscribers. 완전한 디커플링!",
    label: "이벤트 발행",
    codeSnippet: "eventBus.emit('userLogin', { userId: 42 });\n// Channel이 Sub A, Sub B에게 전달",
  },
  {
    nodes: [
      { id: "pub", label: "Publisher", x: 60, y: 100, type: "subject", active: true },
      { id: "channel", label: "Event\nChannel", x: 200, y: 100, type: "channel", active: true },
      { id: "sub1", label: "Sub A", x: 340, y: 40, type: "observer" },
      { id: "sub2", label: "Sub B", x: 340, y: 160, type: "observer", active: true },
    ],
    connections: [
      { from: "channel", to: "sub2", active: true },
    ],
    description: "Observer 패턴과의 차이: Observer에서는 Subject가 Observer 목록을 직접 관리합니다. Pub/Sub에서는 Channel이 중재자 역할을 하므로 Publisher와 Subscriber가 완전히 분리됩니다.",
    label: "Observer vs Pub/Sub",
    codeSnippet: "// Observer: subject.subscribe(observer)\n//   → Subject가 Observer를 직접 앎\n// Pub/Sub: bus.on('event', handler)\n//   → Publisher는 Subscriber를 모름",
  },
];

/* ─── Presets ─── */

const presets: Record<string, { steps: Step[]; showChannel: boolean }> = {
  basic: { steps: basicSteps, showChannel: false },
  pubsub: { steps: pubsubSteps, showChannel: true },
};

/* ─── Main Component ─── */

interface ObserverPubSubProps {
  preset?: string;
}

export function ObserverPubSub({ preset = "basic" }: ObserverPubSubProps) {
  const config = presets[preset] ?? presets["basic"];

  const stepNodes = config.steps.map((step, idx) => (
    <div key={idx} className="space-y-4">
      {step.label && (
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-bold text-accent">
            {step.label}
          </span>
          <span className="text-[0.6875rem] text-muted">
            {idx + 1} / {config.steps.length}
          </span>
        </div>
      )}

      <NodeGraph nodes={step.nodes} connections={step.connections} />

      <Legend showChannel={config.showChannel} />

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
