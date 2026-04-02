"use client";

import { StepPlayer } from "../primitives/StepPlayer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface InodeEntry {
  id: number;
  name: string;
  type: "file" | "dir";
  size: string;
  blocks: number[];
  highlight?: boolean;
}

interface IoStep {
  phase: string;
  fd: number | null;
  inodeTable: InodeEntry[];
  dataBlocks: { id: number; content: string; active: boolean }[];
  bufferCache: { blockId: number; content: string }[];
  diskActive: boolean;
  appReceived: boolean;
  description: string;
}

/* ------------------------------------------------------------------ */
/*  Colors                                                             */
/* ------------------------------------------------------------------ */

const phaseColors: Record<string, { bg: string; text: string }> = {
  request: {
    bg: "bg-sky-100 dark:bg-sky-900/60",
    text: "text-sky-700 dark:text-sky-300",
  },
  inode: {
    bg: "bg-violet-100 dark:bg-violet-900/60",
    text: "text-violet-700 dark:text-violet-300",
  },
  locate: {
    bg: "bg-amber-100 dark:bg-amber-900/60",
    text: "text-amber-700 dark:text-amber-300",
  },
  "disk-io": {
    bg: "bg-orange-100 dark:bg-orange-900/60",
    text: "text-orange-700 dark:text-orange-300",
  },
  cache: {
    bg: "bg-teal-100 dark:bg-teal-900/60",
    text: "text-teal-700 dark:text-teal-300",
  },
  complete: {
    bg: "bg-emerald-100 dark:bg-emerald-900/60",
    text: "text-emerald-700 dark:text-emerald-300",
  },
};

const phaseLabels: Record<string, string> = {
  request: "read() 시스템 콜",
  inode: "inode 테이블 조회",
  locate: "데이터 블록 위치 확인",
  "disk-io": "디스크 I/O",
  cache: "버퍼 캐시 적재",
  complete: "애플리케이션에 반환",
};

/* ------------------------------------------------------------------ */
/*  Preset: basic read flow                                            */
/* ------------------------------------------------------------------ */

