# Rules

## Finding format

One block per finding, every field present:

- **ID:** U1, U2, ...
- **Where:** task, step, width, and the anchor: screenshot path, selector or file:line.
- **Observation:** what is on screen or in code, in plain words.
- **Why:** the heuristic or walkthrough question it breaks.
- **Consequence:** what happens to the user at that task step.
- **Evidence grade:** seen, read in code, data n of N, told, guessed.
- **Status:** `observed` only with user data that shows it. Otherwise `predicted`.
- **Impact:** 1 to 4, how hard it is to get past.
- **Persistence:** once-only or every time.
- **Frequency:** from data as n of N with an interval, else `unknown`. Never guessed.
- **Severity:** 0 to 4 (below).
- **Confidence:** high, medium or low. Code-only and single-source cap at low or medium.
- **Fix direction:** one line. It names the change, not the design.

## Hard rules

- **No anchor, no finding.**
- **A "missing X" claim needs a recorded search.** In `search-log.md`: the DOM query or `--dump-dom` grep and the code grep, with their results. Check states too: after submit, after error, after wait. A search done on the first screen alone does not count.
- **Seen beats read.** If code says feedback exists but the screen shows none, report what the screen shows and cite both.
- **Denominators always.** Write n of N. Add an adjusted-Wald interval to every rate. No bare percentage.
- **Vague words are banned** ("confusing", "cognitive load", "intuitive") unless the finding names the element and the step.
- **Every fix traces to a finding ID.**

## Severity (NN/g)

0 not a problem. 1 cosmetic. 2 minor, low priority. 3 major, high priority. 4 catastrophe, fix before release. Judge from impact and persistence. Add frequency only from data.

Something that destroys the user's input or work with no way back is 3 or 4. Something that is merely unpolished is 1 or 2.

## Not a finding

A mechanism that looks missing may exist in a later state: after submit, after an error, after a wait, inside a menu, or further down the page. Check those states before you write the finding. If the mechanism exists and works in the live UI, drop it. Put it in `dropped.md`, or on the keep list when it is worth protecting.

## Banned

- Invented personas.
- A score for every heuristic, a 1 to 5 score, or an overall usability score.
- "Desirable", "credible" or "valuable" verdicts without data.
- Predicted heatmaps, attention maps and time-on-task estimates.
- Reporting from a description or screenshot alone when the app can run.
