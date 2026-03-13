<script setup lang="ts">
import type { HSV, RGB } from '@/types/color'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

// States
const canvasHeight = 220
const canvasWidth = ref(300)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const hue = ref(120)
const cursorX = ref(0)
const cursorY = ref(0)
const isDraggingCanvas = ref(false)
const isDraggingHue = ref(false)
const previousColor = ref('#1a3d2b')
const copiedKey = ref<string | null>(null)
const hexInput = ref('')
const isTyping = ref(false)

// Conversions
function hsvToRgb(h: number, s: number, v: number): RGB {
  s /= 100
  v /= 100

  const i = Math.floor(h / 60) % 6
  const f = h / 60 - Math.floor(h / 60)
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)
  const map: [number, number, number][] = [
    [v, t, p],
    [q, v, p],
    [p, v, t],
    [p, q, v],
    [t, p, v],
    [v, p, q],
  ]
  const [r, g, b] = map[i] ?? [0, 0, 0]
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
}

function rgbToHex({ r, g, b }: RGB) {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
}

function rgbToHsl({ r, g, b }: RGB) {
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255
  const max = Math.max(rn, gn, bn),
    min = Math.min(rn, gn, bn)
  let h = 0,
    s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
        break
      case gn:
        h = ((bn - rn) / d + 2) / 6
        break
      case bn:
        h = ((rn - gn) / d + 4) / 6
        break
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function rgbToCmyk({ r, g, b }: RGB) {
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255
  const k = 1 - Math.max(rn, gn, bn)
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 }
  return {
    c: Math.round(((1 - rn - k) / (1 - k)) * 100),
    m: Math.round(((1 - gn - k) / (1 - k)) * 100),
    y: Math.round(((1 - bn - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  }
}

function rgbToHsv({ r, g, b }: RGB): HSV {
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const d = max - min
  let h = 0

  if (d !== 0) {
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
        break
      case gn:
        h = ((bn - rn) / d + 2) / 6
        break
      case bn:
        h = ((rn - gn) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: max === 0 ? 0 : Math.round((d / max) * 100),
    v: Math.round(max * 100),
  }
}

function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '')
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  }
}

// Computed Values
const saturation = computed(() => Math.round((cursorX.value / canvasWidth.value) * 100))
const brightness = computed(() => Math.round((1 - cursorY.value / canvasHeight) * 100))
const rgb = computed(() => hsvToRgb(hue.value, saturation.value, brightness.value))
const hex = computed(() => rgbToHex(rgb.value))
const hsl = computed(() => rgbToHsl(rgb.value))
const cmyk = computed(() => rgbToCmyk(rgb.value))
const hueColor = computed(() => `hsl(${hue.value}, 100%, 50%)`)

// Canvas
function drawCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')!
  const w = canvas.width
  const h = canvas.height

  const gradH = ctx.createLinearGradient(0, 0, w, 0)
  gradH.addColorStop(0, '#fff')
  gradH.addColorStop(1, hueColor.value)
  ctx.fillStyle = gradH
  ctx.fillRect(0, 0, w, h)

  const gradV = ctx.createLinearGradient(0, 0, 0, h)
  gradV.addColorStop(0, 'transparent')
  gradV.addColorStop(1, '#000')
  ctx.fillStyle = gradV
  ctx.fillRect(0, 0, w, h)
}

function getCursorPos(e: MouseEvent | TouchEvent) {
  const canvas = canvasRef.value!
  const rect = canvas.getBoundingClientRect()
  const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0]!.clientY : e.clientY
  return {
    x: Math.max(0, Math.min(canvasWidth.value, clientX - rect.left)),
    y: Math.max(0, Math.min(canvasHeight, clientY - rect.top)),
  }
}

function onCanvasMouseDown(e: MouseEvent | TouchEvent) {
  previousColor.value = hex.value
  isDraggingCanvas.value = true
  const pos = getCursorPos(e)
  cursorX.value = pos.x
  cursorY.value = pos.y
}

function onMouseMove(e: MouseEvent | TouchEvent) {
  if (!isDraggingCanvas.value) return
  const pos = getCursorPos(e)
  cursorX.value = pos.x
  cursorY.value = pos.y
}

function onMouseUp() {
  isDraggingCanvas.value = false
  isDraggingHue.value = false
}

