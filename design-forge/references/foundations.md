# Foundations

App screens and components only. Marketing pages use taste's scale and gate. Each of stages 2 to 5 writes one line into the plan's `## Design` block; approve-plan copies it to `design.md`, so the build sees it.

```
1 Inventory → 2 Hierarchy → 3 Type roles → 4 Spacing map → 5 Components → 6 Mocks → 7 Lint + tidy → 8 Critique → plan
```

## 2 Hierarchy

Rank each screen's content L1, L2, L3. Exactly one L1 per repeated unit (a row, a card, the screen). L1 answers the screen's one question.

`- Hierarchy: <screen>: L1 <thing> · L2 <things> · L3 <things>`

## 3 Type roles

Default app scale, tokens in `assets/mock-base.css`:

| Role | px | Token |
|---|---|---|
| caption | 12 | `--t-caption` |
| label | 13 | `--t-label` |
| body | 14 | `--t-body` |
| body-lg | 16 | `--t-body-lg` |
| title | 20 | `--t-title` |
| heading | 24 | `--t-heading` |
| display | 32 | `--t-display` |

- Weights 400, 500, 600. Line heights `--lh-tight` 1.25 (title and up), `--lh-body` 1.5.
- At most 5 distinct sizes and 2 distinct weights per mock.
- Each level down changes one variable: size, weight or colour.

`- Type roles: L1 <role> <weight> · L2 <role> <weight> · L3 <role> <weight> · other <role>…`

## 4 Spacing map

By relationship, using `--s-*`. Space inside a group is always smaller than the space around it.

| Relationship | Step |
|---|---|
| Inside a part | `--s-1`, `--s-2` |
| Card padding | `--s-4` |
| Siblings in a list | `--s-3` |
| Group to group | `--s-5`, `--s-6` |
| Section to section | `--s-7` and up |

`- Spacing map: inside <step> · card <step> · siblings <step> · groups <step> · sections <step>`

## 5 Components

One row per component in `.plans/<task>/taste/components.md`. Mock class names must appear in it, written as backticked `.class`. State modifiers (`is-*`) need no row.

```markdown
| Class | Anatomy | Variants | States | Tokens |
|---|---|---|---|---|
| `.order-card` | title, meta, badge | default, compact | default, hover, focus | `--s-4`, `--t-body` |
```

`- Components: .plans/<task>/taste/components.md`

## Locked system

When the adoption test passes (SKILL.md Look source step 1) or the user says the brand is locked, stages 3 to 5 map the repo's own scale, spacing steps and components instead of the defaults. Read them by static scan, as `modes/system.md` Token inventory does. A scan misses CSS-in-JS computed values: say so in the plan instead of guessing.

- Type roles map onto the repo's sizes. The lint takes them with `--sizes <a,b,c>`.
- Spacing map names the repo's steps. Components name the repo's existing components.
- All three directions stay inside the system. The build imports existing components and never restyles or copies them.
- **Missing role:** a hierarchy role the system lacks uses the nearest existing role and is logged in the Allowances line as `type-role — <reason>`. No new token is proposed.

Partly adopted tokens: direction A takes this path; B and C use the defaults.

## Critique

Run both on the mock screenshots; each scores in the rubric in `modes/app.md`.

- **Squint test:** blur the screenshot. The L1 still wins.
- **Greyscale test:** drop the colour. Meaning survives.
