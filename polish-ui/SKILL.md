---
name: polish-ui
description: Removes the AI-made look from one existing web page by fixing it in place, one pass at a time, with a commit and a screenshot per pass and a contact sheet at the end. A page type and recipe are picked first (with a palette check against the hero photo), then seven fixed basic passes (declutter, spacing, copy, alignment, font, font size, imagery) aim at it, a login page with a plain ground gets a moving subject background picked from three candidates, then at most one signature move and two or three moments picked for the page. Use when a page looks AI-made, generic, templated or sloppy and needs cleaning up, not redesigning, or when the user says "polish", "unslop" or "clean up this page". App screens, native apps, new screens and new sections go to design-forge.
---

<instructions>

Clean up one existing web page in place. Work unattended: never ask mid-run, except for the target when none is given.

The finish gate uses **taste** (the design-taste-frontend skill). Run its scripts as `node <taste>/scripts/<name>.mjs`.

## 1. Prerequisites

Do this before any edit.

- Find `<taste>`: the folder the harness reports when it loads the design-taste-frontend skill. If it reports none, use the `design-taste-frontend` folder next to this skill's folder.
- Run `node --version`. Taste needs Node 22 or later.
- Look for Chrome, Edge or Chromium.
- Taste or Node missing, or taste found without `scripts/shoot.mjs` or `scripts/consistency.mjs`: say which one is missing, print "Update the design-taste-frontend skill to the latest release with the tool you installed it with.", and stop. Edit nothing.
- Chrome missing: say "Install Chrome, Edge or Chromium.", and stop. Edit nothing.
- Every taste script that opens Chrome gets `--profile "${TMPDIR:-/tmp}/taste-profile-<page-slug>"`. This folder is outside the repo.

## 2. Target

