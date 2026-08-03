// The brand mark, defined once as geometry.
//
// A six-blade lens iris: a disc with a hexagonal opening and six tangential
// blade separations. Consumed by generate-icons.mjs (favicon, PWA, apple-touch)
// and generate-logo.mjs (wordmark lockups) so the two can never drift.
//
// To restyle the brand, change the constants here and re-run both:
//   npm run icons && npm run logo

export const INK = '#191817';   // warm near-black; also <meta name="theme-color">
export const AMBER = '#D8A64A'; // candlelight amber, sampled from the hero photograph

export const BOX = 512;
export const CORNER = 116;      // ~22.6% — reads as a rounded chip even at 16px

const RADIUS = 182;             // outer radius of the iris disc
const OPENING = 80;             // circumradius of the hexagonal opening
const BLADE_W = 15;             // width of the separations between blades
const BLADE_ANGLE = 38;         // tangential offset; radial lines would read as a star

function polar(radius, degrees, cx, cy) {
  const a = ((degrees - 90) * Math.PI) / 180;
  return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)];
}

// scale shrinks the mark inside the same box — used for the maskable safe zone
export function iris({ scale = 1, cx = BOX / 2, cy = BOX / 2, blades = INK } = {}) {
  const R = RADIUS * scale;
  const r = OPENING * scale;

  const hex = Array.from({ length: 6 }, (_, i) =>
    polar(r, i * 60, cx, cy).map((n) => n.toFixed(1)).join(',')
  ).join(' ');

  const separations = Array.from({ length: 6 }, (_, i) => {
    const [hx, hy] = polar(r, i * 60, cx, cy);
    const [ex, ey] = polar(R + 6 * scale, i * 60 + BLADE_ANGLE, cx, cy);
    return `<line x1="${hx.toFixed(1)}" y1="${hy.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}"`
         + ` stroke="${blades}" stroke-width="${(BLADE_W * scale).toFixed(1)}"/>`;
  }).join('');

  return `<circle cx="${cx}" cy="${cy}" r="${R.toFixed(1)}" fill="${AMBER}"/>`
       + `<polygon points="${hex}" fill="${blades}"/>${separations}`;
}

// The full tile: rounded ink square with the iris centred. corner:0 gives a hard
// square (iOS applies its own mask; Android adaptive icons crop to a circle).
export function markSvg({ corner = CORNER, scale = 1 } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOX} ${BOX}" width="${BOX}" height="${BOX}">`
       + `<rect width="${BOX}" height="${BOX}" rx="${corner}" ry="${corner}" fill="${INK}"/>`
       + iris({ scale })
       + `</svg>`;
}
