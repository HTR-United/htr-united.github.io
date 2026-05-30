<template>
  <div style="display:flex;flex-direction:column;min-height:100vh">
    <TopBar />

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      {{ $t('catalog.loading') }}
    </div>

    <!-- Not found -->
    <div v-else-if="!dataset" class="page-content" style="max-width:600px">
      <p style="color:var(--ink-3);margin-bottom:16px">Dataset not found.</p>
      <a class="btn btn--ghost" href="/catalog.html">← {{ $t('nav.catalog') }}</a>
    </div>

    <!-- Full record -->
    <template v-else>
      <div class="share-band">
        <div class="share-band__inner">
          <div>
            <div class="share-band__title">{{ dataset.name }}</div>
            <div class="share-band__sub" v-if="dataset.project">{{ dataset.project }}</div>
          </div>
          <div class="share-band__era">
            <span class="share-band__dates">{{ dataset.dateStart }}{{ dataset.dateStart !== dataset.dateEnd ? ' – ' + dataset.dateEnd : '' }}</span>
            <span v-for="p in dataset.period" :key="p" class="share-band__period">{{ p }}</span>
          </div>
        </div>
      </div>

      <div class="share-layout">
        <!-- Main column -->
        <main class="share-main">

          <!-- Description -->
          <section class="share-section" v-if="dataset.description">
            <h2 class="share-section__h">Description</h2>
            <p class="share-desc">{{ dataset.description }}</p>
          </section>

          <!-- Volume metrics -->
          <section class="share-section" v-if="hasVolume">
            <h2 class="share-section__h">{{ $t('catalog.facets.size') }}</h2>
            <div class="share-metrics">
              <div v-if="dataset.lines"   class="share-metric"><b>{{ fmt(dataset.lines) }}</b><span>{{ $t('catalog.units.lines') }}</span></div>
              <div v-if="dataset.chars"   class="share-metric"><b>{{ fmt(dataset.chars) }}</b><span>{{ $t('catalog.units.characters') }}</span></div>
              <div v-if="dataset.files"   class="share-metric"><b>{{ fmt(dataset.files) }}</b><span>{{ $t('catalog.units.files') }}</span></div>
              <div v-if="dataset.regions" class="share-metric"><b>{{ fmt(dataset.regions) }}</b><span>{{ $t('catalog.units.regions') }}</span></div>
            </div>
          </section>

          <!-- Transcription guidelines -->
          <section class="share-section" v-if="dataset.guidelines">
            <h2 class="share-section__h">{{ $t('catalog.normsTitle') }}</h2>
            <div class="share-norms" v-html="normsHtml"></div>
          </section>

          <!-- BibTeX citation -->
          <section class="share-section">
            <h2 class="share-section__h">{{ $t('catalog.citeTitle') }}</h2>
            <pre class="bibtex" v-html="bibtex"></pre>
          </section>
        </main>

        <!-- Sidebar -->
        <aside class="share-sidebar">

          <!-- Actions -->
          <div class="share-box">
            <a v-if="dataset.repo" class="btn btn--olive" style="width:100%;justify-content:center;margin-bottom:8px"
               :href="dataset.repo" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>
              {{ $t('catalog.repoLink') }}
            </a>
            <a v-if="dataset.cff && dataset.repo" class="btn btn--ghost" style="width:100%;justify-content:center;margin-bottom:8px"
               :href="dataset.repo + '/blob/main/CITATION.cff'" target="_blank" rel="noopener">
              {{ $t('catalog.cffLink') }}
            </a>
            <a class="btn btn--ghost" style="width:100%;justify-content:center" href="/catalog.html">
              ← {{ $t('nav.catalog') }}
            </a>
          </div>

          <!-- Metadata -->
          <div class="share-box">
            <dl class="share-dl">

              <!-- Languages -->
              <template v-if="dataset.language?.length">
                <dt>{{ $t('catalog.facets.language') }}</dt>
                <dd>
                  <div class="chips" style="gap:5px">
                    <span v-for="l in dataset.language" :key="l" class="chip chip--rose">
                      <span class="chip__v" style="padding:3px 8px">{{ isoLang(l) }}</span>
                    </span>
                  </div>
                </dd>
              </template>

              <!-- Scripts -->
              <template v-if="dataset.script?.length">
                <dt>{{ $t('catalog.facets.script') }}</dt>
                <dd>
                  <div class="chips" style="gap:5px">
                    <span v-for="s in dataset.script" :key="s" class="chip chip--rose">
                      <span class="chip__v" style="padding:3px 8px">{{ isoScript(s) }}</span>
                    </span>
                  </div>
                </dd>
              </template>

              <!-- Script type -->
              <template v-if="dataset.scriptType?.length">
                <dt>{{ $t('catalog.facets.scriptType') }}</dt>
                <dd>{{ $t('catalog.scriptTypeLabel.' + dataset.scriptType[0], dataset.scriptType[0]) }}</dd>
              </template>

              <!-- Hands -->
              <template v-if="dataset.hands?.length">
                <dt>{{ $t('catalog.facets.hands') }}</dt>
                <dd>{{ $t('catalog.handsLabel.' + dataset.hands[0], dataset.hands[0]) }}</dd>
              </template>

              <!-- Software -->
              <template v-if="dataset.software?.length">
                <dt>{{ $t('catalog.facets.software') }}</dt>
                <dd>{{ dataset.software.join(', ') }}</dd>
              </template>

              <!-- Format -->
              <template v-if="dataset.format?.length">
                <dt>Format</dt>
                <dd>{{ dataset.format.join(', ') }}</dd>
              </template>

              <!-- License -->
              <template v-if="dataset.license?.length">
                <dt>{{ $t('catalog.facets.license') }}</dt>
                <dd>{{ dataset.license.join(', ') }}</dd>
              </template>

              <!-- Authors -->
              <template v-if="dataset.authors">
                <dt>{{ $t('catalog.authorsLabel') }}</dt>
                <dd>{{ dataset.authors }}</dd>
              </template>

            </dl>
          </div>

          <!-- Share permalink -->
          <div class="share-box share-permalink">
            <div class="share-permalink__label">Permalink</div>
            <input class="share-permalink__input" readonly :value="permalink" @click="$event.target.select()">
          </div>
        </aside>
      </div>
    </template>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import TopBar from '../TopBar.vue'
