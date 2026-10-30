---
name: make-fixture
description: Reads an app repo and writes its browser walkthrough fixture (`.harness/`) for a person to review and commit. Detects the stack, dev command and backend calls, writes a fake backend with canned answers, a Playwright driver that blocks every non-localhost request, start/stop scripts and a selftest, and runs the selftest until it passes. Never commits, never contacts a real backend, never copies tokens. Use when a repo has no fixture, when ship-plan or approve-plan says "no fixture", or for "make a fixture" or "set up the walkthrough".
---

# Make fixture

Tier L runs skip the browser walkthrough when the repo has no committed fixture. You write one. A person reviews and commits it.

## Input

- **The repo,** the current checkout.
- **Optional:** the fixture folder, default `.harness/` (or the `FIXTURE:` line of a `tier.md`).

## Steps

1. **Read the repo.** Find the stack, the dev command and port, and every backend call the app makes (base URLs, endpoints, auth flow). Read `AGENTS.md` / `CLAUDE.md` first.
2. **Write the fixture** to [CONTRACT.md](CONTRACT.md): every required file, written for this app. No stack templates; the contract says what, you decide how.
3. **Fake each backend call** with canned data in `fake/`, shaped like the real responses. Fake the login too, with made-up tokens.
4. **Run `selftest`** and fix until it passes. Run it with the network blocked if you can.
5. **Stop, uncommitted.** Report what was faked and what could not be: websockets, third-party OAuth, payments, anything else. Those become `manual:` criteria.

## Never

- **Never commit** in the target repo. Leave the files for a person to review.
- **Never contact a real backend,** not to read a response shape either. Take shapes from the code, types and tests.
- **Never copy or print a token.** Read no credential files; use fake values.
- **Never edit app code.** Only the fixture folder, plus a `.gitignore` line for its temp files if needed.

## Output

- **Files written,** one line each.
- **Faked:** the backend calls and what each answers.
- **Not faked:** what could not be, and why.
- **Selftest:** the command and its result.
- **To commit:** "review `.harness/`, then commit it yourself".
