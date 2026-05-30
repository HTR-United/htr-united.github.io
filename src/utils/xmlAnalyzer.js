/**
 * Client-side XML analyzer for ALTO and PAGE XML files.
 * No upload — all processing happens in the browser via FileReader + DOMParser.
 */

const parser = new DOMParser()

/* ── format detection ── */
export function detectFormat(doc) {
  const root = doc.documentElement?.localName?.toLowerCase()
  if (root === 'alto') return 'alto'
  if (root === 'pcgts') return 'page'
  const ns = doc.documentElement?.namespaceURI || ''
  if (ns.includes('alto')) return 'alto'
  if (ns.includes('PAGE') || ns.includes('page')) return 'page'
  return 'unknown'
}

/* ── text extraction ── */
function textFromAltoLine(lineEl) {
  const unicode = lineEl.querySelector('TextEquiv > Unicode')
  if (unicode) return unicode.textContent || ''
  const strings = lineEl.querySelectorAll('String')
  if (strings.length) {
    return Array.from(strings).map(s => s.getAttribute('CONTENT') || '').join(' ')
  }
  return ''
}

function textFromPageLine(lineEl) {
  const equivs = lineEl.querySelectorAll(':scope > TextEquiv > Unicode')
  if (equivs.length) return equivs[equivs.length - 1].textContent || ''
  return ''
}

/* ── normalization ── */
/**
 * Apply Unicode normalization to a text string.
 * @param {string} text
 * @param {'None'|'NFC'|'NFD'|'NFKC'|'NFKD'} mode
 */
function applyNorm(text, mode) {
  if (!mode || mode === 'None') return text
  return text.normalize(mode)
}

/* ── single-file analysis ── */
/**
 * @param {Document} doc
 * @param {'None'|'NFC'|'NFD'|'NFKC'|'NFKD'} normMode
 */
export function analyzeDoc(doc, normMode = 'NFC') {
  const format = detectFormat(doc)
  const result = { lines: 0, chars: 0, words: 0, regions: 0, charFreq: {} }

  function countText(raw) {
    const text = applyNorm(raw, normMode)
    result.chars += text.length
    result.words += text.trim() ? text.trim().split(/\s+/).length : 0
    for (const ch of text) {
      result.charFreq[ch] = (result.charFreq[ch] || 0) + 1
    }
  }

  if (format === 'alto') {
    result.regions = doc.querySelectorAll('TextBlock').length
    const lineEls = doc.querySelectorAll('TextLine')
    result.lines = lineEls.length
    lineEls.forEach(el => countText(textFromAltoLine(el)))

  } else if (format === 'page') {
    result.regions = doc.querySelectorAll('TextRegion').length
    const lineEls = doc.querySelectorAll('TextLine')
    result.lines = lineEls.length
    lineEls.forEach(el => countText(textFromPageLine(el)))

  } else {
    result.lines = doc.querySelectorAll('TextLine').length
  }

  return result
}

/* ── read a File as text ── */
function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = () => reject(new Error(`Cannot read ${file.name}`))
    reader.readAsText(file, 'utf-8')
  })
}

/* ── aggregate across files ── */
function mergeResults(acc, doc) {
  acc.lines   += doc.lines
  acc.chars   += doc.chars
  acc.words   += doc.words
  acc.regions += doc.regions
  for (const [ch, n] of Object.entries(doc.charFreq)) {
    acc.charFreq[ch] = (acc.charFreq[ch] || 0) + n
  }
}

/**
 * Analyze a FileList (from <input webkitdirectory>) or File[].
 * @param {FileList|File[]} fileList
 * @param {(done: number, total: number) => void} [onProgress]
 * @param {(filename: string) => boolean} [matcher] - filename filter, defaults to *.xml
 * @param {'None'|'NFC'|'NFD'|'NFKC'|'NFKD'} [normMode]
 * @returns {Promise<{files, lines, chars, words, regions, charFreq, members, errors}>}
 */
export async function analyzeFiles(fileList, onProgress, matcher, normMode = 'NFC') {
  const defaultMatcher = f => f.toLowerCase().endsWith('.xml')
  const keep = matcher ?? defaultMatcher
  const xmlFiles = Array.from(fileList).filter(f => keep(f.name))

  const totals = { files: xmlFiles.length, lines: 0, chars: 0, words: 0, regions: 0, charFreq: {} }
  const errors = []
  let done = 0

  for (const file of xmlFiles) {
    try {
      const text = await readFile(file)
      const doc  = parser.parseFromString(text, 'application/xml')
      if (doc.querySelector('parseerror')) throw new Error('XML parse error')
      mergeResults(totals, analyzeDoc(doc, normMode))
    } catch (e) {
      errors.push({ name: file.name, error: e.message })
    }
    done++
    onProgress?.(done, xmlFiles.length)
  }

  // Build sorted unique character list (by code point — canonical order)
  totals.members = Object.keys(totals.charFreq).sort((a, b) => a.codePointAt(0) - b.codePointAt(0))

  return { ...totals, errors }
}

/* ── character display helpers ── */
const SPECIAL_LABELS = {
  ' ':  '[SP]',
  '\t': '[TAB]',
  '\n': '[LF]',
  '\r': '[CR]',
}

export function charLabel(ch) {
  return SPECIAL_LABELS[ch] ?? ch
}

export function sortedCharFreq(charFreq, limit = null) {
  const entries = Object.entries(charFreq).sort((a, b) => b[1] - a[1])
  return limit ? entries.slice(0, limit) : entries
}

/* ── normalization metadata ── */
export const NORM_MODES = ['None', 'NFC', 'NFD', 'NFKC', 'NFKD']
