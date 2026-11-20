# Chefmade Hochzeit — static one-pager (mockup)

Planned live address: **https://hochzeit.chefmade.de/**

**TODO (engineering / CTO):** `https://chefmade.de/wedding` should **301-redirect** to `https://hochzeit.chefmade.de/`. This folder is a static mockup only — do not deploy it without a review.

## Preview locally

```bash
cd /workspace/wedding-v2
python3 -m http.server 8765
# open http://127.0.0.1:8765/
```

- Option C is now the **main hero** on `index.html` (full-bleed venue photo, English first)
- Option A (toast-photo hero, English, kept as a backup): `hero-a.html`
- Option B (form step 1 in the hero): `hero-b.html` (older German hero concept)
- Option C standalone (older German file, superseded by `index.html`): `hero-c.html`
- Pre-filled form, jump to step 2: `/?demo=1`
- Form-only shot: `/?demo=1&shot=form&step=2`

## gclid / tracking handoff

On landing, `gclid`, `gbraid`, `wbraid` and `utm_*` query params are copied into `localStorage` (`chefmade_wedding_tracking`) so they survive a refresh or a later click.

Submit does **not** navigate anywhere. It builds a URL to `https://chefmade.de/dinings/create` with the stored tracking params plus the form values (`date`, `location`, `guests`, `style`, `tasting`, `wishes`, `name`, `email`, `phone`, `message`) and shows that URL in a dialog.

Direct “Hochzeit anfragen” links (hero option C) also get the stored `gclid` / UTM params appended.

**TODO (engineering / CTO):** Confirm the query parameter names that `/dinings/create` actually accepts, and whether a cross-subdomain handoff from `https://hochzeit.chefmade.de/` will keep the session and honour these params.

## Placeholders still waiting for real values

- Price: `ab [X] € p.P.` and guest range `[20–150]`
- Case study: `[Stadt]`, `[Monat Jahr]`, chef `[Name]`, Format / Gäste / Gänge / Stadt, quote
- Review: `[Zitat]`, `[Name]`
- FAQ answers: `[Antwort]`
- Contact email: `[email]` (current `info@chefmade.dk` is wrong for DE)
- Language toggle: DA is a non-functional placeholder

## Copy / design rules used

- **English first** on `index.html`, `hero-a.html` and `inklusive-c.html` (`html lang="en"`). Informal *you / your*.
- Language toggle: **EN | DE | DA**, with EN active. DE and DA are placeholders only — they are not wired up. Previous German copy is stored in `js/app.js` (`I18N.de`) and in an HTML comment in `<head>`, so a DE version can be restored later. The German trust line keeps `5,00`; English uses `5.00 (Trustpilot) · 100+ vetted chefs` (period).
- No “100,000 guests”, no “Michelin-level”, no “<24h”, no Michelin mention
- Unknown facts stay in `[brackets]`, with English labels where they are labels (e.g. `[Quote]`, `[Name]`, `[City · Month Year]`, `[Answer]`, `[Short description]`, `[email]`, from €`[X]` per person, `[20–150]` guests)
- The word “Included” is only used for the six confirmed items: Consultation call, Chef selection, Personalised menu, Tasting, Finest ingredients, Backup plan
- Small MOCKUP badge in the header


## Inklusive section (Variant C is on the main page)

Konrad approved the editorial **Variant C** strip. `index.html` and `hero-a.html` now use it, in English, in place of the Variant A card rows. The form’s style step is where guests actually choose optional extras; the C section is visual only (Learn more jumps to the form).

Internal design note, not shown on the page: the consultation call is with you from the first enquiry — in the sketch, “Support from day one”, folded into Consultation call, not a separate bullet.

Preview:

- Main page (English, hero C + Variant C): `index.html` or `/?shot=full`
- Variant C section only: `/?shot=inkl`
- Standalone Variant C: `inklusive-c.html?shot=inkl`
- Variant A (older board): `inklusive-a.html?extras=1&shot=inkl`
- Variant B (bento): `inklusive-b.html?extras=1&shot=inkl`


## Inklusive Variant C (editorial rows)

A visual-only concept for the “What’s included?” section. English copy lives on `index.html`, `hero-a.html` and `inklusive-c.html`. It follows the Audemars Piguet “OUR 2026 NOVELTIES” strip: a near-black textured canvas, a thin uppercase headline on the left (second line in light italic), a gold rule + “Mehr erfahren”, and a horizontal row of tall, dark photo tiles that bleeds off the right edge.

Three rows:

1. **ALWAYS / INCLUDED** — the six confirmed items (Consultation call, Chef selection, Personalised menu, Tasting, Finest ingredients, Backup plan).
2. **GUEST / FAVOURITES** — label “Optional”. Placeholders: [Wine pairing], [Oyster station], [Live station], [Dessert table].
3. **AROUND / THE VENUE** — label “Optional”. Placeholders: [Service staff], [Tableware & décor], [Premium venues], [Event styling], [Event photography].

Cards use only Chefmade-owned photos already in `assets/img/` (plus a few additional files copied from `/workspace/wedding/img/`). Tiles are desaturated with a dark gradient so they read as one family. Where no suitable photo exists (Notfall-Absicherung, Austern-Station), the tile is a dark textured field with a thin gold line icon. Descriptions stay as `[Short description]`. No prices. The section is not wired up as a selector.

When a row first enters the viewport, the headline fades and rises, then the cards follow at a 120 ms stagger (600 ms ease-out). `prefers-reduced-motion` shows the finished state immediately. `?shot=inkl` also forces the finished state for screenshots.

Render just this variant (does not overwrite the A/B or full-page shots):

```bash
python3 render.py --c
```

Outputs: `shots/inklusive-c-desktop.png`, `shots/inklusive-c-mobile.png`, `shots/inklusive-c-anim-frames.png`, and `shots/inklusive-c-anim.gif`.

English-first renders (do not overwrite older German A/B shots):

```bash
python3 render.py --en
```

Outputs: `shots/hero-en-desktop.png`, `shots/hero-en-mobile.png`, `shots/full-en-desktop.png`, `shots/full-en-mobile.png`, `shots/inklusive-c-en-desktop.png` (the last is the C section taken from `index.html`).

## Staging notes (remove at launch)

This copy is hosted as a **non-indexed staging app** (`chefmade-hochzeit-staging`) on DigitalOcean App Platform. It must not be indexed, and the custom domain `hochzeit.chefmade.de` is not attached yet.

Staging-only changes, **remove before go-live**:

- `<meta name="robots" content="noindex,nofollow">` on every HTML page
- `robots.txt` with `User-agent: *` / `Disallow: /`

The source is a separate GitHub repo (`konrad-del/chefmade-hochzeit`), not the gift-card repo, so a push here cannot rebuild gavekort or gutschein.

Do not attach the live domain, add DNS, or switch on the `/wedding` 301 until Konrad confirms launch.
