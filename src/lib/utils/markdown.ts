import remarkHtml from 'remark-html'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import type { VFileCompatible } from 'vfile'

export const markdownToHtml = async (markdown: VFileCompatible) => {
  const result = await unified().use(remarkParse).use(remarkHtml).process(markdown)
  return String(result)
}
