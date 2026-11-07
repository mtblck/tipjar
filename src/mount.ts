import { type TipjarOptions, tipjar } from './tipjar.js';
import { nudge } from './nudge.js';
import { type TuckTarget, tuck } from './tuck.js';

/** Options for {@link mount}: everything {@link tipjar} takes, plus where to put it. */
export interface MountOptions extends TipjarOptions {
  /** The element to append the button to. Defaults to `document.body`. */
  target?: Element;
  /**
   * Elements that, while any is on screen, tuck the button away: usually a footer that has its
   * own support link. An element, a selector (every match is watched) or a list of elements.
   * Leave out to keep the button showing. See {@link tuck}.
   */
  hideWhenVisible?: TuckTarget;
  /**
   * Seconds to wait before one small wiggle to catch the eye, at most once per visit. Leave out
   * for none. See {@link nudge}.
   */
  nudgeAfter?: number;
}

/** What {@link mount} returns. */
export interface Mounted {
  /** The button. */
  element: HTMLAnchorElement;
  /** Removes the button and stops watching. */
  destroy: () => void;
}

/**
 * Adds the tip button to the page. Needs a browser; on the server, use {@link tipjar}.
 * @param options - The button's options, its target and what to tuck it under.
 * @returns The button and a way to remove it.
 */
export function mount(options: MountOptions): Mounted {
  const { target, hideWhenVisible, nudgeAfter, ...rest } = options;
  const host = target ?? document.body;
  const holder = document.createElement('template');
  holder.innerHTML = tipjar(rest);
  const element = holder.content.firstElementChild as HTMLAnchorElement;
  host.append(element);
  const untuck = hideWhenVisible === undefined ? undefined : tuck(element, hideWhenVisible);
  const unnudge = nudgeAfter === undefined ? undefined : nudge(element, nudgeAfter);

  return {
    element,
    destroy: () => {
      untuck?.();
      unnudge?.();
      element.remove();
    },
  };
}
