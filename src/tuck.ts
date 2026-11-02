/** What a button can be tucked under: an element, a selector, or a list of elements. */
export type TuckTarget = Element | string | Iterable<Element> | ArrayLike<Element>;

function resolve(watch: TuckTarget | null | undefined): Element[] {
  if (watch == null) return [];
  if (typeof watch === 'string') return Array.from(document.querySelectorAll(watch));
  if (watch instanceof Element) return [watch];
  return Array.from(watch as Iterable<Element>).filter((item) => item instanceof Element);
}

/**
 * Tucks a button away while any of the watched elements is on screen, usually a footer that has
 * its own support link. Works on a button from {@link mount} or one already on the page, such as
 * markup from {@link tipjar} rendered on the server. A selector is looked up once, now; if nothing
 * matches, it warns in the console and the button keeps showing.
 * @param button - The button to tuck: it gets `data-tucked` while hidden.
 * @param watch - An element, a selector (every match is watched) or a list of elements. `null`, as
 *   from a `querySelector` that found nothing, warns like a selector that matches nothing.
 * @returns A function that stops watching and shows the button again.
 */
export function tuck(button: Element, watch: TuckTarget | null | undefined): () => void {
  const watched = resolve(watch);
  if (!watched.length) {
    const what = typeof watch === 'string' ? `"${watch}"` : 'the given elements';
    console.warn(`tipjar: nothing to tuck under; ${what} matched no element`);
    return () => {};
  }
  if (typeof IntersectionObserver !== 'function') return () => {};

  // The observer reports only the elements that changed, so remember which are on screen.
  const onScreen = new Set<Element>();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) onScreen.add(entry.target);
      else onScreen.delete(entry.target);
    }
    button.toggleAttribute('data-tucked', onScreen.size > 0);
  });
  for (const element of watched) observer.observe(element);

  return () => {
    observer.disconnect();
    button.removeAttribute('data-tucked');
  };
}
