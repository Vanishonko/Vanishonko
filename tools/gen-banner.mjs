// Generates the profile banner as a pixel grid + pixelart sidecar.
// Run: node tools/gen-banner.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const FONT = {
  I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
};

const TEXT = 'IVAN ILIEV';
const S = 7;            // pixel scale
const W = 512, H = 128; // canvas
const GLYPH = 5, GAP = 1;
const CURSOR_W = 2, CURSOR_GAP = 4;

const lineW = TEXT.length * (GLYPH + GAP) - GAP;
const totalW = (lineW + CURSOR_GAP + CURSOR_W) * S;
const x0 = Math.round((W - totalW) / 2);
const y0 = Math.round((H - 7 * S) / 2);

const grid = Array.from({ length: H }, () => Array(W).fill('b'));

// frame
const INSET = 5;
for (let x = INSET; x < W - INSET; x++) { grid[INSET][x] = 'f'; grid[H - 1 - INSET][x] = 'f'; }
for (let y = INSET; y < H - INSET; y++) { grid[y][INSET] = 'f'; grid[y][W - 1 - INSET] = 'f'; }

// wordmark
let cx = x0;
for (const ch of TEXT) {
  const g = FONT[ch];
  for (let gy = 0; gy < 7; gy++) {
    for (let gx = 0; gx < GLYPH; gx++) {
      if (g[gy][gx] !== '#') continue;
      for (let sy = 0; sy < S; sy++) {
        for (let sx = 0; sx < S; sx++) {
          grid[y0 + gy * S + sy][cx + gx * S + sx] = 't';
        }
      }
    }
  }
  cx += (GLYPH + GAP) * S;
}

// amber cursor at the baseline
const curX = x0 + (lineW + CURSOR_GAP) * S;
for (let y = 0; y < 7 * S; y++) {
  for (let x = 0; x < CURSOR_W * S; x++) grid[y0 + y][curX + x] = 'a';
}

// frame 2: same banner, cursor extinguished (blinking cursor)
const blink = grid.map((r) => r.slice());
for (let y = 0; y < 7 * S; y++) {
  for (let x = 0; x < CURSOR_W * S; x++) blink[y0 + y][curX + x] = 'b';
}

const sidecar = {
  palette: { b: '#10141c', f: '#2f3a50', t: '#ece9e0', a: '#f0b429' },
  frames: [grid.map((r) => r.join('')), blink.map((r) => r.join(''))],
};

const out = join(import.meta.dirname, '..', 'assets', 'banner.pixelart.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(sidecar));
console.log(`wrote ${out}  ${W}x${H}`);
