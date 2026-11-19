#!/usr/bin/env node
// Does the page's ground colour fight its hero photo? Node 22, no packages.
// node palette.mjs --shot <png> --ground <#hex> [--rect x,y,w,h] [--json]
// Output: {ground, photo, clash, suggest:{ground, ink, muted, line}, contrast:{ink, muted}}
// Exit 0 on success, 2 on bad input. Reads 8-bit RGB/RGBA PNGs, not interlaced.
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

const fail = (m) => { console.error(`palette: ${m}`); process.exit(2); };

function decodePng(buf) {
  if (buf.length < 33 || buf.readUInt32BE(0) !== 0x89504e47) fail('not a PNG');
  let w = 0, h = 0, ct = 0, off = 8;
  const idat = [];
  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off), type = buf.toString('latin1', off + 4, off + 8);
    const d = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') {
      w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9];
      if (d[8] !== 8 || ![2, 6].includes(ct) || d[12] !== 0) fail('need 8-bit RGB or RGBA PNG, not interlaced');
    } else if (type === 'IDAT') idat.push(d);
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  if (!w || !h || !idat.length) fail('broken PNG');
  let raw;
  try { raw = inflateSync(Buffer.concat(idat)); } catch { fail('broken PNG data'); }
  const bpp = ct === 6 ? 4 : 3, stride = w * bpp;
  if (raw.length < h * (stride + 1)) fail('PNG data too short');
  const px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], src = y * (stride + 1) + 1, dst = y * stride;
    for (let i = 0; i < stride; i++) {
      const x = raw[src + i];
      const a = i >= bpp ? px[dst + i - bpp] : 0;
      const b = y ? px[dst - stride + i] : 0;
      const c = i >= bpp && y ? px[dst - stride + i - bpp] : 0;
      let v;
      if (f === 0) v = x; else if (f === 1) v = x + a; else if (f === 2) v = x + b;
      else if (f === 3) v = x + ((a + b) >> 1);
      else if (f === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v = x + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
      } else fail('bad PNG filter');
      px[dst + i] = v & 255;
    }
  }
  return { w, h, bpp, px };
}

const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const unlin = (v) => 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
const finv = (t) => (t ** 3 > 216 / 24389 ? t ** 3 : (116 * t - 16) / (24389 / 27));
const WP = [0.95047, 1, 1.08883];

function rgbToLab([r, g, b]) {
  const R = lin(r), G = lin(g), B = lin(b);
  const X = 0.4124564 * R + 0.3575761 * G + 0.1804375 * B;
  const Y = 0.2126729 * R + 0.7151522 * G + 0.072175 * B;
  const Z = 0.0193339 * R + 0.119192 * G + 0.9503041 * B;
  const fx = f(X / WP[0]), fy = f(Y / WP[1]), fz = f(Z / WP[2]);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
function labToRgb([L, a, b]) {
  const fy = (L + 16) / 116;
  const X = WP[0] * finv(fy + a / 500), Y = WP[1] * finv(fy), Z = WP[2] * finv(fy - b / 200);
  const R = 3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z;
  const G = -0.969266 * X + 1.8760108 * Y + 0.041556 * Z;
  const B = 0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z;
  return [R, G, B].map((v) => Math.min(255, Math.max(0, Math.round(unlin(Math.min(1, Math.max(0, v)))))));
}
const hex = (rgb) => '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('');
const lum = (rgb) => { const [r, g, b] = rgb.map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const dE = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
const r1 = (n) => Math.round(n * 10) / 10;

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); return i < 0 ? undefined : args[i + 1]; };
const shot = opt('--shot'), groundArg = opt('--ground'), rectArg = opt('--rect');
if (!shot || !groundArg) fail('usage: palette.mjs --shot <png> --ground <#hex> [--rect x,y,w,h] [--json]');
let m = /^#?([0-9a-f]{6})$/i.exec(groundArg) ?? (/^#?([0-9a-f]{3})$/i.exec(groundArg) && [0, groundArg.replace('#', '').replace(/./g, '$&$&')]);
if (!m) fail(`bad --ground: ${groundArg}`);
const gRgb = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
let file;
try { file = readFileSync(shot); } catch { fail(`cannot read ${shot}`); }
const { w, h, bpp, px } = decodePng(file);
let x0 = 0, y0 = 0, rw = w, rh = h;
if (rectArg) {
  const r = rectArg.split(',').map(Number);
  if (r.length !== 4 || r.some((n) => !Number.isFinite(n))) fail(`bad --rect: ${rectArg}`);
  // getBoundingClientRect boxes are fractional; snap outward to whole pixels so indexes stay integers
  x0 = Math.floor(r[0]); y0 = Math.floor(r[1]);
  rw = Math.ceil(r[0] + r[2]) - x0; rh = Math.ceil(r[1] + r[3]) - y0;
  x0 = Math.max(0, x0); y0 = Math.max(0, y0);
  rw = Math.min(w - x0, rw); rh = Math.min(h - y0, rh);
  if (rw <= 0 || rh <= 0) fail('--rect is outside the image');
}
const gLab = rgbToLab(gRgb);
let n = 0; const sum = [0, 0, 0];
for (let y = y0; y < y0 + rh; y++) for (let x = x0; x < x0 + rw; x++) {
  const i = (y * w + x) * bpp;
  if (bpp === 4 && px[i + 3] < 128) continue;
  if (!rectArg && dE(rgbToLab([px[i], px[i + 1], px[i + 2]]), gLab) <= 10) continue;
  sum[0] += px[i]; sum[1] += px[i + 1]; sum[2] += px[i + 2]; n++;
}
if (!n) fail('no photo pixels found (all within the ground colour)');
const pRgb = sum.map((s) => Math.round(s / n));
const pLab = rgbToLab(pRgb);

const clash = (gLab[2] >= 2 && pLab[2] <= -4) || (gLab[2] <= -2 && pLab[2] >= 4);
const hue = Math.atan2(pLab[2], pLab[1]);
const at = (L, C) => [L, C * Math.cos(hue), C * Math.sin(hue)];
const sGround = labToRgb(at(95.5, 1.5)), sInk = labToRgb(at(13, 2)), sLine = labToRgb(at(88, 2));
let mL = 40, sMuted = labToRgb(at(mL, 3));
while (contrast(sMuted, sGround) < 4.5 && mL > 0) sMuted = labToRgb(at(--mL, 3));
const out = {
  ground: { hex: hex(gRgb), lab: gLab.map(r1) },
  photo: { hex: hex(pRgb), lab: pLab.map(r1) },
  clash,
  suggest: { ground: hex(sGround), ink: hex(sInk), muted: hex(sMuted), line: hex(sLine) },
  contrast: { ink: r1(contrast(sInk, sGround)), muted: r1(contrast(sMuted, sGround)) },
};
if (args.includes('--json')) console.log(JSON.stringify(out));
else console.log(`ground ${out.ground.hex} b*=${out.ground.lab[2]}  photo ${out.photo.hex} b*=${out.photo.lab[2]}  clash: ${clash}\nsuggest ground ${out.suggest.ground} ink ${out.suggest.ink} muted ${out.suggest.muted} line ${out.suggest.line}  contrast ink ${out.contrast.ink} muted ${out.contrast.muted}`);
