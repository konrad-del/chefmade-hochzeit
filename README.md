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

- Main page: `index.html` (English, Option C full-bleed hero, reviews carousel directly under it, Variant C “What’s included” with three stacked rows)
- Hero + reviews shot: `/?shot=top` (pauses the marquee; caps the hero to the original 1440×900 fold height)
- Pre-filled form, jump to step 2: `/?demo=1`
- Form-only shot: `/?demo=1&shot=form&step=2`
- Full-page screenshot helper: `/?shot=full` (caps the hero height so a tall window does not stretch `100vh`)
- “What’s included” section only: `/?shot=inkl` (forces the cards into their visible state)
- Case study section only, forced on: `/?shot=case`

## Feature flags

Placeholder blocks stay in the HTML so they can be switched back on later, but visitors never see them until a flag is set to `true` **and** the bracketed copy has been replaced with real text.

The source of truth is `window.FEATURES` in the inline `<head>` script (mirrored at the top of `js/app.js`):

```js
window.FEATURES = {
  reviews: true,      // review marquee directly under the hero
  pricing: false,     // price and guest-range band
  casestudy: false,   // “One wedding, start to finish” bento (chef, couple, menu, price). Off: Insights photo mosaic only.
  faq: false,         // whole FAQ (questions without answers looked odd)
  addons: false,      // form extras chips only (no prices, no selectable placeholders)
  addonrows: true,    // “Guest favourites” and “Around the venue” rows in What’s included (staging)
  email: false,       // [email] in the CTA and footer
  langtoggle: false,  // EN | DE | DA (DE and DA are still unwired placeholders)
  stagingPlaceholders: true  // allow bracketed placeholder copy on staging
}
```

`reviews` is on for **staging only**, with six clearly bracketed placeholder cards (`[Quote]`, `[Name]`, `[City · Month Year]`). `stagingPlaceholders` is also on. **Before a public launch, put real reviews in or set `reviews` to `false`.** The same applies to any other block that still uses bracketed copy (`addonrows`, and `casestudy` when that flag is turned on).

A live-hostname guard in the head script sets `stagingPlaceholders` to `false` and adds `html.hide-placeholders` whenever `location.hostname === 'hochzeit.chefmade.de'`. Elements marked `data-placeholder` (the review cards, the Guest favourites / Around the venue rows, and the case-study story cards) are then hidden with CSS before first paint, even if the feature flags are left on by mistake.

`addonrows` is on for **staging only**. Rows 2 and 3 still use bracketed titles because Konrad has not confirmed that list. **Replace those brackets with signed-off copy, or set `addonrows` back to `false`, before a real public launch.** The form’s extras chips stay on `addons: false` and are not a selector.

`casestudy` stays **false**. With the flag off, `#einblicke` keeps only the “Insights / A look at the result” heading and the existing photo mosaic — that looked cleaner than hiding the whole section. Turn the flag on once a real wedding is filled in (the bento still uses bracketed placeholders). Do not set `data-michelin="true"` unless that restaurant really holds a Michelin star. A second chef (`[Chef name 2]`) is hidden by default.

Each block is marked `data-feature="<flag>"` and ships with the `hidden` attribute. A short blocking script at the end of `<body>` un-hides a block only when its flag is `true`. CSS `[data-feature][hidden] { display: none !important; }` is in the `<head>` so flagged blocks never flash, even if a utility `display` rule would otherwise win.

To restore a block later: add the real copy, set the matching flag to `true` in the head script (and keep `js/app.js` reading `window.FEATURES`), then check the page.

The six “Always included” cards keep their real titles (Consultation call, Chef selection, Personalised menu, Tasting, Finest ingredients, Backup plan). Rows 2 and 3 use the same card design, stagger reveal and horizontal scroll, with the same photos and gold icon tiles as the mockup, and no prices. All `[Short description]` body lines are omitted so the three rows match; add descriptions when you have them.

The form stays a **three-step** enquiry (Date & venue → Style & menu wishes → Contact). Optional extras in the form are hidden with `addons`; the preview Extras row stays hidden while that flag is off. The `/dinings/create` handoff with `gclid` / UTM is unchanged.

