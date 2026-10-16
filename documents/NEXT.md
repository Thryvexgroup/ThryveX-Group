# Documents · next steps

_Last updated 2026-10-16._

## Done
- Brand kit for documents (`brand.css`): blend palette, Space Grotesk / Inter / JetBrains Mono, bilingual labels EN first.
- Invoice template (`templates/invoice.js`), PDF renderer (`render.mjs`), Canva-editable PPTX builder (`build-pptx.mjs`).
- Invoice **TXG-2026-001** · SOHBEL Management, S.A. · 600 USD · paid 08/10/2026. Filed on Gonzalo's Mac under
  `Facturas ThryveX Group/Clientes/SOHBEL Management/`.
- Invoice register `Registro de facturas.xlsx` (root of the Mac folder) with the ITBMS B/. 36,000 threshold tracker.
- Mac folder structure (verified 08/10): `Clientes` · `Gastos` · `Plantillas` · `Registro de facturas.xlsx`. Optional: prefix month folders in Gastos with `YYYY-MM` so they sort by date.

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

## Onboarding process (agreed 16/10)
1. Contract: master agreement (Contrato Marco) + one Anexo de Servicio per service · 2. Welcome doc · 3. Invoice ·
4. "What we need from you" doc · 5. Kickoff call · 6. Client portal / project timeline · 7. Fulfilment (Google Drive + portal) ·
8. Monthly reports inside the portal.

## Contract decisions so far
- Master + annexes; each annex references the master by parties and date, annex prevails only for its own service.
- Termination: 60 days' notice both ways. Mid-build cancellation: kill fee, not notice.
- Recurring payments: card-on-file with tokenisation via a Panamanian gateway (PagueloFacil / Banistmo / BAC) plus a
  signed recurring-charge authorisation annex. Research providers when drafting that clause. Direct debit (ACH) later.
- Spanish governing text with English column; e-signature valid (Ley 51/2008, Ley 82/2012); check timbre fiscal with accountant.
- Still needed from Gonzalo: legal representative details, services for first annexes, grace period / late interest /
  suspension day, hosting location after launch, Panamanian lawyer for one review pass.

## Later: client operations system (do not forget)
Gonzalo wants one place that shows, per client: services currently contracted, start date, renewal date, fee,
annex numbers, status (active / notice given / expiring on X / cancelled), plus the client's files (contract, annexes,
invoices, briefs). Must answer "this client has X, Y, Z since DATE" at a glance and track cancellation notices to their
expiry date. Candidates: the client portal itself, a Notion/Airtable base, or a sheet in the repo; decide when we build
the portal (step 6).
