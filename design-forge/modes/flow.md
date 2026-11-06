# Flow mode

A journey across screens: steps, clicks, a funnel, onboarding, checkout. The unit is the path, not one page.

## Trace

Read the code and list every step of the flow as it is now: routes, form steps, redirects, guards, modals, emails, error paths. Count the steps and the clicks from entry to done.

## Evidence

Ask the user once, in chat: "Do you have an analytics export, tickets or recordings for this flow?" Use what they hand over. Never fetch it yourself. With no evidence, say the plan rests on the code trace alone.

## Flow map

Draw two maps as inline SVG on the lavish page: current and proposed. Show branches, back paths, and the error and empty paths. Mark each friction with the rule it breaks. State the change in step count: "5 steps to 3".

Rules. Cite one for each change, and name the one a step would break if it were cut:
- One job per step.
- Back never loses input.
- No dead ends: every error and empty state offers the next action.
- Errors sit at the field.
- Long forms save progress.
- Every step has a URL.
- The most frequent job is one action from the start.

## State table

Rows are screens, columns are empty, zero, loading, error, success, no-permission. Fill each cell. Mark the cells the build must add.

## Per screen

Each screen that changes then runs its own steps from `create.md` (page or app screen), or the review steps in `redesign.md` if it already exists. The flow decides which screens change and in what order. All of them share one Look line.

Acceptance criteria: the gate line for every changed screen, and for each changed step a criterion that names the path (for example "from the start, done in 3 steps, back keeps the input"). A walk on a real device or a real backend is `manual:`.
