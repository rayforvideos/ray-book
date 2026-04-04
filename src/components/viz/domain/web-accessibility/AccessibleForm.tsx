"use client";

import { StepPlayer } from "../../primitives/StepPlayer";

/* ── Types ── */

interface FormStep {
  title: string;
  badge: string;
  badgeColor: string;
  content: React.ReactNode;
  description: string;
}

/* ── Shared styles ── */

const inputBase =
  "w-full border px-3 py-2 text-[0.8125rem] bg-white dark:bg-neutral-900 font-mono";
const labelBase = "block text-[0.8125rem] font-medium text-text mb-1";
const errorText = "text-[0.75rem] text-red-600 dark:text-red-400 mt-1";
const helpText = "text-[0.6875rem] text-muted mt-1";
const connectionLine =
  "border-l-2 border-dashed border-sky-400 dark:border-sky-500 pl-3 ml-1";

/* ── Step contents ── */

function BadForm() {
  return (
    <div className="space-y-4">
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2 text-[0.6875rem] text-red-700 dark:text-red-300">
        ❌ 접근성 문제: label 없음, placeholder만 사용, 에러 연결 없음
      </div>
      <div className="space-y-3 p-4 border border-border">
        <div>
          <input
            type="text"
            placeholder="이름을 입력하세요"
            className={`${inputBase} border-border`}
            readOnly
            tabIndex={-1}
          />
          <div className="text-[0.6875rem] text-muted mt-0.5 italic">
            → 스크린 리더: &quot;편집 가능&quot; (무엇을 입력해야 하는지 알 수 없음)
          </div>
        </div>
        <div>
          <input
            type="email"
            placeholder="이메일"
            className={`${inputBase} border-red-400`}
            readOnly
            tabIndex={-1}
          />
          <div className="text-red-600 dark:text-red-400 text-[0.75rem] mt-1">
            올바른 이메일을 입력하세요
          </div>
          <div className="text-[0.6875rem] text-muted mt-0.5 italic">
            → 에러 메시지가 input과 연결되지 않아 스크린 리더가 읽지 못함
          </div>
        </div>
      </div>
    </div>
  );
}

