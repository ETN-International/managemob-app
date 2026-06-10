---
name: carta-inchiostro-pdf
description: "Identità visiva per pdf"
---

Quando ti chiedo di creare pdf attieniti a queste specifiche:
/* ═══════════════════════════════════════════════════════════════
   CARTA & INCHIOSTRO · PDF
   Sistema editoriale per la stampa del catalogo formazione ETN School.
   ───────────────────────────────────────────────────────────────
   Concepito come complemento — non come copia — dello stile screen.
   Stessa famiglia tipografica (DM Serif Display · DM Sans · DM Mono),
   stesso arancio brand, ma ripensato per il medium PDF: cover full-bleed
   con fascia laterale arancio + numero corso italic serif; pagine interne
   con drop cap, schedule a filetti hairline, griglie aperte, ETN colophon
   e tags come thesaurus tipografico.

   ───────────────────────────────────────────────────────────────
   USO

   Questo CSS è il riferimento/documentazione del sistema. Il blocco
   `@media print { … }` qui sotto è incollato (con i valori cover
   adattati per corso) all'interno del <style> di ogni file HTML del
   catalogo, così che ogni file generi una cover propria.

   Per ogni nuova scheda corso, sostituire DUE stringhe nel blocco:

     1) .hero::before { content: "Macro-area X · …"; }
        ↑ testo verticale della fascia laterale arancio
        es. "Macro-area D · Didattica orientativa · ETN School · …"

     2) .hero::after  { content: "01"; }
        ↑ numero corso italic serif (top-right della cover)
        es. "01" – "14" per i corsi, "★" per il catalogo (index)

   ───────────────────────────────────────────────────────────────
   ANATOMIA DEL SISTEMA

   1 · Cover full-bleed (fascia macro-area + numero serif)
   2 · Sezioni con section-label mono + filetto + H2 serif
   3 · Drop cap italic arancio sull'apertura dell'Abstract
   4 · Articolazione modulo: schedule editoriale a filetti hairline
       (numerali romani italic arancio, totale serif italic 16pt)
   5 · Obiettivi grid: 2×N a hairline interne, niente card
   6 · About grid: colonne aperte con filetto sopra ciascun blocco
   7 · ETN colophon: filetto ink 1.5pt + titolo serif + paragrafo
   8 · Tags: thesaurus tipografico (puntini arancio · separatori)
   9 · Catalog grid (solo index): listing 2-col TOC editoriale

   ───────────────────────────────────────────────────────────────
   GENERAZIONE PDF

   ./build-pdf.sh — usa headless Chrome → A4 portrait
                    output: <slug>.pdf per ogni HTML
                    + catalogo-completo.pdf (tutti concatenati)

   ═══════════════════════════════════════════════════════════════ */

