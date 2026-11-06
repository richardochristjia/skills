# System mode

Clean up an existing design system: too many greys, nine font sizes, colours that almost match. The result is a pull request that replaces values with a smaller set. Never edit source in planning.

## What the inspector reports

Probed with `inspect.mjs <file> --json` on a scratch page (the report prints to stdout and also goes to `report.json` in `--out`). Per width it reports the font families and the type sizes in use, the text colours with their share, the section background colours, and counts of shadows, gradients, hairlines and rounded boxes. It reports no spacing, no declared tokens, and no count of where a value is used in the source. Use it on one representative screen for the measured side. Get the rest from the source.

```
node <taste>/scripts/inspect.mjs <url or file.html> --widths <named> --json --out .plans/<task>/taste/before
```

## Token inventory

1. Scan the source for declared tokens (custom properties, the Tailwind theme, token files) and for hard-coded colours, font sizes, spacing values and radii.
2. Count each value and list the files it appears in.
3. Group near-duplicates: colours that look the same (a small colour difference), sizes within 1px.
4. Write `.plans/<task>/taste/tokens.md` with one table per kind: value, count, files, proposed role.

## The smaller set

Propose it against taste's laws:
- One ground, one ink, one accent, plus tone steps for surfaces.
- At most 5 type sizes and at most 2 faces.
- Tone steps instead of shadows and borders.
- One radius, or two if the brand needs them.
- A spacing scale with few steps.

Map every old value to a new one, or mark it for removal. Say what visibly changes, and list the screens that move.

The plan ends in a pull request that replaces the values. Phases: add the tokens, replace colour, replace type, replace spacing and radii, remove dead values. Acceptance criteria: the gate line on the screens named, and a search that finds none of the removed values in the source.

## Figma

If the user wants the system in Figma, the plan's last next step is: "Run `figma-generate-library` with `.plans/<task>/taste/tokens.md` and your Figma file link." design-forge makes no Figma calls. For export only, stop after `tokens.md` and that line.
