# Backgrounds

Two worked examples for the Background step (`SKILL.md` section 5.5) on a login or register page: a subject graphic behind the form that moves. Examples are for a music library; swap the subject for the page's own. Both are decorative and use generated art only.

## Layer structure (both)

The graphic is one fixed layer behind the form card. The form, its card and its contrast stay untouched.

```html
<main class="auth-screen"> <!-- isolation:isolate; position:relative; overflow:hidden -->
  <div class="bgfx" aria-hidden="true"> ...graphic... </div>
  <section class="auth-hero"> ...form... </section>
</main>
```

```css
.auth-screen{isolation:isolate;position:relative;overflow:hidden}
.bgfx{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden;contain:strict}
```

Motion is `transform` and `opacity` only, on a few elements, with `will-change:transform` on the ones that loop. Tint from the page's accent or a neutral, never violet; the accent stays on its own marks.

## A. Vinyl: an anchored object plus a side filler

A record half off the right edge at 33 rpm, a light fixed on the grooves, a label with the product name, a tonearm that swings in on load (the page's one load animation), and sound rings on a canvas across the left side.

```css
.bgfx{--rec:min(118vh,1000px)}
.bgfx .rec,.bgfx .sheen{position:absolute;width:var(--rec);aspect-ratio:1;right:max(-34vh,-300px);top:50%;margin-top:calc(var(--rec)/-2);border-radius:50%}
.bgfx .rec{background:repeating-radial-gradient(circle,#121318 0 1px,#191a20 1px 2.4px,#0f1014 2.4px 3.2px);
  animation:spin 1.8s linear infinite;will-change:transform}
.bgfx .label{position:absolute;inset:34.5%;border-radius:50%;display:grid;place-items:center;
  background:conic-gradient(from 0deg,oklch(.42 .1 250),oklch(.36 .08 215),oklch(.42 .1 250))}
.bgfx .label span{font:500 clamp(13px,1.6vh,15px)/1.3 sans-serif}  /* text at least 13px */
/* the light does not spin: it is a sibling of .rec, not a child */
.bgfx .sheen{background:conic-gradient(from 20deg,transparent 0 4%,rgb(255 255 255/.09) 9%,transparent 15% 50%,rgb(255 255 255/.06) 57%,transparent 64%);mix-blend-mode:screen}
.bgfx .arm{position:absolute;right:max(-6vh,-40px);top:6vh;width:min(60vh,520px);
  transform-origin:84.6% 15.4%;animation:cue 1.6s .4s cubic-bezier(.3,.7,.2,1) both}  /* the pivot, as % of the arm's box */
.bgfx canvas{position:absolute;inset:0;width:100%;height:100%;opacity:0;animation:fade 1.2s 1.8s ease-out forwards}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes cue{from{transform:rotate(26deg)}}          /* ends at rest: the needle drops on the groove */
@keyframes fade{to{opacity:1}}
```

390 rule: the record moves to the bottom-right corner, the arm and the canvas are hidden, never squeezed.

```css
@media (max-width:560px){
  .bgfx{--rec:130vw}
  .bgfx .rec,.bgfx .sheen{right:-65vw;top:auto;bottom:-30vw;margin-top:0}
  .bgfx .arm,.bgfx canvas{display:none}
}
```

Reduced motion: the record and arm stop, the rings show one finished frame.

```css
@media (prefers-reduced-motion:reduce){.bgfx .rec,.bgfx .arm{animation:none}.bgfx canvas{animation:none;opacity:1}}
```

### Canvas rings

Rings leave the needle across the left half, one per period, fading before the record. 30 fps cap, 1x pixel density (width and height are the CSS size, no devicePixelRatio scaling), 64 points per ring, nothing drawn while the tab is hidden or the canvas is `display:none`, geometry read once per resize and never per frame. SVG elements have no `offsetWidth` or `offsetTop` (they give NaN): read `getComputedStyle` instead.

```js
var c = document.querySelector('.bgfx canvas'), arm = document.querySelector('.bgfx .arm');
var ctx = c.getContext('2d'), w = 0, h = 0, sx = 0, sy = 0, period = 1, life = 7, N = 64;
function size() {                        // runs at load and on resize only
  w = c.width = c.clientWidth; h = c.height = c.clientHeight;      // 1x density
  var cs = getComputedStyle(arm), aw = parseFloat(cs.width), r = aw / 520;
  sx = innerWidth - parseFloat(cs.right) - aw + 113 * r;           // the needle's resting point
  sy = parseFloat(cs.top) + 169 * r;                               // (113, 169 in the arm's 520 box)
}
size(); addEventListener('resize', size);
function draw(t) {
  ctx.clearRect(0, 0, w, h);
  if (!w) return;
  var maxR = Math.hypot(sx, Math.max(sy, h - sy));
  for (var k = 0; k <= life / period; k++) {
    var age = (t % period) + k * period;
    if (age > life) continue;
    var p = age / life, R = 30 + p * maxR;
    ctx.beginPath();
    for (var i = 0; i <= N; i++) {                                 // left half circle, 64 points
      var th = Math.PI * 0.5 + (i / N) * Math.PI;
      var wob = Math.sin(th * 26 + t * 3 + k) * 3 * (1 - p) + Math.sin(th * 9 - t * 2) * 5 * p;  // slight wave
      var x = sx + Math.cos(th) * (R + wob), y = sy + Math.sin(th) * (R + wob);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    var al = 0.6 * (1 - p) * Math.min(1, age * 2);                 // fade out with age
    ctx.strokeStyle = 'rgba(130,185,255,' + al + ')';
    ctx.stroke();
  }
}
if (matchMedia('(prefers-reduced-motion: reduce)').matches) { draw(2.4); addEventListener('resize', function () { draw(2.4); }); }   // one still frame, no loop; resize clears the canvas, so redraw
else {
  var t0 = performance.now(), last = 0;
  (function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden || !c.offsetWidth || now - last < 33) return;        // hidden tab, hidden canvas, 30 fps cap
    last = now; draw((now - t0) / 1000);
  })(t0);
}
```

## B. Waveform: a band behind the form

A bar waveform across the middle, pulsing at 120 bpm (one beat is 0.5 s), a glowing playhead sweeping every 16 s that turns the played bars the accent colour.

```html
<div class="bgfx" aria-hidden="true"><div class="wave">
  <div class="breathe">
    <div class="base"><svg viewBox="0 0 1440 200" preserveAspectRatio="none">
      <rect x="0" y="92" width="6" height="16" rx="3"/><rect x="12" y="77" width="6" height="46" rx="3"/>
      <!-- ...one rect per 12 units across 1440, heights hand-varied around y=100 (about 120 bars) -->
    </svg></div>
    <div class="played"><div><svg><!-- the same svg again: same viewBox, preserveAspectRatio and rects --></svg></div></div>
  </div>
  <div class="head"></div>
</div></div>
```

```css
.bgfx .wave{position:absolute;left:0;right:0;top:28%;height:44%;
  mask:linear-gradient(to right,transparent,#000 12%,#000 88%,transparent)}
.bgfx .wave svg{position:absolute;inset:0;width:100%;height:100%}
.bgfx .breathe{position:absolute;inset:0;animation:beat .5s ease-in-out infinite alternate;will-change:transform}
.bgfx .base svg{fill:color-mix(in oklab,var(--text) 9%,transparent)}
/* the played part: an outer box slides in from the left while its inner copy slides back, so the bars stay put */
.bgfx .played{position:absolute;inset:0;overflow:hidden;transform:translateX(-100%);animation:play 16s linear infinite;will-change:transform}
.bgfx .played>div{position:absolute;inset:0;transform:translateX(100%);animation:unplay 16s linear infinite;will-change:transform}
.bgfx .played svg{fill:color-mix(in oklab,var(--accent) 38%,transparent)}
.bgfx .head{position:absolute;top:8%;bottom:8%;left:0;width:2px;background:var(--accent);
  box-shadow:0 0 18px 2px color-mix(in oklab,var(--accent) 60%,transparent);animation:head 16s linear infinite;will-change:transform}
@keyframes beat{from{transform:scaleY(.94)}to{transform:scaleY(1.04)}}
@keyframes play{to{transform:translateX(0)}}
@keyframes unplay{to{transform:translateX(0)}}
@keyframes head{to{transform:translateX(100vw)}}
```

The played bars reveal by sliding a clipping box, not by animating width or clip-path. About 240 static rects, only 4 animated nodes.

390 rule: the band moves to the bottom, where the form does not cover it.

```css
@media (max-width:560px){.bgfx .wave{top:auto;bottom:0;height:22%}}
```

Reduced motion: no loop, one frame with the playhead part way along.

```css
@media (prefers-reduced-motion:reduce){
  .bgfx .breathe,.bgfx .played,.bgfx .played>div,.bgfx .head{animation:none}
  .bgfx .played{transform:translateX(-62%)}.bgfx .played>div{transform:translateX(62%)}.bgfx .head{transform:translateX(38vw)}
}
```
