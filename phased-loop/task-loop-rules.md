# Task loop rules

Shared by phased-loop, simple-loop and micro-loop. Each loop adds its own constraints and steps on top of these. The loops always run unattended: nobody answers questions mid-run.

## Project commands

Named by role: `check`, `test`, `lint`, `format`, `commit`, `sync`. Resolve each from the project's `CLAUDE.md` / `AGENTS.md`, else from its task runner (`justfile`, `package.json` scripts, `Makefile`). Defaults: `commit` = `git commit` of your staged changes; `sync` = `git merge` of the main line into your branch. A role with no command → skip it.

## Constraints

1.  **Stay on your branch.** Commit only to a feature branch or worktree — never to the main line (`main`/`master`/`trunk`); if you are on it, create a branch first. Never merge into the main line.
2.  **Continuous execution.** Proceed from one phase to the next without stopping. Stop only when all phases are complete or an unrecoverable error blocks progress.
3.  **Stay in `.plans/<task>/`.** Any plan files you write go here.
4.  **The spec is immutable.** Annotate `plan.md` only (strikethrough, divergence notes); never rewrite it. Status lives in `tasks.md`, never as checkboxes in the spec.

**Never stop to ask.** When a task cannot be implemented _as planned_, take the option closest to the plan's intent and keep going. If that changes something the user approved, add a divergence note (see **Divergence**).

## Concepts

**Task list** — The file `.plans/<task>/tasks.md`, edited with `Edit`:

```markdown
## Research
- [x] Map the existing call sites
- [ ] Identify the seam

## Build
- [ ] Add the parser
```

One `##` header per phase, one `- [ ]` line per task, in execution order.

**Spec** — The file `plan.md`. Immutable reference; annotate only.

**Task list ≠ acceptance criteria.** The task list tracks _what's done_. Acceptance criteria verify _correctness_. A ticked task proves nothing about a criterion.

**Divergence** — A change to something the user approved: what the feature does, its scope, an acceptance criterion, or a Record entry. Add a divergence note to `plan.md` saying what you did instead and why. A choice on a detail the plan left open (a name, a file layout, a helper's shape, the order of work) is not a divergence: make it without a note.

**Risk list** — The file `.plans/<task>/risks.md`, one line per risk: something that might break that you couldn't settle while building, like a guess about another program, a path no test reaches, or a case you saw but didn't cover.

```markdown
- Pasting over 64 KB may cut the prompt short (src/paste.rs:88). Check: paste a 100 KB file into a real pane.
```

Add a line the moment you notice the risk, with where it lives and how to check it. A risk you can't settle now goes in this list, never only in a report. ship-plan's taste-test step works through the list.

**Next task** — the first `- [ ]` line in the earliest phase that still has one. Re-read `tasks.md` to find it rather than trusting memory; nothing external catches drift.

**Phases** — The `##` headers in `tasks.md`, in order. Start a phase only once every task under the previous header is `[x]` or cancelled.

## Task List Discipline

**One task, one tick.** Update `tasks.md` at the moment a decision is made, never retroactively:

- Task done → `Edit` its line to `- [x]` immediately, before starting the next task.
- Discovered work, or a task bigger than expected → add `- [ ]` lines (or a new `##` phase) right away, then continue with whichever task is now next.
- Task no longer needed → `- [x] CANCELLED: <description>`.
- Task belongs in another phase → move the line under that header.

"Do five things, then tick five boxes" is the failure mode these loops exist to prevent.

## Finishing

1.  **Lint and format.** Run `lint` and `format`. Fix every error and warning in the files you changed, and leave untouched files alone so the diff stays about the task. Continue only when your changed files have zero warnings. Commit the fixes with `style(<scope>): fix lint` (micro folds them into its single commit).
2.  **Hand back** to whoever started you: what changed, the divergence notes, how many risks `risks.md` holds, and the test result. Opening the PR is the caller's job (ship-plan does it).
