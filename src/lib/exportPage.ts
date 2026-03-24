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

export async function exportPageToPdf(element: HTMLElement, filename: string) {
  await loadHtml2Pdf()
  const html2pdf = (window as any).html2pdf
  const opt = {
    margin: [10, 10, 10, 10],
    filename,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  }
  await html2pdf().set(opt).from(element).save()
}

export function exportPageToWord(element: HTMLElement, filename: string) {
  const html = `<html><head><meta charset="utf-8"><style>
body{font-family:Calibri,sans-serif;line-height:1.6;color:#1a1a2e}
h1{color:#0d6b5e;font-size:22pt;border-bottom:2px solid #0d6b5e;padding-bottom:6px}
h2{color:#0d6b5e;font-size:16pt;border-bottom:1px solid #ddd;padding-bottom:4px;margin-top:24px}
h3{color:#333;font-size:13pt}
table{border-collapse:collapse;width:100%}
th,td{border:1px solid #ddd;padding:8px}
th{background:#0d6b5e;color:#fff}
code{background:#e8f5e9;padding:2px 6px;border-radius:3px;font-size:0.9em}
</style></head><body>${element.innerHTML}</body></html>`
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
