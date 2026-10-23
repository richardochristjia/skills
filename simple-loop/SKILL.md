---
name: simple-loop
user-invocable: false
description: Execute a phased plan from `.plans/{task}/` task by task, using `check` output to steer edits, with tests and a commit per phase. Use for everyday multi-phase work, including large refactors where the build breaks between tasks.
argument-hint: "<.plans/task or slug>"
---

# Simple Task Loop

A disciplined workflow for implementing multi-phase coding tasks. `tasks.md` tracks progress in real time. The compiler is your guide: run `check` often and let its errors show what still needs updating.

**Arguments:** `$ARGUMENTS` — the plan (a `.plans/<task>/` path or slug). Always run the whole plan.

**Read `task-loop-rules.md` in this skill's folder first.** It holds the project commands, constraints, concepts, task-list discipline, and finishing steps all three task loops share. This file adds only what is specific to this loop.

## Constraints (on top of the shared ones)

- **Sync before the next phase.** Run `sync` at the end of every committed phase.

---

## The Loop

**Repeat until every task is complete.** Work per phase, top to bottom.

1.  **Check status.** `Read` `tasks.md`. Every task `[x]` → go to **When you are done**. Otherwise start at the next task.

2.  **Gather** what the current phase needs: the spec sections it implements and the code it touches.

3.  **Implement, one task at a time:**

    a. **Restate** the current task in one sentence.

    b. **Do the work.** Run `check` after each logical group of changes — a single task, a phase, or several phases, depending on the work. Use its output to steer: rename something and the errors list every call site still to update. You only see that guidance by actually running it.

    c. **Tick it** in `tasks.md`.

    d. **Pick the next task** under the current phase header and repeat from (a). When the phase has no `- [ ]` left, go to 3.5.

    **Broken builds:** if `check` fails, fix and re-run. Large refactors can leave the build red until a later task lands; that is expected. Once the code _should_ build, it must.

3.5. **Audit.** Re-read `tasks.md`. Any task in this phase not `[x]` means you drifted: return to step 3 with it. The list must be clean before you test or commit.

4.  **Verify.** Run the full `test` suite and fix failures before proceeding. If a phase must end with a broken build (a refactor spanning phases), first try reordering tasks so every phase ends green; accept a red phase boundary only when no order allows it.

5.  **Commit and sync.** On a green build: `commit` with message `<TASK> Phase N: <one sentence>`, then `sync` (resolve conflicts, re-test, commit the merge). On a red build: skip both and commit at the next phase that builds.

6.  **Go to step 1.**

## When you are done

Follow **Finishing** in the rules file.
