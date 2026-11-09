# Directions

A direction is a bundle: styling (palette, type, radius, surface, density) plus representation (how each key datum is shown). Tier M and L build three mocks of the one key screen, one per direction, before the user picks.

## Tokens policy

Decided in Look source (SKILL.md).

- **Fully adopted system: locked.** At least 5 screens, and at least 90% of them take colours and fonts from tokens or shared components. The lavish page states the count; the user can overrule it. All three directions stay strictly inside the system: only representation, density and existing surface styles vary. New graphics use its tokens and its own icon set.
- **Tokens present, not fully adopted:** direction A keeps them (`Look: system`). B and C explore (`Look: deal`). If the user picks B or C, the plan's phases say the tokens are replaced.
- **User says the brand is locked:** same as fully adopted.
- **No tokens:** all three explore.

## Dealing

`start.mjs deal`, run from `.plans/<task>/taste/` with `--history history.json`, gives 3 palettes and 3 type pairings. Pair them into directions. The user picks a direction, not one of each. From the repo root, print each mock's tokens with `start.mjs css --history .plans/<task>/taste/mock-history.json`. After the pick, run it once more with `--history .plans/<task>/taste/history.json`.

## Representation table

One row per key datum on the screen. Fill the form for each direction.

| Datum | Current form | A | B | C |
|---|---|---|---|---|
| `<datum>` | `<how it shows now>` | `<form>` | `<form>` | `<form>` |

## Menu by information type

| Information | Forms |
|---|---|
| Trend | sparkline, area |
| Part of whole | meter, ring, stacked bar |
| Status | icon with colour and label, pips |
| Sequence | stepper, timeline |
| Connections | diagram |
| People or things | avatar, thumbnail, logo |
| Place | map |
| Category | icon |
| Comparison | bars |
| Empty state | drawn illustration |

## Sources

A locked system's own icons first. Then:
- `node <taste>/scripts/icons.mjs find <words> --set ui`
- `<taste>/assets/ui`, `<taste>/assets/diagrams`
- `node <taste>/scripts/photos.mjs pick --trade <trade> --sections <ids>`
- inline SVG

## The removal test

Delete the graphic. If nothing is lost, it goes. Labels stay. Colour is never the only signal.

## The difference rule

Each pair of directions differs in at least 2 style axes (palette, type, radius, surface, density) and in the main datum's form. Locked systems are exempt from the style axes. Layout may stay the same.

## The self-check table

Show it on the lavish page. Rows are the axes plus the main datum's form; columns are the directions. Two equal cells on the main datum's row: rebuild.

| Axis | A | B | C |
|---|---|---|---|
| Palette | | | |
| Type | | | |
| Radius | | | |
| Surface | | | |
| Density | | | |
| Main datum | | | |
