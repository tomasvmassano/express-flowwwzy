/**
 * Palette resolver — finds the closest named palette in PALETTES for a
 * given set of dominant hex values, using ΔE76 distance in CIE Lab space.
 *
 * Why Lab and not RGB? RGB Euclidean distance lies — two pairs with the
 * same RGB Δ can look very different to the eye. Lab is roughly
 * perceptually uniform, so "this red is closer to that red" works the
 * way you'd expect. ΔE76 is the simple form (CIE76); ΔE2000 is more
 * accurate but ~5× the code for ~5% better results — not worth it here.
 *
 * Usage:
 *   const { id, distance } = findClosestPaletteId(reference.palette.dominantHex);
 *   reference.palette.closestId = id;
 */

import { PALETTES, PaletteId, PALETTE_IDS } from "../vocabulary";

// ───────────────────────────────────────────────────────────────────────────
// sRGB → linear RGB → XYZ (D65) → Lab
// ───────────────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function rgbToXyz([r, g, b]: [number, number, number]): [number, number, number] {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  // sRGB D65 transform matrix
  return [
    lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375,
    lr * 0.2126729 + lg * 0.7151522 + lb * 0.072175,
    lr * 0.0193339 + lg * 0.119192 + lb * 0.9503041,
  ];
}

function xyzToLab([x, y, z]: [number, number, number]): [number, number, number] {
  // D65 reference white
  const xn = x / 0.95047;
  const yn = y / 1.0;
  const zn = z / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(xn);
  const fy = f(yn);
  const fz = f(zn);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

export function hexToLab(hex: string): [number, number, number] {
  return xyzToLab(rgbToXyz(hexToRgb(hex)));
}

function deltaE76(
  a: [number, number, number],
  b: [number, number, number]
): number {
  const dL = a[0] - b[0];
  const da = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dL * dL + da * da + db * db);
}

// ───────────────────────────────────────────────────────────────────────────
// Match raw hex array against named palettes
// ───────────────────────────────────────────────────────────────────────────

/**
 * For each ref color, find the nearest color in the candidate palette.
 * Sum those minimum distances. The palette with the lowest sum wins.
 */
export function findClosestPaletteId(
  refHex: string[]
): { id: PaletteId; distance: number; ranked: { id: PaletteId; distance: number }[] } {
  if (refHex.length === 0) {
    throw new Error("findClosestPaletteId requires at least one hex color");
  }

  const refLabs = refHex.map(hexToLab);

  const scored = PALETTE_IDS.map((id) => {
    const palLabs = PALETTES[id].hex.map(hexToLab);
    const totalDistance = refLabs.reduce((sum, refLab) => {
      const minDist = palLabs.reduce(
        (m, palLab) => Math.min(m, deltaE76(refLab, palLab)),
        Number.POSITIVE_INFINITY
      );
      return sum + minDist;
    }, 0);
    return { id, distance: totalDistance };
  });

  scored.sort((a, b) => a.distance - b.distance);
  return { id: scored[0].id, distance: scored[0].distance, ranked: scored };
}
