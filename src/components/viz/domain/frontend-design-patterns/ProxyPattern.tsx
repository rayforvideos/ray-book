"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ─── Types ─── */

interface Actor {
  id: string;
  label: string;
  x: number;
  y: number;
  type: "client" | "proxy" | "target";
  note?: string;
}

interface Message {
  from: string;
  to: string;
  label: string;
  active?: boolean;
  blocked?: boolean;
}

interface Step {
  actors: Actor[];
  messages: Message[];
  label: string;
  description: string;
  codeSnippet?: string;
  trapName?: string;
}

/* ─── Sequence Diagram Renderer ─── */

const typeStyles: Record<string, { bg: string; border: string; text: string }> = {
  client: {
    bg: "fill-stone-100 dark:fill-stone-800",
    border: "stroke-stone-400 dark:stroke-stone-500",
    text: "fill-stone-700 dark:fill-stone-300",
  },
  proxy: {
    bg: "fill-violet-50 dark:fill-violet-950",
    border: "stroke-violet-500 dark:stroke-violet-400",
    text: "fill-violet-800 dark:fill-violet-200",
  },
  target: {
    bg: "fill-amber-50 dark:fill-amber-950",
    border: "stroke-amber-500 dark:stroke-amber-400",
    text: "fill-amber-800 dark:fill-amber-200",
  },
};

