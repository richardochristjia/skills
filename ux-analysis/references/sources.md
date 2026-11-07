# Sources

Each claim the skill relies on, its number, and the primary source. Checked against the live pages. Anything that did not verify is listed at the end and is not used.

| Claim | Number | Source |
|---|---|---|
| GPT-4o's heuristic review on screenshots: share of its issues that were false positives | 27 of 68 issues (24.3%), after merging duplicates | Guerino et al. 2025, "Can GPT-4o Evaluate Usability Like Human Experts?", https://arxiv.org/abs/2506.16345 (full text, section 4.1) |
| Same study: share of the human experts' issues that GPT-4o also found | 14 of 66 (21.2%) | https://arxiv.org/abs/2506.16345 (abstract) |
| Same study: the paper classes a false positive as an issue that cannot be seen in a screenshot, a generic issue with no place named, or one the researcher disagrees with | three classes | https://arxiv.org/abs/2506.16345 (full text, method) |
| Raw GPT-4 audit of 12 pages against human experts | 20% accuracy, 80% of recommendations false positives, 14% of issues found | NN/g on Baymard's test, https://www.nngroup.com/articles/baymard-ai-tool-accuracy/ |
| Two evaluators agree on few problems | median any-2 agreement 27% across 33 studies, range 4% to 75% | Sauro, MeasuringU, https://measuringu.com/evaluator-effect/ |
| Percentages on small samples | A percentage can be computed at any n. Give the fraction and an adjusted-Wald interval. | MeasuringU, https://measuringu.com/should-you-report-numbers-with-small-n/ |
| Severity scale | 0 not a problem, 1 cosmetic, 2 minor, 3 major, 4 catastrophe. Three factors: frequency, impact, persistence. Raters score alone. One rater is too unreliable. | NN/g, https://www.nngroup.com/articles/how-to-rate-the-severity-of-usability-problems/ |
| Cognitive walkthrough, four questions at each step | Will the user try to achieve the right effect? Will they notice the correct action is available? Will they associate it with the effect they want? If they take it, will they see progress? | Wharton, Rieman, Lewis, Polson 1994, p. 106, as quoted at https://usabilitybok.org/cognitive-walkthrough/ |
| A cognitive walkthrough asks at each step whether a first-time user would know what to do | descriptive | Baymard, https://baymard.com/blog/ecommerce-ux-research-audit-guide |

## Not used

- "GPT-4o's false positives were mostly 'feedback missing'." The paper says its false positives came from hallucination and from predicting issues that screenshots cannot show. It does not give that split as stated. The skill says only the second.
- "No bare percentages below n=30." Not a MeasuringU rule: it says percentages are fine at any n with an interval. The skill's rule is its own: always write n of N and an interval.
- Baymard's UX-Ray accuracy figure. The page gives a per-guideline 95% inclusion bar, not a measured average.
- Baymard's conversion and abandonment numbers. Vendor claims with little method detail.
