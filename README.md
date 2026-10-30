# Skills

Agent skills for a tiered, unattended coding workflow: plan a change with the
agent, approve it, and let the run build, review, verify and ship it to a pull
request.

## Install

```sh
npx skills add richardochristjia/skills -g --list      # see the skills, install nothing
npx skills add richardochristjia/skills -g -s '*' -y   # install every skill globally
npx skills update -g                                   # pull the latest later
```

## How a change flows

1. **forge** plans the change with you and presents a short plan.
2. **approve-plan** turns the approved plan into a spec and a task list, and starts the run.
3. **ship-plan** runs the pipeline unattended, on a branch, and ends with a pull request link.

The fix step runs on Opus and every other step on Sonnet by default. Change that in the config, or name a model for a step when you approve (for example "build on haiku") and that step uses it. A run
writes a checkpoint after every step, so an interrupted run resumes instead of
starting over. Nothing beside the harness you are already in is needed: no
terminal multiplexer, no separate session.

## Configuration

Lasting defaults (models, delivery mode, tier thresholds, loop, skipped steps,
branch naming, fixture path) live in `<repo>/.agents/workflow.json` or
`~/.agents/workflow.json`. See [pick-tier/CONFIG.md](pick-tier/CONFIG.md) and
[pick-tier/workflow.example.json](pick-tier/workflow.example.json).

## Tiers

**pick-tier** sizes the change as S, M or L, and the tier decides which steps run:

| Tier | Steps |
|---|---|
| S | build, push, pull request, CI status |
| M | build, context pack, one correctness review, falsify, fix once, verify, push, pull request, CI status |
| L | the M steps with a four-angle review, impact check, tidy-up and spec check, plus a browser walkthrough after the pull request |

### Overview

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/overview-dark.png">
  <img alt="forge plans the change, approve-plan starts the run, pick-tier sizes it as tier S, M or L" src="assets/overview-light.png" width="100%">
</picture>

### Tier S

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/tier-s-dark.png">
  <img alt="Tier S: build, push the branch, open the pull request, report CI status" src="assets/tier-s-light.png" width="100%">
</picture>

### Tier M

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/tier-m-dark.png">
  <img alt="Tier M: build, context pack, correctness review, falsify, fix once, verify, push, pull request, CI status" src="assets/tier-m-light.png" width="100%">
</picture>

### Tier L

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/tier-l-dark.png">
  <img alt="Tier L: build, context pack, four-angle review and check-impact side by side, falsify, fix once, deslop, gap-analysis, verify, push, pull request, taste-test, CI status" src="assets/tier-l-light.png" width="100%">
</picture>

### Build loops

`LOOP:` in `tier.md` is set by rule, not judgement.

| Loop | Picked when | Checks and tests | Commits | Before each phase |
|---|---|---|---|---|
| micro | tier S or M | `check` and `test` once, at the end | one Conventional Commit | nothing |
| simple | tier L, no sensitive path, 3 phases or fewer | `check` often, `test` per phase | one Conventional Commit per phase | nothing |
| phased | tier L with a sensitive path, or more than 3 phases | full `check` and `test` per phase | one Conventional Commit per phase | a short code check of the plan against the code |

**micro** is for small, low-risk changes where speed matters more than checkpoints. It edits every phase first, then runs `check` and `test` once and makes one commit.
Example: fix a typo in an error message, or add a field to one form plus its test.

**simple** is for everyday multi-phase work. It uses `check` errors to steer the edits, runs tests and makes a commit per phase, so a broken phase rolls back alone.
Example: rename a helper across 8 files, then update its callers and docs, in 2 or 3 phases.

**phased** is for risky work, or work where later phases depend on what earlier ones find. Before each phase it checks the plan against the code, and after each phase it runs the full tests.
Example: change how the auth middleware checks tokens (a sensitive path), or run a 5-phase migration.

## Skills

```
forge/           plans a change with you before any code is written
approve-plan/    writes the spec and task list, then starts the run
ship-plan/       the pipeline: build to pull request, unattended
pick-tier/       decides the depth of a run from the change's size and risk
micro-loop/      task loop for tier S and M (picked by rule)
simple-loop/     task loop for tier L, 3 phases or fewer, no sensitive path
phased-loop/     task loop for tier L with a sensitive path or over 3 phases
context-pack/    one digest of the change, so reviewers don't re-read the repo
interrogate/     four-angle review (or one angle for small changes)
check-impact/    finds what a change could break outside the diff
falsify/         argues against review findings before they are fixed
deslop/          removes AI-generated slop from a branch's code
gap-analysis/    checks an implementation against its acceptance criteria
taste-test/      tries the build like a user, against a committed fixture
make-fixture/   writes the committed browser fixture for a repo, for a person to review
diagnose-bug/    finds and proves the cause of a bug, then hands over a fix plan
unslop/          cuts AI tells from writing
wait-what/       restates the last message in plain language
```
