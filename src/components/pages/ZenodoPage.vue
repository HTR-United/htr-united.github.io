<template>
  <div style="display:flex;flex-direction:column;min-height:100vh">
    <TopBar active-page="zenodo" />

    <div class="pagehead">
      <h1>{{ $t('zenodo.title') }} <span class="accent">{{ $t('zenodo.titleAccent') }}</span></h1>
      <p>{{ $t('zenodo.intro') }}</p>
    </div>

    <!-- Step indicator -->
    <div class="zw-steps">
      <button v-for="(label, i) in stepLabels" :key="i"
        class="zw-step" :class="{ 'zw-step--on': step === i+1, 'zw-step--done': step > i+1 }"
        @click="step > i+1 || step === i+1 ? (step = i+1) : null">
        <span class="zw-step__num">{{ step > i+1 ? '✓' : i+1 }}</span>
        <span class="zw-step__label">{{ label }}</span>
      </button>
    </div>

    <div class="form-page" style="max-width:860px">

      <!-- ══════════ STEP 1: Project Info ══════════ -->
      <template v-if="step === 1">

        <!-- YAML import -->
        <div class="form-section" style="background:var(--olive-tint-2);border-color:var(--olive-tint)">
          <h2>{{ $t('zenodo.importTitle') }}</h2>
          <p class="form-help" style="margin-bottom:12px">
            {{ $t('zenodo.importDesc') }}
            <a href="/document-your-data.html">{{ $t('nav.form') }}</a>.
          </p>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
            <button class="btn btn--ghost" @click="yamlInput.click()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              {{ $t('zenodo.importBtn') }}
            </button>
            <input ref="yamlInput" type="file" accept=".yml,.yaml" style="display:none" @change="importYaml">
            <span v-if="importedFrom" style="font-size:12.5px;color:var(--green-ink)">✓ {{ importedFrom }}</span>
          </div>
        </div>

        <!-- DOI callout -->
        <div class="form-section zw-doi-callout">
          <div class="zw-doi-callout__icon">🔗</div>
          <div style="flex:1">
            <strong>{{ $t('zenodo.doiCalloutTitle') }}</strong>
            <p class="form-help" style="margin:4px 0 10px">{{ $t('zenodo.doiCalloutDesc') }}</p>
            <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
              <a class="btn btn--primary" href="https://zenodo.org/uploads/new" target="_blank" rel="noopener">
                {{ $t('zenodo.doiCreate') }} ↗
              </a>
              <div style="display:flex;align-items:center;gap:8px">
                <label class="form-label" style="white-space:nowrap;margin-bottom:0">{{ $t('zenodo.doiPaste') }}</label>
                <input class="form-input" style="width:220px;font-family:var(--mono);font-size:13px"
                  v-model="state.doi" placeholder="10.5281/zenodo.XXXXXXX">
              </div>
            </div>
          </div>
        </div>

        <!-- Project fields -->
        <div class="form-section">
          <h2>{{ $t('zenodo.projectInfo') }}</h2>
          <div class="form-group">
            <label class="form-label">{{ $t('zenodo.projectTitle') }} <span class="req">*</span></label>
            <input class="form-input" v-model="state.title" :placeholder="$t('zenodo.projectTitlePlaceholder')">
          </div>
          <div class="form-group">
            <label class="form-label">{{ $t('zenodo.projectDesc') }}</label>
            <textarea class="form-input" rows="4" v-model="state.description"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">{{ $t('zenodo.license') }}</label>
              <select class="form-input form-select" v-model="state.license">
                <option value="CC-BY 4.0">CC-BY 4.0</option>
                <option value="CC-BY-SA 4.0">CC-BY-SA 4.0</option>
                <option value="Etalab OL 2.0">Etalab OL 2.0</option>
                <option value="ODbL 1.0">ODbL 1.0</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">{{ $t('zenodo.funding') }}</label>
              <input class="form-input" v-model="state.funding" :placeholder="$t('zenodo.fundingPlaceholder')">
            </div>
          </div>

          <!-- Authors -->
          <div class="form-group">
            <label class="form-label">{{ $t('zenodo.authors') }}</label>
            <div v-for="(author, idx) in state.authors" :key="idx" class="author-card">
              <div class="author-card__header">
                <span class="author-card__title">{{ $t('form.fields.authors') }} #{{ idx+1 }}</span>
                <button v-if="state.authors.length > 1" class="btn btn--ghost" style="padding:4px 9px;font-size:12px;color:var(--rose-ink)" @click="state.authors.splice(idx,1)">✕</button>
              </div>
              <div class="form-row" style="grid-template-columns:1fr 1fr 1fr">
                <div class="form-group" style="margin-bottom:0">
                  <label class="form-label">{{ $t('form.fields.authorName') }}</label>
                  <input class="form-input" v-model="author.name">
                </div>
                <div class="form-group" style="margin-bottom:0">
                  <label class="form-label">{{ $t('form.fields.authorSurname') }}</label>
                  <input class="form-input" v-model="author.surname">
                </div>
                <div class="form-group" style="margin-bottom:0">
                  <label class="form-label">ORCID</label>
                  <input class="form-input" v-model="author.orcid" placeholder="0000-0000-0000-0000" style="font-family:var(--mono);font-size:13px">
                </div>
              </div>
            </div>
            <button class="add-row-btn" @click="state.authors.push({ name:'', surname:'', orcid:'' })">
              + {{ $t('form.fields.addAuthor') }}
            </button>
          </div>
        </div>

        <div class="form-row" style="margin-top:4px">
          <div></div>
          <button class="btn btn--olive btn--lg" style="justify-self:end" @click="step=2">
            {{ $t('zenodo.next') }} →
          </button>
        </div>
      </template>

      <!-- ══════════ STEP 2: Units ══════════ -->
      <template v-if="step === 2">

        <!-- Global organisation scheme -->
        <div class="form-section">
          <h2>{{ $t('zenodo.orgSchemeTitle') }}</h2>
          <p class="form-help" style="margin-bottom:14px">{{ $t('zenodo.orgSchemeDesc') }}</p>

          <div class="zw-org-choice">
            <label class="zw-org-opt" :class="{ 'zw-org-opt--on': state.orgLevels === 1 }">
              <input type="radio" :value="1" v-model="state.orgLevels" style="display:none">
              <div class="zw-org-opt__header">
                <span class="zw-org-opt__pill">{{ $t('zenodo.org1Level') }}</span>
                <code class="zw-org-opt__example">data/paris-bnf-it-1019/</code>
              </div>
              <p class="zw-org-opt__desc">{{ $t('zenodo.org1LevelDesc') }}</p>
            </label>
            <label class="zw-org-opt" :class="{ 'zw-org-opt--on': state.orgLevels === 2 }">
              <input type="radio" :value="2" v-model="state.orgLevels" style="display:none">
              <div class="zw-org-opt__header">
                <span class="zw-org-opt__pill">{{ $t('zenodo.org2Levels') }}</span>
                <code class="zw-org-opt__example">data/<em>fra</em>/paris-bnf-it-1019/</code>
              </div>
              <p class="zw-org-opt__desc">{{ $t('zenodo.org2LevelsDesc') }}</p>
            </label>
          </div>

          <!-- Prefix label selector (only for 2-level) -->
          <template v-if="state.orgLevels === 2">
            <div class="form-group" style="margin-top:16px">
              <label class="form-label">{{ $t('zenodo.prefixRepresents') }}</label>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px">
                <button v-for="opt in PREFIX_OPTIONS" :key="opt.value"
                  class="tag-btn" :class="{ 'is-on': state.orgPrefixLabel === opt.value }"
                  @click="state.orgPrefixLabel = opt.value">
                  {{ opt.label }}
                </button>
              </div>
              <div v-if="state.orgPrefixLabel === 'custom'" style="margin-top:8px">
                <input class="form-input" style="max-width:240px"
                  v-model="state.orgPrefixCustom"
                  :placeholder="$t('zenodo.prefixCustomPlaceholder')">
              </div>
              <p class="form-help">{{ $t('zenodo.prefixNote') }}</p>
            </div>
          </template>
        </div>

        <div class="form-section" style="background:var(--surface-2);border-color:var(--line);padding:14px 18px">
          <p class="form-help">{{ $t('zenodo.unitsDesc') }}</p>
        </div>

        <UnitCard
          v-for="(unit, idx) in state.units"
          :key="unit.id"
          :unit="unit"
          :index="idx"
          :org-levels="state.orgLevels"
          :prefix-label="activePrefixLabel"
          @update="updateUnit(idx, $event)"
          @remove="removeUnit(idx)"
        />

        <button class="add-row-btn" style="margin-bottom:20px" @click="addUnit">
          + {{ $t('zenodo.addUnit') }}
        </button>

        <div style="display:flex;gap:10px;justify-content:space-between">
          <button class="btn btn--ghost" @click="step=1">← {{ $t('zenodo.back') }}</button>
          <button class="btn btn--olive btn--lg" @click="step=3">{{ $t('zenodo.next') }} →</button>
        </div>
      </template>

      <!-- ══════════ STEP 3: Preview & Export ══════════ -->
      <template v-if="step === 3">
        <div class="form-section">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px">
            <h2 style="margin:0">{{ $t('zenodo.previewTitle') }}</h2>
            <button class="btn btn--ghost" style="font-size:12.5px;white-space:nowrap" @click="copyHtml">
              {{ copied ? $t('zenodo.copied') : $t('zenodo.copyHtml') }}
            </button>
          </div>
          <p class="form-help" style="margin-bottom:10px">{{ $t('zenodo.copyHtmlHint') }}</p>
          <div class="zw-readme-preview prose" v-html="renderedReadme"></div>
        </div>

        <div class="form-section">
          <h2>{{ $t('zenodo.editReadme') }}</h2>
          <textarea class="output-area" rows="28" v-model="readmeText"></textarea>
        </div>

        <div class="form-section">
          <h2>{{ $t('zenodo.exportTitle') }}</h2>
          <p class="form-help" style="margin-bottom:16px">{{ $t('zenodo.exportDesc') }}</p>

          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
            <button class="btn btn--ghost" @click="downloadReadme">
              📄 {{ $t('zenodo.downloadReadme') }}
            </button>
            <button class="btn btn--olive btn--lg" :disabled="zipping" @click="downloadZip">
              <span v-if="!zipping">📦 {{ $t('zenodo.downloadZip') }}</span>
              <span v-else>{{ $t('zenodo.zipping') }}</span>
            </button>
          </div>

          <div v-if="state.doi" class="zw-zenodo-link">
            <p>{{ $t('zenodo.uploadReminder') }}</p>
            <a class="btn btn--primary" href="https://zenodo.org/uploads/new" target="_blank" rel="noopener">
              {{ $t('zenodo.openZenodo') }} ↗
            </a>
          </div>
        </div>

        <div style="margin-top:4px">
          <button class="btn btn--ghost" @click="step=2">← {{ $t('zenodo.back') }}</button>
        </div>
      </template>

    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import jsyaml from 'js-yaml'
