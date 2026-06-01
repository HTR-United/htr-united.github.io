<template>
  <div style="display:flex;flex-direction:column;min-height:100vh">
    <TopBar active-page="catalog" />

    <div class="pagehead">
      <h1>{{ $t('catalog.pageTitle') }} <span class="accent">{{ $t('catalog.pageTitleAccent') }}</span></h1>
      <p>{{ $t('catalog.nota') }}</p>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      {{ $t('catalog.loading') }}
    </div>

    <div v-else-if="error" class="page-content">
      <p style="color:var(--rose-ink)">Failed to load catalog: {{ error }}</p>
    </div>

    <div v-else class="shell">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar__scroll">
          <!-- Search -->
          <div class="search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
            <input
              type="text" :placeholder="$t('catalog.searchLabel')"
              autocomplete="off" :value="state.search"
              @input="state.search = $event.target.value"
            >
            <button
              class="search__clear" :class="{ show: !!state.search }"
              @click="state.search = ''"
            >&times;</button>
          </div>

          <div class="facets__head">
            <h2>{{ $t('catalog.filters') }}</h2>
            <button class="btn-reset" :disabled="!hasAnyFilter" @click="resetAll">
              {{ $t('catalog.clearAll') }}
            </button>
          </div>

          <!-- Dynamic facets — values come from a single computed, no per-render work -->
          <template v-for="facet in visibleFacets" :key="facet.key">
            <div class="facet" :class="{ collapsed: collapsed.has(facet.key) }">
              <button class="facet__head" @click="toggleCollapse(facet.key)">
                <span>{{ $t('catalog.facets.' + facet.key) }}</span>
                <span v-if="state.filters[facet.key]?.size" class="facet__count">{{ state.filters[facet.key].size }}</span>
                <svg class="facet__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              <div class="facet__body">
                <div
                  v-for="item in allFacetValues[facet.key]"
                  :key="item.value"
                  class="opt"
                  :class="{
                    'is-on':   state.filters[facet.key]?.has(item.value),
                    'is-zero': item.n === 0 && !state.filters[facet.key]?.has(item.value)
                  }"
                  @click="item.n > 0 || state.filters[facet.key]?.has(item.value) ? toggleFilter(facet.key, item.value) : null"
                >
                  <span class="opt__box"></span>
                  <span class="opt__label">{{ item.label }}</span>
                  <span class="opt__n">{{ item.n }}</span>
                </div>
              </div>
            </div>

            <!-- Date range injected after the Period facet -->
            <div v-if="facet.key === 'period'" class="facet" :class="{ collapsed: collapsed.has('_dates') }">
              <button class="facet__head" @click="toggleCollapse('_dates')">
                <span>{{ $t('catalog.dates') }}</span>
                <svg class="facet__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              <div class="daterange">
                <div class="daterange__row">
                  <div class="daterange__field">
                    <label>{{ $t('catalog.dateMin') }}</label>
                    <input type="number" step="10" :value="state.dateMin" @change="state.dateMin = +$event.target.value || DATE_FLOOR">
                  </div>
                  <div class="daterange__field">
                    <label>{{ $t('catalog.dateMax') }}</label>
                    <input type="number" step="10" :value="state.dateMax" @change="state.dateMax = +$event.target.value || DATE_CEIL">
                  </div>
                </div>
                <div class="daterange__hint">{{ $t('catalog.dateHint') }}</div>
              </div>
            </div>
          </template>

          <!-- Options -->
          <div class="facet" :class="{ collapsed: collapsed.has('_options') }">
            <button class="facet__head" @click="toggleCollapse('_options')">
              <span>{{ $t('catalog.availability') }}</span>
              <svg class="facet__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <div class="facet__body">
              <div v-for="opt in optionFacets" :key="opt.key"
                   class="toggle" :class="{ 'is-on': state.options.has(opt.key) }"
                   @click="toggleOption(opt.key)">
                <span class="toggle__sw"></span>
                <span style="flex:1">{{ $t('catalog.' + opt.i18nKey) }}</span>
                <span class="opt__n">{{ optionCounts[opt.key] }}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Results -->
      <section class="results" :class="{ 'show-norms': state.showNorms, 'show-cite': state.showCite }">
        <!-- Active chips -->
        <div class="activechips">
          <span v-if="state.search" class="achip achip--search">
            <span class="achip__cat">{{ $t('catalog.searchChip') }}</span>
            &ldquo;{{ state.search }}&rdquo;
            <button @click="state.search = ''">&times;</button>
          </span>
          <template v-for="facet in visibleFacets" :key="'chips-' + facet.key">
            <span v-for="val in [...(state.filters[facet.key] || [])]" :key="val" class="achip">
              <span class="achip__cat">{{ $t('catalog.facets.' + facet.key) }}</span>
              {{ isoLabel(facet.key, val) }}
              <button @click="toggleFilter(facet.key, val)">&times;</button>
            </span>
          </template>
          <span v-for="optKey in [...state.options]" :key="'opt-' + optKey" class="achip">
            <span class="achip__cat">{{ $t('catalog.optChip') }}</span>
            {{ optKey === 'cff' ? $t('catalog.optCff') : $t('catalog.optGuidelines') }}
            <button @click="toggleOption(optKey)">&times;</button>
          </span>
          <span v-if="state.dateMin !== DATE_FLOOR || state.dateMax !== DATE_CEIL" class="achip">
            <span class="achip__cat">{{ $t('catalog.datesChip') }}</span>
            {{ state.dateMin }} → {{ state.dateMax }}
            <button @click="resetDates">&times;</button>
          </span>
        </div>

        <!-- Toolbar -->
        <div class="toolbar">
          <div class="toolbar__count">
            <b>{{ filtered.length }}</b>
            {{ $t('catalog.countDatasets', filtered.length) }}
          </div>
          <div class="toolbar__stats">
            {{ $t('catalog.statsProjects', projectCount, { n: projectCount }) }} ·
            <b>{{ fmtNum(totalChars) }}</b> {{ $t('catalog.units.characters') }} ·
            <b>{{ fmtNum(totalLines) }}</b> {{ $t('catalog.units.lines') }}
          </div>
          <div class="toolbar__spacer"></div>

          <div class="toolbar__ctrl">
            <div class="toggle" style="padding:6px 8px" :class="{ 'is-on': state.showNorms }" @click="state.showNorms = !state.showNorms">
              <span class="toggle__sw"></span><span>{{ $t('catalog.toggleNorms') }}</span>
            </div>
            <div class="toggle" style="padding:6px 8px" :class="{ 'is-on': state.showCite }" @click="state.showCite = !state.showCite">
              <span class="toggle__sw"></span><span>{{ $t('catalog.toggleCite') }}</span>
            </div>
          </div>

          <div class="toolbar__ctrl">
            <label for="sort-select">{{ $t('catalog.sortLabel') }}</label>
            <select id="sort-select" class="select" :value="state.sort" @change="state.sort = $event.target.value">
              <option value="name-asc">{{ $t('catalog.sortNameAsc') }}</option>
              <option value="name-desc">{{ $t('catalog.sortNameDesc') }}</option>
              <option value="date-asc">{{ $t('catalog.sortDateAsc') }}</option>
              <option value="date-desc">{{ $t('catalog.sortDateDesc') }}</option>
            </select>
          </div>

          <div class="viewtoggle">
            <button :class="{ 'is-on': state.view === 'detailed' }" :title="$t('catalog.viewDetailed')" @click="state.view = 'detailed'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="7" rx="1"/><rect x="3" y="14" width="18" height="7" rx="1"/></svg>
            </button>
            <button :class="{ 'is-on': state.view === 'compact' }" :title="$t('catalog.viewCompact')" @click="state.view = 'compact'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>
            </button>
            <button :class="{ 'is-on': state.view === 'list' }" :title="$t('catalog.viewList')" @click="state.view = 'list'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
            </button>
          </div>
        </div>

        <!-- Cards -->
        <div class="grid" :class="gridClass">
          <template v-if="sorted.length === 0">
            <div class="empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <h3>{{ $t('catalog.emptyTitle') }}</h3>
              <p>{{ $t('catalog.emptyDesc') }}</p>
              <button class="btn btn--primary" @click="resetAll">{{ $t('catalog.resetFilters') }}</button>
            </div>
          </template>
          <!-- v-memo skips vnode patching for cards whose visible content hasn't changed.
               search + locale are the only things that affect card content; view/norms/cite
               are handled by CSS classes on the parent section. -->
          <CatalogCard
            v-for="d in sorted"
            :key="d.id"
            v-memo="[d.id, state.search, locale]"
            :dataset="d"
            :search="state.search"
            :locale="locale"
          />
        </div>
      </section>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import TopBar from '../TopBar.vue'
