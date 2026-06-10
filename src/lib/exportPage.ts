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

/** Serialize all same-origin stylesheets into a single CSS string. */
function collectAppCss(): string {
  let css = ''
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = (sheet as CSSStyleSheet).cssRules
      if (!rules) continue
      for (const rule of Array.from(rules)) css += rule.cssText + '\n'
    } catch {
      // Cross-origin stylesheet — cssRules not readable; skip.
    }
  }
  return css
}

/**
 * Export a page element to PDF using the browser's native print engine.
 *
 * We deliberately avoid html2canvas/html2pdf here: that pipeline rasterises the
 * DOM and was producing blank pages for this content (offscreen clone + tall
 * canvas issues). Native print renders real, selectable text with correct page
 * breaks and never yields blank output — at worst it is unstyled, never empty.
 */
export async function exportPageToPdf(element: HTMLElement, filename: string) {
  const win = window.open('', '_blank', 'width=900,height=1000')
  if (!win) {
    alert('Enable pop-ups for this site to export the PDF, then try again.')
    return
  }

  const title = filename.replace(/\.pdf$/i, '')
  const appCss = collectAppCss()

  win.document.open()
  win.document.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>${appCss}</style>
<style>
  @page { size: A4; margin: 12mm; }
  html, body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
  /* Force background colors/badges to print */
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .pdf-root { max-width: 100%; padding: 0; }
  /* Keep atomic blocks together and headings attached to their content */
  .tg-step, .tg-rule, .tg-example-box, .pdf-block { break-inside: avoid; page-break-inside: avoid; }
  h1, h2 { break-after: avoid; page-break-after: avoid; }
</style>
</head>
<body><div class="pdf-root">${element.outerHTML}</div></body>
</html>`)
  win.document.close()

  const triggerPrint = () => {
    win.focus()
    win.onafterprint = () => { try { win.close() } catch { /* ignore */ } }
    win.print()
  }

  // CSS is inlined (synchronous); give the new window a moment to lay out
  // fonts/emoji before invoking the print dialog.
  if (win.document.readyState === 'complete') {
    setTimeout(triggerPrint, 300)
  } else {
    win.onload = () => setTimeout(triggerPrint, 300)
  }
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