- One web page: a URL (a dev server, run from the user's repo) or a file path. A file in a repo makes that repo the target repo.
- No target given: ask once in chat.
- An app screen, a native app, or a request for new screens or sections: say so, point to **design-forge**, and stop.
- `<page-slug>` is the page's file or route name in lowercase words joined by hyphens.

## 3. Clean tree and branch

- `git status --porcelain` shows anything: print "Commit or stash your changes first; polish-ui commits each pass." and stop. No edits, no branch.
- On the default branch: `git switch -c polish-ui/<page-slug>`. Otherwise stay on the current branch.
- Note the start commit: `git rev-parse HEAD`.

## 4. Work folder and before shots

- `W="${TMPDIR:-/tmp}/polish-ui-<page-slug>-<timestamp>"`. Screenshots, the pass log and the sheet go here, never in the repo.
- Taste's own state folder (`.taste-skill/`) and `.lavish/` (Background step) go into `.git/info/exclude`. Never `.gitignore`, never a commit.
- Shoot the page before any edit, at 1440 and 390:
  ```
  node <taste>/scripts/shoot.mjs --url <url or file> --w 1440 --h 900 --no-tiles --out $W/00-before-1440.png --profile <dir>
  node <taste>/scripts/shoot.mjs --url <url or file> --w 390 --h 844 --no-tiles --out $W/00-before-390.png --profile <dir>
  ```

## 4.3. Page type and palette

Read [references/recipes.md](references/recipes.md). Name the page type from its signals (page type signals list) and state it in one line with why.

Run `node <polish-ui>/scripts/palette.mjs --shot $W/00-before-1440.png --ground <body's computed background hex> --rect x,y,w,h --json`, with the hero image's box as the rect. `clash: false` (or exit 2): keep the palette, no question. `clash: true`: unless the prompt says "keep the palette" or "use the suggested palette", ask once, before any edit: keep it, or switch the ground, borders and muted text to the suggestion (accent and brand colours stay). A switch is its own commit, `style(polish-ui): palette <page-slug>`, before Declutter.

## 4.4. Pick the recipe

Pick the page recipe for the type, and its hero recipe by the hero pick rule (or the one the page recipe names; none means no hero recipe). State it in one line with why. Every pass reads its targets from them.

## 4.5. Arm the gate

Read the page's kind (software, gaming, tech, product, service or place) and its main action. Run `node <taste>/scripts/gate.mjs --start <page> --kind <kind> --category "<what is sold>" --primary "<main action>"`. Arming is not a gate run.

## 5. Basic passes, in this order

1 Declutter, 2 Spacing, 3 Copy, 4 Alignment, 5 Font, 6 Font size, 7 Imagery. For each pass `n`:

1. Read its section in [references/passes.md](references/passes.md) and the chosen recipe's targets.
2. Edit the page's source for that pass only. Keep routes, forms, data and behaviour.
3. `git diff --quiet` and no new files: status `no change`, log it, next pass.
4. Shoot once at 1440 into `$W/NN-<pass>-1440.png`. No taste check between passes.
5. `git add -A` the files the pass changed, `git commit -m "style(polish-ui): <pass> <page-slug>"`. Status `changed`, log the short sha.

## 5.5. Background

Only on a login or register page, and only when the recipe's plain-ground trigger fires after Imagery. Read the Login/register recipe in [references/recipes.md](references/recipes.md) and [references/backgrounds.md](references/backgrounds.md).

1. Build 3 candidates, each from a different subject idea (an object; a signal or waveform; a motion of sound or data), in `.lavish/<page-slug>-bg/<a|b|c>/index.html`: a copy of the page with the graphic, assets beside each (lavish serves relative paths only).
2. Shoot each at 1440 and 390 with `<taste>/scripts/shoot.mjs` (with `--profile`), plus one `--reduced` shot at 1440, into the candidate's folder. Run `node <taste>/scripts/perf.mjs <candidate> --runs 1 --profile <dir>` on each.
3. Pick by fixed rules, in order: every perf check PASS; shows the subject most directly; leaves the form clearest.
4. Apply it to the page as its own commit, `style(polish-ui): background <page-slug>`. Run `perf.mjs` (default 3 runs) on the page and log the result in the pass log.
5. Write `.lavish/<page-slug>-bg/index.html`: the 3 candidates side by side (1440 and 390 shots, the reduced still, a link to each live candidate), one line each on what it shows and how it moves, its perf result, the applied one marked with the reason. Write the file only: never open it, never run `lavish-axi share` (shares are public). The run never waits for a pick.

## 6. Moments

Read `<taste>/references/moments.md` and `<taste>/references/motion.md`, then the pick rules in `references/passes.md`. Pick 2 or 3, name each in one line with why it fits the page. The recipe's moments come first, then taste's. Each runs the pass loop above. Every moment honours `prefers-reduced-motion`.

## 6.5. Signature

After the 7 passes and before the moments: apply at most one signature from the page recipe, following the Signature rule in `references/recipes.md`, as its own commit `style(polish-ui): signature <page-slug>`. No true fact on the page, no signature.

## 7. Finish gate

Run `node <taste>/scripts/gate.mjs <page>` (it already runs the consistency check and copy-lint). Any FAIL: a `copy-cast-company` FAIL on the page's existing brand name is not fixed: keep the name, waive it in `.taste-skill/waivers.json` (`{"check": "copy-cast-company", "target": "<the whole where the gate prints, e.g. copy x1: \"Lumen\">", "reason": "existing brand name of the page"}`) and say so in the reply; any other FAIL gets one fix round as its own commit, `style(polish-ui): gate fixes <page-slug>`, then run the gate once more. Never run `consistency.mjs` separately and never more than two gate runs. If a fix would undo the recipe's targets, the recipe wins. Shoot the final page at 1440 and 390. A FAIL that stays is reported with its id, never hidden or chased.

## 8. Sheet

Write `$W/passes.json` (format in the header of `scripts/sheet.mjs`), then run `node <polish-ui>/scripts/sheet.mjs $W/passes.json --out $W/sheet.html`. If the Background step ran, add one line linking to `.lavish/<page-slug>-bg/index.html`, in `passes.json` or appended to `sheet.html`, whichever leaves `sheet.mjs` unchanged.

## 9. Reply

The page type and why, the chosen recipe and why, the palette decision (kept, switched or no clash), the signature (or "none: no true fact"), a table of the passes (status, commit), the moments chosen and why, the gate result, and the sheet path. If the Background step ran: the chosen graphic and why, the other two, the perf results and the preview path (swapping candidates is a follow-up the user asks for). No push, no pull request, no merge.

</instructions>
