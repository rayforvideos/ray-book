"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TermDef {
  title: string;
  description: string;
  emoji: string;
  analogy?: string;
}

const terms: Record<string, TermDef> = {
  hashmap: {
    title: "해시맵",
    emoji: "🗄️",
    description: "키-값 쌍을 저장하는 자료구조. 키를 해시 함수에 넣으면 값이 저장된 위치를 바로 알 수 있습니다.",
    analogy: "도서관의 색인 카드와 비슷합니다 — 책 제목 (키) 을 알면 서가 위치 (값) 를 바로 찾을 수 있죠.",
  },
  "call-stack": {
    title: "콜 스택",
    emoji: "📚",
    description: "함수 호출을 추적하는 LIFO 자료구조. 함수가 호출되면 스택에 쌓이고, 반환되면 빠집니다.",
    analogy: "접시 쌓기와 같습니다 — 마지막에 올린 접시를 먼저 꺼내야 합니다.",
  },
  heap: {
    title: "힙",
    emoji: "🏗️",
    description: "객체와 동적 데이터가 저장되는 비정형 메모리 영역. 스택과 달리 순서 없이 할당/해제됩니다.",
    analogy: "넓은 창고와 비슷합니다 — 물건을 아무 빈 자리에 놓고, 위치를 메모해둡니다.",
  },
  "garbage-collection": {
    title: "가비지 컬렉션",
    emoji: "🧹",
    description: "더 이상 참조되지 않는 객체의 메모리를 자동으로 회수하는 메커니즘.",
    analogy: "도서관 사서가 주기적으로 아무도 빌리지 않는 책을 정리하는 것과 비슷합니다.",
  },
  ast: {
    title: "추상 구문 트리",
    emoji: "🌳",
    description: "소스 코드의 구조를 트리로 표현한 것. 괄호나 세미콜론 같은 문법 장치는 생략하고 의미만 남깁니다.",
    analogy: "문장의 문법 구조도와 비슷합니다 — '나는 밥을 먹었다'에서 주어, 목적어, 동사의 관계를 트리로 그린 것.",
  },
  bytecode: {
    title: "바이트코드",
    emoji: "📝",
    description: "소스 코드와 기계어 사이의 중간 표현. 가상 머신이 해석하여 실행합니다.",
    analogy: "레시피의 단계별 지시사항과 비슷합니다 — 사람이 직접 요리하는 것보다 체계적이지만, 로봇이 바로 실행할 수 있는 코드는 아닙니다.",
  },
  jit: {
    title: "JIT 컴파일",
    emoji: "⚡",
    description: "Just-In-Time. 프로그램 실행 중에 자주 사용되는 코드를 기계어로 컴파일하는 기법.",
    analogy: "자주 가는 길의 지름길을 외우는 것과 비슷합니다 — 처음엔 지도를 보지만, 익숙해지면 생각 없이 갑니다.",
  },
  "hidden-class": {
    title: "Hidden Class",
    emoji: "🏷️",
    description: "V8이 객체의 '형태' (어떤 프로퍼티가 어떤 순서로 있는지) 를 추적하는 내부 메타데이터.",
    analogy: "건물의 설계도와 비슷합니다 — 같은 설계도로 지은 건물은 방의 위치가 동일하므로, 설계도만 보면 어디에 뭐가 있는지 알 수 있습니다.",
  },
  "inline-cache": {
    title: "인라인 캐시",
    emoji: "💾",
    description: "프로퍼티 접근 위치에 '마지막에 본 객체 형태와 오프셋'을 기록해두는 최적화 기법.",
    analogy: "포스트잇 메모와 비슷합니다 — 자주 찾는 파일의 위치를 모니터에 붙여두면 매번 찾을 필요가 없죠.",
  },
  "cpu-cache": {
    title: "CPU 캐시",
    emoji: "🧠",
    description: "CPU 가까이에 있는 초고속 소용량 메모리. 자주 접근하는 데이터를 여기에 올려두면 메인 메모리 접근보다 수십 배 빠릅니다.",
    analogy: "책상 위의 메모장과 비슷합니다 — 자주 보는 내용을 서재까지 가지 않고 바로 확인할 수 있습니다.",
  },
  "stack-frame": {
    title: "스택 프레임",
    emoji: "📋",
    description: "함수가 호출될 때 콜 스택에 생성되는 메모리 블록. 매개변수, 지역 변수, 반환 주소 등을 담고 있습니다.",
    analogy: "레스토랑의 주문서와 비슷합니다 — 각 테이블 (함수) 의 주문 내용 (변수) 이 적혀있고, 서빙이 끝나면 치워집니다.",
  },
  smi: {
    title: "Smi (Small Integer)",
    emoji: "🔢",
    description: "V8이 작은 정수를 힙 할당 없이 직접 저장하는 최적화 형식. 포인터 태깅을 사용합니다.",
    analogy: "주머니에 넣을 수 있는 동전과 비슷합니다 — 큰 금액은 지갑 (힙) 에 넣지만, 작은 돈은 바로 주머니 (레지스터) 에 넣습니다.",
  },
  deoptimization: {
    title: "역최적화",
    emoji: "↩️",
    description: "최적화된 기계어의 타입 가정이 깨졌을 때, 바이트코드 실행으로 되돌아가는 과정.",
    analogy: "고속도로에서 공사 구간을 만나 일반 도로로 빠지는 것과 비슷합니다 — 다시 고속도로에 진입할 수 있지만 일시적으로 느려집니다.",
  },
};

