# UI Berry: Website Preference Tasks

## 0. Fast Lane (16-minute limit; these habits produced the 5/5 scores)
1. **Start `node run.js <TaskID>` first** and read the User request while it runs. It writes the screenshots, the click log, and `draft.md` with this task's style set.
2. **Judge the exact thing requested** (a logo, a hero island, a chart) up close in every reason. Then **inventory every control** on both sites, small ones included, and check each one's real effect. One extra or half-working control decides Functionality. Links to another host prove nothing either way.
3. **Write only what a screenshot shows:** visible text, exact colors and positions, broken eager images, photo artifacts.
4. **Verdict first, mirroring the chosen option:** "Website X is better because"; ties open "Website A and Website B are tied because". Name a weak spot for each site (tested on both), and call shared features shared. Keep each flaw in one reason, and write with fresh sentence shapes and phrases (4.3).
5. **`node lint.js <draft> --append <TaskID>`** must show 0 errors. Paste the printed block exactly.

**Correctness gate (60 seconds before lint).** Every point lost so far traces to one of these:

| # | Check | Cost points on |
|---|---|---|
| 1 | The requested object (logo, island, cockpit, chart) is judged up close in every reason | 3988286 |
| 2 | Every control credited was seen working: a text diff, `visual N%` or a screenshot. Outside-host links are ignored | 3991159, 3988286 |
| 3 | Every "has no..." claim passed a `find`, and no strength credited to one site also exists on the other | 6241898, 3992243 re-check |
| 4 | Each weak spot was tried on both sites | 3998166 |
| 5 | Quotes are visible text; colors, positions and motion match a screenshot | 3992127, 3987199 |
| 6 | Each flaw lives in one reason only | 3988286 |
| 7 | Shared features are called shared; no "matches everything" | 3991159 |
| 8 | Broken eager images, empty gaps and wrong status labels were looked for | 3988061, 1210318 |
| 9 | The deciding difference serves the request; unrequested extras alone mean a tie | 3992248 |
| 10 | Every select, menu and slider on the losing site is credited | 3996194 |

## 1. What I Provide
- A **Task ID**. The folder with that name holds the task HTML (instructions and the User request) and the saved files for Website A and Website B. Sometimes they come zipped.
- Screenshots of both websites (optional, and often cut off).
- Reviewer feedback from earlier tasks in `Prompt/Feedback.md`. Read it before every task.

When a new Task ID comes in, work only from that folder. Never reuse content from a previous task.

### 1.1 Time-boxed workflow (hard limit: 16 minutes per task)
The toolkit in `E:\Projects\@Linkedin\UI Berry\_tools` does the slow parts (section 8). Run every command from that folder. Section 0 and the rules in sections 3–4 replace a separate prep read: all feedback is already folded in.

| Clock | Step | What to do | Done when |
|---|---|---|---|
| 0:00–4:00 | 1. First pass | Start `node run.js <TaskID>` right away (about 3–4 min). While it runs, turn the User request it prints into a checklist (3.1). | The request checklist is written; `digest.txt`, the sheets and `draft.md` exist. |
| 4:00–7:00 | 2. Inventory | Read `digest.txt` first: each click shows visible text added or removed and `visual N%`, the share of the screen that changed. "VISUAL CHANGE ONLY" means the control works without changing text (variant tabs, backgrounds, camera views). Then read `sheet_hero.png`, a full-resolution close-up of the requested object on both sites, and `sheet_layout_1.png`. Mark each control shared, unique or broken (3.3), and note one visual strength and one weak spot per site (3.5). | Picks are clear, or the one open question that decides them is named. |
| 7:00–10:00 | 3. Targeted checks | **One `node both.js` call** runs the same steps on both sites at once. Use it for the open question and for symmetric checks: the same weak spot on both sites, and a `find` behind every "has no..." claim. Use one `steps.js` call only when a site needs its own clicks. Open a photo file only if a photo is central to the request. | Every planned sentence is backed by a sheet or a check line. |
| 10:00–14:00 | 4. Write | Make the picks (3.6). Fill `draft.md` (Set openings and rhythms are already in it). | Each reason is 80–110 words. |
| 14:00–15:00 | 5. Lint and deliver | `node lint.js <draft> --append <TaskID>`. Fix every ERROR in one pass and rerun. Paste the printed chat block in one code block. | 0 errors; the entry is appended with an empty `## Feedback:` slot. |
| 15:00–16:00 | Buffer | Only for a lint rerun or a failed script. | Delivered by 16:00. |

**Speed habits:**
- Keep it to about eight tool calls: run.js, the hero and layout sheets, one both.js call, maybe one steps.js call, writing the draft, and lint.
- A "NO VISIBLE CHANGE" line with no visual percentage means the control really did nothing on screen. A low percentage (2–5%) on a small target, such as a variant swap on a small logo, still counts as working.
- Don't open `sheet_full.png` or the individual `click_NN.png` files unless the digest line for a control is unclear.
- Write the answer straight from the inventory notes. No second evaluation pass.

