import JSZip from 'jszip'
import { generateReadme, generateCff, generateHtrUnitedYml } from './readmeGenerator.js'
import { safeRelPath } from './dropFiles.js'

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

/** Number of leading directory segments shared by every path (never the filename). */
function commonRootDepth(paths) {
  if (paths.length < 1) return 0
  const dirs = paths.map(p => p.split('/').slice(0, -1))
  let depth = 0
  while (dirs.every(d => d.length > depth && d[depth] === dirs[0][depth])) depth++
  return depth
}

export async function generateZip(state, badgeBlobs = []) {
  const zip = new JSZip()
  const projectSlug = slugify(state.title || 'dataset') || 'dataset'

  // Generated text files (README can be overridden by the edited textarea)
  zip.file('README.md',       state._readmeOverride ?? generateReadme(state))
  zip.file('CITATION.CFF',    generateCff(state))
  zip.file('htr-united.yml',  generateHtrUnitedYml(state))

  // Badge PNGs
  for (const { filename, blob } of badgeBlobs) {
    zip.file(filename, blob)
  }

  // Data files per unit
  for (const unit of state.units) {
    const basePath = unitDataPath(unit, state.orgLevels)
    const files    = unit.files || []
    // Keep the folder hierarchy (flattening to file.name would let same-named
    // files in different subfolders overwrite each other), but drop the
    // directory the user happened to drop, so paths start at the unit root.
    const strip = commonRootDepth(files.map(safeRelPath))
    for (const file of files) {
      try {
        const buffer = await file.arrayBuffer()
        const relative = safeRelPath(file).split('/').slice(strip).join('/')
        zip.file(basePath + relative, buffer)
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
