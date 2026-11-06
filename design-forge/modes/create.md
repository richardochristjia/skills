# Create mode

New page, app screen, mixed build, or one component. Commands run as `node <taste>/scripts/<name>.mjs`. Every output goes to `.plans/<task>/taste/` through `--out`.

Decide page or app screen first and record it. A page is read and scrolled. An app screen is worked in (dashboard, queue, settings, list, editor).

## Page

Taste's steps 1 to 5. Build nothing.

1. **Inventory.** Read the brief and the repo. List 8 to 12 things that belong to this subject and to no competitor: its name and meaning, its place, its numbers, its constraint, its materials, its rituals, the printed things of its world. Note which pictures truly exist.
2. **Argument.** One line per section: a claim and its proof. A section with no claim is deleted. Do not default to hero, logos, three features, testimonial, pricing, call to action.
3. **Draw three.**
   ```
   node <taste>/scripts/draw.mjs --sector <sector> --brief "<one line>" --sections <roles in order> [--tone <tone>] [--have <assets>] [--keep palette,type] --options 3
   ```
   It writes nothing. `--list sectors` and `--list roles` give the choices. `--have` names only assets that exist (`photography`, `product-photo`, `product-ui`, `illustration`, `video`). Pictures found in open collections are not in `--have`. Put the three on the lavish page as cards. Mark the one that can carry something only this subject has, and name the inventory item.
4. **Idea sentence.** After the user picks: "On this page, `<thing of the subject>` becomes `<device the direction calls for>`." Run the competitor test: put the nearest real competitor in the sentence. If it still works, the idea belongs to the category; go back to the inventory. Add one live thing the visitor can do, made from the idea, that works on a phone and has a plain fallback.
5. **Copy outline.** One claim per section. Every headline fits in two lines at every named width (about 32 characters is safe; the arithmetic is in taste `references/copy.md` §2). One supporting sentence and one primary action on the first screen. Flag sample content for the client to confirm. Never invent customers, quotes, reviews or logos.

### Picture inventory

List every picture the page needs and where each comes from:
- **exists:** the project's own.
- **found:** `node <taste>/scripts/assets.mjs "<query>"` (add `--video` for clips). Search the inventory, not the category. Record source and licence. Nothing is downloaded in planning.
- **drawn:** in code, for what no honest picture exists of.

The inspector fails a page with fewer than 4 real pictures (SVG does not count). Check the count now.

Deal the full sheet only when the user has chosen (tier L: this is the mock step in SKILL.md):
```
node <taste>/scripts/draw.mjs <same arguments, without --options> --direction <id> --out .plans/<task>/taste
```
Redraw a slot (`--redraw hero|type|palette|photos|scenes|section:<role>|direction`) only for a stated reason: it contradicts the brand, needs a missing asset, or cannot hold the real content. Record each redraw in the Design section.

## App screen

Taste's `references/app-screens.md` §2.1 to §2.3.

1. **Inventory** (§2.1): the data the screen shows and the jobs people do on it.
2. **The one question** (§2.2): one line. It decides what is biggest, what is read first and what is left out.
3. **Style** (§2.3). `--kind` is required; `draw.mjs --app --list kinds` prints the 13 kinds.
   ```
   node <taste>/scripts/draw.mjs --app --kind <kind> --brief "<one line>" --screens <screens> [--theme light|dark] [--keep palette,type] --options 3
   node <taste>/scripts/draw.mjs --app <same arguments, without --options> --style <id> --out .plans/<task>/taste
   ```
   Screens: overview, analytics, list, detail, settings, wallet, builder, inbox, home, report. App screens use `--style`, not `--direction`. Choose by how the product is used, and write one line why. Also choose the face and the signature element now, next to the question.
4. **State table.** Rows are the screen's blocks, columns are empty, zero, loading, error, success, no-permission. Fill every cell with what the user sees. A blank cell is a missing design.

Shell, data, states and the check (§2.4 to §2.8) belong to the build. Do not run them here.

## Mixed

A page plus the app behind it. Run the page steps. Then run the app steps with `--keep palette,type` and a second `--out` folder (`.plans/<task>/taste/app`), so both share one palette and one type face. Every interface fragment the page shows is built by the app rules.

## Component

No draw. Read the neighbours: tokens, type, radii, states. Match them. List the component's states (default, hover, focus, active, disabled, loading, error). The gate still runs on it.
