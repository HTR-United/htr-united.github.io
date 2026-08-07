<template>
  <div class="form-section la">
    <h2>{{ $t('form.analyzeTitle') }}</h2>
    <p class="form-help" style="margin-bottom:16px">{{ $t('form.analyzeDesc') }}</p>

    <!-- Pattern filter -->
    <div class="la-pattern">
      <label class="la-pattern__label">{{ $t('form.analyzePattern') }}</label>
      <input
        v-model="pattern"
        class="form-input la-pattern__input"
        placeholder="*.xml"
        spellcheck="false"
        @keydown.enter.prevent
      >
      <span class="la-pattern__hint">{{ $t('form.analyzePatternHint') }}</span>
    </div>

    <!-- Ignore pattern -->
    <div class="la-pattern">
      <label class="la-pattern__label">{{ $t('form.analyzeIgnore') }}</label>
      <input
        v-model="ignorePattern"
        class="form-input la-pattern__input"
        spellcheck="false"
        @keydown.enter.prevent
      >
      <span class="la-pattern__hint">{{ $t('form.analyzeIgnoreHint') }}</span>
    </div>

    <!-- Normalization mode -->
    <div class="la-norm">
      <div class="la-norm__label">{{ $t('form.analyzeNormMode') }}</div>
      <div class="la-norm__options">
        <label
          v-for="mode in NORM_MODES"
          :key="mode"
          class="la-norm__option"
          :class="{ 'la-norm__option--on': normMode === mode }"
        >
          <input type="radio" :value="mode" v-model="normMode" style="display:none">
          <span class="la-norm__pill">{{ mode }}</span>
        </label>
      </div>
      <!-- Contextual explanation for selected mode -->
      <div class="la-norm__desc">
        <div class="la-norm__example">
          <span class="la-norm__ex-before">{{ normExample.before }}</span>
          <span class="la-norm__ex-arrow">→</span>
          <span class="la-norm__ex-after">{{ normExample.after }}</span>
          <span class="la-norm__ex-note">{{ normExample.note }}</span>
        </div>
        <p>{{ $t('form.analyzeNorm_' + normMode) }}</p>
      </div>
    </div>

    <!-- Drop zone / file picker -->
    <div
      class="la-dropzone"
      :class="{ 'la-dropzone--over': dragging, 'la-dropzone--done': !!result }"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="onDrop"
      @click="fileInput.click()"
    >
      <input
        ref="fileInput"
        data-testid="la-folder-input"
        type="file"
        webkitdirectory
        multiple
        style="display:none"
        @change="onPick"
      >
      <svg class="la-dropzone__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M3 7c0-1.1.9-2 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      </svg>
      <div class="la-dropzone__text">
        <strong>{{ $t('form.analyzePickFolder') }}</strong>
        <span>{{ $t('form.analyzePickHint') }}</span>
      </div>
    </div>

    <!-- Progress -->
    <div v-if="analyzing" class="la-progress">
      <div class="la-progress__bar" :style="{ width: progressPct + '%' }"></div>
      <span class="la-progress__label">{{ $t('form.analyzeProgress', { done, total }) }}</span>
    </div>

    <!-- Nothing usable was dropped/selected -->
    <div v-if="noMatch" class="la-errors" data-testid="la-nomatch">
      <template v-if="noMatch.received">
        {{ $t('form.analyzeNoMatch', { received: noMatch.received, pattern: pattern || '*.xml' }) }}
      </template>
      <template v-else>{{ $t('form.analyzeNoFiles') }}</template>
    </div>

    <!-- Results -->
    <template v-if="result">
      <!-- Metric summary -->
      <div class="la-metrics">
        <div class="la-metric">
          <b>{{ fmt(result.files) }}</b>
          <span>{{ $t('form.metricOptions.files') }}</span>
        </div>
        <div class="la-metric">
          <b>{{ fmt(result.lines) }}</b>
          <span>{{ $t('form.metricOptions.lines') }}</span>
        </div>
        <div class="la-metric">
          <b>{{ fmt(result.chars) }}</b>
          <span>{{ $t('form.metricOptions.characters') }}</span>
        </div>
        <div class="la-metric">
          <b>{{ fmt(result.regions) }}</b>
          <span>{{ $t('form.metricOptions.regions') }}</span>
        </div>
        <div class="la-metric">
          <b>{{ fmt(result.words) }}</b>
          <span>{{ $t('form.analyzeWords') }}</span>
        </div>
        <div class="la-metric la-metric--unique">
          <b>{{ result.members.length }}</b>
          <span>{{ $t('form.analyzeUniqueChars') }}</span>
        </div>
      </div>

      <!-- Errors -->
      <div v-if="result.errors?.length" class="la-errors">
        <strong>{{ result.errors.length }} file(s) could not be parsed:</strong>
        {{ result.errors.map(e => e.name).join(', ') }}
      </div>

      <!-- Character table -->
      <div class="la-chartable">
        <div class="la-chartable__head">
          <strong>{{ $t('form.analyzeCharTable') }}</strong>
          <span class="la-chartable__norm-tag">{{ normMode }}</span>
          <button class="la-chartable__toggle" @click="showAllChars = !showAllChars">
            {{ showAllChars ? $t('form.analyzeShowLess') : $t('form.analyzeShowAll') }}
          </button>
        </div>
        <div class="la-chartable__grid">
          <div
            v-for="[ch, n] in displayedChars"
            :key="ch"
            class="la-char"
            :title="'U+' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4,'0') + ' · ' + n + ' occ.'"
          >
            <span class="la-char__glyph">{{ charLabel(ch) }}</span>
            <span class="la-char__count">{{ n }}</span>
          </div>
        </div>
      </div>

      <!-- Apply button -->
      <div style="margin-top:20px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <button class="btn btn--olive" @click="applyToForm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          {{ $t('form.analyzeApply') }}
        </button>
        <button class="btn btn--ghost" @click="reset">{{ $t('form.analyzeReset') }}</button>
        <span v-if="applied" class="la-applied">✓ {{ $t('form.analyzeApplied') }}</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { analyzeFiles, charLabel, sortedCharFreq, NORM_MODES } from '../../utils/xmlAnalyzer.js'
