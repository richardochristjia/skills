#!/usr/bin/env node
// Builds the polish-ui contact sheet from a pass log.
// Usage: node sheet.mjs <passes.json> [--out sheet.html]
// passes.json: { page, before: {"1440": png, "390": png},
//   passes: [{ n, pass, status: "changed"|"no change"|"skipped", commit?, reason?, shots?: {"1440": png, "390": png} }],
//   gate? }
// Image paths are relative to the JSON file. Exit 1: a missing image. Exit 2: bad JSON.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function buildSheet(log, baseDir) {
  const missing = [];
  const img = (p, alt) => {
    if (!existsSync(resolve(baseDir, p))) missing.push(resolve(baseDir, p));
    return `<img src="${esc(p)}" alt="${esc(alt)}" loading="lazy">`;
  };
  let prev = log.before?.['1440'];
  let prevName = 'before';
  const rows = (log.passes ?? []).map((p) => {
    const shot = p.shots?.['1440'];
    let cells = '';
    if (p.status === 'changed' && shot) {
      cells = `<figure>${img(prev, `${prevName} 1440`)}<figcaption>${esc(prevName)}</figcaption></figure>` +
        `<figure>${img(shot, `${p.pass} 1440`)}<figcaption>${esc(p.pass)}</figcaption></figure>`;
      prev = shot;
      prevName = p.pass;
    }
    const cls = String(p.status).replace(/\s+/g, '-');
    return `<tr><td>${esc(p.n)}</td><td>${esc(p.pass)}</td><td><span class="chip ${esc(cls)}">${esc(p.status)}</span>` +
      `${p.commit ? ` <code>${esc(p.commit)}</code>` : ''}${p.reason ? `<p>${esc(p.reason)}</p>` : ''}</td><td class="shots">${cells}</td></tr>`;
  });
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<title>polish-ui: ${esc(log.page)}</title>` +
    `<style>body{font:14px system-ui;margin:24px;color:#111;background:#fff}table{border-collapse:collapse;width:100%}td{border-top:1px solid #ddd;padding:8px;vertical-align:top}` +
    `.shots{display:flex;gap:12px;flex-wrap:wrap}figure{margin:0}img{max-width:420px;border:1px solid #ccc}.chip{padding:2px 8px;border-radius:9px;background:#eee}.changed{background:#cfe9d4}.skipped{background:#f4d3d3}</style>` +
    `<h1>polish-ui: ${esc(log.page)}</h1>${log.gate ? `<p>Gate: ${esc(log.gate)}</p>` : ''}` +
    `<table><tr><th>#</th><th>Pass</th><th>Status</th><th>Before and after (1440)</th></tr>${rows.join('')}</table></html>`;
  return { html, missing };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [file, ...rest] = process.argv.slice(2);
  if (!file) { console.error('usage: sheet.mjs <passes.json> [--out sheet.html]'); process.exit(2); }
  let log;
  try { log = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { console.error(`bad JSON in ${file}: ${e.message}`); process.exit(2); }
  const base = dirname(resolve(file));
  const oi = rest.indexOf('--out');
  const out = oi >= 0 ? resolve(rest[oi + 1]) : resolve(base, 'sheet.html');
  const { html, missing } = buildSheet(log, base);
  if (missing.length) { console.error(`missing image: ${missing.join(', ')}`); process.exit(1); }
  // shortcut: images are linked relative to the sheet only when --out is in the JSON's folder; otherwise rewrite
  writeFileSync(out, dirname(out) === base ? html : html.replace(/src="([^"]+)"/g, (_, s) => `src="${esc(isAbsolute(s) ? s : relative(dirname(out), resolve(base, s)))}"`));
  console.log(out);
}
