#!/usr/bin/env node
/**
 * HTR-United i18n Editor
 * Run: npm run translate  (or: make translate)
 * Serves a translation editor at http://localhost:3737
 * Reads/writes src/locales/*.json — no extra npm dependencies.
 */

const http = require('http')
const fs   = require('fs')
const path = require('path')

const LOCALES_DIR = path.join(__dirname, '../src/locales')
const PORT = parseInt(process.env.PORT || '3737', 10)

/* ── helpers ──────────────────────────────────────────────── */

function readLocale(lang) {
  const file = path.join(LOCALES_DIR, `${lang}.json`)
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function writeLocale(lang, data) {
  const file = path.join(LOCALES_DIR, `${lang}.json`)
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

function availableLanguages() {
  return fs.readdirSync(LOCALES_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''))
    .sort()
}

function flatten(obj, prefix = '') {
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key))
    } else {
      out[key] = v === null ? '' : String(v)
    }
  }
  return out
}

function unflatten(flat) {
  const result = {}
  for (const [dotKey, value] of Object.entries(flat)) {
    const parts = dotKey.split('.')
    let cur = result
    for (let i = 0; i < parts.length - 1; i++) {
      if (typeof cur[parts[i]] !== 'object' || cur[parts[i]] === null) cur[parts[i]] = {}
      cur = cur[parts[i]]
    }
    cur[parts[parts.length - 1]] = value
  }
  return result
}

function allKeys(langs) {
  const keySet = new Set()
  for (const lang of langs) {
    try { Object.keys(flatten(readLocale(lang))).forEach(k => keySet.add(k)) } catch {}
  }
  return [...keySet].sort()
}

function apiData() {
  const langs = availableLanguages()
  const keys  = allKeys(langs)
  const flat  = {}
  for (const lang of langs) {
    try { flat[lang] = flatten(readLocale(lang)) } catch { flat[lang] = {} }
  }
  return { langs, keys, flat }
}

/* ── request handling ─────────────────────────────────────── */

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', c => { body += c })
    req.on('end', () => { try { resolve(JSON.parse(body || '{}')) } catch { reject(new Error('Bad JSON')) } })
    req.on('error', reject)
  })
}

function send(res, status, data) {
  const body = typeof data === 'string' ? data : JSON.stringify(data)
  const ct   = typeof data === 'string' ? 'text/html; charset=utf-8' : 'application/json'
  res.writeHead(status, { 'Content-Type': ct, 'Cache-Control': 'no-cache' })
  res.end(body)
}

async function handleRequest(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const { pathname } = new URL(req.url, `http://localhost:${PORT}`)

  if (pathname === '/' || pathname === '/index.html') {
    return send(res, 200, buildUI())
  }

  if (pathname === '/api/data' && req.method === 'GET') {
    return send(res, 200, apiData())
  }

  if (pathname === '/api/save' && req.method === 'POST') {
    try {
      const { lang, flat } = await readBody(req)
      if (!lang || typeof flat !== 'object') return send(res, 400, { error: 'Missing lang or flat' })
      if (!/^[a-z]{2,5}(-[A-Za-z]{2,4})?$/.test(lang)) return send(res, 400, { error: 'Invalid lang code' })
      writeLocale(lang, unflatten(flat))
      console.log(`  saved  src/locales/${lang}.json`)
      return send(res, 200, { ok: true })
    } catch (e) {
      return send(res, 500, { error: e.message })
    }
  }

  if (pathname === '/api/add-language' && req.method === 'POST') {
    try {
      const { lang } = await readBody(req)
      if (!lang || !/^[a-z]{2,5}(-[A-Za-z]{2,4})?$/.test(lang)) return send(res, 400, { error: 'Invalid lang code' })
      const file = path.join(LOCALES_DIR, `${lang}.json`)
      if (fs.existsSync(file)) return send(res, 409, { error: 'Language already exists' })
      writeLocale(lang, {})
      console.log(`  created  src/locales/${lang}.json`)
      return send(res, 200, { ok: true })
    } catch (e) {
      return send(res, 500, { error: e.message })
    }
  }

  if (pathname === '/api/delete-language' && req.method === 'POST') {
    try {
      const { lang } = await readBody(req)
      if (!lang) return send(res, 400, { error: 'Missing lang' })
      if (lang === 'en') return send(res, 400, { error: 'Cannot delete the reference language (en)' })
      const file = path.join(LOCALES_DIR, `${lang}.json`)
      if (!fs.existsSync(file)) return send(res, 404, { error: 'Not found' })
      fs.unlinkSync(file)
      console.log(`  deleted  src/locales/${lang}.json`)
      return send(res, 200, { ok: true })
    } catch (e) {
      return send(res, 500, { error: e.message })
    }
  }

  send(res, 404, { error: 'Not found' })
}

