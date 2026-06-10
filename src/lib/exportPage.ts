// Utility to export a page DOM element to PDF or Word

/** Resolve CSS custom properties to concrete values for export */
function resolveVars(el: HTMLElement) {
  const rootStyle = getComputedStyle(document.documentElement)
  el.querySelectorAll<HTMLElement>('*').forEach(node => {
    const inline = node.getAttribute('style')
    if (inline && inline.includes('var(')) {
      node.setAttribute('style', inline.replace(/var\(--[\w-]+\)/g, match => {
        const prop = match.slice(4, -1)
        return rootStyle.getPropertyValue(prop).trim() || match
      }))
    }
  })
}

// ─── PDF export (text-based, direct download) ──────────────────────────────────

let jsPdfPromise: Promise<void> | null = null

function loadJsPDF(): Promise<void> {
  if (jsPdfPromise) return jsPdfPromise
  jsPdfPromise = new Promise((resolve, reject) => {
    if ((window as any).jspdf?.jsPDF) { resolve(); return }
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load jsPDF'))
    document.head.appendChild(s)
  })
  return jsPdfPromise
}

/** Strip emoji/symbols (jsPDF core fonts can't render them) and normalise punctuation. */
function cleanText(s: string): string {
  return s
    .replace(/[\u{1F000}-\u{1FAFF}]/gu, '')   // emoji
    .replace(/[\u{2600}-\u{27BF}]/gu, '')     // misc symbols/dingbats
    .replace(/[\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/gu, '') // arrows
    .replace(/️/g, '')                   // variation selector
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

type Block = { type: 'h1' | 'h2' | 'h3' | 'p' | 'bullet'; text: string }

/** Walk the rendered DOM and extract an ordered list of text blocks. */
function extractBlocks(root: HTMLElement): Block[] {
  const blocks: Block[] = []
  const SKIP_TAGS = new Set(['A', 'BUTTON', 'SCRIPT', 'STYLE', 'INPUT', 'SELECT', 'NAV', 'SVG'])

  const push = (type: Block['type'], raw: string | null) => {
    const text = cleanText(raw || '')
    if (text) blocks.push({ type, text })
  }

  const walk = (node: Element) => {
    for (const child of Array.from(node.children)) {
      const tag = child.tagName
      if (SKIP_TAGS.has(tag)) continue
      const cls = typeof child.className === 'string' ? child.className : ''
      if (cls.includes('tg-step-num')) continue
      // Skip the table-of-contents container (holds in-page anchor links)
      if (tag !== 'H1' && tag !== 'H2' && child.querySelector?.('a[href^="#"]')) continue

      if (tag === 'H1') { push('h1', child.textContent); continue }
      if (tag === 'H2' || cls.includes('tg-section-title')) { push('h2', child.textContent); continue }
      if (cls.includes('tg-step-title')) { push('h3', child.textContent); continue }
      if (cls.includes('tg-step-desc') || cls.includes('tg-rule')) { push('bullet', child.textContent); continue }
      if (tag === 'P') { push('p', child.textContent); continue }
      if (child.children.length === 0) { push('p', child.textContent); continue }
      walk(child)
    }
  }

  walk(root)
  return blocks
}

/**
 * Export a page element to a real, downloadable PDF built with jsPDF's text API.
 * We deliberately avoid html2canvas (it produced blank pages): this renders
 * selectable text with automatic pagination and downloads the file directly.
 */
export async function exportPageToPdf(element: HTMLElement, filename: string) {
  await loadJsPDF()
  const { jsPDF } = (window as any).jspdf
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 48
  const maxW = pageW - margin * 2
  let y = margin

  const ensure = (space: number) => {
    if (y + space > pageH - margin) { doc.addPage(); y = margin }
  }

  const writeLines = (text: string, opt: { size: number; style: string; rgb: number[]; lh: number; indent?: number; bullet?: boolean }) => {
    doc.setFont('helvetica', opt.style)
    doc.setFontSize(opt.size)
    doc.setTextColor(opt.rgb[0], opt.rgb[1], opt.rgb[2])
    const indent = opt.indent || 0
    const lines: string[] = doc.splitTextToSize(text, maxW - indent)
    lines.forEach((line, i) => {
      ensure(opt.lh)
      const prefix = opt.bullet && i === 0 ? '•  ' : (opt.bullet ? '   ' : '')
      doc.text(prefix + line, margin + indent, y)
      y += opt.lh
    })
  }

  const blocks = extractBlocks(element)
  for (const b of blocks) {
    if (b.type === 'h1') {
      ensure(26)
      writeLines(b.text, { size: 20, style: 'bold', rgb: [13, 107, 94], lh: 24 })
      y += 8
    } else if (b.type === 'h2') {
      y += 12; ensure(22)
      writeLines(b.text, { size: 14, style: 'bold', rgb: [13, 107, 94], lh: 18 })
      doc.setDrawColor(45, 122, 111); doc.setLineWidth(1)
      doc.line(margin, y - 2, pageW - margin, y - 2)
      y += 10
    } else if (b.type === 'h3') {
      ensure(16)
      writeLines(b.text, { size: 11, style: 'bold', rgb: [26, 32, 46], lh: 15 })
      y += 2
    } else if (b.type === 'bullet') {
      writeLines(b.text, { size: 10.5, style: 'normal', rgb: [45, 45, 45], lh: 14, indent: 16, bullet: true })
      y += 5
    } else {
      writeLines(b.text, { size: 10.5, style: 'normal', rgb: [45, 45, 45], lh: 14 })
      y += 6
    }
  }

  doc.save(filename)
}

export function exportPageToWord(element: HTMLElement, filename: string) {
  // Clone and resolve CSS vars for Word export too
  const clone = element.cloneNode(true) as HTMLElement
  resolveVars(clone)

  const html = `<html><head><meta charset="utf-8"><style>
body{font-family:Calibri,sans-serif;line-height:1.6;color:#1a1a2e}
h1{color:#0d6b5e;font-size:22pt;border-bottom:2px solid #0d6b5e;padding-bottom:6px}
h2{color:#0d6b5e;font-size:16pt;border-bottom:1px solid #ddd;padding-bottom:4px;margin-top:24px}
h3{color:#333;font-size:13pt}
table{border-collapse:collapse;width:100%}
th,td{border:1px solid #ddd;padding:8px}
th{background:#0d6b5e;color:#fff}
code{background:#e8f5e9;padding:2px 6px;border-radius:3px;font-size:0.9em}
/* Guide/Manual card structure — Word has poor flex support, so use table-ish block layout */
.tg-section{margin-bottom:18pt}
.tg-section-title{color:#0d6b5e;font-size:14pt;font-weight:bold;border-bottom:1px solid #2D7A6F;padding-bottom:4px;margin:18pt 0 10pt}
.tg-step,.tg-rule,.tg-example-box,.pdf-block{display:block;border:1px solid #e2e8f0;border-radius:6px;padding:10px 12px;margin-bottom:8px;background:#fff}
.tg-step-num{display:inline-block;font-weight:bold;color:#2D7A6F;margin-right:6px}
.tg-step-title{font-weight:bold;color:#1a1a2e}
.tg-step-desc{color:#333}
</style></head><body>${clone.innerHTML}</body></html>`
  const blob = new Blob(['﻿', html], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
