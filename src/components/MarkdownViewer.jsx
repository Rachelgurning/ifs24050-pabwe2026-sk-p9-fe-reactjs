import { useMemo } from 'react'

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function inline(text) {
  return esc(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*([^*\n]+)\*/g, '$1<em>$2</em>')
}

const BLOCK = /^(#{1,6}\s|```|>|\s*[-*+]\s+|\s*\d+[.)]\s+)/

export function renderMarkdown(md = '') {
  const lines = String(md).replace(/\r\n?/g, '\n').split('\n')
  const out = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (/^```/.test(line)) {
      const buf = []
      i++
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++])
      i++
      out.push(`<pre tabindex="0"><code>${esc(buf.join('\n'))}</code></pre>`)
      continue
    }
    const h = line.match(/^(#{1,6})\s+(.*)$/)
    if (h) {
      const lvl = Math.min(Math.max(h[1].length, 2), 6)
      out.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`)
      i++
      continue
    }
    if (/^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(line)) {
      out.push('<hr>')
      i++
      continue
    }
    if (/^>/.test(line)) {
      const buf = []
      while (i < lines.length && /^>/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''))
      out.push(`<blockquote><p>${inline(buf.join(' '))}</p></blockquote>`)
      continue
    }
    if (/^\s*[-*+]\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) items.push(`<li>${inline(lines[i++].replace(/^\s*[-*+]\s+/, ''))}</li>`)
      out.push(`<ul>${items.join('')}</ul>`)
      continue
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) items.push(`<li>${inline(lines[i++].replace(/^\s*\d+[.)]\s+/, ''))}</li>`)
      out.push(`<ol>${items.join('')}</ol>`)
      continue
    }
    if (!line.trim()) {
      i++
      continue
    }
    const buf = [line]
    i++
    while (i < lines.length && lines[i].trim() && !BLOCK.test(lines[i])) buf.push(lines[i++])
    out.push(`<p>${inline(buf.join(' '))}</p>`)
  }
  return out.join('\n')
}

export default function MarkdownViewer({ content = '', className = '' }) {
  const html = useMemo(() => renderMarkdown(content), [content])
  return <div className={`md-content ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
}