import TopBar from '../TopBar.vue'
import AppFooter from '../AppFooter.vue'
import UnitCard from '../zenodo/UnitCard.vue'
import { generateReadme, generateCff } from '../../utils/readmeGenerator.js'
import { generateZip, downloadBlob } from '../../utils/zenodoZip.js'
import { renderGfm } from '../../utils/markdown.js'

const { t } = useI18n()

const step     = ref(1)
const zipping  = ref(false)
const copied   = ref(false)
const yamlInput      = ref(null)
const importedFrom   = ref('')

const PREFIX_OPTIONS = computed(() => [
  { value: 'language',  label: t('zenodo.prefixLanguage') },
  { value: 'century',   label: t('zenodo.prefixCentury')  },
  { value: 'bookshelf', label: t('zenodo.prefixBookshelf')},
  { value: 'scribe',    label: t('zenodo.prefixScribe')   },
  { value: 'year',      label: t('zenodo.prefixYear')     },
  { value: 'custom',    label: t('zenodo.prefixCustom')   },
])

const state = reactive({
  title:            '',
  description:      '',
  license:          'CC-BY 4.0',
  doi:              '',
  funding:          '',
  authors:          [{ name: '', surname: '', orcid: '' }],
  orgLevels:        1,
  orgPrefixLabel:   'language',
  orgPrefixCustom:  '',
  units:            [],
})

