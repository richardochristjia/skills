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

`tier.mjs` applies every key. Each section below lists who reads the result from `tier.md`. Every example is a complete config file.

### `models.default`

Model for every step that has no entry of its own.

- **Type and values:** non-empty string
- **Default:** `sonnet`
- **Effect on `tier.md`:** every Steps line without its own entry reads `<step> — <model>`; it gets ` (config)` when the model is not `sonnet`.
- **Read by:** ship-plan
- **Validation:** not a non-empty string: `models.default: must be a non-empty string`.

```json
{ "models": { "default": "haiku" } }
```

### `models.<step>`

Model for one step id (see Step ids). Replaces `models.default` for that step.

- **Type and values:** non-empty string, under a key from the Step ids list
- **Default:** none, except `models.fix`
- **Effect on `tier.md`:** that step's line reads `<step> — <model> (config)` when the model differs from the step's built-in default (`sonnet`, or `opus` for `fix`).
- **Read by:** ship-plan
- **Validation:** an id not in the list: `models.<key>: unknown key`; a non-string value: `models.<step>: must be a non-empty string`.

```json
{ "models": { "build": "haiku" } }
```

### `models.fix`

Model for the fix step.

- **Type and values:** non-empty string
- **Default:** `opus`
- **Effect on `tier.md`:** the `Fix, once` line reads `Fix, once — <model>`, marked ` (config)` when it is not `opus`.
- **Read by:** ship-plan
- **Validation:** non-string: `models.fix: must be a non-empty string`.

```json
{ "models": { "fix": "sonnet" } }
```

### `orchestrator.model`

Model the run's orchestrator uses.

- **Type and values:** non-empty string
- **Default:** `inherit` (the model of the session that starts the run)
- **Effect on `tier.md`:** `ORCHESTRATOR: <model> <effort>`, marked when either value differs from `inherit high`.
- **Read by:** approve-plan
- **Validation:** non-string: `orchestrator.model: must be a non-empty string`.

```json
{ "orchestrator": { "model": "opus" } }
```

### `orchestrator.effort`

Effort level of the orchestrator.

- **Type and values:** one of `low`, `medium`, `high`, `xhigh`, `max`
- **Default:** `high`
- **Effect on `tier.md`:** the second word of the `ORCHESTRATOR:` line.
- **Read by:** approve-plan
- **Validation:** other value: `orchestrator.effort: must be one of low, medium, high, xhigh, max`.

```json
{ "orchestrator": { "effort": "xhigh" } }
```

### `delivery`

How a run ends. `pr` opens a pull request; `draft-pr` opens it as a draft; `push` pushes the branch and prints its link; `local` commits on the branch only.

- **Type and values:** one of `pr`, `draft-pr`, `push`, `local`
- **Default:** `pr`
- **Effect on `tier.md`:** `DELIVERY: <mode>`, marked when not `pr`. `local` also moves `ci-status` to Skipped. See Delivery modes.
- **Read by:** ship-plan, approve-plan
- **Validation:** other value: `delivery: must be one of pr, draft-pr, push, local`.

```json
{ "delivery": "local" }
```

### `tier.force`

Raises the tier, like `--tier`. It never lowers it: the highest of `--tier`, this and the computed tier wins.

- **Type and values:** `S`, `M`, `L` or `null`
- **Default:** `null` (no forcing)
- **Effect on `tier.md`:** when it raises the tier, the `why:` signal says `forced by config (measured X: ...)`.
- **Read by:** pick-tier (`tier.mjs`)
- **Validation:** other value: `tier.force: must be one of S, M, L`.

```json
{ "tier": { "force": "L" } }
```

### `tier.substantialLines`

Changed lines that make a source file count as substantial.

- **Type and values:** positive integer
- **Default:** `10`
- **Effect on `tier.md`:** the `substantial source files (N+ changed lines)` signal and the tier M/L cut.
- **Read by:** pick-tier (`tier.mjs`)
- **Validation:** zero, negative or non-integer: `tier.substantialLines: must be a positive integer`.

```json
{ "tier": { "substantialLines": 50 } }
```

### `tier.maxMediumFiles`

Most substantial source files a tier M change may have before it becomes tier L. The file-list estimate (no line counts) allows this plus 3.

- **Type and values:** positive integer
- **Default:** `5` (estimate limit `8`)
- **Effect on `tier.md`:** moves the M/L boundary, so it can change `TIER:`, `LOOP:` and the Steps list.
- **Read by:** pick-tier (`tier.mjs`)
- **Validation:** zero, negative or non-integer: `tier.maxMediumFiles: must be a positive integer`.

```json
{ "tier": { "maxMediumFiles": 8 } }
```

### `tier.sensitivePaths`

Extra regular expressions, tested case-insensitively against each changed path, added to the built-in sensitive list. A match makes the change tier L and a phased loop.

- **Type and values:** array of regex strings
- **Default:** `[]`
- **Effect on `tier.md`:** matching files appear in the `sensitive:` signal.
- **Read by:** pick-tier (`tier.mjs`)
- **Validation:** not an array: `tier.sensitivePaths: must be an array of strings`; a bad pattern: `tier.sensitivePaths[0]: invalid regex "("`.

