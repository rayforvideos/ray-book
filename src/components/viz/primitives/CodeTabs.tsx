"use client";

import { useEffect, useMemo, useState } from "react";
import { codeToHtml } from "shiki";

interface Tab {
  label: string;
  lang: string;
  code: string;
}

/* ─── Presets ─── */

const PRESETS: Record<string, Tab[]> = {
  "counter-comparison": [
    {
      label: "React",
      lang: "jsx",
      code: `import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      클릭: {count}
    </button>
  );
}`,
    },
    {
      label: "Vue",
      lang: "html",
      code: `<script setup>
import { ref } from 'vue';
const count = ref(0);
</script>

<template>
  <button @click="count++">
    클릭: {{ count }}
  </button>
</template>`,
    },
    {
      label: "Angular",
      lang: "typescript",
      code: `@Component({
  selector: 'app-counter',
  standalone: true,
  template: \`
    <button (click)="count = count + 1">
      클릭: {{ count }}
    </button>
  \`,
})
export class CounterComponent {
  count = 0;
}`,
    },
    {
      label: "Svelte",
      lang: "html",
      code: `<script>
  let count = $state(0);
</script>

<button onclick={() => count++}>
  클릭: {count}
</button>`,
    },
  ],
  "component-definition": [
    {
      label: "React",
      lang: "jsx",
      code: `// 함수 = 컴포넌트
function TodoItem({ text, done, onToggle }) {
  return (
    <li onClick={onToggle} style={{ textDecoration: done ? 'line-through' : 'none' }}>
      {text}
    </li>
  );
}`,
    },
    {
      label: "Vue",
      lang: "html",
      code: `<!-- 단일 파일 컴포넌트 (SFC) -->
<script setup>
defineProps(['text', 'done']);
const emit = defineEmits(['toggle']);
</script>

<template>
  <li @click="emit('toggle')" :style="{ textDecoration: done ? 'line-through' : 'none' }">
    {{ text }}
  </li>
</template>`,
    },
    {
      label: "Angular",
      lang: "typescript",
      code: `// 클래스 + 데코레이터 = 컴포넌트
@Component({
  selector: 'app-todo-item',
  standalone: true,
  template: \`
    <li (click)="toggle.emit()" [style.textDecoration]="done ? 'line-through' : 'none'">
      {{ text }}
    </li>
  \`,
})
export class TodoItemComponent {
  @Input() text = '';
  @Input() done = false;
  @Output() toggle = new EventEmitter();
}`,
    },
    {
      label: "Svelte",
      lang: "html",
      code: `<!-- .svelte 파일 = 컴포넌트 -->
<script>
  let { text, done, ontoggle } = $props();
</script>

<li onclick={ontoggle} style:text-decoration={done ? 'line-through' : 'none'}>
  {text}
</li>`,
    },
  ],
  "slots-children": [
    {
      label: "React",
      lang: "jsx",
      code: `function Card({ title, children }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="body">{children}</div>
    </div>
  );
}

// 사용
<Card title="공지">
  <p>내용이 여기에 들어갑니다</p>
</Card>`,
    },
    {
      label: "Vue",
      lang: "html",
      code: `<template>
  <div class="card">
    <h2>{{ title }}</h2>
    <div class="body">
      <slot />  <!-- 기본 슬롯 -->
    </div>
  </div>
</template>

<!-- 사용 -->
<Card title="공지">
  <p>내용이 여기에 들어갑니다</p>
</Card>`,
    },
    {
      label: "Angular",
      lang: "typescript",
      code: `@Component({
  selector: 'app-card',
  template: \`
    <div class="card">
      <h2>{{ title }}</h2>
      <div class="body">
        <ng-content />  <!-- 콘텐츠 프로젝션 -->
      </div>
    </div>
  \`,
})
export class CardComponent {
  @Input() title = '';
}

<!-- 사용 -->
<app-card title="공지">
  <p>내용이 여기에 들어갑니다</p>
</app-card>`,
    },
    {
      label: "Svelte",
      lang: "html",
      code: `<script>
  let { title, children } = $props();
</script>

<div class="card">
  <h2>{title}</h2>
  <div class="body">
    {@render children()}
  </div>
</div>

<!-- 사용 -->
<Card title="공지">
  <p>내용이 여기에 들어갑니다</p>
</Card>`,
    },
  ],
  "global-store": [
    {
      label: "React",
      lang: "jsx",
      code: `import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}));

function Counter() {
  const { count, increment } = useStore();
  return <button onClick={increment}>{count}</button>;
}`,
    },
    {
      label: "Vue",
      lang: "javascript",
      code: `// stores/counter.js
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCounter = defineStore('counter', () => {
  const count = ref(0);
  function increment() { count.value++; }
  return { count, increment };
});

// Component
const store = useCounter();`,
    },
    {
      label: "Angular",
      lang: "typescript",
      code: `// counter.store.ts
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

export const CounterStore = signalStore(
  withState({ count: 0 }),
  withMethods((store) => ({
    increment: () => patchState(store, { count: store.count() + 1 }),
  }))
);

// Component
store = inject(CounterStore);`,
    },
    {
      label: "Svelte",
      lang: "javascript",
      code: `// counter.svelte.js
export const counter = $state({ count: 0 });
export function increment() { counter.count++; }

// Component (Counter.svelte)
// <script>
//   import { counter, increment } from './counter.svelte.js';
// </script>
// <button onclick={increment}>{counter.count}</button>`,
    },
  ],
  "conditional-rendering": [
    {
      label: "React",
      lang: "jsx",
      code: `function UserGreeting({ user }) {
  return (
    <div>
      {user ? (
        <h1>안녕하세요, {user.name}님</h1>
      ) : (
        <h1>로그인해주세요</h1>
      )}
      {user?.isAdmin && <AdminPanel />}
    </div>
  );
}`,
    },
    {
      label: "Vue",
      lang: "html",
      code: `<template>
  <div>
    <h1 v-if="user">안녕하세요, {{ user.name }}님</h1>
    <h1 v-else>로그인해주세요</h1>
    <AdminPanel v-if="user?.isAdmin" />
  </div>
</template>`,
    },
    {
      label: "Angular",
      lang: "html",
      code: `<div>
  @if (user) {
    <h1>안녕하세요, {{ user.name }}님</h1>
  } @else {
    <h1>로그인해주세요</h1>
  }
  @if (user?.isAdmin) {
    <app-admin-panel />
  }
</div>`,
    },
    {
      label: "Svelte",
      lang: "html",
      code: `<div>
  {#if user}
    <h1>안녕하세요, {user.name}님</h1>
  {:else}
    <h1>로그인해주세요</h1>
  {/if}
  {#if user?.isAdmin}
    <AdminPanel />
  {/if}
</div>`,
    },
  ],
  "list-rendering": [
    {
      label: "React",
      lang: "jsx",
      code: `function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          {todo.text}
        </li>
      ))}
    </ul>
  );
}`,
    },
    {
      label: "Vue",
      lang: "html",
      code: `<template>
  <ul>
    <li v-for="todo in todos" :key="todo.id">
      {{ todo.text }}
    </li>
  </ul>
</template>`,
    },
    {
      label: "Angular",
      lang: "html",
      code: `<ul>
  @for (todo of todos; track todo.id) {
    <li>{{ todo.text }}</li>
  }
</ul>`,
    },
    {
      label: "Svelte",
      lang: "html",
      code: `<ul>
  {#each todos as todo (todo.id)}
    <li>{todo.text}</li>
  {/each}
</ul>`,
    },
  ],
  "reactivity-state": [
    {
      label: "React",
      lang: "jsx",
      code: `import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  // 상태 변경 → 컴포넌트 전체 re-render
  return (
    <button onClick={() => setCount(c => c + 1)}>
      {count}
    </button>
  );
}`,
    },
    {
      label: "Vue",
      lang: "html",
      code: `<script setup>
import { ref } from 'vue';

// ref() → Proxy로 감싸서 자동 추적
const count = ref(0);
</script>

<template>
  <!-- count.value 변경 → 이 컴포넌트만 re-render -->
  <button @click="count++">{{ count }}</button>
</template>`,
    },
    {
      label: "Angular",
      lang: "typescript",
      code: `import { Component, signal } from '@angular/core';

@Component({
  template: \`
    <!-- signal 값 변경 → 세밀한 업데이트 -->
    <button (click)="increment()">
      {{ count() }}
    </button>
  \`,
})
export class Counter {
  count = signal(0);
  increment() { this.count.update(c => c + 1); }
}`,
    },
    {
      label: "Svelte",
      lang: "html",
      code: `<script>
  // 컴파일러가 반응성 코드를 자동 생성
  let count = $state(0);
</script>

<!-- count 변경 → 직접 DOM 업데이트 (VDOM 없음) -->
<button onclick={() => count++}>
  {count}
</button>`,
    },
  ],
};

