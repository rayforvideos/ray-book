"use client";

import { StepPlayer } from "../primitives/StepPlayer";

interface HCState {
  name: string;
  properties: string[];
  offsets: Record<string, number>;
}

interface HCStep {
  code: string;
  maps: HCState[];
  transitions: string[];
  activeMap: number;
  description: string;
}

const presets: Record<string, HCStep[]> = {
  "shape-transition": [
    {
      code: "const obj = {};",
      maps: [{ name: "Map0", properties: [], offsets: {} }],
      transitions: [],
      activeMap: 0,
      description: "빈 객체가 생성됩니다. V8은 이 객체에 Map0 (빈 Hidden Class) 을 부여합니다.",
    },
    {
      code: 'obj.x = 1;',
      maps: [
        { name: "Map0", properties: [], offsets: {} },
        { name: "Map1", properties: ["x"], offsets: { x: 0 } },
      ],
      transitions: ["x"],
      activeMap: 1,
      description: "프로퍼티 x를 추가하면 새로운 Map1이 생성됩니다. Map0에는 \"x를 추가하면 Map1로 전이\"라는 기록이 남습니다.",
    },
    {
      code: 'obj.y = 2;',
      maps: [
        { name: "Map0", properties: [], offsets: {} },
        { name: "Map1", properties: ["x"], offsets: { x: 0 } },
        { name: "Map2", properties: ["x", "y"], offsets: { x: 0, y: 1 } },
      ],
      transitions: ["x", "y"],
      activeMap: 2,
      description: "프로퍼티 y를 추가하면 Map2가 생성됩니다. 이제 obj의 Hidden Class는 Map2이고, x는 오프셋 0, y는 오프셋 1에 있음을 알고 있습니다.",
    },
    {
      code: "const obj2 = {}; obj2.x = 3; obj2.y = 4;",
      maps: [
        { name: "Map0", properties: [], offsets: {} },
        { name: "Map1", properties: ["x"], offsets: { x: 0 } },
        { name: "Map2", properties: ["x", "y"], offsets: { x: 0, y: 1 } },
      ],
      transitions: ["x", "y"],
      activeMap: 2,
      description: "같은 순서로 프로퍼티를 추가하면 기존 전이 체인을 재사용합니다. obj2도 Map2를 공유합니다 — 새 Map을 만들 필요가 없습니다.",
    },
  ],
  "shape-diverge": [
    {
      code: "const a = {}; a.x = 1; a.y = 2;",
      maps: [
        { name: "Map0", properties: [], offsets: {} },
        { name: "Map1", properties: ["x"], offsets: { x: 0 } },
        { name: "Map2", properties: ["x", "y"], offsets: { x: 0, y: 1 } },
      ],
      transitions: ["x", "y"],
      activeMap: 2,
      description: "객체 a는 x → y 순서로 프로퍼티를 추가하여 Map2에 도달합니다.",
    },
    {
      code: "const b = {}; b.y = 1; b.x = 2;",
      maps: [
        { name: "Map0", properties: [], offsets: {} },
        { name: "Map3", properties: ["y"], offsets: { y: 0 } },
        { name: "Map4", properties: ["y", "x"], offsets: { y: 0, x: 1 } },
      ],
      transitions: ["y", "x"],
      activeMap: 2,
      description: "객체 b는 y → x 순서로 추가합니다. 같은 프로퍼티지만 순서가 다르므로 완전히 다른 Map 체인 (Map3 → Map4) 이 생성됩니다. a와 b는 Hidden Class를 공유하지 못합니다.",
    },
  ],
};

interface HiddenClassProps {
  preset?: string;
}

export function HiddenClass({ preset = "shape-transition" }: HiddenClassProps) {
  const data = presets[preset] ?? presets["shape-transition"];

  const stepNodes = data.map((step, idx) => (
    <div key={idx} className="space-y-4">
      <div>
        <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
          코드
        </span>
        <div className="rounded-sm bg-surface p-3 font-mono text-[0.8125rem]">
          {step.code}
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
          Hidden Class 전이
        </span>
        <div className="flex items-start gap-2 overflow-x-auto py-1">
          {step.maps.map((map, i) => (
            <div key={i} className="flex items-start gap-2">
              <div
                className={`min-w-[7rem] border px-3 py-2 transition-all ${
                  i === step.activeMap
                    ? "border-accent/40 bg-amber-50 ring-1 ring-accent/30 dark:bg-amber-950/40 dark:border-accent/30 dark:ring-accent/20"
                    : "border-border bg-surface"
                }`}
              >
                <span className="block font-mono text-[0.6875rem] font-bold text-text">
                  {map.name}
                </span>
                {map.properties.length > 0 ? (
                  <div className="mt-1.5 space-y-0.5">
                    {map.properties.map((prop) => (
                      <div
                        key={prop}
                        className="flex items-baseline justify-between gap-3 font-mono text-[0.625rem]"
                      >
                        <span className="text-sky-950 dark:text-sky-100">{prop}</span>
                        <span className="text-muted">@{map.offsets[prop]}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="mt-1 block text-[0.625rem] text-muted/50">(empty)</span>
                )}
              </div>
              {i < step.maps.length - 1 && (
                <div className="flex flex-col items-center justify-center pt-3">
                  <span className="text-[0.5625rem] text-muted">+{step.transitions[i]}</span>
                  <span className="text-muted">→</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
