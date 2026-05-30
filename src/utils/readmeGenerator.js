/**
 * Generate an HTRogene-style README.md from the Zenodo wizard state.
 */

const LICENSE_URLS = {
  'CC-BY 4.0':     'https://creativecommons.org/licenses/by/4.0/',
  'CC-BY-SA 4.0':  'https://creativecommons.org/licenses/by-sa/4.0/',
  'Etalab OL 2.0': 'https://spdx.org/licenses/etalab-2.0.html',
  'ODbL 1.0':      'https://opendatacommons.org/licenses/odbl/1-0/',
}

const LICENSE_BADGE_LABELS = {
  'CC-BY 4.0':     'License%3A%20CC%20BY%204.0',
  'CC-BY-SA 4.0':  'License%3A%20CC%20BY--SA%204.0',
  'Etalab OL 2.0': 'License%3A%20Etalab%202.0',
  'ODbL 1.0':      'License%3A%20ODbL%201.0',
}

function licenseUrl(lic) { return LICENSE_URLS[lic] || '#' }
function licenseBadge(lic) {
  const label = LICENSE_BADGE_LABELS[lic] || encodeURIComponent(lic)
  const url   = licenseUrl(lic)
  return `[![License: ${lic}](https://img.shields.io/badge/${label}-lightgrey.svg)](${url})`
}

function authorList(authors) {
  return authors
    .filter(a => a.name || a.surname)
    .map(a => [a.name, a.surname].filter(Boolean).join(' '))
    .join(', ')
}

function unitPath(unit, orgLevels = 1) {
  const slug  = unit.slug || unit.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'unit'
  const parts = orgLevels === 2 && unit.prefix ? [unit.prefix, slug] : [slug]
  return 'data/' + parts.join('/') + '/'
}

function fmt(n) {
  if (!n) return '—'
  return Number(n).toLocaleString('en-GB')
}

function checkmark(b) { return b ? '✓' : '✗' }

function dateRange(unit) {
  const s = unit.dateStart, e = unit.dateEnd
  if (s && e && s !== e) return `${s}–${e}`
  if (s) return String(s)
  if (e) return String(e)
  return '—'
}

function tableRow(unit) {
  const link = unit.link ? `[**↗**](${unit.link})` : ''
  return `| ${unit.name || '—'} | ${link} | ${dateRange(unit)} | ${checkmark(unit.colorPages)} | ${fmt(unit.stats?.regions)} | ${fmt(unit.stats?.lines)} | ${fmt(unit.stats?.chars)} |`
}

function sumStat(units, key) {
  return units.reduce((s, u) => s + (Number(u.stats?.[key]) || 0), 0)
}

function mergeTypeFreq(units, key) {
  const merged = {}
  for (const u of units) {
    for (const [t, n] of Object.entries(u.stats?.[key] || {})) {
      merged[t] = (merged[t] || 0) + n
    }
  }
  return merged
}

function typeList(freq) {
  return Object.entries(freq).sort(([a], [b]) => a.localeCompare(b)).map(([t, n]) => `- \`${t}\` (${n})`).join('\n')
}

