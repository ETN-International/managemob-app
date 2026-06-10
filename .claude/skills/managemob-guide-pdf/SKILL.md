---
name: managemob-guide-pdf
description: >-
  Generate the print-ready multilingual Managemob guide PDFs (the "Vibe Coding /
  Crea la tua versione" guide and the Coolify extension) with the correct
  VERTICAL brand strip on the cover. Use when asked to (re)create, fix, or
  regenerate those guide PDFs / their covers in any of the 7 languages
  (it, en, fr, es, de, pt, sv/se), or to fix the cover text that renders
  horizontal instead of vertical.
---

# Managemob Guide PDF

Recipe to produce the Managemob guide PDFs exactly like the originals, with the
cover brand strip rendered VERTICALLY (the known bug: it was printing horizontal).

## Background (verified facts)

- The original PDFs were produced by **Chromium "Print → Save as PDF"** of an
  HTML page (PDF metadata: `Creator: Chromium`, `Producer: Skia/PDF`). The
  original HTML source is **NOT in the repo** (checked all files + full git
  history) — it was external and lost.
- Page palette / fonts (from `public/managemob-vibe-coding-guide.html`):
  `--paper #f5f0e8`, `--ink #1a1714`, `--accent #c8420a`; fonts
  **DM Serif Display** (hero), **DM Sans**, **DM Mono** (Google Fonts).
- The multilingual CONTENT already exists in the repo:
  - main guide → `public/managemob-vibe-coding-guide.html` (`const DATA` per lang)
  - Coolify guide → only as PDFs in `public/guide-pdf/coolify-managemob-guide-*.pdf`
- The cover vertical strip text reads (example IT):
  `UNA GUIDA DI PESSOA ACADEMY · VIBE CODING WORKFLOW · CREA LA TUA VERSIONE DI MANAGEMOB · IT`
  i.e. `creator_line · doc_title · LANG`.

## Output / how the PDF is made available

- Output files keep the SAME names in `public/guide-pdf/`:
  - `managemob-guide-{it,en,fr,es,de,pt,sv}.pdf`
  - `coolify-managemob-guide-{it,en,fr,es,de,pt,se}.pdf`
- Overwriting these files (same path) is enough — the download links in the app
  point to the filename, so they auto-serve the new version after commit + push
  (Netlify redeploys). No link changes needed.
- Generation itself (HTML → PDF) is done by the USER via the browser
  (Print → Save as PDF, A4), unless a headless renderer is available.

## The vertical strip fix (core point)

The cover brand strip must be vertical:

```css
.cover-strip {
  writing-mode: vertical-rl;
  transform: rotate(180deg);   /* reads bottom → top */
  /* full-height strip on the left edge, accent background, white uppercase text */
}
```

## Procedure

Use the **`carta-inchiostro-pdf`** skill (installed at
`.claude/skills/carta-inchiostro-pdf/`). It is the editorial PDF design system:
full-bleed A4 cover with the orange lateral band carrying **VERTICAL** text via
`.hero::before { writing-mode: vertical-rl }` (no fragile `transform: rotate`,
which is why the strip comes out vertical), the big italic-serif issue number on
`.hero::after`, DM Serif Display / DM Sans / DM Mono, drop caps and hairline
schedules. Read that skill for the full `@media print { … }` CSS.

To (re)build the guide PDFs:

1. Start from the multilingual content in
   `public/managemob-vibe-coding-guide.html` (`const DATA` per language).
2. Produce a print HTML whose markup matches the carta-inchiostro-pdf class
   contract: cover = `.hero` › `.hero-inner` with `.hero-eyebrow` + `.hero-title`.
   Set the lateral band text on
   `.hero::before { content: "<creator_line> · <doc_title> · <LANG>"; }`
   and the issue marker on `.hero::after { content: "★"; }` (or a number).
   Paste the skill's entire `@media print { … }` block into the page `<style>`.
3. Repeat per language (it, en, fr, es, de, pt, sv).
4. Generate the PDF: headless Chrome (A4 portrait — see the skill's `build-pdf.sh`
   note), or, if no headless renderer is available, the user does
   **Print → Save as PDF (A4)** from the browser.
5. Save each output OVERWRITING the same filename in `public/guide-pdf/`
   (`managemob-guide-<lang>.pdf`), then commit + push → Netlify serves the new
   file; the download links are unchanged.

For the Coolify extension PDFs (`coolify-managemob-guide-<lang>.pdf`) apply the
same system; their content currently lives only in the existing PDFs (extract it
if a rebuild is requested).