interface CodeTabsProps {
  tabs?: Tab[];
  preset?: string;
}

const STORAGE_KEY = "ray-book-code-tab";

const FRAMEWORK_COLORS: Record<string, string> = {
  React: "sky",
  Vue: "emerald",
  Angular: "rose",
  Svelte: "orange",
};

const INDICATOR_CLASSES: Record<string, string> = {
  React: "bg-sky-500",
  Vue: "bg-emerald-500",
  Angular: "bg-rose-500",
  Svelte: "bg-orange-500",
};

const TEXT_CLASSES: Record<string, string> = {
  React: "text-sky-600 dark:text-sky-400",
  Vue: "text-emerald-600 dark:text-emerald-400",
  Angular: "text-rose-600 dark:text-rose-400",
  Svelte: "text-orange-600 dark:text-orange-400",
};

function getDefaultTab(tabs: Tab[]): string {
  if (typeof window === "undefined") return tabs[0]?.label ?? "";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && tabs.some((t) => t.label === stored)) return stored;
  return tabs[0]?.label ?? "";
}

export function CodeTabs({ tabs: tabsProp, preset }: CodeTabsProps) {
  const tabs = useMemo(
    () => tabsProp ?? (preset ? PRESETS[preset] : undefined) ?? [],
    [tabsProp, preset]
  );
  const [activeLabel, setActiveLabel] = useState<string>(
    () => tabs[0]?.label ?? ""
  );
  const [htmlCache, setHtmlCache] = useState<Record<string, string>>({});

  // Restore from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && tabs.some((t) => t.label === stored)) {
      setActiveLabel(stored);
    }
  }, [tabs]);

  // Highlight active tab lazily
  useEffect(() => {
    if (!activeLabel) return;
    if (htmlCache[activeLabel]) return;

    const tab = tabs.find((t) => t.label === activeLabel);
    if (!tab) return;

    codeToHtml(tab.code, {
      lang: tab.lang,
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      defaultColor: false,
    }).then((html) => {
      setHtmlCache((prev) => ({ ...prev, [activeLabel]: html }));
    });
  }, [activeLabel, tabs, htmlCache]);

  function handleTabClick(label: string) {
    setActiveLabel(label);
    localStorage.setItem(STORAGE_KEY, label);
  }

  if (tabs.length === 0) return null;

  const activeHtml = htmlCache[activeLabel] ?? "";

  return (
    <div className="my-8 border border-border rounded-md overflow-hidden">
      {/* Tab bar */}
      <div className="border-b border-border flex">
        {tabs.map((tab) => {
          const isActive = tab.label === activeLabel;
          const indicatorClass =
            INDICATOR_CLASSES[tab.label] ?? "bg-zinc-500";
          const textClass = TEXT_CLASSES[tab.label] ?? "text-zinc-600 dark:text-zinc-400";

          return (
            <button
              key={tab.label}
              onClick={() => handleTabClick(tab.label)}
              className={[
                "relative px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? textClass
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {tab.label}
              {isActive && (
                <span
                  className={[
                    "absolute bottom-0 left-0 right-0 h-0.5",
                    indicatorClass,
                  ].join(" ")}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Code area */}
      <div
        className="overflow-x-auto text-[0.8125rem] [&_pre]:p-5 [&_pre]:leading-relaxed"
        style={{ minHeight: "120px" }}
      >
        {activeHtml ? (
          <div dangerouslySetInnerHTML={{ __html: activeHtml }} />
        ) : (
          <pre className="p-5 leading-relaxed text-muted-foreground">
            {tabs.find((t) => t.label === activeLabel)?.code ?? ""}
          </pre>
        )}
      </div>
    </div>
  );
}
