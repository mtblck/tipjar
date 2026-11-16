/** Options for {@link githubStars}. */
export interface GithubStarsOptions {
  /**
   * Seconds to keep the count in `sessionStorage`, so a visitor browsing several pages asks
   * GitHub once. Defaults to 3600; 0 to always ask. Ignored where there is no `sessionStorage`.
   */
  cacheFor?: number;
  /**
   * A GitHub token, for builds and servers that share an address with other API users. Never
   * pass one in the browser, where anyone can read it.
   */
  token?: string;
  /** Cancels the request. */
  signal?: AbortSignal;
}

const REPO = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9._-]{1,100}$/;

function repoPath(repo: string): string {
  const bare = String(repo ?? '')
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
    .replace(/[?#].*$/, '');
  const [owner = '', name = ''] = bare.split('/');
  const path = `${owner}/${name.replace(/\.git$/, '')}`;
  if (!REPO.test(path)) throw new TypeError(`tipjar: "${repo}" isn't a GitHub repo; use "owner/name"`);
  return path;
}

function storage(): Storage | undefined {
  try {
    return globalThis.sessionStorage ?? undefined;
  } catch {
    // Storage can throw when the site's data is blocked.
    return undefined;
  }
}

function cached(key: string, maxAge: number): number | undefined {
  try {
    const saved = JSON.parse(storage()?.getItem(key) ?? 'null') as { stars?: unknown; at?: unknown } | null;
    if (typeof saved?.stars !== 'number' || typeof saved.at !== 'number') return undefined;
    return Date.now() - saved.at < maxAge * 1000 ? saved.stars : undefined;
  } catch {
    return undefined;
  }
}

function remember(key: string, stars: number): void {
  try {
    storage()?.setItem(key, JSON.stringify({ stars, at: Date.now() }));
  } catch {
    // A full or blocked store only means asking GitHub again next time.
  }
}

/**
 * Asks GitHub how many stars a repo has, for the button's `count`. It never throws for a network
 * error, a rate limit or a missing repo: it resolves to `undefined`, and the button shows no count.
 * Call it at build time or on the server where you can, so visitors don't each ask GitHub, which
 * allows 60 requests an hour per address without a token. In the browser it needs
 * `connect-src https://api.github.com` under a CSP.
 * @param repo - `"owner/name"`, or the repo's github.com URL.
 * @param options - How long to cache the count, a token, and a signal.
 * @returns The number of stars, or `undefined` if GitHub couldn't say.
 */
export async function githubStars(repo: string, options: GithubStarsOptions = {}): Promise<number | undefined> {
  const path = repoPath(repo);
  const key = `tipjar:stars:${path.toLowerCase()}`;
  const maxAge = options.cacheFor ?? 3600;
  const hit = maxAge > 0 ? cached(key, maxAge) : undefined;
  if (hit !== undefined) return hit;
  try {
    const headers: Record<string, string> = { accept: 'application/vnd.github+json' };
    if (options.token) headers.authorization = `Bearer ${options.token}`;
    const response = await fetch(`https://api.github.com/repos/${path}`, { headers, signal: options.signal ?? null });
    if (!response.ok) return undefined;
    const stars = ((await response.json()) as { stargazers_count?: unknown }).stargazers_count;
    if (typeof stars !== 'number') return undefined;
    if (maxAge > 0) remember(key, stars);
    return stars;
  } catch {
    return undefined;
  }
}
