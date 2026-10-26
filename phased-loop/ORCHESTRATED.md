# Orchestrated mode

You are the **orchestrator**: you own the loop, subagents (the `Agent` tool) do the work. Your context stays lean — you read `tasks.md`, `git status`, and subagent reports. Source files, diffs, and test output stay inside subagents.

Use the subagent model the user names; otherwise inherit. Run subagents **sequentially** — parallel ones collide on shared files.

## Who runs each loop step

| Step | Runner |
|---|---|
| 1. Check status | You — `Read` `tasks.md` |
| 2. Code check | **Check subagent** |
| 3. Implement | **Task subagents**, one per green unit |
| 3.5 Audit | You — re-read `tasks.md`, `git status --short` |
| 4–5. Test, commit, sync | The **task subagent** for the phase's last green unit, after its own lines |
| When you are done | The last task subagent also runs Finishing step 1; you hand back (step 2) |

A **green unit** is the smallest run of consecutive task lines after which `check` passes. Usually one line. Group lines when an earlier one breaks the build until a later one lands (removing a field breaks every use of it until each use is updated).

## Subagent prompts

Every prompt carries:

- **Paths**, not pasted content: `plan.md`, `check-N.md`, `tasks.md`, `risks.md`, and the project's `CLAUDE.md` / `AGENTS.md`.
- **The job**: "You are a subagent — run solo." plus the loop step(s) it runs from this skill's SKILL.md (give the subagent its absolute path) plus the shared rules in task-loop-rules.md in this skill's folder (absolute path), and for task subagents the exact task line(s) it owns.
- **Recap**: 2–4 sentences on what earlier units changed, drawn from their reports.
- **Blocked rule**: if something cannot be done as planned and no obvious solution aligns with the request, stop and return `BLOCKED: <question + options>`.
- **Report shape**: ≤5 lines — files touched, `check`/`test` result, risks added, notes for the next unit.

Task subagents implement only their lines, run `check` (plus the tests nearest the change), tick each owned line the moment it's done, and add discovered work as new `- [ ]` lines.

The check subagent reads code and library source only, writes `check-N.md`, and acts on it as step 2 says. It writes no code.

If the last unit's subagent added new lines to its phase, it skips steps 4–5 and says so. The subagent for the new last unit runs them instead.

## Handling reports

- **`BLOCKED:`** → decide as the rules file says (the option closest to the plan's intent, plus a divergence note if it changes something the user approved), then hand the decision to a fresh subagent.
- **Otherwise** → confirm the claim cheaply: owned lines ticked in `tasks.md`, no unexpected files in `git status`. A mismatch means drift — audit before dispatching the next unit.
- **Judgement calls** in a report → if one changes something the user approved, add a divergence note to `plan.md`. Otherwise there's nothing to record.