function buildBasicSteps(): IoStep[] {
  const baseInodes: InodeEntry[] = [
    { id: 0, name: "/", type: "dir", size: "4KB", blocks: [0] },
    { id: 1, name: "etc", type: "dir", size: "4KB", blocks: [1] },
    { id: 2, name: "app.js", type: "file", size: "12KB", blocks: [5, 6, 7] },
    { id: 3, name: "data.json", type: "file", size: "8KB", blocks: [10, 11] },
  ];

  const baseDataBlocks = [
    { id: 5, content: "const app = ...", active: false },
    { id: 6, content: "function init()", active: false },
    { id: 7, content: "module.exports", active: false },
    { id: 10, content: '{"users":[...', active: false },
    { id: 11, content: '"config":{...', active: false },
  ];

  return [
    {
      phase: "request",
      fd: null,
      inodeTable: baseInodes,
      dataBlocks: baseDataBlocks,
      bufferCache: [],
      diskActive: false,
      appReceived: false,
      description:
        "애플리케이션이 read(\"/data.json\") 시스템 콜을 호출합니다. 사용자 모드에서 커널 모드로 전환되고, VFS(Virtual File System) 계층이 요청을 받습니다. 커널은 파일 경로를 분석하여 해당 파일의 inode를 찾아야 합니다.",
    },
    {
      phase: "inode",
      fd: 3,
      inodeTable: baseInodes.map((e) =>
        e.name === "data.json" ? { ...e, highlight: true } : e
      ),
      dataBlocks: baseDataBlocks,
      bufferCache: [],
      diskActive: false,
      appReceived: false,
      description:
        "커널이 inode 테이블에서 data.json의 inode(#3)를 찾습니다. inode에는 파일 크기(8KB), 소유자, 권한, 타임스탬프, 그리고 데이터 블록 포인터가 저장되어 있습니다. 파일 디스크립터 3이 할당됩니다.",
    },
    {
      phase: "locate",
      fd: 3,
      inodeTable: baseInodes.map((e) =>
        e.name === "data.json" ? { ...e, highlight: true } : e
      ),
      dataBlocks: baseDataBlocks.map((b) =>
        b.id === 10 || b.id === 11 ? { ...b, active: true } : b
      ),
      bufferCache: [],
      diskActive: false,
      appReceived: false,
      description:
        "inode #3의 블록 포인터를 따라 데이터 블록 위치를 확인합니다. data.json은 블록 10, 11에 분산 저장되어 있습니다. 커널은 먼저 버퍼 캐시에 해당 블록이 있는지 확인합니다. 캐시 미스이므로 디스크에서 읽어야 합니다.",
    },
    {
      phase: "disk-io",
      fd: 3,
      inodeTable: baseInodes.map((e) =>
        e.name === "data.json" ? { ...e, highlight: true } : e
      ),
      dataBlocks: baseDataBlocks.map((b) =>
        b.id === 10 || b.id === 11 ? { ...b, active: true } : b
      ),
      bufferCache: [],
      diskActive: true,
      appReceived: false,
      description:
        "디스크 컨트롤러에 블록 10, 11 읽기 요청을 보냅니다. HDD의 경우 디스크 헤드가 해당 트랙으로 이동(탐색 시간)하고 플래터가 회전(회전 지연)한 뒤 데이터를 전송합니다. SSD는 탐색/회전 없이 전자적으로 접근하므로 훨씬 빠릅니다.",
    },
    {
      phase: "cache",
      fd: 3,
      inodeTable: baseInodes.map((e) =>
        e.name === "data.json" ? { ...e, highlight: true } : e
      ),
      dataBlocks: baseDataBlocks.map((b) =>
        b.id === 10 || b.id === 11 ? { ...b, active: true } : b
      ),
      bufferCache: [
        { blockId: 10, content: '{"users":[...' },
        { blockId: 11, content: '"config":{...' },
      ],
      diskActive: false,
      appReceived: false,
      description:
        "디스크에서 읽은 데이터가 버퍼 캐시(페이지 캐시)에 적재됩니다. 같은 파일을 다시 읽으면 디스크 I/O 없이 캐시에서 바로 제공합니다. Linux에서 free 명령의 'buff/cache' 항목이 바로 이 영역입니다.",
    },
    {
      phase: "complete",
      fd: 3,
      inodeTable: baseInodes.map((e) =>
        e.name === "data.json" ? { ...e, highlight: true } : e
      ),
      dataBlocks: baseDataBlocks.map((b) =>
        b.id === 10 || b.id === 11 ? { ...b, active: true } : b
      ),
      bufferCache: [
        { blockId: 10, content: '{"users":[...' },
        { blockId: 11, content: '"config":{...' },
      ],
      diskActive: false,
      appReceived: true,
      description:
        "버퍼 캐시의 데이터가 사용자 공간 버퍼로 복사되어 애플리케이션에 반환됩니다. 커널 모드에서 사용자 모드로 다시 전환됩니다. read() 시스템 콜이 완료되고, 애플리케이션은 읽은 데이터를 처리합니다.",
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Preset: cache hit                                                  */
/* ------------------------------------------------------------------ */

function buildCacheHitSteps(): IoStep[] {
  const baseInodes: InodeEntry[] = [
    { id: 0, name: "/", type: "dir", size: "4KB", blocks: [0] },
    { id: 1, name: "etc", type: "dir", size: "4KB", blocks: [1] },
    { id: 2, name: "app.js", type: "file", size: "12KB", blocks: [5, 6, 7] },
    { id: 3, name: "data.json", type: "file", size: "8KB", blocks: [10, 11] },
  ];

  const baseDataBlocks = [
    { id: 5, content: "const app = ...", active: false },
    { id: 6, content: "function init()", active: false },
    { id: 7, content: "module.exports", active: false },
    { id: 10, content: '{"users":[...', active: false },
    { id: 11, content: '"config":{...', active: false },
  ];

  const cachedBlocks = [
    { blockId: 10, content: '{"users":[...' },
    { blockId: 11, content: '"config":{...' },
  ];

  return [
    {
      phase: "request",
      fd: null,
      inodeTable: baseInodes,
      dataBlocks: baseDataBlocks,
      bufferCache: cachedBlocks,
      diskActive: false,
      appReceived: false,
      description:
        "애플리케이션이 data.json을 두 번째로 읽습니다. 다시 read() 시스템 콜이 호출됩니다. 이전 읽기에서 버퍼 캐시에 데이터가 남아 있을 수 있습니다.",
    },
    {
      phase: "inode",
      fd: 3,
      inodeTable: baseInodes.map((e) =>
        e.name === "data.json" ? { ...e, highlight: true } : e
      ),
      dataBlocks: baseDataBlocks,
      bufferCache: cachedBlocks,
      diskActive: false,
      appReceived: false,
      description:
        "inode #3을 찾아 블록 포인터(10, 11)를 확인합니다. 이번에도 버퍼 캐시를 먼저 확인합니다.",
    },
    {
      phase: "cache",
      fd: 3,
      inodeTable: baseInodes.map((e) =>
        e.name === "data.json" ? { ...e, highlight: true } : e
      ),
      dataBlocks: baseDataBlocks,
      bufferCache: cachedBlocks,
      diskActive: false,
      appReceived: false,
      description:
        "버퍼 캐시에 블록 10, 11이 이미 존재합니다 (Cache Hit). 디스크 I/O를 완전히 건너뜁니다. 캐시 히트 시 디스크 접근 대비 수천~수만 배 빠른 응답이 가능합니다.",
    },
    {
      phase: "complete",
      fd: 3,
      inodeTable: baseInodes.map((e) =>
        e.name === "data.json" ? { ...e, highlight: true } : e
      ),
      dataBlocks: baseDataBlocks,
      bufferCache: cachedBlocks,
      diskActive: false,
      appReceived: true,
      description:
        "캐시 데이터가 바로 사용자 공간으로 복사됩니다. 디스크 I/O가 생략되어 read()가 매우 빠르게 완료됩니다. OS 버퍼 캐시 덕분에 반복 읽기 성능이 극적으로 개선됩니다.",
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Presets                                                            */
/* ------------------------------------------------------------------ */

const presets: Record<string, { steps: IoStep[] }> = {
  "read-flow": { steps: buildBasicSteps() },
  "cache-hit": { steps: buildCacheHitSteps() },
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function InodeTable({
  entries,
}: {
  entries: InodeEntry[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
        inode 테이블
      </span>
      <div className="space-y-0.5">
        <div className="flex gap-0.5">
          <span className="w-10 px-1.5 py-0.5 text-[0.5625rem] font-bold text-muted bg-neutral-100 dark:bg-neutral-800">
            #
          </span>
          <span className="w-20 px-1.5 py-0.5 text-[0.5625rem] font-bold text-muted bg-neutral-100 dark:bg-neutral-800">
            이름
          </span>
          <span className="w-12 px-1.5 py-0.5 text-[0.5625rem] font-bold text-muted bg-neutral-100 dark:bg-neutral-800">
            타입
          </span>
          <span className="w-12 px-1.5 py-0.5 text-[0.5625rem] font-bold text-muted bg-neutral-100 dark:bg-neutral-800">
            크기
          </span>
          <span className="w-20 px-1.5 py-0.5 text-[0.5625rem] font-bold text-muted bg-neutral-100 dark:bg-neutral-800">
            블록
          </span>
        </div>
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`flex gap-0.5 transition-all duration-200 ${
              entry.highlight
                ? "ring-2 ring-violet-400/40 dark:ring-violet-500/30"
                : ""
            }`}
          >
            <span
              className={`w-10 px-1.5 py-0.5 font-mono text-[0.6875rem] font-bold text-center border ${
                entry.highlight
                  ? "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-600 dark:bg-violet-950/40 dark:text-violet-300"
                  : "border-border bg-surface text-text"
              }`}
            >
              {entry.id}
            </span>
            <span
              className={`w-20 px-1.5 py-0.5 font-mono text-[0.6875rem] text-center border truncate ${
                entry.highlight
                  ? "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-600 dark:bg-violet-950/40 dark:text-violet-300"
                  : "border-border bg-surface text-text"
              }`}
            >
              {entry.name}
            </span>
            <span
              className={`w-12 px-1.5 py-0.5 font-mono text-[0.6875rem] text-center border ${
                entry.highlight
                  ? "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-600 dark:bg-violet-950/40 dark:text-violet-300"
                  : "border-border bg-surface text-text"
              }`}
            >
              {entry.type === "dir" ? "DIR" : "FILE"}
            </span>
            <span
              className={`w-12 px-1.5 py-0.5 font-mono text-[0.6875rem] text-center border ${
                entry.highlight
                  ? "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-600 dark:bg-violet-950/40 dark:text-violet-300"
                  : "border-border bg-surface text-text"
              }`}
            >
              {entry.size}
            </span>
            <span
              className={`w-20 px-1.5 py-0.5 font-mono text-[0.6875rem] text-center border ${
                entry.highlight
                  ? "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-600 dark:bg-violet-950/40 dark:text-violet-300"
                  : "border-border bg-surface text-text"
              }`}
            >
              [{entry.blocks.join(", ")}]
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DataBlocksView({
  blocks,
}: {
  blocks: { id: number; content: string; active: boolean }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
        데이터 블록 (디스크)
      </span>
      <div className="flex flex-wrap gap-1">
        {blocks.map((block) => (
          <div
            key={block.id}
            className={`border-2 px-2 py-1.5 text-center transition-all duration-200 min-w-[4.5rem] ${
              block.active
                ? "border-amber-400 bg-amber-50 dark:border-amber-500 dark:bg-amber-950/40"
                : "border-border bg-surface"
            }`}
          >
            <span
              className={`block text-[0.5rem] font-bold ${
                block.active
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-muted/50"
              }`}
            >
              블록 {block.id}
            </span>
            <span
              className={`block font-mono text-[0.5625rem] truncate max-w-[4rem] ${
                block.active
                  ? "text-amber-700 dark:text-amber-300"
                  : "text-muted/40"
              }`}
            >
              {block.content}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BufferCacheView({
  entries,
}: {
  entries: { blockId: number; content: string }[];
}) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
          버퍼 캐시 (메모리)
        </span>
        <div className="border-2 border-dashed border-border px-4 py-2 text-center">
          <span className="text-[0.6875rem] text-muted/40">비어 있음</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
          버퍼 캐시 (메모리)
        </span>
        <span className="px-1.5 py-0.5 text-[0.5625rem] font-bold bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300">
          CACHED
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {entries.map((entry) => (
          <div
            key={entry.blockId}
            className="border-2 border-teal-400 bg-teal-50 dark:border-teal-500 dark:bg-teal-950/40 px-2 py-1.5 text-center min-w-[4.5rem]"
          >
            <span className="block text-[0.5rem] font-bold text-teal-600 dark:text-teal-400">
              블록 {entry.blockId}
            </span>
            <span className="block font-mono text-[0.5625rem] truncate max-w-[4rem] text-teal-700 dark:text-teal-300">
              {entry.content}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FdIndicator({ fd }: { fd: number | null }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
        파일 디스크립터
      </span>
      <div
        className={`border-2 px-3 py-1.5 text-center transition-all duration-200 ${
          fd !== null
            ? "border-sky-400 bg-sky-50 dark:border-sky-500 dark:bg-sky-950/40"
            : "border-border bg-surface"
        }`}
      >
        <span
          className={`font-mono text-[0.75rem] font-bold ${
            fd !== null
              ? "text-sky-700 dark:text-sky-300"
              : "text-muted/40"
          }`}
        >
          {fd !== null ? `fd = ${fd}` : "미할당"}
        </span>
      </div>
    </div>
  );
}

function DiskIndicator({ active }: { active: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
        디스크 I/O
      </span>
      <div
        className={`border-2 px-4 py-2 text-center transition-all duration-200 ${
          active
            ? "border-orange-400 bg-orange-50 dark:border-orange-500 dark:bg-orange-950/40"
            : "border-border bg-surface"
        }`}
      >
        <span
          className={`text-[0.75rem] font-bold ${
            active
              ? "text-orange-700 dark:text-orange-300"
              : "text-muted/40"
          }`}
        >
          {active ? "읽기 진행 중..." : "대기"}
        </span>
      </div>
    </div>
  );
}

function AppIndicator({ received }: { received: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
        애플리케이션
      </span>
      <div
        className={`border-2 px-4 py-2 text-center transition-all duration-200 ${
          received
            ? "border-emerald-400 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/40"
            : "border-border bg-surface"
        }`}
      >
        <span
          className={`text-[0.75rem] font-bold ${
            received
              ? "text-emerald-700 dark:text-emerald-300"
              : "text-muted/40"
          }`}
        >
          {received ? "데이터 수신 완료" : "read() 대기 중"}
        </span>
      </div>
    </div>
  );
}

function FlowArrow({
  label,
  active,
  color,
}: {
  label: string;
  active: boolean;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    sky: active ? "text-sky-500 dark:text-sky-400" : "text-muted/20",
    violet: active ? "text-violet-500 dark:text-violet-400" : "text-muted/20",
    amber: active ? "text-amber-500 dark:text-amber-400" : "text-muted/20",
    orange: active ? "text-orange-500 dark:text-orange-400" : "text-muted/20",
    teal: active ? "text-teal-500 dark:text-teal-400" : "text-muted/20",
    emerald: active
      ? "text-emerald-500 dark:text-emerald-400"
      : "text-muted/20",
  };

  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className={`transition-all duration-200 ${colorMap[color] ?? colorMap["sky"]}`}
      >
        <path
          d="M10 3 L10 14 M6 10 L10 14 L14 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={`text-[0.5rem] font-bold transition-all duration-200 ${
          active ? "text-muted" : "text-muted/20"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface FileSystemIOProps {
  preset?: string;
}

export function FileSystemIO({ preset = "read-flow" }: FileSystemIOProps) {
  const data = presets[preset] ?? presets["read-flow"];

  const stepNodes = data.steps.map((step, idx) => {
    const pColor = phaseColors[step.phase] ?? phaseColors["request"];
    const label = phaseLabels[step.phase] ?? step.phase;

    return (
      <div key={idx} className="space-y-4">
        {/* Phase label */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-2 py-0.5 font-mono text-[0.5625rem] font-bold ${pColor.bg} ${pColor.text}`}
          >
            {label}
          </span>
          <span className="font-mono text-[0.5625rem] text-muted">
            단계 {idx + 1} / {data.steps.length}
          </span>
        </div>

        {/* Flow diagram */}
        <div className="flex flex-col items-center gap-2">
          {/* App indicator */}
          <AppIndicator received={step.appReceived} />

          <FlowArrow
            label="시스템 콜"
            active={step.phase === "request" || step.appReceived}
            color="sky"
          />

          {/* File Descriptor */}
          <FdIndicator fd={step.fd} />

          <FlowArrow
            label="inode 조회"
            active={
              step.phase === "inode" ||
              step.phase === "locate" ||
              step.phase === "disk-io" ||
              step.phase === "cache" ||
              step.phase === "complete"
            }
            color="violet"
          />

          {/* Inode Table */}
          <InodeTable entries={step.inodeTable} />

          <FlowArrow
            label="블록 위치 확인"
            active={
              step.phase === "locate" ||
              step.phase === "disk-io" ||
              step.phase === "cache" ||
              step.phase === "complete"
            }
            color="amber"
          />

          {/* Data Blocks */}
          <DataBlocksView blocks={step.dataBlocks} />

          {/* Disk IO (only show when relevant) */}
          {step.diskActive && (
            <>
              <FlowArrow label="디스크 읽기" active={true} color="orange" />
              <DiskIndicator active={step.diskActive} />
            </>
          )}

          <FlowArrow
            label="캐시 적재"
            active={step.bufferCache.length > 0}
            color="teal"
          />

          {/* Buffer Cache */}
          <BufferCacheView entries={step.bufferCache} />

          {/* Final arrow to app */}
          {step.appReceived && (
            <FlowArrow
              label="데이터 반환"
              active={true}
              color="emerald"
            />
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