import AppFooter from '../AppFooter.vue'
import CatalogCard from './CatalogCard.vue'
import { useCatalog } from '../../composables/useCatalog.js'

const { t, locale } = useI18n()
const { datasets, loading, error } = useCatalog()

const DATE_FLOOR = -250
const DATE_CEIL  = 2024

const FACETS = [
  { key: 'language' },
  { key: 'script' },
  { key: 'scriptType' },
  { key: 'period' },
  { key: 'hands' },
  { key: 'size' },
  { key: 'software' },
  { key: 'license' },
  { key: 'project', scalar: true },
]

const optionFacets = [
  { key: 'cff',        i18nKey: 'optCff' },
  { key: 'guidelines', i18nKey: 'optGuidelines' },
]

const state = reactive({
  search:    '',
  filters:   Object.fromEntries(FACETS.map(f => [f.key, new Set()])),
  options:   new Set(),
  dateMin:   DATE_FLOOR,
  dateMax:   DATE_CEIL,
  sort:      'date-asc',
  view:      'detailed',
  showNorms: false,
  showCite:  false,
})

const ALL_COLLAPSIBLE = [...FACETS.map(f => f.key), '_dates', '_options']
const isMobile = () => typeof window !== 'undefined' && window.innerWidth <= 1080
const collapsed = reactive(new Set(isMobile() ? ALL_COLLAPSIBLE : []))
function toggleCollapse(key) { collapsed.has(key) ? collapsed.delete(key) : collapsed.add(key) }

