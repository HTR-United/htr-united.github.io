<template>
  <div style="display:flex;flex-direction:column;min-height:100vh">
    <TopBar active-page="form" />

    <div class="pagehead">
      <h1>{{ $t('form.pageTitle') }}</h1>
      <p>{{ $t('form.intro') }}</p>
    </div>

    <div class="form-page">
      <!-- Instructions -->
      <div class="form-section" style="background:var(--olive-tint-2);border-color:var(--olive-tint)">
        <h2>{{ $t('form.stepsTitle') }}</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px">
          <div>
            <strong>{{ $t('form.step1Title') }}</strong>
            <p style="font-size:13.5px;color:var(--ink-2);margin:4px 0 0">{{ $t('form.step1Desc') }}</p>
          </div>
          <div>
            <strong>{{ $t('form.step2Title') }}</strong>
            <p style="font-size:13.5px;color:var(--ink-2);margin:4px 0 0">{{ $t('form.step2Desc') }}</p>
          </div>
          <div>
            <strong>{{ $t('form.step3Title') }}</strong>
            <p style="font-size:13.5px;color:var(--ink-2);margin:4px 0 0">{{ $t('form.step3Desc') }}</p>
          </div>
        </div>
        <p style="font-size:12.5px;color:var(--ink-3);margin:16px 0 0">{{ $t('form.mandatory') }}</p>
      </div>

      <!-- Step 1 marker -->
      <p class="step-heading"><span class="step-badge">1</span>{{ $t('form.step1Title').replace(/^1\.\s*/, '') }}</p>

      <!-- Dataset info -->
      <div class="form-section">
        <h2>{{ $t('form.sectionDs') }}</h2>
        <div class="form-group">
          <label class="form-label">{{ $t('form.fields.title') }} <span class="req">*</span></label>
          <input class="form-input" v-model="form.title" :placeholder="$t('form.fields.title')" data-testid="title">
        </div>
        <div class="form-group">
          <label class="form-label">{{ $t('form.fields.url') }} <span class="req">*</span></label>
          <input class="form-input" v-model="form.url" placeholder="https://github.com/..." data-testid="url">
        </div>
        <div class="form-group">
          <label class="form-label">{{ $t('form.fields.desc') }} <span class="req">*</span></label>
          <textarea class="form-input" rows="3" v-model="form.description" data-testid="description"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">{{ $t('form.fields.license') }} <span class="req">*</span></label>
          <select class="form-input form-select" v-model="form.license" data-testid="license">
            <option value="">—</option>
            <option value="CC-BY 4.0">CC-BY 4.0</option>
            <option value="CC-BY-SA 4.0">CC-BY-SA 4.0</option>
            <option value="Etalab OL 2.0">Etalab OL 2.0</option>
            <option value="ODbL 1.0">ODbL 1.0</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">{{ $t('form.fields.cffLink') }}</label>
          <input class="form-input" v-model="form.cff" placeholder="https://github.com/.../CITATION.cff">
          <p class="form-help">{{ $t('form.fields.cffInfo') }}</p>
        </div>
        <div class="form-group">
          <label class="form-label">{{ $t('form.fields.format') }} <span class="req">*</span></label>
          <select v-model="form.format" class="form-input form-select" data-testid="format">
            <option value="">—</option>
            <option v-for="fmt in formats" :key="fmt.value" :value="fmt.value">{{ fmt.label }}</option>
          </select>
        </div>
      </div>

      <!-- Project info -->
      <div class="form-section">
        <h2>{{ $t('form.sectionProject') }}</h2>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ $t('form.fields.projectName') }}</label>
            <input class="form-input" v-model="form.projectName">
          </div>
          <div class="form-group">
            <label class="form-label">{{ $t('form.fields.projectLink') }}</label>
            <input class="form-input" v-model="form.projectLink" placeholder="https://...">
          </div>
        </div>
      </div>

      <!-- Data info -->
      <div class="form-section">
        <h2>{{ $t('form.sectionData') }}</h2>

        <!-- Authors -->
        <div class="form-group">
          <label class="form-label">{{ $t('form.fields.authors') }}</label>
          <div v-for="(author, idx) in form.authors" :key="idx" class="author-card">
            <div class="author-card__header">
              <span class="author-card__title">{{ $t('form.fields.authors') }} #{{ idx + 1 }}</span>
              <button v-if="form.authors.length > 1" class="btn btn--ghost" style="padding:5px 10px;font-size:12px" @click="removeAuthor(idx)">
                {{ $t('form.fields.removeAuthor') }}
              </button>
            </div>
            <div class="form-row" style="grid-template-columns:1fr 1fr 1fr">
              <div class="form-group" style="margin-bottom:0">
                <label class="form-label">{{ $t('form.fields.authorName') }}</label>
                <input class="form-input" v-model="author.name" :data-testid="`author-name-${idx}`">
              </div>
              <div class="form-group" style="margin-bottom:0">
                <label class="form-label">{{ $t('form.fields.authorSurname') }}</label>
                <input class="form-input" v-model="author.surname" :data-testid="`author-surname-${idx}`">
              </div>
              <div class="form-group" style="margin-bottom:0">
                <label class="form-label">ORCID</label>
                <input class="form-input" v-model="author.orcid" placeholder="0000-0000-0000-0000" style="font-family:var(--mono);font-size:13px" :data-testid="`author-orcid-${idx}`">
              </div>
            </div>
            <div class="form-group" style="margin-top:12px;margin-bottom:0">
              <label class="form-label">{{ $t('form.fields.roles') }}</label>
              <div class="checkbox-grid">
                <label v-for="role in authorRoles" :key="role.value" class="checkbox-item">
                  <input type="checkbox" :value="role.value" v-model="author.roles" :data-testid="`author-role-${idx}-${role.value}`">
                  {{ $t('form.fields.' + role.labelKey) }}
                </label>
              </div>
            </div>
            <div class="form-group" style="margin-top:10px;margin-bottom:0">
              <label class="checkbox-item">
                <input type="checkbox" v-model="author.isInstitution" :data-testid="`author-institution-${idx}`">
                {{ $t('form.fields.authorIsInstitution') }}
              </label>
            </div>
          </div>
          <button class="add-row-btn" @click="addAuthor">
            + {{ $t('form.fields.addAuthor') }}
          </button>
        </div>

        <!-- Software -->
        <div class="form-group">
          <label class="form-label">{{ $t('form.fields.software') }} <span class="req">*</span></label>
          <input class="form-input" v-model="form.software" placeholder="eScriptorium, Kraken, Transkribus…" data-testid="software">
          <div class="tag-selector" style="margin-top:8px">
            <button v-for="sw in commonSoftware" :key="sw" class="tag-btn" :class="{ 'is-on': form.software === sw }" @click="form.software = sw">{{ sw }}</button>
          </div>
        </div>

        <!-- Dates -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ $t('form.fields.yearStart') }} <span class="req">*</span></label>
            <input class="form-input" type="number" v-model.number="form.dateStart" placeholder="1200" data-testid="date-start">
          </div>
          <div class="form-group">
            <label class="form-label">{{ $t('form.fields.yearEnd') }} <span class="req">*</span></label>
            <input class="form-input" type="number" v-model.number="form.dateEnd" placeholder="1299" data-testid="date-end">
          </div>
        </div>
        <p class="form-help">{{ $t('form.fields.yearInfo') }}</p>

        <!-- Languages -->
        <div class="form-group">
          <label class="form-label">{{ $t('form.fields.languages') }} <span class="req">*</span></label>
          <input class="form-input" v-model="langSearch" :placeholder="$t('form.fields.languages')" @keydown.enter.prevent="addLanguage(langSearch)" data-testid="lang-search">
          <div v-if="langSearch.length > 1" style="border:1px solid var(--line-2);border-top:none;border-radius:0 0 8px 8px;background:var(--surface);max-height:180px;overflow-y:auto">
            <div v-for="opt in filteredLanguages" :key="opt.value"
              style="padding:8px 13px;cursor:pointer;font-size:13.5px"
              @mousedown.prevent="selectLanguage(opt)"
              :style="{ background: form.languages.includes(opt.value) ? 'var(--olive-tint-2)' : '' }"
              :data-testid="`lang-option-${opt.value}`"
            >{{ opt.label }} <span style="color:var(--ink-3);font-size:12px">({{ opt.value }})</span></div>
          </div>
          <div class="tag-selector" style="margin-top:8px">
            <span v-for="lang in form.languages" :key="lang" class="tag-btn is-on" @click="form.languages = form.languages.filter(l => l !== lang)" style="cursor:pointer">
              {{ languageLabel(lang) }} ×
            </span>
          </div>
        </div>

        <!-- Scripts -->
        <div class="form-group">
          <label class="form-label">{{ $t('form.fields.scripts') }} <span class="req">*</span></label>
          <input class="form-input" v-model="scriptSearch" :placeholder="$t('form.fields.scripts')" @keydown.enter.prevent data-testid="script-search">
          <div v-if="scriptSearch.length > 1" style="border:1px solid var(--line-2);border-top:none;border-radius:0 0 8px 8px;background:var(--surface);max-height:180px;overflow-y:auto">
            <div v-for="opt in filteredScripts" :key="opt.value"
              style="padding:8px 13px;cursor:pointer;font-size:13.5px"
              @mousedown.prevent="selectScript(opt)"
              :style="{ background: form.scripts.includes(opt.value) ? 'var(--olive-tint-2)' : '' }"
              :data-testid="`script-option-${opt.value}`"
            >{{ opt.label }} <span style="color:var(--ink-3);font-size:12px">({{ opt.value }})</span></div>
          </div>
          <div class="tag-selector" style="margin-top:8px">
            <span v-for="sc in form.scripts" :key="sc" class="tag-btn is-on" @click="form.scripts = form.scripts.filter(s => s !== sc)" style="cursor:pointer">
              {{ scriptLabel(sc) }} ×
            </span>
          </div>
        </div>

        <!-- Script type -->
        <div class="form-group">
          <label class="form-label">{{ $t('form.fields.scriptType') }}</label>
          <select class="form-input form-select" v-model="form.scriptType" data-testid="script-type">
            <option v-for="(label, val) in scriptTypeOptions" :key="val" :value="val">{{ label }}</option>
          </select>
        </div>
      </div>

      <!-- Detailed info -->
      <div class="form-section">
        <h2>{{ $t('form.sectionDetail') }}</h2>

        <!-- Hands -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ $t('form.fields.hands') }}</label>
            <select class="form-input form-select" v-model="form.handsCount" data-testid="hands-count">
              <option v-for="(label, val) in handsOptions" :key="val" :value="val">{{ label }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">{{ $t('form.fields.precision') }}</label>
            <select class="form-input form-select" v-model="form.handsPrecision" data-testid="hands-precision">
              <option v-for="(label, val) in precisionOptions" :key="val" :value="val">{{ label }}</option>
            </select>
          </div>
        </div>

        <!-- Guidelines -->
        <div class="form-group">
          <label class="form-label">{{ $t('form.fields.guidelines') }}</label>
          <textarea class="form-input" rows="3" v-model="form.guidelines"></textarea>
          <p class="form-help">{{ $t('form.fields.guidelinesInfo') }}</p>
        </div>

        <!-- Local file analyzer -->
        <LocalAnalyzer @apply="applyMetrics" />

        <!-- Volume metrics -->
        <div class="form-group">
          <label class="form-label">{{ $t('form.fields.quantities') }} <span class="req">*</span></label>
          <div v-for="(metric, idx) in form.metrics" :key="idx" class="metric-row">
            <select class="form-input form-select" style="flex:0 0 160px" v-model="metric.type" :data-testid="`metric-type-${idx}`">
              <option v-for="(label, val) in metricOptions" :key="val" :value="val">{{ label }}</option>
            </select>
            <input class="form-input" type="number" v-model.number="metric.count" placeholder="0" :data-testid="`metric-count-${idx}`">
            <button class="btn btn--ghost" style="padding:8px 10px" @click="removeMetric(idx)">×</button>
          </div>
          <button class="add-row-btn" @click="addMetric">+ {{ $t('form.fields.addMetric') }}</button>
        </div>

        <!-- Flags -->
        <div class="form-group">
          <label class="form-label">{{ $t('form.fields.flags') }}</label>
          <label class="checkbox-item" style="margin-bottom:8px">
            <input type="checkbox" v-model="form.autoAligned">
            {{ $t('form.fields.autoAligned') }}
          </label>
          <p class="form-help" style="margin-bottom:12px">{{ $t('form.fields.autoAlignedInfo') }}</p>
          <label class="checkbox-item">
            <input type="checkbox" v-model="form.transliteration">
            {{ $t('form.fields.transliteration') }}
          </label>
          <p class="form-help">{{ $t('form.fields.transliterationInfo') }}</p>
        </div>

        <!-- Sources -->
        <div class="form-group">
          <label class="form-label">{{ $t('form.fields.sources') }}</label>
          <div v-for="(src, idx) in form.sources" :key="idx" style="display:flex;gap:8px;margin-bottom:8px">
            <input class="form-input" v-model="form.sources[idx]" :placeholder="$t('form.fields.sources')">
            <button class="btn btn--ghost" style="padding:8px 10px;flex-shrink:0" @click="form.sources.splice(idx, 1)">×</button>
          </div>
          <button class="add-row-btn" @click="form.sources.push('')">+ {{ $t('form.fields.addSource') }}</button>
          <p class="form-help">{{ $t('form.fields.apaInfo') }}</p>
        </div>
      </div>

      <!-- Output -->
      <div class="output-section">
        <p class="step-heading"><span class="step-badge">2</span>{{ $t('form.sectionGenerate') }}</p>
        <button class="btn btn--olive btn--lg" @click="generate" style="margin-bottom:16px" data-testid="generate-btn">
          {{ $t('form.generateBtn') }}
        </button>

        <div v-if="validationErrors.length" class="form-section" style="background:var(--red-tint-2,#fdecea);border-color:var(--red-tint,#f5c2c0);margin-bottom:16px" data-testid="validation-errors">
          <strong>{{ $t('form.validation.heading') }}</strong>
          <ul style="margin:8px 0 0;padding-left:20px">
            <li v-for="(err, idx) in validationErrors" :key="idx">{{ err }}</li>
          </ul>
        </div>

        <textarea class="output-area" readonly :value="output" rows="24" data-testid="output"></textarea>

        <div :class="{ 'step3-locked': !output }" style="margin-top:20px">
          <p class="step-heading"><span class="step-badge">3</span>{{ $t('form.outputSteps') }}</p>
          <template v-if="!output">
            <p class="step3-hint">{{ $t('form.step3Locked') }}</p>
          </template>
          <template v-else>
            <p style="font-size:13.5px;color:var(--ink-2);margin:0 0 10px">{{ $t('form.outputStep1') }}</p>
            <div class="output-actions">
              <button class="btn btn--ghost" @click="copyOutput">
                {{ copied ? $t('form.copied') : $t('form.copyBtn') }}
              </button>
              <a class="btn btn--ghost" :href="downloadHref" :download="downloadFilename">
                {{ $t('form.downloadBtn') }}
              </a>
            </div>
            <p style="font-size:13.5px;color:var(--ink-2);margin:16px 0 10px">{{ $t('form.outputStep2') }}</p>
            <div class="output-actions">
              <a v-if="createFileUrl" class="btn btn--primary" :href="createFileUrl" target="_blank" rel="noopener">
                {{ $t('form.newFile') }}
              </a>
              <a class="btn btn--ghost" href="https://github.com/HTR-United/htr-united/issues/new" target="_blank" rel="noopener">
                {{ $t('form.newIssue') }}
              </a>
            </div>
          </template>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import jsyaml from 'js-yaml'
import TopBar from '../TopBar.vue'
import AppFooter from '../AppFooter.vue'
import LocalAnalyzer from './LocalAnalyzer.vue'
import { languages as ALL_LANGUAGES, scripts as ALL_SCRIPTS } from '../../data/formConsts.js'

const { t } = useI18n()

/* ---- form state ---- */
const form = reactive({
  title:        '',
  url:          '',
  description:  '',
  license:      '',
  cff:          '',
  format:       '',
  projectName:  '',
  projectLink:  '',
  software:     '',
  authors: [{ name: '', surname: '', orcid: '', roles: [], isInstitution: false }],
  dateStart:    null,
  dateEnd:      null,
  languages:    [],
  scripts:      [],
  scriptType:   'only-manuscript',
  handsCount:   '1-per-file',
  handsPrecision: 'exact',
  guidelines:   '',
  metrics:      [{ type: 'lines', count: null }],
  autoAligned:     false,
  transliteration: false,
  sources:         [],
  characters:      null,  // populated by LocalAnalyzer: { mode, members }
})

/* ---- search inputs ---- */
const langSearch   = ref('')
const scriptSearch = ref('')

const filteredLanguages = computed(() => {
  if (langSearch.value.length < 2) return []
  const q = langSearch.value.toLowerCase()
  return ALL_LANGUAGES.filter(l => l.label.toLowerCase().includes(q) || l.value.toLowerCase().includes(q)).slice(0, 20)
})

const filteredScripts = computed(() => {
  if (scriptSearch.value.length < 2) return []
  const q = scriptSearch.value.toLowerCase()
  return ALL_SCRIPTS.filter(s => s.label.toLowerCase().includes(q) || s.value.toLowerCase().includes(q)).slice(0, 20)
})

function selectLanguage(opt) {
  if (!form.languages.includes(opt.value)) form.languages.push(opt.value)
  langSearch.value = ''
}
function selectScript(opt) {
  if (!form.scripts.includes(opt.value)) form.scripts.push(opt.value)
  scriptSearch.value = ''
}
function addLanguage(val) {
  const match = ALL_LANGUAGES.find(l => l.value === val || l.label.toLowerCase() === val.toLowerCase())
  if (match && !form.languages.includes(match.value)) { form.languages.push(match.value); langSearch.value = '' }
}
function languageLabel(code) {
  return ALL_LANGUAGES.find(l => l.value === code)?.label || code
}
function scriptLabel(code) {
  return ALL_SCRIPTS.find(s => s.value === code)?.label || code
}

/* ---- constants ---- */
const formats = [
  { value: 'Alto-XML',         label: 'ALTO XML' },
  { value: 'Page-XML',         label: 'PAGE XML' },
  { value: 'Image-Text-Pairs', label: t('form.fields.linepair') },
]
const commonSoftware = ['eScriptorium + Kraken', 'Transkribus', 'Kraken', 'Tesseract', 'OCRopy']

const authorRoles = [
  { value: 'transcriber',     labelKey: 'roleTranscriber' },
  { value: 'aligner',         labelKey: 'roleAligner' },
  { value: 'project-manager', labelKey: 'roleMainCreator' },
  { value: 'quality-control', labelKey: 'roleQualityControl' },
  { value: 'digitization',    labelKey: 'roleDigitizer' },
  { value: 'support',         labelKey: 'roleSupport' },
  { value: 'data-provider',   labelKey: 'roleDataProvider' },
]

const scriptTypeOptions = computed(() => ({
  'only-manuscript': t('form.scriptTypeOptions.only-manuscript'),
  'only-typed':      t('form.scriptTypeOptions.only-typed'),
  'mainly-manuscript': t('form.scriptTypeOptions.mainly-manuscript'),
  'mainly-typed':    t('form.scriptTypeOptions.mainly-typed'),
  'evenly-mixed':    t('form.scriptTypeOptions.evenly-mixed'),
}))

const handsOptions = computed(() => ({
  '1':             t('form.handsOptions.single'),
  '1-per-file':    t('form.handsOptions.1perfile'),
  '1-per-folder':  t('form.handsOptions.1perfolder'),
  'less-than-11':  t('form.handsOptions.less10'),
  'more-than-10':  t('form.handsOptions.more10'),
  'unknown':       t('form.handsOptions.unknown'),
}))

const precisionOptions = computed(() => ({
  'exact':     t('form.precisionOptions.exact'),
  'estimated': t('form.precisionOptions.estimated'),
}))

const metricOptions = computed(() => ({
  'lines':      t('form.metricOptions.lines'),
  'pages':      t('form.metricOptions.pages'),
  'characters': t('form.metricOptions.characters'),
  'regions':    t('form.metricOptions.regions'),
  'images':     t('form.metricOptions.images'),
  'files':      t('form.metricOptions.files'),
}))

/* ---- authors ---- */
function addAuthor() {
  form.authors.push({ name: '', surname: '', orcid: '', roles: [], isInstitution: false })
}
function removeAuthor(idx) {
  form.authors.splice(idx, 1)
}

/* ---- metrics ---- */
function addMetric() {
  form.metrics.push({ type: 'lines', count: null })
}
function removeMetric(idx) {
  form.metrics.splice(idx, 1)
}
function applyMetrics({ metrics, characters }) {
  form.metrics = metrics
  if (characters) form.characters = characters
}

/* ---- YAML generation ---- */
const output           = ref('')
const copied            = ref(false)
const validationErrors  = ref([])

const LICENSES = {
  'CC-BY 4.0':     'https://creativecommons.org/licenses/by/4.0/',
  'CC-BY-SA 4.0':  'https://creativecommons.org/licenses/by-sa/4.0/',
  'Etalab OL 2.0': 'https://spdx.org/licenses/etalab-2.0.html',
  'ODbL 1.0':      'https://opendatacommons.org/licenses/odbl/1-0/',
}

const ORCID_RE = /^\d{4}-\d{4}-\d{4}-[0-9]{3}[0-9X]$/

function normalizeOrcid(raw) {
  return (raw || '').trim().replace(/^https?:\/\/(www\.)?orcid\.org\//i, '')
}

// Institutions have no `surname` in the schema, so route them to the
// separate `institutions` array instead of `authors`.
function buildAuthorsAndInstitutions() {
  const authors = []
  const institutions = []
  form.authors.forEach(a => {
    if (a.isInstitution) {
      const name = (a.name || a.surname || '').trim()
      if (!name) return
      institutions.push({ name, ...(a.roles.length ? { roles: a.roles } : {}) })
    } else {
      const surname = (a.surname || '').trim()
      if (!surname) return
      authors.push({
        surname,
        ...(a.name ? { name: a.name } : {}),
        ...(a.roles.length ? { roles: a.roles } : {}),
        ...(a.orcid ? { orcid: normalizeOrcid(a.orcid) } : {}),
      })
    }
  })
  return { authors, institutions }
}

function validate() {
  const errors = []
  if (!form.title.trim()) errors.push(t('form.validation.title'))
  if (!form.url.trim()) errors.push(t('form.validation.url'))
  if (!form.description.trim()) errors.push(t('form.validation.description'))
  if (!form.license) errors.push(t('form.validation.license'))
  if (form.languages.length === 0) errors.push(t('form.validation.languages'))
  if (form.scripts.length === 0) errors.push(t('form.validation.scripts'))
  if (!form.format) errors.push(t('form.validation.format'))
  if (!form.software.trim()) errors.push(t('form.validation.software'))
  if (form.dateStart === null || form.dateStart === '' || form.dateEnd === null || form.dateEnd === '') {
    errors.push(t('form.validation.dates'))
  }
  if (!form.metrics.some(m => m.count !== null && m.count !== '')) errors.push(t('form.validation.volume'))

  const { authors, institutions } = buildAuthorsAndInstitutions()
  if (authors.length === 0 && institutions.length === 0) errors.push(t('form.validation.authorSurname'))
  if (![...authors, ...institutions].some(a => a.roles && a.roles.length > 0)) errors.push(t('form.validation.authorRoles'))

  form.authors.forEach(a => {
    const orcid = normalizeOrcid(a.orcid)
    if (orcid && !ORCID_RE.test(orcid)) {
      errors.push(t('form.validation.orcidFormat', { name: `${a.name} ${a.surname}`.trim() || '—' }))
    }
  })

  return errors
}

function generate() {
  const errors = validate()
  validationErrors.value = errors
  if (errors.length) {
    output.value = ''
    return
  }

  const { authors, institutions } = buildAuthorsAndInstitutions()

  const doc = {
    schema: 'https://htr-united.github.io/schema/2023-06-27/schema.json',
    title: form.title,
    url:   form.url,
    authors,
    institutions,
    description: form.description,
    'project-name': form.projectName || undefined,
    'project-website': form.projectLink || undefined,
    language: form.languages,
    script: form.scripts.map(s => ({ iso: s })),
    'script-type': form.scriptType,
    'production-software': form.software,
    time: {
      notBefore: String(form.dateStart),
      notAfter:  String(form.dateEnd),
    },
    hands: { count: form.handsCount, precision: form.handsPrecision },
    'transcription-guidelines': form.guidelines || undefined,
    volume: form.metrics
      .filter(m => m.count !== null && m.count !== '')
      .map(m => ({ metric: m.type, count: Number(m.count) })),
    'automatically-aligned': form.autoAligned,
    ...(() => {
      const hasMembers = form.characters?.members?.length > 0
      if (!hasMembers && !form.transliteration) return {}
      return {
        characters: {
          ...(form.characters ?? {}),
          transliteration: form.transliteration,
        }
      }
    })(),
    license: { name: form.license, url: LICENSES[form.license] || '' },
    format: form.format,
    ...(form.cff ? { 'citation-file-link': form.cff } : {}),
  }

  // Remove undefined keys
  Object.keys(doc).forEach(k => { if (doc[k] === undefined) delete doc[k] })

  output.value = jsyaml.dump(doc, { lineWidth: 100, quotingType: '"' })
}

const downloadHref = computed(() => {
  if (!output.value) return '#'
  return URL.createObjectURL(new Blob([output.value], { type: 'text/yaml' }))
})

const downloadFilename = computed(() => {
  const slug = (form.title || 'htr-united').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)
  return `${slug}.yml`
})

const createFileUrl = computed(() => {
  if (!output.value) return null
  const encoded = encodeURIComponent(output.value)
  return `https://github.com/HTR-United/htr-united/new/master/catalog?filename=${downloadFilename.value}&value=${encoded}`
})

async function copyOutput() {
  try {
    await navigator.clipboard.writeText(output.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch { /* fallback: select textarea */ }
}

</script>
