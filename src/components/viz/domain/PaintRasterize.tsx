"use client";

import { StepPlayer } from "../primitives/StepPlayer";

type PaintPhase =
  | "layout-result"
  | "paint-order"
  | "paint-records"
  | "tiling"
  | "rasterize"
  | "bitmap";

interface PaintRecord {
  command: string;
  target: string;
  active?: boolean;
}

interface TileCell {
  filled: boolean;
  color: string;
  priority?: boolean;
}

interface PaintStep {
  phase: PaintPhase;
  records: PaintRecord[];
  tiles: TileCell[][];
  highlight?: string;
  description: string;
}

interface PresetData {
  steps: PaintStep[];
}

const phaseStyles: Record<PaintPhase, { bg: string; text: string; label: string }> = {
  "layout-result": {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    text: "text-sky-700 dark:text-sky-300",
    label: "레이아웃 결과",
  },
  "paint-order": {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    label: "페인트 순서",
  },
  "paint-records": {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    label: "페인트 레코드",
  },
  tiling: {
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-700 dark:text-violet-300",
    label: "타일 분할",
  },
  rasterize: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    label: "래스터라이제이션",
  },
  bitmap: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    label: "완성된 비트맵",
  },
};

/* ── 8×6 pixel grid helpers ── */

const ROWS = 6;
const COLS = 8;

function emptyGrid(): TileCell[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ filled: false, color: "stone" }))
  );
}

function tiledGrid(): TileCell[][] {
  const grid = emptyGrid();
  // Mark tiles — 4 quadrants with different colors to show tile boundaries
  const tileColors = [
    ["sky", "sky", "sky", "sky", "violet", "violet", "violet", "violet"],
    ["sky", "sky", "sky", "sky", "violet", "violet", "violet", "violet"],
    ["sky", "sky", "sky", "sky", "violet", "violet", "violet", "violet"],
    ["amber", "amber", "amber", "amber", "emerald", "emerald", "emerald", "emerald"],
    ["amber", "amber", "amber", "amber", "emerald", "emerald", "emerald", "emerald"],
    ["amber", "amber", "amber", "amber", "emerald", "emerald", "emerald", "emerald"],
  ];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      grid[r][c] = { filled: false, color: tileColors[r][c] };
    }
  }
  return grid;
}

function rasterizingGrid(): TileCell[][] {
  const grid = tiledGrid();
  // Top-left tile (viewport-near) is being rasterized first — priority
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      grid[r][c] = { filled: true, color: "sky", priority: true };
    }
  }
  // Top-right partially rasterized
  for (let r = 0; r < 2; r++) {
    for (let c = 4; c < 8; c++) {
      grid[r][c] = { filled: true, color: "violet" };
    }
  }
  return grid;
}

function completedGrid(): TileCell[][] {
  const grid = tiledGrid();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      grid[r][c] = { ...grid[r][c], filled: true };
    }
  }
  return grid;
}

/* ── Preset data ── */

const layoutRecords: PaintRecord[] = [
  { command: "위치/크기", target: "body — 0,0 1024×768", active: true },
  { command: "위치/크기", target: ".container — 102,0 819×auto", active: true },
  { command: "위치/크기", target: "h1 — 102,0 819×33", active: true },
  { command: "위치/크기", target: "p.intro — 102,33 819×40", active: true },
  { command: "위치/크기", target: ".overlay — z-index:10, 0,0 200×200", active: true },
];

const paintOrderRecords: PaintRecord[] = [
  { command: "① 루트 배경", target: "body (z-index: auto)", active: true },
  { command: "② 블록 배경/테두리", target: ".container (z-index: auto)", active: true },
  { command: "③ 블록 배경/테두리", target: "h1, p.intro (z-index: auto)", active: true },
  { command: "④ 인라인 텍스트", target: '"Hello", "Welcome"', active: true },
  { command: "⑤ 새 스태킹 컨텍스트", target: ".overlay (z-index: 10)", active: true },
];

const paintRecordList: PaintRecord[] = [
  { command: "drawRect", target: "body 배경 — #ffffff, (0,0)→(1024,768)", active: true },
  { command: "drawRect", target: ".container 배경 — #f8f8f8, (102,0)→(921,768)", active: true },
  { command: "drawRect", target: "h1 배경 — transparent, (102,0)→(921,33)", active: true },
  { command: "drawBorder", target: "h1 하단 테두리 — #eee 1px", active: true },
  { command: "drawText", target: '"Hello" — navy 24px, (102,24)', active: true },
  { command: "drawRect", target: "p.intro 배경 — transparent, (102,33)→(921,73)", active: true },
  { command: "drawText", target: '"Welcome" — #333 16px, (110,60)', active: true },
  { command: "drawRect", target: ".overlay 배경 — rgba(0,0,0,0.5), (0,0)→(200,200)", active: true },
];

