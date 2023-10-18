import mjml2html from 'mjml'
import { readFileSync } from 'fs'

export function mjmlPluginVite() {
  return {
    name: 'vite-plugin-mjml',
    transform(code, id) {
      if (id.endsWith('.mjml')) {
        const mjmlContent = readFileSync(id, 'utf-8')
        const { html } = mjml2html(mjmlContent)
        return `export default ${JSON.stringify(html)};`
      }
    },
  }
}
