---
name: editing-task-format
description: "How \"Editing A/B Preference\" UI Berry tasks are structured (before/after wrappers, Satisfaction + Overall questions) and how to analyze them"
metadata:
  node_type: memory
  type: project
  originSessionId: f8a5e762-7fbb-4457-be01-c3d4ec5d57a6
  modified: 2026-10-16T20:25:06.783Z
---

Some UI Berry tasks are "Editing A/B Preference" rather than Aesthetics/Functionality/Overall. First seen on task 6260728 (2026-10-16).

- **Two questions only:** Satisfaction (does the edit fulfill the request; ignore polish unless it blocks use) and Overall (function plus looks). The options are "A is better / B is better / Both are good / Both are bad". Write "Satisfaction: …" and "Overall: …" in the same code-block format as [[follow-feedback-md]].
- **Wrappers:** the Website A and Website B tabs each load a small wrapper (saved_resource.html and saved_resource(1).html). Each wrapper shows the request banner and two side-by-side panes, "Before Edit" and "After Edit". Only the After pane is judged. On 6260728, A was before (2) / after (3) and B was before (4) / after (5). Always confirm this from the wrapper's iframe src values.
- **The "before" page is usually identical in both,** so the edit is the only difference.
- **Reading the code:** the big (~25MB) saved pages have a header comment `saved from url=(N)data:text/html;base64,...` that holds the original page source. Decode it and compare before/after. The bundles get rebuilt, so the minified names all change. Compare aria-labels, `children:"..."` strings and CSS class names instead of doing a line diff.
- **Pane size:** each After pane is only about 480–680px wide and about 630px tall inside the 800px task frame, so sites switch to their mobile layout. Floating widgets cover more content there. Test there with real mouse input, as in [[review-test-method]].

- **Reviewer feedback on 6260728 (score 2):** Overall must judge the whole After website (hero, images, navigation bar, sections, all buttons), not just the new feature. When both edits are very good with small drawbacks, the answer is "Both are good". The Satisfaction reason must open with the tie sentence itself, and the form pick must match the reason.

**Why:** the user said this task type is tricky. It's easy to judge the wrong pane or miss that only the edit differs.

**How to apply:** for each side, check that every part of the request exists and works in the After pane. Then compare how cleanly each edit fits into the page.
