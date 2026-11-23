# AI agents — presenter handout

**15 minutes: 13 minutes talk and demo, 2 minutes Q&A.** Times are elapsed from the start. Start directly on slide 1. If you’re behind, trim the spoken customer and handover examples, not the demo or Q&A.

## 01 — AI agents · 0:00–1:30

**Say:** An AI agent uses tools to work toward a goal. You give it the goal and say what it’s allowed to use. It checks one source, uses what it finds to decide where to look next, and reports back. You’re still responsible for what happens next.

**Cue:** Walk through the four steps. If a note is out of date, an agent can look for a newer one rather than treating the old note as current.

## 02 — Chat: Summarize the notes I give you · 1:30–3:00

**Say:** I paste this week’s meeting notes and ask, “What did we agree to do?” Chat reads what I supplied and gives me the answer: send the draft on Friday. If I already have the notes and only want a summary, regular chat is enough.

**Cue:** Point at the one set of notes. There’s nothing else the answer needs to look up for this version of the task.

## 03 — Agent: Find and compare the notes · 3:00–4:30

**Say:** Same question: “What did we agree to do?” This time I haven’t collected the notes. The agent finds this week’s and last week’s notes in sources I allow it to read. It reports Friday’s draft and flags last week’s unfinished FAQ review. Retrieval changes what evidence is available, not whether the answer is automatically right.

**Cue:** Trace both notes to the answer. Either mode can live in the same app; the difference here is whether it needs to go find and compare the sources.

## 04 — AI Agent Harnesses · 4:30–5:00

**Say:** A harness is the app or setup that gives the AI its tools and sets what it can do with them. These are examples. We’ll use Pi in the demo.

**Cue:** Move on without comparing products.

## 05 — What are customers asking for? · 5:00–6:00

**Say:** Give an agent permission to read a set of feedback. It can gather scattered comments and group them into themes. Here, two different comments point to sign-in friction. This is a starting point for reading the evidence, not a vote count.

**Cue:** Read one comment from each theme; point out what was grouped.

## 06 — What does my teammate need for handover? · 6:00–7:00

**Say:** An agent can read open tasks and recent updates and turn them into a handover. Design approval is still open; the latest update moved the release to Tuesday. The teammate gets what’s open and what changed without hunting through both sources.

**Cue:** Point from the two inputs to the handover. Skip the second example sentence if running late.

## 07 — Which frontend apps need my attention? · 7:00–9:00

**Say:** If I look after several frontend apps, I can ask where to spend time first. Northstar has a known issue, Canopy has a current note with no issue found, and Harbor’s status is unknown. “No issue found” describes the evidence, not a guarantee. Unknown is different: we don’t have enough current evidence to say.

**Cue:** Point at each status. Explain that the human decides whether to investigate, escalate, or do nothing. Next, we’ll check where those labels came from.

## 08 — Let’s try it in Pi · 9:00–13:00

**Say:** Here’s the whole task, including what Pi can read and what it must not do. The date is fixed and all four files are fictional. I’m asking it to read—not to check a live app or send an update.

**Cue:** Switch to Pi. Point out `northstar.md`, `canopy.md`, and `harbor.md` as the starting notes. Watch for `updates.md` when Harbor’s note turns out to be stale. On the result, point to the citations and explain why the second source leaves Harbor unknown.

**Fallback cue:** At **11:00 elapsed**, if the result hasn’t arrived or can’t be explained from the cited files, stop troubleshooting, switch to the pre-opened `demo/fallback.png`, and say: “This is a saved run on the same fictional notes, not today’s live result.” Trace the same sources on the screenshot. Return to slide 9 by **13:00**.

## 09 — What would you ask an agent to check? · 13:00–15:00

**Say:** What would you ask an agent to check? What sources would you let it use? Where would you want it to stop and ask you?

**Cue:** Take questions. Close at 15:00 with the distinction: use regular chat when the evidence is already in front of you; use an agent when it needs to go find and compare evidence.

## Figma Slides and rehearsal

1. Open the Figma file browser. Choose **Import** and select `ai-agents.pptx`, then open the imported deck in Figma Slides. See [Figma’s PowerPoint import guide](https://help.figma.com/hc/en-us/articles/30601628883607-Import-PowerPoint-files-to-Figma-Slides).
2. Confirm all nine slides are in order. Check the title, diagram, and full prompt for wrapping or clipping. Open presenter view and check speaker notes; keep this handout beside the deck if import shifts or drops any notes.
3. Pre-open the fictional demo terminal and `demo/fallback.png`. Rehearse switching from the deck to Pi, switching to the screenshot at 11:00 if needed, and returning for Q&A at 13:00. Finish at 15:00.
4. After a dry run, ask a non-technical colleague when regular chat is enough and for one task they would give an agent.

## Pi: launch the read-only demo

From the repository root, enter the fictional demo folder and run:

```sh
cd presentations/ai-agents/demo
pi --no-session --no-extensions --no-mcp --no-skills --no-context-files --no-prompt-templates --tools read
```

Paste the exact prompt below. Use an already configured Pi model. Only the `read` tool is enabled; the prompt limits reads to the four fictional files. Launch from this folder, not a real project. Pi sends the fictional prompt and notes to the configured model provider as part of answering; the instruction not to send is about taking further actions. Never substitute real files for this demo.

### Exact demo prompt

```text
Which frontend apps need my attention on 2026-04-15?
Read only northstar.md, canopy.md, and harbor.md first.
If a note is older than 7 days, check updates.md for a current status.
Give each app one label: Needs attention, No issue found, or Unknown.
Use Unknown if current status can’t be verified. Cite the files you checked for each app and give one short reason per app.
Do not change or send anything.
```

For a non-interactive check, add `--print --` and pass the exact prompt as one quoted argument. Run `shasum -a 256 *.md` in `demo/` before and after; the four hashes should match. Expect Northstar **Needs attention** (`northstar.md`), Canopy **No issue found** (`canopy.md`), and Harbor **Unknown** (`harbor.md`, `updates.md`).
