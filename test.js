'use strict';
const e = require('./engine.js');
const cases = require('./expected.json');
let checks = 0, fails = 0;
function eq(a, b, label) {
  checks++;
  if (a !== b) { fails++; console.log('FAIL', label, 'engine:', a, 'oracle:', b); }
}
for (const c of cases) {
  let r, text;
  if (c.tool === 'sharp') { r = e.sharpness(...c.args); text = e.renderSharp(r); }
  else if (c.tool === 'crop') { r = e.cropCheck(...c.args); text = e.renderCrop(r); }
  else { r = e.matWindow(...c.args); text = e.renderMat(r); }
  const keys = new Set([...Object.keys(r), ...Object.keys(c.expect)]);
  for (const k of keys) eq(JSON.stringify(r[k]), JSON.stringify(c.expect[k]), c.tool + ' ' + JSON.stringify(c.args) + ' .' + k);
  checks++;
  if (r.error) { if (text !== r.error) { fails++; console.log('FAIL render error passthrough', text); } }
  else if (typeof text !== 'string' || text.length < 5 || /error|undefined|NaN/.test(text)) { fails++; console.log('FAIL render text', text); }
}
eq(e.renderSharp(e.sharpness(6000,4000,60)), "254 dpi at that size - fine at arm's length. Widest crisp (300 dpi) print: 50.8 cm.", 'render sharp default');
eq(e.renderCrop(e.cropCheck(6000,4000,60,40)), 'exact fit - nothing cropped.', 'render crop default');
eq(e.renderMat(e.matWindow(60,40,0.5,5)), 'Cut the window 59 x 39 cm; mat outer 70 x 50 cm.', 'render mat default');
console.log(checks + ' checks, ' + fails + ' failures over ' + cases.length + ' cases');
process.exit(fails ? 1 : 0);
