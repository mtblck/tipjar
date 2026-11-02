import { type TipjarOptions, tipjar } from './tipjar.js';

/** Options for {@link mount}: everything {@link tipjar} takes, plus where to put it. */
export interface MountOptions extends TipjarOptions {
  /** The element to append the button to. Defaults to `document.body`. */
  target?: Element;
  /**
   * An element (or a selector for one) that, while on screen, tucks the button away:
   * usually a footer that has its own support link. Leave out to keep the button showing.
   */
  hideWhenVisible?: Element | string;
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

  let observer: IntersectionObserver | undefined;
  const watched = typeof hideWhenVisible === 'string' ? document.querySelector(hideWhenVisible) : hideWhenVisible;
  if (watched && typeof IntersectionObserver === 'function') {
    observer = new IntersectionObserver((entries) => {
      const seen = entries.some((entry) => entry.isIntersecting);
      element.toggleAttribute('data-tucked', seen);
    });
    observer.observe(watched);
  }

  return {
    element,
    destroy: () => {
      observer?.disconnect();
      element.remove();
    },
  };
}
