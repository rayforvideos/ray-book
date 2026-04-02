"use client";

import { StepPlayer } from "../primitives/StepPlayer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PageTableEntry {
  virtualPage: number;
  physicalFrame: number | null;
  valid: boolean;
  onDisk: boolean;
}

interface TlbEntry {
  virtualPage: number;
  physicalFrame: number;
}

interface VmStep {
  phase: string;
  virtualAddress: { page: number; offset: number };
  tlb: TlbEntry[];
  tlbHit: boolean | null;
  pageTable: PageTableEntry[];
  pageTableChecked: boolean;
  physicalAddress: { frame: number; offset: number } | null;
  pageFault: boolean;
  diskLoad: boolean;
  description: string;
}

/* ------------------------------------------------------------------ */
/*  Colors                                                             */
/* ------------------------------------------------------------------ */

const phaseColors: Record<string, { bg: string; text: string }> = {
  start: {
    bg: "bg-sky-100 dark:bg-sky-900/60",
    text: "text-sky-700 dark:text-sky-300",
  },
  tlb: {
    bg: "bg-violet-100 dark:bg-violet-900/60",
    text: "text-violet-700 dark:text-violet-300",
  },
  "page-table": {
    bg: "bg-amber-100 dark:bg-amber-900/60",
    text: "text-amber-700 dark:text-amber-300",
  },
  resolved: {
    bg: "bg-emerald-100 dark:bg-emerald-900/60",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  "page-fault": {
    bg: "bg-rose-100 dark:bg-rose-900/60",
    text: "text-rose-700 dark:text-rose-300",
  },
  "disk-load": {
    bg: "bg-orange-100 dark:bg-orange-900/60",
    text: "text-orange-700 dark:text-orange-300",
  },
  "fault-resolved": {
    bg: "bg-emerald-100 dark:bg-emerald-900/60",
    text: "text-emerald-700 dark:text-emerald-300",
  },
};

/* ------------------------------------------------------------------ */
/*  Preset: basic — TLB hit scenario                                   */
/* ------------------------------------------------------------------ */

function buildBasicSteps(): VmStep[] {
  const basePageTable: PageTableEntry[] = [
    { virtualPage: 0, physicalFrame: 5, valid: true, onDisk: false },
    { virtualPage: 1, physicalFrame: 8, valid: true, onDisk: false },
    { virtualPage: 2, physicalFrame: null, valid: false, onDisk: true },
    { virtualPage: 3, physicalFrame: 2, valid: true, onDisk: false },
  ];

  const baseTlb: TlbEntry[] = [
    { virtualPage: 0, physicalFrame: 5 },
    { virtualPage: 3, physicalFrame: 2 },
  ];

  return [
    {
      phase: "start",
      virtualAddress: { page: 0, offset: 12 },
      tlb: baseTlb,
      tlbHit: null,
      pageTable: basePageTable,
      pageTableChecked: false,
      physicalAddress: null,
      pageFault: false,
      diskLoad: false,
      description:
        "프로세스가 가상 주소 (페이지 0, 오프셋 12)에 접근합니다. CPU는 이 가상 주소를 물리 주소로 변환해야 합니다. 먼저 TLB(Translation Lookaside Buffer)를 확인합니다.",
    },
    {
      phase: "tlb",
      virtualAddress: { page: 0, offset: 12 },
      tlb: baseTlb,
      tlbHit: true,
      pageTable: basePageTable,
      pageTableChecked: false,
      physicalAddress: null,
      pageFault: false,
      diskLoad: false,
      description:
        "TLB에서 페이지 0을 찾았습니다 (TLB Hit). TLB는 최근 사용된 페이지 테이블 항목의 캐시입니다. 히트하면 페이지 테이블을 조회하지 않아도 되므로 변환 속도가 매우 빠릅니다.",
    },
    {
      phase: "resolved",
      virtualAddress: { page: 0, offset: 12 },
      tlb: baseTlb,
      tlbHit: true,
      pageTable: basePageTable,
      pageTableChecked: false,
      physicalAddress: { frame: 5, offset: 12 },
      pageFault: false,
      diskLoad: false,
      description:
        "TLB에서 페이지 0 -> 프레임 5 매핑을 바로 얻었습니다. 물리 주소는 (프레임 5, 오프셋 12)입니다. 페이지 테이블을 거치지 않았으므로 1~2 CPU 사이클만에 변환이 완료됩니다.",
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Preset: miss — TLB miss, page table hit                            */
/* ------------------------------------------------------------------ */

function buildMissSteps(): VmStep[] {
  const basePageTable: PageTableEntry[] = [
    { virtualPage: 0, physicalFrame: 5, valid: true, onDisk: false },
    { virtualPage: 1, physicalFrame: 8, valid: true, onDisk: false },
    { virtualPage: 2, physicalFrame: null, valid: false, onDisk: true },
    { virtualPage: 3, physicalFrame: 2, valid: true, onDisk: false },
  ];

  const baseTlb: TlbEntry[] = [
    { virtualPage: 0, physicalFrame: 5 },
    { virtualPage: 3, physicalFrame: 2 },
  ];

  return [
    {
      phase: "start",
      virtualAddress: { page: 1, offset: 4 },
      tlb: baseTlb,
      tlbHit: null,
      pageTable: basePageTable,
      pageTableChecked: false,
      physicalAddress: null,
      pageFault: false,
      diskLoad: false,
      description:
        "프로세스가 가상 주소 (페이지 1, 오프셋 4)에 접근합니다. 먼저 TLB를 확인합니다.",
    },
    {
      phase: "tlb",
      virtualAddress: { page: 1, offset: 4 },
      tlb: baseTlb,
      tlbHit: false,
      pageTable: basePageTable,
      pageTableChecked: false,
      physicalAddress: null,
      pageFault: false,
      diskLoad: false,
      description:
        "TLB에 페이지 1이 없습니다 (TLB Miss). TLB는 보통 64~1024개 항목만 저장하므로 모든 페이지를 캐싱하지 못합니다. 이제 메모리에 있는 페이지 테이블을 조회해야 합니다.",
    },
    {
      phase: "page-table",
      virtualAddress: { page: 1, offset: 4 },
      tlb: baseTlb,
      tlbHit: false,
      pageTable: basePageTable,
      pageTableChecked: true,
      physicalAddress: null,
      pageFault: false,
      diskLoad: false,
      description:
        "페이지 테이블에서 페이지 1을 찾습니다. valid 비트가 1이므로 해당 페이지가 물리 메모리에 있습니다. 프레임 번호는 8입니다. 이 결과를 TLB에도 캐싱합니다.",
    },
    {
      phase: "resolved",
      virtualAddress: { page: 1, offset: 4 },
      tlb: [
        ...baseTlb,
        { virtualPage: 1, physicalFrame: 8 },
      ],
      tlbHit: false,
      pageTable: basePageTable,
      pageTableChecked: true,
      physicalAddress: { frame: 8, offset: 4 },
      pageFault: false,
      diskLoad: false,
      description:
        "물리 주소 (프레임 8, 오프셋 4)로 변환 완료. TLB에도 페이지 1 -> 프레임 8 항목이 추가되었습니다. 다음에 같은 페이지에 접근하면 TLB 히트로 빠르게 변환됩니다.",
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Preset: fault — page fault scenario                                */
/* ------------------------------------------------------------------ */

function buildFaultSteps(): VmStep[] {
  const basePageTable: PageTableEntry[] = [
    { virtualPage: 0, physicalFrame: 5, valid: true, onDisk: false },
    { virtualPage: 1, physicalFrame: 8, valid: true, onDisk: false },
    { virtualPage: 2, physicalFrame: null, valid: false, onDisk: true },
    { virtualPage: 3, physicalFrame: 2, valid: true, onDisk: false },
  ];

  const baseTlb: TlbEntry[] = [
    { virtualPage: 0, physicalFrame: 5 },
    { virtualPage: 3, physicalFrame: 2 },
  ];

  return [
    {
      phase: "start",
      virtualAddress: { page: 2, offset: 7 },
      tlb: baseTlb,
      tlbHit: null,
      pageTable: basePageTable,
      pageTableChecked: false,
      physicalAddress: null,
      pageFault: false,
      diskLoad: false,
      description:
        "프로세스가 가상 주소 (페이지 2, 오프셋 7)에 접근합니다. 먼저 TLB를 확인합니다.",
    },
    {
      phase: "tlb",
      virtualAddress: { page: 2, offset: 7 },
      tlb: baseTlb,
      tlbHit: false,
      pageTable: basePageTable,
      pageTableChecked: false,
      physicalAddress: null,
      pageFault: false,
      diskLoad: false,
      description:
        "TLB에 페이지 2가 없습니다 (TLB Miss). 페이지 테이블을 조회합니다.",
    },
    {
      phase: "page-fault",
      virtualAddress: { page: 2, offset: 7 },
      tlb: baseTlb,
      tlbHit: false,
      pageTable: basePageTable,
      pageTableChecked: true,
      physicalAddress: null,
      pageFault: true,
      diskLoad: false,
      description:
        "페이지 테이블에서 페이지 2의 valid 비트가 0입니다. 이 페이지는 물리 메모리에 없고 디스크(스왑 영역)에 있습니다. 페이지 폴트(Page Fault)가 발생합니다! OS 커널에 트랩(인터럽트)이 전달됩니다.",
    },
    {
      phase: "disk-load",
      virtualAddress: { page: 2, offset: 7 },
      tlb: baseTlb,
      tlbHit: false,
      pageTable: basePageTable,
      pageTableChecked: true,
      physicalAddress: null,
      pageFault: true,
      diskLoad: true,
      description:
        "OS가 디스크에서 페이지 2를 읽어 빈 프레임(프레임 11)에 적재합니다. 디스크 I/O는 메모리 접근보다 약 100,000배 느리므로, 이 동안 프로세스는 대기 상태로 전환되고 다른 프로세스가 CPU를 사용합니다.",
    },
    {
      phase: "fault-resolved",
      virtualAddress: { page: 2, offset: 7 },
      tlb: [
        ...baseTlb,
        { virtualPage: 2, physicalFrame: 11 },
      ],
      tlbHit: false,
      pageTable: [
        { virtualPage: 0, physicalFrame: 5, valid: true, onDisk: false },
        { virtualPage: 1, physicalFrame: 8, valid: true, onDisk: false },
        { virtualPage: 2, physicalFrame: 11, valid: true, onDisk: false },
        { virtualPage: 3, physicalFrame: 2, valid: true, onDisk: false },
      ],
      pageTableChecked: true,
      physicalAddress: { frame: 11, offset: 7 },
      pageFault: false,
      diskLoad: false,
      description:
        "디스크 I/O 완료. 페이지 테이블이 갱신되어 페이지 2 -> 프레임 11, valid = 1로 변경됩니다. TLB에도 추가됩니다. 프로세스가 재개되어 물리 주소 (프레임 11, 오프셋 7)에 정상 접근합니다.",
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Presets                                                            */
/* ------------------------------------------------------------------ */

const presets: Record<string, { steps: VmStep[] }> = {
  "tlb-hit": { steps: buildBasicSteps() },
  "tlb-miss": { steps: buildMissSteps() },
  "page-fault": { steps: buildFaultSteps() },
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function VirtualAddressBox({
  page,
  offset,
  active,
}: {
  page: number;
  offset: number;
  active: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
        가상 주소
      </span>
      <div
        className={`flex border-2 transition-all duration-200 ${
          active
            ? "border-sky-400 bg-sky-50 dark:border-sky-500 dark:bg-sky-950/40"
            : "border-border bg-surface"
        }`}
      >
        <div className="border-r border-border px-3 py-2 text-center">
          <span className="block text-[0.5625rem] text-muted">페이지</span>
          <span className="font-mono text-[0.875rem] font-bold text-sky-700 dark:text-sky-300">
            {page}
          </span>
        </div>
        <div className="px-3 py-2 text-center">
          <span className="block text-[0.5625rem] text-muted">오프셋</span>
          <span className="font-mono text-[0.875rem] font-bold text-sky-600 dark:text-sky-400">
            {offset}
          </span>
        </div>
      </div>
    </div>
  );
}

function PhysicalAddressBox({
  frame,
  offset,
}: {
  frame: number;
  offset: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
        물리 주소
      </span>
      <div className="flex border-2 border-emerald-400 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/40">
        <div className="border-r border-emerald-300 dark:border-emerald-600 px-3 py-2 text-center">
          <span className="block text-[0.5625rem] text-muted">프레임</span>
          <span className="font-mono text-[0.875rem] font-bold text-emerald-700 dark:text-emerald-300">
            {frame}
          </span>
        </div>
        <div className="px-3 py-2 text-center">
          <span className="block text-[0.5625rem] text-muted">오프셋</span>
          <span className="font-mono text-[0.875rem] font-bold text-emerald-600 dark:text-emerald-400">
            {offset}
          </span>
        </div>
      </div>
    </div>
  );
}

function TlbTable({
  entries,
  lookupPage,
  hit,
}: {
  entries: TlbEntry[];
  lookupPage: number | null;
  hit: boolean | null;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
          TLB
        </span>
        {hit === true && (
          <span className="px-1.5 py-0.5 text-[0.5625rem] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
            HIT
          </span>
        )}
        {hit === false && (
          <span className="px-1.5 py-0.5 text-[0.5625rem] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
            MISS
          </span>
        )}
      </div>
      <div className="space-y-0.5">
        <div className="flex gap-0.5">
          <span className="w-16 px-2 py-0.5 text-[0.5625rem] font-bold text-muted bg-neutral-100 dark:bg-neutral-800">
            V.Page
          </span>
          <span className="w-16 px-2 py-0.5 text-[0.5625rem] font-bold text-muted bg-neutral-100 dark:bg-neutral-800">
            Frame
          </span>
        </div>
        {entries.map((entry, i) => {
          const isMatch = lookupPage !== null && entry.virtualPage === lookupPage;
          return (
            <div
              key={i}
              className={`flex gap-0.5 transition-all duration-200 ${
                isMatch && hit === true
                  ? "ring-2 ring-emerald-400/40 dark:ring-emerald-500/30"
                  : ""
              }`}
            >
              <span
                className={`w-16 px-2 py-0.5 font-mono text-[0.6875rem] font-bold text-center border ${
                  isMatch && hit === true
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "border-border bg-surface text-text"
                }`}
              >
                {entry.virtualPage}
              </span>
              <span
                className={`w-16 px-2 py-0.5 font-mono text-[0.6875rem] text-center border ${
                  isMatch && hit === true
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "border-border bg-surface text-text"
                }`}
              >
                {entry.physicalFrame}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PageTableView({
  entries,
  lookupPage,
  checked,
  pageFault,
}: {
  entries: PageTableEntry[];
  lookupPage: number;
  checked: boolean;
  pageFault: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
          페이지 테이블
        </span>
        {checked && !pageFault && (
          <span className="px-1.5 py-0.5 text-[0.5625rem] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
            VALID
          </span>
        )}
        {pageFault && (
          <span className="px-1.5 py-0.5 text-[0.5625rem] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
            PAGE FAULT
          </span>
        )}
      </div>
      <div className="space-y-0.5">
        <div className="flex gap-0.5">
          <span className="w-14 px-1.5 py-0.5 text-[0.5625rem] font-bold text-muted bg-neutral-100 dark:bg-neutral-800">
            V.Page
          </span>
          <span className="w-14 px-1.5 py-0.5 text-[0.5625rem] font-bold text-muted bg-neutral-100 dark:bg-neutral-800">
            Frame
          </span>
          <span className="w-12 px-1.5 py-0.5 text-[0.5625rem] font-bold text-muted bg-neutral-100 dark:bg-neutral-800">
            Valid
          </span>
          <span className="w-12 px-1.5 py-0.5 text-[0.5625rem] font-bold text-muted bg-neutral-100 dark:bg-neutral-800">
            Disk
          </span>
        </div>
        {entries.map((entry, i) => {
          const isLookup = checked && entry.virtualPage === lookupPage;
          const isFaultRow = isLookup && pageFault;
          return (
            <div
              key={i}
              className={`flex gap-0.5 transition-all duration-200 ${
                isFaultRow
                  ? "ring-2 ring-rose-400/40 dark:ring-rose-500/30"
                  : isLookup
                    ? "ring-2 ring-amber-400/40 dark:ring-amber-500/30"
                    : ""
              }`}
            >
              <span
                className={`w-14 px-1.5 py-0.5 font-mono text-[0.6875rem] font-bold text-center border ${
                  isLookup
                    ? isFaultRow
                      ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-600 dark:bg-rose-950/40 dark:text-rose-300"
                      : "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-300"
                    : "border-border bg-surface text-text"
                }`}
              >
                {entry.virtualPage}
              </span>
              <span
                className={`w-14 px-1.5 py-0.5 font-mono text-[0.6875rem] text-center border ${
                  isLookup
                    ? isFaultRow
                      ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-600 dark:bg-rose-950/40 dark:text-rose-300"
                      : "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-300"
                    : "border-border bg-surface text-text"
                }`}
              >
                {entry.physicalFrame ?? "-"}
              </span>
              <span
                className={`w-12 px-1.5 py-0.5 font-mono text-[0.6875rem] text-center border ${
                  isLookup
                    ? isFaultRow
                      ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-600 dark:bg-rose-950/40 dark:text-rose-300"
                      : "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-300"
                    : "border-border bg-surface text-text"
                }`}
              >
                {entry.valid ? "1" : "0"}
              </span>
              <span
                className={`w-12 px-1.5 py-0.5 font-mono text-[0.6875rem] text-center border ${
                  isLookup
                    ? isFaultRow
                      ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-600 dark:bg-rose-950/40 dark:text-rose-300"
                      : "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-300"
                    : "border-border bg-surface text-text"
                }`}
              >
                {entry.onDisk ? "Y" : "-"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DiskIndicator({ loading }: { loading: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
        디스크 (스왑)
      </span>
      <div
        className={`border-2 px-4 py-2 text-center transition-all duration-200 ${
          loading
            ? "border-orange-400 bg-orange-50 dark:border-orange-500 dark:bg-orange-950/40"
            : "border-border bg-surface"
        }`}
      >
        <span
          className={`text-[0.75rem] font-bold ${
            loading
              ? "text-orange-700 dark:text-orange-300"
              : "text-muted/40"
          }`}
        >
          {loading ? "I/O 진행 중..." : "대기"}
        </span>
      </div>
    </div>
  );
}

function FlowArrow({ label, active, color }: { label: string; active: boolean; color: string }) {
  const colorMap: Record<string, string> = {
    sky: active
      ? "text-sky-500 dark:text-sky-400"
      : "text-muted/20",
    amber: active
      ? "text-amber-500 dark:text-amber-400"
      : "text-muted/20",
    emerald: active
      ? "text-emerald-500 dark:text-emerald-400"
      : "text-muted/20",
    rose: active
      ? "text-rose-500 dark:text-rose-400"
      : "text-muted/20",
    orange: active
      ? "text-orange-500 dark:text-orange-400"
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

interface VirtualMemoryProps {
  preset?: string;
}

export function VirtualMemory({ preset = "tlb-hit" }: VirtualMemoryProps) {
  const data = presets[preset] ?? presets["tlb-hit"];

  const stepNodes = data.steps.map((step, idx) => {
    const pColor = phaseColors[step.phase] ?? phaseColors["start"];
    const showTlb = step.phase !== "start" || idx > 0;
    const showPageTable = step.pageTableChecked;
    const showPhysical = step.physicalAddress !== null;

    return (
      <div key={idx} className="space-y-4">
        {/* Phase label */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-2 py-0.5 font-mono text-[0.5625rem] font-bold ${pColor.bg} ${pColor.text}`}
          >
            {step.phase === "start" && "CPU 접근 요청"}
            {step.phase === "tlb" && (step.tlbHit ? "TLB HIT" : "TLB MISS")}
            {step.phase === "page-table" && "페이지 테이블 조회"}
            {step.phase === "resolved" && "변환 완료"}
            {step.phase === "page-fault" && "PAGE FAULT"}
            {step.phase === "disk-load" && "디스크 I/O"}
            {step.phase === "fault-resolved" && "페이지 폴트 해결"}
          </span>
          <span className="font-mono text-[0.5625rem] text-muted">
            단계 {idx + 1} / {data.steps.length}
          </span>
        </div>

        {/* Flow diagram */}
        <div className="flex flex-col items-center gap-1">
          {/* Virtual Address */}
          <VirtualAddressBox
            page={step.virtualAddress.page}
            offset={step.virtualAddress.offset}
            active={step.phase === "start"}
          />

          <FlowArrow
            label="TLB 조회"
            active={showTlb}
            color="sky"
          />

          {/* TLB */}
          <TlbTable
            entries={step.tlb}
            lookupPage={showTlb ? step.virtualAddress.page : null}
            hit={step.tlbHit}
          />

          {/* Arrow to page table (only on miss) */}
          {(step.tlbHit === false || showPageTable) && (
            <FlowArrow
              label="페이지 테이블 조회"
              active={showPageTable || step.tlbHit === false}
              color="amber"
            />
          )}

          {/* Page Table (show on miss) */}
          {(step.tlbHit === false || showPageTable) && (
            <PageTableView
              entries={step.pageTable}
              lookupPage={step.virtualAddress.page}
              checked={step.pageTableChecked}
              pageFault={step.pageFault}
            />
          )}

          {/* Disk load */}
          {(step.pageFault || step.diskLoad) && (
            <>
              <FlowArrow label="디스크 적재" active={step.diskLoad} color="orange" />
              <DiskIndicator loading={step.diskLoad} />
            </>
          )}

          {/* Arrow to physical */}
          {(showPhysical || step.pageTableChecked) && (
            <FlowArrow
              label={showPhysical ? "물리 주소 획득" : "변환 중..."}
              active={showPhysical}
              color="emerald"
            />
          )}

          {/* Physical Address */}
          {showPhysical && step.physicalAddress && (
            <PhysicalAddressBox
              frame={step.physicalAddress.frame}
              offset={step.physicalAddress.offset}
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