/* ── HTML UI ──────────────────────────────────────────────── */

function buildUI() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>i18n Editor — HTR-United</title>
<style>
:root {
  --paper: #f4f2ea; --paper-2: #efece2; --surface: #fff; --surface-2: #faf9f4;
  --ink: #2b2a26; --ink-2: #57544c; --ink-3: #8b8779;
  --line: #e3ded0; --line-2: #d6d0bf;
  --olive: #7d8a4e; --olive-deep: #5f6a39; --olive-tint: #d9e0bf; --olive-tint-2: #e9edd8;
  --accent: #3f7cb0; --accent-deep: #2f6191;
  --rose-bg: #f6e2e0; --rose-ink: #97494a;
  --green-bg: #dde9d2; --green-ink: #43662f;
  --amber-bg: #fef3cd; --amber-ink: #8a6400;
  --serif: "Georgia", serif;
  --sans: system-ui, -apple-system, sans-serif;
  --mono: "SFMono-Regular", "Consolas", monospace;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; font-family: var(--sans); font-size: 14px; color: var(--ink); background: var(--paper); }

/* layout */
body { display: flex; flex-direction: column; }
.topbar {
  background: rgba(255,255,255,.95); border-bottom: 1px solid var(--line);
  padding: 0 20px; height: 52px; display: flex; align-items: center; gap: 16px;
  position: sticky; top: 0; z-index: 100; flex-shrink: 0;
}
.brand { font-size: 16px; font-weight: 700; color: var(--ink); }
.brand span { color: var(--olive-deep); }
.topbar-spacer { flex: 1; }
.badge { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600;
  padding: 3px 9px; border-radius: 20px; }
.badge-missing { background: var(--rose-bg); color: var(--rose-ink); }
.badge-ok { background: var(--green-bg); color: var(--green-ink); }
.badge-info { background: var(--olive-tint-2); color: var(--olive-deep); }
.save-status { font-size: 12px; color: var(--ink-3); transition: color .3s; }
.save-status.saving { color: var(--amber-ink); }
.save-status.saved { color: var(--green-ink); }