**Stop rules (they protect the time budget):**
- If `run.js` has not finished by 6:00, carry on with whatever sheets and digest lines exist.
- A script that fails twice is dropped. Use the screenshots already taken and two or three `steps.js` clicks instead.
- A heavy 3D or WebGL page that times out: rerun that site alone once. If it still fails, judge from the frame screenshots.
- `digest.txt` says "stopped after 3 failed controls in a row": the clicks before that point are saved. Check only the remaining controls that matter with one `steps.js` call.
- A check is worth running only if its result could change a pick or a sentence. Otherwise skip it.
- Games: play one core loop in each requested mode. Never play to the end.
- Never spend time on what the reviewer can't see: code, storage, downloads, phone layouts, timing, console messages.
- When two picks are close, spend the remaining minutes on the one deciding difference, not on extras.

**After delivery:** when feedback arrives, add a row to section 7 and update the rule it touches.

---

## 2. Task Types

### Type 1: Aesthetics / Functionality / Overall
Three independent picks. Each one is **A is better / B is better / Both are good / Both are bad**.
- **Aesthetics:** visual quality only: layout, composition, typography, color, polish, spacing and visual defects. Ignore whether controls work.
- **Functionality:** behavior and prompt-following only. Does the requested content render, and do the links, buttons, controls, navigation and interactions work? Ignore polish unless broken rendering blocks the check.
- **Overall:** the complete experience, weighing looks and behavior together. It doesn't have to match the other two picks.

### Type 2: Editing A/B Preference (Before / After)
Two independent picks: **Satisfaction** and **Overall**.
- Each tab (Website A, Website B) shows a split screen with **Before Edit** on the left and **After Edit** on the right. Judge the **After Edit** side. The Before page is usually the same for both.
- **Satisfaction:** does the After site do what the edit request asked? Are the requested parts there, and do they work? Ignore polish unless it blocks use.
- **Overall:** the **whole After website**, not just the new feature. That covers the hero section, images, navigation bar, every section, all buttons and the requested feature, and how they look and work together.
- `run.js` finds the After panes and tests them in a 680px frame. If it can't find them, it says so; then run `sitepass.js` on the After files by hand.

### Which file is which
In the task HTML, the first iframe sits in the "Website A" tab and the second in the "Website B" tab. Usually Website A is `saved_resource.html` and Website B is `saved_resource(1).html`. `run.js` prints the mapping.

A site that fails to load, freezes or can't be inspected counts as a **functionality failure**.

---

## 3. How to Evaluate

### 3.1 Start with the request
Turn the User request into a checklist of every concrete requirement:
- elements and content
- colors and style
- modes
- behaviors
- limits, for example "just one page"

Check every item on both websites.

**Name the deliverable first.** Find the noun the request asks for: "a logo", "a low poly island for the hero", "a chart". Judge that object directly and up close on both sites, and put it in every reason, even when both sites built a whole page around it (3988286: "Make a logo..." was answered with page features, and the reviewer docked it because Website A's shark-trait logo and Website B's malformed mark were never compared). Zoom in on logos and SVG marks. A console warning like `<path> attribute d: Expected number ... NaN` hints at a broken drawn shape, but the evidence is what the mark looks like on screen.

### 3.2 Test the way the reviewer does
Reviewers use each site inside the task page: a frame about **1000px wide and 800px tall**. Editing panes are only about **480–680px wide**. Test there, with real mouse clicks, hovers, drags and key presses. `run.js` and `steps.js` already do this.
- Click **every** button, tab, filter, toggle, card, tile and menu item, and note what each one does. Note the ones that do nothing. Footer and legal links only need one quick pass (see 3.7). `digest.txt` lists the result of every click.
- **Check that each control changes the thing it claims to change, not just a label.** Compare the affected element before and after:
  - A chart's range buttons must redraw the line and the value axis, not only swap the date labels (3991159: Website B's period buttons only changed the dates).
  - A filter must change the list.
  - A Pause button must stop the updates and change every status label.
- Make sure menu items and buttons can be clicked across their whole area (`steps.js` warns when something else sits on top of a control).
- Hover **every** tooltip, bubble and hotspot.
- Open **every** gallery or collection item and look at each card up close for overlaps, cut-off text and broken labels.
- **Open every view and tab, then look for the small controls inside it**, such as a search box or a sort toggle in a List view (3993160).
- On forms, try blank input and bad input. Note any warning text shown inside the form; that counts as an explanation (3979206).
- On games and tools, run the core loop once in **each requested mode**.
- Take one full-size look for the overall visual impression.

### 3.3 Build a control inventory (mandatory)
Before deciding anything, write a side-by-side list of **every control and feature on each site**, and mark each one:
- **Shared**: both have it and it works on both.
- **Only on Website A** or **only on Website B**: name it exactly, for example "an All resources filter on the schedule". Include the small ones inside views: a search box, a sort toggle, a menu inside a tab (3993160).
- **Broken or half-working**: say exactly what fails, for example "the period buttons only change the dates".
- **Menus and form controls count too.** List every select (with its options), slider, toggle and field; `digest.txt` now prints them as SELECT, SLIDER, TOGGLE and INPUT lines. Credit the losing site's full set fairly (3996194: Website B's SVG / PNG 1K / 2K / 4K export menu was left out, which understated it).

