import { contentToHtml } from './richTextUtils'

export function RichText({ content, className }: { content: string; className?: string }) {
  const html = contentToHtml(content)
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
