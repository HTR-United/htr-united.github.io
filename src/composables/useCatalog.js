import { ref } from 'vue'

const CATALOG_URL = 'https://htr-united.github.io/htr-united/catalog.json'

const PERIOD_RANGES = [
  { label: 'Antiquité',      from: -Infinity, before: 500  },
  { label: 'Moyen Âge',     from: 500,        before: 1400 },
  { label: 'Époque moderne', from: 1400,       before: 1800 },
  { label: 'XIXe siècle',   from: 1800,       before: 1900 },
  { label: 'XXe siècle',    from: 1900,       before: 2000 },
  { label: 'XXIe siècle',   from: 2000,       before: Infinity },
]

function derivePeriods(start, end) {
  return PERIOD_RANGES
    .filter(p => start < p.before && end >= p.from)
    .map(p => p.label)
}

// Normalize hands.count to the canonical values the UI expects
const HANDS_MAP = {
  '1':            '1-per-file',
  '1-per-file':   '1-per-file',
  '1-per-folder': '1-per-folder',
  // older schema spellings
  '1perfile':     '1-per-file',
  '1perfolder':   '1-per-folder',
  'less10':       'fewer-than-10',
  'less-than-11': 'fewer-than-10',
  'fewer-than-10':'fewer-than-10',
  'more10':       'more-than-10',
  'more-than-10': 'more-than-10',
  'unknown':      'unknown',
}

function mapHands(hands) {
  if (!hands) return ['unknown']
  const raw = typeof hands === 'string' ? hands : (hands.count ?? 'unknown')
  return [HANDS_MAP[raw] ?? raw]
}

// license: either a single {name,url} object or an array of them
function normalizeLicense(lic) {
  if (!lic) return []
  const arr = Array.isArray(lic) ? lic : [lic]
  return arr.map(l => (typeof l === 'string' ? l : l.name)?.trim()).filter(Boolean)
}

// script: always [{iso: "Latn"}, ...] in the real data
function normalizeScript(script) {
  if (!script) return []
  return (Array.isArray(script) ? script : [script])
    .map(s => (typeof s === 'string' ? s : s.iso))
    .filter(Boolean)
}

// format: a string or an array
function normalizeFormat(fmt) {
  if (!fmt) return []
  return Array.isArray(fmt) ? fmt : [fmt]
}

function getVolume(volumeArr, metric) {
  if (!Array.isArray(volumeArr)) return 0
  const entry = volumeArr.find(v => v.metric === metric)
  return entry ? (Number(entry.count) || 0) : 0
}

function transform(id, raw) {
  const start = parseInt(raw.time?.notBefore, 10) || 0
  const end   = parseInt(raw.time?.notAfter,  10) || start

  const authors = (raw.authors || [])
    .map(a => [a.name, a.surname].filter(Boolean).join(' ').trim())
    .filter(Boolean)
    .join(', ')

  const chars   = getVolume(raw.volume, 'characters')
  const lines   = getVolume(raw.volume, 'lines')
  const files   = getVolume(raw.volume, 'files')
  const regions = getVolume(raw.volume, 'regions')

  const entry = {
    id,
    name:        raw.title || id,
    project:     (raw['project-name'] || '').trim(),
    dateStart:   start,
    dateEnd:     end,
    era:         start === end ? String(start) : `${start}–${end}`,
    period:      derivePeriods(start, end),
    language:    Array.isArray(raw.language) ? raw.language : (raw.language ? [raw.language] : []),
    script:      normalizeScript(raw.script),
    scriptType:  raw['script-type'] ? [raw['script-type']] : [],
    hands:       mapHands(raw.hands),
    license:     normalizeLicense(raw.license),
    software:    raw['production-software'] ? [raw['production-software']] : [],
    format:      normalizeFormat(raw.format),
    chars,
    lines,
    files,
    regions,
    description: raw.description || '',
    authors,
    norms:       raw['transcription-guidelines'] || '',
    guidelines:  !!(raw['transcription-guidelines']),
    cff:         !!(raw['citation-file-link'] || raw['cff-file-link'] || raw['citation-file']),
    repo:        raw.url || '',
    genre:       [],
    support:     [],
  }
  // Size tier (0–3) stored as number so facet labels stay locale-independent
  const l = lines
  entry._sizeTier = l < 10000 ? 0 : l < 50000 ? 1 : l < 100000 ? 2 : 3

  // Pre-compute search haystack once so matching is O(1) string search
  entry._hay = [
    entry.name, entry.project, entry.era, entry.description,
    entry.authors, entry.norms,
    entry.language.join(' '), entry.script.join(' '),
    entry.license.join(' '), entry.software.join(' '),
  ].join(' • ').toLowerCase()
  return entry
}

let _cache = null

export function useCatalog() {
  const datasets = ref([])
  const loading  = ref(true)
  const error    = ref(null)

  async function load() {
    if (_cache) {
      datasets.value = _cache
      loading.value  = false
      return
    }
    try {
      const res = await fetch(CATALOG_URL)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const raw = await res.json()
      if (typeof raw !== 'object' || Array.isArray(raw) || raw === null) {
        throw new Error(`Unexpected catalog format: ${typeof raw}`)
      }
      _cache = Object.entries(raw).map(([id, data]) => transform(id, data))
      datasets.value = _cache
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  load()
  return { datasets, loading, error }
}
