import { type TipjarOptions, tipjar } from './tipjar.js';
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
  const { target, hideWhenVisible, ...rest } = options;
  const host = target ?? document.body;
  const holder = document.createElement('template');
  holder.innerHTML = tipjar(rest);
  const element = holder.content.firstElementChild as HTMLAnchorElement;
  host.append(element);
  const untuck = hideWhenVisible === undefined ? undefined : tuck(element, hideWhenVisible);

  return {
    element,
    destroy: () => {
      untuck?.();
      element.remove();
    },
  };
}
