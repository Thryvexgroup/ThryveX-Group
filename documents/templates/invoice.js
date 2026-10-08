// Invoice template · returns a full HTML document for one invoice.
// Data shape: see ../data/invoice.example.json and ../data/issuer.json

const esc = (s = '') => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const money = n => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function compute(inv) {
  const rows = inv.items.map((it, i) => {
    const sub = it.qty * it.price;
    const disc = it.discount || 0;
    const tax = it.taxable ? (sub - disc) * (inv.taxRate ?? 0) : 0;
    return { ...it, n: String(i + 1).padStart(2, '0'), sub, disc, tax, total: sub - disc + tax };
  });
  const sum = k => rows.reduce((a, r) => a + r[k], 0);
  return { rows, subtotal: sum('sub'), discount: sum('disc'), tax: sum('tax'), total: sum('total') };
}

const fields = list => list.map(([k, v, cls]) => {
  const label = k.includes(' / ') ? k.replace(' / ', ' <i>/</i> ') : k;
  return `<span>${label}</span><span${cls ? ` class="${cls}"` : ''}>${esc(v)}</span>`;
}).join('');

export function render(inv, issuer, { logo = '../../logo.png', css = '../brand.css' } = {}) {
  const t = compute(inv);
  const party = (ey, p) => `
  <div class="panel"><div class="ey">${ey}</div><div class="who">${esc(p.name)}</div>
   <div class="f">${fields([
     ['Legal name / Razón social', p.legalName || p.name],
     ['VAT no. / RUC', p.vat, 'm'],
     ['Address / Dirección', p.address],
     ['Phone / Teléfono', p.phone, 'm'],
     ['E-mail', p.email],
   ].filter(f => f[1]))}</div></div>`;

  const pick = list => inv.banks === 'all' ? list : Array.isArray(inv.banks) ? list.filter(b => inv.banks.includes(b.name)) : [];
  const banks = pick(issuer.banks || []), inters = pick(issuer.intermediaries || []);

  const rows = t.rows.map(r => `
   <tr><td class="n">${r.n}</td><td class="n">${esc(r.unit || '')}</td>
    <td><div class="t">${esc(r.title)}</div>${r.detail ? `<div class="d">${esc(r.detail)}</div>` : ''}</td>
    <td class="r">${r.qty}</td><td class="r">${money(r.price)}</td><td class="r">${money(r.sub)}</td>
    <td class="r${r.disc ? '' : ' mt'}">${money(r.disc)}</td><td class="r${r.tax ? '' : ' mt'}">${money(r.tax)}</td>
    <td class="r tt">${money(r.total)}</td></tr>`).join('');

  const note = s => (s || '').replace(/\{\{number\}\}/g, esc(inv.number));

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Invoice ${esc(inv.number)} · ${esc(issuer.name)}</title>
<link rel="stylesheet" href="${css}"></head><body>
<div class="page">
 <div class="top">
  <div class="brand"><img src="${logo}" alt=""><div><div class="name">${esc(issuer.name)}</div><div class="sub">${esc(issuer.tagline)}</div></div></div>
  <div class="title"><h1>Invoice<span>Factura</span></h1>
   <div class="chips"><span class="chip"><i></i>No. <b>${esc(inv.number)}</b></span></div></div>
 </div>

 <div class="meta"><div class="rw">
  <div><div class="ey">Issued <i>/</i> Fecha de emisión</div><div class="v m">${esc(inv.issued)}</div></div>
  <div><div class="ey">Due <i>/</i> Fecha de vencimiento</div><div class="v m">${esc(inv.due)}</div></div>
  <div><div class="ey">Terms <i>/</i> Condición de pago</div><div class="v">${esc(inv.terms)}</div></div>
  <div><div class="ey">Billing period <i>/</i> Periodo de facturación</div><div class="v${typeof inv.period === 'string' ? '' : ' m'}">${typeof inv.period === 'string' ? esc(inv.period) : inv.period ? `${esc(inv.period.from)} <span class="dash">→</span> ${esc(inv.period.to)}` : '—'}</div></div>
 </div></div>

 <div class="parties">
  ${party('From <i>/</i> Datos del emisor', issuer)}
  ${party('Bill to <i>/</i> Datos del cliente', inv.client)}
 </div>

 <table>
  <colgroup><col style="width:26px"><col style="width:36px"><col><col style="width:40px"><col style="width:76px"><col style="width:74px"><col style="width:58px"><col style="width:64px"><col style="width:78px"></colgroup>
  <thead><tr><th>Item<em>Ítem</em></th><th>Unit<em>UM</em></th><th>Description<em>Descripción</em></th><th class="r">Qty<em>Cant.</em></th><th class="r">Unit price<em>V. unitario</em></th><th class="r">Subtotal<em>Subtotal</em></th><th class="r">Discount<em>Desc.</em></th><th class="r">${esc(inv.taxLabel)}<em>${esc(inv.taxLabel)}</em></th><th class="r">Total<em>Valor total</em></th></tr></thead>
  <tbody>${rows}
  </tbody>
 </table>

 <div class="sum">
  <div class="obs"><div class="ey">Notes <i>/</i> Observaciones adicionales</div>
   ${inv.notes?.en ? `<p>${note(inv.notes.en)}</p>` : ''}
   ${inv.notes?.es ? `<p style="margin-top:8px">${note(inv.notes.es)}</p>` : ''}</div>
  <div class="tot">
   <div class="row"><span>Subtotal</span><span class="n">${money(t.subtotal)}</span></div>
   <div class="row"><span>Discount <i>/</i> Descuento</span><span class="n">${money(t.discount)}</span></div>
   <div class="row"><span>${esc(inv.taxLabel)}</span><span class="n">${money(t.tax)}</span></div>
   <div class="due"><span class="l">Total due<small>Total a pagar</small></span><span class="n">${money(t.total)}<small>${esc(inv.currency)}</small></span></div>
  </div>
 </div>

 ${banks.length ? `<div class="pay">
  <div class="hd"><div class="ey">Payment details <i>/</i> Medios de pago</div><span class="tag">Bank transfer · ${esc(inv.currency.split(' ')[0])}</span></div>
  <div class="cols">
   <div><div class="ey" style="margin-bottom:8px">Beneficiary bank <i>/</i> Banco beneficiario</div>
    ${banks.map(b => `<div class="bk">${esc(b.name)}<small>${esc(b.tag || '')}</small></div><div class="f">${fields(b.fields)}</div>`).join('\n    ')}</div>
   <div><div class="ey" style="margin-bottom:8px">Intermediary bank <i>/</i> Banco intermediario</div>
    ${inters.length
      ? inters.map(b => `<div class="bk">${esc(b.name)}<small>${esc(b.tag || '')}</small></div><div class="f">${fields(b.fields)}</div>`).join('\n    ')
      : `<p class="ph">${esc(issuer.intermediaryPlaceholder?.en || '')}</p><p class="ph">${esc(issuer.intermediaryPlaceholder?.es || '')}</p>`}</div>
  </div>
 </div>` : ''}

 <div class="foot"><span>${esc(issuer.name)} · ${esc(issuer.city)} · ${esc(issuer.web)} · ${esc(issuer.email)} · <span class="gw">${esc(issuer.signoff)}</span></span><span class="m">INVOICE ${esc(inv.number)} · 1 / 1</span></div>
</div>
</body></html>`;
}