function GoodForm() {
  return (
    <div className="space-y-4">
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-3 py-2 text-[0.6875rem] text-emerald-700 dark:text-emerald-300">
        ✅ label + for/id 연결, aria-describedby로 도움말 연결
      </div>
      <div className="space-y-3 p-4 border border-border">
        <div>
          <div className={connectionLine}>
            <label className={labelBase}>
              이름
              <span className="text-[0.625rem] text-muted ml-1">
                (htmlFor=&quot;name&quot;)
              </span>
            </label>
            <input
              type="text"
              className={`${inputBase} border-border`}
              placeholder=""
              readOnly
              tabIndex={-1}
            />
            <div className="text-[0.625rem] text-sky-600 dark:text-sky-400 mt-0.5">
              ↑ label과 input이 for/id로 연결됨
            </div>
          </div>
          <div className="text-[0.6875rem] text-muted mt-0.5 italic">
            → 스크린 리더: &quot;이름, 편집 가능&quot;
          </div>
        </div>
        <div>
          <div className={connectionLine}>
            <label className={labelBase}>이메일</label>
            <input
              type="email"
              className={`${inputBase} border-border`}
              readOnly
              tabIndex={-1}
              aria-describedby="email-help"
            />
            <div id="email-help" className={helpText}>
              예: user@example.com
              <span className="text-[0.625rem] text-sky-600 dark:text-sky-400 ml-1">
                ← aria-describedby
              </span>
            </div>
          </div>
          <div className="text-[0.6875rem] text-muted mt-0.5 italic">
            → 스크린 리더: &quot;이메일, 편집 가능. 예: user@example.com&quot;
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorForm() {
  return (
    <div className="space-y-4">
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2 text-[0.6875rem] text-amber-700 dark:text-amber-300">
        ⚠️ aria-invalid + aria-describedby로 에러 상태와 메시지 연결
      </div>
      <div className="space-y-3 p-4 border border-border">
        <div>
          <div className={connectionLine}>
            <label className={labelBase}>이름</label>
            <input
              type="text"
              className={`${inputBase} border-red-400 bg-red-50 dark:bg-red-950/20`}
              readOnly
              tabIndex={-1}
              aria-invalid="true"
              aria-describedby="name-error"
            />
            <div className="flex items-start gap-1 mt-1">
              <span className="text-red-500 text-[0.75rem]">✕</span>
              <div id="name-error" className={errorText}>
                이름을 입력해주세요
                <span className="text-[0.625rem] text-sky-600 dark:text-sky-400 ml-1">
                  ← aria-describedby로 연결
                </span>
              </div>
            </div>
          </div>
          <div className="text-[0.6875rem] text-muted mt-1 italic">
            → 스크린 리더: &quot;이름, 편집 가능, 잘못됨. 이름을 입력해주세요&quot;
          </div>
        </div>

        <div className="bg-surface border border-border px-3 py-2 text-[0.75rem] font-mono space-y-1">
          <div className="text-muted">{"// HTML 구조"}</div>
          <div>
            <span className="text-violet-600 dark:text-violet-400">&lt;input</span>
            {" "}
            <span className="text-amber-600 dark:text-amber-400">aria-invalid</span>
            =&quot;true&quot;
          </div>
          <div>
            {"       "}
            <span className="text-amber-600 dark:text-amber-400">aria-describedby</span>
            =&quot;name-error&quot;
            <span className="text-violet-600 dark:text-violet-400"> /&gt;</span>
          </div>
          <div>
            <span className="text-violet-600 dark:text-violet-400">&lt;p</span>
            {" "}
            <span className="text-amber-600 dark:text-amber-400">id</span>
            =&quot;name-error&quot;
            <span className="text-violet-600 dark:text-violet-400">&gt;</span>
            이름을 입력해주세요
            <span className="text-violet-600 dark:text-violet-400">&lt;/p&gt;</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveRegionForm() {
  return (
    <div className="space-y-4">
      <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 px-3 py-2 text-[0.6875rem] text-violet-700 dark:text-violet-300">
        📢 aria-live로 동적 에러를 스크린 리더에 즉시 알림
      </div>
      <div className="space-y-3 p-4 border border-border">
        <div className="space-y-2">
          <label className={labelBase}>비밀번호</label>
          <input
            type="password"
            className={`${inputBase} border-border`}
            readOnly
            tabIndex={-1}
            value="abc"
          />
        </div>

        {/* Simulated live region */}
        <div className="border-2 border-dashed border-violet-400 dark:border-violet-500 px-3 py-2">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="px-1.5 py-0.5 text-[0.5625rem] font-mono font-bold bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300">
              aria-live=&quot;polite&quot;
            </span>
            <span className="text-[0.6875rem] text-muted">→ 동적으로 추가된 에러</span>
          </div>
          <div className={errorText}>
            비밀번호는 최소 8자 이상이어야 합니다
          </div>
          <div className="text-[0.6875rem] text-muted mt-1 italic">
            → 스크린 리더가 자동으로 읽어줌: &quot;비밀번호는 최소 8자 이상이어야 합니다&quot;
          </div>
        </div>

        <div className="bg-surface border border-border px-3 py-2 text-[0.75rem] font-mono space-y-1">
          <div className="text-muted">{"// aria-live 사용법"}</div>
          <div>
            <span className="text-violet-600 dark:text-violet-400">&lt;div</span>
            {" "}
            <span className="text-amber-600 dark:text-amber-400">aria-live</span>
            =&quot;polite&quot;
            <span className="text-violet-600 dark:text-violet-400">&gt;</span>
          </div>
          <div>
            {"  "}
            <span className="text-muted">{"// 이 안의 내용이 변경되면"}</span>
          </div>
          <div>
            {"  "}
            <span className="text-muted">{"// 스크린 리더가 자동으로 읽어줌"}</span>
          </div>
          <div>
            {"  "}{"{"}에러 메시지{"}"}
          </div>
          <div>
            <span className="text-violet-600 dark:text-violet-400">&lt;/div&gt;</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Steps ── */

const formSteps: FormStep[] = [
  {
    title: "접근성 없는 폼",
    badge: "BAD",
    badgeColor: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300",
    content: <BadForm />,
    description:
      "placeholder만 있으면 입력을 시작하는 순간 힌트가 사라집니다. label이 없으면 스크린 리더가 이 입력 필드의 용도를 알 수 없습니다.",
  },
  {
    title: "label + aria-describedby 연결",
    badge: "GOOD",
    badgeColor: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
    content: <GoodForm />,
    description:
      "label의 for 속성과 input의 id를 일치시키면 스크린 리더가 '이름, 편집 가능'이라고 읽어줍니다. 클릭 영역도 label까지 확장됩니다.",
  },
  {
    title: "에러 상태 전달",
    badge: "ERROR",
    badgeColor: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
    content: <ErrorForm />,
    description:
      "aria-invalid=\"true\"는 입력값이 잘못되었음을 전달하고, aria-describedby는 에러 메시지를 input과 연결합니다. 스크린 리더가 에러 이유까지 알려줍니다.",
  },
  {
    title: "aria-live로 동적 알림",
    badge: "LIVE",
    badgeColor: "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300",
    content: <LiveRegionForm />,
    description:
      "aria-live=\"polite\"는 현재 읽고 있는 내용이 끝난 후, \"assertive\"는 즉시 새로운 콘텐츠를 읽어줍니다. 실시간 유효성 검사 에러에 적합합니다.",
  },
];

/* ── Main ── */

export function AccessibleForm() {
  const stepNodes = formSteps.map((step, i) => (
    <div key={i} className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`px-2 py-0.5 font-mono text-[0.625rem] font-bold ${step.badgeColor}`}>
          {step.badge}
        </span>
        <span className="text-[0.8125rem] font-medium text-text">
          {step.title}
        </span>
      </div>

      {step.content}

      <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
        {step.description}
      </div>
    </div>
  ));

  return <StepPlayer steps={stepNodes} />;
}
