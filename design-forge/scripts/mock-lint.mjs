#!/usr/bin/env node
// Usage: node mock-lint.mjs <file|folder> [--sizes 12,13,..] [--max-sizes N] [--max-weights N] [--components <file.md>]
// Flags padding, margin and gap values off the 4/8 scale, font sizes off the type scale
// (default 12,13,14,16,20,24,32), font weights outside 400/500/600, more than 5 distinct literal
// sizes or 2 distinct literal weights per target, and with --components classes missing from that file.
// Exit 0 clean, 1 findings, 2 bad path.
// shortcut: reads written values only; a custom property holding 13px passes.
// shortcut: the font shorthand is not checked; add it when mocks start using it.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const SCALE = new Set([0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128]);
const PROPS = /^(padding|margin|gap|row-gap|column-gap)(-(top|right|bottom|left|block|inline)(-(start|end))?)?$/;
const KEYWORDS = new Set(['0', 'auto', 'inherit', 'initial', 'unset']);

function files(p) {
  const s = statSync(p);
  if (s.isFile()) return [p];
  return readdirSync(p).flatMap((n) => {
    const q = join(p, n);
    if (statSync(q).isDirectory()) return n === 'assets' ? [] : files(q);
    return /\.(html|css)$/.test(n) && n !== 'mock-base.css' ? [q] : [];
  });
}

// Replace comments with blanks, keeping newlines so line numbers hold.
const strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));

function tokens(v) {
  const out = []; let depth = 0, cur = '';
  for (const c of v.trim()) {
    if (c === '(') depth++;
    if (c === ')') depth--;
    if (/\s/.test(c) && !depth) { if (cur) out.push(cur); cur = ''; } else cur += c;
  }
  if (cur) out.push(cur);
  return out;
}

function lengthOk(t) {
  const m = /^-?(\d*\.?\d+)(px|rem)?$/.exec(t);
  if (!m) return false;
  const n = Number(m[1]);
  if (n === 0) return true;
  if (!m[2]) return false;
  return SCALE.has(m[2] === 'rem' ? n * 16 : n);
}

function funcOk(t) {
  if (!/^(calc|clamp|min|max)\(/i.test(t)) return false;
  const inner = t.replace(/\bvar\([^()]*(\([^()]*\))*[^()]*\)/g, '').replace(/\b(calc|clamp|min|max)\(/gi, '(');
  const lens = inner.match(/-?\d*\.?\d+[a-z%]+/gi) || [];
  return lens.length === 0;
}

function valueOk(t) {
  t = t.replace(/\s*!important$/i, '');
  return KEYWORDS.has(t) || /^var\(/i.test(t) || funcOk(t) || lengthOk(t);
}

const args = process.argv.slice(2);
const flag = (n) => { const i = args.indexOf(n); return i < 0 ? undefined : args.splice(i, 2)[1]; };
const sizeArg = flag('--sizes');
const maxSizes = Number(flag('--max-sizes') ?? 5);
const maxWeights = Number(flag('--max-weights') ?? 2);
const compFile = flag('--components');
const SIZES = new Set((sizeArg ?? '12,13,14,16,20,24,32').split(',').map(Number));
const SIZE_KW = new Set(['inherit', 'initial', 'unset', 'xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large', 'xxx-large', 'smaller', 'larger']);
const WEIGHT_KW = new Set(['normal', 'inherit', 'initial', 'unset']);
const seenSizes = new Set(), seenWeights = new Set();

// Returns the px size of a literal, else null.
function sizePx(t) {
  const m = /^(\d*\.?\d+)(px|rem)$/.exec(t);
  return m ? (m[2] === 'rem' ? Number(m[1]) * 16 : Number(m[1])) : null;
}

function fontOk(prop, t) {
  t = t.trim().replace(/\s*!important$/i, '').toLowerCase();
  if (/^var\(/.test(t) || (prop === 'font-size' ? SIZE_KW : WEIGHT_KW).has(t)) return true;
  if (prop === 'font-size') {
    if (funcOk(t)) return true;
    const px = sizePx(t);
    if (px !== null) seenSizes.add(px);
    return px !== null && SIZES.has(px);
  }
  if (t === '400' || t === 'normal') { seenWeights.add(400); return true; }
  if (/^\d+$/.test(t)) seenWeights.add(Number(t));
  else if (t === 'bold') seenWeights.add(700);
  return t === '500' || t === '600';
}

function lint(file, css, lineBase) {
  const found = [];
  const text = strip(css);
  const re = /([a-z-]+)\s*:\s*([^;{}]+)/gi;
  let m;
  while ((m = re.exec(text))) {
    const prop = m[1].toLowerCase();
    if (prop === 'font-size' || prop === 'font-weight') {
      if (!fontOk(prop, m[2])) {
        const line = lineBase + text.slice(0, m.index).split('\n').length - 1;
        found.push(`${file}:${line} ${prop}: ${m[2].trim()}`);
      }
      continue;
    }
    if (!PROPS.test(prop)) continue;
    const toks = tokens(m[2].replace(/\s*!important\s*$/i, ''));
    if (toks.some((t) => !valueOk(t))) {
      const line = lineBase + text.slice(0, m.index).split('\n').length - 1;
      found.push(`${file}:${line} ${prop}: ${m[2].trim()}`);
    }
  }
  return found;
}

const target = args[0];
let list, listed;
try {
  list = files(target);
  if (compFile) listed = new Set([...readFileSync(compFile, 'utf8').matchAll(/`\.([A-Za-z_][\w-]*)`/g)].map((x) => x[1]));
} catch { console.error(`bad path: ${compFile && target ? `${target} or ${compFile}` : target}`); process.exit(2); }

const out = [];
for (const f of list) {
  const src = readFileSync(f, 'utf8');
  if (extname(f) === '.css') { out.push(...lint(f, src, 1)); continue; }
  const blank = src.replace(/<!--[\s\S]*?-->/g, (x) => x.replace(/[^\n]/g, ' '));
  if (listed) {
    for (const m of blank.matchAll(/\sclass\s*=\s*("([^"]*)"|'([^']*)')/gi)) {
      const line = blank.slice(0, m.index).split('\n').length;
      for (const c of (m[2] ?? m[3]).split(/\s+/)) {
        if (c && !c.startsWith('is-') && !listed.has(c)) out.push(`${f}:${line} class not in components: ${c}`);
      }
    }
  }
  for (const m of blank.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    const base = blank.slice(0, m.index + m[0].indexOf('>') + 1).split('\n').length;
    out.push(...lint(f, m[1], base));
  }
  for (const m of blank.matchAll(/\sstyle\s*=\s*("([^"]*)"|'([^']*)')/gi)) {
    const base = blank.slice(0, m.index).split('\n').length;
    out.push(...lint(f, m[2] ?? m[3], base));
  }
}
const fmt = (set) => [...set].sort((a, b) => a - b).join(', ');
if (seenSizes.size > maxSizes) out.push(`${target}: ${seenSizes.size} distinct font sizes (max ${maxSizes}): ${fmt(seenSizes)}`);
if (seenWeights.size > maxWeights) out.push(`${target}: ${seenWeights.size} distinct font weights (max ${maxWeights}): ${fmt(seenWeights)}`);
out.forEach((l) => console.log(l));
process.exit(out.length ? 1 : 0);