import { filesFromDropEvent } from '../../utils/dropFiles.js'

const { t } = useI18n()
const emit = defineEmits(['apply'])

const fileInput    = ref(null)
const dragging     = ref(false)
const analyzing    = ref(false)
const result       = ref(null)
const done         = ref(0)
const total        = ref(0)
const showAllChars = ref(false)
const applied      = ref(false)
const noMatch      = ref(null)
const pattern       = ref('*.xml')
const ignorePattern = ref('.*, Thumbs.db, desktop.ini')
const normMode      = ref('NFKC')

/* ── normalization examples shown in the UI ── */
const NORM_EXAMPLES = {
  None:  { before: 'é (U+00E9)  fi (U+FB01)',  after: 'unchanged',                      note: '2 chars · ligature kept' },
  NFC:   { before: 'e + ́ (2 cp)', after: 'é (1 cp)',                         note: 'precomposed' },
  NFD:   { before: 'é (1 cp)',    after: 'e + ́ (2 cp)',                       note: 'base + combining mark' },
  NFKC:  { before: 'ﬁ (U+FB01)', after: 'fi (2 cp)',                          note: 'ligature expanded + composed' },
  NFKD:  { before: 'ﬁ (U+FB01)', after: 'f + i (2 cp)',                       note: 'ligature expanded + decomposed' },
}
const normExample = computed(() => NORM_EXAMPLES[normMode.value])

/* ── glob pattern matcher ── */
function buildMatcher(raw) {
  const globs = raw.split(/[\s,]+/).map(s => s.trim()).filter(Boolean)
  if (!globs.length) return () => true
  const regexes = globs.map(glob => {
    const escaped = glob
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')
    return new RegExp('^' + escaped + '$', 'i')
  })
  return (filename) => regexes.some(re => re.test(filename))
}

