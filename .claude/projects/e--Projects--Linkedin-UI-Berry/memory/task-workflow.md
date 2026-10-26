---
name: task-workflow
description: "Per-task workflow the user set for UI Berry tasks (answer in chat + append to Feedback.md with an empty Feedback slot, record their feedback later, aim for 5/5)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: f8a5e762-7fbb-4457-be01-c3d4ec5d57a6
  modified: 2026-10-19T05:18:23.988Z
---

On 2026-10-19 the user set this workflow. The goal is 5/5 reviewer scores on every task.

1. **New Task ID:** follow `Prompt/prompt.md` §1.1, the time-boxed workflow (hard limit 16 min per task, set by the user 2026-10-23; about eight tool calls, at most one steps.js call per site): `node run.js <ID>` from `_tools`, read the contact sheets and digest, targeted `steps.js` checks only, write with the next style set, then `node lint.js <draft> --append <ID>`. Skip the low-value steps in prompt.md §3.7 and obey its stop rules.
2. **Hand over the answer** in chat as one code block, as in prompt.md §5.
3. **Append the same answer** (`lint.js --append` does this only when there are 0 errors) to the end of `Prompt/Feedback.md`, using the latest entry pattern, and leave the Feedback section empty for the user to fill in:
   ```
   ### Task: <ID>
   ## Answers:
   # Aesthetics: Website X        (editing tasks: # Satisfaction / # Overall)
   <reason>

   # Functionality: Website X
   <reason>

   # Overall: Website X
   <reason>

   ## Feedback:

   ```
4. **When the user gives feedback for a task:** put it under that task's `## Feedback:` heading, plus a `Score: N.` line if they give one. Add the lesson as a row in prompt.md §7, update the rules if needed, and apply it from the next task on.

**Why:** the user wants every answer and every reviewer response kept in one place, so each new task builds on all earlier feedback.

**How to apply:** run all four steps on every task. See [[follow-feedback-md]] for the writing rules, [[review-test-method]] and [[editing-task-format]].