import AppFooter from '../AppFooter.vue'
import { useCatalog } from '../../composables/useCatalog.js'
import { renderMarkdown } from '../../utils/markdown.js'

const { t, locale } = useI18n()
const { datasets, loading } = useCatalog()
const dataset = ref(null)

const permalink = computed(() => window.location.href.split('?')[0] + '?id=' + (dataset.value?.id ?? ''))

onMounted(() => {
  const id = new URLSearchParams(window.location.search).get('id')
  if (!id) return
  const resolve = () => {
    const found = datasets.value.find(d => d.id === id)
    if (found) {
      dataset.value = found
      document.title = found.name + ' — HTR-United'
      return
    }
    if (loading.value) setTimeout(resolve, 80)
  }
  resolve()
})

/* ── ISO labels ── */
const langNames   = computed(() => { try { return new Intl.DisplayNames([locale.value], { type: 'language' }) } catch { return null } })
const scriptNames = computed(() => { try { return new Intl.DisplayNames([locale.value], { type: 'script'   }) } catch { return null } })

function isoLang(code) {
  try { const n = langNames.value?.of(code); if (n && n !== code) return cap(n) } catch {}
  return t(`catalog.languages.${code}`, code)
}
function isoScript(code) {
  try { const n = scriptNames.value?.of(code); if (n && n !== code) return cap(n) } catch {}
  return t(`catalog.scripts.${code}`, code)
}
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s }

/* ── helpers ── */
const hasVolume = computed(() => dataset.value && (dataset.value.lines || dataset.value.chars || dataset.value.files || dataset.value.regions))
const normsHtml = computed(() => renderMarkdown(dataset.value?.norms))

function fmt(n) { return n.toLocaleString() }

function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]))
}

const bibtex = computed(() => {
  const d = dataset.value
  if (!d) return ''
  const id = 'htr_' + d.id.replace(/[^a-z0-9]/gi, '_')
  const authStr = (d.authors || '').split(',').slice(0, 3).map(a => a.trim()).join(' and ')
  return `@misc{<span class="s">${esc(id)}</span>,\n` +
    `  <span class="k">title</span>     = {<span class="s">${esc(d.name)}</span>},\n` +
    `  <span class="k">author</span>    = {<span class="s">${esc(authStr)}</span>},\n` +
    `  <span class="k">publisher</span> = {<span class="s">HTR-United</span>},\n` +
    (d.repo ? `  <span class="k">url</span>       = {<span class="s">${esc(d.repo)}</span>},\n` : '') +
    `  <span class="k">year</span>      = {<span class="s">${d.dateEnd}</span>}\n}`
})
</script>

