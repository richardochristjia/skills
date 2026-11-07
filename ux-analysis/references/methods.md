# Methods

## Heuristics (labels only)

Use Nielsen's ten as the "why" label on a finding. Never score one by itself.

1. Visibility of system status
2. Match between system and the real world
3. User control and freedom
4. Consistency and standards
5. Error prevention
6. Recognition rather than recall
7. Flexibility and efficiency of use
8. Aesthetic and minimalist design
9. Help users recognize, diagnose and recover from errors
10. Help and documentation

## Cognitive walkthrough

At every step of a task, answer all four. A "no" with a named element is a finding.

1. Will the user try to achieve the right effect?
2. Will they notice that the correct action is available?
3. Will they associate the correct action with the effect they want?
4. If they take it, will they see that progress is being made?

Walk the steps as a first-time user who knows only the task goal.

## Capture without a browser tool

Headless Chrome needs no install:

- Screenshot: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --screenshot=<out.png> --window-size=1440,900 <url>` (use 390,844 for phone).
- DOM: add `--dump-dom <url>` and grep it. This is the search every "missing X" claim needs. It shows the first screen only. For later states, use the harness browser tool or read the script.

## Keyboard walk

For each task, use only Tab, Shift+Tab, Enter, Space and Esc. Note: an element you can't reach, no visible focus, focus that disappears after an action, an overlay you can't close with Esc, and a control with no accessible name.

## axe-core

Run `npx -y @axe-core/cli@4.11.0 <url>`. The command is unprobed: its chromedriver may not match Chrome, and permissions may block it. If it fails or is blocked, write each accessibility check as `manual: <check> (axe not run: <reason>)` and do the check by reading the DOM, for example icon-only buttons with no label, inputs with no label, and contrast read from the CSS. Axe finds only part of the problems: a clean run proves nothing about the rest.

## Handed data: HEART

Use it only to map data to goals, never to invent data.

- **Goal:** what the user is trying to do (task completion, return, satisfaction).
- **Signal:** the event that shows it (a submit, an error shown, an exit).
- **Metric:** n of N sessions, with an adjusted-Wald interval.

Match each signal to a finding ID. A drop at a step with no finding becomes an open hypothesis.
