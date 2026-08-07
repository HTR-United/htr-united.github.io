/**
 * Shared drag-and-drop helpers for the local file analysers.
 *
 * Dropping a folder only works if the drop target cancelled the browser's
 * default action; otherwise the browser tries to navigate to file:/// and the
 * page reports a security error instead of ingesting anything.
 */

/** Relative path of a file, whichever way it was collected. */
export function relPathOf(file) {
  return file.relPath || file.webkitRelativePath || file.name
}

/** Strip anything that could escape the target directory inside a ZIP. */
export function safeRelPath(file) {
  return relPathOf(file)
    .replace(/\\/g, '/')
    .replace(/^[a-z]:/i, '')
    .split('/')
    .filter(part => part && part !== '.' && part !== '..')
    .join('/') || file.name
}

function stamp(file, fullPath) {
  if (fullPath) {
    Object.defineProperty(file, 'relPath', {
      value: fullPath.replace(/^\/+/, ''),
      enumerable: false,
      configurable: true,
    })
  }
  return file
}

/** Read every entry of a directory (readEntries caps each batch at 100). */
function readAllEntries(reader) {
  return new Promise((resolve, reject) => {
    const all = []
    const next = () => reader.readEntries(batch => {
      if (!batch.length) return resolve(all)
      all.push(...batch)
      next()
    }, reject)
    next()
  })
}

async function collect(entry, out) {
  if (!entry) return
  if (entry.isFile) {
    const file = await new Promise(resolve => entry.file(resolve, () => resolve(null)))
    if (file) out.push(stamp(file, entry.fullPath))
    return
  }
  if (entry.isDirectory) {
    const entries = await readAllEntries(entry.createReader()).catch(() => [])
    for (const child of entries) await collect(child, out)
  }
}

/**
 * Collect every file from a drop event, walking dropped directories.
 * Returns a plain File[] (empty when the drop carried no files).
 */
export async function filesFromDropEvent(event) {
  const dt = event.dataTransfer
  if (!dt) return []

  // webkitGetAsEntry() must be called synchronously: the item list is
  // neutered once the event handler returns.
  const items = Array.from(dt.items || [])
  const entries = items.map(item =>
    typeof item.webkitGetAsEntry === 'function' ? item.webkitGetAsEntry() : null
  )

  if (entries.some(Boolean)) {
    const out = []
    for (const entry of entries) await collect(entry, out)
    if (out.length) return out
  }

  return Array.from(dt.files || [])
}

function carriesFiles(event) {
  const types = event.dataTransfer?.types
  return !!types && Array.from(types).includes('Files')
}

/**
 * Swallow file drops that land outside a dropzone, so the browser never
 * navigates away to file:///. Returns a teardown function.
 */
export function installGlobalDropGuard(target = window) {
  const onDragOver = (e) => { if (carriesFiles(e)) e.preventDefault() }
  const onDrop     = (e) => { if (carriesFiles(e)) e.preventDefault() }
  target.addEventListener('dragover', onDragOver)
  target.addEventListener('drop', onDrop)
  return () => {
    target.removeEventListener('dragover', onDragOver)
    target.removeEventListener('drop', onDrop)
  }
}