/* ── ISO labels via Intl.DisplayNames (handles FR/EN automatically) ── */
const langNames  = computed(() => {
  try { return new Intl.DisplayNames([locale.value], { type: 'language' }) } catch { return null }
})
const scriptNames = computed(() => {
  try { return new Intl.DisplayNames([locale.value], { type: 'script' }) } catch { return null }
})

function isoLabel(facetKey, value) {
  if (facetKey === 'language') {
    try { const n = langNames.value?.of(value); if (n && n !== value) return capitalize(n) } catch {}
    return t(`catalog.languages.${value}`, value)
  }
  if (facetKey === 'script') {
    try { const n = scriptNames.value?.of(value); if (n && n !== value) return capitalize(n) } catch {}
    return t(`catalog.scripts.${value}`, value)
  }
  if (facetKey === 'scriptType') return t(`catalog.scriptTypeLabel.${value}`, value)
  if (facetKey === 'hands')      return t(`catalog.handsLabel.${value}`, value)
  if (facetKey === 'size')       return tierLabel(Number(value))
  return value
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s }

/* ── matching (uses pre-computed _hay) ── */
function tokens(s) { return s.toLowerCase().split(/\s+/).filter(Boolean) }

function matchSearch(d) {
  if (!state.search) return true
  const toks = tokens(state.search)
  return toks.every(t => d._hay.includes(t))
}
function matchDate(d)    { return d.dateEnd >= state.dateMin && d.dateStart <= state.dateMax }
function matchOptions(d) { for (const o of state.options) { if (!d[o]) return false }; return true }
function matchFacet(d, key) {
  const sel = state.filters[key]
  if (!sel || sel.size === 0) return true
  if (key === 'size') return sel.has(String(d._sizeTier))
  const facet = FACETS.find(f => f.key === key)
  if (facet?.scalar) return sel.has(d[key] || '')
  return (d[key] || []).some(v => sel.has(v))
}
function matches(d, exclude = null) {
  if (exclude !== 'search'  && !matchSearch(d))  return false
  if (exclude !== 'date'    && !matchDate(d))    return false
  if (exclude !== 'options' && !matchOptions(d)) return false
  for (const f of FACETS) {
    if (f.key === exclude) continue
    if (!matchFacet(d, f.key)) return false
  }
  return true
}