```json
{ "tier": { "sensitivePaths": ["(^|/)billing/"] } }
```

### `loop`

Replaces the computed build loop.

- **Type and values:** `micro`, `simple`, `phased` or `null`
- **Default:** `null` (computed from the tier, sensitive paths and phase count)
- **Effect on `tier.md`:** `LOOP: <loop> (config)` when it differs from the computed loop.
- **Read by:** approve-plan, ship-plan
- **Validation:** other value: `loop: must be one of micro, simple, phased`.

```json
{ "loop": "simple" }
```

### `steps.skip`

Step ids to leave out of the run.

- **Type and values:** array of step ids
- **Default:** `[]`
- **Effect on `tier.md`:** the step leaves the Steps list and joins Skipped. `review` also skips `falsify` and `fix`. An id the tier does not run anyway changes nothing.
- **Read by:** ship-plan
- **Validation:** an unknown id: `steps.skip: unknown step id "x"`; `build`, `verify` or `delivery`: `steps.skip: step build cannot be skipped`.

```json
{ "steps": { "skip": ["browser-walkthrough"] } }
```

### `baseBranch`

Branch a run starts from.

- **Type and values:** non-empty string
- **Default:** `auto` (the repo's detected default branch)
- **Effect on `tier.md`:** `BASE_BRANCH: <value>`, marked when not `auto`.
- **Read by:** approve-plan
- **Validation:** empty or non-string: `baseBranch: must be a non-empty string`.

```json
{ "baseBranch": "develop" }
```

### `branchPrefix`

Prefix put before the task slug in the run's branch name.

- **Type and values:** string, may be empty
- **Default:** empty
- **Effect on `tier.md`:** `BRANCH_PREFIX: <value>`, or `none` when empty; marked when set.
- **Read by:** approve-plan
- **Validation:** non-string: `branchPrefix: must be a string`.

```json
{ "branchPrefix": "ai/" }
```

### `fixture`

Folder of the committed fake backend the browser walkthrough runs against.

- **Type and values:** non-empty repo-relative path
- **Default:** `.harness/`
- **Effect on `tier.md`:** `FIXTURE: <path>`, marked when not `.harness/`.
- **Read by:** approve-plan, taste-test
- **Validation:** absolute path: `fixture: must be a repo-relative path`.

```json
{ "fixture": "e2e/fixture/" }
```

## Interactions

- `--tier` and `tier.force` only raise the tier; the computed tier is never lowered.
- `loop` replaces the computed loop whatever the tier.
- `steps.skip: ["review"]` also skips `falsify` and `fix`.
- `delivery: "local"` skips `ci-status`; the run still works on a new branch.
- A `(user)` line in `tier.md` (a model or loop named at approval) beats `(config)` and survives a rewrite.
- Objects merge key by key across files, so a repo file can set `delivery` and still take `models` from the user file; arrays and scalars replace.

## `tier.md` lines

| Line | Source key | Default |
|---|---|---|
| `CONFIG:` | the files read | `none` |
| `DELIVERY:` | `delivery` | `pr` |
| `ORCHESTRATOR:` | `orchestrator.model`, `orchestrator.effort` | `inherit high` |
| `BASE_BRANCH:` | `baseBranch` | `auto` |
| `BRANCH_PREFIX:` | `branchPrefix` | `none` |
| `FIXTURE:` | `fixture` | `.harness/` |

## Delivery modes

| Mode | Pull request | Push | CI status |
|---|---|---|---|
| `pr` | opened (`gh pr create`, `glab mr create`, `tea pr create` or the Gitea API) | yes | read |
| `draft-pr` | opened as a draft (`--draft`; Gitea title prefixed `WIP: `) | yes | read |
| `push` | none; the branch link is printed | yes | read |
| `local` | none | no; the report says `branch <x>, not pushed` | skipped |

If the host cannot be automated, `pr` and `draft-pr` fall back to printing the link, and say it was not opened as a draft when that applies.

## Full example

```json
{
  "models": { "default": "sonnet", "build": "haiku", "fix": "opus" },
  "orchestrator": { "model": "opus", "effort": "high" },
  "delivery": "draft-pr",
  "tier": { "substantialLines": 20, "sensitivePaths": ["(^|/)billing/"] },
  "steps": { "skip": ["browser-walkthrough"] },
  "baseBranch": "develop",
  "branchPrefix": "ai/",
  "fixture": "e2e/fixture/"
}
```

## Step ids

`build`, `context-pack`, `review`, `falsify`, `fix`, `simplify`, `spec-check`, `verify`, `delivery`, `browser-walkthrough`, `ci-status`.

## Validation errors

Each message is `workflow config <file>: <key>: <problem>`, printed to stderr with exit code 2. An unknown key at any level, a wrong type, a value outside its enum, an unknown
or unskippable step id, or a regex `new RegExp` rejects stops the run before any
work starts: stderr names the file and the key (for example
`workflow config /repo/.agents/workflow.json: modles: unknown key`) and the exit
code is 2. Unreadable JSON exits 2 and names the file.
