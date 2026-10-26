# Workflow config

Lasting defaults for the workflow, in plain JSON (no comments). Only
`pick-tier/tier.mjs` reads the files; it writes the resolved values into
`.plans/<task>/tier.md`, and every other skill reads that.
[workflow.example.json](workflow.example.json) holds every key at its default.

## Lookup order

Highest first:

1. Words at approval: `(user)` lines in `tier.md` and `--tier`.
2. `<repo>/.agents/workflow.json` (repo = `git rev-parse --show-toplevel` of the working directory, else the working directory).
3. `~/.agents/workflow.json`.
4. Built-in defaults.

Objects merge key by key; arrays and scalars replace. `tier.md` shows a value
that differs from its built-in default with ` (config)`; a value equal to the
default gets no mark, and a `(user)` line beats `(config)`. The `CONFIG:` line
lists the files read, or `none`.

## Keys

Readers: `tier.mjs` applies every key; the skills listed read the result from `tier.md`.

### `models.default`
Model for every step without its own entry. String, default `sonnet`. Read by ship-plan.

### `models.<step>`
Model for one step id (see Step ids). String; the built-in `models.fix` is `opus`. Example: `{"models": {"build": "haiku"}}`. Read by ship-plan.

### `models.fix`
Model for the fix step. String, default `opus`. Read by ship-plan.

### `orchestrator.model`
Model the run's orchestrator uses. String, default `inherit` (the session's model). Read by approve-plan.

### `orchestrator.effort`
Orchestrator effort: `low`, `medium`, `high`, `xhigh` or `max`. Default `high`. Read by approve-plan.

### `delivery`
How a run ends. `pr` (default), `draft-pr`, `push` (push and print the link) or `local` (commits on the branch only, CI status skipped). Example: `{"delivery": "local"}`. Read by ship-plan and approve-plan.

### `tier.force`
Raises the tier, like `--tier`: the higher of `--tier`, this and the computed tier wins. `S`, `M`, `L` or `null` (none, default).

### `tier.substantialLines`
Changed lines that make a source file substantial. Positive integer, default `10`.

### `tier.maxMediumFiles`
Most substantial source files a tier M change may have. Positive integer, default `5`. The file-list estimate uses this plus 3 (default 8).

### `tier.sensitivePaths`
Extra regex strings (case-insensitive) added to the built-in sensitive paths. Array, default `[]`. Example: `["(^|/)billing/"]`.

### `loop`
Replaces the computed build loop: `micro`, `simple`, `phased` or `null` (computed, default). Read by approve-plan and ship-plan.

### `steps.skip`
Step ids to leave out. Array, default `[]`. Skipping `review` also skips `falsify` and `fix`. `build`, `verify` and `delivery` cannot be skipped. An id the tier does not run anyway is not an error. Read by ship-plan.

### `baseBranch`
Branch a run starts from. String, default `auto` (the detected default branch). Read by approve-plan.

### `branchPrefix`
Prefix of the run's branch name. String, default empty (`BRANCH_PREFIX: none`). Read by approve-plan.

### `fixture`
Repo-relative path of the committed fixture for the browser walkthrough. String, default `.harness/`. Read by approve-plan and taste-test.

## Step ids

`build`, `context-pack`, `review`, `falsify`, `fix`, `simplify`, `spec-check`, `verify`, `delivery`, `browser-walkthrough`, `ci-status`.

## Validation errors

An unknown key at any level, a wrong type, a value outside its enum, an unknown
or unskippable step id, or a regex `new RegExp` rejects stops the run before any
work starts: stderr names the file and the key (for example
`workflow config /repo/.agents/workflow.json: modles: unknown key`) and the exit
code is 2. Unreadable JSON exits 2 and names the file.