function onCopy(value: string, key: string) {
  navigator.clipboard.writeText(value)
  copiedKey.value = key

  setTimeout(() => (copiedKey.value = null), 1600)
}

function onHexInput(val: string) {
  isTyping.value = true
  hexInput.value = val
  const clean = val.startsWith('#') ? val : '#' + val
  if (!/^#[0-9a-fA-F]{6}$/.test(clean)) return
  const rgb = hexToRgb(clean)
  const hsv = rgbToHsv(rgb)
  hue.value = hsv.h
  cursorX.value = Math.round((hsv.s / 100) * canvasWidth.value)
  cursorY.value = Math.round((1 - hsv.v / 100) * canvasHeight)
}

async function onHexBlur() {
  isTyping.value = false

  hexInput.value = hex.value
}

function restorePreviousColor() {
  const rgb = hexToRgb(previousColor.value)
  const hsv = rgbToHsv(rgb)
  hue.value = hsv.h
  cursorX.value = Math.round((hsv.s / 100) * canvasWidth.value)
  cursorY.value = Math.round((1 - hsv.v / 100) * canvasHeight)
}

onMounted(() => {
  if (canvasRef.value) {
    canvasWidth.value = canvasRef.value.parentElement!.clientWidth
    canvasRef.value.width = canvasWidth.value
  }

  drawCanvas()

  // Position cursor at initial previousColor
  const initRgb = hexToRgb(previousColor.value)
  const initHsv = rgbToHsv(initRgb)
  hue.value = initHsv.h
  cursorX.value = Math.round((initHsv.s / 100) * canvasWidth.value)
  cursorY.value = Math.round((1 - initHsv.v / 100) * canvasHeight)
  hexInput.value = previousColor.value

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('touchmove', onMouseMove)
  window.addEventListener('touchend', onMouseUp)
})

// cleanup
onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('touchmove', onMouseMove)
  window.removeEventListener('touchend', onMouseUp)
})

watch(hue, drawCanvas)

