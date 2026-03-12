<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const testString = ref('')
const result = ref<string[] | null>(null)
const testResult = ref<boolean | null>(null)
const error = ref<string | null>(null)
const copied = ref(false)
const startAnchor = ref(false)
const endAnchor = ref(false)

const flags = ref({
  g: false,
  i: false,
  m: false,
})

const regexAnchors = ref([
  { label: 'Start ^', value: '^' },
  { label: 'End $', value: '$' },
])

const regexBtns = ref([
  { id: 'digit', label: 'Digit', baseValue: '\\d', value: '\\d', active: false },
  { id: 'non-digit', label: 'Non Digit', baseValue: '\\D', value: '\\D', active: false },
  { id: 'lowercase', label: 'Lowercase', baseValue: '[a-z]', value: '[a-z]', active: false },
  { id: 'uppercase', label: 'Uppercase', baseValue: '[A-Z]', value: '[A-Z]', active: false },
  { id: 'letter', label: 'Letter', baseValue: '[a-zA-Z]', value: '[a-zA-Z]', active: false },
  {
    id: 'alphanumeric',
    label: 'Alphanumeric',
    baseValue: '[a-zA-Z0-9]',
    value: '[a-zA-Z0-9]',
    active: false,
  },
  { id: 'whitespace', label: 'Whitespace', baseValue: '\\s', value: '\\s', active: false },
  { id: 'any', label: 'Any Character', baseValue: '.', value: '.', active: false },
])

const quantifiers = ref([
  { label: '+', value: '+' },
  { label: '*', value: '*' },
  { label: '?', value: '?' },
  { label: '{n}', value: '{n}' },
  { label: '{n,m}', value: '{n,m}' },
])

const flagString = computed(() => {
  return Object.entries(flags.value)
    .filter(([, value]) => value)
    .map(([key]) => key)
    .join('')
})

const regexPattern = computed(() => {
  return regexBtns.value
    .filter((btn) => btn.active)
    .map((btn) => btn.value)
    .join('')
})

const fullPattern = computed(() => {
  return `${startAnchor.value ? '^' : ''}${regexPattern.value}${endAnchor.value ? '$' : ''}`
})

const fullRegex = computed(() => {
  if (!fullPattern.value) return ''
  return `/${fullPattern.value}/${flagString.value}`
})

function applyAnchor(value: string) {
  if (value === '^') {
    startAnchor.value = !startAnchor.value
  }
  if (value === '$') {
    endAnchor.value = !endAnchor.value
  }
}

function applyQuantifier(quantifier: string) {
  const lastActive = regexBtns.value.filter((b) => b.active).slice(-1)[0]
  if (!lastActive) return

  let resolved = quantifier
  if (quantifier === '{n}') {
    const n = prompt('Enter exact count (n):')
    if (!n || isNaN(Number(n))) return
    resolved = `{${n}}`
  } else if (quantifier === '{n,m}') {
    const n = prompt('Enter minimum (n):')
    const m = prompt('Enter maximum (m):')
    if (!n || !m || isNaN(Number(n)) || isNaN(Number(m))) return
    resolved = `{${n},${m}}`
  }

  // Strip any trailing quantifier (+, *, ?, {…}) before appending the new one.
  lastActive.value = lastActive.baseValue.replace(/([+*?]|\{\d+(,\d*)?\})$/, '') + resolved
}

function toggleRegexBtn(id: string) {
  const btn = regexBtns.value.find((b) => b.id === id)

  if (!btn) return

  btn.active = !btn.active

  if (!btn.active) {
    btn.value = btn.baseValue
  }
}

function copyRegexPattern() {
  if (!fullRegex.value) return
  navigator.clipboard.writeText(fullRegex.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 1800)
}

function clearRegexPattern() {
  regexBtns.value.forEach((b) => (b.active = false))
  testString.value = ''
  result.value = null
  error.value = null
  startAnchor.value = false
  endAnchor.value = false
}

function clearTestString() {
  testString.value = ''
  result.value = null
  error.value = null
}

function testRegex() {
  if (testString.value === '') {
    alert('Please enter a test string')
    return
  }

  error.value = null
  result.value = null
  testResult.value = false

  try {
    const regex = new RegExp(fullPattern.value, flagString.value)
    const matches = testString.value.match(regex)

    result.value = matches ? Array.from(matches) : null
    testResult.value = matches !== null && matches.length > 0
  } catch (e) {
    error.value = (e as Error).message
  }
}

watch(testString, () => {
  result.value = null
  error.value = null
  testResult.value = null
})
</script>

