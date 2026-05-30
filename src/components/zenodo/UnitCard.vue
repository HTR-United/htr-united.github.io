<template>
  <div class="unit-card">
    <!-- Header -->
    <div class="unit-card__head">
      <div class="unit-card__num">{{ $t('zenodo.unit') }} {{ index + 1 }}</div>
      <div class="unit-card__path"><code>{{ livePath }}</code></div>
      <button class="btn btn--ghost" style="padding:5px 10px;margin-left:auto;color:var(--rose-ink)" @click="$emit('remove')">✕</button>
    </div>

    <div class="unit-card__body">
      <!-- Name + slug -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">{{ $t('zenodo.unitName') }} <span class="req">*</span></label>
          <input class="form-input" :value="unit.name" @input="onName($event.target.value)"
            :placeholder="$t('zenodo.unitNamePlaceholder')">
        </div>
        <div class="form-group">
          <label class="form-label">{{ $t('zenodo.unitSlug') }}</label>
          <input class="form-input" style="font-family:var(--mono);font-size:13px" :value="unit.slug"
            @input="$emit('update', { slug: $event.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'-') })">
        </div>
      </div>

      <!-- Prefix (only shown when 2-level org is active) -->
      <div v-if="orgLevels === 2" class="form-group">
        <label class="form-label">{{ prefixLabel }} <span style="font-weight:400;color:var(--ink-3)">({{ $t('zenodo.prefixFor') }} data/<em>…</em>/{{ unit.slug || '…' }}/)</span></label>
        <div style="display:flex;align-items:center;gap:8px">
          <input class="form-input" style="width:160px;font-family:var(--mono);font-size:13px" :value="unit.prefix"
            @input="$emit('update', { prefix: slugifyInput($event.target.value) })"
            :placeholder="$t('zenodo.prefixPlaceholder')">
          <span style="font-size:12px;color:var(--ink-3)">→ <code>data/{{ unit.prefix || '…' }}/{{ unit.slug || '…' }}/</code></span>
        </div>
      </div>

      <!-- Date range + color pages + link -->
      <div class="form-row" style="grid-template-columns:1fr 1fr auto 1fr">
        <div class="form-group">
          <label class="form-label">{{ $t('zenodo.dateStart') }}</label>
          <input class="form-input" type="number" :value="unit.dateStart"
            @input="$emit('update', { dateStart: $event.target.value })" placeholder="1200">
        </div>
        <div class="form-group">
          <label class="form-label">{{ $t('zenodo.dateEnd') }}</label>
          <input class="form-input" type="number" :value="unit.dateEnd"
            @input="$emit('update', { dateEnd: $event.target.value })" placeholder="1299">
        </div>
        <div class="form-group">
          <label class="form-label">{{ $t('zenodo.colorPages') }}</label>
          <label class="checkbox-item" style="margin-top:10px">
            <input type="checkbox" :checked="unit.colorPages"
              @change="$emit('update', { colorPages: $event.target.checked })">
            {{ $t('zenodo.colorPagesYes') }}
          </label>
        </div>
        <div class="form-group">
          <label class="form-label">{{ $t('zenodo.externalLink') }}</label>
          <input class="form-input" :value="unit.link"
            @input="$emit('update', { link: $event.target.value })" placeholder="https://…">
        </div>
      </div>

      <!-- File drop zone -->
      <div
        class="la-dropzone unit-drop"
        :class="{ 'la-dropzone--over': dragging, 'la-dropzone--done': unit.files?.length > 0 }"
        @dragover.prevent="dragging = true"
        @dragleave="dragging = false"
        @drop.prevent="onDrop"
        @click="fileInput.click()"
      >
        <input ref="fileInput" type="file" multiple style="display:none" @change="onPick">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
          style="width:28px;height:28px;color:var(--ink-3);flex-shrink:0">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <div>
          <strong style="font-size:13.5px;color:var(--ink)">{{ $t('zenodo.dropFiles') }}</strong>
          <span style="display:block;font-size:12px;color:var(--ink-3)">{{ $t('zenodo.dropFilesHint') }}</span>
        </div>
      </div>

      <!-- Analyzing -->
      <div v-if="analyzing" class="la-progress" style="margin-top:8px">
        <div class="la-progress__bar" style="width:100%;animation:pulse 1s infinite alternate"></div>
        <span class="la-progress__label">{{ $t('zenodo.analyzeProgress') }}</span>
      </div>

      <!-- File list + stats -->
      <template v-if="unit.files?.length">
        <div class="unit-files">
          <div class="unit-files__summary">
            <span class="unit-files__count">{{ unit.files.length }} {{ $t('zenodo.filesSelected') }}</span>
            <span class="unit-files__xml">{{ xmlCount }} XML · {{ unit.files.length - xmlCount }} {{ $t('zenodo.images') }}</span>
            <button class="btn btn--ghost" style="padding:3px 9px;font-size:12px;margin-left:auto" @click="clearFiles">
              {{ $t('zenodo.clearFiles') }}
            </button>
          </div>
          <div v-if="unit.stats?.lines" class="unit-stats">
            <div class="unit-stat"><b>{{ fmt(unit.stats.lines) }}</b><span>{{ $t('form.metricOptions.lines') }}</span></div>
            <div class="unit-stat"><b>{{ fmt(unit.stats.chars) }}</b><span>{{ $t('form.metricOptions.characters') }}</span></div>
            <div class="unit-stat"><b>{{ fmt(unit.stats.regions) }}</b><span>{{ $t('form.metricOptions.regions') }}</span></div>
          </div>
          <details class="unit-stats-edit">
            <summary>{{ $t('zenodo.editStats') }}</summary>
            <div class="form-row" style="margin-top:10px;grid-template-columns:repeat(3,1fr)">
              <div class="form-group">
                <label class="form-label">{{ $t('form.metricOptions.lines') }}</label>
                <input class="form-input" type="number" :value="unit.stats?.lines" @input="updateStat('lines', $event.target.value)">
              </div>
              <div class="form-group">
                <label class="form-label">{{ $t('form.metricOptions.characters') }}</label>
                <input class="form-input" type="number" :value="unit.stats?.chars" @input="updateStat('chars', $event.target.value)">
              </div>
              <div class="form-group">
                <label class="form-label">{{ $t('form.metricOptions.regions') }}</label>
                <input class="form-input" type="number" :value="unit.stats?.regions" @input="updateStat('regions', $event.target.value)">
              </div>
            </div>
          </details>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { analyzeFiles } from '../../utils/xmlAnalyzer.js'
