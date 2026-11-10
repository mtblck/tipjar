// Icons added in 1.1, each with a moving part, redrawn in 2.0 (all but jar). See drawing.ts.
import type { Drawing } from './drawing.js';
import { from, solid } from './drawing.js';

// A circle, drawn anticlockwise; `hole` draws it clockwise, so it cuts out of the circle around it.
const ring = (cx: number, cy: number, r: number, hole = false): string =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 ${+hole} ${2 * r} 0a${r} ${r} 0 1 ${+hole} ${-2 * r} 0z`;

/** Jar, coin, tea, pizza and music. */
export const MORE_DRAWINGS = {
  jar: {
    flat: `${solid('M7 7.5h10a1 1 0 0 1 1 1V10H6V8.5a1 1 0 0 1 1-1z')}<path fill="currentColor" fill-rule="evenodd" d="M6 11h12a2 2 0 0 1 2 2v5.5a3.5 3.5 0 0 1-3.5 3.5h-9A3.5 3.5 0 0 1 4 18.5V13a2 2 0 0 1 2-2zM7.5 14a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0z"/>`,
    outline: 'M7 7h10v3H7zM6 10h12a2 2 0 0 1 2 2v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6a2 2 0 0 1 2-2zM8 14v3',
    pixel: from(5, [
      '..########..',
      '............',
      '.##########.',
      '.#.########.',
      '.#.########.',
      '.##########.',
      '..########..',
    ]),
    parts: [
      {
        name: 'coin',
        flat: ring(12, 3.5, 2.5),
        outline: ring(12, 3, 1.5),
        pixel: ['....####....', '...######...', '...######...', '....####....'],
      },
    ],
  },
  coin: {
    flat: '',
    outline: '',
    pixel: [],
    parts: [
      {
        name: 'turn',
        flat: `${ring(11, 13, 8.5)}${ring(11, 13, 6, true)}${ring(11, 13, 4.75)}`,
        outline: `${ring(11, 13, 8)}${ring(11, 13, 4)}`,
        pixel: from(2, [
          '..######....',
          '.########...',
          '###....###..',
          '##.####.##..',
          '##.####.##..',
          '##.####.##..',
          '###....###..',
          '.########...',
          '..######....',
        ]),
        // Turning: three quarters on, then edge on.
        frames: [
          from(2, [
            '...####.....',
            '..######....',
            '..##..##....',
            '..#.##.#....',
            '..#.##.#....',
            '..#.##.#....',
            '..##..##....',
            '..######....',
            '...####.....',
          ]),
          from(2, Array(9).fill('....##......')),
        ],
      },
      {
        name: 'shine',
        flat: 'M20 1.5c.3 1.6 1 2.3 2.5 2.5-1.6.3-2.3 1-2.5 2.5-.3-1.6-1-2.3-2.5-2.5 1.6-.3 2.3-1 2.5-2.5z',
        soften: 1,
        outline: 'M20 2v4M18 4h4',
        pixel: ['..........#.', '.........###', '..........#.'],
      },
    ],
  },
  tea: {
    flat: solid('M8 9h11v7a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4zM19 10.5h1a3 3 0 0 1 0 6h-1.2l.3-2h.9a1 1 0 0 0 0-2H19z'),
    outline: 'M8 9h10v6a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4zM18 10.5h1a2.5 2.5 0 0 1 0 5h-1',
    pixel: from(4, [
      '....######..',
      '....########',
      '....######.#',
      '....######.#',
      '....########',
      '....######..',
      '.....####...',
    ]),
    parts: [
      {
        // The bag's string, up out of the tea and over the rim, and its tag hanging outside the cup.
        name: 'dangle',
        flat: 'M10.5 9L8 7.8L4.6 12.5L8 7.8zM3 12.5h3.2a.5.5 0 0 1 .5.5v3.5a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V13a.5.5 0 0 1 .5-.5z',
        soften: 1.25,
        outline: 'M8 8.5L4 12.5M2 13h3.5v3.5H2z',
        pixel: from(3, [
          '....#.......',
          '...#........',
          '..#.........',
          '.#..........',
          '###.........',
          '###.........',
          '###.........',
        ]),
      },
    ],
  },
  pizza: {
    flat: `<path fill="currentColor" fill-rule="evenodd" d="M11 13L11 4A9 9 0 1 0 18.79 8.5z${ring(7, 11, 1.5, true)}${ring(8.5, 17, 1.5, true)}${ring(14, 16, 1.5, true)}"/>`,
    outline: 'M10.5 13.5V5A8.5 8.5 0 1 0 18 9.5zM7 12h.01M9 17h.01M14 16h.01',
    pixel: from(2, [
      '...##.......',
      '.####.......',
      '.####.......',
      '#####.......',
      '##.##.......',
      '##########..',
      '##########..',
      '.#####.##...',
      '.########...',
      '...####.....',
    ]),
    parts: [
      {
        // A slice, a little way out of the pie.
        name: 'serve',
        flat: `M12 11.5L12 2.5A9 9 0 0 1 19.79 7z${ring(14.6, 6.8, 1.3, true)}`,
        outline: 'M12.5 11V3A8 8 0 0 1 19.4 7z',
        pixel: from(1, ['......##....', '......####..', '......####..', '......#####.', '......#####.']),
      },
    ],
  },
  music: {
    flat: '',
    outline: '',
    pixel: [],
    parts: [
      {
        // Two notes joined by a beam, which move as one.
        name: 'bop',
        flat: 'M6.5 15.2c1.9-.6 3.7.2 3.9 1.7.2 1.6-1.2 3.2-3.1 3.7-1.9.6-3.7-.2-3.9-1.7-.2-1.6 1.2-3.2 3.1-3.7zM8.6 6.3l11.4-3.3v4.2L10.4 10V17h-1.8zM17.5 13.2c1.9-.6 3.7.2 3.9 1.7.2 1.6-1.2 3.2-3.1 3.7-1.9.6-3.7-.2-3.9-1.7-.2-1.6 1.2-3.2 3.1-3.7zM19.6 4.6h1.8V15h-1.8z',
        outline: `${ring(7, 18, 2.5)}${ring(17.5, 16, 2.5)}M9.5 18V6.5l10.5-3v12.5M9.5 10l10.5-3`,
        pixel: from(1, [
          '...########.',
          '...########.',
          '...#......#.',
          '...#......#.',
          '...#......#.',
          '...#......#.',
          '...#....###.',
          '.###...####.',
          '####...###..',
          '###.........',
        ]),
      },
    ],
  },
} satisfies Record<string, Drawing>;
