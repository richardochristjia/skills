# Passes

One section per basic pass, in run order. Each has Look for (the tells), Change, Check and Taste refs. These point to taste's references and never copy them. `<page>` is the target, `<dir>` the taste profile folder.

Targets come from the chosen recipe in `recipes.md`. Nothing is checked between passes: each **Check** line names what the finish gate (`gate.mjs`) covers.

## 1. Declutter

- **Look for:** a badge or pill above the h1, a second call to action, extra nav items (Sign in next to the main button), decorative chips, an icon on every button.
- **Change:** remove them. Keep one primary action.
- **Check:** fewer elements in the screenshot; the finish gate shows no new FAIL.
- **Taste refs:** `<taste>/references/layout-v4.md`.

## 2. Spacing

- **Look for:** gaps and paddings off taste's spacing scale, uneven rhythm between sections.
- **Change:** put every gap on the system's scale.
- **Check:** the spacing and rhythm ids show no FAIL.
- **Taste refs:** `<taste>/references/system.md`, `<taste>/references/layout-v4.md`.

## 3. Copy

- **Look for:** long body copy, stock lines, slop words, a headline over the recipe's line or word limit at 1440.
- **Change:** cut to the recipe's limits (for recipe 1: headline at most 3 lines and 8 words, body at most 20 words), read off the 1440 shot. One call to action label.
- **Check:** the finish gate covers it (it runs copy-lint).
- **Taste refs:** `<taste>/references/copy-tells.md`.

## 4. Alignment

- **Look for:** headline, text, call to action and image edges that do not line up with the nav and the frame.
- **Change:** share one left edge and one container width, and place the text at the recipe's anchor (recipe 1: bottom-left).
- **Check:** the edge and alignment ids show no FAIL.
- **Taste refs:** `<taste>/references/layout-v4.md`.

## 5. Font

- **Look for:** the default AI faces, such as a Playfair Display hero or Inter everywhere.
- **Change:** swap to a pairing from `<taste>/library/type.json` that fits the page's kind.
- **Check:** the face is in `type.json`; the finish gate shows no FAIL.
- **Taste refs:** `<taste>/library/type.json`, `<taste>/references/system.md`.

## 6. Font size

- **Look for:** sizes off the type scale, a hero larger than the scale's h1.
- **Change:** move every size onto the scale.
- **Check:** the type ids show no FAIL.
- **Taste refs:** `<taste>/references/system.md`, `<taste>/library/type.json`.

## 7. Imagery

- **Look for:** a boxed or carded hero image, stock-looking pictures.
- **Change:** apply the recipe's image treatment only (recipe 1: full-bleed with a dark overlay). Text over a picture needs contrast.
- **Check:** the finish gate shows no FAIL, contrast included.
- **Taste refs:** `<taste>/references/photos.md`.
- **Login/register:** a plain ground goes to the Background step in `SKILL.md` (section 5.5).

## Moments

Pick 2 or 3 for the page, the recipe's moments first, then from `<taste>/references/moments.md` and `<taste>/references/motion.md`:

- At most one of each kind: one rich component, one micro-interaction, one entrance (for example a nav dropdown, a button arrow shift, a hero reveal).
- Minimum 2, maximum 3.
- Skip a kind the page has no place for. No nav dropdown means no rich nav component.
- Never a shader or scene unless the page is tech, gaming or software.
- Each honours `prefers-reduced-motion`.
- Text is readable within 600 ms of load; one load animation per page.
- Every hover moment has a tap, focus or scroll version: a hover preview becomes a menu sheet or a tap; hover zoom only under `@media (hover:hover)`, a swipe gallery otherwise.
- `prefers-reduced-motion: reduce` shows the end state.
- Check: covered by the finish gate (`<taste>/references/gate.md` lists the motion and performance checks).
- On login/register, the background loop is the rich component.
