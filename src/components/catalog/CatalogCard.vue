<template>
  <article class="card">
    <div class="card__band">
      <div class="card__title" v-html="hl(dataset.name)"></div>
      <div class="card__era">
        {{ dataset.era }}<br>
        <b>{{ dataset.dateStart }}{{ dataset.dateStart !== dataset.dateEnd ? ' – ' + dataset.dateEnd : '' }}</b>
      </div>
    </div>

    <div class="card__body">
      <!-- Links -->
      <div class="links" v-if="dataset.repo">
        <a class="lnk" :href="dataset.repo" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>
          {{ $t('catalog.repoLink') }}
        </a>
        <a v-if="dataset.cff" class="lnk" :href="dataset.repo" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
          {{ $t('catalog.cffLink') }}
        </a>
      </div>

      <!-- Taxonomy chips (rose) -->
      <div class="chips" v-if="hasRoseChips">
        <span v-for="lang in dataset.language" :key="'l'+lang" class="chip chip--rose">
          <span class="chip__k">{{ $t('catalog.chips.language') }}</span>
          <span class="chip__v">{{ isoLang(lang) }}</span>
        </span>
        <span v-for="sc in dataset.script" :key="'s'+sc" class="chip chip--rose">
          <span class="chip__k">{{ $t('catalog.chips.script') }}</span>
          <span class="chip__v">{{ isoScript(sc) }}</span>
        </span>
        <span v-for="st in dataset.scriptType" :key="'st'+st" class="chip chip--rose">
          <span class="chip__k">{{ $t('catalog.chips.scriptType') }}</span>
          <span class="chip__v">{{ $t('catalog.scriptTypeLabel.' + st, st) }}</span>
        </span>
        <span v-if="dataset.hands?.length" class="chip chip--rose">
          <span class="chip__k">{{ $t('catalog.chips.hands') }}</span>
          <span class="chip__v">{{ $t('catalog.handsShort.' + dataset.hands[0], dataset.hands[0]) }}</span>
        </span>
      </div>

      <!-- Volume chips (blue) -->
      <div class="chips" v-if="hasBlueChips">
        <span v-if="dataset.chars" class="chip chip--blue">
          <span class="chip__k">{{ $t('catalog.chips.chars') }}</span>
          <span class="chip__v">{{ fmt(dataset.chars) }} {{ $t('catalog.units.characters') }}</span>
        </span>
        <span v-if="dataset.lines" class="chip chip--blue">
          <span class="chip__k">{{ $t('catalog.chips.lines') }}</span>
          <span class="chip__v">{{ fmt(dataset.lines) }} {{ $t('catalog.units.lines') }}</span>
        </span>
        <span v-if="dataset.files" class="chip chip--blue">
          <span class="chip__k">{{ $t('catalog.chips.files') }}</span>
          <span class="chip__v">{{ fmt(dataset.files) }} {{ $t('catalog.units.files') }}</span>
        </span>
        <span v-if="dataset.regions" class="chip chip--blue">
          <span class="chip__k">{{ $t('catalog.chips.regions') }}</span>
          <span class="chip__v">{{ fmt(dataset.regions) }} {{ $t('catalog.units.regions') }}</span>
        </span>
      </div>

      <!-- Meta chips (license + software) -->
      <div class="chips" v-if="dataset.license?.length || dataset.software?.length">
        <span v-for="lic in dataset.license" :key="'lic'+lic" class="chip">
          <span class="chip__k">{{ $t('catalog.chips.license') }}</span>
          <span class="chip__v">{{ lic }}</span>
        </span>
        <span v-for="sw in dataset.software" :key="'sw'+sw" class="chip chip--green">
          <span class="chip__k">{{ $t('catalog.chips.software') }}</span>
          <span class="chip__v">{{ sw }}</span>
        </span>
      </div>

      <!-- Compact metrics strip -->
      <div class="card__metrics">
        <div v-if="dataset.lines" class="metric">
          <b>{{ fmt(dataset.lines) }}</b><span>{{ $t('catalog.units.lines') }}</span>
        </div>
        <div v-if="dataset.files" class="metric">
          <b>{{ fmt(dataset.files) }}</b><span>{{ $t('catalog.units.files') }}</span>
        </div>
        <div v-if="dataset.chars" class="metric">
          <b>{{ fmt(dataset.chars) }}</b><span>{{ $t('catalog.units.characters') }}</span>
        </div>
        <div v-if="dataset.hands?.length" class="metric">
          <b>{{ $t('catalog.handsShort.' + dataset.hands[0], dataset.hands[0]) }}</b>
          <span>{{ $t('catalog.chips.hands') }}</span>
        </div>
      </div>

      <!-- Description -->
      <p class="card__desc" v-html="hl(dataset.description)"></p>

      <!-- Authors -->
      <div class="card__authors" v-if="dataset.authors">
        <b>{{ $t('catalog.authorsLabel') }}</b> · <span v-html="hl(dataset.authors)"></span>
      </div>

      <!-- Transcription guidelines (toggle-controlled via CSS) -->
      <div class="section section--norms" v-if="dataset.guidelines">
        <h4 class="section__h">{{ $t('catalog.normsTitle') }}</h4>
        <div class="norms-body" v-html="normsHtml"></div>
      </div>

      <!-- Citation BibTeX (toggle-controlled via CSS) -->
      <div class="section section--cite">
        <h4 class="section__h">{{ $t('catalog.citeTitle') }}</h4>
        <pre class="bibtex" v-html="bibtex"></pre>
      </div>

      <!-- Footer actions -->
      <div class="card__foot">
        <a v-if="dataset.repo" class="btn btn--primary" :href="dataset.repo" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          {{ $t('catalog.viewFull') }}
        </a>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { renderMarkdownHl, renderMarkdown } from '../../utils/markdown.js'


