import { existsSync, readdirSync, readFileSync,writeFileSync } from 'node:fs'
import { dirname,join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const nmDir = join(root, 'node_modules')

function* walk(dir) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const full = join(dir, entry.name)
      if (entry.name.startsWith('.') && entry.name !== '.pnpm') continue
      if (entry.isDirectory()) yield* walk(full)
      else if (entry.name === 'rich-editor.css' || (entry.name.endsWith('.css') && full.includes('rich-kit-shiro')))
        yield full
    }
  } catch {}
}

let patched = 0
if (existsSync(nmDir)) {
  for (const file of walk(nmDir)) {
    let content = readFileSync(file, 'utf8')
    const original = content
    content = content.replaceAll(/::highlight\([^)]*\)/g, '.__noop_highlight')
    if (content !== original) {
      writeFileSync(file, content, 'utf8')
      patched++
    }
  }
}
if (patched > 0) {
  console.log(`[postinstall] Patched ${patched} CSS file(s) for ::highlight compatibility`)
}
