---
name: follow-feedback-md
description: "For every UI Berry website-comparison task, follow Prompt/prompt.md (rulebook with control inventory, reason templates, banned words) and check Prompt/Feedback.md for new reviewer notes"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 1fcf95c3-9e0b-4a50-9959-f4c5f13dc532
  modified: 2026-10-22T23:16:36.685Z
---

`Prompt/prompt.md` is the full rulebook. §3.3 is a mandatory control inventory, §4.1 lists hard writing rules, §4.2 rotates four opening style sets (one per task), §4.3 rotates four body rhythms (R1 evidence list, R2 contrast first, R3 walk-through, R4 request fit), §4.4 has the templates, §4.5 the 5/5 model answer (3993160), §6 is the checklist, §7 the lessons table and §8 the _tools commands. On every task, read prompt.md, then scan Feedback.md for new `## Feedback:` entries and fold them into §7 and the rules.

Scores so far: 3987088=4, 3979081=4, 3988061=4, 1210318=3, 3977933=3, 3978133=4, 3979206=4, 3991159=2, 3992127=4, 3987199=4, 3993160=5 (first 5/5), 3983197=5, 3988286=3, 3998166=5, 3992248=4, 3992243=4, 3996194=4. The rules that cost the most:
- **Words:** spell "Website A" and "Website B" exactly (never "Web Site"). No "you", "users" or "visitors". No category names in the text (aesthetics, functionality, function, overall, satisfaction), so write "Website A is the best option because...", not "the better overall pick". Straight apostrophes only, one paragraph per reason.
- **Verify each control's real effect, not just its label.** Chart range buttons must redraw the line and axis (3991159: Website B's only changed the dates). A Pause button must update every status label.
- **Control inventory:** list shared and unique controls on each site. One extra working filter can decide Functionality (3979206). Never say a site "matches everything" while naming the other site's unique features (3991159).
- **Not flaws:** normal compact UI such as cut-off text in short timeline bars (3979206). An on-screen warning counts as an explanation. Lazy-loaded images missing on both sites are a saving gap, but a missing image that loads right away is a real flaw (3988061).
- On-screen evidence only: no code, network or storage claims. Quote only text visible on screen, never screen-reader-only text (3992127). Describe colors and positions exactly as a screenshot shows them, and open every photo at full size to look for rainbow or AI artifacts (3987199).
- **Ties open "Website A and Website B are tied because"**, never "Both Website A and Website B are..." (3993160). Name a weak spot for each site in ties. Name small unique controls inside views, like a List view search or sort toggle (3993160). 80–110 words per reason.
- **Judge the deliverable noun** ("Make a logo" means compare the logos up close) in every reason (3988286=3). **One flaw, one home:** never repeat a flaw in all three reasons. **Outside-host links are never evidence** (they failed locally but worked for the reviewer). **Test a weak spot on both sites** before giving it to one (3998166).
- **Openings mirror the chosen option (3996194):** always "Website X is better because" (ties: "Website A and Website B are tied because"); the old rotating openings are retired, variety lives in the body. **Unrequested extras never decide a field** (3992248: both delivered the requested island, so Functionality and Overall tie). **Plain ASCII punctuation**, no middle dot (3992243); split long list sentences. **Inventory selects/menus** too (3996194).
- **Vary the writing every task:** next opening style set and a different body rhythm per reason; `_tools/lint.js` warns when an opening, sentence starter or any 4-word phrase repeats recent answers; prompt.md §4.3 has sentence shapes and a phrase bank (retired stock phrases listed there).

**Why:** the user's goal is 5/5 on every task, and each lost point traces back to one of these rules. The "Web Site" spelling and curly apostrophes on 3991159 came from edits after my draft. Remind the user to paste the text exactly.

**How to apply:** follow the prompt.md §4.2–4.4 sets, rhythms and templates, then run `node lint.js <draft> --append <ID>` (0 errors) plus the judgment items of the §6 checklist before handing over answers. See also [[task-workflow]], [[review-test-method]] and [[editing-task-format]].
