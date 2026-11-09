#!/usr/bin/env node
// Usage: node mock-lint.mjs <file|folder>
// Flags padding, margin and gap values off the 4/8 scale. Exit 0 clean, 1 findings, 2 bad path.
// shortcut: reads written values only; a custom property holding 13px passes.
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

function lint(file, css, lineBase) {
  const found = [];
  const text = strip(css);
  const re = /([a-z-]+)\s*:\s*([^;{}]+)/gi;
  let m;
  while ((m = re.exec(text))) {
    const prop = m[1].toLowerCase();
    if (!PROPS.test(prop)) continue;
    const toks = tokens(m[2].replace(/\s*!important\s*$/i, ''));
    if (toks.some((t) => !valueOk(t))) {
      const line = lineBase + text.slice(0, m.index).split('\n').length - 1;
      found.push(`${file}:${line} ${prop}: ${m[2].trim()}`);
    }
  }
  return found;
}

const target = process.argv[2];
let list;
try { list = files(target); } catch { console.error(`bad path: ${target}`); process.exit(2); }

const out = [];
for (const f of list) {
  const src = readFileSync(f, 'utf8');
  if (extname(f) === '.css') { out.push(...lint(f, src, 1)); continue; }
  const blank = src.replace(/<!--[\s\S]*?-->/g, (x) => x.replace(/[^\n]/g, ' '));
  for (const m of blank.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    const base = blank.slice(0, m.index + m[0].indexOf('>') + 1).split('\n').length;
    out.push(...lint(f, m[1], base));
  }
  for (const m of blank.matchAll(/\sstyle\s*=\s*("([^"]*)"|'([^']*)')/gi)) {
    const base = blank.slice(0, m.index).split('\n').length;
    out.push(...lint(f, m[2] ?? m[3], base));
  }
}
out.forEach((l) => console.log(l));
process.exit(out.length ? 1 : 0);