<style>
/* Band header */
.share-band {
  background: linear-gradient(180deg, var(--olive-band), #b6c486);
  border-bottom: 1px solid rgba(95,106,57,.28);
  padding: 28px 0;
}
.share-band__inner {
  max-width: var(--maxw); margin: 0 auto; padding: 0 28px;
  display: flex; align-items: flex-start; justify-content: space-between; gap: 24px;
}
.share-band__title {
  font-family: var(--serif); font-size: 28px; font-weight: 600;
  color: #3b4422; letter-spacing: -.015em; line-height: 1.2;
}
.share-band__sub {
  font-size: 14px; color: #5a6630; margin-top: 6px; font-style: italic;
}
.share-band__era {
  text-align: right; flex-shrink: 0;
}
.share-band__dates {
  display: block; font-family: var(--mono); font-size: 15px; font-weight: 700;
  color: #3b4422; margin-bottom: 6px;
}
.share-band__period {
  display: inline-block; font-size: 12px; color: #4e5730; font-style: italic;
  background: rgba(255,255,255,.35); border-radius: 4px; padding: 2px 7px; margin: 2px 2px 0 0;
}

/* Layout */
.share-layout {
  max-width: var(--maxw); margin: 0 auto; padding: 32px 28px 80px;
  display: grid; grid-template-columns: 1fr 300px; gap: 40px; align-items: start;
}
.share-main { min-width: 0; }
.share-sidebar { position: sticky; top: 76px; display: flex; flex-direction: column; gap: 16px; }

/* Sections */
.share-section { margin-bottom: 36px; }
.share-section:last-child { margin-bottom: 0; }
.share-section__h {
  font-family: var(--serif); font-size: 16px; font-weight: 600; color: var(--olive-deep);
  margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid var(--line);
  letter-spacing: -.01em;
}
.share-desc { font-size: 15px; line-height: 1.75; color: var(--ink-2); margin: 0; white-space: pre-line; }

/* Metrics */
.share-metrics { display: flex; gap: 28px; flex-wrap: wrap; }
.share-metric { display: flex; flex-direction: column; gap: 2px; }
.share-metric b { font-family: var(--mono); font-size: 22px; font-weight: 600; color: var(--ink); }
.share-metric span { font-size: 11.5px; color: var(--ink-3); text-transform: uppercase; letter-spacing: .04em; }

/* Norms */
.share-norms { font-size: 14px; line-height: 1.7; color: var(--ink-2); }
.share-norms p { margin: 0 0 10px; }
.share-norms p:last-child { margin-bottom: 0; }
.share-norms ul { margin: 0 0 10px; padding-left: 20px; }
.share-norms li { margin-bottom: 4px; }
.share-norms a { color: var(--accent); }

/* Sidebar boxes */
.share-box {
  background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius);
  padding: 18px; box-shadow: var(--shadow-sm);
}

/* Definition list */
.share-dl { display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; margin: 0; }
.share-dl dt {
  font-size: 11.5px; font-weight: 700; color: var(--ink-3); text-transform: uppercase;
  letter-spacing: .04em; padding-top: 3px; white-space: nowrap;
}
.share-dl dd { font-size: 13.5px; color: var(--ink-2); margin: 0; }

/* Permalink */
.share-permalink__label { font-size: 11.5px; font-weight: 700; color: var(--ink-3);
  text-transform: uppercase; letter-spacing: .04em; margin-bottom: 7px; }
.share-permalink__input {
  width: 100%; font-family: var(--mono); font-size: 11.5px; color: var(--ink-2);
  border: 1px solid var(--line-2); border-radius: 6px; padding: 7px 10px;
  background: var(--surface-2); cursor: text;
}
.share-permalink__input:focus { outline: none; border-color: var(--olive); }

@media (max-width: 900px) {
  .share-layout { grid-template-columns: 1fr; }
  .share-sidebar { position: static; }
  .share-band__inner { flex-direction: column; gap: 12px; }
  .share-band__era { text-align: left; }
}
</style>
