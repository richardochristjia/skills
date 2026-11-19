# Hero recipes

polish-ui picks one recipe after the before shots and states it in one line with why. Every pass reads its targets from it. Limits are measured on the 1440 shot. Cards and panels follow `<taste>/references/layout-v4.md`.

## Pick rule

- A strong, large photo: recipe 1.
- A photo that must keep its edges: recipe 2.
- No real photo: recipe 3 or 5.
- Software page: recipe 4, even with a large photo.

## 1. Full-bleed photo

- **When:** the page has a strong, large photo.
- **Targets:** the photo covers the hero, at least the first screen's height at 1440. A dark gradient overlay for contrast. White headline, at most 3 lines and 8 words, anchored bottom-left. Body at most 20 words. One small call to action. The nav is light over the photo. No box, radius or shadow on the image.
- **Per pass:** Declutter drops the badge, second CTA and extra nav items. Spacing puts the text block on the scale. Copy cuts to the word limits. Alignment sets the headline, body and CTA on one left edge shared with the nav logo. Font and Font size follow the usual rules, h1 on the scale. Imagery turns the boxed image into the full-bleed photo with the overlay.
- **Moments:** image reveal on load, a nav dropdown with photos, an arrow shift on the CTA.

## 2. Editorial split

- **When:** the photo must keep its edges (a portrait, a product shot).
- **Targets:** text column on the left, the photo runs to the right page edge with no box, radius or shadow. Headline at most 3 lines. One CTA.
- **Per pass:** Imagery removes the card around the photo and extends it to the right edge. Alignment sets the text column on the nav's left edge.
- **Moments:** image reveal on load, a CTA arrow shift.

## 3. Type-led statement

- **When:** no real photo, no product UI.
- **Targets:** one large statement of at most 8 words, one CTA, no image box.
- **Per pass:** Imagery removes decorative pictures and gradient boxes. Alignment anchors the statement to the nav's left edge.
- **Moments:** a headline entrance, a CTA arrow shift.

## 4. Product frame

- **When:** a software page.
- **Targets:** headline at most 3 lines, one CTA, a product UI on a panel as taste's cards rules describe.
- **Per pass:** Imagery replaces stock art with the product UI on one panel. Alignment shares the left edge with the nav.
- **Moments:** a panel entrance, a CTA arrow shift.

## 5. Photo band

- **When:** no photo for the first screen, but one that works as a band.
- **Targets:** full-width headline of at most 3 lines, one CTA, then a full-width photo band directly under it with no box.
- **Per pass:** Imagery turns the picture into the band. Alignment puts the headline on the nav's left edge.
- **Moments:** band reveal on scroll, a CTA arrow shift.

# Page recipes

polish-ui names the page type after the before shots, from what the main content holds, and states it in one line with why. A page recipe adds section order, targets and tells on top of the hero recipe it names (the hero recipe is picked by the pick rule above, or fixed here). Section ids are taste's (`<taste>/references/sections-library.md`).

## Page type signals

- A plan or price table: pricing.
- A password field: login/register.
- Long single-column text with a byline or `<article>`: article.
- A price with a buy, reserve or add-to-cart action on one item: product detail.
- An address or contact form as the main content: contact.
- A team, founder or history page: about.
- Anything else: landing.

## Landing

- **Hero recipe:** by the pick rule, unchanged (recipe 1 for a strong photo).
- **Sections:** taste's plan for the kind (`<taste>/references/sections.md`).
- **Signature:** the best fit of the others' options, or none.

## Pricing

- **Hero recipe:** 3.
- **Sections:** `pricing-three` or `pricing-two`, `comparison-table`, `faq`, `close-type`.
- **Targets:** at most 3 plans, at most one highlighted (by colour, no badge), prices on one baseline, at most 6 lines per plan, the headline states the pricing rule.
- **Tells:** 4+ plans, "Most popular" or "Best value" badges, check icons on every line, a monthly/yearly toggle on a one-off price, "Simple, transparent pricing".
- **Signature:** prices laid on the calendar or season when the page has dates; otherwise none.

## About

- **Hero recipe:** 2.
- **Sections:** `chapter`, `people-row`, optional `timeline-rail`, `close-photo`.
- **Targets:** one founder or origin quote with attribution directly under it, people with real names and roles, no stat strip or facts row.
- **Tells:** a Mission/Vision/Values card row, an icon timeline, a "15+ years · 10k customers" strip, circle avatars with "Passionate about...".
- **Signature:** the founder's quote with a hanging quote mark.

