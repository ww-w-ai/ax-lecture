#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function pageSetFromHeadings(text) {
  const pages = new Set();
  const re = /^###\s+P(\d+(?:\.\d+)?)\b/gm;
  let m;
  while ((m = re.exec(text))) pages.add(m[1]);
  return pages;
}

function pageSetFromFiles(dir, exts) {
  const full = path.join(ROOT, dir);
  const pages = new Set();
  if (!fs.existsSync(full)) return pages;
  for (const name of fs.readdirSync(full)) {
    const ext = path.extname(name).toLowerCase();
    if (!exts.includes(ext)) continue;
    const m = name.match(/^P(\d+(?:_\d+|\.\d+)?)/);
    if (m) pages.add(m[1].replace('_', '.'));
  }
  return pages;
}

function sortedPages(set) {
  return [...set].sort((a, b) => Number(a) - Number(b));
}

function missing(source, target) {
  return sortedPages(new Set([...source].filter(p => !target.has(p))));
}

function onlyRange(set, min, max) {
  return new Set([...set].filter(p => Number(p) >= min && Number(p) <= max));
}

const plan = pageSetFromHeadings(read('강연-슬라이드-구성안.md'));
const guide = pageSetFromHeadings(read('이미지-제작-가이드.md'));
const prompts = pageSetFromFiles('generated/prompts', ['.md']);
const drafts = pageSetFromFiles('generated', ['.png', '.jpg', '.jpeg']);
const finals = pageSetFromFiles('final', ['.png', '.pdf']);

const production = onlyRange(plan, 30, 86);

const checks = [
  ['plan pages without guide', missing(production, guide)],
  ['guide pages without prompt', missing(onlyRange(guide, 30, 86), prompts)],
  ['prompt pages without draft/final', missing(prompts, new Set([...drafts, ...finals]))],
  ['planned pages without prompt', missing(production, prompts)],
];

console.log('Slide coverage');
console.log(`plan: ${plan.size}, guide: ${guide.size}, prompts: ${prompts.size}, drafts: ${drafts.size}, finals: ${finals.size}`);
for (const [label, pages] of checks) {
  console.log(`${label}: ${pages.length ? pages.join(', ') : 'none'}`);
}

