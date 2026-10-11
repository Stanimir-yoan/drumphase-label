# DRUMPHASE — Releases (HTML / CSS / JS)

A responsive record-label catalog with reusable **editable HTML cover typography**, the uploaded demo track, vinyl hover effects, and release details. No build step or framework is required.

## Open the site

Open `index.html` in a browser, or run `python -m http.server 8000` in this directory and visit `http://localhost:8000`.

## Latest changes

- Header brand/logo slightly larger and on the left; `Releases` is the sole active navigation link, aligned to the right with disabled `Artists`, `Events`, `Contacts` placeholders. Search bar removed.
- Artist names have been distributed between **K-LIB**, **NICK**, and **YORD** across the eight sample releases. Track names remain unchanged.
- The uploaded `assets/audio/demotrack.mp3` (~7m 13s) replaces the previous synthetic beat. It is currently the **same demo audio for all releases**; playback position and duration come from the HTML5 audio element.
- A **PURCHASE RELEASE** button appears in each release's detail dialog. It is a checkout-link placeholder until purchase URLs are configured. It does **not** collect payment.

## Editing release data and cover text

Edit the `releases` array at the top of `script.js`:

```js
{ id: 'drmph007-a', catalog: 'DRMPH007', artist: 'K-LIB',
  title: 'Iridescent Loop', date: '2026-02-14',
  cover: 'aural-iridescent-loop.webp', category: 'single',
  purchaseUrl: 'https://YOUR-REAL-STORE-LINK' }
```

- `cover` refers to artwork-only images in `assets/artwork/`; artist and release text are generated as HTML by `coverMarkup()`.
- All covers share `.cover-design__*` rules in `styles.css`; change typography or positions once for every artwork, including the featured player and dialog.
- `purchaseUrl` is **optional**. Without it, clicking Purchase displays “Purchase link coming soon.” Replace the example URL with your actual destination before publishing.
- The flattened originals remain in `assets/covers/` as backup/reference images; only `assets/artwork/` is rendered.
- To supply a different demo recording, replace `assets/audio/demotrack.mp3`. To use separate audio tracks per release, extend the current shared player with per-release audio URLs.

## Site behaviors

- Featured single player with scrubbing, loaded-duration label, and responsive art-derived blurred background.
- All / Singles / Latest / Experimental filtering and sorting.
- Release context menu and modal, deep links (`#release=DRMPH007`), copy-to-clipboard.
- Vinyl rises behind the cover on hover, while the whole wrapper rotates -3° and the sleeve drops 3px.
- Header and featured area extend full width; release grid is centered.
- The site loads Google Fonts when available, with system fallbacks; no bundled font files.

**Prototype note:** The release dates, titles and metadata are illustrative. Verify them and provide real purchase links before publication.