## Article

- **Hero recipe:** none.
- **Targets:** title at most 2 lines, body 17-20px, lines 60-75 characters, images the column's width with captions, at most one pull quote.
- **Tells:** a gradient banner, a tag cloud or related-posts sidebar, "In this article, we'll explore...".
- **Signature:** title over a full-bleed opening photo, a drop cap, one pull quote, a reading progress bar.

## Contact

- **Hero recipe:** none.
- **Sections:** `booking-form`, optional `visit-map`, `footer-visit`.
- **Targets:** at most 5 fields with labels above, email and phone as plain text.
- **Tells:** an "Email us / Call us / Visit us" 3-card grid, "Get in touch", 8-field forms, decorative maps.
- **Signature:** an invitation to the real place with a pin on its photo, only when the page has an address people can visit; otherwise none.

## Product detail

- **Hero recipe:** none. No taste section ids.
- **Targets:** gallery in the larger column, price beside the name, one buy button, specs always visible.
- **Tells:** a badge pile on the photo, two buy buttons, "23 people are viewing this", specs in tabs.
- **Signature:** real availability (stock, seats or berths left) shown as a small map or count, only when the page states it.

## Login/register

- **Hero recipe:** none. No taste section ids.
- **Targets:** register at most 3 fields, login 2, at most 2 single-sign-on buttons above the form, one primary button, one link to the other form, password rules as one hint line.
- **Tells:** "Welcome back! 👋", a centred card on a gradient blob, 4 social buttons.
- **Signature:** the photo side states what the account is for (rotating captions only when the page lists more than one reason).
- **Plain ground (trigger):** after Imagery, the 1440 shot shows only one flat colour, gradients, blobs, glow, noise or a pattern in the strips left and right of the form. Then run the Background step in `SKILL.md`.
- **Background graphic:** shows the product's subject, taken from a true fact on the page (name, h1, subtitle, category). Music library: a record, tonearm, waveform or sound rings. Photo app: film or a contact sheet. Code tool: a terminal or a diff. Worked examples in [backgrounds.md](backgrounds.md).
- **Never the graphic:** gradient-only grounds, blobs, mesh, glow, dot or grid fields, noise, grain, generic particles, an abstract shape with no link to the product. They may support a subject graphic, never replace it.
- **Composition:** form card and contrast untouched; the whole screen filled, either one anchored object plus a side filler (vinyl right, rings left) or a band behind the form (waveform); no empty half; at 390 hidden or moved where the form does not cover it, never squeezed.
- **Motion:** at least one ongoing loop tied to the subject (spin, playhead, beat pulse, rings); optionally one load cue (tonearm drop), which is then the page's one load animation; text readable within 600 ms.
- **Lightweight:** CSS animates `transform` and `opacity` only, on a few elements (never width, height, top, clip-path, filter or `r`; never 100+ separately animated nodes). Canvas only where CSS cannot do it: 30 fps cap, 1x pixel density, about 64 points per path, skip frames while `document.hidden` or the canvas is `display:none`. Geometry read once per resize, never per frame; on SVG read `getComputedStyle` (SVG elements have no `offsetWidth`/`offsetTop`, they give NaN). No WebGL, no images, no requests added by the graphic; generated art only (no real covers, logos or artwork). Text inside the graphic at least 13px; the graphic is decorative (`aria-hidden="true"`, `pointer-events:none`, `z-index:-1`). `prefers-reduced-motion: reduce` shows one still, finished frame.
- **Colour:** tinted from the page's accent or a neutral, never violet (taste, `<taste>/references/backgrounds.md`); the accent stays on its own marks (playhead, played bars).
- **Moments:** the background loop is the page's one rich moment; the other moments add only a micro-interaction (and an entrance only when there is no load cue). If the gate still raises `moment-none`, waive it in `.taste-skill/waivers.json` with the reason "login/register recipe allows no extra sections". Never add a `text-only` waiver in advance.

## Signature rule

One signature per page at most. It shows one true fact already on the page in an unexpected form. Never invent a fact, number or date. No true fact, no signature: the page stays tidy only, and the reply says so. Every signature needs a 390 layout and a reduced-motion state.
