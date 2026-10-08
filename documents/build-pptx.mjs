#!/usr/bin/env node
// Build the editable (Canva / PowerPoint / Keynote) version of the invoice.
//   node documents/build-pptx.mjs documents/data/invoice.example.json
// Output: documents/out/<number>.pptx  (A4 portrait, one slide, all text editable)

import { readFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const pptxgen = (() => { for (const p of ['pptxgenjs', process.env.PPTXGENJS_MODULE].filter(Boolean)) { try { return require(p); } catch {} } throw new Error('pptxgenjs not found'); })();
const here = path.dirname(fileURLToPath(import.meta.url));
const dataFile = process.argv[2] ?? path.join(here, 'data/invoice.example.json');
const bgFile = process.argv[3] ?? path.join(here, 'assets/page-bg.png');
const issuer = JSON.parse(await readFile(path.join(here, 'data/issuer.json'), 'utf8'));
const inv = JSON.parse(await readFile(dataFile, 'utf8'));
const { compute } = await import('./templates/invoice.js');
const t = compute(inv);

const money = n => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const strip = s => String(s).replace(/<[^>]+>/g, '').replace(/\{\{number\}\}/g, inv.number);

// palette (hex, no #) — mirrors brand.css
const INK = '11131A', GREY = '6B7180', MUTE = '9AA1AD', ACC = '3F9FE6', PANEL = 'F2F4F8', LINE = 'E3E7EE', LINE2 = 'D4DAE4', WHITE = 'FFFFFF';
const HEAD = 'Space Grotesk', BODY = 'Inter', MONO = 'JetBrains Mono';

const pres = new pptxgen();
pres.defineLayout({ name: 'A4P', width: 8.27, height: 11.69 });
pres.layout = 'A4P';
pres.author = issuer.name; pres.title = `Invoice ${inv.number}`;
const s = pres.addSlide();
s.background = { path: bgFile };

const M = 0.5, W = 8.27 - 2 * M, R = 8.27 - M;   // margins / content width / right edge
const px = n => n / 96;                           // CSS px → inches

// --- helpers -------------------------------------------------------------
const text = (str, o) => s.addText(str, { isTextBox: true, margin: 0, fontFace: BODY, color: INK, valign: 'top', ...o });
const label = (en, es, o) => text([
  { text: en.toUpperCase(), options: { color: GREY } },
  ...(es ? [{ text: '  /  ', options: { color: MUTE } }, { text: es.toUpperCase(), options: { color: GREY } }] : []),
], { fontFace: MONO, fontSize: 7, charSpacing: 1.5, ...o });
const hline = (y, x = M, w = W, color = LINE, size = 0.75) => s.addShape(pres.ShapeType.line, { x, y, w, h: 0, line: { color, width: size } });
const panel = (x, y, w, h, o = {}) => s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.12, fill: { color: PANEL }, line: { color: PANEL, width: 0 }, ...o });
const kv = (x, y, rows, labelW = 1.45, valueW = 1.75, measure = false) => {
  let cy = y;
  rows.forEach(([k, v, mono]) => {
    const [en, es] = k.split(' / ');
    const cpl = Math.max(10, Math.floor(valueW * 72 / (mono ? 4.6 : 4.1)));   // chars per line at 7.5–8pt
    const lines = Math.max(1, Math.ceil(String(v).length / cpl));
    const h = lines * 0.16 + 0.07;
    if (!measure) {
      text([{ text: en, options: { color: MUTE } }, ...(es ? [{ text: ' / ', options: { color: LINE2 } }, { text: es, options: { color: MUTE } }] : [])], { x, y: cy, w: labelW, h: 0.24, fontSize: 7.5 });
      text(String(v), { x: x + labelW, y: cy, w: valueW, h, fontSize: mono ? 7.5 : 8, fontFace: mono ? MONO : BODY, lineSpacingMultiple: 1.1 });
    }
    cy += h;
  });
  return cy - y;
};

// --- letterhead -----------------------------------------------------------
s.addImage({ path: path.join(here, '..', 'logo.png'), x: M, y: 0.46, h: 0.44, w: 0.5 });
text(issuer.name, { x: M + 0.6, y: 0.44, w: 3.5, h: 0.26, fontFace: HEAD, fontSize: 12.5, bold: true });
text(issuer.tagline, { x: M + 0.6, y: 0.69, w: 3.5, h: 0.2, fontSize: 8, color: GREY });
text([{ text: 'Invoice', options: { bold: true, color: INK } }, { text: '  Factura', options: { color: GREY } }], { x: 3.5, y: 0.4, w: W - 3.0, h: 0.4, fontFace: HEAD, fontSize: 23, align: 'right' });
// number chip
const chipW = 1.9, chipH = 0.28, chipX = R - chipW, chipY = 0.95;
s.addShape(pres.ShapeType.roundRect, { x: chipX, y: chipY, w: chipW, h: chipH, rectRadius: 0.14, fill: { color: WHITE }, line: { color: LINE, width: 0.75 } });
s.addShape(pres.ShapeType.ellipse, { x: chipX + 0.14, y: chipY + 0.1, w: 0.08, h: 0.08, fill: { color: ACC }, line: { color: ACC, width: 0 } });
text([{ text: 'No.  ', options: { color: GREY } }, { text: inv.number, options: { color: INK } }], { x: chipX + 0.28, y: chipY, w: chipW - 0.32, h: chipH, fontFace: MONO, fontSize: 7.5, charSpacing: 1, valign: 'middle' });