@media print {
  :root {
    --pdf-accent:       #c8420a; /* arancio ETN — identità di marca */
    --pdf-accent-soft:  rgba(200,66,10,0.10);
    --pdf-paper:        #fbf8f1;
    --pdf-rule:         rgba(26,23,20,0.18);
    --pdf-rule-soft:    rgba(26,23,20,0.08);
  }

  /* ─── Reset border-radius globale per evitare residui dalle regole screen ─── */
  .hero, .variant-card, .obiettivi-grid, .obiettivi-grid .item,
  .about-grid, .about-item, .etn-feature, .v-tabella, .tag,
  .corso-card { border-radius: 0 !important; }

  /* ─── Page setup ─── */
  @page {
    size: A4;
    margin: 22mm 20mm 22mm 22mm;
  }
  @page :first {
    margin: 0; /* cover full-bleed */
  }

  /* ─── Reset & fundamentals ─── */
  html, body { background: #fff; }
  body {
    font-family: 'DM Sans', sans-serif;
    font-size: 9.5pt;
    line-height: 1.55;
    color: var(--ink);
    font-weight: 400;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    font-feature-settings: "tnum" 1, "kern" 1, "liga" 1;
  }
  body::before { display: none; }
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
  a { color: inherit; text-decoration: none; }

  /* ─── Hide screen chrome + info-strip (la sostituisce la cover) ─── */
  .site-header, .header-actions, .site-footer { display: none !important; }
  .info-strip { display: none !important; }

  /* ═══════════════════════════════════════════════════════════════
     1 · COVER PAGE (page 1, full-bleed)
     ═══════════════════════════════════════════════════════════════ */

  .hero {
    position: relative;
    width: 210mm;
    height: 297mm;
    margin: 0;
    padding: 0;
    background: var(--pdf-paper);
    page-break-after: always;
    break-after: page;
    overflow: hidden;
    box-sizing: border-box;
  }
  /* Fascia macro-area sul margine sinistro, con testo verticale */
  .hero::before {
    content: "Macro-area D · Didattica orientativa · ETN School · Catalogo 2026/2027";
      /* ↑ band laterale: cambia macro-area + titolo corso per ogni file */
    position: absolute;
    top: 0; bottom: 0; left: 0;
    width: 14mm;
    background: var(--pdf-accent);
    color: rgba(255,255,255,0.78);
    font-family: 'DM Mono', monospace;
    font-size: 6.5pt;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    writing-mode: vertical-rl;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 22mm 0;
    text-align: center;
  }
  /* Numero corso massiccio, top-right come "issue number" editoriale */
  .hero::after {
    content: "01";
      /* ↑ numero corso: "01"–"14" oppure "★" per il catalogo (index) */
    position: absolute;
    top: 24mm;
    right: 22mm;
    bottom: auto;
    left: auto;
    width: auto;
    height: auto;
    background: none;
    font-family: 'DM Serif Display', serif;
    font-style: italic;
    font-size: 80pt;
    line-height: 0.85;
    color: var(--pdf-accent);
    letter-spacing: -0.04em;
    z-index: 0;
  }

  .hero-inner {
    max-width: none;
    width: 100%;
    height: 100%;
    padding: 30mm 22mm 24mm 32mm;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1;
  }

  .hero-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 7pt;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--ink);
    margin: 0 0 6mm;
    display: block;
  }
  .hero-eyebrow::before { display: none; }

  .hero-title {
    font-family: 'DM Serif Display', serif;
    font-size: 56pt;
    font-weight: 400;
    line-height: 0.96;
    color: var(--ink);
    margin: 38mm 0 14mm;
    letter-spacing: -0.02em;
    max-width: 142mm;
  }
  .hero-title em { color: var(--pdf-accent); font-style: italic; }
  .hero-title .line-muted { color: var(--ink-muted); font-style: italic; }

  .hero-body {
    font-family: 'DM Sans', sans-serif;
    font-size: 11pt;
    line-height: 1.55;
    color: var(--ink-light);
    max-width: 122mm;
    margin: 0 0 6mm;
    font-weight: 300;
  }

  .hero-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    max-width: 130mm;
    margin-top: auto;
    padding-top: 6mm;
    border-top: 0.5pt solid var(--ink);
    align-items: end;
  }
  .stat-divider { display: none; }
  .stat { display: block; padding-right: 4mm; }
  .stat-num {
    font-family: 'DM Serif Display', serif;
    font-size: 22pt;
    line-height: 1;
    color: var(--ink);
    margin-bottom: 2.5mm;
    display: block;
  }
  .stat-num em { font-style: italic; color: var(--pdf-accent); }
  .stat-label {
    font-family: 'DM Mono', monospace;
    font-size: 6pt;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink-muted);
    display: block;
  }

  /* ═══════════════════════════════════════════════════════════════
     2 · CONTENT PAGES — editoriale
     ═══════════════════════════════════════════════════════════════ */

  .main {
    max-width: none;
    padding: 0;
    margin: 0;
  }

  /* Section opener: caps spaziate + filetto sopra */
  .section-label {
    font-family: 'DM Mono', monospace;
    font-size: 6.5pt;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--pdf-accent);
    margin: 12mm 0 4mm;
    display: block;
    padding: 3mm 0 0;
    border-top: 0.5pt solid var(--pdf-accent);
    page-break-after: avoid;
    break-after: avoid;
  }
  .section-label:first-of-type { margin-top: 0; }
  .section-label::after { display: none; }

  /* H2 editoriale */
  h2 {
    font-family: 'DM Serif Display', serif;
    font-weight: 400;
    font-size: 22pt;
    line-height: 1.05;
    letter-spacing: -0.015em;
    margin: 0 0 6mm;
    color: var(--ink);
    page-break-after: avoid;
    break-after: avoid;
  }
  h2 em { font-style: italic; color: var(--pdf-accent); }

  h3 {
    font-family: 'DM Serif Display', serif;
    font-weight: 400;
    font-size: 13pt;
    margin: 5mm 0 2mm;
    color: var(--ink);
    page-break-after: avoid;
    break-after: avoid;
  }

  /* Body */
  p {
    font-family: 'DM Sans', sans-serif;
    font-size: 9.5pt;
    line-height: 1.62;
    color: var(--ink-light);
    margin: 0 0 3mm;
    text-align: justify;
    hyphens: auto;
    -webkit-hyphens: auto;
    orphans: 3;
    widows: 3;
  }
  p strong { color: var(--ink); font-weight: 500; }

  p.intro {
    font-size: 10.5pt;
    line-height: 1.55;
    color: var(--ink);
    font-weight: 300;
    margin-bottom: 4mm;
    max-width: none;
  }
  /* Drop cap solo sul primo intro paragrafo della sezione Abstract */
  .section-label + h2 + p.intro::first-letter {
    font-family: 'DM Serif Display', serif;
    font-style: italic;
    color: var(--pdf-accent);
    font-size: 56pt;
    line-height: 0.85;
    float: left;
    margin: 1mm 4mm -2mm 0;
    font-weight: 400;
  }

  /* Numbered list editoriale: numerali italic serif su filetti hairline */
  ol.numbered {
    counter-reset: list;
    margin: 4mm 0 5mm;
    max-width: none;
    list-style: none;
    padding: 0;
    border-top: 0.75pt solid var(--ink);
    page-break-inside: avoid;
    break-inside: avoid;
  }
  ol.numbered li {
    counter-increment: list;
    padding: 3mm 0 3mm 14mm;
    border-bottom: 0.25pt solid var(--pdf-rule-soft);
    font-size: 9.5pt;
    line-height: 1.55;
    color: var(--ink-light);
    position: relative;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  ol.numbered li:last-child { border-bottom: 0.75pt solid var(--ink); }
  ol.numbered li::before {
    content: counter(list, decimal-leading-zero);
    position: absolute;
    left: 0;
    top: 2.5mm;
    font-family: 'DM Serif Display', serif;
    font-style: italic;
    font-weight: 400;
    color: var(--pdf-accent);
    font-size: 13pt;
    letter-spacing: 0;
  }
  ol.numbered li strong { color: var(--ink); font-weight: 500; }

  /* Bullet list: glifo § serif */
  ul.bullet {
    margin: 3mm 0 5mm;
    padding: 0;
    max-width: none;
    list-style: none;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  ul.bullet li {
    padding: 1.5mm 0 1.5mm 7mm;
    font-size: 9.5pt;
    line-height: 1.55;
    color: var(--ink-light);
    position: relative;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  ul.bullet li::before {
    content: '§';
    font-family: 'DM Serif Display', serif;
    font-style: italic;
    color: var(--pdf-accent);
    position: absolute;
    left: 0;
    top: 0.6mm;
    font-size: 13pt;
    background: none;
    width: auto;
    height: auto;
    border-radius: 0;
  }
  ul.bullet li strong { color: var(--ink); font-weight: 500; }

  /* ═══════════════════════════════════════════════════════════════
     3 · ARTICOLAZIONE — schedule editoriale, hairline only
     ═══════════════════════════════════════════════════════════════ */

  .varianti-grid { display: block; margin-top: 4mm; }
  .variant-card {
    background: transparent;
    border: none;
    padding: 0;
    box-shadow: none !important;
    page-break-inside: auto;
  }
  .variant-card::before, .variant-card.featured::before { display: none; }
  .variant-card .v-badge { display: none; }
  .variant-card .v-title { display: none; } /* duplicato dell'H2 */
  .variant-card .v-desc {
    font-family: 'DM Sans', sans-serif;
    font-style: italic;
    font-weight: 300;
    font-size: 10.5pt;
    color: var(--ink-light);
    margin-bottom: 5mm;
    padding: 0 5mm;
    max-width: none;
    line-height: 1.55;
  }

  .variant-card .v-tabella {
    width: 100%;
    border-collapse: collapse;
    font-feature-settings: "tnum" 1;
    margin-top: 3mm;
  }
  .variant-card .v-tabella thead { display: table-header-group; }
  .variant-card .v-tabella tfoot { display: table-footer-group; }
  .variant-card .v-tabella thead th {
    font-family: 'DM Mono', monospace;
    font-size: 6.5pt;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink-muted);
    text-align: left;
    padding: 2mm 3mm;
    border-bottom: 0.75pt solid var(--ink);
    font-weight: 500;
  }
  .variant-card .v-tabella thead th:first-child { padding-left: 5mm; }
  .variant-card .v-tabella thead th:last-child  { text-align: right; padding-right: 5mm; }
  .variant-card .v-tabella tbody td {
    padding: 3mm 3mm;
    border-bottom: 0.25pt solid var(--pdf-rule-soft);
    vertical-align: top;
    color: var(--ink-light);
    font-size: 9pt;
    line-height: 1.5;
  }
  .variant-card .v-tabella tbody td:first-child,
  .variant-card.featured .v-tabella tbody td:first-child {
    font-family: 'DM Serif Display', serif;
    font-style: italic;
    color: var(--pdf-accent);
    font-size: 14pt;
    width: 14mm;
    padding-top: 2mm;
    padding-left: 5mm;
    line-height: 1;
  }
  .variant-card .v-tabella tbody td:nth-child(2) {
    font-family: 'DM Serif Display', serif;
    color: var(--ink);
    font-size: 11pt;
    width: 38mm;
    padding-right: 5mm;
    line-height: 1.2;
    font-weight: 400;
  }
  .variant-card .v-tabella tbody td:last-child {
    text-align: right;
    font-family: 'DM Mono', monospace;
    color: var(--ink);
    width: 12mm;
    padding-right: 5mm;
    font-feature-settings: "tnum" 1;
  }
  .variant-card .v-tabella tbody tr:last-child td { border-bottom: 0.75pt solid var(--ink); }
  .variant-card .v-tabella tfoot td {
    padding: 8mm 3mm 4mm;
    font-family: 'DM Mono', monospace;
    font-size: 9pt;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink);
    font-weight: 500;
    border: none;
    line-height: 1;
  }
  .variant-card .v-tabella tfoot td:first-child { padding-left: 5mm; }
  .variant-card .v-tabella tfoot td:last-child,
  .variant-card.featured .v-tabella tfoot td:last-child {
    text-align: right;
    padding-right: 5mm;
    color: var(--pdf-accent);
    font-family: 'DM Serif Display', serif;
    font-style: italic;
    font-size: 16pt;
    font-weight: 400;
    letter-spacing: 0;
    text-transform: none;
    font-feature-settings: "tnum" 1;
    line-height: 1;
  }

  /* ═══════════════════════════════════════════════════════════════
     4 · OBIETTIVI GRID — 2 colonne separate da hairline
     ═══════════════════════════════════════════════════════════════ */

  .obiettivi-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    background: transparent;
    border: none;
    border-top: 0.75pt solid var(--ink);
    border-radius: 0;
    margin-top: 4mm;
    overflow: visible;
  }
  .obiettivi-grid .item {
    background: transparent;
    padding: 4mm 5mm 4mm 0;
    border-bottom: 0.25pt solid var(--pdf-rule-soft);
    border-right: 0.25pt solid var(--pdf-rule-soft);
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .obiettivi-grid .item:nth-child(2n) {
    padding-right: 0;
    padding-left: 5mm;
    border-right: none;
  }
  .obiettivi-grid .item:nth-last-child(-n+2) {
    border-bottom: 0.75pt solid var(--ink);
  }
  .obiettivi-grid .item:hover { background: transparent; }
  .obiettivi-grid .item .num {
    font-family: 'DM Mono', monospace;
    font-size: 6pt;
    color: var(--pdf-accent);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 1.5mm;
    display: block;
    font-weight: 500;
  }
  .obiettivi-grid .item .titolo {
    font-family: 'DM Serif Display', serif;
    font-size: 11pt;
    color: var(--ink);
    line-height: 1.2;
    margin-bottom: 1.5mm;
    font-weight: 400;
  }
  .obiettivi-grid .item p {
    font-size: 8.5pt;
    line-height: 1.5;
    color: var(--ink-light);
    margin: 0;
    text-align: left;
    hyphens: none;
  }

  /* ═══════════════════════════════════════════════════════════════
     5 · ABOUT GRID — colonne aperte editoriale
     ═══════════════════════════════════════════════════════════════ */

  .about-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8mm;
    background: transparent;
    border: none;
    border-radius: 0;
    margin-top: 4mm;
    overflow: visible;
  }
  .about-grid.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
  .about-grid.cols-4 { grid-template-columns: repeat(4, 1fr); }
  .about-item {
    background: transparent;
    padding: 0;
    border-top: 0.75pt solid var(--ink);
    padding-top: 3mm;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .about-item:hover { background: transparent; }
  .about-icon {
    font-family: 'DM Mono', monospace;
    font-size: 6pt;
    color: var(--pdf-accent);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 2mm;
    display: block;
    font-weight: 500;
  }
  .about-title {
    font-family: 'DM Serif Display', serif;
    font-size: 11pt;
    color: var(--ink);
    margin-bottom: 2mm;
    line-height: 1.2;
    font-weight: 400;
  }
  .about-body, .about-body p {
    font-family: 'DM Sans', sans-serif;
    font-size: 8.5pt;
    line-height: 1.55;
    color: var(--ink-light);
    text-align: left;
  }
  .about-body p { margin-bottom: 1mm; }
  .about-body p:last-child { margin-bottom: 0; }
  .about-body strong { color: var(--ink); font-weight: 500; }

  /* ═══════════════════════════════════════════════════════════════
     6 · ETN COLOPHON — closing block editoriale
     ═══════════════════════════════════════════════════════════════ */

  .etn-feature {
    background: transparent;
    border: none;
    border-top: 1.5pt solid var(--ink);
    border-radius: 0;
    padding: 6mm 0 0;
    margin-top: 8mm;
    overflow: visible;
    page-break-inside: avoid;
    break-inside: avoid;
    /* Tieni la colophon insieme al successivo (.tags) per evitare che le
       tag rimangano orfane su pagina nuova. */
    page-break-after: avoid;
    break-after: avoid;
  }
  .etn-feature::before, .etn-feature::after {
    display: none !important;
    content: none !important;
  }
  .etn-feature .etn-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 6.5pt;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--pdf-accent);
    margin-bottom: 3mm;
  }
  .etn-feature .etn-title {
    font-family: 'DM Serif Display', serif;
    font-size: 17pt;
    font-weight: 400;
    color: var(--ink);
    line-height: 1.1;
    margin-bottom: 4mm;
    max-width: 145mm;
    letter-spacing: -0.01em;
  }
  .etn-feature .etn-title em { color: var(--pdf-accent); font-style: italic; }
  .etn-feature p {
    color: var(--ink-light);
    font-size: 9pt;
    line-height: 1.6;
    max-width: 150mm;
    text-align: justify;
    hyphens: auto;
    -webkit-hyphens: auto;
  }
  .etn-feature strong { color: var(--ink); font-weight: 500; }

  /* ═══════════════════════════════════════════════════════════════
     7 · TAGS — thesaurus tipografico inline
     ═══════════════════════════════════════════════════════════════ */

  .tags {
    display: block;
    margin-top: 5mm;
    padding-top: 3mm;
    border-top: 0.5pt solid var(--pdf-rule);
    font-family: 'DM Mono', monospace;
    font-size: 6.5pt;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink-muted);
    line-height: 1.9;
    page-break-inside: avoid;
    break-inside: avoid;
    /* Resta sulla pagina della colophon: se non c'è spazio entrambe
       saltano alla pagina successiva, evitando la pagina orfana coi soli tag. */
    page-break-before: avoid;
    break-before: avoid;
  }
  .tag {
    display: inline;
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
    color: var(--ink-muted) !important;
    margin: 0;
    font-size: 6.5pt;
  }
  .tag:not(:last-child)::after {
    content: ' · ';
    color: var(--pdf-accent);
    margin: 0 1mm;
  }
  .tag.accent {
    color: var(--pdf-accent) !important;
    font-weight: 500;
  }

  /* ═══════════════════════════════════════════════════════════════
     8 · PAGE BREAKS editoriali
     ═══════════════════════════════════════════════════════════════ */

  /* Sezioni "pesanti" su pagina nuova: variant card, obiettivi grid, about grid */
  .main > .section-label:has(+ h2 + p + .varianti-grid),
  .main > .section-label:has(+ h2 + .obiettivi-grid),
  .main > .section-label:has(+ h2 + .about-grid),
  .main > .section-label:has(+ h2 + p + .about-grid) {
    page-break-before: always;
    break-before: page;
    margin-top: 0;
  }

  /* ═══════════════════════════════════════════════════════════════
     9 · CATALOG GRID (index) — listing editoriale a 2 colonne
     ═══════════════════════════════════════════════════════════════ */

  .catalogo-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8mm;
    margin-top: 4mm;
    border-top: 0.75pt solid var(--ink);
    padding-top: 5mm;
  }
  .corso-card {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 0 4mm !important;
    margin-bottom: 4mm;
    border-bottom: 0.25pt solid var(--pdf-rule-soft) !important;
    page-break-inside: avoid;
    break-inside: avoid;
    display: block;
    color: inherit;
    text-decoration: none;
  }
  .corso-card .num {
    font-family: 'DM Mono', monospace;
    font-size: 6.5pt;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--pdf-accent);
    margin-bottom: 2mm;
    display: block;
    font-weight: 500;
  }
  .corso-card h3 {
    font-family: 'DM Serif Display', serif;
    font-weight: 400;
    font-size: 13pt;
    line-height: 1.15;
    margin: 0 0 2.5mm;
    color: var(--ink);
  }
  .corso-card h3 em {
    color: var(--pdf-accent);
    font-style: italic;
  }
  .corso-card p {
    font-family: 'DM Sans', sans-serif;
    font-size: 8.5pt;
    line-height: 1.5;
    color: var(--ink-light);
    margin: 0 0 3mm;
    text-align: left;
    hyphens: none;
  }
  .corso-card .meta {
    font-family: 'DM Mono', monospace;
    font-size: 6pt;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink-muted);
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding-top: 0;
    border-top: none;
    margin-top: auto;
  }
  .corso-card .meta .freccia {
    color: var(--pdf-accent);
    font-family: 'DM Serif Display', serif;
    font-style: italic;
    font-size: 10pt;
  }

  /* Section opener prima del catalogo */
  .catalogo-grid + p,
  .section-label + h2 + p {
    /* lascia il margine standard */
  }
}