The inventory decides Functionality and keeps Overall honest. One extra working control can be the whole reason one site wins:
- 3979206: Website A's extra "All resources" filter decided Functionality.
- 3991159: Overall was marked down for saying Website A covered everything while naming features only Website B had.
- 3993160 (5/5): the reviewer still wished the List view's state search and sort toggle had been named.

### 3.4 What counts as evidence
- **Only what a reviewer sees on screen in normal use**, within a minute or two of clicking or playing. Describe longer flows through what's visible: scoreboards, buttons, rules text, targets.
- **Never use as evidence:**
  - Whether a file download works. Downloads are blocked in the review frame. A menu item that can't be clicked is still a valid point.
  - Phone or mobile layout.
  - Timing or speed numbers.
  - Console messages.
  - Flaws that only show at one window size.
  - **Anything learned from the code or network traffic**, such as endpoints called, FormData, or how a game is programmed (1210318).
  - **Anything that depends on saved browser storage**, such as a best score or draft kept after a reload (3978133).
- **Broken or missing images:**
  - If a picture the page loads right away is missing, the reviewer sees it broken too. This means a broken-image icon, alt text, or an empty box where a photo should be. `run.js` marks these "EAGER".
  - That counts as a Functionality failure, and as an Aesthetics flaw when it leaves a visible hole (3988061).
  - Images marked "(lazy)" that are missing on **both** sites are a saving gap, not a site flaw. Judge the layout around them (the layout sheets use neutral placeholders) and leave them out of the reasons.
