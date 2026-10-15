# GoHighLevel booking & pipeline system — handoff

Built October 2026. This file is the memory of how the ThryveX Group booking,
confirmation, reminder and sales-pipeline automation is wired, so it can be
maintained or extended without re-discovering it.

## Site routes (this repo, `vercel.json`)

| Route | Purpose |
|---|---|
| `/book` | Booking page. Loads the English discovery calendar. `?lang=es` loads the Spanish one. |
| `/booked` | Shown after a booking (calendar redirect). `?lang=es` for Spanish. Tells the visitor to confirm by email/WhatsApp. |
| `/confirmed` | Shown after the contact clicks the confirm link in the email. `?lang=es` for Spanish. |
| `/propuesta`, `/proposal` | Forward to the Spanish / English proposal-meeting calendars. |
| `/reprogramar/ID`, `/reschedule/ID` | Forward to the GHL reschedule page for appointment `ID` (Spanish / English calendar). |
| `/cancelar/ID`, `/cancel/ID` | Forward to the GHL cancel page for appointment `ID`. |

All forwards are temporary (307) so targets can change without browser caching.

## GHL calendars

| Calendar | ID / slug | Language | Redirect after booking |
|---|---|---|---|
| Llamada de descubrimiento | `Xk4R0IAoI7kfu7iGSHNw` | ES | `/booked?lang=es` |
| ThryveX Group Discovery Call | `GoaSvdUc3KUaJwvNIsMr` | EN | `/booked` |
| Reunión de propuesta | slug `reunion-propuesta` | ES | `/booked?lang=es` |
| Proposal meeting | slug `thryvex-proposal` | EN | `/booked` |

Settings shared by all four: owner Gonzalo Lucas, location Google Meet
(Google Calendar connected under services@thryvexgroup.com), built-in
"Appointment booked (Confirmed)" email **off** (workflows send it instead),
1-day minimum notice. Conflict calendars: the Google account plus the iCloud
"Calendar" on gonzalolpc06@gmail.com.

## Contact data

- Custom field **Language** (key `language`), dropdown: `Español` / `English`.
  Set by the booking-confirmation workflow from which calendar fired.
  Every later message branches on it.
- Tags: `pendiente-confirmacion` (added on booking, removed on confirm),
  `cita-confirmada` (added on confirm, removed after the call), `no-show`,
  `client`, `lost`. The first two are referenced by name in several
  workflows — do not rename them.
- Trigger links (Marketing → Trigger Links): **Confirm call (ES)** →
  `/confirmed`, **Confirm call (EN)** → `/confirmed?lang=en`. Emails use the
  link *key* (`{{trigger_link.…}}`), never the plain URL, so the click is tracked.

## Workflows (Automation)

| Workflow | Trigger | What it does |
|---|---|---|
| Booking confirmation (ES) / (EN) | Appointment booked on the ES / EN discovery **or** proposal calendar | Sets Language, adds `pendiente-confirmacion`, sends confirmation email with the confirm trigger link. Re-entry on. |
| Confirmation received | Trigger link clicked (either language) | Swaps tags, sets appointment status Confirmed, moves pipeline card to **Call confirmed** (previous-stage toggle **off**). |
| Appointment reminder (ES) / (EN) | Same calendars as above | Waits until 1 day before. If `cita-confirmada`: plain reminder. Else: reminder with the confirm link again. 2 h after the call: removes both tags. Re-entry on. |
| Appointment cancelled | Appointment status → Cancelled | Removes contact from both reminder workflows, clears tags. |
| No show | Appointment status → No Show | Adds `no-show`, moves card to **No show**, sends rebook email (`/book?lang=es` or `/book`), clears tags. |
| Pipeline: call booked | Booked on either discovery calendar | Creates/updates the opportunity in **Sales → Call booked** (previous-stage toggle **on**, so a no-show who rebooks comes back). |
| Pipeline: proposal booked | Booked on either proposal calendar | Moves card to **Proposal meeting booked**. |
| Proposal pending | Card moved to **Proposal pending** | Emails the proposal booking link (`/propuesta` or `/proposal`). Used only when the proposal meeting was *not* booked on the call. |
| Won | Card moved to **Won** | Adds `client`, sends welcome email. Edit the three "what happens next" lines to match real onboarding. |
| Lost | Card moved to **Lost** | Adds `lost`, sends a polite close-out with the booking link. |

Email sender for all: `services@thryvexgroup.com` via the verified dedicated
domain `info.thryvexgroup.com`.

## Pipeline: Sales

`Call booked → Call confirmed → No show → Call held → Proposal pending →
Proposal meeting booked → Won → Lost`

Automatic moves: Call booked, Call confirmed, No show, Proposal meeting
booked. Manual moves: Call held, Proposal pending, Won, Lost. If the proposal
meeting is booked during the discovery call, drag the card straight to
Proposal meeting booked and skip Proposal pending.

## Instagram DMs: Conversation AI agent

Instagram is connected (LeadConnector-IG on the thryvexgroup Page, message
access on, only app in Advanced messaging). Inbound DMs land in
Conversations and are answered by a Conversation AI agent.

- Agent: **ThryveX Assistant** (AI Agents → Conversation AI). Model OpenAI
  GPT 4.1, Business Name `ThryveX Group`.
- Mode: Auto-pilot. Deploy tab → Instagram channel assigned to the
  thryvexgroup page, no tag filters. Legacy workflow channels: Instagram
  only.
- Timing: 30 s wait before replying, 75 messages max per conversation.
  Sleeps when a manual message is sent, reactivates after 24 h.
- Prompt (Spanish, ~750 words): identity as "asistente de ThryveX",
  replies in the contact's language, one question per message, no gender
  assumptions, no prices, never describes things by what they are not. Goal
  is the free diagnostic call: ES link `/book?lang=es`, EN link `/book`.
  After the call Gonzalo prepares the proposal and reviews it with the
  client. Hands off to Gonzalo when someone asks for a person, is an
  existing client with an issue, asks about contracts or payments, or gets
  annoyed. Only three reference projects may be mentioned (dive centre
  website, real-estate listing monitor, contract automation platform).
- Examples in the prompt are style references and are marked as such;
  earlier versions copied them verbatim.
- To keep the bot out of existing clients' DMs, add the `client` tag under
  "Doesn't have tags" on the Instagram deploy dialog.

## Open items

1. **WhatsApp** — add-on not activated yet (number issue). When live: create
   the Meta templates (confirmacion_cita / booking_confirmation,
   recordatorio_24h / reminder_24h, recordatorio_1h / reminder_1h, Utility
   category, one per language) and add a *Send WhatsApp* step after each
   email in the confirmation and reminder workflows.
2. **1-hour reminder** — undecided. Would be a second Wait (1 h before) plus
   a message on both branches of each reminder workflow.
3. **Zoom** — replaced by Google Meet (free plan caps Zoom at 40 min). If
   Zoom is wanted again: Zoom Pro, remove LeadConnector in Zoom Marketplace,
   reconnect in Settings → Calendars → Connections, set calendar location.