// --- meta row --------------------------------------------------------------
let y = 1.55; hline(y, M, W, LINE2);
const cols = [[0, 1.55], [1.62, 1.62], [3.3, 1.7], [5.05, 2.22]];
const meta = [['Issued', 'Fecha de emisión', inv.issued, MONO], ['Due', 'Fecha de vencimiento', inv.due, MONO], ['Terms', 'Condición de pago', inv.terms, HEAD], ['Billing period', 'Periodo de facturación', typeof inv.period === 'string' ? inv.period : inv.period ? `${inv.period.from}  →  ${inv.period.to}` : '—', typeof inv.period === 'string' ? HEAD : MONO]];
meta.forEach(([en, es, v, f], i) => {
  const [cx, cw] = cols[i];
  label(en, es, { x: M + cx, y: y + 0.12, w: cw, h: 0.16, fontSize: 6.5, charSpacing: 0 });
  text(v, { x: M + cx, y: y + 0.3, w: cw, h: 0.22, fontFace: f, fontSize: f === MONO ? 9 : 9.5, bold: f === HEAD });
});
y += 0.68; hline(y, M, W, LINE2);

// --- parties ---------------------------------------------------------------
y += 0.18;
const pw = (W - 0.12) / 2;
const prow = p => [['Legal name / Razón social', p.legalName || p.name], ['VAT no. / RUC', p.vat, true], ['Address / Dirección', p.address], ['Phone / Teléfono', p.phone, true], ['E-mail', p.email]].filter(r => r[1]);
const pvw = pw - 0.34 - 1.45;
const ph = 0.64 + Math.max(kv(0, 0, prow(issuer), 1.45, pvw, true), kv(0, 0, prow(inv.client), 1.45, pvw, true)) + 0.06;
const party = (x, en, es, p) => {
  panel(x, y, pw, ph);
  label(en, es, { x: x + 0.17, y: y + 0.14, w: pw - 0.3, h: 0.16 });
  text(p.name, { x: x + 0.17, y: y + 0.36, w: pw - 0.3, h: 0.22, fontFace: HEAD, fontSize: 10, bold: true });
  kv(x + 0.17, y + 0.64, prow(p), 1.45, pvw);
};
party(M, 'From', 'Datos del emisor', issuer);
party(M + pw + 0.12, 'Bill to', 'Datos del cliente', inv.client);
y += ph + 0.22;

// --- items table -------------------------------------------------------------
const C = { item: [0, 0.3], unit: [0.3, 0.4], desc: [0.72, 2.78], qty: [3.55, 0.4], price: [3.98, 0.78], sub: [4.78, 0.76], disc: [5.56, 0.52], tax: [6.1, 0.52], total: [6.65, 0.62] };
const th = (k, en, es, right, extra = 0) => { const [cx0, cw0] = C[k]; const cx = cx0 - extra, cw = cw0 + extra; text([{ text: en.toUpperCase(), options: { color: GREY } }, { text: '\n' + es.toUpperCase(), options: { color: MUTE } }], { x: M + cx, y, w: cw, h: 0.3, fontFace: MONO, fontSize: 6, charSpacing: 0.5, align: right ? 'right' : 'left', valign: 'bottom' }); };
th('item', 'Item', 'Ítem'); th('unit', 'Unit', 'UM'); th('desc', 'Description', 'Descripción'); th('qty', 'Qty', 'Cant.', 1); th('price', 'Unit price', 'V. unitario', 1); th('sub', 'Subtotal', 'Subtotal', 1); th('disc', 'Discount', 'Desc.', 1); th('tax', inv.taxLabel, inv.taxLabel, 1); th('total', 'Total', 'Valor total', 1, 0.4);
y += 0.34; hline(y, M, W, INK, 0.75);
t.rows.forEach(r => {
  const rh = r.detail ? 0.5 : 0.36; y += 0.1;
  const cell = (k, v, o = {}) => { const [cx, cw] = C[k]; text(v, { x: M + cx, y, w: cw, h: 0.18, fontFace: MONO, fontSize: 8, ...o }); };
  cell('item', r.n, { color: MUTE }); cell('unit', r.unit || '', { color: MUTE });
  text(r.title, { x: M + C.desc[0], y, w: C.desc[1], h: 0.18, fontSize: 8.5, bold: true });
  if (r.detail) text(r.detail, { x: M + C.desc[0], y: y + 0.18, w: C.desc[1], h: 0.18, fontSize: 7.5, color: GREY });
  cell('qty', String(r.qty), { align: 'right' }); cell('price', money(r.price), { align: 'right' }); cell('sub', money(r.sub), { align: 'right' });
  cell('disc', money(r.disc), { align: 'right', color: r.disc ? INK : MUTE }); cell('tax', money(r.tax), { align: 'right', color: r.tax ? INK : MUTE });
  cell('total', money(r.total), { align: 'right', bold: true });
  y += rh; hline(y);
});

