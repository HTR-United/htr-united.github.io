<template>
  <div v-if="canShow" class="stats-chart">
    <div class="stats-chart__hdr">
      <span class="stats-chart__title">{{ $t('zenodo.chartTitle') }}</span>
      <button class="btn btn--ghost" style="font-size:12px;padding:4px 12px" @click="savePng">
        ↓ {{ $t('zenodo.chartSave') }}
      </button>
    </div>
    <div style="overflow-x:auto">
      <svg
        ref="svgEl"
        :viewBox="`0 0 ${W} ${TOTAL_H}`"
        :width="W" :height="TOTAL_H"
        xmlns="http://www.w3.org/2000/svg"
        style="max-width:100%;display:block"
      >
        <rect width="100%" height="100%" fill="#faf9f5"/>

        <g v-for="(m, i) in metrics" :key="m.key">
          <!-- panel background -->
          <rect :x="ML" :y="pTop(i)" :width="CW" :height="PH" fill="#f4f3ee" rx="2"/>
          <!-- y-axis line -->
          <line :x1="ML" :y1="pTop(i)" :x2="ML" :y2="pTop(i)+PH" stroke="#c8c4b9" stroke-width="1"/>
          <!-- bottom border -->
          <line :x1="ML" :y1="pTop(i)+PH" :x2="ML+CW" :y2="pTop(i)+PH" stroke="#e5e2d9" stroke-width="1"/>

          <!-- grid lines + y-axis labels -->
          <template v-for="tick in yTicks(m.key, i)" :key="tick.val">
            <line v-if="tick.val > 0" :x1="ML" :y1="tick.y" :x2="ML+CW" :y2="tick.y" stroke="#e5e2d9" stroke-width="1"/>
            <text :x="ML-5" :y="tick.y+4" text-anchor="end" font-size="10" fill="#8b8779" font-family="monospace,ui-monospace">{{ tick.label }}</text>
          </template>

          <!-- metric label in top-left corner of panel -->
          <text :x="ML+8" :y="pTop(i)+15" font-size="11" font-weight="600" :fill="m.color" font-family="system-ui,sans-serif">{{ m.label }}</text>

          <!-- connecting line -->
          <path
            v-if="chartPoints.length >= 2"
            :d="makePath(m.key, i)"
            :stroke="m.color"
            fill="none"
            stroke-width="2.5"
            stroke-linejoin="round"
            stroke-linecap="round"
          />

          <!-- event dots -->
          <g v-for="dot in makeDots(m.key, i)" :key="dot.year">
            <title>{{ dot.year }}: {{ dot.displayVal }}</title>
            <circle :cx="dot.cx" :cy="dot.cy" r="5" :fill="m.color"/>
            <circle :cx="dot.cx" :cy="dot.cy" r="2.5" fill="#faf9f5"/>
          </g>
        </g>

        <!-- x-axis line -->
        <line :x1="ML" :y1="XAXISY" :x2="ML+CW" :y2="XAXISY" stroke="#c8c4b9" stroke-width="1"/>

        <!-- x-axis ticks + labels -->
        <g v-for="tick in xTicks" :key="tick.x">
          <line :x1="tick.x" :y1="XAXISY" :x2="tick.x" :y2="XAXISY+5" stroke="#c8c4b9" stroke-width="1"/>
          <text :x="tick.x" :y="XAXISY+18" text-anchor="middle" font-size="11" fill="#57544c" font-family="system-ui,sans-serif">{{ tick.label }}</text>
        </g>
      </svg>
    </div>
  </div>
  <p v-else-if="hasUnitsWithoutDate" class="form-help" style="margin-top:10px;font-style:italic">
    {{ $t('zenodo.chartNeedsDate') }}
  </p>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  units: { type: Array, default: () => [] },
})

const svgEl = ref(null)

// Layout constants
const W      = 680
const ML     = 68   // margin left (y-axis labels)
const MR     = 16   // margin right
const CW     = W - ML - MR  // chart width
const MT     = 14   // margin top
const PH     = 90   // panel height
const PG     = 40   // gap between panels (room for x tick labels from panel above)
const XH     = 36   // x-axis area height

// X-axis baseline and total SVG height
const XAXISY   = MT + 3 * PH + 2 * PG
const TOTAL_H  = XAXISY + XH

// 10% of panel height is reserved as top padding for the metric label
const Y_TOP_PAD = 0.12

const metrics = computed(() => [
  { key: 'lines', label: t('zenodo.chartLines'), color: '#7d8a4e' },
  { key: 'chars', label: t('zenodo.chartChars'), color: '#2f5d86' },
  { key: 'files', label: t('zenodo.chartFiles'), color: '#97494a' },
])