const progressPct   = computed(() => total.value ? Math.round(done.value / total.value * 100) : 0)
const displayedChars = computed(() => {
  if (!result.value) return []
  return sortedCharFreq(result.value.charFreq, showAllChars.value ? null : 60)
})

/* ── run analysis ── */
async function run(fileList) {
  result.value  = null
  applied.value = false
  noMatch.value = null
  const received = fileList ? Array.from(fileList) : []
  if (!received.length) {
    noMatch.value = { received: 0 }
    return
  }
  analyzing.value = true
  done.value = 0
  const matcher       = buildMatcher(pattern.value || '*.xml')
  const ignoreMatcher = buildMatcher(ignorePattern.value)
  // analyzeFiles calls the matcher with a *filename*, not a File.
  const keep = (name) => matcher(name) && !ignoreMatcher(name)
  total.value = received.filter(f => keep(f.name)).length
  if (!total.value) {
    analyzing.value = false
    noMatch.value = { received: received.length }
    return
  }

  try {
    result.value = await analyzeFiles(
      fileList,
      (d, tot) => { done.value = d; total.value = tot },
      keep,
      normMode.value
    )
  } finally {
    analyzing.value = false
  }
}

function onPick(e) { run(e.target.files) }

async function onDrop(e) {
  dragging.value = false
  run(await filesFromDropEvent(e))
}

/* ── apply to form ── */
function applyToForm() {
  if (!result.value) return
  const metrics = []
  if (result.value.files)   metrics.push({ type: 'files',      count: result.value.files })
  if (result.value.lines)   metrics.push({ type: 'lines',      count: result.value.lines })
  if (result.value.chars)   metrics.push({ type: 'characters', count: result.value.chars })
  if (result.value.regions) metrics.push({ type: 'regions',    count: result.value.regions })

  emit('apply', {
    metrics,
    characters: {
      mode:    normMode.value,
      members: result.value.members,
    }
  })
  applied.value = true
  setTimeout(() => { applied.value = false }, 3000)
}