.controls {
  display: flex; align-items: center; gap: 10px; padding: 10px 20px;
  border-bottom: 1px solid var(--line); background: var(--surface-2); flex-shrink: 0; flex-wrap: wrap;
}
.search-input {
  font-family: var(--sans); font-size: 13.5px; color: var(--ink);
  padding: 7px 12px; border: 1px solid var(--line-2); border-radius: 7px;
  background: var(--surface); width: 280px;
}
.search-input:focus { outline: none; border-color: var(--olive); box-shadow: 0 0 0 2px var(--olive-tint-2); }
.filter-select {
  font-size: 13px; padding: 7px 10px; border: 1px solid var(--line-2);
  border-radius: 7px; background: var(--surface); color: var(--ink); cursor: pointer;
}
.controls-right { margin-left: auto; display: flex; gap: 8px; align-items: center; }
.btn {
  display: inline-flex; align-items: center; gap: 6px; font-family: var(--sans);
  font-size: 12.5px; font-weight: 600; padding: 7px 13px; border-radius: 7px;
  cursor: pointer; border: 1px solid transparent; text-decoration: none;
}
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent-deep); }
.btn-olive { background: var(--olive); color: #fff; }
.btn-olive:hover { background: var(--olive-deep); }
.btn-ghost { background: var(--surface); color: var(--ink-2); border-color: var(--line-2); }
.btn-ghost:hover { background: var(--paper-2); color: var(--ink); }
.btn-danger { background: var(--rose-bg); color: var(--rose-ink); border-color: #ecc9c5; }
.btn-danger:hover { background: #edc8c4; }

/* table area */
.table-wrap {
  flex: 1; overflow: auto; position: relative;
}
table {
  border-collapse: collapse; width: max-content; min-width: 100%;
}
thead th {
  background: var(--surface-2); border-bottom: 2px solid var(--line-2);
  padding: 9px 14px; text-align: left; font-size: 12px; font-weight: 700;
  color: var(--ink-3); letter-spacing: .04em; text-transform: uppercase;
  position: sticky; top: 0; z-index: 10; white-space: nowrap;
}
thead th:first-child { position: sticky; left: 0; z-index: 20; min-width: 280px; max-width: 320px; }
thead th.lang-header { min-width: 280px; }
.lang-header-inner { display: flex; align-items: center; gap: 8px; }
.lang-code { font-size: 13px; font-weight: 700; color: var(--ink); }
.lang-missing-count { font-size: 11px; color: var(--rose-ink); font-weight: 600; }
.lang-ok-count { font-size: 11px; color: var(--green-ink); font-weight: 600; }

tbody tr { border-bottom: 1px solid var(--line); }
tbody tr:hover { background: var(--surface-2); }
tbody tr.row-missing { background: #fff9f9; }
tbody tr.row-missing:hover { background: #fff2f2; }
tbody tr.filtered-out { display: none; }

td {
  padding: 0; vertical-align: top;
}
td:first-child {
  position: sticky; left: 0; background: var(--surface); z-index: 5;
  padding: 10px 14px; font-family: var(--mono); font-size: 12px; color: var(--ink-2);
  border-right: 1px solid var(--line-2); min-width: 280px; max-width: 320px;
  word-break: break-all; line-height: 1.5;
}
tbody tr:hover td:first-child { background: var(--surface-2); }
tbody tr.row-missing td:first-child { background: #fff9f9; }

.cell-value {
  display: block; width: 100%; min-height: 44px; padding: 10px 14px;
  font-family: var(--sans); font-size: 13.5px; color: var(--ink);
  border: none; background: transparent; resize: none; line-height: 1.55;
  cursor: text; outline: none; white-space: pre-wrap; word-break: break-word;
  overflow: hidden;
}
.cell-value:focus {
  background: var(--olive-tint-2); outline: 2px solid var(--olive); outline-offset: -2px;
  border-radius: 0; cursor: text;
}
.cell-empty .cell-value { color: var(--ink-3); font-style: italic; }
.cell-empty .cell-value::before { content: attr(data-placeholder); }
.cell-empty .cell-value:focus::before { content: ''; }

.section-row td {
  background: var(--olive-tint-2) !important; font-weight: 700; font-size: 11.5px;
  color: var(--olive-deep); letter-spacing: .04em; text-transform: uppercase;
  padding: 6px 14px; border-top: 1px solid var(--olive-tint);
}
.section-row td:first-child { font-family: var(--sans); }

/* empty state */
.empty-state { text-align: center; padding: 60px; color: var(--ink-3); }

/* modal */
.modal-bg {
  position: fixed; inset: 0; background: rgba(0,0,0,.35);
  display: none; align-items: center; justify-content: center; z-index: 200;
}
.modal-bg.open { display: flex; }
.modal {
  background: var(--surface); border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,.25);
  padding: 28px; min-width: 340px; max-width: 480px;
}
.modal h2 { font-size: 17px; font-weight: 700; margin-bottom: 14px; }
.modal label { display: block; font-size: 12.5px; font-weight: 700; color: var(--ink-2); margin-bottom: 6px; }
.modal input {
  width: 100%; padding: 9px 12px; border: 1px solid var(--line-2); border-radius: 7px;
  font-size: 14px; margin-bottom: 14px; font-family: var(--mono);
}
.modal input:focus { outline: none; border-color: var(--olive); box-shadow: 0 0 0 2px var(--olive-tint-2); }
.modal-note { font-size: 12.5px; color: var(--ink-3); margin-bottom: 16px; line-height: 1.5; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }

/* loading */
.loading-overlay {
  position: fixed; inset: 0; background: var(--paper);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; color: var(--ink-2); gap: 12px; z-index: 300;
}
.spinner {
  width: 20px; height: 20px; border: 2.5px solid var(--line-2);
  border-top-color: var(--olive); border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
</head>
<body>

<div class="loading-overlay" id="loading">
  <div class="spinner"></div> Loading translations…
</div>

<!-- topbar -->
<header class="topbar">
  <div class="brand">HTR&#8209;<span>United</span> &nbsp;·&nbsp; i18n Editor</div>
  <span id="stats-badge" class="badge badge-info">—</span>
  <span id="missing-badge" class="badge badge-missing" style="display:none">— missing</span>
  <div class="topbar-spacer"></div>
  <span class="save-status" id="save-status">All saved</span>
  <button class="btn btn-olive" onclick="saveAll()">Save all</button>
</header>

<!-- controls -->
<div class="controls">
  <input class="search-input" id="search" placeholder="Filter keys or values…" oninput="applyFilter()" autocomplete="off">
  <select class="filter-select" id="filter-mode" onchange="applyFilter()">
    <option value="all">All keys</option>
    <option value="missing">Missing only</option>
    <option value="section">By section</option>
  </select>
  <select class="filter-select" id="filter-lang" onchange="applyFilter()" style="display:none">
    <option value="">All languages</option>
  </select>
  <div class="controls-right">
    <button class="btn btn-ghost" onclick="openAddLang()">+ Add language</button>
    <button class="btn btn-ghost" onclick="openAddKey()">+ Add key</button>
    <button class="btn btn-ghost" id="btn-copy-en" onclick="copyFromEn()" style="display:none">Copy from English →</button>
  </div>
</div>

<!-- table -->
<div class="table-wrap">
  <table id="main-table">
    <thead><tr id="thead-row"></tr></thead>
    <tbody id="tbody"></tbody>
  </table>
  <div class="empty-state" id="empty-state" style="display:none">No keys match.</div>
</div>

<!-- Add language modal -->
<div class="modal-bg" id="modal-addlang">
  <div class="modal">
    <h2>Add language</h2>
    <label>Language code (BCP 47)</label>
    <input type="text" id="new-lang-code" placeholder="e.g. de, es, pt, zh" maxlength="10" autocomplete="off">
    <p class="modal-note">A new empty file <code>src/locales/&lt;code&gt;.json</code> will be created. You can then fill in translations inline.</p>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal('modal-addlang')">Cancel</button>
      <button class="btn btn-olive" onclick="confirmAddLang()">Create</button>
    </div>
  </div>
</div>

<!-- Add key modal -->
<div class="modal-bg" id="modal-addkey">
  <div class="modal">
    <h2>Add key</h2>
    <label>Dot-notation key</label>
    <input type="text" id="new-key-input" placeholder="e.g. catalog.newSection.label" autocomplete="off">
    <p class="modal-note">The key will be added to all languages with an empty value. Use English as the reference and fill in translations.</p>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal('modal-addkey')">Cancel</button>
      <button class="btn btn-olive" onclick="confirmAddKey()">Add key</button>
    </div>
  </div>
</div>

<script>
/* ── state ── */
let DATA = { langs: [], keys: [], flat: {} }
let DIRTY = {}   // lang → true if unsaved changes
let SAVE_TIMER = null
let FILTER_QUERY = ''
let FILTER_MODE  = 'all'
let FILTER_LANG  = ''

/* ── bootstrap ── */
async function init() {
  const res = await fetch('/api/data')
  DATA = await res.json()
  document.getElementById('loading').style.display = 'none'
  renderTable()
  updateStats()
}

/* ── render ── */
function renderTable() {
  // thead
  const thead = document.getElementById('thead-row')
  thead.innerHTML = '<th>Key</th>'
  for (const lang of DATA.langs) {
    const missing = DATA.keys.filter(k => !DATA.flat[lang]?.[k]).length
    thead.innerHTML += \`<th class="lang-header">
      <div class="lang-header-inner">
        <span class="lang-code">\${lang}</span>
        \${missing ? \`<span class="lang-missing-count">\${missing} missing</span>\` : \`<span class="lang-ok-count">✓ complete</span>\`}
        \${lang !== 'en' ? \`<button class="btn btn-danger" style="padding:2px 7px;font-size:11px;margin-left:auto" onclick="deleteLang('\${lang}')">✕</button>\` : ''}
      </div>
    </th>\`
  }

  // tbody
  const tbody = document.getElementById('tbody')
  tbody.innerHTML = ''

  let lastSection = null
  for (const key of DATA.keys) {
    const section = key.split('.')[0]
    if (section !== lastSection) {
      const sr = document.createElement('tr')
      sr.className = 'section-row'
      sr.dataset.section = section
      sr.innerHTML = \`<td colspan="\${DATA.langs.length + 1}">\${section}</td>\`
      tbody.appendChild(sr)
      lastSection = section
    }

    const isMissing = DATA.langs.some(l => !DATA.flat[l]?.[key])
    const tr = document.createElement('tr')
    tr.dataset.key = key
    tr.dataset.section = section
    if (isMissing) tr.classList.add('row-missing')

    // key cell
    tr.appendChild(Object.assign(document.createElement('td'), { textContent: key }))

    // lang cells
    for (const lang of DATA.langs) {
      const val = DATA.flat[lang]?.[key] ?? ''
      const td  = document.createElement('td')
      td.className = val ? '' : 'cell-empty'
      const ta = document.createElement('textarea')
      ta.className = 'cell-value'
      ta.rows = 1
      ta.value = val
      ta.dataset.placeholder = \`[\${lang}] missing…\`
      ta.setAttribute('data-lang', lang)
      ta.setAttribute('data-key', key)
      ta.addEventListener('input', () => onCellInput(ta, lang, key))
      ta.addEventListener('focus', () => autoExpand(ta))
      ta.addEventListener('blur',  () => autoShrink(ta))
      ta.addEventListener('keydown', e => { if (e.key === 'Escape') ta.blur() })
      td.appendChild(ta)
      tr.appendChild(td)
    }
    tbody.appendChild(tr)
  }

  // update filter-lang select
  const fl = document.getElementById('filter-lang')
  fl.innerHTML = '<option value="">All languages</option>'
  for (const lang of DATA.langs) fl.innerHTML += \`<option value="\${lang}">\${lang}</option>\`
  applyFilter()
}

function autoExpand(ta) {
  ta.style.height = 'auto'
  ta.style.height = ta.scrollHeight + 'px'
}
function autoShrink(ta) {
  ta.style.height = ''
}

/* ── editing ── */
function onCellInput(ta, lang, key) {
  if (!DATA.flat[lang]) DATA.flat[lang] = {}
  DATA.flat[lang][key] = ta.value
  ta.closest('td').className = ta.value ? '' : 'cell-empty'

  // update row missing state
  const tr = ta.closest('tr')
  const isMissing = DATA.langs.some(l => !DATA.flat[l]?.[key])
  tr.classList.toggle('row-missing', isMissing)

  if (!DIRTY[lang]) { DIRTY[lang] = true }
  setStatus('saving')
  clearTimeout(SAVE_TIMER)
  SAVE_TIMER = setTimeout(saveAll, 1500)
  updateStats()
}

/* ── filtering ── */
function applyFilter() {
  FILTER_QUERY = document.getElementById('search').value.toLowerCase().trim()
  FILTER_MODE  = document.getElementById('filter-mode').value
  FILTER_LANG  = document.getElementById('filter-lang').value

  document.getElementById('filter-lang').style.display = FILTER_MODE === 'missing' ? 'block' : 'none'
  document.getElementById('btn-copy-en').style.display =
    (FILTER_MODE === 'missing' && FILTER_LANG && FILTER_LANG !== 'en') ? 'inline-flex' : 'none'

  const rows = document.querySelectorAll('#tbody tr')
  let visible = 0

  for (const tr of rows) {
    if (tr.classList.contains('section-row')) continue
    const key = tr.dataset.key
    let show = true

    if (FILTER_MODE === 'missing') {
      const checkLangs = FILTER_LANG ? [FILTER_LANG] : DATA.langs
      show = checkLangs.some(l => !DATA.flat[l]?.[key])
    }

    if (show && FILTER_QUERY) {
      const haystack = [key, ...DATA.langs.map(l => DATA.flat[l]?.[key] ?? '')].join(' ').toLowerCase()
      show = FILTER_QUERY.split(/\\s+/).every(t => haystack.includes(t))
    }

    tr.classList.toggle('filtered-out', !show)
    if (show) visible++
  }

  // section rows: show only if they have visible children
  for (const sr of document.querySelectorAll('.section-row')) {
    const sec = sr.dataset.section
    const hasVisible = [...document.querySelectorAll(\`#tbody tr[data-section="\${sec}"]\`)].some(r => !r.classList.contains('filtered-out'))
    sr.classList.toggle('filtered-out', !hasVisible)
  }

  document.getElementById('empty-state').style.display = visible === 0 ? 'block' : 'none'
}

/* ── copy from English ── */
function copyFromEn() {
  if (!FILTER_LANG || FILTER_LANG === 'en') return
  let count = 0
  for (const key of DATA.keys) {
    const missing = !DATA.flat[FILTER_LANG]?.[key]
    if (!missing) continue
    const enVal = DATA.flat['en']?.[key] ?? ''
    if (!enVal) continue
    if (!DATA.flat[FILTER_LANG]) DATA.flat[FILTER_LANG] = {}
    DATA.flat[FILTER_LANG][key] = enVal
    DIRTY[FILTER_LANG] = true
    // update textarea
    const ta = document.querySelector(\`textarea[data-lang="\${FILTER_LANG}"][data-key="\${key}"]\`)
    if (ta) { ta.value = enVal; ta.closest('td').className = '' }
    count++
  }
  if (count > 0) {
    setStatus('saving')
    clearTimeout(SAVE_TIMER)
    SAVE_TIMER = setTimeout(saveAll, 800)
    updateStats()
  }
  alert(\`Copied \${count} English values to "\${FILTER_LANG}" as a starting point. Review and translate them!\`)
}

/* ── save ── */
async function saveAll() {
  const langs = Object.keys(DIRTY)
  if (langs.length === 0) { setStatus('saved'); return }
  setStatus('saving')
  let ok = true
  for (const lang of langs) {
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang, flat: DATA.flat[lang] || {} })
      })
      if (!res.ok) { console.error(lang, await res.json()); ok = false }
      else delete DIRTY[lang]
    } catch (e) { console.error(e); ok = false }
  }
  setStatus(ok ? 'saved' : 'error')
  updateStats()
}

function setStatus(state) {
  const el = document.getElementById('save-status')
  el.className = 'save-status ' + state
  if (state === 'saving') el.textContent = 'Saving…'
  else if (state === 'saved') el.textContent = 'Saved ✓  ' + new Date().toLocaleTimeString()
  else el.textContent = 'Save error — check console'
}

function updateStats() {
  const total = DATA.keys.length
  let totalMissing = 0
  for (const lang of DATA.langs) {
    totalMissing += DATA.keys.filter(k => !DATA.flat[lang]?.[k]).length
  }
  document.getElementById('stats-badge').textContent = \`\${total} keys · \${DATA.langs.length} languages\`
  const mb = document.getElementById('missing-badge')
  if (totalMissing > 0) {
    mb.style.display = ''
    mb.textContent = \`\${totalMissing} missing\`
  } else {
    mb.style.display = 'none'
  }
}

/* ── add language ── */
function openAddLang() {
  document.getElementById('new-lang-code').value = ''
  openModal('modal-addlang')
  setTimeout(() => document.getElementById('new-lang-code').focus(), 80)
}

async function confirmAddLang() {
  const code = document.getElementById('new-lang-code').value.trim().toLowerCase()
  if (!code) return
  const res = await fetch('/api/add-language', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lang: code })
  })
  const data = await res.json()
  if (!res.ok) { alert(data.error); return }
  closeModal('modal-addlang')
  // reload
  const fresh = await (await fetch('/api/data')).json()
  DATA = fresh
  DIRTY = {}
  renderTable()
  updateStats()
}

/* ── delete language ── */
async function deleteLang(lang) {
  if (!confirm(\`Delete language "\${lang}"? This will permanently delete src/locales/\${lang}.json.\`)) return
  const res = await fetch('/api/delete-language', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lang })
  })
  const data = await res.json()
  if (!res.ok) { alert(data.error); return }
  const fresh = await (await fetch('/api/data')).json()
  DATA = fresh; DIRTY = {}
  renderTable(); updateStats()
}

/* ── add key ── */
function openAddKey() {
  document.getElementById('new-key-input').value = ''
  openModal('modal-addkey')
  setTimeout(() => document.getElementById('new-key-input').focus(), 80)
}

function confirmAddKey() {
  const key = document.getElementById('new-key-input').value.trim()
  if (!key || !/^[a-zA-Z0-9._-]+$/.test(key)) { alert('Invalid key. Use dot notation: section.subsection.label'); return }
  if (DATA.keys.includes(key)) { alert('Key already exists.'); return }
  DATA.keys.push(key)
  DATA.keys.sort()
  for (const lang of DATA.langs) {
    if (!DATA.flat[lang]) DATA.flat[lang] = {}
    DATA.flat[lang][key] = ''
  }
  closeModal('modal-addkey')
  renderTable()
  updateStats()
  // scroll to the new key row
  setTimeout(() => {
    const el = document.querySelector(\`tr[data-key="\${CSS.escape(key)}"]\`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 100)
}

/* ── modal helpers ── */
function openModal(id) { document.getElementById(id).classList.add('open') }
function closeModal(id) { document.getElementById(id).classList.remove('open') }
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-bg.open').forEach(m => m.classList.remove('open'))
})

/* ── keyboard shortcut: Ctrl/Cmd+S → save ── */
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveAll() }
})

init()
</script>
</body>
</html>`
}

/* ── server ─────────────────────────────────────────────────── */

const server = http.createServer(async (req, res) => {
  try {
    await handleRequest(req, res)
  } catch (e) {
    console.error(e)
    send(res, 500, { error: e.message })
  }
})

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`
  console.log(`\n  HTR-United i18n Editor`)
  console.log(`  ─────────────────────────`)
  console.log(`  ${url}`)
  console.log(`\n  Editing: src/locales/*.json`)
  console.log(`  Press Ctrl+C to stop\n`)

  // Try to open browser
  const { exec } = require('child_process')
  const open = process.platform === 'darwin' ? 'open' :
               process.platform === 'win32'  ? 'start' : 'xdg-open'
  exec(`${open} ${url}`, () => {})
})
