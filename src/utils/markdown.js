import { marked } from 'marked'

/**
 * Render GitHub-Flavored Markdown to HTML (for README preview).
 * Uses `marked` with GFM enabled (default).
 */
export function renderGfm(raw) {
  if (!raw) return ''
  return marked.parse(raw, { gfm: true, breaks: false })
}

/**
 * Minimal markdown renderer for the norms/guidelines field.
 * Handles: paragraphs, `- ` / `▶ ` lists, bold, italic, inline code, URL autolinks.
 */

const URL_RE = /https?:\/\/[^\s<>)"]+[^\s<>)".,;:!?]/g
const LIST_RE = /^[-▶•]\s/

function escHtml(s) {
  return s.replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]))
}

/** Apply inline formatting to an already-escaped string. */
function inline(text) {
  return escHtml(text)
    // Bold+italic first (order matters — must come before bold/italic alone)
    .replace(/\*{3}(.+?)\*{3}/g, '<strong><em>$1</em></strong>')
    .replace(/_{3}(.+?)_{3}/g,   '<strong><em>$1</em></strong>')
    // Bold
    .replace(/\*{2}(.+?)\*{2}/g, '<strong>$1</strong>')
    .replace(/_{2}(.+?)_{2}/g,   '<strong>$1</strong>')
    // Italic (don't fire inside words for underscore variant)
    .replace(/\*([^*\s][^*]*?|[^*]*?[^*\s])\*/g, '<em>$1</em>')
    .replace(/(?<![a-zA-Z])_([^_\s][^_]*?|[^_]*?[^_\s])_(?![a-zA-Z])/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // URL autolinks
    .replace(URL_RE, url =>
      `<a href="${escHtml(url)}" target="_blank" rel="noopener">${escHtml(url)}</a>`
    )
}

/**
 * Render one "block" (text between blank lines) into valid HTML segments.
 * Returns an array of HTML strings (each a self-contained <p>, <ul>, etc.).
 */
function renderBlock(block) {
  const lines = block.split('\n').map(l => l.trim()).filter(l => l !== '')
  if (!lines.length) return []

  // Pure list block — every line is a list marker
  if (lines.every(l => LIST_RE.test(l))) {
    const items = lines.map(l => `<li>${inline(l.replace(/^[-▶•]\s+/, ''))}</li>`).join('')
    return [`<ul>${items}</ul>`]
  }

  // Mixed block — alternate between paragraph runs and list runs
  const segments = []
  let prose = []
  let list  = []

  const flushProse = () => {
    if (!prose.length) return
    segments.push(`<p>${prose.join('<br>')}</p>`)
    prose = []
  }
  const flushList = () => {
    if (!list.length) return
    segments.push(`<ul>${list.map(l => `<li>${l}</li>`).join('')}</ul>`)
    list = []
  }

  for (const line of lines) {
    if (LIST_RE.test(line)) {
      flushProse()
      list.push(inline(line.replace(/^[-▶•]\s+/, '')))
    } else {
      flushList()
      prose.push(inline(line))
    }
  }
  flushProse()
  flushList()

  return segments
}

export function renderMarkdown(raw) {
  if (!raw) return ''

  const text = raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Inline list items: split on ". - " or "** - " (bold-close then list item).
    // Handles "**Header:** - item1. - item2." common in HTR-United norms.
    .replace(/([.!?:»)\*]{1,3})\s{1,8}(?=-\s)/g, '$1\n')
    .trim()

  return text
    .split(/\n{2,}/)
    .flatMap(renderBlock)
    .join('')
}

/**
 * Same as renderMarkdown but highlights search tokens inside text nodes.
 */
export function renderMarkdownHl(raw, search) {
  let html = renderMarkdown(raw)
  if (!search) return html
  search.toLowerCase().split(/\s+/).filter(w => w.length > 1).forEach(tok => {
    const re = new RegExp(`(${tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    html = html.replace(/>([^<]*)</g, (m, inner) =>
      '>' + inner.replace(re, '<mark>$1</mark>') + '<'
    )
  })
  return html
}
