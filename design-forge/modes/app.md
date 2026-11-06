# App rules

Shared by create, redesign, system and native. Not a mode. Rules for app screens and components: dashboard, queue, settings, list, editor. Colours and type come from the Look line. No hero, no effects, no moments.

## Rules

- **The one question.** Write what the screen answers in one line. It decides what is biggest, what is read first and what is left out.
- **One primary action** per screen.
- **States.** Rows are the screen's blocks. Columns are empty, zero, loading, error, success, no-permission. Fill every cell. A blank cell is a missing design.
- **Navigation.** One primary nav. It shows the current place.
- **Density.** Tables and lists sit on one grid. Align columns.
- **Touch targets** are at least 44px on phone widths.
- **Phone layout.** Per screen, say what stacks and what hides behind a menu.
- **One system.** One button pair, one card style, one type scale.

## The app gate

```
node <taste>/scripts/consistency.mjs <url or file> --widths <named> --profile <dir> --no-rhythm --no-tiles --no-visuals --no-address --json --out .plans/<task>/taste/<before|after>
```

- Read the `checks` in the JSON.
- Ignore the page rules: ids `cta`, `copy-headline`, `effects-fit`, `copy-fact`, `copy-actions`.
- Any other FAIL fails the gate. WARN does not.
- Exit 2 means taste could not check. Report it with the reason.
- The filter was tried on one static page. A real app may raise other page-only ids. Report a FAIL you judge false, with the reason.

## The rubric

Score each question 0, 1 or 2. Total is out of 10.

1. The one question is answered first.
2. One system: buttons, cards, type scale.
3. States are covered.
4. The phone layout works.
5. Contrast and touch targets hold.

Score the `shoot.mjs` screenshots, before and after:

```
node <taste>/scripts/shoot.mjs --url <url or file> --w <width> --out .plans/<task>/taste/<before|after>/<screen>-<width>.png --profile <dir>
```

## Native

The platform frame rules stay in `native.md`. These rules apply to the content inside the frame.
