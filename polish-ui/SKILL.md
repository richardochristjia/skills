---
name: polish-ui
description: Removes the AI-made look from one existing web page by fixing it in place, one pass at a time, with a commit and a screenshot per pass and a contact sheet at the end. A hero recipe is picked first, then seven fixed basic passes (declutter, spacing, copy, alignment, font, font size, imagery) aim at it, then two or three moments picked for the page. Use when a page looks AI-made, generic, templated or sloppy and needs cleaning up, not redesigning, or when the user says "polish", "unslop" or "clean up this page". App screens, native apps, new screens and new sections go to design-forge.
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

- `git status --porcelain` shows anything: print "Commit or stash your changes first; polish-ui resets failed passes." and stop. No edits, no branch.
- On the default branch: `git switch -c polish-ui/<page-slug>`. Otherwise stay on the current branch.
- Note the start commit: `git rev-parse HEAD`.

## 4. Work folder and before shots

- `W="${TMPDIR:-/tmp}/polish-ui-<page-slug>-<timestamp>"`. Screenshots, the pass log and the sheet go here, never in the repo.
- Taste's own state folder (`.taste-skill/`) goes into `.git/info/exclude`. Never `.gitignore`, never a commit.
- Shoot the page before any edit, at 1440 and 390:
  ```
  node <taste>/scripts/shoot.mjs --url <url or file> --w 1440 --h 900 --no-tiles --out $W/00-before-1440.png --profile <dir>
  node <taste>/scripts/shoot.mjs --url <url or file> --w 390 --h 844 --no-tiles --out $W/00-before-390.png --profile <dir>
  ```

## 4.4. Pick the recipe

Read [references/recipes.md](references/recipes.md) and pick one recipe by its pick rule, looking at the before shots. State it in one line with why. Every pass reads its targets from that recipe.

## 4.5. Arm the gate

Read the page's kind (software, gaming, tech, product, service or place) and its main action. Run `node <taste>/scripts/gate.mjs --start <page> --kind <kind> --category "<what is sold>" --primary "<main action>"`.

## 5. Basic passes, in this order

1 Declutter, 2 Spacing, 3 Copy, 4 Alignment, 5 Font, 6 Font size, 7 Imagery. For each pass `n`:

1. Read its section in [references/passes.md](references/passes.md) and the chosen recipe's targets.
2. Edit the page's source for that pass only. Keep routes, forms, data and behaviour.
3. `git diff --quiet` and no new files: status `no change`, log it, next pass.
4. Shoot once at 1440 into `$W/NN-<pass>-1440.png`. No taste check between passes.
5. A `copy-cast-company` FAIL on the page's existing brand name is not a FAIL to fix: keep the name, waive it in `.taste-skill/waivers.json` (`{"check": "copy-cast-company", "target": "<the whole where the gate prints, e.g. copy x1: \"Lumen\">", "reason": "existing brand name of the page"}`), and say so in the reply.
6. `git add -A` the files the pass changed, `git commit -m "style(polish-ui): <pass> <page-slug>"`. Status `changed`, log the short sha.

## 6. Moments

Read `<taste>/references/moments.md` and `<taste>/references/motion.md`, then the pick rules in `references/passes.md`. Pick 2 or 3, name each in one line with why it fits the page. The recipe's moments come first, then taste's. Each runs the pass loop above. Every moment honours `prefers-reduced-motion`.

## 7. Finish gate

Run `node <taste>/scripts/gate.mjs <page>` (it already runs the consistency check and copy-lint). Any FAIL: one fix round as its own commit, `style(polish-ui): gate fixes <page-slug>`, then run the gate once more. Never run `consistency.mjs` separately and never more than two gate runs. If a fix would undo the recipe's targets, the recipe wins. Shoot the final page at 1440 and 390. A FAIL that stays is reported with its id, never hidden or chased.

## 8. Sheet

Write `$W/passes.json` (format in the header of `scripts/sheet.mjs`), then run `node <polish-ui>/scripts/sheet.mjs $W/passes.json --out $W/sheet.html`.

## 9. Reply

The chosen recipe and why, a table of the passes (status, commit), the moments chosen and why, the gate result, and the sheet path. No push, no pull request, no merge.

</instructions>
