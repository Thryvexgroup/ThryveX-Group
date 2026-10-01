# Panama Dive Center — redesign concept

Static site, no build step. Open `index.html` or deploy the folder anywhere.
Live on the ThryveX Vercel project at `/panama-dive-center/`.

## Concept
The page is a descent. The WebGL ocean behind everything starts at the surface
(sun rays, caustics) and darkens to 40 m by the booking section. The depth
readout in the nav and the line under it are the one signature; everything else
stays quiet. Spanish toggle (EN/ES) is built in and remembered.

## Stack
Plain HTML/CSS/JS. GSAP + ScrollTrigger and Lenis are vendored in `assets/vendor`.
Fonts are self-hosted (Fraunces, Manrope, JetBrains Mono). No external requests.

## Real assets to drop in
- `assets/media/hero.mp4` — 10 to 20 s underwater clip, 1920x1080, muted, under 6 MB.
  It fades in behind the hero automatically and fades out as you scroll.
  Best shots: whale shark passing with sun rays above, school of jacks, whitetip on
  sand, diver silhouette descending. Shoot on the trip with a GoPro at 4K/30, colour
  correct with a red filter or in post.
- Course cards and the trips section are typography-only by design, but a photo
  strip of the boat, the shop and Granito de Oro would slot above "The dive center".

## Facts to confirm with the shop before this goes live
- Prices: 2 dives $155, 3 dives $185, Divemaster $1,680 and Open Water Referral
  $380 come from their Rezdy listings. Discover Scuba $170, Open Water $550 and
  Advanced $550 are from third-party listings and should be confirmed.
- Rescue and Tec prices are shown as "Ask us".
- Itinerary times, group sizes (4:1), safety kit, hours and the shop address are
  written as a strong default and need the owner's sign-off.
- The three guest quotes are marked "Sample" and must be replaced with real
  Tripadvisor reviews. The 5.0 rating is illustrative.
- Social links in the footer point to the platforms' home pages until the real
  profile URLs are known.
- Rezdy product links: day trip 74187, OW referral 202878, Divemaster 56423.

## Pitch note
They are not short of bookings. The sell is: the current site makes them look
like the budget option when they are the 5 Star one. This site sells courses,
Divemaster and the premium day, answers the WhatsApp questions up front, and
works in Spanish. Show it on a phone between dives.
