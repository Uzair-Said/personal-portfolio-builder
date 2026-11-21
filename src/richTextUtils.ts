import DOMPurify from 'dompurify'

const allowedTags = ['p', 'br', 'h2', 'h3', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'u', 's', 'a', 'blockquote']
const allowedAttributes = ['href']

export function hasRichTextMarkup(value: string): boolean {
  return /<\/?(?:p|br|h[1-6]|ul|ol|li|strong|b|em|i|u|s|a|blockquote)\b/i.test(value)
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] || character)
}

export function contentToHtml(value: string): string {
  if (hasRichTextMarkup(value)) {
    return DOMPurify.sanitize(value, { ALLOWED_TAGS: allowedTags, ALLOWED_ATTR: allowedAttributes })
  }

  return value
    .split(/\r?\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\r?\n/g, '<br>')}</p>`)
    .join('')
}
