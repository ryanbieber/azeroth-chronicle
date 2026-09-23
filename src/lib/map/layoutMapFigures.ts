export interface ScreenRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FigurePlacement {
  x: number;
  y: number;
}

function moved(rect: ScreenRect, offset: FigurePlacement): ScreenRect {
  return { ...rect, x: rect.x + offset.x, y: rect.y + offset.y };
}

function intersectionArea(a: ScreenRect, b: ScreenRect, gap = 0): number {
  const width = Math.max(0, Math.min(a.x + a.width + gap, b.x + b.width) - Math.max(a.x, b.x));
  const height = Math.max(0, Math.min(a.y + a.height + gap, b.y + b.height) - Math.max(a.y, b.y));
  return width * height;
}

function fits(rect: ScreenRect, viewport: ScreenRect, padding: number): boolean {
  return rect.x >= viewport.x + padding
    && rect.y >= viewport.y + padding
    && rect.x + rect.width <= viewport.x + viewport.width - padding
    && rect.y + rect.height <= viewport.y + viewport.height - padding;
}

/** Place projected portraits near their map anchors without covering another portrait or tour card. */
export function layoutMapFigures(
  figures: ScreenRect[],
  viewport: ScreenRect,
  obstacles: ScreenRect[],
  padding = 8,
): FigurePlacement[] {
  const occupied = [...obstacles];
  return figures.map((figure) => {
    let best: FigurePlacement = { x: 0, y: 0 };
    let bestScore = Number.POSITIVE_INFINITY;
    for (let radius = 0; radius <= 512; radius += 32) {
      const count = radius === 0 ? 1 : 24;
      for (let index = 0; index < count; index += 1) {
        const angle = (index / count) * Math.PI * 2;
        const offset = {
          x: Math.round(Math.cos(angle) * radius),
          y: Math.round(Math.sin(angle) * radius),
        };
        const candidate = moved(figure, offset);
        if (!fits(candidate, viewport, padding)) continue;
        const overlap = occupied.reduce((total, other) => total + intersectionArea(candidate, other, padding), 0);
        if (overlap === 0) {
          best = offset;
          bestScore = 0;
          break;
        }
        const score = overlap * 100 + radius;
        if (score < bestScore) {
          best = offset;
          bestScore = score;
        }
      }
      if (bestScore === 0) break;
    }
    occupied.push(moved(figure, best));
    return best;
  });
}