export function generateReadme(state) {
  const { title, description, license, doi, funding, authors, units, orgLevels = 1 } = state
  const year = new Date().getFullYear()

  const totalFiles   = sumStat(units, 'files')
  const totalLines   = sumStat(units, 'lines')
  const totalChars   = sumStat(units, 'chars')
  const totalRegions = sumStat(units, 'regions')

  const authorStr = authorList(authors)
  const doiStr    = doi ? `https://doi.org/${doi.replace(/^https?:\/\/doi\.org\//, '')}` : null

  const lines = []

  lines.push(`# ${title || 'Dataset Title'}`)
  lines.push('')
  lines.push(licenseBadge(license || 'CC-BY 4.0'))
  lines.push('')
  lines.push('## Introduction')
  lines.push('')
  lines.push(description || '_Add a description of your dataset here._')
  lines.push('')

  if (units.length) {
    lines.push('| Shelfmark | Links | Dates | Color Pages | Main Zones | Lines | Characters |')
    lines.push('|-----------|-------|-------|-------------|------------|-------|------------|')
    units.forEach(u => lines.push(tableRow(u)))
    lines.push('')
  }

  lines.push('## Dataset Overview')
  lines.push('')
  if (units.length) {
    lines.push(`The dataset comprises **${units.length}** document${units.length > 1 ? 's' : ''}` +
      (totalFiles   ? `, with a total of **${fmt(totalFiles)} files**` : '') +
      (totalLines   ? `, **${fmt(totalLines)} lines**` : '') +
      (totalChars   ? ` and **${fmt(totalChars)} characters**` : '') +
      '.')
    lines.push('')
    lines.push('### File structure')
    lines.push('')
    lines.push('```')
    units.forEach(u => lines.push(unitPath(u, state.orgLevels)))
    lines.push('```')
    lines.push('')
  } else {
    lines.push('_Add an overview of your dataset here._')
    lines.push('')
  }

  const regionTypes = mergeTypeFreq(units, 'regionTypes')
  const lineTypes   = mergeTypeFreq(units, 'lineTypes')
  const hasTypes = Object.keys(regionTypes).length || Object.keys(lineTypes).length
  if (hasTypes) {
    lines.push('### Segmentation')
    lines.push('')
    if (Object.keys(regionTypes).length) {
      lines.push('**Region types:**')
      lines.push('')
      lines.push(typeList(regionTypes))
      lines.push('')
    }
    if (Object.keys(lineTypes).length) {
      lines.push('**Line types:**')
      lines.push('')
      lines.push(typeList(lineTypes))
      lines.push('')
    }
  }

  lines.push('## License')
  lines.push('')
  const licUrl = licenseUrl(license)
  lines.push(`This dataset is licensed under the **${license || 'CC-BY 4.0'}** license.`)
  if (licUrl !== '#') lines.push(`See [${licUrl}](${licUrl}) for details.`)
  lines.push('')

  lines.push('## Citation')
  lines.push('')
  if (authorStr) {
    lines.push(
      `${authorStr}. (${year}). *${title || 'Dataset'}*. Zenodo.` +
      (doiStr ? ` [${doiStr}](${doiStr})` : ' _(DOI pending)_')
    )
  } else {
    lines.push('_Add citation information here._')
  }
  lines.push('')

  if (funding) {
    lines.push('## Acknowledgements')
    lines.push('')
    lines.push(funding)
    lines.push('')
  }

  return lines.join('\n')
}

export function generateCff(state) {
  const { title, doi, authors, license } = state
  const year  = new Date().getFullYear()
  const today = new Date().toISOString().split('T')[0]
  const doiClean = doi ? doi.replace(/^https?:\/\/doi\.org\//, '') : null

  const authorLines = (authors || [])
    .filter(a => a.name || a.surname)
    .map(a => {
      const lines = ['  - ']
      if (a.surname) lines.push(`    family-names: "${a.surname}"`)
      if (a.name)    lines.push(`    given-names: "${a.name}"`)
      if (a.orcid)   lines.push(`    orcid: "https://orcid.org/${a.orcid.replace(/^https?:\/\/orcid\.org\//, '')}"`)
      return lines.join('\n')
    }).join('\n')

  return [
    'cff-version: 1.2.0',
    'message: "If you use this dataset, please cite it as below."',
    `title: "${title || 'Dataset'}"`,
    'type: dataset',
    `version: 1.0.0`,
    ...(doiClean ? [`doi: ${doiClean}`] : []),
    `date-released: ${today}`,
    `license: ${(license || 'CC-BY-4.0').replace(/ /g, '-')}`,
    'authors:',
    authorLines || '  - name: "Author Name"',
  ].join('\n') + '\n'
}

export function generateHtrUnitedYml(state) {
  const { title, description, license, authors, doi } = state
  const licUrl = licenseUrl(license || 'CC-BY 4.0')
  const authorLines = (authors || [])
    .filter(a => a.name || a.surname)
    .map(a => {
      let s = `  - name: "${a.name || ''}"\n    surname: "${a.surname || ''}"`
      if (a.orcid) s += `\n    orcid: "${a.orcid}"`
      return s
    }).join('\n')

  return [
    'schema-location: https://htr-united.github.io/schema/2023-06-27/schema.json',
    `title: "${title || ''}"`,
    `url: "${doi || ''}"`,
    'authors:',
    authorLines || '  - name: ""\n    surname: ""',
    'institutions: []',
    `description: "${(description || '').replace(/"/g, '\\"')}"`,
    `license:`,
    `  - name: "${license || 'CC-BY 4.0'}"`,
    `    url: "${licUrl}"`,
  ].join('\n') + '\n'
}