interface TermProps {
  id: string;
  children: React.ReactNode;
}

export function Term({ id, children }: TermProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<"above" | "below">("below");
  const triggerRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLSpanElement>(null);
  const openedByHoverRef = useRef(false);

  const def = terms[id];

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setPosition(spaceBelow < 200 ? "above" : "below");
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!def) {
    return <span>{children}</span>;
  }

  return (
    <span className="relative inline">
      <span
        ref={triggerRef}
        role="button"
        tabIndex={0}
        onClick={() => {
          openedByHoverRef.current = false;
          setOpen((prev) => !prev);
        }}
        onMouseEnter={() => {
          openedByHoverRef.current = true;
          setOpen(true);
        }}
        onMouseLeave={() => {
          if (openedByHoverRef.current) {
            openedByHoverRef.current = false;
            setOpen(false);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openedByHoverRef.current = false;
            setOpen((prev) => !prev);
          }
        }}
        className="cursor-help border-b border-dashed border-accent/40 text-text transition-colors hover:border-accent"
      >
        {children}
      </span>

      <AnimatePresence>
        {open && (
          <motion.span
            ref={popoverRef}
            role="tooltip"
            initial={{ opacity: 0, scale: 0.95, y: position === "below" ? -4 : 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute left-1/2 z-50 block w-72 -translate-x-1/2 ${
              position === "below" ? "top-full mt-2" : "bottom-full mb-2"
            }`}
          >
            <span className="block border border-border bg-bg p-4 shadow-lg">
              {/* Header */}
              <span className="flex items-center gap-2">
                <motion.span
                  initial={{ rotate: -20, scale: 0.5 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="text-lg"
                >
                  {def.emoji}
                </motion.span>
                <span className="font-mono text-[0.75rem] font-bold text-text">
                  {def.title}
                </span>
              </span>

              {/* Description */}
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mt-2 block text-[0.75rem] leading-relaxed text-muted"
              >
                {def.description}
              </motion.span>

              {/* Analogy */}
              {def.analogy && (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mt-2.5 block border-t border-border pt-2.5"
                >
                  <span className="text-[0.625rem] uppercase tracking-wider text-muted">
                    비유하자면
                  </span>
                  <span className="mt-0.5 block text-[0.75rem] leading-relaxed text-text">
                    {def.analogy}
                  </span>
                </motion.span>
              )}
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
