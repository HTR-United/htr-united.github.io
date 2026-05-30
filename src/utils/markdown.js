/**
 * Minimal markdown renderer for the norms/guidelines field.
 * Handles: paragraphs, `- ` lists, `▶ ` bullets, URL autolinks.
 * Does NOT use any external library — keeps the bundle lean.
 */

const URL_RE = /https?:\/\/[^\s<>)"]+[^\s<>)".,;:!?]/g

function escHtml(s) {
  return s.replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]))
}

function inline(text) {
  return escHtml(text)
    // Bold+italic: ***text*** or ___text___
    .replace(/\*{3}(.+?)\*{3}/g, '<strong><em>$1</em></strong>')
    .replace(/_{3}(.+?)_{3}/g,   '<strong><em>$1</em></strong>')
    // Bold: **text** or __text__
    .replace(/\*{2}(.+?)\*{2}/g, '<strong>$1</strong>')
    .replace(/_{2}(.+?)_{2}/g,   '<strong>$1</strong>')
    // Italic: *text* or _text_  (not adjacent to spaces on the inner side)
    .replace(/\*([^*\s][^*]*?|[^*]*?[^*\s])\*/g, '<em>$1</em>')
    .replace(/(?<![a-zA-Z])_([^_\s][^_]*?|[^_]*?[^_\s])_(?![a-zA-Z])/g, '<em>$1</em>')
    // Inline code: `code`
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // URLs
    .replace(URL_RE, url =>
      `<a href="${escHtml(url)}" target="_blank" rel="noopener">${escHtml(url)}</a>`
    )
}

// kept for list items (same as inline, just an alias)
function linkify(text) { return inline(text) }

export function renderMarkdown(raw) {
  if (!raw) return ''

  // Normalise line endings
  const text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()

  // Split into blocks on blank lines
  const blocks = text.split(/\n{2,}/)
  const parts = []

  for (const block of blocks) {
    const lines = block.split('\n')

    // Detect list block: all lines start with `- ` or `▶ `
    const isList = lines.every(l => /^[-▶•]\s/.test(l.trim()) || l.trim() === '')
    if (isList) {
      const items = lines
        .filter(l => l.trim())
        .map(l => `<li>${linkify(l.replace(/^[-▶•]\s+/, '').trim())}</li>`)
        .join('')
      parts.push(`<ul>${items}</ul>`)
      continue
    }

    // Mixed block: render line by line, converting leading `- ` inline
    const rendered = lines.map(line => {
      const t = line.trim()
      if (!t) return ''
      if (/^[-▶•]\s/.test(t)) return `<li>${linkify(t.replace(/^[-▶•]\s+/, ''))}</li>`
      return linkify(t)
    })

    // Group consecutive <li> into <ul>
    let out = ''
    let inList = false
    for (const r of rendered) {
      if (!r) continue
      if (r.startsWith('<li>')) {
        if (!inList) { out += '<ul>'; inList = true }
        out += r
      } else {
        if (inList) { out += '</ul>'; inList = false }
        out += r + '<br>'
      }
    }
    if (inList) out += '</ul>'
    // Remove trailing <br>
    out = out.replace(/<br>$/, '')
    if (out) parts.push(`<p>${out}</p>`)
  }

  return parts.join('')
}

/**
 * Same as renderMarkdown but also highlights search tokens.
 */
export function renderMarkdownHl(raw, search) {
  let html = renderMarkdown(raw)
  if (!search) return html
  search.toLowerCase().split(/\s+/).filter(w => w.length > 1).forEach(tok => {
    const re = new RegExp(`(${tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    // Only highlight inside text nodes (not inside href attributes etc.)
    html = html.replace(/>([^<]*)</g, (m, inner) =>
      '>' + inner.replace(re, '<mark>$1</mark>') + '<'
    )
  })
  return html
}
