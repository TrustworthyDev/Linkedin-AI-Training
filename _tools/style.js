// Style rotation from Prompt/prompt.md 4.2 / 4.3.
// The verdict opening is fixed and mirrors the chosen option (3996194): "Website X is better because...",
// ties "Website A and Website B are tied because...". Variety comes from the body: each set pairs a different
// rhythm with each field, and the set moves on with every task (counted from Feedback.md entries).
const OPEN = 'is better';
const SETS = {
  1: { rhythm: { Aesthetics: 'R3 walk-through', Functionality: 'R1 evidence list', Overall: 'R2 contrast first' } },
  2: { rhythm: { Aesthetics: 'R4 request fit', Functionality: 'R2 contrast first', Overall: 'R1 evidence list' } },
  3: { rhythm: { Aesthetics: 'R1 evidence list', Functionality: 'R3 walk-through', Overall: 'R4 request fit' } },
  4: { rhythm: { Aesthetics: 'R2 contrast first', Functionality: 'R4 request fit', Overall: 'R3 walk-through' } },
};
for (const s of Object.values(SETS)) { s.Aesthetics = s.Functionality = s.Overall = OPEN; } // Satisfaction borrows the Functionality column
function nextSet(fb) {
  const entries = fb.split(/^### Task:\s*/m).slice(1);
  const prevId = (entries[entries.length - 1] || '').split('\n')[0].trim();
  const next = entries.length % 4 + 1;
  return { prevId, prev: (entries.length - 1) % 4 + 1, next };
}
module.exports = { SETS, nextSet, OPEN };
if (require.main === module) { const fs = require('fs'); const r = nextSet(fs.readFileSync('E:/Projects/@Linkedin/UI Berry/Prompt/Feedback.md', 'utf8')); console.log(`next task uses Set ${r.next}: openings "Website X ${OPEN} because" / ties "Website A and Website B are tied because"`, SETS[r.next].rhythm); }
