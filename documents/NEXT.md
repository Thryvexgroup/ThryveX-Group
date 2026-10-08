# Documents · next steps

_Last updated 2026-10-08._

## Done
- Brand kit for documents (`brand.css`): blend palette, Space Grotesk / Inter / JetBrains Mono, bilingual labels EN first.
- Invoice template (`templates/invoice.js`), PDF renderer (`render.mjs`), Canva-editable PPTX builder (`build-pptx.mjs`).
- Invoice **TXG-2026-001** · SOHBEL Management, S.A. · 600 USD · paid 08/10/2026. Filed on Gonzalo's Mac under
  `Facturas ThryveX Group/01 Clientes/SOHBEL Management/`.
- Invoice register `Registro de facturas.xlsx` (root of the Mac folder) with the ITBMS B/. 36,000 threshold tracker.
- Mac folder structure: `01 Clientes` · `02 Gastos` · `03 Plantillas` · `Registro de facturas.xlsx`.

## Tomorrow
1. **Intermediary bank details** — Gonzalo looks them up for the BAC account; add to `data/issuer.json` → `intermediaries[]`
   so the right-hand column of the payment block fills on every new invoice (placeholder text disappears).
2. **Business bank account** — when ready, replace the personal BAC account in `data/issuer.json` → `banks[]`.
3. **Next document** — Gonzalo chooses: **quote / proposal** (reuses the invoice layout) or **onboarding pack**
   (cover, welcome letter, kickoff questionnaire, access checklist, four-phase timeline). For the onboarding pack,
   start from a rough description of what is sent to a new client today.
4. Optional: "Paid · date" chip beside the invoice number for paid invoices (status already switches the totals label).

## Routine for each new invoice
- Gonzalo sends: client (legal name, RUC/VAT, address, e-mail, phone), line items with amounts, dates, whether paid.
- Claude renders the PDF, names it `YYYY-MM-DD - TXG-YYYY-NNN - Client - Amount USD.pdf`, and gives the register row.
- Next number: **TXG-2026-002**.
