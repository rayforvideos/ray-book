"use client";

import { useState } from "react";

interface ManifestField {
  key: string;
  value: string;
  description: string;
  impact: string;
}

const fields: ManifestField[] = [
  {
    key: "name",
    value: '"My Notes"',
    description: "앱의 전체 이름",
    impact: "설치 대화상자, 스플래시 화면에 표시됩니다.",
  },
  {
    key: "short_name",
    value: '"Notes"',
    description: "짧은 이름 (12자 이내 권장)",
    impact: "홈 화면 아이콘 아래에 표시됩니다. name이 길면 잘리므로 short_name이 사용됩니다.",
  },
  {
    key: "start_url",
    value: '"/"',
    description: "앱 실행 시 열리는 URL",
    impact:
      '홈 화면에서 앱을 탭하면 이 URL이 열립니다. "/?source=pwa"처럼 파라미터를 추가해 설치된 앱에서의 접근을 추적할 수 있습니다.',
  },
  {
    key: "scope",
    value: '"/"',
    description: "앱으로 동작하는 URL 범위",
    impact:
      "이 범위를 벗어나는 탐색은 일반 브라우저 탭에서 열립니다. SW의 scope와 일치시키는 것이 좋습니다.",
  },
  {
    key: "display",
    value: '"standalone"',
    description: "앱의 표시 모드",
    impact:
      "standalone: 브라우저 UI 없이 독립 창. minimal-ui: 최소 탐색 UI. fullscreen: 전체 화면. browser: 일반 탭.",
  },
  {
    key: "background_color",
    value: '"#ffffff"',
    description: "스플래시 화면의 배경색",
    impact:
      "앱 시작 시 HTML이 로드되기 전에 표시되는 스플래시 화면의 배경색입니다. CSS의 body 배경색과 일치시키면 자연스럽습니다.",
  },
  {
    key: "theme_color",
    value: '"#4f46e5"',
    description: "OS 수준의 테마 색상",
    impact:
      "Android의 상태 표시줄, 작업 전환기의 헤더 색상에 사용됩니다. HTML의 <meta name=\"theme-color\">과 일치시키세요.",
  },
  {
    key: "icons",
    value: "[192px, 512px, maskable]",
    description: "앱 아이콘 배열",
    impact:
      "최소 192x192(홈 화면)와 512x512(스플래시)가 필요합니다. maskable 아이콘을 별도로 제공하면 Android에서 적응형 아이콘이 적용됩니다.",
  },
];

export function PwaManifest() {
  const [selected, setSelected] = useState(0);
  const field = fields[selected];

  return (
    <div className="my-8 border border-border p-5">
      <div className="mb-4 flex flex-wrap gap-1.5">
        {fields.map((f, i) => (
          <button
            key={f.key}
            onClick={() => setSelected(i)}
            className={`rounded px-2.5 py-1 text-xs font-mono transition-colors ${
              i === selected
                ? "bg-accent text-white"
                : "bg-muted/10 text-muted hover:text-text"
            }`}
          >
            {f.key}
          </button>
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-baseline gap-3">
          <code className="text-sm font-semibold text-accent">{field.key}</code>
          <code className="text-xs text-muted">{field.value}</code>
        </div>

        <p className="mb-3 text-sm font-medium leading-relaxed">
          {field.description}
        </p>

        <div className="rounded bg-muted/5 border border-border px-4 py-3">
          <p className="text-sm leading-relaxed text-muted">{field.impact}</p>
        </div>
      </div>
    </div>
  );
}