// --- notes + totals ---------------------------------------------------------
y += 0.16;
const tw = 2.85, nw = W - tw - 0.16, bh = 1.5;
panel(M, y, nw, bh);
label('Notes', 'Observaciones adicionales', { x: M + 0.17, y: y + 0.14, w: nw - 0.3, h: 0.16 });
const notes = [inv.notes?.en, inv.notes?.es].filter(Boolean).map(strip);
text(notes.map((n, i) => ({ text: n, options: { breakLine: i < notes.length - 1, paraSpaceAfter: 5 } })), { x: M + 0.17, y: y + 0.38, w: nw - 0.34, h: bh - 0.5, fontSize: 7.8, color: GREY, lineSpacingMultiple: 1.25 });
const tx = R - tw;
s.addShape(pres.ShapeType.roundRect, { x: tx, y, w: tw, h: bh, rectRadius: 0.12, fill: { color: WHITE }, line: { color: LINE, width: 0.75 } });
[['Subtotal', t.subtotal], ['Discount / Descuento', t.discount], [inv.taxLabel, t.tax]].forEach(([k, v], i) => {
  const ry = y + 0.16 + i * 0.26;
  text(k, { x: tx + 0.17, y: ry, w: 1.6, h: 0.2, fontSize: 8.5, color: GREY });
  text(money(v), { x: tx + tw - 1.3 - 0.17, y: ry, w: 1.3, h: 0.2, fontFace: MONO, fontSize: 8.5, align: 'right' });
});
hline(y + 0.94, tx + 0.17, tw - 0.34, INK);
text(inv.status === 'paid' ? 'Total paid' : 'Total due', { x: tx + 0.17, y: y + 1.06, w: 0.9, h: 0.2, fontFace: HEAD, fontSize: 9, bold: true });
label(inv.status === 'paid' ? 'Total pagado' : 'Total a pagar', '', { x: tx + 0.17, y: y + 1.28, w: 0.9, h: 0.16, fontSize: 6.5, charSpacing: 0.5 });
text([{ text: money(t.total), options: { fontFace: HEAD, fontSize: 17, bold: true } }, { text: '  ' + inv.currency, options: { fontSize: 7, color: GREY } }], { x: tx + 1.05, y: y + 1.02, w: tw - 1.22, h: 0.4, align: 'right', valign: 'middle', fit: 'shrink' });
y += bh + 0.12;

// --- payment details ----------------------------------------------------------
const pickB = list => inv.banks === 'all' ? list : Array.isArray(inv.banks) ? list.filter(b => inv.banks.includes(b.name)) : [];
const banks = [...pickB(issuer.banks || []), ...pickB(issuer.intermediaries || [])];
if (banks.length) {
  const cw = (W - 0.34) / banks.length, bvw = cw - 0.3 - 1.45;
  const bhh = 0.7 + Math.max(...banks.map(b => kv(0, 0, b.fields, 1.45, bvw, true))) + 0.06;
  panel(M, y, W, bhh);
  label('Payment details', 'Medios de pago', { x: M + 0.17, y: y + 0.14, w: 3.5, h: 0.16 });
  label(`Bank transfer · ${inv.currency.split(' ')[0]}`, '', { x: R - 3.0 - 0.17, y: y + 0.14, w: 3.0, h: 0.16, align: 'right', fontSize: 6.5 });
  banks.forEach((b, i) => {
    const bx = M + 0.17 + i * cw + (i ? 0.25 : 0);
    if (i) s.addShape(pres.ShapeType.line, { x: M + 0.17 + i * cw, y: y + 0.42, w: 0, h: bhh - 0.58, line: { color: LINE2, width: 0.75 } });
    text([{ text: b.name, options: { fontFace: HEAD, bold: true, fontSize: 9 } }, { text: '   ' + (b.tag || '').toUpperCase(), options: { fontFace: MONO, fontSize: 6.5, color: MUTE, charSpacing: 1 } }], { x: bx, y: y + 0.42, w: cw - 0.3, h: 0.2 });
    kv(bx, y + 0.7, b.fields, 1.45, bvw);
  });
}

// --- footer -----------------------------------------------------------------------
const fy = 11.69 - 0.36 - 0.3; hline(fy, M, W);
text([{ text: `${issuer.name} · ${issuer.city} · ${issuer.web} · ${issuer.email} · ` }, { text: issuer.signoff, options: { color: ACC, bold: true } }], { x: M, y: fy + 0.08, w: 5.5, h: 0.2, fontSize: 7.5, color: MUTE });
text(`INVOICE ${inv.number} · 1 / 1`, { x: R - 2.5, y: fy + 0.08, w: 2.5, h: 0.2, fontFace: MONO, fontSize: 7.5, color: MUTE, align: 'right', charSpacing: 1 });

await mkdir(path.join(here, 'out'), { recursive: true });
const out = path.join(here, 'out', `${inv.number.replace(/[^\w.-]+/g, '_')}.pptx`);
await pres.writeFile({ fileName: out });
console.log('wrote', out);
