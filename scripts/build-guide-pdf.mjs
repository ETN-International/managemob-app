#!/usr/bin/env node
/**
 * build-guide-pdf.mjs — genera i PDF della guida "Vibe Coding / Crea la tua
 * versione di Managemob" applicando l'identità `carta-inchiostro-pdf`:
 * cover full-bleed con fascia laterale VERTICALE (writing-mode: vertical-rl),
 * pagine interne editoriali, SENZA emoji (così i PDF restano leggeri).
 *
 * - Legge il contenuto multilingua da public/managemob-vibe-coding-guide.html
 *   (const DATA), così non duplica la sorgente.
 * - Per ogni lingua scrive un HTML temporaneo e lo stampa con Chrome headless.
 * - Output: public/guide-pdf/managemob-guide-<lang>.pdf  (sovrascrive).
 *
 * Uso:  node scripts/build-guide-pdf.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'public/managemob-vibe-coding-guide.html');
const OUT = join(ROOT, 'public/guide-pdf');
const TMP = join(ROOT, '.tmp-guide-pdf');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// ── Estrai const DATA = {...} dall'HTML ──────────────────────────────────────
function extractData(html) {
  const i = html.indexOf('const DATA =');
  let j = html.indexOf('{', i), depth = 0, inStr = false, q = '';
  for (let k = j; k < html.length; k++) {
    const c = html[k];
    if (inStr) { if (c === q && html[k - 1] !== '\\') inStr = false; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = true; q = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return new Function('return ' + html.slice(j, k + 1))(); }
  }
  throw new Error('DATA non trovato');
}

// ── Rimuovi SOLO le emoji a colori (che Chrome rasterizza in PNG) ────────────
function noEmoji(s) {
  return String(s == null ? '' : s)
    .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, '')   // bandiere
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')   // pittogrammi/simboli
    .replace(/[\u{2600}-\u{27BF}]/gu, '')     // misc symbols + dingbats (incl. ★ ✓)
    .replace(/[\u{2B00}-\u{2BFF}]/gu, '')     // frecce/stelle simboliche
    .replace(/[\u{FE00}-\u{FE0F}‍]/gu, '') // variation selector + ZWJ
    .replace(/^\s+|\s+$/g, '')
    .replace(/\s{2,}/g, ' ');
}
const esc = s => noEmoji(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// per i campi *_html teniamo i tag ma togliamo emoji
const escHtml = s => noEmoji(s);

const LOC = {
  why:       { it: 'Perché', en: 'Why', es: 'Por qué', fr: 'Pourquoi', de: 'Warum', pt: 'Porquê', sv: 'Varför' },
  actions:   { it: 'Cosa fai', en: 'What you do', es: 'Qué haces', fr: 'Ce que tu fais', de: 'Was du tust', pt: 'O que fazer', sv: 'Vad du gör' },
  prompt:    { it: 'Prompt da incollare', en: 'Prompt to paste', es: 'Prompt para pegar', fr: 'Prompt à coller', de: 'Prompt zum Einfügen', pt: 'Prompt para colar', sv: 'Prompt att klistra in' },
  tip:       { it: 'Suggerimento', en: 'Tip', es: 'Consejo', fr: 'Astuce', de: 'Tipp', pt: 'Dica', sv: 'Tips' },
  checklist: { it: 'Checklist finale', en: 'Final checklist', es: 'Lista final', fr: 'Checklist finale', de: 'Abschlussliste', pt: 'Checklist final', sv: 'Slutlig checklista' },
};

function renderStep(step, lang) {
  const L = k => (LOC[k][lang] || LOC[k].en);
  const li = a => (a || []).map(x => `<li>${escHtml(x)}</li>`).join('');
  const subs = (step.subsections || []).map(sub =>
    `<div class="subsec"><div class="subsec-t">${esc(sub.title)}</div><ol class="acts">${li(sub.items)}</ol></div>`).join('');
  const actions = step.actions ? `<div class="lbl">${esc(L('actions'))}</div><ol class="acts">${li(step.actions)}</ol>` : '';
  const prompt = step.prompt_body ? `<div class="prompt"><div class="prompt-l">${esc(step.prompt_label || L('prompt'))}</div><div>${escHtml(step.prompt_body)}</div></div>` : '';
  const tip = step.tip_body ? `<div class="tip"><span class="tip-l">${esc(step.tip_label || L('tip'))}</span> ${escHtml(step.tip_body)}</div>` : '';
  const chk = step.checklist ? `<div class="chk"><div class="lbl">${esc(L('checklist'))}</div><ul class="chk-l">${(step.checklist || []).map(c => `<li>${escHtml(c)}</li>`).join('')}</ul></div>` : '';
  return `<section class="pstep">
    <div class="pstep-head"><span class="pstep-n">${esc(step.n)}</span><span class="pstep-label">${esc(step.label)}</span></div>
    <h2 class="pstep-title">${escHtml(step.title_html)}</h2>
    <div class="why"><span class="why-l">${esc(L('why'))}</span> ${escHtml(step.why)}</div>
    ${actions}${subs}${prompt}${tip}${chk}
  </section>`;
}

function renderHtml(c, lang) {
  const band = [c.creator_line, c.doc_title, lang.toUpperCase()].join('   ·   ');
  const stats = (c.stats || []).map(([n, l]) => `<div class="st"><span class="st-n">${esc(n)}</span><span class="st-l">${esc(l)}</span></div>`).join('');
  const steps = (c.steps || []).map(s => renderStep(s, lang)).join('');
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<title>${esc(c.doc_title)}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root{--accent:#c8420a;--paper:#fbf8f1;--ink:#1a1714;--ink-light:#4a4440;--ink-muted:#7a726e;--rule:rgba(26,23,20,.16)}
*{box-sizing:border-box;margin:0;padding:0}
@page{size:A4;margin:20mm 18mm 18mm 18mm}
@page:first{margin:0}
html,body{background:#fff}
body{font-family:'DM Sans',sans-serif;font-size:10.5pt;line-height:1.55;color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact}
em{font-style:italic}
/* ---- COVER ---- */
.cover{position:relative;width:210mm;height:297mm;background:var(--paper);overflow:hidden;page-break-after:always}
.cover-band{position:absolute;left:0;top:0;bottom:0;width:14mm;background:var(--accent);color:rgba(255,255,255,.82);
  font-family:'DM Mono',monospace;font-size:6.5pt;letter-spacing:.32em;text-transform:uppercase;
  writing-mode:vertical-rl;display:flex;align-items:center;justify-content:center;text-align:center;padding:22mm 0}