const props = defineProps({
  dataset: { type: Object, required: true },
  search:  { type: String, default: '' },
  locale:  { type: String, default: 'fr' },
})

const { t } = useI18n()

const langNames   = computed(() => { try { return new Intl.DisplayNames([props.locale], { type: 'language' }) } catch { return null } })
const scriptNames = computed(() => { try { return new Intl.DisplayNames([props.locale], { type: 'script'   }) } catch { return null } })

function isoLang(code) {
  try { const n = langNames.value?.of(code); if (n && n !== code) return capitalize(n) } catch {}
  return t(`catalog.languages.${code}`, code)
}
function isoScript(code) {
  try { const n = scriptNames.value?.of(code); if (n && n !== code) return capitalize(n) } catch {}
  return t(`catalog.scripts.${code}`, code)
}
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s }

function fmt(n) { return n.toLocaleString() }

function esc(s) {
  return String(s).replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])
  )
}

function hl(text) {
  let t = esc(text || '')
  if (!props.search) return t
  props.search.toLowerCase().split(/\s+/).filter(w => w.length > 1).forEach(tok => {
    const re = new RegExp('(' + tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi')
    t = t.replace(re, '<mark>$1</mark>')
  })
  return t
}

const bibtex = computed(() => {
  const d = props.dataset
  const id = 'htr_' + d.id.replace(/-/g, '_')
  const authStr = (d.authors || '').split(',').slice(0, 3).map(a => a.trim()).join(' and ')
  return `@misc{<span class="s">${esc(id)}</span>,\n` +
    `  <span class="k">title</span>     = {<span class="s">${esc(d.name)}</span>},\n` +
    `  <span class="k">author</span>    = {<span class="s">${esc(authStr)}</span>},\n` +
    `  <span class="k">publisher</span> = {<span class="s">HTR-United</span>},\n` +
    `  <span class="k">year</span>      = {<span class="s">${d.dateEnd}</span>}\n}`
})

const normsHtml = computed(() => renderMarkdownHl(props.dataset.norms, props.search))

const hasRoseChips = computed(() =>
  props.dataset.language?.length || props.dataset.script?.length ||
  props.dataset.scriptType?.length || props.dataset.hands?.length
)

const hasBlueChips = computed(() =>
  props.dataset.chars || props.dataset.lines || props.dataset.files || props.dataset.regions
)
</script>

<style>
/* v-html content can't use scoped styles */
.norms-body { font-size: 12.5px; line-height: 1.6; color: var(--ink-2); }
.norms-body p { margin: 0 0 8px; }
.norms-body p:last-child { margin-bottom: 0; }
.norms-body ul { margin: 0 0 8px; padding-left: 18px; }
.norms-body li { margin-bottom: 3px; }
.norms-body a { color: var(--accent); }
.norms-body a:hover { color: var(--accent-deep); }
</style>
