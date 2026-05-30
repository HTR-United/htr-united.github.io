import JSZip from 'jszip'
import { generateReadme, generateCff, generateHtrUnitedYml } from './readmeGenerator.js'

function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function autoSlug(name) {
  return slugify(name).slice(0, 60)
}

export function unitDataPath(unit, orgLevels = 1) {
  const slug  = unit.slug || autoSlug(unit.name) || 'unit'
  const parts = orgLevels === 2 && unit.prefix?.trim()
    ? [unit.prefix.trim(), slug]
    : [slug]
  return 'data/' + parts.join('/') + '/'
}

export async function generateZip(state) {
  const zip = new JSZip()
  const projectSlug = slugify(state.title || 'dataset') || 'dataset'

  // Generated text files (README can be overridden by the edited textarea)
  zip.file('README.md',       state._readmeOverride ?? generateReadme(state))
  zip.file('CITATION.CFF',    generateCff(state))
  zip.file('htr-united.yml',  generateHtrUnitedYml(state))

  // Data files per unit
  for (const unit of state.units) {
    const basePath = unitDataPath(unit, state.orgLevels)
    for (const file of (unit.files || [])) {
      try {
        const buffer = await file.arrayBuffer()
        zip.file(basePath + file.name, buffer)
      } catch (e) {
        console.warn('Could not read file', file.name, e)
      }
    }
  }

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
  return { blob, filename: projectSlug + '.zip' }
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
