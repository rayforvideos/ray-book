"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

interface ThisStep {
  code: string;
  rule: "default" | "implicit" | "explicit" | "new" | "arrow";
  thisValue: string;
  result?: string;
  description: string;
}

const ruleStyles = {
  default: { label: "기본 바인딩", bg: "bg-stone-100 dark:bg-stone-800/40", text: "text-stone-700 dark:text-stone-200" },
  implicit: { label: "암시적 바인딩", bg: "bg-sky-50 dark:bg-sky-950/40", text: "text-sky-900 dark:text-sky-100" },
  explicit: { label: "명시적 바인딩", bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-900 dark:text-violet-100" },
  new: { label: "new 바인딩", bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-900 dark:text-emerald-100" },
  arrow: { label: "화살표 함수", bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-900 dark:text-amber-100" },
};

const presets: Record<string, ThisStep[]> = {
  "four-rules": [
    {
      code: `function greet() {
  console.log(this);
}
greet();`,
      rule: "default",
      thisValue: "window (strict: undefined)",
      result: "Window {...}",
      description: "아무 객체에도 속하지 않은 함수를 그냥 호출하면 기본 바인딩이 적용됩니다. 비엄격 모드에서는 window (또는 global), strict 모드에서는 undefined.",
    },
    {
      code: `const user = {
  name: "Ray",
  greet() {
    console.log(this.name);
  }
};
user.greet();`,
      rule: "implicit",
      thisValue: "user 객체",
      result: '"Ray"',
      description: "메서드로 호출하면 점 (.) 앞의 객체가 this가 됩니다. user.greet()에서 this는 user.",
    },
    {
      code: `function greet() {
  console.log(this.name);
}
const user = { name: "Ray" };

greet.call(user);
greet.apply(user);
greet.bind(user)();`,
      rule: "explicit",
      thisValue: "user 객체 (명시적 지정)",
      result: '"Ray" (세 번 모두)',
      description: "call, apply, bind로 this를 직접 지정합니다. 어떤 함수든 원하는 객체를 this로 강제할 수 있습니다.",
    },
    {
      code: `function User(name) {
  this.name = name;
}

const ray = new User("Ray");
console.log(ray.name);`,
      rule: "new",
      thisValue: "새로 생성된 객체",
      result: '"Ray"',
      description: "new로 호출하면 빈 객체가 생성되고, 그 객체가 this가 됩니다. 함수가 끝나면 this (새 객체) 가 자동 반환됩니다.",
    },
    {
      code: `const user = {
  name: "Ray",
  greet: () => {
    console.log(this.name);
  }
};
user.greet();`,
      rule: "arrow",
      thisValue: "상위 스코프의 this (window)",
      result: "undefined",
      description: "화살표 함수는 자신만의 this를 갖지 않습니다. 정의된 위치의 상위 스코프에서 this를 상속받습니다. 여기서는 전역의 this (window) 를 사용합니다.",
    },
  ],
  "arrow-vs-regular": [
    {
      code: `class Timer {
  constructor() {
    this.seconds = 0;
  }
  start() {
    setInterval(function() {
      this.seconds++;  // this = ?
    }, 1000);
  }
}`,
      rule: "default",
      thisValue: "window (Timer가 아님!)",
      result: "NaN (window.seconds가 없으므로)",
      description: "setInterval의 콜백은 일반 함수입니다. 호출 시 this가 window로 바인딩됩니다. Timer 인스턴스에 접근할 수 없습니다.",
    },
    {
      code: `class Timer {
  constructor() {
    this.seconds = 0;
  }
  start() {
    setInterval(() => {
      this.seconds++;  // this = Timer
    }, 1000);
  }
}`,
      rule: "arrow",
      thisValue: "Timer 인스턴스",
      result: "정상 동작 (1, 2, 3...)",
      description: "화살표 함수는 자신의 this가 없으므로 start() 메서드의 this를 상속받습니다. start()는 Timer 인스턴스에서 호출되므로 this = Timer 인스턴스. 이것이 콜백에서 화살표 함수를 쓰는 가장 큰 이유입니다.",
    },
  ],
};

interface ThisBindingProps {
  preset?: string;
}

export function ThisBinding({ preset = "four-rules" }: ThisBindingProps) {
  const data = presets[preset] ?? presets["four-rules"];

  const stepNodes = data.map((step, idx) => {
    const rs = ruleStyles[step.rule];
    return (
      <div key={idx} className="space-y-4">
        {/* Code */}
        <div>
          <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">코드</span>
          <div className="rounded-sm bg-surface p-3 font-mono text-[0.75rem] leading-relaxed whitespace-pre-wrap">
            {step.code}
          </div>
        </div>

        {/* Rule + this value */}
        <div className="flex gap-3">
          <div>
            <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">규칙</span>
            <span className={`inline-block px-2.5 py-1 font-mono text-[0.6875rem] font-bold ${rs.bg} ${rs.text}`}>
              {rs.label}
            </span>
          </div>
          <div className="flex-1">
            <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">this 값</span>
            <span className="inline-block px-2.5 py-1 font-mono text-[0.6875rem] text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40">
              {step.thisValue}
            </span>
          </div>
          {step.result && (
            <div>
              <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">결과</span>
              <span className="inline-block px-2.5 py-1 font-mono text-[0.6875rem] text-text bg-surface">
                {step.result}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
          {step.description}
        </div>
      </div>
    );
  });

  return <StepPlayer steps={stepNodes} />;
}