## gclid / tracking handoff

On landing, `gclid`, `gbraid`, `wbraid` and `utm_*` query params are copied into `localStorage` (`chefmade_wedding_tracking`) so they survive a refresh or a later click.

Submit does **not** navigate anywhere. It builds a URL to `https://chefmade.de/dinings/create` with the stored tracking params plus the form values (`date`, `location`, `guests`, `style`, `tasting`, `wishes`, `name`, `email`, `phone`, `message`, and `extras` when that flag is on) and shows that URL in a dialog.

**TODO (engineering / CTO):** Confirm the query parameter names that `/dinings/create` actually accepts, and whether a cross-subdomain handoff from `https://hochzeit.chefmade.de/` will keep the session and honour these params.

## Copy / design rules used

- **English first** (`html lang="en"`). Informal *you / your*.
- Language toggle is **EN | DE | DA** (EN active) but hidden until `langtoggle` is true. It is not wired up. Section strings for “What’s included” live in `js/app.js`: English in `I18N.en`, German in `I18N.de` (IMMER / INKLUSIVE, GÄSTE- / LIEBLINGE, RUND UM / DIE LOCATION, Optional, Mehr erfahren, and the item titles). Case-study strings are in the same objects (e.g. DE: “Eine Hochzeit von A bis Z”, “Menü”, “Preis”, “pro Person”, “Gäste”). `I18N.da` uses `[DA]` placeholders only — no Danish copy was invented.
- No “100,000 guests”, no “Michelin-level”, no “<24h”, no Michelin mention.
- No Mockup badge. The footer is `© Chefmade ApS` plus the year.
- The word “Included” is only used for the six confirmed items: Consultation call, Chef selection, Personalised menu, Tasting, Finest ingredients, Backup plan.
- Trust line: `5.00 (Trustpilot) · 100+ vetted chefs` (period).
- Contact: phone and WhatsApp `+49 15510 915140`. No email until a real address is confirmed (`info@chefmade.dk` is wrong for this page).

## What’s on the page

Kept: Option C hero (full-bleed `wedding-plan.webp`, no plating frame, gold-rule photo caption), the reviews carousel directly under the hero, the three benefit tiles (moved to sit just before How it works — not merged into the problem/promise section, because that already covers a transparent price, menus and allergies, and putting the tiles there would have meant dropping or rewriting copy), the problem / promise section, the three-row “What’s included” strip (Always included, plus Guest favourites and Around the venue via `addonrows`), the Insights photo mosaic (the case-study bento stays behind `casestudy`), how-it-works, the three-step form and handoff, the final CTA, phone / WhatsApp, and the footer.

Hidden behind flags (see above): price band, the case-study story cards and “One wedding, start to finish” heading (`casestudy`), FAQ, form extras (`addons`), contact email, language toggle.

## Shots

Renders from this folder:

- `shots/top-desktop.png` — hero plus the full reviews carousel, 1440×~1300 (`?shot=top`)
- `shots/top-mobile.png` — hero plus the carousel, 390 wide (`?shot=top`)
- `shots/hero-compare.png` — original Option C hero (`hero-c.html`) on the left, the new English hero on the right

## Package

`/workspace/hochzeit-chefmade-v2-launch.tar.gz` contains this folder without `shots/`.
## Staging notes (remove at launch)

This copy is hosted as a **non-indexed staging app** (`chefmade-hochzeit-staging`) on DigitalOcean App Platform. It must not be indexed, and the custom domain `hochzeit.chefmade.de` is not attached yet.

Staging-only changes, **remove before go-live**:

- `<meta name="robots" content="noindex,nofollow">` on every HTML page
- `robots.txt` with `User-agent: *` / `Disallow: /`

The source is a separate GitHub repo (`konrad-del/chefmade-hochzeit`), not the gift-card repo, so a push here cannot rebuild gavekort or gutschein.

Do not attach the live domain, add DNS, or switch on the `/wedding` 301 until Konrad confirms launch.
