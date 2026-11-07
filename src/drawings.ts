// The drawings behind every built-in icon. All are tipjar's own, in `currentColor`. Changing how a
// drawing looks is noted in CHANGELOG; splitting it into parts that look the same is not.
import type { IconName } from './icons.js';

/** A moving part of an icon, drawn on top of the rest. Its class names the animation in style.css. */
export interface Part {
  /** The part's name: `tipjar-<name>` is its class. */
  name: string;
  /** Path data for the 24x24 flat icon, filled. */
  flat: string;
  /** Path data for the 24x24 outline icon, stroked. */
  outline: string;
  /** Rows of the 12x12 pixel grid, from the top; `#` is filled. */
  pixel: readonly string[];
}

/** One icon, in each style. Its parts, drawn after it, complete the still picture. */
export interface Drawing {
  /** Inner markup for the 24x24 flat icon. */
  flat: string;
  /** Path data for the 24x24 outline icon, stroked. */
  outline: string;
  /** Twelve rows of twelve cells; `#` is filled. */
  pixel: readonly string[];
  /** Moving parts, if any. */
  parts?: readonly Part[];
}

// Flat shapes that are just a filled outline get a same-colour round stroke, which softens their points.
const soft = (d: string, width = 1.5): string =>
  `<path fill="currentColor" stroke="currentColor" stroke-width="${width}" stroke-linejoin="round" d="${d}"/>`;
const solid = (d: string): string => `<path fill="currentColor" d="${d}"/>`;

const HEART =
  'M12 20.5s-8-4.9-10-10C.6 6.8 3.2 3.5 6.7 3.5c2.2 0 4 1.2 5.3 3 1.3-1.8 3.1-3 5.3-3 3.5 0 6.1 3.3 4.7 7-2 5.1-10 10-10 10z';
const STAR = 'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z';
const SPARK = 'M10 3.5c.6 4 2.5 5.9 6.5 6.5-4 .6-5.9 2.5-6.5 6.5-.6-4-2.5-5.9-6.5-6.5 4-.6 5.9-2.5 6.5-6.5z';

/** Every built-in icon. */
export const DRAWINGS: Record<IconName, Drawing> = {
  heart: {
    flat: soft(HEART),
    outline: HEART,
    pixel: [
      '............',
      '.###....###.',
      '#####..#####',
      '############',
      '############',
      '############',
      '.##########.',
      '..########..',
      '...######...',
      '....####....',
      '.....##.....',
      '............',
    ],
  },
  coffee: {
    flat: solid(
      'M3 9h13v5a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6V9zM16 10h1.5a3.5 3.5 0 0 1 0 7h-2.2l.8-2h1.4a1.5 1.5 0 0 0 0-3H16zM2 21.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75z',
    ),
    outline: 'M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM16 10h1a3 3 0 0 1 0 6h-1.4M3 21.5h15',
    pixel: [
      '............',
      '............',
      '............',
      '#########...',
      '##########..',
      '#########.#.',
      '#########.#.',
      '##########..',
      '.#######....',
      '..#####.....',
      '###########.',
      '............',
    ],
    parts: [
      {
        name: 'steam',
        flat: 'M7 3.5a1 1 0 0 1 2 0v3a1 1 0 0 1-2 0z',
        outline: 'M8 3v3',
        pixel: ['...#', '..#.', '...#'],
      },
      {
        name: 'steam',
        flat: 'M11 2.5a1 1 0 0 1 2 0v4a1 1 0 0 1-2 0z',
        outline: 'M12 3v3',
        pixel: ['......#', '.....#.', '......#'],
      },
    ],
  },
  star: {
    flat: soft(STAR),
    outline: STAR,
    pixel: [
      '.....##.....',
      '.....##.....',
      '....####....',
      '############',
      '.##########.',
      '..########..',
      '...######...',
      '...######...',
      '..###..###..',
      '..##....##..',
      '.##......##.',
      '............',
    ],
  },
  gift: {
    flat: solid(
      'M4 13h7v8H5a1 1 0 0 1-1-1zM13 13h7v7a1 1 0 0 1-1 1h-6zM3 8.5A1.5 1.5 0 0 1 4.5 7H11v4.5H3zM13 7h6.5A1.5 1.5 0 0 1 21 8.5v3h-8zM11 6.5C8.6 6.6 6 6 6 4.4 6 2.7 8.6 2.4 11 6.5zM13 6.5c2.4.1 5-.5 5-2.1 0-1.7-2.6-2-5 2.1z',
    ),
    outline:
      'M3 8h18v4H3zM5 12v9h14v-9M12 8v13M12 8c-2.2 0-5-.6-5-2.5S9.6 2.8 12 8zM12 8c2.2 0 5-.6 5-2.5S14.4 2.8 12 8z',
    pixel: [
      '..##....##..',
      '...##..##...',
      '....####....',
      '#####..#####',
      '#####..#####',
      '............',
      '.####..####.',
      '.####..####.',
      '.####..####.',
      '.####..####.',
      '.####..####.',
      '............',
    ],
  },
  sparkle: {
    flat: soft(
      `${SPARK}M18.5 2.5c.3 1.6 1 2.3 2.5 2.5-1.6.3-2.3 1-2.5 2.5-.3-1.6-1-2.3-2.5-2.5 1.6-.3 2.3-1 2.5-2.5zM18 15.5c.3 1.6 1 2.3 2.5 2.5-1.6.3-2.3 1-2.5 2.5-.3-1.6-1-2.3-2.5-2.5 1.6-.3 2.3-1 2.5-2.5z`,
      1,
    ),
    outline: `${SPARK}M18.5 2.5v5M16 5h5M18 16v4M16 18h4`,
    pixel: [
      '.........#..',
      '....#...###.',
      '....#....#..',
      '...###......',
      '..#####.....',
      '#########...',
      '..#####.....',
      '...###...#..',
      '....#...###.',
      '....#....#..',
      '............',
      '............',
    ],
  },
  jar: {
    flat: `${solid('M7 7.5h10a1 1 0 0 1 1 1V10H6V8.5a1 1 0 0 1 1-1z')}<path fill="currentColor" fill-rule="evenodd" d="M6 11h12a2 2 0 0 1 2 2v5.5a3.5 3.5 0 0 1-3.5 3.5h-9A3.5 3.5 0 0 1 4 18.5V13a2 2 0 0 1 2-2zM7.5 14a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0z"/>`,
    outline: 'M7 7h10v3H7zM6 10h12a2 2 0 0 1 2 2v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6a2 2 0 0 1 2-2zM8 14v3',
    pixel: [
      '............',
      '............',
      '............',
      '............',
      '............',
      '..########..',
      '............',
      '.##########.',
      '.#.########.',
      '.#.########.',
      '.##########.',
      '..########..',
    ],
    parts: [
      {
        name: 'coin',
        flat: 'M9.5 3.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0z',
        outline: 'M10.5 3a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0',
        pixel: ['....####....', '...######...', '...######...', '....####....'],
      },
    ],
  },
};
