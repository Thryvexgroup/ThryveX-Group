# Waild — safari agency website (demo rebuild)

A from-scratch rebuild of the Waild travel site design, delivered as a single
self-contained `index.html`. No build step, no framework, no dependencies.

## Run it locally

```bash
cd waild-safari
python3 -m http.server 8000
# open http://localhost:8000
```

Or just double-click `index.html`. It works offline: every photo has a painted
fallback scene underneath it.

## What's in it

- Home page: header with EN/ES toggle, hero, marquee band, the W·A·I·L·D
  acronym section, "You are in good hands", the three Stars / Moons / Together
  cards, Waild Moon notice, destinations carousel, Keep It Waild, photo band,
  "The wild is calling", footer.
- Waild Stars (private trips), Waild Moons (honeymoons) and Waild Together
  (group trips) pages, built on one shared template. Navigation is hash-routed:
  `#home`, `#stars`, `#moons`, `#together`, `#destinations`, `#about`, `#plan`.
- Responsive down to phone width, with a MENU toggle.

## Swapping in real photos

Four CSS variables at the top of the file control the photography:

```css
--photo-hero, --photo-elephant, --photo-savanna, --photo-beach
```

Point them at local files (for example `url("assets/hero.jpg")`) and the
illustrated fallbacks disappear behind them automatically.

Everything else (logo, emblems, destination animals, grass) is inline SVG and
can be replaced with the client's own artwork.