function SequenceDiagram({ actors, messages }: { actors: Actor[]; messages: Message[] }) {
  const actorMap = Object.fromEntries(actors.map((a) => [a.id, a]));
  const BOX_W = 80;
  const BOX_H = 36;

  return (
    <svg viewBox="0 0 400 200" className="w-full" style={{ maxHeight: 200 }}>
      <defs>
        <marker id="proxy-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" className="fill-violet-500 dark:fill-violet-400" />
        </marker>
        <marker id="proxy-arrow-muted" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" className="fill-muted/40" />
        </marker>
        <marker id="proxy-arrow-red" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" className="fill-rose-500 dark:fill-rose-400" />
        </marker>
      </defs>

      {/* Actor boxes */}
      {actors.map((actor) => {
        const style = typeStyles[actor.type];
        return (
          <g key={actor.id}>
            {/* Lifeline */}
            <line
              x1={actor.x} y1={BOX_H + 4}
              x2={actor.x} y2={200}
              className="stroke-border stroke-1" strokeDasharray="4 3"
            />
            {/* Box */}
            <rect
              x={actor.x - BOX_W / 2} y={0}
              width={BOX_W} height={BOX_H} rx={6}
              className={`${style.bg} ${style.border} stroke-[1.5]`}
            />
            <text
              x={actor.x} y={BOX_H / 2 + 1}
              textAnchor="middle" dominantBaseline="central"
              className={`${style.text} text-[0.6rem] font-bold`}
            >
              {actor.label}
            </text>
            {/* Note */}
            {actor.note && (
              <text
                x={actor.x} y={BOX_H + 16}
                textAnchor="middle"
                className="fill-muted text-[0.4rem] font-mono"
              >
                {actor.note}
              </text>
            )}
          </g>
        );
      })}

      {/* Messages */}
      {messages.map((msg, i) => {
        const from = actorMap[msg.from];
        const to = actorMap[msg.to];
        if (!from || !to) return null;
        const y = 60 + i * 36;
        const isRight = to.x > from.x;
        const markerEnd = msg.blocked
          ? "url(#proxy-arrow-red)"
          : msg.active
            ? "url(#proxy-arrow)"
            : "url(#proxy-arrow-muted)";

        return (
          <g key={i}>
            <line
              x1={from.x + (isRight ? 6 : -6)}
              y1={y}
              x2={to.x + (isRight ? -6 : 6)}
              y2={y}
              className={
                msg.blocked
                  ? "stroke-rose-500 dark:stroke-rose-400 stroke-[1.5]"
                  : msg.active
                    ? "stroke-violet-500 dark:stroke-violet-400 stroke-[1.5]"
                    : "stroke-muted/40 stroke-1"
              }
              strokeDasharray={msg.active || msg.blocked ? "none" : "4 4"}
              markerEnd={markerEnd}
            />
            <text
              x={(from.x + to.x) / 2}
              y={y - 6}
              textAnchor="middle"
              className={`text-[0.45rem] font-mono ${
                msg.blocked
                  ? "fill-rose-600 dark:fill-rose-400 font-bold"
                  : msg.active
                    ? "fill-violet-600 dark:fill-violet-400"
                    : "fill-muted/60"
              }`}
            >
              {msg.label}
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
    { color: "bg-stone-400", label: "Client" },
    { color: "bg-violet-400", label: "Proxy" },
    { color: "bg-amber-400", label: "Target" },
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

/* ─── Steps: Validation Proxy ─── */

const actors: Actor[] = [
  { id: "client", label: "Client", x: 60, y: 0, type: "client" },
  { id: "proxy", label: "Proxy", x: 200, y: 0, type: "proxy" },
  { id: "target", label: "Target", x: 340, y: 0, type: "target" },
];

const validationSteps: Step[] = [
  {
    actors,
    messages: [],
    label: "구조 파악",
    description: "Client는 Target 객체에 직접 접근하지 않고, Proxy를 통해 접근합니다. Proxy는 Client의 요청을 가로채서 검증, 변환, 캐싱 등의 작업을 수행한 후 Target에 전달합니다.",
    codeSnippet: "const user = { name: 'Kim', age: 25 };\n\nconst proxy = new Proxy(user, {\n  set(target, prop, value) {\n    // 여기서 가로채기!\n  }\n});",
  },
  {
    actors: actors.map((a) => ({
      ...a,
      note: a.id === "proxy" ? "set trap 발동" : undefined,
    })),
    messages: [
      { from: "client", to: "proxy", label: "proxy.age = 30", active: true },
      { from: "proxy", to: "target", label: "target.age = 30", active: true },
    ],
    trapName: "set",
    label: "set 트랩: 유효한 값",
    description: "Client가 proxy.age = 30을 실행합니다. Proxy의 set 트랩이 발동되어 값을 검증합니다. 30은 유효한 나이이므로, Target에 그대로 전달합니다.",
    codeSnippet: "set(target, prop, value) {\n  if (prop === 'age') {\n    if (typeof value !== 'number' || value < 0) {\n      throw new TypeError('age must be a positive number');\n    }\n  }\n  target[prop] = value; // Target에 전달\n  return true;\n}",
  },
  {
    actors: actors.map((a) => ({
      ...a,
      note: a.id === "proxy" ? "set trap → 거부!" : undefined,
    })),
    messages: [
      { from: "client", to: "proxy", label: "proxy.age = -5", active: true },
      { from: "proxy", to: "proxy", label: "TypeError!", blocked: true },
    ],
    trapName: "set",
    label: "set 트랩: 유효하지 않은 값",
    description: "Client가 proxy.age = -5를 실행합니다. Proxy의 set 트랩이 값을 검증하고 거부합니다. Target에는 전달되지 않습니다. 원본 객체가 보호됩니다.",
    codeSnippet: "proxy.age = -5;\n// → TypeError: age must be a positive number\n// Target의 age는 여전히 30",
  },
  {
    actors: actors.map((a) => ({
      ...a,
      note: a.id === "proxy" ? "get trap 발동" : undefined,
    })),
    messages: [
      { from: "client", to: "proxy", label: "proxy.name", active: true },
      { from: "proxy", to: "target", label: "target.name", active: true },
    ],
    trapName: "get",
    label: "get 트랩: 읽기 가로채기",
    description: "Client가 proxy.name을 읽으려 합니다. Proxy의 get 트랩이 발동됩니다. 접근 로그를 남기거나, 기본값을 반환하거나, 지연 로딩을 수행할 수 있습니다.",
    codeSnippet: "get(target, prop) {\n  console.log(`읽기: ${prop}`);\n  if (prop in target) {\n    return target[prop];\n  }\n  return `${prop}은(는) 없는 속성입니다`;\n}",
  },
  {
    actors: actors.map((a) => ({
      ...a,
      note: a.id === "proxy" ? "get trap → 기본값" : undefined,
    })),
    messages: [
      { from: "client", to: "proxy", label: "proxy.email", active: true },
      { from: "proxy", to: "client", label: "'email은(는) 없는 속성입니다'", active: true },
    ],
    trapName: "get",
    label: "get 트랩: 존재하지 않는 속성",
    description: "존재하지 않는 속성에 접근하면 undefined 대신 의미 있는 메시지를 반환합니다. Target을 건드리지 않고 Proxy 레이어에서 처리합니다.",
    codeSnippet: "proxy.email;\n// 로그: '읽기: email'\n// 반환: 'email은(는) 없는 속성입니다'\n// (undefined 대신 의미 있는 값)",
  },
];

/* ─── Steps: Caching Proxy ─── */

const cachingSteps: Step[] = [
  {
    actors: [
      { id: "client", label: "Client", x: 60, y: 0, type: "client" },
      { id: "proxy", label: "Cache Proxy", x: 200, y: 0, type: "proxy" },
      { id: "target", label: "API Server", x: 340, y: 0, type: "target" },
    ],
    messages: [],
    label: "캐싱 프록시 구조",
    description: "API 호출을 캐싱하는 Proxy입니다. 같은 요청이 반복되면 API를 다시 호출하지 않고 캐시된 결과를 반환합니다.",
    codeSnippet: "function createCachingProxy(apiClient) {\n  const cache = new Map();\n  return new Proxy(apiClient, {\n    get(target, method) {\n      return async (...args) => {\n        const key = `${method}:${JSON.stringify(args)}`;\n        if (cache.has(key)) return cache.get(key);\n        const result = await target[method](...args);\n        cache.set(key, result);\n        return result;\n      };\n    }\n  });\n}",
  },
  {
    actors: [
      { id: "client", label: "Client", x: 60, y: 0, type: "client" },
      { id: "proxy", label: "Cache Proxy", x: 200, y: 0, type: "proxy", note: "캐시 MISS" },
      { id: "target", label: "API Server", x: 340, y: 0, type: "target" },
    ],
    messages: [
      { from: "client", to: "proxy", label: "getUser(42)", active: true },
      { from: "proxy", to: "target", label: "fetch('/api/users/42')", active: true },
    ],
    label: "첫 요청: 캐시 MISS",
    description: "첫 번째 getUser(42) 호출. 캐시에 데이터가 없으므로 API 서버에 실제 요청을 보냅니다. 응답을 받으면 캐시에 저장합니다.",
    codeSnippet: "const api = createCachingProxy(apiClient);\nconst user = await api.getUser(42);\n// → 캐시 MISS → API 호출 → 캐시 저장",
  },
  {
    actors: [
      { id: "client", label: "Client", x: 60, y: 0, type: "client" },
      { id: "proxy", label: "Cache Proxy", x: 200, y: 0, type: "proxy", note: "캐시 HIT ⚡" },
      { id: "target", label: "API Server", x: 340, y: 0, type: "target" },
    ],
    messages: [
      { from: "client", to: "proxy", label: "getUser(42)", active: true },
      { from: "proxy", to: "client", label: "캐시된 결과 반환", active: true },
    ],
    label: "두 번째 요청: 캐시 HIT",
    description: "같은 getUser(42)를 다시 호출합니다. 캐시에 결과가 있으므로 API 서버에 요청하지 않고 즉시 반환합니다. Target은 이 요청을 알지 못합니다.",
    codeSnippet: "const user = await api.getUser(42);\n// → 캐시 HIT → 즉시 반환 (API 호출 없음!)",
  },
];

/* ─── Presets ─── */

const presets: Record<string, Step[]> = {
  validation: validationSteps,
  caching: cachingSteps,
};

/* ─── Main Component ─── */

interface ProxyPatternProps {
  preset?: string;
}

export function ProxyPattern({ preset = "validation" }: ProxyPatternProps) {
  const steps = presets[preset] ?? presets["validation"];

  const stepNodes = steps.map((step, idx) => (
    <div key={idx} className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-bold text-accent">{step.label}</span>
        <span className="text-[0.6875rem] text-muted">{idx + 1} / {steps.length}</span>
      </div>

      {step.trapName && (
        <div className="inline-block rounded bg-violet-100 px-2 py-0.5 font-mono text-xs text-violet-800 dark:bg-violet-900 dark:text-violet-200">
          trap: {step.trapName}()
        </div>
      )}

      <SequenceDiagram actors={step.actors} messages={step.messages} />
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