import { autoSlug } from '../../utils/zenodoZip.js'

const { t } = useI18n()
const props = defineProps({
  unit:       { type: Object, required: true },
  index:      { type: Number, required: true },
  orgLevels:  { type: Number, default: 1 },
  prefixLabel:{ type: String, default: 'Prefix' },
})
const emit = defineEmits(['update', 'remove'])

const fileInput = ref(null)
const dragging  = ref(false)
const analyzing = ref(false)

function slugifyInput(s) {
  return s.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-')
}

function onName(value) {
  emit('update', { name: value, slug: autoSlug(value) })
}

const livePath = computed(() => {
  const slug = props.unit.slug || autoSlug(props.unit.name) || '…'
  if (props.orgLevels === 2 && props.unit.prefix) {
    return `data/${props.unit.prefix}/${slug}/`
  }
  return `data/${slug}/`
})

const xmlCount = computed(() =>
  (props.unit.files || []).filter(f => f.name.toLowerCase().endsWith('.xml')).length
)

async function addFiles(list) {
  const all = [...(props.unit.files || []), ...Array.from(list)]
  emit('update', { files: all })
  const xmlFiles = all.filter(f => f.name.toLowerCase().endsWith('.xml'))
  if (!xmlFiles.length) return
  analyzing.value = true
  try {
    const result = await analyzeFiles(xmlFiles)
    emit('update', {
      stats: { lines: result.lines, chars: result.chars, regions: result.regions, files: all.length }
    })
  } finally {
    analyzing.value = false
  }
}

function onPick(e) { addFiles(e.target.files) }
function onDrop(e) { dragging.value = false; addFiles(e.dataTransfer.files) }
function clearFiles() {
  emit('update', { files: [], stats: { lines: 0, chars: 0, regions: 0, files: 0 } })
  if (fileInput.value) fileInput.value.value = ''
}
function updateStat(key, val) {
  emit('update', { stats: { ...props.unit.stats, [key]: Number(val) || 0 } })
}
function fmt(n) { return (n || 0).toLocaleString() }
</script>

<style scoped>
.unit-card {
  border: 1px solid var(--line); border-radius: var(--radius);
  background: var(--surface); box-shadow: var(--shadow-sm); overflow: hidden; margin-bottom: 20px;
}
.unit-card__head {
  display: flex; align-items: center; gap: 12px; padding: 12px 18px;
  background: var(--olive-tint-2); border-bottom: 1px solid var(--olive-tint);
}
.unit-card__num { font-size: 12px; font-weight: 700; color: var(--olive-deep); white-space: nowrap; }
.unit-card__path { font-family: var(--mono); font-size: 12px; color: var(--olive-deep); }
.unit-card__body { padding: 20px; display: flex; flex-direction: column; gap: 0; }
.unit-drop { padding: 16px 18px; margin-top: 8px; }
.unit-files { margin-top: 12px; }
.unit-files__summary { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-size: 13px; color: var(--ink-2); margin-bottom: 10px; }
.unit-files__count { font-weight: 700; color: var(--ink); }
.unit-files__xml { color: var(--ink-3); }
.unit-stats { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 10px; }
.unit-stat { display: flex; flex-direction: column; background: var(--surface-2); border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 8px 14px; }
.unit-stat b { font-family: var(--mono); font-size: 16px; font-weight: 700; color: var(--ink); }
.unit-stat span { font-size: 10.5px; color: var(--ink-3); text-transform: uppercase; letter-spacing: .04em; }
.unit-stats-edit { font-size: 12.5px; color: var(--ink-3); cursor: pointer; margin-top: 4px; }
.unit-stats-edit summary { font-weight: 600; color: var(--accent); }
.unit-stats-edit summary:hover { text-decoration: underline; }
@keyframes pulse { from { opacity:.4 } to { opacity:1 } }
</style>
