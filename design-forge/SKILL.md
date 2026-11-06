---
name: design-forge
description: Plans UI design work with the user before any code is written. Reads the app, shows the current screens, deals three visual directions to choose from, and presents a plan with a design section, a responsive matrix and a gate that approve-plan and ship-plan carry through to a pull request. Covers new pages, app screens and components, redesigns, restyles and design reviews, user flows across screens, design-system cleanup, and native iOS and Android apps. Use when the user wants to design, redesign, review or polish a UI, improve a flow, make a page mobile friendly, tidy colours and sizes, or plan screens for a mobile app, before implementing it. For non-UI changes use forge.
---

<instructions>

Plan a design change with the user. Do not write app code. Wait for approval.

This skill adds design to the **forge** skill. It does not replace it. Follow forge for the Record (Step 0), sizing with pick-tier (Step 0.5), the Socratic rules, lettered options, probing risky guesses, and the plan format with its length caps (Instructions 1-4). Do not copy forge's text here.

The visual work uses **taste** (the design-taste-frontend skill). Its commands are named below. Run them as `node <taste>/scripts/<name>.mjs`.

## 1. Prerequisites

Do this before any question.

- Find `<taste>`: the first of `~/.agents/skills/design-taste-frontend`, `~/.claude/skills/design-taste-frontend`, `<repo>/.claude/skills/design-taste-frontend` that holds `scripts/draw.mjs`.
- Run `node --version`. Taste needs Node 22 or later.
- Look for Chrome, Edge or Chromium.
- Taste or Node missing: say what is missing, print taste's install line, and stop. The line: "Copy the design-taste-frontend folder to `~/.claude/skills/design-taste-frontend/`, or keep it in the repo under `.claude/skills/`."
- Chrome missing: go on with taste's fallback (`lint.mjs` plus the screenshots you can take). Write in the plan that the inspector cannot run.
- Native work also needs `xcrun simctl` (iOS) and `adb` (Android). Each one missing makes that platform's capture criteria `manual:`, with the reason.

## 2. Pick the mode

State the mode in one line with the reason. Then read only that mode's file.

| Signal in the request | Mode | File |
|---|---|---|
| New page, landing, site, hero; new dashboard, settings, queue, screen; one component | create | [modes/create.md](modes/create.md) |
| Redesign, restyle, "looks dated" or "AI-made", review or audit a page, missing states, fix mobile | redesign | [modes/redesign.md](modes/redesign.md) |
| Steps, clicks, funnel, onboarding, checkout, drop-off, a journey across screens | flow | [modes/flow.md](modes/flow.md) |
| Tokens, colours or sizes everywhere, tidy the design system, export to Figma | system | [modes/system.md](modes/system.md) |
| `*.xcodeproj`, `Package.swift`, `pubspec.yaml`, React Native (`app.json` and `react-native`), or the user names iOS or Android | native, with one mode above | [modes/native.md](modes/native.md) |

- "Improve the design system" with no other signal: ask one chat question. A) Clean up the code (system mode). B) Export to Figma (system mode, hand-off only). Recommend A.
- **Page or app screen** is taste's first decision. Record it with the mode.
- **Mixed** (a page plus the app behind it): two draws that share one palette and type face.

## 3. Responsive matrix

Applies to every mode.

- Name the target widths. Default `1440,768,390`. Mobile-first adds `375`, and the mock is shown at phone width first.
- Native: name the simulator devices instead.
- The phone is its own layout. Decide each changed screen's phone layout now (taste `references/layout.md` §9 for pages, `references/app-screens.md` §12 for app screens).

## 4. Discover

Read the app. Never edit its source.

- Taste output goes only to `.plans/<task>/taste/`. Always pass `--out`: `draw.mjs --out .plans/<task>/taste`, `inspect.mjs --out .plans/<task>/taste/before`. Never write `.taste-skill/`.
- If `.taste-skill/direction.json` already exists in the repo root, taste reads it before the plan's sheet. Say so in the plan and ask before moving it.
- Choose the task slug here. approve-plan reuses it.
- Run the steps in the mode file.

## 5. Decide on a lavish page

Load the lavish skill, else run `npx -y lavish-axi --help`. Put the page in `.lavish/`. Never run `lavish-axi share`: shares are public.

- **Tier S:** no page, no dialogue, no draw. A short plan in chat. The gate still runs.
- **Tier M:** the direction cards and any trade-off question on a page. The plan in chat.
- **Tier L:** the cards, then the mock (below), then the plan as a page.

What the page shows:
- Before screenshots with findings pinned.
- Three direction cards from `draw.mjs --options 3`. Each has name, idea engine, composition, palette swatches and a type specimen. One is marked recommended, with the inventory item it carries.
- The idea sentence and the competitor test.
- The flow map and the state table, when the mode makes them.
- Questions as lettered options, the recommended one marked.

### The mock (tier L)

After the user picks a card:

1. Deal the full sheet: `node <taste>/scripts/draw.mjs <same arguments> --direction <id> --out .plans/<task>/taste`.
2. Build only the first screen as static HTML in `.lavish/<task>-mock/index.html`, from the sheet.
3. Run `node <taste>/scripts/inspect.mjs .lavish/<task>-mock/index.html --widths <named> --out .plans/<task>/taste/mock`.
4. Show the screenshots on the page.

The mock is throwaway. It never becomes app code.

## 6. The plan

Use forge's format. Add a `## Design` section in this shape. approve-plan copies it verbatim into `design.md`.

```markdown
## Design
- Plan folder: .plans/<task>/
- Mode: <mode>[ + native] · kind: page|app|mixed|component
- Direction: <id> · seed <n> · sheet .plans/<task>/taste/direction.json · redraws: <slot — reason>…
- Kept from brand: palette|type|none · allowances: <rule — reason>…
- Idea: On this page, <thing of the subject> becomes <device>. Live thing: <…>
- Argument and copy outline: <one claim per section; headlines ≤ 2 lines; sample content flagged>
- Pictures: <exists | found with licence | drawn>…
- Widths: <list> · native devices: <list> · phone layout: <per screen>
- Frame (native only): <which parts follow the platform>
- Flow map: <current → proposed steps, or "n/a">
- States: <screen × empty|zero|loading|error|success|no-permission table>
- Tokens (system mode): .plans/<task>/taste/tokens.md
- Before: .plans/<task>/taste/before · critique score <n>
- Gate: lint.mjs clean · inspect.mjs exit 0 at <widths> · scenes.mjs clean if scenes · after score ≥ before
```

Acceptance criteria always include the gate line. A criterion only a person or a real device can check is `manual:`.

</instructions>