const presets: Record<string, PresetData> = {
  basic: {
    steps: [
      {
        phase: "layout-result",
        records: layoutRecords,
        tiles: emptyGrid(),
        description:
          "레이아웃 단계에서 각 요소의 정확한 위치(x, y)와 크기(width, height)가 결정되었습니다. 이제 이 기하학적 정보를 바탕으로 실제 픽셀을 그리는 페인트 단계가 시작됩니다.",
      },
      {
        phase: "paint-order",
        records: paintOrderRecords,
        tiles: emptyGrid(),
        highlight: "스태킹 컨텍스트 순서: 루트 배경 → 블록 배경/테두리 → 인라인 → z-index 양수",
        description:
          "브라우저는 요소를 화면에 그리는 순서를 결정합니다. 스태킹 컨텍스트에 따라 배경 → 테두리 → 인라인 콘텐츠 → positioned 요소 순으로 그립니다. z-index가 높은 요소가 나중에 그려져 위에 보입니다.",
      },
      {
        phase: "paint-records",
        records: paintRecordList,
        tiles: emptyGrid(),
        highlight: "페인트 레코드 = 그리기 명령의 순서 목록 (display list)",
        description:
          "페인트 순서가 정해지면, 브라우저는 각 요소에 대해 구체적인 그리기 명령(페인트 레코드)을 생성합니다. \"이 좌표에 이 색으로 사각형을 그려라\", \"이 위치에 이 폰트로 텍스트를 그려라\" 같은 저수준 명령 목록입니다. 이것을 디스플레이 리스트(display list)라고도 부릅니다.",
      },
      {
        phase: "tiling",
        records: [
          { command: "타일 A", target: "좌상단 (0,0)→(512,384) — 뷰포트 내", active: true },
          { command: "타일 B", target: "우상단 (512,0)→(1024,384) — 뷰포트 내", active: true },
          { command: "타일 C", target: "좌하단 (0,384)→(512,768) — 뷰포트 하단", active: true },
          { command: "타일 D", target: "우하단 (512,384)→(1024,768) — 뷰포트 하단", active: true },
        ],
        tiles: tiledGrid(),
        highlight: "256×256 또는 512×512 크기의 타일로 분할 → 우선순위에 따라 래스터라이즈",
        description:
          "페인트 레코드가 생성되면, 브라우저는 페이지를 타일(tile) 단위로 분할합니다. 전체 페이지를 한 번에 래스터라이즈하는 것은 메모리 낭비이므로, 뷰포트에 가까운 타일부터 우선 처리합니다. 각 타일은 독립적으로 래스터라이즈할 수 있어 병렬 처리가 가능합니다.",
      },
      {
        phase: "rasterize",
        records: [
          { command: "GPU 스레드 1", target: "타일 A 래스터라이즈 중... ██████████ 100%", active: true },
          { command: "GPU 스레드 2", target: "타일 B 래스터라이즈 중... ██████░░░░ 60%", active: true },
          { command: "대기", target: "타일 C — 뷰포트 하단, 낮은 우선순위", active: false },
          { command: "대기", target: "타일 D — 뷰포트 하단, 낮은 우선순위", active: false },
        ],
        tiles: rasterizingGrid(),
        highlight: "벡터 명령 → 비트맵(픽셀) 변환. GPU 래스터 스레드가 병렬 처리",
        description:
          "래스터라이제이션은 페인트 레코드(벡터 명령)를 실제 픽셀(비트맵)로 변환하는 과정입니다. 최신 브라우저는 GPU의 래스터 스레드를 사용해 타일별로 병렬 래스터라이즈합니다. 뷰포트에 보이는 타일이 우선 처리되어 사용자가 빠르게 콘텐츠를 볼 수 있습니다.",
      },
      {
        phase: "bitmap",
        records: [
          { command: "비트맵 완성", target: "타일 A — GPU 메모리에 저장", active: true },
          { command: "비트맵 완성", target: "타일 B — GPU 메모리에 저장", active: true },
          { command: "비트맵 완성", target: "타일 C — GPU 메모리에 저장", active: true },
          { command: "비트맵 완성", target: "타일 D — GPU 메모리에 저장", active: true },
        ],
        tiles: completedGrid(),
        description:
          "모든 타일의 래스터라이제이션이 완료되었습니다. 각 타일은 GPU 메모리에 비트맵으로 저장됩니다. 이 비트맵들은 다음 단계인 합성(Compositing)에서 최종 화면 이미지로 합쳐집니다. 합성 단계에서는 레이어 순서, 변환(transform), 투명도 등을 적용하여 최종 프레임을 만듭니다.",
      },
    ],
  },
};

/* ── Sub-components ── */