function reset() {
  result.value = null
  applied.value = false
  noMatch.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function fmt(n) { return (n || 0).toLocaleString() }
</script>

<style scoped>
.la { cursor: default; }

/* Pattern row */
.la-pattern {
  display: flex; align-items: center; gap: 10px; margin-bottom: 14px; flex-wrap: wrap;
}
.la-pattern__label { font-size: 12.5px; font-weight: 700; color: var(--ink-2); white-space: nowrap; }
.la-pattern__input { width: 200px; font-family: var(--mono); font-size: 13px; padding: 7px 11px; }
.la-pattern__hint { font-size: 12px; color: var(--ink-3); }

/* Normalization section */
.la-norm { margin-bottom: 16px; }
.la-norm__label { font-size: 12.5px; font-weight: 700; color: var(--ink-2); margin-bottom: 8px; }
.la-norm__options { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.la-norm__option { cursor: pointer; }
.la-norm__pill {
  display: block; font-family: var(--mono); font-size: 13px; font-weight: 600;
  padding: 5px 13px; border-radius: 6px; border: 1.5px solid var(--line-2);
  background: var(--surface); color: var(--ink-2);
  transition: all .12s;
}
.la-norm__option:hover .la-norm__pill { border-color: var(--olive-tint); background: var(--olive-tint-2); color: var(--olive-deep); }
.la-norm__option--on .la-norm__pill { background: var(--olive); border-color: var(--olive-deep); color: #fff; }

.la-norm__desc {
  background: var(--surface-2); border: 1px solid var(--line);
  border-radius: var(--radius-sm); padding: 12px 14px;
}
.la-norm__desc p { font-size: 13px; color: var(--ink-2); margin: 6px 0 0; line-height: 1.55; }

.la-norm__example {
  display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap;
  font-family: var(--mono); font-size: 13px;
}
.la-norm__ex-before { color: var(--ink-3); }
.la-norm__ex-arrow  { color: var(--ink-3); }
.la-norm__ex-after  { color: var(--olive-deep); font-weight: 700; }
.la-norm__ex-note   { font-family: var(--sans); font-size: 11.5px; color: var(--ink-3); font-style: italic; }

/* Drop zone */
.la-dropzone {
  border: 2px dashed var(--line-2); border-radius: var(--radius);
  padding: 28px 20px; display: flex; align-items: center; gap: 18px;
  cursor: pointer; transition: border-color .15s, background .15s;
  background: var(--surface-2);
}
.la-dropzone:hover,
.la-dropzone--over { border-color: var(--olive); background: var(--olive-tint-2); }
.la-dropzone--done { border-style: solid; border-color: var(--olive-tint); }
.la-dropzone__icon { width: 36px; height: 36px; color: var(--ink-3); flex-shrink: 0; }
.la-dropzone:hover .la-dropzone__icon,
.la-dropzone--over .la-dropzone__icon { color: var(--olive-deep); }
.la-dropzone__text { display: flex; flex-direction: column; gap: 4px; }
.la-dropzone__text strong { font-size: 14px; color: var(--ink); }
.la-dropzone__text span { font-size: 12.5px; color: var(--ink-3); }

/* Progress */
.la-progress {
  margin-top: 14px; position: relative;
  height: 6px; background: var(--line); border-radius: 4px; overflow: hidden;
}
.la-progress__bar {
  position: absolute; inset: 0 auto 0 0;
  background: var(--olive); border-radius: 4px; transition: width .2s;
}
.la-progress__label {
  position: absolute; top: 10px; left: 0;
  font-size: 12px; color: var(--ink-3);
}

/* Metric cards */
.la-metrics { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
.la-metric {
  display: flex; flex-direction: column; gap: 2px;
  background: var(--surface); border: 1px solid var(--line);
  border-radius: var(--radius-sm); padding: 12px 18px; min-width: 90px;
}
.la-metric b { font-family: var(--mono); font-size: 20px; font-weight: 700; color: var(--ink); }
.la-metric span { font-size: 11px; color: var(--ink-3); text-transform: uppercase; letter-spacing: .04em; }
.la-metric--unique { border-color: var(--olive-tint); background: var(--olive-tint-2); }
.la-metric--unique b { color: var(--olive-deep); }

.la-errors {
  margin-top: 12px; padding: 10px 14px; border-radius: var(--radius-sm);
  background: var(--rose-bg); color: var(--rose-ink); font-size: 12.5px;
}

/* Character table */
.la-chartable { margin-top: 20px; }
.la-chartable__head {
  display: flex; align-items: baseline; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;
}
.la-chartable__head strong { font-size: 13px; color: var(--ink); }
.la-chartable__norm-tag {
  font-family: var(--mono); font-size: 11px; font-weight: 700;
  background: var(--olive-tint-2); color: var(--olive-deep);
  border: 1px solid var(--olive-tint); border-radius: 4px; padding: 1px 7px;
}
.la-chartable__toggle {
  font-size: 12px; font-weight: 600; color: var(--accent);
  background: none; border: none; cursor: pointer; padding: 0; margin-left: auto;
}
.la-chartable__toggle:hover { text-decoration: underline; }

.la-chartable__grid {
  display: flex; flex-wrap: wrap; gap: 6px;
  max-height: 220px; overflow-y: auto;
  padding: 10px; background: var(--surface-2);
  border: 1px solid var(--line); border-radius: var(--radius-sm);
}

.la-char {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  background: var(--surface); border: 1px solid var(--line-2);
  border-radius: 5px; padding: 5px 7px; min-width: 42px; cursor: default;
  transition: background .1s;
}
.la-char:hover { background: var(--olive-tint-2); border-color: var(--olive-tint); }
.la-char__glyph {
  font-family: var(--serif); font-size: 16px; line-height: 1.2;
  color: var(--ink); min-height: 20px; display: flex; align-items: center;
}
.la-char__count { font-family: var(--mono); font-size: 10px; color: var(--ink-3); }

.la-applied { font-size: 13px; color: var(--green-ink); font-weight: 600; }
</style>