.cover-num{position:absolute;top:22mm;right:20mm;font-family:'DM Serif Display',serif;font-style:italic;font-size:74pt;line-height:.85;color:var(--accent);letter-spacing:-.04em}
.cover-in{position:relative;z-index:1;height:100%;padding:30mm 22mm 24mm 32mm;display:flex;flex-direction:column}
.cover-eyebrow{font-family:'DM Mono',monospace;font-size:7pt;letter-spacing:.28em;text-transform:uppercase;color:var(--ink);margin-bottom:6mm}
.cover-title{font-family:'DM Serif Display',serif;font-size:48pt;line-height:.98;letter-spacing:-.02em;margin:28mm 0 12mm;max-width:150mm}
.cover-title em{color:var(--accent)}
.cover-sub{font-weight:300;font-size:12pt;line-height:1.5;color:var(--ink-light);max-width:132mm;margin-bottom:5mm}
.cover-meta{font-family:'DM Mono',monospace;font-size:7pt;letter-spacing:.1em;color:var(--ink-muted)}
.cover-stats{display:grid;grid-template-columns:repeat(4,1fr);max-width:142mm;margin-top:auto;padding-top:6mm;border-top:.5pt solid var(--ink)}
.st-n{font-family:'DM Serif Display',serif;font-size:22pt;line-height:1;display:block;margin-bottom:2mm}
.st-l{font-family:'DM Mono',monospace;font-size:6pt;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-muted);display:block}
/* ---- INTRO (principio) ---- */
.intro{padding-top:4mm}
.intro-l{font-family:'DM Mono',monospace;font-size:6.5pt;letter-spacing:.28em;text-transform:uppercase;color:var(--accent);border-top:.5pt solid var(--accent);padding-top:3mm;display:block;margin-bottom:4mm}
.intro-t{font-family:'DM Serif Display',serif;font-size:20pt;line-height:1.1;margin-bottom:5mm}
.intro-t em{color:var(--accent)}
.intro-b{color:var(--ink-light);max-width:150mm}
/* ---- STEPS ---- */
.pstep{margin-top:11mm;break-inside:avoid}
.pstep-head{display:flex;align-items:baseline;gap:4mm;border-top:.5pt solid var(--accent);padding-top:3mm;margin-bottom:3mm;break-after:avoid}
.pstep-n{font-family:'DM Serif Display',serif;font-style:italic;font-size:18pt;color:var(--accent);line-height:1}
.pstep-label{font-family:'DM Mono',monospace;font-size:6.5pt;letter-spacing:.28em;text-transform:uppercase;color:var(--ink-muted)}
.pstep-title{font-family:'DM Serif Display',serif;font-weight:400;font-size:19pt;line-height:1.08;letter-spacing:-.015em;margin-bottom:4mm;break-after:avoid}
.pstep-title em{color:var(--accent)}
.why{color:var(--ink-light);margin-bottom:4mm}
.why-l{font-family:'DM Mono',monospace;font-size:6.5pt;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-right:2mm}
.lbl{font-family:'DM Mono',monospace;font-size:6.5pt;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-muted);margin:4mm 0 2mm;display:block}
ol.acts{margin:0 0 3mm 5mm;padding:0}
ol.acts li{margin-bottom:1.5mm}
.subsec{margin:3mm 0}
.subsec-t{font-weight:600;font-size:9.5pt;margin-bottom:1.5mm}
.prompt{border-left:2pt solid var(--accent);background:rgba(200,66,10,.05);padding:3mm 4mm;margin:3mm 0;font-family:'DM Mono',monospace;font-size:8.5pt;line-height:1.5}
.prompt-l{font-size:6.5pt;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-bottom:1.5mm}
.tip{border-top:.5pt solid var(--rule);border-bottom:.5pt solid var(--rule);padding:3mm 0;margin:3mm 0;font-size:9.5pt;color:var(--ink-light)}
.tip-l{font-family:'DM Mono',monospace;font-size:6.5pt;letter-spacing:.18em;text-transform:uppercase;color:var(--accent)}
.chk{margin:3mm 0}
ul.chk-l{list-style:none;margin:0;padding:0}
ul.chk-l li{padding-left:6mm;position:relative;margin-bottom:1.5mm}
ul.chk-l li::before{content:'□';position:absolute;left:0;color:var(--accent)}
.colophon{margin-top:12mm;border-top:1.2pt solid var(--ink);padding-top:4mm}
.colophon-t{font-family:'DM Serif Display',serif;font-size:15pt;margin-bottom:2mm}
.colophon-t em{color:var(--accent)}
.tags{margin-top:4mm;font-family:'DM Mono',monospace;font-size:7pt;letter-spacing:.06em;color:var(--ink-muted)}
</style></head><body>
<section class="cover">
  <div class="cover-band">${esc(band)}</div>
  <div class="cover-num">&#9733;</div>
  <div class="cover-in">
    <div class="cover-eyebrow">${esc(c.hero_eyebrow)}</div>
    <h1 class="cover-title">${escHtml(c.hero_title_html)}</h1>
    <p class="cover-sub">${esc(c.doc_subtitle)}</p>
    <div class="cover-meta">${esc(c.creator_line)}</div>
    <div class="cover-stats">${stats}</div>
  </div>
