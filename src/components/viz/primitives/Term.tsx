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
  "structured-clone": {
    title: "구조적 복제",
    emoji: "📋",
    description: "객체를 깊은 복사하는 브라우저 내장 알고리즘. JSON보다 더 많은 타입 (Map, Set, ArrayBuffer, Date 등) 을 지원합니다. postMessage의 기본 데이터 전달 방식입니다.",
    analogy: "서류를 복사기로 복사하는 것과 비슷합니다 — 원본과 동일한 사본이 나오지만, 완전히 별개의 종이입니다.",
  },
  "race-condition": {
    title: "레이스 컨디션",
    emoji: "🏎️",
    description: "두 개 이상의 스레드가 공유 자원에 동시에 접근할 때, 실행 순서에 따라 결과가 달라지는 버그. 재현이 어려워 디버깅이 까다롭습니다.",
    analogy: "두 사람이 동시에 같은 은행 계좌에서 출금하는 것과 비슷합니다 — 잔액 확인과 출금 사이에 다른 사람이 끼어들면 잔액이 맞지 않게 됩니다.",
  },
  "atomic-operation": {
    title: "원자적 연산",
    emoji: "⚛️",
    description: "중간에 다른 스레드가 끼어들 수 없는 '올인원' 연산. 읽기-수정-쓰기가 하나의 쪼갤 수 없는 단위로 처리됩니다.",
    analogy: "자동문 에어록과 비슷합니다 — 한 사람이 통과하는 동안 문이 잠겨서, 두 사람이 동시에 끼어들 수 없습니다.",
  },
  "cross-origin-isolation": {
    title: "교차 출처 격리",
    emoji: "🔒",
    description: "COOP/COEP 헤더로 페이지를 다른 출처로부터 격리하는 보안 메커니즘. SharedArrayBuffer 사용과 고해상도 타이머 접근의 전제 조건입니다.",
    analogy: "보안 구역 출입문과 비슷합니다 — 허가된 사람만 들어올 수 있으므로 내부에서 민감한 작업을 해도 안전합니다.",
  },
  "transferable": {
    title: "Transferable 객체",
    emoji: "📦",
    description: "postMessage로 전달할 때 복사 대신 소유권을 이전하는 객체. ArrayBuffer, MessagePort, OffscreenCanvas 등이 해당합니다. 전송 후 원본은 사용할 수 없게 됩니다.",
    analogy: "이사할 때 짐을 복사하지 않고 트럭에 실어 보내는 것과 비슷합니다 — 새 집에 도착하면 원래 집엔 아무것도 없습니다.",
  },
  "detached-buffer": {
    title: "분리된 버퍼",
    emoji: "🚫",
    description: "소유권이 이전되어 더 이상 접근할 수 없는 ArrayBuffer. byteLength가 0이 되고 모든 읽기/쓰기가 TypeError를 발생시킵니다.",
    analogy: "양도한 콘서트 티켓과 비슷합니다 — 내 이름으로 발급됐지만 양도 후에는 입장할 수 없습니다.",
  },
  "dom": {
    title: "DOM",
    emoji: "🌲",
    description: "Document Object Model. HTML 문서를 트리 구조로 표현한 프로그래밍 인터페이스. 브라우저가 HTML을 파싱하여 생성합니다.",
    analogy: "건물의 골조와 비슷합니다 — HTML이 설계도라면, DOM은 그 설계도대로 세운 실제 구조물입니다.",
  },
  "cssom": {
    title: "CSSOM",
    emoji: "🎨",
    description: "CSS Object Model. CSS 규칙을 트리 구조로 표현한 것. DOM과 결합하여 각 요소의 최종 스타일을 결정합니다.",
    analogy: "건물의 인테리어 시방서와 비슷합니다 — 골조(DOM)에 어떤 색, 크기, 배치를 적용할지 기록한 문서입니다.",
  },
  "parser-blocking": {
    title: "파서 블로킹",
    emoji: "🚧",
    description: "HTML 파서가 <script> 태그를 만나면 스크립트 실행이 끝날 때까지 DOM 구축을 중단하는 현상. defer/async로 회피할 수 있습니다.",
    analogy: "건설 현장에서 전기 배선팀이 올 때까지 벽 공사를 멈추는 것과 비슷합니다.",
  },
  "render-tree": {
    title: "렌더 트리",
    emoji: "🌿",
    description: "DOM과 CSSOM을 결합하여 화면에 실제로 그려질 요소만 포함하는 트리. display:none인 요소는 제외됩니다.",
    analogy: "무대 위에 실제로 등장하는 배우 목록과 비슷합니다 — 대본(DOM)에 있지만 등장하지 않는 캐릭터는 빠집니다.",
  },
  "box-model": {
    title: "박스 모델",
    emoji: "📦",
    description: "모든 HTML 요소를 content, padding, border, margin 네 영역으로 구성된 사각형 박스로 다루는 CSS 레이아웃 모델.",
    analogy: "택배 상자와 비슷합니다 — 내용물(content), 완충재(padding), 상자(border), 상자 간 간격(margin).",
  },
  "layout": {
    title: "레이아웃",
    emoji: "📐",
    description: "렌더 트리의 각 요소가 뷰포트 내에서 차지하는 정확한 위치와 크기를 계산하는 단계. Reflow라고도 합니다.",
  },
  "paint-record": {
    title: "페인트 레코드",
    emoji: "🖌️",
    description: "레이아웃 결과를 바탕으로 '이 좌표에 이 색 사각형을 그려라' 같은 그리기 명령을 순서대로 기록한 목록.",
    analogy: "화가의 작업 순서 메모와 비슷합니다 — 배경부터 칠하고, 그 위에 가구, 마지막에 장식.",
  },
  "rasterization": {
    title: "래스터라이제이션",
    emoji: "🔲",
    description: "벡터 형태의 페인트 명령을 실제 픽셀 비트맵으로 변환하는 과정. GPU가 처리하는 경우가 많습니다.",
    analogy: "벡터 일러스트를 JPEG 이미지로 내보내는 것과 비슷합니다 — 수학적 도형을 픽셀 격자에 찍는 과정.",
  },
  "stacking-context": {
    title: "스태킹 컨텍스트",
    emoji: "🗂️",
    description: "z-index, opacity, transform 등의 속성이 만드는 요소의 쌓임 순서 그룹. 같은 컨텍스트 내에서만 z-index가 비교됩니다.",
    analogy: "건물의 층과 비슷합니다 — 1층 내부에서 아무리 높이 쌓아도 2층보다 위로 갈 수 없습니다.",
  },
  "compositor-thread": {
    title: "합성 스레드",
    emoji: "🧵",
    description: "메인 스레드와 별도로 동작하며 레이어를 합성하는 브라우저 스레드. transform/opacity 애니메이션은 이 스레드에서 처리되어 메인 스레드를 블로킹하지 않습니다.",
    analogy: "영상 편집에서 레이어를 합치는 렌더링 엔진과 비슷합니다 — 편집자(메인 스레드)가 다른 작업을 하는 동안 백그라운드에서 합성합니다.",
  },
  "layer-promotion": {
    title: "레이어 승격",
    emoji: "⬆️",
    description: "특정 요소를 별도의 합성 레이어로 분리하는 것. will-change, transform, opacity 등이 트리거합니다. GPU 메모리를 추가로 사용합니다.",
  },
  "layout-thrashing": {
    title: "레이아웃 스래싱",
    emoji: "💥",
    description: "DOM 쓰기와 읽기를 번갈아 반복하여 브라우저가 매번 강제로 레이아웃을 재계산하게 만드는 성능 안티패턴.",
    analogy: "메모를 쓰다가 매번 전체 문서를 다시 읽는 것과 비슷합니다 — 쓸 내용을 모아서 한 번에 쓰는 것이 훨씬 효율적입니다.",
  },
  "core-web-vitals": {
    title: "Core Web Vitals",
    emoji: "📊",
    description: "Google이 정의한 웹 페이지 사용자 경험 핵심 지표. LCP(로딩), INP(상호작용), CLS(시각적 안정성) 세 가지로 구성됩니다.",
  },
  "event-bubbling": {
    title: "이벤트 버블링",
    emoji: "🫧",
    description: "이벤트가 발생한 요소에서 시작해 DOM 트리를 따라 상위 요소로 전파되는 현상. 대부분의 DOM 이벤트는 버블링됩니다.",
    analogy: "수면 아래에서 올라오는 거품과 비슷합니다 — 가장 깊은 곳에서 시작해 위로 올라갑니다.",
  },
  "event-delegation": {
    title: "이벤트 위임",
    emoji: "📋",
    description: "개별 자식 요소에 이벤트 핸들러를 붙이는 대신, 공통 부모에 하나의 핸들러를 등록하고 event.target으로 실제 대상을 판별하는 패턴.",
    analogy: "회사 대표 전화번호와 비슷합니다 — 각 직원에게 직접 전화하지 않고, 대표번호로 걸면 내선으로 연결됩니다.",
  },
  "intersection-observer": {
    title: "IntersectionObserver",
    emoji: "👁️",
    description: "대상 요소가 뷰포트나 특정 조상 요소와 교차하는 비율을 비동기적으로 관찰하는 API. 무한 스크롤, 지연 로딩에 활용됩니다.",
  },
  "mutation-observer": {
    title: "MutationObserver",
    emoji: "🔬",
    description: "DOM 트리의 변경(자식 추가/제거, 속성 변경, 텍스트 변경)을 비동기적으로 감지하는 API. 마이크로태스크로 배치 처리됩니다.",
  },
  "dns": {
    title: "DNS",
    emoji: "📖",
    description: "Domain Name System. 도메인 이름(example.com)을 IP 주소(93.184.216.34)로 변환하는 분산 네이밍 시스템.",
    analogy: "전화번호부와 비슷합니다 — 이름으로 검색하면 전화번호(IP)를 알려줍니다.",
  },
  "cors": {
    title: "CORS",
    emoji: "🔓",
    description: "Cross-Origin Resource Sharing. 브라우저가 다른 출처의 리소스에 접근할 수 있도록 서버가 허용하는 HTTP 헤더 기반 메커니즘.",
  },
  "preflight": {
    title: "프리플라이트 요청",
    emoji: "✈️",
    description: "실제 요청 전에 브라우저가 보내는 OPTIONS 메서드의 사전 확인 요청. 서버가 해당 출처와 메서드를 허용하는지 확인합니다.",
    analogy: "비행기 이륙 전 관제탑에 허가를 구하는 것과 비슷합니다.",
  },
  "websocket": {
    title: "WebSocket",
    emoji: "🔌",
    description: "HTTP 핸드셰이크로 시작해 TCP 위에서 전이중(full-duplex) 통신을 제공하는 프로토콜. 실시간 양방향 데이터 전송에 사용됩니다.",
  },
  "same-origin-policy": {
    title: "동일 출처 정책",
    emoji: "🏠",
    description: "Same-Origin Policy. 프로토콜, 호스트, 포트가 모두 같은 출처끼리만 리소스에 접근할 수 있도록 브라우저가 강제하는 보안 정책.",
    analogy: "아파트 동 출입문과 비슷합니다 — 같은 동 주민만 출입할 수 있고, 다른 동은 별도 허가가 필요합니다.",
  },
  "xss": {
    title: "XSS",
    emoji: "💉",
    description: "Cross-Site Scripting. 공격자가 웹 페이지에 악성 스크립트를 삽입해 다른 사용자의 브라우저에서 실행시키는 공격. Stored, Reflected, DOM-based 세 유형이 있습니다.",
  },
  "csrf": {
    title: "CSRF",
    emoji: "🎭",
    description: "Cross-Site Request Forgery. 사용자가 인증된 상태에서 공격자가 만든 페이지를 방문하면, 사용자 모르게 요청이 전송되는 공격.",
  },
  "csp": {
    title: "CSP",
    emoji: "📜",
    description: "Content Security Policy. 브라우저에게 어떤 출처의 리소스만 로드/실행할 수 있는지 지시하는 HTTP 헤더 기반 보안 정책. XSS 방어의 핵심 수단입니다.",
  },
};

interface TermProps {
  id: string;
  children: React.ReactNode;
}

export function Term({ id, children }: TermProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<"above" | "below">("below");
  const [offsetX, setOffsetX] = useState(0);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLSpanElement>(null);
  const openedByHoverRef = useRef(false);

  const def = terms[id];

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setPosition(spaceBelow < 200 ? "above" : "below");

      // Clamp popover within viewport (match page px-6 = 24px)
      const margin = 24;
      const popoverWidth = Math.min(288, window.innerWidth - margin * 2);
      const triggerCenter = rect.left + rect.width / 2;
      const popoverLeft = triggerCenter - popoverWidth / 2;
      const popoverRight = popoverLeft + popoverWidth;

      if (popoverLeft < margin) {
        setOffsetX(margin - popoverLeft);
      } else if (popoverRight > window.innerWidth - margin) {
        setOffsetX(window.innerWidth - margin - popoverRight);
      } else {
        setOffsetX(0);
      }
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
            style={{ marginLeft: offsetX }}
            className={`absolute left-1/2 z-50 block w-72 max-w-[calc(100vw-3rem)] -translate-x-1/2 ${
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
