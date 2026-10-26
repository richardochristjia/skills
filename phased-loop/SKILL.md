---
name: phased-loop
user-invocable: false
description: Execute a phased plan from `.plans/{task}/`, checking each phase's part of the plan against the code before building it, with a full test run, commit and sync at the end of every phase. Use for multi-phase work where later phases depend on what earlier ones discover.
argument-hint: "<.plans/task or slug>"
---

# Phased Task Loop

A disciplined workflow for implementing multi-phase coding tasks. `tasks.md` tracks progress in real time; before each phase, a short code check finds where the plan is wrong about the code, so each phase builds from current facts.

**Arguments:** `$ARGUMENTS` — the plan (a `.plans/<task>/` path or slug). Always run the whole plan.

Picked by pick-tier when the tier is L and the change touches a sensitive path or has more than 3 phases.

**Read `task-loop-rules.md` in this skill's folder first.** It holds the project commands, constraints, concepts, task-list discipline, and finishing steps all three task loops share. This file adds only what is specific to this loop.

**Orchestrated mode:** read [ORCHESTRATED.md](ORCHESTRATED.md) before step 1. It assigns each loop step to you or a subagent; the steps below still define what each must achieve. A subagent whose prompt says to run solo does every step itself instead, skipping ORCHESTRATED.md. Without that instruction, a subagent running this loop (like ship-plan's build helper) is the orchestrator.

---

## Constraints (on top of the shared ones)

- **Sync before the next phase.** Run `sync` at the end of every phase.

Resolve every judgement call yourself. The rules file says when one needs a divergence note.

---

## Concepts (on top of the shared ones)

**Code check** — The file `check-N.md`: where this phase's part of the plan is wrong about the code, one line each, with what the plan assumes, what the code does (`file:line`), and what you'll do instead. Not a how-to: no code snippets, no file-by-file plan.

```markdown
- Plan says the picker reloads on save; it reloads only on focus (src/picker.rs:212). Added a task to reload on save.
```

---

## The Loop

**Repeat until every task is complete.** Work per phase, top to bottom.

1.  **Check status.** `Read` `tasks.md`. Every task `[x]` → go to **When you are done**. Otherwise start at the next task.

2.  **Check the plan against the code** (skip if this phase already has a `check-N.md`). Re-read this phase in `plan.md`, then read the code it touches and the library source it calls into (the installed copy, not the docs). Write `.plans/<task>/check-N.md`, one line per place the plan is wrong or unclear. If the plan holds, write one line saying so and what you read. Then act on each line:
    - Fix `tasks.md` to match: add, cancel or move lines.
    - A fix that changes something the user approved → divergence note in `plan.md`.
    - Something reading can't settle (how another program behaves, say) → a line in `risks.md`.

3.  **Implement, one task at a time:**

    a. **Restate** the current task in one sentence.

    b. **Do the work** for that task. Run `check` after each logical group of changes; if it fails, fix and re-run.

    c. **Tick it** in `tasks.md`.

    d. **Pick the next task** under the current phase header and repeat from (a). When the phase has no `- [ ]` left, go to 3.5.

3.5. **Audit.** Re-read `tasks.md`. Any task in this phase not `[x]` means you drifted: return to step 3 with it. The list must be clean before you test or commit.

4.  **Test.** Run the full `test` suite; all tests pass. Fix any failure before going on.

5.  **Commit and sync.** `commit` with a Conventional Commit message, `<type>(<scope>): <summary>`, one per phase, with the phase named in the summary or body, then `sync` (resolve conflicts, re-test, commit the merge). Commit only green code.

6.  **Go to step 1.**

## When you are done

Follow **Finishing** in the rules file.
