# Chefmade Hochzeit — launch-ready static one-pager

Planned live address: **https://hochzeit.chefmade.de/**

**TODO (engineering / CTO):** `https://chefmade.de/wedding` should **301-redirect** to `https://hochzeit.chefmade.de/`. This folder is a static, launch-ready copy of the English wedding page. Do not deploy it without a review.

The working mockup (with placeholders, the Mockup badge, and concept files) is unchanged in `/workspace/wedding-v2/`.

## Preview locally

```bash
cd /workspace/wedding-v2-launch
python3 -m http.server 8767 --bind 127.0.0.1
# open http://127.0.0.1:8767/
```

- Main page: `index.html` (English, hero C with the plating crop, Variant C “Always included” row)
- Pre-filled form, jump to step 2: `/?demo=1`
- Form-only shot: `/?demo=1&shot=form&step=2`
- Full-page screenshot helper: `/?shot=full` (caps the hero height so a tall window does not stretch `100vh`)

## Feature flags

Placeholder blocks stay in the HTML so they can be switched back on later, but visitors never see them until a flag is set to `true` **and** the bracketed copy has been replaced with real text.

The source of truth is `window.FEATURES` in the inline `<head>` script (mirrored at the top of `js/app.js`):

```js
window.FEATURES = {
  reviews: false,     // review marquee
  pricing: false,     // price and guest-range band
  casestudy: false,   // case study article + the quote under Insights
  faq: false,         // whole FAQ (questions without answers looked odd)
  addons: false,      // “Guest favourites” and “Around the venue” rows, plus the form extras chips
  email: false,       // [email] in the CTA and footer
  langtoggle: false   // EN | DE | DA (DE and DA are still unwired placeholders)
}
```

Each block is marked `data-feature="<flag>"` and ships with the `hidden` attribute. A short blocking script at the end of `<body>` un-hides a block only when its flag is `true`. CSS `[data-feature][hidden] { display: none !important; }` is in the `<head>` so flagged blocks never flash, even if a utility `display` rule would otherwise win.

To restore a block later: add the real copy, set the matching flag to `true` in the head script (and keep `js/app.js` reading `window.FEATURES`), then check the page.

The six “Always included” cards keep their real titles (Consultation call, Chef selection, Personalised menu, Tasting, Finest ingredients, Backup plan). Their `[Short description]` body lines are omitted so no brackets show; add descriptions when you have them.

The form stays a **three-step** enquiry (Date & venue → Style & menu wishes → Contact). Optional extras are hidden with `addons`; the preview Extras row stays hidden while that flag is off. The `/dinings/create` handoff with `gclid` / UTM is unchanged.

## gclid / tracking handoff

On landing, `gclid`, `gbraid`, `wbraid` and `utm_*` query params are copied into `localStorage` (`chefmade_wedding_tracking`) so they survive a refresh or a later click.

Submit does **not** navigate anywhere. It builds a URL to `https://chefmade.de/dinings/create` with the stored tracking params plus the form values (`date`, `location`, `guests`, `style`, `tasting`, `wishes`, `name`, `email`, `phone`, `message`, and `extras` when that flag is on) and shows that URL in a dialog.

**TODO (engineering / CTO):** Confirm the query parameter names that `/dinings/create` actually accepts, and whether a cross-subdomain handoff from `https://hochzeit.chefmade.de/` will keep the session and honour these params.

## Copy / design rules used

- **English first** (`html lang="en"`). Informal *you / your*.
- Language toggle is **EN | DE | DA** (EN active) but hidden until `langtoggle` is true. Previous German copy is stored in `js/app.js` (`I18N.de`) and in an HTML comment in `<head>`.
- No “100,000 guests”, no “Michelin-level”, no “<24h”, no Michelin mention.
- No Mockup badge. The footer is `© Chefmade ApS` plus the year.
- The word “Included” is only used for the six confirmed items: Consultation call, Chef selection, Personalised menu, Tasting, Finest ingredients, Backup plan.
- Trust line: `5.00 (Trustpilot) · 100+ vetted chefs` (period).
- Contact: phone and WhatsApp `+49 15510 915140`. No email until a real address is confirmed (`info@chefmade.dk` is wrong for this page).

## What’s on the page

Kept: hero C (venue photo + plated-course crop), benefit tiles, the problem / promise section, the “Always included” row, the Insights photo grid (the placeholder case study and quote are flagged off), how-it-works, the three-step form and handoff, the final CTA, phone / WhatsApp, and the footer.

Hidden behind flags (see above): reviews, price band, case study + quote, FAQ, optional-addon rows and form extras, contact email, language toggle.

## Shots

Launch renders (from this folder, with cards forced visible via `?shot=full`):

- `shots/launch-desktop.png` — full page, 1440 wide
- `shots/launch-mobile.png` — full page, 390 wide (@2x)

## Package

`/workspace/hochzeit-chefmade-v2-launch.tar.gz` contains this folder without `shots/`.

## Staging notes (remove at launch)

This copy is hosted as a **non-indexed staging app** (`chefmade-hochzeit-staging`) on DigitalOcean App Platform. It must not be indexed, and the custom domain `hochzeit.chefmade.de` is not attached yet.

Staging-only changes, **remove before go-live**:

- `<meta name="robots" content="noindex,nofollow">` on every HTML page
- `robots.txt` with `User-agent: *` / `Disallow: /`

The source is a separate GitHub repo (`konrad-del/chefmade-hochzeit`), not the gift-card repo, so a push here cannot rebuild gavekort or gutschein.

Do not attach the live domain, add DNS, or switch on the `/wedding` 301 until Konrad confirms launch.
