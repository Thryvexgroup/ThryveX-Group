# ThryveX Group · branded documents

Brand-faithful invoices (and, next, quotes and onboarding packs) generated from JSON data.
Nothing in this folder is deployed to the website: `.vercelignore` excludes `documents/`.

## Two ways to produce an invoice

### 1. Ask Claude (or run the renderer)

Give the invoice details in chat, or drop a JSON file next to `data/invoice.example.json`, then:

```bash
node documents/render.mjs invoice documents/data/invoice.example.json
```

Output lands in `documents/out/<number>.pdf` (+ `.png` preview). Needs Node 18+ and Playwright
(`npm i -D playwright` once, in the repo root; the cloud session already has it).

### 2. Edit it yourself in Canva, PowerPoint or Keynote

```bash
node documents/build-pptx.mjs documents/data/invoice.example.json
```

Produces `documents/out/<number>.pptx`, an A4 page where every text box, panel and line is editable.
In Canva: **Create a design → Import file** and choose the `.pptx`. Canva has Inter, Space Grotesk and
JetBrains Mono in its font library, so the fonts carry across. Needs `pptxgenjs`
(`npm i -D pptxgenjs`, or set `PPTXGENJS_MODULE` to an existing install).

Canva can also import the rendered PDF directly if you only need to tweak a word or two.

## Files

| Path | Purpose |
|---|---|
| `brand.css` | Colour tokens, fonts, panels, table and footer styles shared by every document |
| `templates/invoice.js` | Invoice layout as HTML, plus `compute()` for subtotals, discounts, ITBMS, total |
| `data/issuer.json` | Your company block, sign-off and bank accounts. Fill in RUC, phone and real bank numbers |
| `data/invoice.example.json` | One invoice: number, dates, terms, client, line items, notes |
| `assets/page-bg.png` | The page background used by the PowerPoint version |
| `render.mjs` | HTML → PDF via headless Chromium |
| `build-pptx.mjs` | Same data → editable `.pptx` |
| `out/` | Generated files (git-ignored) |

## Invoice data notes

- `banks`: `"all"` prints every account in `issuer.json`; `["Wise"]` prints only the named ones; `[]` hides the block.
- `taxable: true` on a line item applies `taxRate` to it. Exported services usually stay `false`; confirm with your accountant.
- `notes.en` / `notes.es` accept `<b>` and the token `{{number}}`.
- Dates and the billing period are plain strings, so write them the way the client should read them.

## Brand rules baked in

- Page: cool off-white `#fbfbfd` with a faint blue–peach wash behind the header; panels `#f2f4f8`.
- Type: Space Grotesk for titles and names, Inter for body, JetBrains Mono for numbers, dates and labels.
- Labels are bilingual, English first, Spanish second, same weight.
- Colour appears only in the 4px gradient rule, the number chip dot and the "Always on." sign-off.
