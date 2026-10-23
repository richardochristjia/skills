---
name: gap-analysis
description: Checks an implementation against its acceptance criteria and lists every gap. Takes either a plan folder (.plans/{task}) to check the user's own work, including Record updates, or a PR link plus a Jira ticket key to review a teammate's PR in plain language, with a verdict and review comments ready to post. Use after a task loop finishes, for the autopilot's spec check, or when the user shares a PR and a ticket to review.
argument-hint: "<.plans/task or slug> | <PR link> <ticket key>"
---

# Gap analysis

Compare what was built with what was asked. The arguments pick the mode:

- **A plan folder** (`.plans/<task>/` or its slug) → **Plan mode**: check the work against `plan.md`.
- **A PR link and a ticket key** → **PR mode**: review a teammate's PR against the ticket.

If the arguments don't make it clear, work it out from what's there: a `.plans/` folder on this branch means plan mode.

## Get both sides

- **What was asked:**
  - Plan mode: `plan.md` (acceptance criteria, phases, Record Updates) and `tasks.md`.
  - PR mode: run the read-ticket skill on the ticket key if you have it, else read the ticket with your issue tracker's tools, every custom field included. Custom fields are where acceptance criteria usually live. If it stops on blocking assets, stop with it.
- **What was built:**
  - Plan mode: the branch's diff against the main line (`git diff <main>...HEAD`).
  - PR mode: the PR's description, diff and review comments, through the GitHub CLI (`gh pr view <link> --comments`, `gh pr diff <link>`).

Read the code the diff touches until you can say, for each criterion, what the code does now. Never judge a criterion from a file name or the PR description.

## Acceptance-criteria table

| ID | Criterion | Met? | Evidence |
|---|---|---|---|
| AC1 | … | Yes / Partly / No / Can't tell | `file:line`, test name, or command output |

- One row per acceptance criterion: AC1, AC2, …
- Then one row per feature the plan, ticket or discussion expected that the criteria don't list: F1, F2, …
- "Can't tell" is an honest answer; a guess is not. Say what would settle it.

## Plan mode

After the table, reconcile the Record if the plan had Record Updates. Read `.agents/RECORD.md` if it exists. The implementer writes Record updates at the end of implementation, so they should be there by now.

- For each entry the plan promised, confirm it was written and matches what was actually built. A missing or mismatched entry is a gap.
- If the implementer reported a **divergence** (built differently, so it wrote no entry), check the divergence is real, then propose a correct entry, verbatim, for the user to approve.
- Any existing entry the work changed, broke, or made stale that the plan didn't cover is a gap. Propose the amended (or removed) entry verbatim.
- If the work established a new high-level fact with no entry yet, propose one in the Record's format.
- Skip cosmetic or unrelated edits.

End with:

- **Gaps:** one line each: its ID, briefly why it exists, and the fix.
- **Next:** a short list of what to do.

Report the gaps and stop; whoever ran you fixes them.

## PR mode

The user hasn't read the code or the acceptance criteria. Write so they can decide without opening either.

1. **Before and after:** what the product did before this PR and what it does now, in plain words, from a user's point of view.
2. **The acceptance-criteria table.**
3. **Verdict:** approve, request changes, or comment, with the one reason that decides it.
4. **Review comments, ready to post:** one per issue, each with its `file:line`, written to the PR author: friendly, specific, and with the fix. Say whether to post them as one review (request changes or approve) or as separate comments.

Never post on GitHub yourself unless the user asks.
