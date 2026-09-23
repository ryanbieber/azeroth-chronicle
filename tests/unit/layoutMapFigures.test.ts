import { describe, expect, it } from 'vitest';
import { layoutMapFigures, type ScreenRect } from '../../src/lib/map/layoutMapFigures';

function intersects(a: ScreenRect, b: ScreenRect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x
    && a.y < b.y + b.height && a.y + a.height > b.y;
}

describe('map figure layout', () => {
  it('separates several people sharing a map anchor and clears the story card', () => {
    const viewport = { x: 0, y: 0, width: 1100, height: 700 };
    const storyCard = { x: 16, y: 300, width: 390, height: 380 };
    const figures = Array.from({ length: 5 }, () => ({ x: 380, y: 350, width: 110, height: 160 }));
    const offsets = layoutMapFigures(figures, viewport, [storyCard]);
    const placed = figures.map((figure, index) => ({
      ...figure,
      x: figure.x + offsets[index]!.x,
      y: figure.y + offsets[index]!.y,
    }));

    placed.forEach((figure, index) => {
      expect(intersects(figure, storyCard)).toBe(false);
      placed.slice(index + 1).forEach((other) => expect(intersects(figure, other)).toBe(false));
    });
  });
});
