# Redesign mode

Redesign, restyle, review-only, polish. The app already exists, so start from what it looks like now. Never edit its source.

## Before

1. Capture the current look at every named width:
   ```
   node <taste>/scripts/inspect.mjs <url or file.html> --widths <named> --out .plans/<task>/taste/before
   ```
   Add `--app` for app screens. Use the dev server URL or the built page. The inspector warns on a dev server; the final gate runs on the production build. Exit 1 means FAIL findings, not an error: keep the report.
2. Run `node <taste>/scripts/lint.mjs <source files or folder>`. It reads web files only.
3. Critique the screenshots with taste `references/critique.md`. Score design 40%, usability 30%, creativity 20%, content 10%. Record the overall as the baseline: `Before: .plans/<task>/taste/before · critique score <n>`.
4. Put the screenshots on the lavish page with the findings pinned to the places they are about.

## What must survive

List it in the plan: routes, forms and their fields, data, behaviour, brand assets, the stack. No framework or styling-library migration. Check the dependency file before naming anything new.

## Brand lock

- Look for declared tokens: CSS custom properties, the Tailwind theme, design-token files, theme objects.
- Tokens for colour: pass `--keep palette`. Tokens for type: `--keep type`. Both: `--keep palette,type`. The draw then deals only composition.
- Record the lock in the Design section: `Kept from brand: palette|type|none`.
- When the inspector flags something the brand really needs, grant it with `--allow <rule>` and write the rule and the reason in the Design section.

## Variants

- **Redesign:** deal a full direction (three cards, as in `create.md`) and rebuild the sections from its blueprints inside the existing components.
- **Restyle:** keep the layout. Take type, colour and components from a dealt direction, with `--keep` for whatever the brand fixes.
- **Review only:** stop after the findings. Give the inspector's measurements, the critique, and the three changes that would move the page most. No direction cards, no mock, no build plan. Say it is a review. Offer a redesign as a next step.
- **Polish:** no draw. Add the missing states (taste `references/app-screens.md` §11) and decide the phone layout (§12 for app screens, `layout.md` §9 for pages). Make no other change.

## Order of work

The plan's phases follow this order, biggest effect for least risk:
1. Type: faces and scale.
2. Colour: one ground, one ink, one accent.
3. Frame: margins, section rhythm, a title on the first screen, a heading on every section.
4. States: hover, focus, loading, empty, error.
5. Stock components (icon cards, pill badges, gradient blobs, card grids) replaced by the dealt blueprints.

Acceptance criteria: the gate line, plus "every route, form and menu that worked before still works" and the after score at or above the baseline.
