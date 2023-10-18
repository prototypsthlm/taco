import { readFileSync } from 'fs'

export function txtPluginVite() {
  return {
    name: 'vite-plugin-txt',
    transform(code, id) {
      if (id.endsWith('.txt')) {
        const txtContent = readFileSync(id, 'utf-8')
        return `export default ${JSON.stringify(txtContent)};`
      }
    },
  }
}
