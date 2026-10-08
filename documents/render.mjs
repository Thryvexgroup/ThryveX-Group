#!/usr/bin/env node
// Render a document to PDF (+ PNG preview).
//   node documents/render.mjs invoice documents/data/invoice.example.json
// Output: documents/out/<number>.pdf and .png

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const [kind, dataFile] = process.argv.slice(2);
if (!kind || !dataFile) { console.error('usage: render.mjs <invoice> <data.json>'); process.exit(1); }

const issuer = JSON.parse(await readFile(path.join(here, 'data/issuer.json'), 'utf8'));
const data = JSON.parse(await readFile(dataFile, 'utf8'));
const { render } = await import(pathToFileURL(path.join(here, 'templates', `${kind}.js`)));

const outDir = path.join(here, 'out');
await mkdir(outDir, { recursive: true });
const base = path.join(outDir, data.number.replace(/[^\w.-]+/g, '_'));
const html = render(data, issuer, { logo: '../../logo.png', css: '../brand.css' });
await writeFile(`${base}.html`, html);

async function loadPlaywright() {
  const require = createRequire(import.meta.url);
  for (const p of ['playwright', process.env.PLAYWRIGHT_MODULE, '/opt/node22/lib/node_modules/playwright'].filter(Boolean)) {
    try { return require(p); } catch {}
  }
  throw new Error('playwright not found: run `npm i -D playwright` in the repo root');
}
const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(`${base}.html`).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: `${base}.pdf`, format: 'A4', printBackground: true, preferCSSPageSize: true });
await page.screenshot({ path: `${base}.png`, fullPage: true });
await browser.close();
console.log(`wrote ${base}.pdf and .png`);
