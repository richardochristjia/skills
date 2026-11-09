# Redesign mode

Redesign, restyle, review-only, polish. The app already exists, so start from what it looks like now. Never edit its source.

## Before

1. Capture the current look at every named width:
   ```
   node <taste>/scripts/shoot.mjs --url <url or file.html> --w <width> --out .plans/<task>/taste/before/<screen>-<width>.png --profile <dir>
   ```
   Use the dev server URL or the built page. The final gate runs on the production build.
2. Run the checker with `--out .plans/<task>/taste/before`. Page: `consistency.mjs`, the first command of the Gate block in SKILL.md. App screen: the app gate in `app.md`. Exit 1 means FAIL findings, not an error: keep the report.
3. Record the counts: `Before: .plans/<task>/taste/before · FAIL <n> WARN <n>`. App screens also get the rubric from `app.md`: `· rubric <n>/10`.
4. Put the screenshots on the lavish page with the findings pinned to the places they are about.

## What must survive

List it in the plan: routes, forms and their fields, data, behaviour, brand assets, the stack. No framework or styling-library migration. Check the dependency file before naming anything new.

## Brand lock

Use the look-source rule in SKILL.md (system or brand) and record it in the Look line. When the checker flags something the brand really needs, write the check id and the reason as an allowance in the Design section.

## Variants

- **Redesign:** three directions by the rule (see [../references/directions.md](../references/directions.md)), and rebuild the sections inside the existing components.
- **Restyle:** keep the layout. Three directions by the rule; take type, colour and components from the picked one.
- **Review only:** stop after the counts, the screenshots and the three changes that would move the page most. No cards, no mock, no build plan. Say it is a review. Offer a redesign as a next step.
- **Polish:** no deal. Add the missing states and decide the phone layout, per `app.md` (app screens) or taste `references/layout-v4.md` (pages). Make no other change.

## Order of work

The plan's phases follow this order, biggest effect for least risk:
1. Type: faces and scale.
2. Colour: one ground, one ink, one accent.
3. Frame: margins, section rhythm, a title on the first screen, a heading on every section.
4. States: hover, focus, loading, empty, error.
5. Stock components (icon cards, pill badges, gradient blobs, card grids) replaced by the sections the plan names. Stock icon cards stay banned. A graphic that passes the removal test is allowed.

Acceptance criteria: the gate line, plus "every route, form and menu that worked before still works" and the after FAIL count at or below the before count (app screens: the after rubric at or above the before rubric).
