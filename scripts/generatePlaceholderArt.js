/**
 * Generates PLACEHOLDER art (task 1.10): app icon, adaptive icon layers, splash image and the
 * Ace mascot. Replace the output files with the real 1024x1024 art when it arrives; no code
 * change is needed. Run with `npm run art:placeholder`.
 *
 * Shapes are drawn with signed distance functions and anti-aliased, then written as PNG with
 * Node's built-in zlib (no image library needed).
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SIZE = 1024;
const ASSETS = path.join(__dirname, '..', 'assets');

// Theme colours (src/theme/colors.ts). The card is a darker burgundy so it reads on the background.
const BURGUNDY = [0x7a, 0x1f, 0x2b];
const CARD = [0x5a, 0x14, 0x1f];
const GOLD = [0xd4, 0xa9, 0x4f];
const GOLD_HIGHLIGHT = [0xf6, 0xd9, 0x8b];
const CREAM = [0xff, 0xf8, 0xe7];
const DARK = [0x2b, 0x1b, 0x2e];
const WHITE = [0xff, 0xff, 0xff];

// ---------- distance functions (negative inside) ----------
function sdRoundRect(x, y, cx, cy, hw, hh, r) {
  const qx = Math.abs(x - cx) - hw + r;
  const qy = Math.abs(y - cy) - hh + r;
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - r;
}
function sdSegment(x, y, ax, ay, bx, by, halfWidth) {
  const pax = x - ax;
  const pay = y - ay;
  const bax = bx - ax;
  const bay = by - ay;
  const h = Math.max(0, Math.min(1, (pax * bax + pay * bay) / (bax * bax + bay * bay)));
  return Math.hypot(pax - bax * h, pay - bay * h) - halfWidth;
}
function sdCircle(x, y, cx, cy, r) {
  return Math.hypot(x - cx, y - cy) - r;
}
function sdPolygon(x, y, pts) {
  let d = (x - pts[0][0]) ** 2 + (y - pts[0][1]) ** 2;
  let s = 1;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i, i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    const ex = xj - xi;
    const ey = yj - yi;
    const wx = x - xi;
    const wy = y - yi;
    const h = Math.max(0, Math.min(1, (wx * ex + wy * ey) / (ex * ex + ey * ey)));
    d = Math.min(d, (wx - ex * h) ** 2 + (wy - ey * h) ** 2);
    const c1 = y >= yi;
    const c2 = y < yj;
    const c3 = ex * wy > ey * wx;
    if ((c1 && c2 && c3) || (!c1 && !c2 && !c3)) s = -s;
  }
  return s * Math.sqrt(d);
}
const union = (...ds) => Math.min(...ds);

/** A capital "A" made of two strokes and a crossbar, centred at (cx, cy) with height h. */
function sdLetterA(x, y, cx, cy, h) {
  const w = h * 0.42;
  const t = h * 0.075;
  const top = cy - h / 2;
  const bottom = cy + h / 2;
  return union(
    sdSegment(x, y, cx, top, cx - w, bottom, t),
    sdSegment(x, y, cx, top, cx + w, bottom, t),
    sdSegment(x, y, cx - w * 0.52, cy + h * 0.14, cx + w * 0.52, cy + h * 0.14, t * 0.85),
  );
}

/** Coverage 0..1 from a distance in pixels (1px anti-aliasing). */
const cover = (d) => Math.max(0, Math.min(1, 0.5 - d));

