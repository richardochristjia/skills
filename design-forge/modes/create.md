# Create mode

New page, app screen, mixed build, or one component. Every taste output goes to `.plans/<task>/taste/`.

Decide page or app screen first and record it. A page is read and scrolled. An app screen is worked in (dashboard, queue, settings, list, editor).

## Page

Taste's run steps 1 to 4. Build nothing.

1. **Read the brief.** Write the kind (software, gaming, tech, product, service, place), what is sold, who buys, the one main action and the real material. Also list 8 to 12 things that belong to this subject and to no competitor: its name, place, numbers, constraint, materials, rituals.
2. **Copy first**, as in taste `references/copy.md`. One claim per section. Every headline fits in two lines at every named width. One supporting sentence and one primary action on the first screen. Flag sample content for the client to confirm. Never invent customers, quotes, reviews or logos.
3. **Plan the page as screens.** One line per section (taste `references/sections.md`). A section with no claim is deleted. Pick photographs with `node <taste>/scripts/photos.mjs pick --trade <trade> --sections <ids> --history .plans/<task>/taste/photos-history.json`. Record source and licence. List the page's graphics from the menu in [../references/directions.md](../references/directions.md) alongside the picture list; each passes the removal test. Download nothing in planning. Pick icons with `node <taste>/scripts/icons.mjs find <words>`.
4. **The look**, by the look-source rule in SKILL.md, and the directions in [../references/directions.md](../references/directions.md).

After the user picks the look, write the idea sentence: "On this page, `<thing of the subject>` becomes `<device>`." Run the competitor test: put the nearest real competitor in the sentence. If it still works, the idea belongs to the category; go back to the list. Add one live thing the visitor can do, made from the idea, that works on a phone and has a plain fallback.

Picture list: **exists** (the project's own), **found** (from `photos.mjs`, with source and licence), or **drawn** (in code, for what no honest picture exists of).

## App screen

Rules are in `app.md`.

1. **Inventory.** The data the screen shows and the jobs people do on it.
2. **The one question.** One line.
3. **The look**, by the look-source rule in SKILL.md, with `--page software`.
4. **Representation table.** As in `app.md`.
5. **State table.** As in `app.md`.
6. **Phone layout** per screen.

## Mixed

A page plus the app behind it, one Look for both. The page runs the page steps. The app screens and any interface fragment the page shows follow `app.md`.

## Component

No deal. Read the neighbours: tokens, type, radii, states. Match them. List the component's states (default, hover, focus, active, disabled, loading, error). The app gate in `app.md` still runs on it.
