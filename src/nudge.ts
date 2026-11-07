const SEEN = 'tipjar-nudged';

function nudgedThisVisit(): boolean {
  try {
    return sessionStorage.getItem(SEEN) !== null;
  } catch {
    return false;
  }
}

function remember(): void {
  try {
    sessionStorage.setItem(SEEN, '1');
  } catch {
    // Storage can be blocked; then the nudge may come again on the next page.
  }
}

/**
 * Wiggles a button once, after a while, to catch the eye: the button tilts and its icon's moving
 * part plays. At most once per visit (per tab session), never while the button is tucked away or
 * the tab is hidden, never once someone has hovered or focused the button, and never for people
 * who ask for less motion. Works on a button from {@link mount} or one already on the page.
 * @param button - The button to nudge: it gets `data-nudge`, which plays the wiggle once.
 * @param seconds - How long to wait first. Defaults to 20.
 * @returns A function that cancels the nudge if it hasn't happened yet.
 */
export function nudge(button: Element, seconds = 20): () => void {
  if (nudgedThisVisit() || matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  let timer: ReturnType<typeof setTimeout> | undefined;

  const stop = (): void => {
    clearTimeout(timer);
    document.removeEventListener('visibilitychange', fire);
    button.removeEventListener('pointerenter', stop);
    button.removeEventListener('focus', stop);
  };
  function fire(): void {
    // Wait for the tab to come back, rather than wiggling where nobody can see it.
    if (document.hidden) return document.addEventListener('visibilitychange', fire);
    stop();
    if (button.hasAttribute('data-tucked')) return;
    remember();
    button.setAttribute('data-nudge', '');
  }

  button.addEventListener('pointerenter', stop);
  button.addEventListener('focus', stop);
  timer = setTimeout(fire, seconds * 1000);
  return stop;
}