<template>
  <div>
    <div class="flex flex-col gap-2">
      <h1 class="text-3xl font-extrabold tracking-tight text-white">Regex Builder</h1>
      <p class="text-muted text-sm font-semibold tracking-widest uppercase">Build · Copy · Test</p>
    </div>

    <!-- How to use -->
    <div class="mt-5 overflow-hidden rounded-xl border border-white/10 transition-colors">
      <div class="flex items-center justify-between border-b border-white/5 bg-white/2 px-4 py-2">
        <span
          class="flex items-center gap-2 text-[11px] font-bold tracking-widest text-slate-500 uppercase"
        >
          <span class="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_6px_#a78bfa]"></span>
          How to Use
        </span>
      </div>
      <div class="divide-y divide-white/5 px-3 py-3 font-mono text-sm sm:px-4">
        <!-- Anchors -->
        <div class="pb-3">
          <p class="mb-2 text-[11px] font-bold tracking-widest text-slate-500 uppercase">Anchors</p>
          <div class="flex flex-col gap-2">
            <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
              <span class="w-6 shrink-0 text-yellow-400">^</span>
              <span class="text-slate-400"
                >Asserts the match must start at the beginning of the string.</span
              >
              <span class="shrink-0 text-xs text-slate-600 sm:ml-auto sm:text-sm"
                >e.g.
                <span class="text-slate-400"
                  ><span class="text-green-400">1</span>hello → matches
                  <span class="text-green-400">1</span></span
                ></span
              >
            </div>
            <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
              <span class="w-6 shrink-0 text-yellow-400">$</span>
              <span class="text-slate-400"
                >Asserts the match must occur at the very end of the string.</span
              >
              <span class="shrink-0 text-xs text-slate-600 sm:ml-auto sm:text-sm"
                >e.g.
                <span class="text-slate-400"
                  >hello<span class="text-green-400">9</span> → matches
                  <span class="text-green-400">9</span></span
                ></span
              >
            </div>
          </div>
        </div>

        <!-- Character Types -->
        <div class="py-3">
          <p class="mb-2 text-[11px] font-bold tracking-widest text-slate-500 uppercase">
            Character Types
          </p>
          <div class="flex flex-col gap-2">
            <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
              <span class="w-16 shrink-0 text-yellow-400">\d</span>
              <span class="text-slate-400">Matches any digit 0–9.</span>
              <span class="shrink-0 text-xs text-slate-600 sm:ml-auto sm:text-sm"
                >e.g.
                <span class="text-slate-400"
                  >abc<span class="text-green-400">4</span>def → matches
                  <span class="text-green-400">4</span></span
                ></span
              >
            </div>
            <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
              <span class="w-16 shrink-0 text-yellow-400">\D</span>
              <span class="text-slate-400">Matches any character that is NOT a digit.</span>
              <span class="shrink-0 text-xs text-slate-600 sm:ml-auto sm:text-sm"
                >e.g.
                <span class="text-slate-400"
                  ><span class="text-green-400">a</span>1<span class="text-green-400">b</span> →
                  matches <span class="text-green-400">a, b</span></span
                ></span
              >
            </div>
            <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
              <span class="w-16 shrink-0 text-yellow-400">[a-z]</span>
              <span class="text-slate-400">Matches any single lowercase letter.</span>
              <span class="shrink-0 text-xs text-slate-600 sm:ml-auto sm:text-sm"
                >e.g.
                <span class="text-slate-400"
                  >A<span class="text-green-400">b</span>C → matches
                  <span class="text-green-400">b</span></span
                ></span
              >
            </div>
            <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
              <span class="w-16 shrink-0 text-yellow-400">[A-Z]</span>
              <span class="text-slate-400">Matches any single uppercase letter.</span>
              <span class="shrink-0 text-xs text-slate-600 sm:ml-auto sm:text-sm"
                >e.g.
                <span class="text-slate-400"
                  >a<span class="text-green-400">B</span>c → matches
                  <span class="text-green-400">B</span></span
                ></span
              >
            </div>
            <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
              <span class="w-16 shrink-0 text-yellow-400">[a-zA-Z]</span>
              <span class="text-slate-400">Matches any letter regardless of case.</span>
              <span class="shrink-0 text-xs text-slate-600 sm:ml-auto sm:text-sm"
                >e.g.
                <span class="text-slate-400"
                  ><span class="text-green-400">aB</span>3 → matches
                  <span class="text-green-400">a, B</span></span
                ></span
              >
            </div>
            <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
              <span class="w-16 shrink-0 text-yellow-400">[a-zA-Z0-9]</span>
              <span class="text-slate-400">Matches any letter or digit (no symbols).</span>
              <span class="shrink-0 text-xs text-slate-600 sm:ml-auto sm:text-sm"
                >e.g.
                <span class="text-slate-400"
                  ><span class="text-green-400">a3</span>! → matches
                  <span class="text-green-400">a, 3</span></span
                ></span
              >
            </div>
            <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
              <span class="w-16 shrink-0 text-yellow-400">\s</span>
              <span class="text-slate-400">Matches any whitespace (space, tab, newline).</span>
              <span class="shrink-0 text-xs text-slate-600 sm:ml-auto sm:text-sm"
                >e.g.
                <span class="text-slate-400"
                  >a<span class="text-green-400"> </span>b → matches
                  <span class="text-green-400">(space)</span></span
                ></span
              >
            </div>
            <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
              <span class="w-16 shrink-0 text-yellow-400">.</span>
              <span class="text-slate-400">Matches any single character except a newline.</span>
              <span class="shrink-0 text-xs text-slate-600 sm:ml-auto sm:text-sm"
                >e.g.
                <span class="text-slate-400"
                  ><span class="text-green-400">a</span>, <span class="text-green-400">3</span>,
                  <span class="text-green-400">!</span> → all match</span
                ></span
              >
            </div>
          </div>
        </div>

        <!-- Quantifiers -->
        <div class="py-3">
          <p class="mb-2 text-[11px] font-bold tracking-widest text-slate-500 uppercase">
            Quantifiers
          </p>
          <div class="flex flex-col gap-2">
            <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
              <span class="w-16 shrink-0 text-yellow-400">+</span>
              <span class="text-slate-400">One or more of the preceding token.</span>
              <span class="shrink-0 text-xs text-slate-600 sm:ml-auto sm:text-sm"
                >e.g.
                <span class="text-slate-400"
                  >\d+ on "<span class="text-green-400">123</span>abc" → matches
                  <span class="text-green-400">123</span></span
                ></span
              >
            </div>
            <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
              <span class="w-16 shrink-0 text-yellow-400">*</span>
              <span class="text-slate-400">Zero or more of the preceding token.</span>
              <span class="shrink-0 text-xs text-slate-600 sm:ml-auto sm:text-sm"
                >e.g.
                <span class="text-slate-400"
                  >\d* on "abc" → matches <span class="text-green-400">""</span> (empty)</span
                ></span
              >
            </div>
            <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
              <span class="w-16 shrink-0 text-yellow-400">?</span>
              <span class="text-slate-400">Zero or one — makes the token optional.</span>
              <span class="shrink-0 text-xs text-slate-600 sm:ml-auto sm:text-sm"
                >e.g.
                <span class="text-slate-400"
                  >\d? on "a1" → matches <span class="text-green-400">1</span> or
                  <span class="text-green-400">""</span></span
                ></span
              >
            </div>
            <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
              <span class="w-16 shrink-0 text-yellow-400">{n}</span>
              <span class="text-slate-400">Exactly n repetitions of the preceding token.</span>
              <span class="shrink-0 text-xs text-slate-600 sm:ml-auto sm:text-sm"
                >e.g.
                <span class="text-slate-400"
                  >\d{3} on "<span class="text-green-400">123</span>4" → matches
                  <span class="text-green-400">123</span></span
                ></span
              >
            </div>
            <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
              <span class="w-16 shrink-0 text-yellow-400">{n,m}</span>
              <span class="text-slate-400">Between n and m repetitions (inclusive).</span>
              <span class="shrink-0 text-xs text-slate-600 sm:ml-auto sm:text-sm"
                >e.g.
                <span class="text-slate-400"
                  >\d{2,4} on "<span class="text-green-400">123</span>45" → matches
                  <span class="text-green-400">1234</span></span
                ></span
              >
            </div>
          </div>
        </div>

        <!-- Flags -->
        <div class="pt-3">
          <p class="mb-2 text-[11px] font-bold tracking-widest text-slate-500 uppercase">Flags</p>
          <div class="flex flex-col gap-2">
            <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
              <span class="w-6 shrink-0 text-yellow-400">g</span>
              <span class="text-slate-400"
                >Global — finds ALL matches, not just the first one.</span
              >
              <span class="shrink-0 text-xs text-slate-600 sm:ml-auto sm:text-sm"
                >e.g.
                <span class="text-slate-400"
                  >\d/g on "1a2b3" → matches <span class="text-green-400">1, 2, 3</span></span
                ></span
              >
            </div>
            <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
              <span class="w-6 shrink-0 text-yellow-400">i</span>
              <span class="text-slate-400">Case insensitive — treats A and a as equal.</span>
              <span class="shrink-0 text-xs text-slate-600 sm:ml-auto sm:text-sm"
                >e.g.
                <span class="text-slate-400"
                  >[a-z]/i on "<span class="text-green-400">A</span>" → matches
                  <span class="text-green-400">A</span></span
                ></span
              >
            </div>
            <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
              <span class="w-6 shrink-0 text-yellow-400">m</span>
              <span class="text-slate-400">Multiline — ^ and $ match start/end of each line.</span>
              <span class="shrink-0 text-xs text-slate-600 sm:ml-auto sm:text-sm"
                >e.g.
                <span class="text-slate-400"
                  >^\d/m on "1\n2" → matches <span class="text-green-400">1</span> and
                  <span class="text-green-400">2</span></span
                ></span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Regex Anchors -->
    <div class="mt-5 overflow-hidden rounded-xl border border-white/10 transition-colors">
      <div class="flex items-center justify-between border-b border-white/5 bg-white/2 px-4 py-2">
        <span
          class="flex items-center gap-2 text-[11px] font-bold tracking-widest text-slate-500 uppercase"
        >
          <span class="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_6px_#fbbf24]"></span>
          Anchors
        </span>
      </div>

      <div class="p-3">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="btn in regexAnchors"
            :key="btn.label"
            class="border-border cursor-pointer rounded-lg border px-3 py-1 font-mono transition-colors duration-300"
            :data-testid="`anchor-${btn.value}`"
            :class="
              (btn.value === '^' && startAnchor) || (btn.value === '$' && endAnchor)
                ? 'bg-accent font-semibold text-white'
                : 'border-white/20 text-slate-500 hover:text-slate-300'
            "
            @click="applyAnchor(btn.value)"
          >
            {{ btn.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Regex Buttons -->
    <div class="mt-5 overflow-hidden rounded-xl border border-white/10 transition-colors">
      <div class="flex items-center justify-between border-b border-white/5 bg-white/2 px-4 py-2">
        <span
          class="flex items-center gap-2 text-[11px] font-bold tracking-widest text-slate-500 uppercase"
        >
          <span class="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_6px_#fbbf24]"></span>
          Character Types
        </span>
      </div>

      <div class="p-3">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="btn in regexBtns"
            :key="btn.label"
            :data-testid="`regex-btn-${btn.id}`"
            class="border-border cursor-pointer rounded-lg border px-3 py-1 font-mono transition-colors duration-300"
            :class="
              btn.active
                ? 'bg-accent font-semibold text-white'
                : 'border-white/20 text-slate-500 hover:text-slate-300'
            "
            @click="toggleRegexBtn(btn.id)"
          >
            {{ btn.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Quantifiers -->
    <div class="mt-5 overflow-hidden rounded-xl border border-white/10 transition-colors">
      <div class="flex items-center justify-between border-b border-white/5 bg-white/2 px-4 py-2">
        <span
          class="flex items-center gap-2 text-[11px] font-bold tracking-widest text-slate-500 uppercase"
        >
          <span class="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_6px_#fbbf24]"></span>
          Quantifiers
        </span>
      </div>

      <div class="p-3">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="btn in quantifiers"
            :key="btn.label"
            :data-testid="`quantifier-btn-${btn.value}`"
            @click="applyQuantifier(btn.value)"
            class="cursor-pointer rounded-lg border border-white/20 px-3 py-1 font-mono text-slate-500 transition-colors duration-300 hover:text-slate-300"
          >
            {{ btn.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Flags -->
    <div class="mt-5 overflow-hidden rounded-xl border border-white/10 transition-colors">
      <div class="flex items-center justify-between border-b border-white/5 bg-white/2 px-4 py-2">
        <span
          class="flex items-center gap-2 text-[11px] font-bold tracking-widest text-slate-500 uppercase"
        >
          <span class="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_6px_#fbbf24]"></span>
          Flags
        </span>
      </div>

      <div class="p-3">
        <div class="flex flex-wrap gap-5 font-mono text-sm uppercase">
          <label class="flex items-center gap-2">
            <input type="checkbox" data-testid="flag-g" v-model="flags.g" />
            Global (g)
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" data-testid="flag-i" v-model="flags.i" />
            Case Insensitive (i)
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" data-testid="flag-m" v-model="flags.m" />
            Multiline (m)
          </label>
        </div>
      </div>
    </div>

    <!-- Regex Pattern Output -->
    <div class="mt-5 overflow-hidden rounded-xl border border-white/10 transition-colors">
      <div class="flex items-center justify-between border-b border-white/5 bg-white/2 px-4 py-2">
        <span
          class="flex items-center gap-2 text-[11px] font-bold tracking-widest text-slate-500 uppercase"
        >
          <span class="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_6px_#34d399]"></span>
          Regex Pattern
        </span>

        <div class="flex items-center gap-2">
          <button
            @click="copyRegexPattern"
            data-testid="copy-btn"
            class="flex cursor-pointer items-center gap-1.5 rounded-md border border-white/10 px-3 py-1 text-[12px] font-semibold transition-all hover:border-white/20"
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

          <button
            @click="clearRegexPattern"
            data-testid="clear-btn"
            class="cursor-pointer rounded-md border border-white/10 px-3 py-1 text-[12px] font-semibold text-slate-500 transition-all hover:border-white/20 hover:text-slate-300"
          >
            Clear
          </button>
        </div>
      </div>

      <div class="px-1 py-2">
        <input
          type="text"
          :value="fullRegex"
          placeholder="Your regex pattern will shown here"
          data-testid="regex-pattern"
          disabled
          class="w-full overflow-x-auto rounded-lg px-3 py-1 font-mono font-bold text-slate-500 placeholder:font-mono placeholder:text-slate-700"
        />
      </div>
    </div>

    <!-- Test Regex -->
    <div class="mt-5 overflow-hidden rounded-xl border border-white/10 transition-colors">
      <div class="flex items-center justify-between border-b border-white/5 bg-white/2 px-4 py-2">
        <span
          class="flex items-center gap-2 text-[11px] font-bold tracking-widest text-slate-500 uppercase"
        >
          <span class="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_6px_#34d399]"></span>
          Test Regex
        </span>

        <div class="flex items-center gap-2">
          <button
            @click="testRegex"
            data-testid="test-btn"
            class="bg-accent cursor-pointer rounded-md px-3 py-1 text-[12px] font-bold text-white transition-all hover:border-white/20 hover:text-white/80"
          >
            Test Regex
          </button>

          <button
            @click="clearTestString"
            data-testid="clear-test-btn"
            class="cursor-pointer rounded-md border border-white/10 px-3 py-1 text-[12px] font-semibold text-slate-500 transition-all hover:border-white/20 hover:text-slate-300"
          >
            Clear
          </button>
        </div>
      </div>

      <div class="px-1 py-2">
        <input
          type="text"
          v-model="testString"
          data-testid="test-string"
          placeholder="Enter text to test regex"
          class="w-full rounded-lg px-3 py-1 font-mono text-slate-500 outline-none placeholder:font-mono placeholder:text-slate-700"
        />
      </div>
    </div>

    <!-- Output -->
    <div class="mt-5 overflow-hidden rounded-xl border border-white/10 transition-colors">
      <div class="flex items-center justify-between border-b border-white/5 bg-white/2 px-4 py-2">
        <span
          class="flex items-center gap-2 text-[11px] font-bold tracking-widest text-slate-500 uppercase"
        >
          <span class="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_6px_#34d399]"></span>
          Output
        </span>
      </div>

      <div class="px-1 py-2">
        <!-- Error state (empty pattern or invalid regex) -->
        <span v-if="error" class="w-full px-3 py-1 font-mono text-red-400">
          {{ error }}
        </span>

        <!-- No test run yet -->
        <span
          v-else-if="result === null && testResult === null"
          class="w-full px-3 py-1 font-mono text-slate-700"
        >
          Output will shown here
        </span>

        <!-- No matches found -->
        <span
          v-else-if="!testResult"
          class="w-full px-3 py-1 font-mono text-red-400"
          data-testid="no-match"
        >
          No match found
        </span>

        <!-- Show each match as its own chip -->
        <div v-else class="flex flex-wrap gap-2 px-3 py-1" data-testid="output-result">
          <span
            v-for="(match, i) in result"
            :key="i"
            data-testid="match"
            class="rounded-md bg-green-400/10 px-2 py-0.5 font-mono text-green-400"
          >
            {{ match }}
          </span>
          <span class="ml-1 font-mono text-slate-500" data-testid="match-count">
            — {{ result!.length }} match{{ result!.length !== 1 ? 'es' : '' }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
