import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { githubStars } from '../src/github.js';

function store(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, String(value)),
  };
}

function reply(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

describe('githubStars', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn(async () => reply({ stargazers_count: 1204 }));
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('sessionStorage', store());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('asks the GitHub API for the repo and returns its stars', async () => {
    await expect(githubStars('mtblck/tipjar')).resolves.toBe(1204);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.github.com/repos/mtblck/tipjar');
    expect(init.headers).toEqual({ accept: 'application/vnd.github+json' });
  });

  it('takes a github.com URL', async () => {
    for (const repo of [
      'https://github.com/mtblck/tipjar',
      'https://github.com/mtblck/tipjar/',
      'https://www.github.com/mtblck/tipjar.git',
      'https://github.com/mtblck/tipjar/tree/main#readme',
      'https://github.com/mtblck/tipjar?tab=readme',
    ]) {
      await githubStars(repo, { cacheFor: 0 });
    }
    for (const [url] of fetchMock.mock.calls) expect(url).toBe('https://api.github.com/repos/mtblck/tipjar');
  });

  it('throws for something that is not a repo, before asking', async () => {
    for (const repo of ['mtblck', '', '../etc/passwd', 'a/b c', 'https://example.com/a/b']) {
      await expect(githubStars(repo)).rejects.toThrow(TypeError);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows no count below min, and keeps the real count cached', async () => {
    fetchMock.mockImplementation(async () => reply({ stargazers_count: 0 }));
    await expect(githubStars('mtblck/tipjar', { min: 1 })).resolves.toBeUndefined();
    await expect(githubStars('mtblck/tipjar')).resolves.toBe(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fetchMock.mockImplementation(async () => reply({ stargazers_count: 25 }));
    await expect(githubStars('mtblck/tipjar', { min: 25, cacheFor: 0 })).resolves.toBe(25);
    await expect(githubStars('mtblck/tipjar', { min: 26, cacheFor: 0 })).resolves.toBeUndefined();
  });

  it('keeps the count for an hour, then asks again', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    await githubStars('mtblck/tipjar');
    await expect(githubStars('MTBLCK/tipjar')).resolves.toBe(1204);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(3_600_000);
    await githubStars('mtblck/tipjar');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('skips the cache with cacheFor: 0, and without sessionStorage', async () => {
    await githubStars('mtblck/tipjar', { cacheFor: 0 });
    await githubStars('mtblck/tipjar', { cacheFor: 0 });
    vi.stubGlobal('sessionStorage', undefined);
    await githubStars('mtblck/tipjar');
    await githubStars('mtblck/tipjar');
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('ignores a cache it cannot read', async () => {
    sessionStorage.setItem('tipjar:stars:mtblck/tipjar', '{not json');
    await expect(githubStars('mtblck/tipjar')).resolves.toBe(1204);
  });

  it('sends a token when given one', async () => {
    await githubStars('mtblck/tipjar', { token: 'abc' });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toMatchObject({ authorization: 'Bearer abc' });
  });

  it('resolves to undefined, and caches nothing, when GitHub cannot say', async () => {
    fetchMock.mockResolvedValueOnce(reply({ message: 'API rate limit exceeded' }, 403));
    await expect(githubStars('mtblck/tipjar')).resolves.toBeUndefined();
    fetchMock.mockResolvedValueOnce(reply({ message: 'Not Found' }, 404));
    await expect(githubStars('mtblck/gone')).resolves.toBeUndefined();
    fetchMock.mockResolvedValueOnce(reply({ stargazers_count: 'many' }));
    await expect(githubStars('mtblck/tipjar')).resolves.toBeUndefined();
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(githubStars('mtblck/tipjar')).resolves.toBeUndefined();
    expect(sessionStorage.length).toBe(0);
  });
});
