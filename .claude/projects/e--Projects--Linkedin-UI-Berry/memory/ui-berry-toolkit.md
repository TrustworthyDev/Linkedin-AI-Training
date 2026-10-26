---
name: ui-berry-toolkit
description: "Permanent UI Berry test toolkit at E:/Projects/@Linkedin/UI Berry/_tools (run.js first pass, steps.js targeted checks, lint.js answer checker + Feedback.md append)"
metadata:
  node_type: memory
  type: reference
  originSessionId: 82e2dfb0-6ded-4259-8c5f-c82fb107381e
  modified: 2026-10-23T14:01:05.987Z
---

On 2026-10-22 I built a permanent toolkit in `E:\Projects\@Linkedin\UI Berry\_tools`. It has its own `node_modules` (puppeteer-core) and uses Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`. Output goes to `%TEMP%\uiberry\<TaskID>\`.

- `node run.js <ID>`: unzip, map Website A/B, print the request and missing images (EAGER vs lazy), sitepass both sites in the sandboxed 1000x800 frame, a placeholder layout view, contact sheets (A left, B right) and `digest.txt`. It tests editing tasks' After panes at 680px.
- `node steps.js <ID> <A|B> '<json steps>'` (or `@file.json` when the steps contain backslashes, since Git Bash collapses them): real-input clicks, hovers and selects, plus find, measure, list, state and shot. It prints only visible-text diffs, so screen-reader text can't sneak into quotes.
- `node style.js` and `run.js` pick the next opening set + rhythms from the last Feedback.md entry; `run.js` writes `%TEMP%/uiberry/<ID>/draft.md` with openings pre-filled.
- `node both.js <ID> <json|@file>`: same steps on A and B in parallel (symmetric weak-spot checks, "has no..." finds). sitepass and steps now diff only VISIBLE text and report `visual N%` screen change above the page's own motion ("VISUAL CHANGE ONLY" = control works without text change). run.js also writes `sheet_hero.png`, a full-res close-up of the requested object.
- `node lint.js <draft> --append <ID>`: checks every prompt.md §4 rule and style repeats against the previous task, appends to Feedback.md only when there are 0 errors, and prints the chat block. `node lint.js --task <ID>` checks an existing entry, for example one the user edited by hand.
- `frame.js` has `protocolTimeout` 30s, timeout-safe `text()`/`ev()` and normalizes forward-slash roots (they used to 404). sitepass saves its click log after every click and stops after 3 hung controls, so a frozen page keeps partial results; finish with steps.js.

Use it on every task as described in prompt.md §1.1 and §8. See [[task-workflow]] and [[follow-feedback-md]].
