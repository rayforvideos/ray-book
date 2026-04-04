"use client";

import { StepPlayer } from "../../primitives/StepPlayer";
import { AnimatedBox } from "../../primitives/AnimatedBox";

interface Token {
  type: string;
  value: string;
  description: string;
}

const tokenStyles: Record<string, { badge: string; label: string }> = {
  keyword: {
    badge:
      "border-violet-400 bg-violet-200 text-violet-900 dark:border-violet-500 dark:bg-violet-900/50 dark:text-violet-100",
    label: "키워드",
  },
  identifier: {
    badge:
      "border-sky-400 bg-sky-200 text-sky-900 dark:border-sky-500 dark:bg-sky-900/50 dark:text-sky-100",
    label: "식별자",
  },
  operator: {
    badge:
      "border-amber-400 bg-amber-300 text-amber-950 dark:border-amber-500 dark:bg-amber-900/50 dark:text-amber-100",
    label: "연산자",
  },
  literal: {
    badge:
      "border-emerald-400 bg-emerald-200 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-900/50 dark:text-emerald-100",
    label: "리터럴",
  },
  punctuation: {
    badge:
      "border-stone-400 bg-stone-300 text-stone-900 dark:border-stone-500 dark:bg-stone-700/50 dark:text-stone-200",
    label: "구분자",
  },
  string: {
    badge:
      "border-rose-400 bg-rose-200 text-rose-900 dark:border-rose-500 dark:bg-rose-900/50 dark:text-rose-100",
    label: "문자열",
  },
};

const presets: Record<string, { code: string; tokens: Token[] }> = {
  "let-hello": {
    code: 'let message = "hello";',
    tokens: [
      { type: "keyword", value: "let", description: "변수 선언 키워드. 예약어(reserved word)로, 식별자로 사용할 수 없습니다." },
      { type: "identifier", value: "message", description: "변수 이름. 엔진은 이것이 키워드가 아님을 확인한 뒤 식별자(identifier)로 분류합니다." },
      { type: "operator", value: "=", description: "할당 연산자. '=='나 '=>'가 이어지는지 다음 문자를 미리 확인(lookahead)합니다." },
      { type: "string", value: '"hello"', description: '문자열 리터럴. 여는 따옴표를 만나면 닫는 따옴표가 나올 때까지 모든 문자를 하나의 토큰으로 모읍니다.' },
      { type: "punctuation", value: ";", description: "세미콜론. 문(statement)의 끝을 나타냅니다." },
    ],
  },
  "function-add": {
    code: "function add(a, b) { return a + b; }",
    tokens: [
      { type: "keyword", value: "function", description: "함수 선언 키워드. 뒤에 식별자가 와야 한다는 것을 파서에게 알립니다." },
      { type: "identifier", value: "add", description: "함수 이름. 현재 스코프에 바인딩됩니다." },
      { type: "punctuation", value: "(", description: "여는 괄호. 매개변수 목록의 시작을 나타냅니다." },
      { type: "identifier", value: "a", description: "첫 번째 매개변수 이름." },
      { type: "punctuation", value: ",", description: "쉼표. 매개변수를 구분합니다." },
      { type: "identifier", value: "b", description: "두 번째 매개변수 이름." },
      { type: "punctuation", value: ")", description: "닫는 괄호. 매개변수 목록의 끝." },
      { type: "punctuation", value: "{", description: "여는 중괄호. 함수 본문의 시작." },
      { type: "keyword", value: "return", description: "반환 키워드. 뒤에 오는 표현식의 값을 함수의 결과로 반환합니다." },
      { type: "identifier", value: "a", description: "변수 참조. 매개변수 a의 값을 읽습니다." },
      { type: "operator", value: "+", description: "덧셈 연산자. '++'나 '+='가 아님을 확인합니다." },
      { type: "identifier", value: "b", description: "변수 참조. 매개변수 b의 값을 읽습니다." },
      { type: "punctuation", value: ";", description: "세미콜론. return 문의 끝." },
      { type: "punctuation", value: "}", description: "닫는 중괄호. 함수 본문의 끝." },
    ],
  },
};

interface TokenizerProps {
  preset?: string;
}

export function Tokenizer({ preset = "let-hello" }: TokenizerProps) {
  const data = presets[preset] ?? presets["let-hello"];

  const steps = data.tokens.map((token, stepIndex) => {
    const visibleTokens = data.tokens.slice(0, stepIndex + 1);
    const style = tokenStyles[token.type] ?? tokenStyles.punctuation;
    return (
      <div key={stepIndex} className="space-y-4">
        <div className="font-mono text-[0.8125rem] leading-relaxed">
          <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
            소스 코드
          </span>
          <div className="rounded-sm bg-surface p-3">
            {renderHighlightedCode(data.code, data.tokens, stepIndex)}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
            토큰 스트림
          </span>
          <div className="flex flex-wrap gap-1.5">
            {visibleTokens.map((t, i) => {
              const s = tokenStyles[t.type] ?? tokenStyles.punctuation;
              return (
                <AnimatedBox key={i} preset="scaleIn">
                  <span
                    className={`inline-flex items-baseline gap-1 border px-2 py-0.5 font-mono text-[0.6875rem] ${s.badge} ${i === stepIndex ? "ring-1 ring-accent/40" : ""}`}
                  >
                    <span className="font-semibold">{s.label}</span>
                    <span className="font-semibold">{t.value}</span>
                  </span>
                </AnimatedBox>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
          {token.description}
        </div>
      </div>
    );
  });

  return <StepPlayer steps={steps} />;
}

function renderHighlightedCode(
  code: string,
  tokens: Token[],
  activeIndex: number
) {
  const parts: React.ReactNode[] = [];
  let pos = 0;

  tokens.forEach((token, i) => {
    const idx = code.indexOf(token.value, pos);
    if (idx > pos) {
      parts.push(
        <span key={`gap-${i}`} className="text-muted/40">
          {code.slice(pos, idx)}
        </span>
      );
    }

    const isActive = i === activeIndex;
    const isPast = i < activeIndex;
    const style = tokenStyles[token.type] ?? tokenStyles.punctuation;

    parts.push(
      <span
        key={`token-${i}`}
        className={
          isActive
            ? `rounded-sm px-0.5 ${style.badge}`
            : isPast
              ? "text-text"
              : "text-muted/30"
        }
      >
        {token.value}
      </span>
    );

    pos = idx + token.value.length;
  });

  if (pos < code.length) {
    parts.push(
      <span key="rest" className="text-muted/30">
        {code.slice(pos)}
      </span>
    );
  }

  return parts;
}
