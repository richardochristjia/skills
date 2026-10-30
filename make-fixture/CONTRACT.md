# Fixture contract

What a repo's committed fixture (default `.harness/`) must hold. taste-test runs it; `make-fixture` writes it; a person reviews and commits it.

## Rules

- **No real backend.** The app runs against a fake that answers its backend calls with canned data. No staging, no QA, no production.
- **No credentials.** No tokens, keys or passwords in any file. Fake values only.
- **Localhost only.** The driver aborts every request whose host is not localhost or 127.0.0.1.
- **Throwaway state.** The app's home, config and data live in a temp folder the scripts create and remove.

## Required files

- **`README.md`**: how to start, drive and stop the app, what is faked, what is not, and the environment rules.
- **`start`**: starts the fake backend and the app against it, on free localhost ports. Prints the app URL and writes the process ids to a file `stop` reads.
- **`stop`**: stops only what `start` started and removes the temp folder.
- **`fake/`**: the fake backend and its canned data.
- **`driver.mjs`**: a Playwright driver. Aborts every non-localhost request and exits non-zero if it saw one. Other scripts import it.
- **`selftest`**: runs `start`, loads one page through the driver, asserts no request left localhost, runs `stop`. Exit 0 means the fixture works.
- **`screenshot`**: takes a PNG of a URL or flow step: `screenshot <name> [url]`.
- **`video`**: records the driver's actions as a video: `video <name> <script>`.

## Environment rules

The README holds a section that says, for this app: what data is local, what taste-test may write (the temp folder only), and which running programs to leave alone.