function RecordPane({ records }: { records: PaintRecord[] }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="mb-1.5">
        <span className="text-[0.6875rem] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          페인트 레코드
        </span>
      </div>
      <div className="rounded-sm bg-surface p-2 space-y-0.5 overflow-x-auto">
        {records.map((rec, i) => (
          <div key={i} className="flex items-start gap-1.5">
            <span
              className={`shrink-0 inline-block px-1.5 py-px text-[0.625rem] font-mono border transition-colors duration-150 ${
                rec.active
                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
                  : "bg-surface text-muted/40 border-border"
              }`}
            >
              {rec.command}
            </span>
            <span
              className={`text-[0.625rem] font-mono ${
                rec.active ? "text-text" : "text-muted/40"
              }`}
            >
              {rec.target}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PixelGrid({ tiles }: { tiles: TileCell[][] }) {
  const CELL = 28;
  const GAP = 2;
  const width = COLS * (CELL + GAP) + GAP;
  const height = ROWS * (CELL + GAP) + GAP;

  const colorMap: Record<string, { filled: string; empty: string; border: string }> = {
    sky: {
      filled: "rgba(14, 165, 233, 0.55)",
      empty: "rgba(14, 165, 233, 0.08)",
      border: "rgba(14, 165, 233, 0.3)",
    },
    violet: {
      filled: "rgba(139, 92, 246, 0.55)",
      empty: "rgba(139, 92, 246, 0.08)",
      border: "rgba(139, 92, 246, 0.3)",
    },
    amber: {
      filled: "rgba(245, 158, 11, 0.55)",
      empty: "rgba(245, 158, 11, 0.08)",
      border: "rgba(245, 158, 11, 0.3)",
    },
    emerald: {
      filled: "rgba(16, 185, 129, 0.55)",
      empty: "rgba(16, 185, 129, 0.08)",
      border: "rgba(16, 185, 129, 0.3)",
    },
    stone: {
      filled: "rgba(120, 113, 108, 0.35)",
      empty: "rgba(120, 113, 108, 0.05)",
      border: "rgba(120, 113, 108, 0.15)",
    },
  };

  return (
    <div className="flex-1 min-w-0">
      <div className="mb-1.5">
        <span className="text-[0.6875rem] uppercase tracking-wider text-muted">
          픽셀 격자
        </span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[260px] h-auto"
        role="img"
        aria-label="타일별 픽셀 격자 시각화"
      >
        {tiles.map((row, r) =>
          row.map((cell, c) => {
            const cm = colorMap[cell.color] ?? colorMap.stone;
            const x = GAP + c * (CELL + GAP);
            const y = GAP + r * (CELL + GAP);
            return (
              <g key={`${r}-${c}`}>
                <rect
                  x={x}
                  y={y}
                  width={CELL}
                  height={CELL}
                  fill={cell.filled ? cm.filled : cm.empty}
                  stroke={cm.border}
                  strokeWidth={cell.priority ? 2 : 1}
                  rx={2}
                />
                {cell.filled && (
                  <rect
                    x={x + CELL * 0.3}
                    y={y + CELL * 0.3}
                    width={CELL * 0.4}
                    height={CELL * 0.4}
                    fill={cell.filled ? cm.filled : "transparent"}
                    rx={1}
                    opacity={0.7}
                  />
                )}
              </g>
            );
          })
        )}
        {/* Tile boundary lines */}
        <line
          x1={GAP + 4 * (CELL + GAP) - GAP / 2}
          y1={0}
          x2={GAP + 4 * (CELL + GAP) - GAP / 2}
          y2={height}
          stroke="currentColor"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          opacity={0.2}
        />
        <line
          x1={0}
          y1={GAP + 3 * (CELL + GAP) - GAP / 2}
          x2={width}
          y2={GAP + 3 * (CELL + GAP) - GAP / 2}
          stroke="currentColor"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          opacity={0.2}
        />
      </svg>
    </div>
  );
}

/* ── Main component ── */

interface PaintRasterizeProps {
  preset?: string;
}

export function PaintRasterize({ preset = "basic" }: PaintRasterizeProps) {
  const data = presets[preset] ?? presets["basic"];

  const stepNodes = data.steps.map((step, idx) => {
    const ps = phaseStyles[step.phase];

    return (
      <div key={idx} className="space-y-3">
        {/* Phase badge */}
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 font-mono text-[0.625rem] font-bold ${ps.bg} ${ps.text}`}
          >
            {ps.label}
          </span>
        </div>

        <div className="flex gap-3 max-sm:flex-col">
          {/* Left: paint records */}
          <RecordPane records={step.records} />

          {/* Right: pixel grid */}
          <PixelGrid tiles={step.tiles} />
        </div>

        {step.highlight && (
          <div className="bg-accent/10 px-3 py-1.5 font-mono text-[0.6875rem] text-accent">
            {step.highlight}
          </div>
        )}

        <div className="border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
          {step.description}
        </div>
      </div>
    );
  });

  return <StepPlayer steps={stepNodes} />;
}