</section>
<main>
  <div class="intro">
    <span class="intro-l">${esc(c.principle_label || '')}</span>
    <h2 class="intro-t">${escHtml(c.principle_title_html || '')}</h2>
    <p class="intro-b">${esc(c.principle_body || '')}</p>
  </div>
  ${steps}
  <div class="colophon">
    <div class="colophon-t">${escHtml(c.conclusion_title_html || c.conclusion_label || '')}</div>
    <p class="intro-b">${esc(c.conclusion_body || '')}</p>
    <div class="tags">${(c.tags || []).map(esc).join('  ·  ')}</div>
  </div>
</main>
</body></html>`;
}

// ── Main ─────────────────────────────────────────────────────────────────────
const html = readFileSync(SRC, 'utf8');
const DATA = extractData(html);
const langs = Object.keys(DATA); // it,en,es,fr,de,pt,sv
mkdirSync(TMP, { recursive: true });
mkdirSync(OUT, { recursive: true });

for (const lang of langs) {
  const c = DATA[lang];
  const htmlPath = join(TMP, `g-${lang}.html`);
  const pdfPath = join(OUT, `managemob-guide-${lang}.pdf`);
  writeFileSync(htmlPath, renderHtml(c, lang));
  execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
    '--virtual-time-budget=12000',
    `--print-to-pdf=${pdfPath}`,
    `file://${htmlPath}`,
  ], { stdio: ['ignore', 'ignore', 'ignore'] });
  console.log(`✓ ${lang} -> managemob-guide-${lang}.pdf`);
}
rmSync(TMP, { recursive: true, force: true });
console.log('Fatto.');
