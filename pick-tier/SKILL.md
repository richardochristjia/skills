---
name: pick-tier
description: Decides how deep a run should go for a change, from its size and risk, and records the decision so every later step reads one answer instead of guessing. Use before planning or shipping a change, or when a run should cost less than the full pipeline.
---

# Tier

A run's depth is a function of the change, not a constant. This skill measures the change and writes the depth, so the plan, the build, the review, the browser walkthrough and the delivery all read one decision.

Two modes, because the size of a change is only known at two different moments:

- **Estimate mode** — before anything is written. The caller passes a task description and the files the change would touch. Used by the planner to decide how much planning a task deserves.
- **Measure mode** — after the branch exists. The caller passes a base ref. Used by the build to decide which steps to run, and to shed steps when the change came out smaller than planned.

If nothing measurable is available, the tier is **M**.

## Measure the change

Run the script that ships with this skill. It measures the diff, applies the rules below, and prints the `tier.md` content:

```sh
# measure mode: the branch against a base
node <this skill>/tier.mjs --base origin/master --out .plans/<task>/tier.md

# estimate mode: the files the change would touch
node <this skill>/tier.mjs --files "components/Card.vue,components/Card.test.ts" --out .plans/<task>/tier.md

# add --phases N once tasks.md exists, to get the LOOP: line right
```

In measure mode the base is the merge base of the branch and `BASE_BRANCH:` (`auto` means the default branch), or a ref the caller names. Uncommitted work counts.

Count only source, test and config files. Ignore lockfiles, generated output and vendored directories.

## Signals

1. **Files changed** and **lines changed** (added + removed). Count source files separately: tests, docs and lockfiles do not use up the file budget.
2. **Test files** among them (`*.test.*`, `*.spec.*`, `tests/`, `__tests__/`).
3. **Doc-only files** (`*.md`, `docs/`) — a change that is only documentation is Tier S.
4. **Sensitive paths**: anything with `auth` in a path segment, plus `login`, `session`, `permission(s)`, `role(s)`, `acl`, `server/api`, `migrations`, `schema`, `seed`, `.env*`, `Dockerfile`, `docker-compose*`, `Jenkinsfile`, CI configuration (`.github/workflows`, `.gitea/workflows`, `.gitlab-ci.yml`).
5. **User-visible surfaces**: `pages/`, `views/`, `components/`, `features/`, `app/`, templates, styles — anything a person sees or clicks. These are everyday work, not a reason to raise the tier.
6. **Substantial files**: a changed source file with 10 or more changed lines. A file touched by a line or two is not a big change, however many files there are. Tests and docs do not count as substantial.
7. **Declared tier**: the user may name a tier. A user-declared tier is never lowered, only raised: pass it as `--tier <S|M|L>` and `tier.mjs` keeps the higher of it and the computed tier.

## Decide

**Tier S — small and safe**
One source file (its test may change too), no sensitive path, and that file has a test or the change adds one. A documentation-only change is also Tier S.

*Steps:* implement, unit test, lint, commit, branch. **No plan, no browser walkthrough, no review.** Automatic: do not ask before starting.

**Tier M — everyday work**
More than one source file, or one source file with no test coverage, or a change to routing, middleware, a page or a component. Up to five substantial source files.

*Steps:* a short spec (≤120 lines), build (one build, one test run), one correctness review, fix, verify, push, merge-request link. **No four-angle interrogate, no blast-radius pass, no browser walkthrough.**

**Tier L — big, risky or declared**
More than five substantial source files, or it touches authentication, authorization, roles, permissions, sessions, a server API, a database migration or CI configuration, or the user declared it, or the build's tests failed.

*Steps:* the full pipeline.

When two tiers could apply, take the higher one. A visible surface (a page, a component) is not itself a reason to raise the tier: what raises it is a sensitive path, the amount of real work, or the absence of a test. **Routing and middleware are tier M unless they also touch authentication or data** — a routing change with tests is everyday work, and tiering it L costs a four-angle review and a walkthrough for nothing.

**Estimate mode has no line counts.** When the tier is estimated from a file list, the file count alone never forces tier L: the gate stays at M and the measured diff decides at build time.

## Pick the build loop

The loop is a fixed rule, not a judgement. Pass `--phases N` (the `##` phases in `tasks.md`, leaving out `Verification` and `Manual checks`) once `tasks.md` exists:

- tier S or M: `micro`
- tier L with a sensitive path, or with more than 3 phases: `phased`
- every other tier L (including no `--phases` and no sensitive path): `simple`

If the user's approval names a loop, the caller writes `LOOP: <loop> (user)` in `tier.md` in place of the computed line. Nothing else may set a loop the rule didn't pick. Raising the tier mid-run does not change a loop already chosen.

## Configuration

`tier.mjs` is the only reader of the workflow config. It merges `<repo>/.agents/workflow.json` over `~/.agents/workflow.json` over the built-in defaults, validates it (exit 2, naming the key and file), and writes the resolved values into `tier.md`. Every other skill reads `tier.md`. Keys, lookup order and errors are in [CONFIG.md](CONFIG.md); [workflow.example.json](workflow.example.json) holds every key at its default.

## Escalate

Any step may raise the tier: write the new tier to `tier.md` and say so in the run. Escalate when the tests fail, when a review finds a defect in a sensitive path, or when the change turns out bigger than measured. Never lower a tier mid-run without the user asking. When `tier.md` is rewritten, keep every Steps line marked `(user)`.

## Output

Write `.plans/<task>/tier.md` (create the folder if it does not exist):

```markdown
# Tier

TIER: M
LOOP: micro
MODE: measure
BASE: origin/master
FILES: 7
LINES: +283/-32

## Signals
- user-visible: pages/classes/_components/ClassesCard.vue
- sensitive: none
- changed source files without a test: none

## Steps
1. Build — sonnet
2. Correctness review — sonnet
3. Fix — opus
4. Verify — sonnet
5. Push and merge-request link — sonnet

## Skipped
- four-angle interrogate, blast radius, browser walkthrough
```

Rules for the file:

- The `TIER:` line is what other skills read. It is on its own line, in capitals, with nothing else on it.
- The `LOOP:` line comes right after `TIER:`, on its own line: `micro`, `simple` or `phased`, with ` (user)` appended when the user chose it, or ` (config)` when the config replaced the computed loop.
- After `LINES:` come `CONFIG:` (the config files read, comma-separated, or `none`), `DELIVERY:`, `ORCHESTRATOR: <model> <effort>`, `BASE_BRANCH:`, `BRANCH_PREFIX:` (`none` when empty) and `FIXTURE:`.
- A value from the config that differs from the built-in default ends ` (config)`; a value equal to the default has no mark. A `(user)` line is kept on rewrite and beats `(config)`.
- `MODE:` says `estimate` or `measure`.
- The steps list names the model for each step, so the runner never has to guess. A line the user chose ends with ` (user)`, e.g. `Build — haiku (user)`; every rewrite of the file (escalation or a re-run of `tier.mjs`) keeps those lines, as it does `LOOP: ... (user)`.
- The skipped list is explicit, so a reader can see what was left out on purpose.

Then report one line in the chat: `Tier M: <what that means for this run>`.