function pTop(i) {
  return MT + i * (PH + PG)
}

// Only show the chart when every unit has a dateStart year
const canShow = computed(() =>
  props.units.length > 0 && props.units.every(u => u.dateStart)
)

const hasUnitsWithoutDate = computed(() =>
  props.units.length > 0 && !props.units.every(u => u.dateStart)
)

// Build cumulative data points sorted by year
const chartPoints = computed(() => {
  if (!canShow.value) return []
  const byYear = {}
  for (const unit of props.units) {
    const yr = Number(unit.dateStart)
    if (!byYear[yr]) byYear[yr] = { chars: 0, lines: 0, files: 0 }
    byYear[yr].chars += Number(unit.stats?.chars || 0)
    byYear[yr].lines += Number(unit.stats?.lines || 0)
    byYear[yr].files += Number(unit.stats?.files || 0)
  }
  const years = Object.keys(byYear).map(Number).sort((a, b) => a - b)
  let cumChars = 0, cumLines = 0, cumFiles = 0
  return years.map(yr => {
    cumChars += byYear[yr].chars
    cumLines += byYear[yr].lines
    cumFiles += byYear[yr].files
    return { year: yr, chars: cumChars, lines: cumLines, files: cumFiles }
  })
})

function xOf(year) {
  const pts = chartPoints.value
  if (!pts.length) return ML
  const minY = pts[0].year, maxY = pts[pts.length - 1].year
  if (minY === maxY) return ML + CW / 2
  return ML + ((year - minY) / (maxY - minY)) * CW
}

function yOf(val, maxVal, panelTop) {
  if (maxVal === 0) return panelTop + PH / 2
  // maps 0 → bottom of panel, maxVal → top pad position
  return panelTop + PH - (val / maxVal) * PH * (1 - Y_TOP_PAD)
}

function fmtShort(n) {
  if (!n) return '0'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}

function yTicks(key, panelIdx) {
  const pts = chartPoints.value
  if (!pts.length) return []
  const maxVal = Math.max(...pts.map(p => p[key]))
  const top = pTop(panelIdx)
  return [0, 0.25, 0.5, 0.75, 1].map(f => ({
    y: yOf(maxVal * f, maxVal, top),
    label: fmtShort(Math.round(maxVal * f)),
    val: f,
  }))
}

function makePath(key, panelIdx) {
  const pts = chartPoints.value
  const maxVal = Math.max(...pts.map(p => p[key]))
  const top = pTop(panelIdx)
  return pts.map((p, i) => {
    const x = xOf(p.year).toFixed(1)
    const y = yOf(p[key], maxVal, top).toFixed(1)
    return `${i === 0 ? 'M' : 'L'}${x},${y}`
  }).join(' ')
}

function makeDots(key, panelIdx) {
  const pts = chartPoints.value
  const maxVal = Math.max(...pts.map(p => p[key]))
  const top = pTop(panelIdx)
  return pts.map(p => ({
    cx: xOf(p.year),
    cy: yOf(p[key], maxVal, top),
    year: p.year,
    displayVal: fmtShort(p[key]),
  }))
}

const xTicks = computed(() => {
  const pts = chartPoints.value
  if (!pts.length) return []
  const years = pts.map(p => p.year)
  const maxTicks = 10
  const step = years.length > maxTicks ? Math.ceil(years.length / maxTicks) : 1
  const shown = years.filter((_, i) => i % step === 0)
  if (shown[shown.length - 1] !== years[years.length - 1]) shown.push(years[years.length - 1])
  return shown.map(yr => ({ x: xOf(yr), label: String(yr) }))
})

function savePng() {
  const svg = svgEl.value
  if (!svg) return
  const svgStr = new XMLSerializer().serializeToString(svg)
  const img = new Image()
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  img.onload = () => {
    const scale = 2
    const canvas = document.createElement('canvas')
    canvas.width  = W * scale
    canvas.height = TOTAL_H * scale
    const ctx = canvas.getContext('2d')
    ctx.scale(scale, scale)
    ctx.fillStyle = '#faf9f5'
    ctx.fillRect(0, 0, W, TOTAL_H)
    ctx.drawImage(img, 0, 0, W, TOTAL_H)
    URL.revokeObjectURL(url)
    const a = document.createElement('a')
    a.download = 'stats-chart.png'
    a.href = canvas.toDataURL('image/png')
    a.click()
  }
  img.src = url
}
</script>

<style scoped>
.stats-chart { margin: 0 0 4px; }
.stats-chart__hdr {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;
}
.stats-chart__title { font-size: 14px; font-weight: 700; color: var(--ink-2); }
</style>
