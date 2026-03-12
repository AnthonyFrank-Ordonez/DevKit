<script setup lang="ts">
import { ref } from 'vue'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import JSONBig from 'json-bigint'

const JSONsafe = JSONBig({ storeAsString: true, useNativeBigInt: false })
const jsonInput = ref('')
const parsedJson = ref()
const error = ref('')
const copied = ref(false)

function formatJson() {
  error.value = ''
  parsedJson.value = null
  try {
    let parsed = JSONsafe.parse(jsonInput.value)
    if (typeof parsed === 'string') parsed = JSON.parse(parsed)
    parsedJson.value = parsed
  } catch (e) {
    error.value = (e as Error).message
  }
}

function copyOutput() {
  if (!parsedJson.value) return
  navigator.clipboard.writeText(JSONsafe.stringify(parsedJson.value, null, 2))
  copied.value = true
  setTimeout(() => (copied.value = false), 1800)
}

function clearAll() {
  jsonInput.value = ''
  parsedJson.value = null
  error.value = ''
}
</script>

<template>
  <div class="">
    <div class="flex flex-col gap-2">
      <h1 class="text-3xl font-extrabold tracking-tight text-white">JSON Formatter</h1>
      <p class="text-muted text-sm font-semibold tracking-widest uppercase">
        Parse · Validate · Beautify
      </p>
    </div>

    <!-- Input Card (Raw Input) -->
    <div
      class="focus-within:border-accent/50 mt-5 overflow-hidden rounded-xl border border-white/10 transition-colors"
    >
      <div class="flex items-center justify-between border-b border-white/5 bg-white/2 px-4 py-2">
        <span
          class="flex items-center gap-2 text-[11px] font-bold tracking-widest text-slate-500 uppercase"
        >
          <span class="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_6px_#fbbf24]"></span>
          Raw Input
        </span>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2">
          <button
            @click="formatJson"
            data-testid="format-btn"
            class="bg-accent hover:bg-accent-hover/70 cursor-pointer rounded-md border border-white/10 px-3 py-1 text-[12px] font-semibold text-white transition-all hover:border-white/20"
          >
            <span class="h-2 w-2 rounded-full"></span>
            Format
          </button>

          <button
            @click="clearAll"
            data-testid="clear-btn"
            class="rounded-md border border-white/10 px-3 py-1 text-[12px] font-semibold text-slate-500 transition-all hover:border-white/20 hover:text-slate-300"
          >
            Clear
          </button>
        </div>
      </div>

      <textarea
        v-model="jsonInput"
        data-testid="json-input"
        placeholder='Paste your JSON here… e.g. {"name":"Tony","age":25}'
        class="custom-scroll w-full resize-y bg-transparent p-5 font-mono text-sm text-slate-300 placeholder-slate-700 outline-none"
        rows="15"
        spellcheck="false"
      ></textarea>
    </div>
  </div>

  <!-- Error -->
  <div
    v-if="error"
    class="bg-error/10 mt-5 flex items-center gap-3 rounded-xl border border-red-500/30 px-4 py-3 font-mono text-[12.5px] text-red-400"
    data-testid="error-message"
  >
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="shrink-0">
      <circle cx="8" cy="8" r="7" stroke="#ff5370" stroke-width="1.5" />
      <path d="M8 5v4M8 11v.5" stroke="#ff5370" stroke-width="1.8" stroke-linecap="round" />
    </svg>
    {{ error }}
  </div>

  <!-- Formatted JSON -->
  <div
    v-if="parsedJson !== null && parsedJson !== undefined"
    class="bg-elevated/10 mt-5 animate-[fadeUp_0.25s_ease] overflow-hidden rounded-xl border border-white/10"
    data-testid="formatted-json"
  >
    <div class="flex items-center justify-between border-b border-white/5 bg-white/2 px-4 py-2">
      <span
        class="flex items-center gap-2 text-[11px] font-bold tracking-widest text-slate-500 uppercase"
      >
        <span class="bg-success h-2 w-2 rounded-full shadow-[0_0_6px_#34d399]"></span>
        Formatted Output
      </span>

      <button
        @click="copyOutput"
        data-testid="copy-btn"
        class="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1 text-[12px] font-semibold transition-all hover:border-white/20"
        :class="copied ? 'text-success' : 'text-slate-500 hover:text-slate-300'"
      >
        <svg v-if="!copied" width="13" height="13" viewBox="0 0 14 14" fill="none">
          <rect
            x="4"
            y="4"
            width="9"
            height="9"
            rx="1.5"
            stroke="currentColor"
            stroke-width="1.4"
          />
          <path
            d="M1 10V1h9"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>

        <svg v-else width="13" height="13" viewBox="0 0 14 14" fill="none">
          <path
            d="M2 7l4 4 6-6"
            stroke="#34d399"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>

    <!-- VueJsonPretty renders here -->
    <div class="vjp-dark overflow-x-auto p-5">
      <VueJsonPretty
        :data="parsedJson"
        :deep="3"
        show-line-number
        show-double-quotes
        :show-length="true"
        :dynamic-height="true"
        theme="dark"
      />
    </div>
  </div>
</template>

<style scoped>
/* Override vue-json-pretty to match dark theme */
.vjp-dark .vjs-tree {
  font-family: 'JetBrains Mono', 'Fira Code', monospace !important;
  font-size: 13px !important;
  line-height: 1.8 !important;
  background: transparent !important;
  color: #c8d3e8 !important;
}

.vjp-dark .vjs-tree .vjs-key {
  color: #82aaff !important;
  font-weight: 500 !important;
}

.vjp-dark .vjs-value-string {
  color: #c3e88d !important;
}

.vjp-dark .vjs-value-number {
  color: #f78c6c !important;
}

.vjp-dark .vjs-value-boolean {
  color: #c792ea !important;
}

.vjp-dark .vjs-value-null {
  color: #ff5370 !important;
}

.vjp-dark .vjs-tree-brackets {
  color: #637a91 !important;
}

.vjp-dark .vjs-tree-node:hover {
  background: rgba(255, 255, 255, 0.04) !important;
  border-radius: 4px;
}

.vjp-dark .vjs-tree-node.is-highlight,
.vjp-dark .vjs-tree-node--highlight {
  background: rgba(130, 170, 255, 0.06) !important;
}

.vjp-dark .vjs-line-number {
  color: #3a4456 !important;
  user-select: none;
  min-width: 2rem;
}

/* Custom Scrollbar */
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(82, 82, 82, 0.5);
  border-radius: 99px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(82, 82, 82, 0.5);
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