const activePrefixLabel = computed(() => {
  if (state.orgPrefixLabel === 'custom') return state.orgPrefixCustom || t('zenodo.prefixCustom')
  return PREFIX_OPTIONS.value.find(o => o.value === state.orgPrefixLabel)?.label || state.orgPrefixLabel
})

const stepLabels = computed(() => [
  t('zenodo.step1'),
  t('zenodo.step2'),
  t('zenodo.step3'),
])

/* ── YAML import ── */
function importYaml(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => {
    try {
      const doc = jsyaml.load(ev.target.result) || {}
      if (doc.title)       state.title = doc.title
      if (doc.description) state.description = doc.description

      // license: array [{name, url}] or object
      const lic = Array.isArray(doc.license) ? doc.license[0] : doc.license
      if (lic?.name) state.license = lic.name

      if (doc['project-name']) state.funding = doc['project-name']

      if (Array.isArray(doc.authors) && doc.authors.length) {
        state.authors = doc.authors.map(a => ({
          name:    a.name    || '',
          surname: a.surname || '',
          orcid:   a.orcid   || '',
        }))
      }
      importedFrom.value = file.name
    } catch (err) {
      alert('Could not parse YAML: ' + err.message)
    }
  }
  reader.readAsText(file)
}

/* ── Units ── */
function addUnit() {
  state.units.push({
    id:         Math.random().toString(36).slice(2),
    name:       '',
    slug:       '',
    prefix:     '',
    dateStart:  '',
    dateEnd:    '',
    colorPages: false,
    link:       '',
    files:      [],
    stats:      { lines: 0, chars: 0, regions: 0, files: 0 },
  })
}