const SIZE_KEYS = ['catalog.sizeTiny', 'catalog.sizeSmall', 'catalog.sizeMedium', 'catalog.sizeLarge']
// Tier is pre-computed on the dataset (0-3); translate only at display time
function tierLabel(tier) { return t(SIZE_KEYS[tier] ?? SIZE_KEYS[3]) }

/* ── single computed for ALL facet values — called once per state change ── */
const allFacetValues = computed(() => {
  const result = {}
  const PERIOD_ORDER = ['Antiquité','Moyen Âge','Époque moderne','XIXe siècle','XXe siècle','XXIe siècle']

  for (const facet of FACETS) {
    const key = facet.key
    const counts = {}

    const facetDef = FACETS.find(f => f.key === key)
    const getVals  = d => key === 'size' ? [d._sizeTier] : facetDef?.scalar ? (d[key] ? [d[key]] : []) : (d[key] || [])

    // Collect all possible values first (to show zero-count items)
    for (const d of datasets.value) {
      for (const v of getVals(d)) { if (!(v in counts)) counts[v] = 0 }
    }
    // Count matches excluding this facet
    for (const d of datasets.value) {
      if (!matches(d, key)) continue
      for (const v of getVals(d)) { counts[v] = (counts[v] || 0) + 1 }
    }

    const items = Object.entries(counts).map(([value, n]) => ({
      value, n, label: isoLabel(key, value)
    }))

    items.sort((a, b) => {
      if (key === 'period') return PERIOD_ORDER.indexOf(a.value) - PERIOD_ORDER.indexOf(b.value)
      if (key === 'size')   return Number(a.value) - Number(b.value)
      if (b.n !== a.n) return b.n - a.n
      return a.label.localeCompare(b.label)
    })

    result[key] = items
  }
  return result
})

/* ── option facet counts (separate from facet values) ── */
const optionCounts = computed(() => {
  const out = {}
  for (const opt of optionFacets) {
    out[opt.key] = datasets.value.filter(d => matches(d, 'options') && d[opt.key]).length
  }
  return out
})

/* ── only show facets that have at least one value in data ── */
const visibleFacets = computed(() =>
  FACETS.filter(f => {
    const vals = allFacetValues.value[f.key]
    return vals && vals.length > 0
  })
)

/* ── filtered + sorted ── */
const filtered = computed(() => datasets.value.filter(d => matches(d)))

const sorted = computed(() => {
  const arr = filtered.value.slice()
  switch (state.sort) {
    case 'name-asc':  arr.sort((a, b) => a.name.localeCompare(b.name))  ; break
    case 'name-desc': arr.sort((a, b) => b.name.localeCompare(a.name))  ; break
    case 'date-asc':  arr.sort((a, b) => a.dateStart - b.dateStart)     ; break
    case 'date-desc': arr.sort((a, b) => b.dateEnd   - a.dateEnd)       ; break
    default: break
  }
  return arr
})

const projectCount = computed(() => new Set(filtered.value.map(d => d.project)).size)
const totalChars   = computed(() => filtered.value.reduce((s, d) => s + (d.chars || 0), 0))
const totalLines   = computed(() => filtered.value.reduce((s, d) => s + (d.lines || 0), 0))

const hasAnyFilter = computed(() =>
  state.search || state.options.size ||
  state.dateMin !== DATE_FLOOR || state.dateMax !== DATE_CEIL ||
  FACETS.some(f => (state.filters[f.key]?.size ?? 0) > 0)
)

const gridClass = computed(() => ({
  'is-compact': state.view === 'compact',
  'is-list':    state.view === 'list',
}))

/* ── actions ── */
function toggleFilter(key, val) {
  if (!state.filters[key]) state.filters[key] = new Set()
  state.filters[key].has(val) ? state.filters[key].delete(val) : state.filters[key].add(val)
}
function toggleOption(key) { state.options.has(key) ? state.options.delete(key) : state.options.add(key) }
function resetDates() { state.dateMin = DATE_FLOOR; state.dateMax = DATE_CEIL }
function resetAll() {
  state.search = ''
  FACETS.forEach(f => state.filters[f.key]?.clear())
  state.options.clear()
  resetDates()
}
function fmtNum(n) { return n.toLocaleString() }
</script>
