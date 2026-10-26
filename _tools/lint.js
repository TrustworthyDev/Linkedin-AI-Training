// node lint.js <answer.md>                  check a draft (fields as "# Aesthetics: Website A" or "Aesthetics: Website A")
// node lint.js <answer.md> --append <TaskID>  check, then append to Prompt/Feedback.md (refused while any ERROR remains)
// node lint.js --task <TaskID>                check an entry already in Feedback.md (for example a hand-edited one)
// Every rule here comes from reviewer feedback (see Prompt/prompt.md sections 4 and 7).
const fs = require('fs');
const FEEDBACK = process.env.UIB_FEEDBACK || 'E:/Projects/@Linkedin/UI Berry/Prompt/Feedback.md';
const args = process.argv.slice(2);
const flag = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const appendId = flag('--append'), taskId = flag('--task'), force = args.includes('--force');
const fb = fs.readFileSync(FEEDBACK, 'utf8');

// ---- split Feedback.md into entries
const entries = fb.split(/^### Task:\s*/m).slice(1).map(e => ({ id: e.split('\n')[0].trim(), body: e }));
const parse = (txt) => {
  const fields = []; let cur = null;
  for (const raw of txt.replace(/\r/g, '').split('\n')) {
    const line = raw.replace(/\s+$/, '');
    if (/^##\s*Feedback/i.test(line)) break;
    const m = line.match(/^#?\s*(Aesthetics|Functionality|Overall|Satisfaction)\s*:\s*(.+)$/);
    if (m) { cur = { field: m[1], pick: m[2].trim(), lines: [] }; fields.push(cur); continue; }
    if (cur && !/^##\s/.test(line) && !/^```/.test(line)) cur.lines.push(line);
  }
  for (const f of fields) { while (f.lines.length && !f.lines[f.lines.length - 1]) f.lines.pop(); while (f.lines.length && !f.lines[0]) f.lines.shift(); f.text = f.lines.join(' ').trim(); }
  return fields;
};
let src;
if (taskId) { const e = entries.filter(e => e.id === taskId).pop(); if (!e) { console.log('No entry for ' + taskId); process.exit(1); } src = e.body; }
else { if (!args[0] || args[0].startsWith('--')) { console.log('usage: node lint.js <answer.md> [--append <TaskID>] | --task <TaskID>'); process.exit(1); } src = fs.readFileSync(args[0], 'utf8'); }
const fields = parse(src);
const curId = appendId || taskId;
const at = taskId ? entries.findIndex(e => e.id === taskId) : entries.length;
const prev = entries.slice(0, at).filter(e => e.id !== curId).pop();
const prevFields = prev ? parse(prev.body) : [];

const errs = [], warns = [];
const E = (f, m) => errs.push(`ERROR  [${f}] ${m}`), W = (f, m) => warns.push(`warn   [${f}] ${m}`);
const sentences = t => t.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g)?.map(s => s.trim()).filter(Boolean) || [];
const opening = (f) => { const s = sentences(f.text)[0] || ''; const m = s.match(/^Website ([AB]) (is [^,]*?|are [^,]*?) because/); return m ? m[2] : (s.match(/^Website A and Website B are tied because/) ? 'tied' : s.split(' ').slice(0, 6).join(' ')); };

// ---- structure
const names = fields.map(f => f.field);
const editing = names.includes('Satisfaction');
const want = editing ? ['Satisfaction', 'Overall'] : ['Aesthetics', 'Functionality', 'Overall'];
if (names.join() !== want.join()) E('format', `fields found [${names.join(', ')}], expected [${want.join(', ')}]`);

const BAN = [
  [/\b(you|your|yours|yourself|user|users|visitor|visitors|people)\b/gi, 'addresses or names the reader'],
  [/\b(I|me|my|we|our)\b/g, 'first person'],
  [/\bus\b/g, 'first person (us)'],
  [/\b(aesthetics?|aesthetically|functionality|functional|functionally|functions?|overall|satisfaction|satisfying|satisfied)\b/gi, 'category word inside a reason'],
  [/\b(therefore|thus|hence|moreover|furthermore|additionally|consequently|in addition|in conclusion|notably|ultimately)\b/gi, 'stiff connector'],
  [/\b(seamless(ly)?|elevates?|elevated|robust|delves?|showcases?|user-friendly|intuitive)\b/gi, 'filler word'],
  [/[\u2014\u2013]| - /g, 'dash (use a comma or a new sentence)'],
  [/[\u2018\u2019\u201C\u201D]/g, 'curly quote or apostrophe'],
  [/\bweb\s*-?\s*site\s*-?\s*[ab]\b/gi, 'site name check'],
  [/(?<!Website )\b[AB]'s\b/g, 'bare A\'s / B\'s (write Website A\'s)'],
  [/(?<!Website )\bB\b(?!\.\d)/g, 'bare B (write Website B)'],
  [/\b(site|candidate|option)\s*[AB12]\b/gi, 'wrong site name'],
  [/\bwebsite\s*[12]\b/gi, 'wrong site name'],
  [/neither (site |one )?(has|shows)( a| any)? (weak spot|flaw|problem)|nothing is broken|no weak spots?/gi, 'never deny weak spots'],
  [/match(es)? (it |everything|every)|feature for feature|covers everything|does everything|every requirement|all (the )?requirements/gi, '"matches everything" claim'],
  [/\b(tested|testing|screenshots?|iframe|console|source code|the code|DOM|localStorage|local storage|JavaScript|network|puppeteer|inspect(ed|ing)?|sandbox|aria-?label|sr-only|screen reader|lazy|reload(ed|ing)?|after a refresh)\b/gi, 'testing / code / storage evidence'],
  [/^Because\b|\. Because\b/g, 'sentence fragment starting with Because'],
  [/Both Website A and Website B are/g, 'doubled "both" in the tie opening (3993160)'],
  [/[·•‣∙←-⇿×…™®©]/g, 'special character not allowed (3992243: the middle dot); write it out in words'],
];
const WARN = [
  [/\b(downloads?|downloaded)\b/gi, 'downloads are blocked in the review frame; only say a control can be clicked'],
  [/\b(mobile|phone|smartphone|responsive)\b/gi, 'phone/mobile claim'],
  [/\b\d+(\.\d+)?\s?(ms|milliseconds|seconds|secs|fps)\b/gi, 'timing number'],
  [/\b(viewers?|readers?|shoppers?|customers?|players?|guests?|diners?)\b/gi, 'audience noun: fine only when it is site content, never the reader'],
  [/!/g, 'exclamation mark'],
  [/;/g, 'semicolon (plain everyday English prefers two sentences)'],
  [/[^\p{L}\p{N}\s\x00-\x7F·•‣∙←-⇿×…™®©]/gu, 'non-ASCII symbol: keep only if it is literally part of on-screen content'],
  [/\b(perfect(ly)?|flawless(ly)?|stunning|amazing|incredible)\b/gi, 'over-claim word'],
  [/\b(however|while also|it is worth|it's worth)\b/gi, 'stiff phrasing'],
];

const tiePick = p => /^Both are (good|bad)$/.test(p);
for (const f of fields) {
  const t = f.text, F = f.field;
  if (!/^(Website A|Website B|Both are good|Both are bad)$/.test(f.pick)) E(F, `pick "${f.pick}" must be Website A, Website B, Both are good or Both are bad`);
  if (f.lines.filter(Boolean).length !== 1 || f.lines.length !== 1) E(F, 'reason must be ONE paragraph with no line breaks');
  const wc = t.split(/\s+/).filter(Boolean).length;
  if (wc < 60) E(F, `${wc} words (minimum 60, target 80-110)`); else if (wc < 80 || wc > 120) W(F, `${wc} words (target 80-110)`);
  if (!t.includes('Website A') || !t.includes('Website B')) E(F, 'must name both Website A and Website B');
  for (const [re, why] of BAN) { const hits = [...t.matchAll(re)].map(m => m[0]).filter(h => !(why === 'site name check' && /^Website [AB]$/.test(h))); if (hits.length) E(F, `${why}: ${[...new Set(hits)].map(h => JSON.stringify(h)).join(', ')}`); }
  for (const [re, why] of WARN) { const hits = [...t.matchAll(re)].map(m => m[0]); if (hits.length) W(F, `${why}: ${[...new Set(hits)].map(h => JSON.stringify(h)).join(', ')}`); }
  const s0 = sentences(t)[0] || '';
  if (tiePick(f.pick)) { if (!/^Website A and Website B are tied because/.test(s0)) E(F, 'tie must open "Website A and Website B are tied because..."'); }
  else if (/^Website [AB]$/.test(f.pick)) {
    const X = f.pick.slice(-1);
    if (!new RegExp(`^Website ${X} is better because`).test(s0)) E(F, `open with the chosen option (3996194): "Website ${X} is better because..." Got: "${s0.slice(0, 70)}"`);
    if (new RegExp(`^Website ${X === 'A' ? 'B' : 'A'} is`).test(s0)) E(F, 'opening names the wrong winner');
  }
  const p = prevFields.find(q => q.field === F);
  for (const x of sentences(t)) { const n = x.split(/\s+/).length, c = (x.match(/,/g) || []).length; if (n > 40 || c >= 7) W(F, `long list sentence (${n} words, ${c} commas): split it so it reads naturally (3992243): "${x.slice(0, 60)}..."`); }
  if (p) { const a = sentences(t)[1] || '', b = sentences(p.text)[1] || ''; const k3 = x => x.split(' ').slice(0, 3).join(' '); if (a && b && k3(a) === k3(b) && !/^Website [AB] (is|has)$/.test(k3(a))) W(F, `second sentence starts like the previous task ("${k3(a)}"): vary the rhythm`); }
}
// ---- across the answer
// stock phrases: any 4-word run (site names left out) that also appeared in the last 4 answers reads as a template
const grams = t => { const w = t.toLowerCase().replace(/website a and website b are tied because|website [ab] is (the best option|the better choice|better|stronger|preferred) because/g, '|').replace(/website [ab]('s)?/g, '|').replace(/[^a-z0-9' |]+/g, ' ').split(/\s+/).filter(Boolean); const out = new Set(); for (let i = 0; i + 4 <= w.length; i++) { const g = w.slice(i, i + 4); if (!g.includes('|')) out.add(g.join(' ')); } return out; };
const recent = entries.slice(0, at).filter(e => e.id !== curId).slice(-4).flatMap(e => parse(e.body)).map(f => f.text).join(' ');
const old = grams(recent); const reused = [...new Set(fields.flatMap(f => [...grams(f.text)].filter(g => old.has(g))))];
if (reused.length) W('style', `${reused.length} phrase(s) reused from the last 4 answers, reword them: ${reused.slice(0, 8).map(g => JSON.stringify(g)).join(', ')}`);
// one flaw, one home: the same distinctive flaw words in all three reasons (3988286: broken image repeated three times)
const flawWords = ['broken', 'error', 'missing', 'cut off', 'overlap', 'blank', 'empty', 'does nothing', 'fails'];
if (fields.length === 3) for (const w of flawWords) if (fields.every(f => f.text.toLowerCase().includes(w))) W('style', `"${w}" appears in all three reasons: keep each flaw in the lens where it fits (3988286)`);
const starts = {}; for (const f of fields) for (const s of sentences(f.text).slice(1)) { const k = s.split(/\s+/).slice(0, 2).join(' ').replace(/[,.]$/, ''); if (/^Website [AB]('s)?$/.test(k)) continue; starts[k] = (starts[k] || 0) + 1; }
for (const [k, n] of Object.entries(starts)) if (n >= 3) W('style', `${n} sentences start with "${k}": vary sentence openings`);
const pk = Object.fromEntries(fields.map(f => [f.field, f.pick]));
if (!editing && pk.Aesthetics && pk.Aesthetics === pk.Functionality && /^Website/.test(pk.Aesthetics) && pk.Overall !== pk.Aesthetics) W('picks', 'Aesthetics and Functionality agree but Overall differs: double-check');
if (!editing && /^Website/.test(pk.Functionality || '') && tiePick(pk.Aesthetics || '') && pk.Overall !== pk.Functionality) W('picks', 'Overall usually follows the only real difference (Functionality): double-check');

console.log(`Picks: ${fields.map(f => `${f.field}=${f.pick}`).join(' | ')}   (previous task ${prev ? prev.id : '-'}: ${prevFields.map(f => opening(f)).join(' / ')})`);
console.log(`Openings now: ${fields.map(f => opening(f)).join(' / ')}`);
console.log([...errs, ...warns].join('\n') || 'CLEAN: no errors or warnings');
console.log(`${errs.length} error(s), ${warns.length} warning(s)`);

if (appendId) {
  if (errs.length && !force) { console.log('NOT appended: fix the errors first (or --force).'); process.exit(2); }
  if (entries.some(e => e.id === appendId)) { console.log(`NOT appended: Task ${appendId} is already in Feedback.md.`); process.exit(2); }
  const block = `### Task: ${appendId}\n## Answers:\n` + fields.map(f => `# ${f.field}: ${f.pick}\n${f.text}`).join('\n\n') + '\n\n## Feedback:\n';
  const tail = fb.endsWith('\n\n') ? '' : fb.endsWith('\n') ? '\n' : '\n\n';
  fs.appendFileSync(FEEDBACK, tail + block);
  console.log(`Appended Task ${appendId} to Feedback.md`);
  console.log('\n----- chat code block -----\n' + fields.map(f => `${f.field}: ${f.pick}\n${f.text}`).join('\n\n'));
}
