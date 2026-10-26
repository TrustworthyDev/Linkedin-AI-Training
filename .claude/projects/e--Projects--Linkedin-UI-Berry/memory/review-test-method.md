---
name: review-test-method
description: "How UI Berry reviewers actually test the two websites, and the verification steps that avoid claims they can't reproduce"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 13445d85-09b7-4689-af32-d2b4eead7792
  modified: 2026-10-22T19:40:56.889Z
---

Reviewers judge each site inside the task page's iframe. It is 800px tall, roughly 800–1100px wide in a split view, and sandboxed with `allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms`. There is no `allow-downloads`.

Lessons from past tasks (6250470, 6261407, 6250482, 6251496, 6264396):
- Chrome blocks every file download inside that iframe ("Download is disallowed… sandboxed"), even when the site shows a success toast. On 6250470 an answer said "both downloads work" and the reviewer marked it wrong. Never use a download as evidence unless it was checked in the frame. Prefer behavior that works there, such as localStorage saves, dialogs and redraws.
- Click with real mouse input (`page.mouse.click`) and check `elementFromPoint`. `element.click()` from script bypasses overlays and hit-testing and hides broken controls.
- Screenshot and look at every gallery or collection item close up. On 6261407 the overlap on the 7th fish card was missed because only the first screen was captured. Text inside SVG badges can be covered by shapes, and automated overlap scans miss it.
- Click every tile, card or code block that looks clickable, and name the dead ones ("code tiles that do nothing on click"). Count the options, for example "three backgrounds, SVG-only download", instead of writing "more limited".
- Back visual claims with concrete evidence, for example "a flat dark green silhouette with only the carrot in color" or "pale labels fade over the yellow photo".
- No phone or mobile claims. Reviewers can't confirm them from the pages (6264396). Prefer flaws that show at every desktop width over ones that only appear at one size.

- On every task, check for broken or missing images (resources that return 404, alt text showing). The reviewer sees them too, so never dismiss them as a problem with the saved files (3988061).
- Before comparing the size of two characters or logos, measure each element's real pixel size.
- At every scroll position in the review frame, look for empty gaps under cards and uneven columns.
- After toggling a state (pause, stop, finish), check that every status pill and badge updates. A leftover "Live" label is a bug (1210318).

**Why:** On 2026-10-16 the user asked me to learn from the past tasks' review folders and feedback, then apply that to new tasks.

**How to apply:** Run the review-frame harness (sandboxed iframe, width 1000, height 800, real input) on every new task alongside the full-size pass. Write reasons only from behavior that holds in the frame. See [[follow-feedback-md]] for the writing rules.