// ---------- drawing ----------
function render(layers, background) {
  const data = Buffer.alloc(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      if (background) [r, g, b, a] = [...background, 1];
      for (const layer of layers) {
        const alpha = cover(layer.sd(px, py)) * (layer.alpha ?? 1);
        if (alpha <= 0) continue;
        // "over" compositing in straight alpha
        const outA = alpha + a * (1 - alpha);
        r = (layer.color[0] * alpha + r * a * (1 - alpha)) / outA;
        g = (layer.color[1] * alpha + g * a * (1 - alpha)) / outA;
        b = (layer.color[2] * alpha + b * a * (1 - alpha)) / outA;
        a = outA;
      }
      const i = (y * SIZE + x) * 4;
      data[i] = Math.round(r);
      data[i + 1] = Math.round(g);
      data[i + 2] = Math.round(b);
      data[i + 3] = Math.round(a * 255);
    }
  }
  return data;
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, body) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(body.length);
  const tb = Buffer.concat([Buffer.from(type, 'ascii'), body]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(tb));
  return Buffer.concat([len, tb, crc]);
}
function writePng(file, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(SIZE, 0);
  ihdr.writeUInt32BE(SIZE, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc((SIZE * 4 + 1) * SIZE);
  for (let y = 0; y < SIZE; y++) {
    raw[y * (SIZE * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (SIZE * 4 + 1) + 1, y * SIZE * 4, (y + 1) * SIZE * 4);
  }
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, png);
  console.log('wrote', path.relative(path.join(__dirname, '..'), file));
}

// ---------- the "A" card ----------
/** Layers for a burgundy playing card with a gold border and a gold "A", scaled by `s`. */
function aceCardLayers(s) {
  const c = SIZE / 2;
  const hw = 215 * s;
  const hh = 300 * s;
  const r = 40 * s;
  const border = 14 * s;
  const cornerA = (x, y, cx, cy) => sdLetterA(x, y, cx, cy, 70 * s);
  return [
    // soft shadow
    {
      color: [0, 0, 0],
      alpha: 0.25,
      sd: (x, y) => sdRoundRect(x, y, c + 8 * s, c + 14 * s, hw, hh, r),
    },
    { color: GOLD, sd: (x, y) => sdRoundRect(x, y, c, c, hw, hh, r) },
    { color: CARD, sd: (x, y) => sdRoundRect(x, y, c, c, hw - border, hh - border, r - border) },
    { color: GOLD_HIGHLIGHT, sd: (x, y) => sdLetterA(x, y, c, c, 270 * s) },
    { color: GOLD, sd: (x, y) => cornerA(x, y, c - hw + 70 * s, c - hh + 80 * s) },
    { color: GOLD, sd: (x, y) => cornerA(x, y, c + hw - 70 * s, c + hh - 80 * s) },
  ];
}

// Legacy / store icon: full-bleed burgundy with the card.
writePng(path.join(ASSETS, 'icon.png'), render(aceCardLayers(1.25), BURGUNDY));
// Adaptive icon: background layer and a foreground that stays inside the 66% safe zone.
writePng(path.join(ASSETS, 'android-icon-background.png'), render([], BURGUNDY));
writePng(path.join(ASSETS, 'android-icon-foreground.png'), render(aceCardLayers(1.0)));
// Monochrome (themed icons): a white card with the "A" cut out.
writePng(
  path.join(ASSETS, 'android-icon-monochrome.png'),
  render([
    {
      color: WHITE,
      sd: (x, y) =>
        Math.max(
          sdRoundRect(x, y, SIZE / 2, SIZE / 2, 215, 300, 40),
          -sdLetterA(x, y, SIZE / 2, SIZE / 2, 270),
        ),
    },
  ]),
);
// Splash image (shown on the velvet splash background).
writePng(path.join(ASSETS, 'splash-icon.png'), render(aceCardLayers(1.2)));

// ---------- placeholder Ace mascot ----------
function mascotLayers() {
  const c = SIZE / 2;
  const cy = c + 70;
  const hw = 300;
  const hh = 390;
  const crown = [
    [c - 170, cy - hh + 40],
    [c - 190, cy - hh - 130],
    [c - 95, cy - hh - 50],
    [c, cy - hh - 170],
    [c + 95, cy - hh - 50],
    [c + 190, cy - hh - 130],
    [c + 170, cy - hh + 40],
  ];
  const smile = [];
  for (let i = 0; i <= 12; i++) {
    const t = Math.PI * (0.15 + 0.7 * (i / 12));
    smile.push([c + Math.cos(t) * 110, cy + 40 + Math.sin(t) * 80]);
  }
  const sdSmile = (x, y) => {
    let d = Infinity;
    for (let i = 0; i < smile.length - 1; i++) {
      d = Math.min(d, sdSegment(x, y, ...smile[i], ...smile[i + 1], 14));
    }
    return d;
  };
  const cornerA = (x, y, cx, cy2) => sdLetterA(x, y, cx, cy2, 90);
  return [
    { color: [0, 0, 0], alpha: 0.2, sd: (x, y) => sdRoundRect(x, y, c + 10, cy + 16, hw, hh, 60) },
    { color: GOLD, sd: (x, y) => sdRoundRect(x, y, c, cy, hw, hh, 60) },
    { color: CREAM, sd: (x, y) => sdRoundRect(x, y, c, cy, hw - 16, hh - 16, 46) },
    { color: GOLD, sd: (x, y) => sdPolygon(x, y, crown) },
    { color: GOLD_HIGHLIGHT, sd: (x, y) => sdCircle(x, y, c, cy - hh - 150, 22) },
    { color: GOLD_HIGHLIGHT, sd: (x, y) => sdCircle(x, y, c - 185, cy - hh - 115, 18) },
    { color: GOLD_HIGHLIGHT, sd: (x, y) => sdCircle(x, y, c + 185, cy - hh - 115, 18) },
    { color: BURGUNDY, sd: (x, y) => cornerA(x, y, c - hw + 85, cy - hh + 100) },
    { color: BURGUNDY, sd: (x, y) => cornerA(x, y, c + hw - 85, cy + hh - 100) },
    { color: DARK, sd: (x, y) => sdCircle(x, y, c - 100, cy - 60, 34) },
    { color: DARK, sd: (x, y) => sdCircle(x, y, c + 100, cy - 60, 34) },
    { color: WHITE, sd: (x, y) => sdCircle(x, y, c - 88, cy - 72, 10) },
    { color: WHITE, sd: (x, y) => sdCircle(x, y, c + 112, cy - 72, 10) },
    { color: [0xe8, 0x8a, 0x9a], alpha: 0.6, sd: (x, y) => sdCircle(x, y, c - 175, cy + 30, 34) },
    { color: [0xe8, 0x8a, 0x9a], alpha: 0.6, sd: (x, y) => sdCircle(x, y, c + 175, cy + 30, 34) },
    { color: BURGUNDY, sd: sdSmile },
  ];
}
writePng(path.join(ASSETS, 'mascot', 'ace.png'), render(mascotLayers()));