function updateUnit(idx, patch) {
  Object.assign(state.units[idx], patch)
}

function removeUnit(idx) {
  state.units.splice(idx, 1)
}

/* ── README ── */
const readmeText = ref('')

watch(() => step.value, (s) => {
  if (s === 3) readmeText.value = generateReadme(state)
}, { immediate: false })

const renderedReadme = computed(() => renderGfm(readmeText.value))

/* ── Copy HTML ── */
async function copyHtml() {
  await navigator.clipboard.writeText(renderedReadme.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

/* ── Downloads ── */
function downloadReadme() {
  const blob = new Blob([readmeText.value], { type: 'text/markdown' })
  downloadBlob(blob, 'README.md')
}

async function downloadZip() {
  zipping.value = true
  try {
    // Inject the possibly-edited README text
    const stateWithReadme = { ...state, _readmeOverride: readmeText.value }
    const { blob, filename } = await generateZip(stateWithReadme)
    downloadBlob(blob, filename)
  } finally {
    zipping.value = false
  }
}
</script>

<style scoped>
/* Step bar */
.zw-steps {
  display: flex; align-items: stretch;
  max-width: 860px; margin: 0 auto 4px; padding: 0 28px;
  gap: 0; border-bottom: 2px solid var(--line);
}
.zw-step {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 20px; background: none; border: none; cursor: default;
  font-family: var(--sans); font-size: 13.5px; color: var(--ink-3);
  border-bottom: 2px solid transparent; margin-bottom: -2px;
}
.zw-step--on { color: var(--olive-deep); border-bottom-color: var(--olive); cursor: default; }
.zw-step--done { color: var(--green-ink); cursor: pointer; }
.zw-step--done:hover { color: var(--olive-deep); }
.zw-step__num {
  width: 22px; height: 22px; border-radius: 50%; font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  background: var(--line); color: var(--ink-3);
}
.zw-step--on  .zw-step__num { background: var(--olive); color: #fff; }
.zw-step--done .zw-step__num { background: var(--green-bg); color: var(--green-ink); }
.zw-step__label { font-weight: 500; }

/* DOI callout */
.zw-doi-callout {
  display: flex; gap: 16px; align-items: flex-start;
  background: var(--blue-bg); border-color: var(--blue-line);
}
.zw-doi-callout__icon { font-size: 24px; flex-shrink: 0; line-height: 1.4; }

/* Org choice cards */
.zw-org-choice { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.zw-org-opt {
  border: 2px solid var(--line-2); border-radius: var(--radius); padding: 14px 16px;
  cursor: pointer; transition: border-color .15s, background .15s; display: block;
}
.zw-org-opt:hover { border-color: var(--olive-tint); background: var(--olive-tint-2); }
.zw-org-opt--on { border-color: var(--olive); background: var(--olive-tint-2); }
.zw-org-opt__header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.zw-org-opt__pill {
  font-size: 12px; font-weight: 700; padding: 2px 9px;
  background: var(--surface); border: 1px solid var(--line-2); border-radius: 20px; color: var(--ink-2);
}
.zw-org-opt--on .zw-org-opt__pill { background: var(--olive); border-color: var(--olive); color: #fff; }
.zw-org-opt__example { font-family: var(--mono); font-size: 12px; color: var(--olive-deep); }
.zw-org-opt__desc { font-size: 12.5px; color: var(--ink-3); margin: 0; }

/* README preview */
.zw-readme-preview {
  max-height: 500px; overflow-y: auto;
  padding: 20px; background: var(--surface-2);
  border: 1px solid var(--line); border-radius: var(--radius-sm);
}

/* Zenodo link */
.zw-zenodo-link {
  margin-top: 20px; padding: 16px;
  background: var(--blue-bg); border: 1px solid var(--blue-line);
  border-radius: var(--radius-sm); display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
}
.zw-zenodo-link p { margin: 0; font-size: 13.5px; color: var(--blue-ink); flex: 1; }
</style>
