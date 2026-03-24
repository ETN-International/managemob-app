// Utility to export a page DOM element to PDF or Word

let html2pdfLoaded: Promise<void> | null = null

function loadHtml2Pdf(): Promise<void> {
  if (html2pdfLoaded) return html2pdfLoaded
  html2pdfLoaded = new Promise((resolve, reject) => {
    if ((window as any).html2pdf) { resolve(); return }
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load html2pdf'))
    document.head.appendChild(s)
  })
  return html2pdfLoaded
}

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

/** Inline all computed styles that matter for rendering */
function inlineComputedColors(el: HTMLElement) {
  el.querySelectorAll<HTMLElement>('*').forEach(node => {
    const cs = getComputedStyle(node)
    const color = cs.color
    const bg = cs.backgroundColor
    if (color) node.style.color = color
    if (bg && bg !== 'rgba(0, 0, 0, 0)') node.style.backgroundColor = bg
  })
}

export async function exportPageToPdf(element: HTMLElement, filename: string) {
  await loadHtml2Pdf()
  const html2pdf = (window as any).html2pdf

  // Clone the element into an offscreen container so html2canvas can measure it fully
  const clone = element.cloneNode(true) as HTMLElement
  clone.style.position = 'absolute'
  clone.style.left = '-9999px'
  clone.style.top = '0'
  clone.style.width = '900px'
  clone.style.overflow = 'visible'
  clone.style.height = 'auto'
  clone.style.background = '#fff'
  clone.style.padding = '32px 24px'

  document.body.appendChild(clone)

  // Resolve CSS variables and inline computed colors on the clone
  resolveVars(clone)
  inlineComputedColors(clone)

  const opt = {
    margin: [10, 10, 10, 10],
    filename,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: { scale: 2, useCORS: true, scrollY: 0, windowWidth: 960 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  }

  try {
    await html2pdf().set(opt).from(clone).save()
  } finally {
    document.body.removeChild(clone)
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
</style></head><body>${clone.innerHTML}</body></html>`
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