watch(hex, (val) => {
  if (!isTyping.value) hexInput.value = val
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <h1 class="text-accent text-2xl font-extrabold tracking-tight sm:text-3xl">Color Picker</h1>
    <p class="text-sm font-semibold tracking-widest text-muted uppercase">
      Pick · Convert · Copy
    </p>
  </div>

  <!-- Canvas Card -->
  <div class="mt-5 overflow-hidden rounded-xl border border-border">
    <div class="flex items-center gap-2 border-b border-border bg-surface px-4 py-2">
      <span class="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_6px_#fbbf24]"></span>
      <span class="text-[11px] font-bold tracking-widest text-muted uppercase"
        >Color Canvas</span
      >
    </div>

    <!-- Slider and Canvas -->
    <div class="p-5">
      <!-- Canvas and Slider -->
      <div class="flex gap-3">
        <!-- Slider -->
        <input
          type="range"
          min="0"
          max="360"
          v-model.number="hue"
          class="hue-slider shrink-0"
          data-testid="hue-slider"
        />

        <!-- Color Picker Canvas -->
        <div class="relative flex-1 select-none" :style="{ height: canvasHeight + 'px' }">
          <canvas
            ref="canvasRef"
            :height="canvasHeight"
            class="cursor block h-full w-full cursor-crosshair rounded-lg"
            data-testid="color-canvas"
            @mousedown="onCanvasMouseDown"
            @touchstart.prevent="onCanvasMouseDown"
          ></canvas>

          <!-- Circle Cursor -->
          <div
            class="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
            data-testid="circle-cursor"
            :style="{
              left: cursorX + 'px',
              top: cursorY + 'px',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(0,0,0,0.2)',
            }"
          ></div>
        </div>
      </div>

      <!-- Swatches -->
      <div class="mt-3 flex items-center justify-between gap-3">
        <div class="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2">
          <!-- Labels column -->
          <span class="text-[10px] font-bold tracking-widest text-muted uppercase">New</span>
          <div
            class="h-8 w-24 rounded-md border border-border"
            data-testid="new-color"
            :style="{ backgroundColor: hex }"
          />

          <span class="text-[10px] font-bold tracking-widest text-muted uppercase"
            >Previous</span
          >
          <div
            class="h-8 w-24 cursor-pointer rounded-md border border-border transition-opacity hover:opacity-75"
            :style="{ backgroundColor: previousColor }"
            title="Click to restore previous color"
            data-testid="previous-color"
            @click="restorePreviousColor"
          />
        </div>

        <!-- Right: hex values aligned to their swatch -->
        <div class="flex flex-col items-end justify-center gap-2">
          <span class="font-mono text-sm text-muted">{{ hex }}</span>
          <span class="font-mono text-sm text-muted">{{ previousColor }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Color Values -->
  <div class="mt-5 overflow-hidden rounded-xl border border-border">
    <!-- Header -->
    <div class="flex items-center gap-2 border-b border-border bg-surface px-4 py-2">
      <span class="bg-success h-2 w-2 rounded-full shadow-[0_0_6px_#34d399]"></span>
      <span class="text-[11px] font-bold tracking-widest text-muted uppercase"
        >Color Values</span
      >
    </div>

    <!-- Color Vals -->
    <div class="divide-y divide-border">
      <!-- Hex -->
      <div class="flex items-center gap-3 px-4 py-2.5">
        <span
          class="w-12 shrink-0 font-mono text-[12px] font-bold tracking-widest text-muted uppercase"
          >hex</span
        >
        <input
          type="text"
          data-testid="hex-input"
          :value="hexInput"
          class="flex-1 border border-b border-transparent bg-transparent font-mono text-sm text-foreground transition-colors outline-none focus:border-b-border/20"
          @input="onHexInput(($event.target as HTMLInputElement).value)"
          @blur="onHexBlur"
          maxlength="7"
          spellcheck="false"
        />

        <button
          @click="onCopy(hex, 'hex')"
          data-testid="hex-copy-btn"
          class="shrink-0 rounded-md border border-border px-2.5 py-1 text-[11px] font-semibold transition-colors"
          :class="
            copiedKey === 'hex'
              ? 'border-green-400/30 text-success'
              : 'text-muted hover:text-foreground'
          "
        >
          {{ copiedKey === 'hex' ? 'Copied!' : 'Copy' }}
        </button>
      </div>

      <!-- RGB -->
      <div class="flex items-center gap-3 px-4 py-2.5">
        <span
          class="w-12 shrink-0 font-mono text-[12px] font-bold tracking-widest text-muted uppercase"
          data-testid="rgb-output"
          >rgb</span
        >
        <span class="flex-1 font-mono text-sm text-foreground" data-testid="rgb-text"
          >rgb({{ rgb.r }}, {{ rgb.g }}, {{ rgb.b }})</span
        >
        <button
          @click="onCopy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'rgb')"
          data-testid="rgb-copy-btn"
          class="shrink-0 rounded-md border border-border px-2.5 py-1 text-[11px] font-semibold transition-colors"
          :class="
            copiedKey === 'rgb'
              ? 'border-green-400/30 text-success'
              : 'text-muted hover:text-foreground'
          "
        >
          {{ copiedKey === 'rgb' ? 'Copied!' : 'Copy' }}
        </button>
      </div>

      <!-- HSL -->
      <div class="flex items-center gap-3 px-4 py-2.5">
        <span
          class="w-12 shrink-0 font-mono text-[12px] font-bold tracking-widest text-muted uppercase"
          data-testid="hsl-output"
          >HSL</span
        >
        <span class="flex-1 font-mono text-sm text-foreground" data-testid="hsl-text"
          >hsl({{ hsl.h }}, {{ hsl.s }}%, {{ hsl.l }}%)</span
        >
        <button
          @click="onCopy(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'hsl')"
          data-testid="hsl-copy-btn"
          class="shrink-0 rounded-md border border-border px-2.5 py-1 text-[11px] font-semibold transition-colors"
          :class="
            copiedKey === 'hsl'
              ? 'border-green-400/30 text-success'
              : 'text-muted hover:text-foreground'
          "
        >
          {{ copiedKey === 'hsl' ? 'Copied!' : 'Copy' }}
        </button>
      </div>

      <!-- HSV -->
      <div class="flex items-center gap-3 px-4 py-2.5" data-testid="hsv-output">
        <span
          class="w-12 shrink-0 font-mono text-[12px] font-bold tracking-widest text-muted uppercase"
          data-testid="hsv-output"
          >hsv</span
        >
        <span class="flex-1 font-mono text-sm text-foreground" data-testid="hsv-text"
          >hsv({{ hue }}, {{ saturation }}%, {{ brightness }}%)</span
        >
        <button
          @click="onCopy(`hsv(${hue}, ${saturation}%, ${brightness}%)`, 'hsv')"
          data-testid="hsv-copy-btn"
          class="shrink-0 rounded-md border border-border px-2.5 py-1 text-[11px] font-semibold transition-colors"
          :class="
            copiedKey === 'hsv'
              ? 'border-green-400/30 text-success'
              : 'text-muted hover:text-foreground'
          "
        >
          {{ copiedKey === 'hsv' ? 'Copied!' : 'Copy' }}
        </button>
      </div>

      <!-- CMYK -->
      <div class="flex items-center gap-3 px-4 py-2.5">
        <span
          class="w-12 shrink-0 font-mono text-[12px] font-bold tracking-widest text-muted uppercase"
          data-testid="cmyk-output"
          >cmyk</span
        >
        <span class="flex-1 font-mono text-sm text-foreground" data-testid="cmyk-text"
          >cmyk({{ cmyk.c }}, {{ cmyk.m }}, {{ cmyk.y }}, {{ cmyk.k }})</span
        >
        <button
          @click="onCopy(`cmyk(${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k})`, 'cmyk')"
          class="shrink-0 rounded-md border border-border px-2.5 py-1 text-[11px] font-semibold transition-colors"
          data-testid="cmyk-copy-btn"
          :class="
            copiedKey === 'cmyk'
              ? 'border-green-400/30 text-success'
              : 'text-muted hover:text-foreground'
          "
        >
          {{ copiedKey === 'cmyk' ? 'Copied!' : 'Copy' }}
        </button>
      </div>

      <!-- CSS Variable -->
      <div class="flex items-center gap-3 px-4 py-2.5">
        <span
          class="w-12 shrink-0 font-mono text-[12px] font-bold tracking-widest text-muted uppercase"
          data-testid="css-output"
          >css</span
        >
        <span class="flex-1 font-mono text-sm text-foreground" data-testid="css-text"
          >--color: {{ hex }}</span
        >
        <button
          @click="onCopy(`--color: ${hex};`, 'css')"
          data-testid="css-copy-btn"
          class="shrink-0 rounded-md border border-border px-2.5 py-1 text-[11px] font-semibold transition-colors"
          :class="
            copiedKey === 'css'
              ? 'border-green-400/30 text-success'
              : 'text-muted hover:text-foreground'
          "
        >
          {{ copiedKey === 'css' ? 'Copied!' : 'Copy' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hue slider — vertical on sm+, horizontal on mobile */
.hue-slider {
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(
    to bottom,
    hsl(0, 100%, 50%),
    hsl(30, 100%, 50%),
    hsl(60, 100%, 50%),
    hsl(90, 100%, 50%),
    hsl(120, 100%, 50%),
    hsl(150, 100%, 50%),
    hsl(180, 100%, 50%),
    hsl(210, 100%, 50%),
    hsl(240, 100%, 50%),
    hsl(270, 100%, 50%),
    hsl(300, 100%, 50%),
    hsl(330, 100%, 50%),
    hsl(360, 100%, 50%)
  );
  border-radius: 4px;
  cursor: pointer;
  width: 20px;
  height: 220px;
  writing-mode: vertical-lr;
  direction: rtl;
}

.hue-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 10px;
  background: white;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.3);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  cursor: pointer;
}

.hue-slider::-moz-range-thumb {
  width: 24px;
  height: 10px;
  background: white;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.3);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  cursor: pointer;
}

@media (max-width: 639px) {
  .hue-slider {
    writing-mode: horizontal-tb;
    direction: ltr;
    width: 220px;
    height: 20px;
    background: linear-gradient(
      to right,
      hsl(0, 100%, 50%),
      hsl(30, 100%, 50%),
      hsl(60, 100%, 50%),
      hsl(90, 100%, 50%),
      hsl(120, 100%, 50%),
      hsl(150, 100%, 50%),
      hsl(180, 100%, 50%),
      hsl(210, 100%, 50%),
      hsl(240, 100%, 50%),
      hsl(270, 100%, 50%),
      hsl(300, 100%, 50%),
      hsl(330, 100%, 50%),
      hsl(360, 100%, 50%)
    );
  }
}
</style>