- **Normal production patterns are not flaws.** Text clipped inside a short timeline bar, ellipses in tight table cells and similar compact UI are normal (3979206: cut-off names in one-hour bars weren't accepted as a flaw).
- **Measure before comparing sizes.** Never call an element "tiny" or "bigger" from a scaled-down screenshot (3978133). Use `{"measure":"css"}` in `steps.js`.
- **A feature both sites have is never a difference.** Before crediting one site, confirm the other doesn't have it too.
- **Look again before calling something an advantage.** If it could be read as a flaw, leave it out.
- **Look again before calling something a failure.** If the site showed a warning or reason anywhere on screen, it explained itself (3979206).
- **Only quote text that is visibly on screen.** Screen-reader-only text (hidden live regions, `sr-only` labels, `aria-label`s) doesn't count. Before quoting a message, confirm it appears in a screenshot (3992127: "Hint names the exact row and column" came from hidden text; on screen the hint only highlights the piece and its space). `steps.js` diffs only visible text for this reason.
- **Describe visuals exactly as a screenshot shows them.** Check colors, positions and which element moves before writing about them. Never infer relationships, such as "a plate inside a turning ring", when the badge actually sits at the plate's corner (3987199). Never call a white header with a green button a "bold green header" (3992127).
- **Zoom into every photo and illustration at full size** to look for artifacts: rainbow or color-banding patches, smeared AI details, distorted text, stretched images. These are the clearest visual flaws (3987199: rainbow patches in Website B's photos were missed). Open the files listed under "photos to zoom" in `digest.txt`.
- **Links to another host are never evidence.** A link pointing at an outside address (`https://...azure.com/#product`, a social page, a store) can fail in the local test and work for the reviewer. The tools tag these clicks "OUTSIDE LINK". Never call them broken (3988286: Website A's header links "opened an error page" locally, but the reviewer found they work).
- **Check every "has no..." claim with a text search on that site** (`{"find":"gear|brake"}`) before writing it, and every listed strength against the other site's features. On 3992243 the re-check caught Website B's "Landing gear FIXED · DOWN" status line and weather presets that Website A also had.
- **Test a weak spot on both sites before giving it to one.** Repeat the same action on the other site first, for example a 15-minute booking, a long name or a narrow block (3998166: Website A's 15-minute booking also shrank to a sliver with a stray letter, so a hidden name wasn't only Website B's problem).
- **Don't over-claim.** Describe only what was actually shown.

### 3.5 What to check under each lens

**Aesthetics**
- Match to the requested look: colors, style and shape.
- The main visual (hero, logo, model, chart, character), with a specific detail of how it's drawn. For example: "a crate drawn as a flat dark green silhouette with only the carrot in color".
- The frame and page style: a dark cabinet or frame, the title treatment, the page background color (3978133).
- Layout and spacing: crowded areas, alignment, balance. Look for **uneven columns and empty gaps**, like a card that ends early and leaves a blank area while the next column keeps going (1210318).
- Typography and readability: text over photos, pale labels fading out, contrast.
- Visible defects: overlaps, cut-off text, wrong labels, elements covering content, broken images, photo artifacts.
- Consistency and polish across sections, cards and icons.

**Functionality**
- Each item on the request checklist: is it present, and does it work?
- Each control named with its real result, checked as in 3.2.
- Dead or half-working controls named exactly: "code tiles do nothing on click", "the period buttons only change the dates".
- Options counted: "three backgrounds and an SVG-only download".
- Working features only one site has, taken from the inventory in 3.3, small ones included.
- Navigation: menu links, tabs and pages actually open.
- Forms: blank and invalid input are rejected or explained.
- **Status labels that don't match the real state** are bugs, for example a "Live" or "Running" label shown while paused (1210318).
- Content that should show but doesn't: broken images, empty panels.
- **Visual details never go in Functionality.**

**Satisfaction (editing tasks)**
- Each requested change is in the After site, works with a real click and does the whole job.
- Ignore polish unless it blocks use.

**Overall**
- Cover the whole site: hero, images, navigation bar, sections, all buttons and the requested features.
- Weigh at least one visual point against at least one behavior point.
- Credit the other site's unique strengths **as unique**. Never write "matches it feature for feature", "covers everything the other has" or "does everything Website B does" unless the inventory shows that's literally true (3991159).

### 3.6 Decision rules
- Each question is judged on its own. Overall can differ from the others.
- Decide by the **biggest real difference in that lens**, not by counting nitpicks.
- **Functionality:** a working extra control on one site, or a broken or half-working control on the other, decides it (3979206, 3991159, 1210318), **as long as that control serves what the request asked for**.
- **Unrequested extras never decide a field.** When the request names one thing (a hero island, a logo, one tool) and both sites deliver it, extras such as a store, rules, a FAQ, a leaderboard or edition tabs are credited as extras but can't pick a winner. Functionality and Overall then tie (3992248: both islands were delivered, so the reviewer changed Functionality and Overall from Website A to Both are good). An extra only counts when it serves the requested job, like the "All resources" filter on a requested scheduler (3979206).
- **Aesthetics:** a real visible defect decides it: a broken image, an empty gap, an overlap, unreadable text or a clear photo artifact. Different styles, or normal production compactness, are a tie: **Both are good** (3979206).
- **Ties** only when the inventory shows no real difference and neither site has a real visible defect. Ties held on 3987088, 3979081, 3979206 (Aesthetics) and 3993160 (Aesthetics). They were overturned on 1210318, where a real defect existed.
- **Every site has a weak spot.** Write one down for each site before deciding.
- When Aesthetics and Functionality both go to the same site, Overall usually goes there too. When Aesthetics is a tie, Overall usually follows Functionality (3993160).
- The option picked in the form must match the reason.

### 3.7 Steps to skip or keep short
**Skip:**
- Testing file downloads. Only check that the button or menu item can be clicked.
- Phone or mobile screenshots.
- Measuring timing or speed.
- Reading console warnings.
- Automatic overlap scanners. Look at close-up screenshots instead.
- Hunting for flaws at many window sizes.
- Re-testing what `digest.txt` already shows clearly.
- Writing new one-off scripts. Use `steps.js` steps instead.

**Keep short:**
- One full-size look for the overall impression (`sheet_full.png`). The review-frame check is the one that counts.
- One quick pass over footer, legal and "About" links.
- Read the site's code only when it saves time. For example, compare Before/After source on editing tasks.
- Play each game mode's core loop once. No need to play to the end.

---

## 4. How to Write the Three Reasons

### 4.1 Hard rules (each one has cost points; `lint.js` checks them all)
- **Name the sites exactly "Website A" and "Website B"** every time. Never "Web Site A", "website a", "A", "B", "A's", "Site A", "Candidate 1" or "Website 1" (3991159, 3987088).
- **Name both sites in every reason.**
- **The first sentence is the verdict.**
- **Never address or name the reader.** No "you", "your", "users", "user", "visitors" or "people". Describe what the site does instead. Write "the leaderboard keeps every row tagged Running", not "it tells users every strategy is running" (3991159).
- **No category names inside a reason.** Don't write "aesthetics", "aesthetic", "functionality", "functional", "function", "overall" or "satisfaction" in the text. The field label already says it (3991159). Write "Website A is better because...", not "Website A is the better overall pick".
- **Straight apostrophes and quotes only** (`'` `"`). Never curly ones (`’` `“`). This was flagged on 3987088, 3979081, 3988061 and 3991159.
- **One paragraph per reason**, with no line breaks (3979081).
- **Third person only.** No "I", "me", "my" or "we".
- **No stiff connecting words** like "therefore", "thus", "hence", "moreover", "furthermore" or "additionally". Use "so", "but" and "and", or start a new sentence.
- **Full sentences only.** Never start a sentence with "Because" as a fragment.
- No em dashes, and no filler like "seamless", "elevate" or "robust".
- **Never write "neither has a weak spot"**, "neither has a flaw" or "nothing is broken" (3979081).
- **No contradictions.** Don't call a site complete or equal while listing things it lacks (3991159).
- **Plain ASCII punctuation only.** No middle dots, bullets, arrows, multiplication signs, ellipsis characters or trademark signs, even when the site shows them: write "FIXED, DOWN" or "fixed and down", not "FIXED · DOWN" (3992243). Letters from on-screen content, like Cyrillic or a ruble sign in a quoted price, are the only exception.
- **Let lists breathe.** A sentence over about 40 words or with seven or more commas reads like a spec sheet. Split it into two sentences (3992243: the reviewer reworded long list sentences "to read more naturally").
- **One flaw, one home.** Put each flaw in the reason whose lens it belongs to, and give each reason its own evidence. A broken image or other visual defect goes in Aesthetics; Functionality counts it only when it blocks requested content, as with the product photos in 3988061. Never repeat the same flaw in all three reasons (3988286). Overall weighs fresh points from each lens instead of restating them.
- Only facts confirmed on screen (see 3.4). Don't mention how the sites were checked.

### 4.2 Openings: mirror the chosen option, vary the body
**The opening is fixed and mirrors the option picked in the form** (3996194: the reviewer rewrote every "is stronger", "is preferred" and "is the best option" opening to match the option):
- **Website A is better / Website B is better:** "Website X is better because..." (`lint.js` errors on anything else)
- **Both are good / Both are bad:** "Website A and Website B are tied because..." Never "Both Website A and Website B are..." (3993160). For Both are bad, continue with what both get wrong: "Website A and Website B are tied because both..."

Variety lives **after "because"**. Each task uses one set of body rhythms, and the set moves on every task:

| Set | Aesthetics | Functionality (and Satisfaction) | Overall |
|---|---|---|---|
| 1 | R3 walk-through | R1 evidence list | R2 contrast first |
| 2 | R4 request fit | R2 contrast first | R1 evidence list |
| 3 | R1 evidence list | R3 walk-through | R4 request fit |
| 4 | R2 contrast first | R4 request fit | R3 walk-through |

`run.js` prints the set and writes `draft.md` with the openings filled in.

### 4.3 Body rhythms: vary the sentences, not the rules
Use the rhythm paired with each field in the set table (4.2). That gives each reason a different rhythm, and the same field never repeats the previous task's rhythm. Every rhythm still covers the template points in 4.4.

| Rhythm | Shape after the verdict |
|---|---|
| **R1 Evidence list** | One long sentence that lists three to five concrete items, then one short sentence on what's shared, then the other site's gap, then the winner's weak spot. |
| **R2 Contrast first** | Credit the other site's real strengths first, then pivot to what the winner adds (pick a fresh pivot from the phrase bank below), then the deciding gap, then the winner's weak spot in proportion. |
| **R3 Walk-through** | Walk the page from top to bottom (hero, sections, cards, form or footer), naming what each part does or looks like, then the other site's miss at the same spot. |
| **R4 Request fit** | Take two or three items from the User request in order and show how each site handles them, then the deciding miss and one weak spot per site. |

**Sentence-level variety (every reason):**
- Mix lengths: at least one short sentence (8–14 words) next to longer ones (20–30 words).
- **Use at least three different sentence shapes in each reason**, picked from:
  - *Subject first:* "Website A pairs a cream page with..."
  - *Place first:* "On Website B's hero, a textured island..." or "Inside the booking form, ..."
  - *Action first:* "Clicking a locked slot on Website A brings up..." or "Dragging the island turns it..."
  - *Contrast in one sentence:* "Where Website A lists room hours, Website B grays out the button."
  - *Count first:* "Three tabs, two copy buttons and a FAQ give Website A..."
  - *Short echo:* "That gap decides it." or "The rule holds on both."
- Never start three sentences in one answer with the same two words (`lint.js` warns).
- Rotate the links between ideas: "but", "and", "so", "while", "with", "since", "plus", "even so", "yet".
- Keep the words everyday American English: short, plain, concrete. No stiff connectors, no filler, no hype words like "perfect" or "stunning".

**Phrase bank: no stock phrase twice in a row.** `lint.js` warns on any four-word phrase reused from the last four answers. Pick a different option each task, or write a new one:

| Move | Options |
|---|---|
| Credit the other site | "Website B deserves credit for...", "To its credit, Website B...", "Website B earns points for...", "Website B gets several things right:", "Website B is not without charm, with..." |
| Pivot to the winner | "Website A matches that and adds...", "Website A answers with...", "Where Website A pulls ahead is...", "Website A builds on the same base with...", "Website A has all of that plus..." |
| The other site's gap | "What Website B lacks is...", "The gap shows on Website B, where...", "Website B stops short at...", "Website B never...", "On Website B, the same click..." |
| The winner's weak spot | "Website A's one soft spot is...", "The only slip on Website A is...", "A small nit on Website A is...", "Website A could use..., but...", "Website A still has a rough edge:" |
| Tie closer | "Those small misses balance out.", "Each slip is minor, so the two stay level.", "Neither point is enough to separate them.", "Both slips are small and roughly even.", "The weak spots cancel each other out." |
| Winner closer | "..., so that gap decides it.", "..., which keeps Website A ahead.", "That one missing filter is the difference.", "..., and that tips the balance.", "..., which settles it." |

Retired after repeated use: "has real strengths of its own", "goes further with", "makes a strong (striking) first impression", "but neither changes the call", "a small miss".

### 4.4 Templates (content each reason must carry)
Each reason is one paragraph of 4–6 sentences and **80–110 words**. Use concrete on-screen words: colors, shapes, section names, button labels, exact visible messages.

**Aesthetics: Website X**
1. **Verdict and the main reason** ("Website X is better because...").
2. **The winner's look, with three or more concrete details:** the main visual and how it's drawn, colors, layout or frame, title treatment.
3. **Another strength of the winner,** for example a section style, card design or readability.
4. **The other site's specific visible problem:** a broken image, empty gap, overlap, unreadable text, photo artifact, or a clear mismatch with the requested style. Name where it is.
5. **One honest weak spot of the winner,** kept small.

*Tie version:* "Website A and Website B are tied because..."
- Describe each site's style with two or three concrete details.
- Name one specific weak spot for each site.
- End with why those don't change the call.

**Functionality: Website X**
1. **Verdict and the deciding behavior** ("Website X is better because...").
2. **The winner's controls and their results:** three to five, each named with what it does. Include the small unique ones (a search box, a sort toggle).
3. **Shared features stated as shared:** "Both sort the leaderboard, filter by..., and...".
4. **The other site's exact gap:** a missing control named exactly, or a broken one with what happens. For example: "Website B's period buttons only change the dates on the chart."
5. **One honest weak spot of the winner,** if there is one.

*Tie version:*
- List the shared working features.
- Give each site's extra and one weak spot for each.
- Never include visual words.

**Overall: Website X** (write it last)
1. **Verdict** ("Website X is better because...") with the deciding factor.
2. **Fair credit to the other site,** with its real strengths named. Call its unique features unique.
3. **The winner's visual point:** one concrete detail.
4. **The winner's behavior point:** one control and its result.
5. **Why the deciding factor outweighs the other site's strengths,** with the winner's own small weak spot kept in proportion.

Overall must not repeat the Functionality sentences or say "matches everything".

### 4.5 Model answers

**5/5 model: 3993160** (openings updated to the mirrored form from 3996194; the tie opening and the List view controls are updated to the reviewer's polish notes)

> **Aesthetics: Both are good.** Website A and Website B are tied because each one turns a heavy subject into a calm, polished page. Website A pairs a cream background with an illustrated heart, a serif Pulse of America title with America in terracotta, and a state map shaded from pale tan to deep rust. Website B goes bolder, with a glossy red 3D heart that gently moves on its own, a burgundy band of 100 small figures with 20 of them lit up, and red bars for each age group. Website A's two-letter state labels are tiny, and Website B's source notes and bar labels are small and pale, but neither issue changes the call.

> **Functionality: Website A.** Website A is better because it shows where heart disease hits Americans hardest and lets every number be explored. Hovering a state shows its percentage, clicking it opens that state's story, the Mortality tab redraws the map in deaths per 100,000, the Women and Men menu recolors the map and updates the top five, and the List view adds a state search and a sort toggle. Both sites show a 1 in 5 deaths chart, open a sources window and end with a next-steps tool. Website B's Coronary artery disease tab shows only one bar for all adults. Website A's state figures are marked as illustrative.

> **Overall: Website A.** Website A is better because it answers the question of which Americans suffer most from heart disease. Website B makes a striking first impression with its glossy 3D heart and burgundy band of figures, and its high blood pressure numbers by age and sex come from the CDC. Website A counters with a warm, tidy layout and a shaded state map that works from end to end, with hover percentages, state stories, a Mortality tab and a Women and Men filter, plus a three-step heart check that ends with next steps. Its state numbers are only illustrative, but Website B never breaks heart disease itself down by group.

Why it scored 5: every claim was visible on screen, each control was named with its real result, shared features were called shared, the other site's unique strengths were credited, and each tie side had one weak spot.

**Functionality example: 3991159** (rewritten to the rules)

> Website A is better because its controls change what they say they change. The period buttons redraw the equity line and its value axis for each range, Pause scanner switches the trade feed badge to Paused, and the filter panel can also narrow strategies by type. Both sites sort the leaderboard, filter by market, timeframe, win rate, drawdown and trade count, compare two strategies side by side and run backtests. Website B's period buttons only change the dates under its chart, and every strategy row keeps a green Running tag after scanning is paused.

---

## 5. Answer Format
Write the whole result in **one code block** (`lint.js --append` prints it ready to paste).

Aesthetics / Functionality / Overall tasks:
```
Aesthetics: Website B
Reason paragraph

Functionality: Website A
Reason paragraph

Overall: Website A
Reason paragraph
```

Editing tasks:
```
Satisfaction: Both are good
Reason paragraph

Overall: Website B
Reason paragraph
```

The draft file for `lint.js` uses the same lines, with or without a leading `# ` on each field line. `Feedback.md` stores each entry as `### Task: <ID>`, `## Answers:`, `# Field: Pick` lines with their reasons, and an empty `## Feedback:` slot.

**Before submitting:** paste the reasons exactly as written. Re-typing, translating, or running the text through grammar or rewrite tools can change "Website A" to "Web Site A", turn straight quotes curly, or add "you" and "users". All of these have cost points. If the text gets edited by hand, check it again with `node lint.js --task <TaskID>`.

---

## 6. Final Checklist (before submitting)
`lint.js` covers the items marked (L). The rest need judgment.
- [ ] Every requirement in the User request was checked on both websites, and the requested object itself (logo, island, chart) is judged up close in every reason (3988286).
- [ ] Each weak spot was tried on both sites (3998166). No outside-host link is called broken (3988286). Every "has no..." claim passed a `find` on that site, and no strength credited to one site is also on the other (3992243 re-check).
- [ ] (L) No flaw appears in all three reasons, and no four-word phrase repeats the last four answers.
- [ ] A control inventory was made (3.3), with small controls inside views included, and each control's real effect was checked, not just its label (3.2).
- [ ] (L) Each reason opens with the verdict, using this task's style set (4.2); ties open "Website A and Website B are tied because".
- [ ] (L) "Website A" and "Website B" are spelled exactly that way, and both appear in every reason.
- [ ] (L) No "you", "your", "users", "user", "visitors" or "people". No category names (aesthetics, functionality, function, overall, satisfaction).
- [ ] (L) Third person, full sentences, no stiff connectors, no em dashes, only straight apostrophes and quotes, one paragraph per reason.
- [ ] Aesthetics has only visual points, and Functionality has only behavior points.
- [ ] Shared features are called shared, and unique features are called unique. No "matches everything" claims (L).
- [ ] Every failure claim was double-checked for an on-screen warning or explanation.
- [ ] Every quoted message is visible in a screenshot, not screen-reader-only text. Every color, position and motion claim matches a screenshot. Photos were opened at full size to check for artifacts.
- [ ] (L) No claims from code, network, storage, downloads, phone layouts or timing. Lazy-loading gaps shared by both sites are left out.
- [ ] Each page was checked for broken images, empty gaps, uneven columns and status labels that don't match the state.
- [ ] Ties are used only when nothing real separates the sites, and each tie names one weak spot per site.
- [ ] (L) Each reason is 80–110 words (never under 60).
- [ ] (L) The openings and sentence starters differ from the previous task, and each reason uses a different body rhythm (4.3).
- [ ] The pick in the form matches the reason.

---

## 7. Lessons from Reviewer Feedback
| Task | What went wrong | Rule now |
|---|---|---|
| 6250482 | "Less personality" with no evidence; "more limited" with no list | Describe exactly what's on screen; list exact options and dead controls |
| 6257531 | "Website is the better choice" with no letter | Name Website A and Website B in full in every reason |
| 6261407 | Talked about general layout and missed the real differences | Look for unique working features and visible overlaps on every item |
| 6264396 | First person; a phone claim that couldn't be confirmed | Third person only; no phone claims; name each control and its result |
| 6255409 | First person; verdict not stated first | Open with the verdict sentence |
| 6250470 | Said downloads worked when menu items weren't fully clickable; "fewer controls" | Never claim downloads; check click areas; name exactly what's missing |
| 6251496 / 6243305 | Overall copied Functionality; a reason had only 35 words | Write Overall last with one point from each lens; count words |
| 6241898 | Credited one site with camera views both had; a visual point in Functionality; a flaw called an advantage | Check each control is really unique; keep the lenses separate; double-check every advantage |
| 6265185 | Typos and thin details | Proofread; add specific supporting details |
| 6253775 | Described end-of-match states the reviewer never reached | Use only what's visible in normal use |
| 6260728 | Tie reason didn't open with the tie; wrong form pick; Overall only covered the new buttons | Open with the tie sentence; check the form pick; Overall covers the whole site |
| 3987088 (4) | Ties right; but curly apostrophes, "A's" alone, "therefore" | Straight apostrophes; "Website A" in full; no formal connectors |
| 3979081 (4) | "Neither site has a weak spot"; a line break in a reason; curly apostrophes | Name a weak spot for each site; one paragraph; straight apostrophes |
| 3988061 (4) | Functionality tied although Website A showed broken firearm images; unclear openings | Broken images are a functionality failure; clear verdict openings |
| 1210318 (3) | Missed an empty gap and a "Live" label shown while paused; backend claims came from code | Check gaps and status labels; on-screen evidence only; real defects break ties |
| 3977933 (3) | Aesthetics and Overall too general and brief | 80–110 words with concrete details in every reason |
| 3978133 (4) | Called a same-size bird "tiny"; credited a best score kept after reload | Measure sizes; no storage or reload claims |
| 3979206 (4) | Called cut-off names in one-hour bars a flaw (should be a tie); said Website B gave no explanation when its form showed a warning; missed Website A's extra "All resources" filter | Normal compact UI isn't a flaw; on-screen warnings count as explanations; inventory every control, since one extra filter can decide Functionality |
| 3992127 (4) | Quoted a hint's row/column text that only screen readers get; called Website B's white header with a green button "bold green" | Quote only visible text; check colors in a screenshot before describing them |
| 3987199 (4) | Described a plate "inside a turning text ring" when the seal is a small badge at the plate's corner; missed rainbow patches in Website B's photos | Describe positions exactly as shown; zoom into photos for artifacts. The behavior reason was kept untouched |
| 3991159 (2) | Submitted text had "Web Site A/B" and curly apostrophes; missed that Website B's chart period buttons only change the dates; Overall said Website A covered everything while naming Website B-only features; used "you", "users" and category names | Exact "Website A/B"; verify each control's real effect; no "matches everything" claims; never "you", "users" or category words; paste text exactly |
| 3996194 (4) | Picks and visual detail praised (UNDERGOD spilling past the shield on Website A, the plate hiding the sword on Website B), and Overall rightly weighed the no-text-outside-the-logo rule. Fixes: every opening was rewritten to mirror the option ("Website B is better because"), and Functionality understated Website B, which has an SVG / PNG export menu at several sizes | Openings always "Website X is better because"; inventory selects and menus (now in digest.txt) |
| 3992243 (4) | Choices and reasons agreed with; the middle dot "·" isn't allowed, and a few long list sentences were reworded to read more naturally | Plain ASCII punctuation; split long list sentences |
| 3992248 (4) | Aesthetics tie right, but Functionality and Overall should be Both are good: the request only asked for a low poly island in the hero, both delivered it, and the store, rules, FAQ, Bedrock tab and leaderboard are unrequested extras | Unrequested extras never decide a field; tie when both deliver the requested object |
| 3988286 (3) | Picks right, but the logo (the actual request) was never judged; both sites were brand pages, Website A's logo had shark traits and Website B's was a malformed shape. The broken image was repeated in all three reasons. Website A's header links were called broken from a local test, but they work for the reviewer | Name the deliverable and judge it up close in every reason; one flaw, one home; links to another host are never evidence |
| 3998166 (5) | All three ties held, and quoting each site's own locked-slot message ("A little room first", the warning inside Website B's form) paid off. Note: Website A's 15-minute booking also shrinks to a thin sliver with a stray letter | Test a weak spot on both sites before giving it to one |
| 3983197 (5) | "Great job." All three picks held: Aesthetics tied on two different dark car-culture styles, each with one weak spot; Functionality and Overall went to Website B for its working extras (three-slide hero, wishlist with Saved tab, account panel), while Website A's unique size and vinyl guides were credited | A full control inventory with unique extras named on both sides wins 5s; keep naming each site's own extras |
| 3993160 (5) | Excellent: every claim checked out and all picks were right. Polish only: the tie opened with a doubled "Both Website A and Website B are good"; the List view's state search and sort toggle on Website A weren't named | Ties open "Website A and Website B are tied because"; name small unique controls inside views; keep this answer as the model (4.5) |

---

## 8. Toolkit (`E:\Projects\@Linkedin\UI Berry\_tools`)
All tools use real mouse and keyboard input in the same sandboxed frame the reviewer uses (downloads blocked). Output goes to `%TEMP%\uiberry\<TaskID>\`.

| Command | What it does |
|---|---|
| `node run.js <TaskID>` | One-command first pass. Unzips, maps Website A/B, prints the User request and the missing images (EAGER = broken on screen, lazy = saving gap). Runs `sitepass` on both sites (full-size shots, 1000×800 frame shots, a real click on every control with the visible result), a scrolled layout view with neutral placeholders for missing photos, side-by-side contact sheets (Website A left, Website B right) and `digest.txt`. Editing tasks: tests the After panes at 680px. |
| `node steps.js <TaskID> <A\|B> '<json>' [--layout] [--w=1000]` | Targeted checks. Steps: `click`, `css`, `hover`, `hovercss`, `select`, `type`, `key`, `drag`, `wheel`, `scrollto`, `wait`, `shot`, `find`, `measure`, `list`, `state`, `eval`. After each action it prints the visible text added or removed, dialogs, toasts, scroll and URL changes, or NO VISIBLE CHANGE. Text matches go in page order (header before footer); add `"nth":2` to take the second match, for example `{"click":"Apparel","nth":2}`. For checks with regex or backslashes, put the steps in a JSON file and pass `@path/to/steps.json` (Git Bash collapses double backslashes). Example: `node steps.js 3993160 A '[{"click":"Mortality"},{"click":"List"},{"list":"input,select"},{"shot":"list"}]'` |
| `node both.js <TaskID> '<json>' \| @steps.json` | Runs the same steps on Website A and Website B in parallel and prints both. One call covers symmetric weak-spot checks and "has no..." finds. Every action also reports `visual N%` when the screen changes beyond its own motion. |
| `node lint.js <draft.md> --append <TaskID>` | Checks every hard rule, the opening for the pick, word counts and style repeats against the previous task. Appends to `Feedback.md` only with 0 errors, then prints the chat code block. |
| `node lint.js --task <TaskID>` | Checks an entry already in `Feedback.md`, for example after a hand edit. |
| `node setup.js <TaskID>` | Only the mapping, request and missing-image summary. |
| `node style.js` | Prints which style set the next task uses (also printed by `run.js`). |
| `node sitepass.js`, `scrollshots.js`, `sheet.js` | The building blocks `run.js` calls; usage is in each file's first lines. |

Write drafts to the session scratchpad, not to the task folder.
