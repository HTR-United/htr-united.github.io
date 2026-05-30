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
  // Fallback: check namespace
  const ns = doc.documentElement?.namespaceURI || ''
  if (ns.includes('alto')) return 'alto'
  if (ns.includes('PAGE') || ns.includes('page')) return 'page'
  return 'unknown'
}

/* ── text extraction ── */
function textFromAltoLine(lineEl) {
  // ALTO 4: <TextEquiv><Unicode>text</Unicode></TextEquiv>
  const unicode = lineEl.querySelector('TextEquiv > Unicode')
  if (unicode) return unicode.textContent || ''

  // ALTO 2/3: <String CONTENT="text"/> elements
  const strings = lineEl.querySelectorAll('String')
  if (strings.length) {
    return Array.from(strings)
      .map(s => s.getAttribute('CONTENT') || '')
      .join(' ')
  }
  return ''
}

function textFromPageLine(lineEl) {
  // PAGE: last <TextEquiv> child's <Unicode> (highest confidence)
  const equivs = lineEl.querySelectorAll(':scope > TextEquiv > Unicode')
  if (equivs.length) return equivs[equivs.length - 1].textContent || ''
  return ''
}

/* ── single-file analysis ── */
export function analyzeDoc(doc) {
  const format = detectFormat(doc)
  const result = { lines: 0, chars: 0, words: 0, regions: 0, charFreq: {} }

  if (format === 'alto') {
    result.regions = doc.querySelectorAll('TextBlock').length
    const lineEls = doc.querySelectorAll('TextLine')
    result.lines = lineEls.length
    lineEls.forEach(el => {
      const text = textFromAltoLine(el)
      result.chars += text.length
      result.words += text.trim() ? text.trim().split(/\s+/).length : 0
      for (const ch of text) addChar(result.charFreq, ch)
    })

  } else if (format === 'page') {
    result.regions = doc.querySelectorAll('TextRegion').length
    const lineEls = doc.querySelectorAll('TextLine')
    result.lines = lineEls.length
    lineEls.forEach(el => {
      const text = textFromPageLine(el)
      result.chars += text.length
      result.words += text.trim() ? text.trim().split(/\s+/).length : 0
      for (const ch of text) addChar(result.charFreq, ch)
    })

  } else {
    // Unknown format: just count TextLine elements generically
    const lineEls = doc.querySelectorAll('TextLine')
    result.lines = lineEls.length
  }

  return result
}

function addChar(freq, ch) {
  freq[ch] = (freq[ch] || 0) + 1
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
 * @param {(done: number, total: number) => void} onProgress
 * @returns {Promise<{files, lines, chars, words, regions, charFreq, errors}>}
 */
export async function analyzeFiles(fileList, onProgress) {
  const xmlFiles = Array.from(fileList).filter(f =>
    f.name.toLowerCase().endsWith('.xml')
  )

  const totals = { files: xmlFiles.length, lines: 0, chars: 0, words: 0, regions: 0, charFreq: {} }
  const errors = []
  let done = 0

  for (const file of xmlFiles) {
    try {
      const text = await readFile(file)
      const doc  = parser.parseFromString(text, 'application/xml')
      // DOMParser sets a parseerror element on failure
      if (doc.querySelector('parseerror')) throw new Error('XML parse error')
      mergeResults(totals, analyzeDoc(doc))
    } catch (e) {
      errors.push({ name: file.name, error: e.message })
    }
    done++
    onProgress?.(done, xmlFiles.length)
  }

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
  const entries = Object.entries(charFreq)
    .filter(([ch]) => ch !== ' ' || true) // keep all
    .sort((a, b) => b[1] - a[1])
  return limit ? entries.slice(0, limit) : entries
}
