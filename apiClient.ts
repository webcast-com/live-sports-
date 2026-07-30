// Shared API client with CORS proxy fallback + full response capture
// RapidAPI endpoints block browser CORS, so we route through public proxies.

export interface FetchOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

export interface FetchResult<T> {
  data: T | null;
  rawText?: string;
  error: string | null;
  proxy?: string;
  status?: number;
  url?: string;
  headersSent?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  durationMs?: number;
  attempts?: { proxy: string; status?: number; error?: string }[];
}

function buildProxiedUrls(targetUrl: string) {
  const enc = encodeURIComponent(targetUrl);
  // Order: most likely to forward RapidAPI headers first
  return [
    { url: `https://corsproxy.io/?${enc}`, forwardHeaders: true, name: 'corsproxy.io' },
    { url: `https://api.codetabs.com/v1/proxy/?quest=${enc}`, forwardHeaders: true, name: 'codetabs' },
    { url: `https://thingproxy.freeboard.io/fetch/${targetUrl}`, forwardHeaders: true, name: 'thingproxy' },
    // These strip custom headers – will fail RapidAPI auth, but still useful for debugging
    { url: `https://api.allorigins.win/raw?url=${enc}`, forwardHeaders: false, name: 'allorigins-raw' },
    { url: `https://api.allorigins.win/get?url=${enc}`, forwardHeaders: false, name: 'allorigins-get' },
  ];
}

export async function corsFetch<T = any>(
  targetUrl: string,
  options: FetchOptions = {}
): Promise<FetchResult<T>> {
  const { headers = {}, timeout = 15000 } = options;
  const startAll = Date.now();
  const attempts: { proxy: string; status?: number; error?: string }[] = [];

  // 1) Try direct fetch first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
      signal: controller.signal,
      mode: 'cors',
    });
    clearTimeout(timeoutId);
    const text = await response.text();
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((v, k) => { responseHeaders[k] = v; });

    try {
      const data = JSON.parse(text);
      return {
        data,
        rawText: text,
        error: null,
        proxy: 'direct',
        status: response.status,
        url: targetUrl,
        headersSent: headers,
        responseHeaders,
        durationMs: Date.now() - startAll,
      };
    } catch {
      // Non-JSON but still return raw
      return {
        data: null,
        rawText: text,
        error: `Direct fetch returned non-JSON (HTTP ${response.status})`,
        proxy: 'direct',
        status: response.status,
        url: targetUrl,
        headersSent: headers,
        responseHeaders,
        durationMs: Date.now() - startAll,
      };
    }
  } catch (e: any) {
    attempts.push({ proxy: 'direct', error: e?.name === 'AbortError' ? 'timeout' : 'CORS / network blocked' });
  }

  // 2) Try proxied versions
  const proxies = buildProxiedUrls(targetUrl);

  for (const p of proxies) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const fetchHeaders: Record<string, string> = p.forwardHeaders ? { ...headers } : { Accept: 'application/json, text/plain, */*' };

      const response = await fetch(p.url, {
        method: 'GET',
        headers: fetchHeaders,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const text = await response.text();
      const responseHeaders: Record<string, string> = {};
      try { response.headers.forEach((v, k) => { responseHeaders[k] = v; }); } catch {}

      if (!response.ok) {
        attempts.push({ proxy: p.name, status: response.status, error: text.slice(0, 140) });
        continue;
      }
      if (!text) {
        attempts.push({ proxy: p.name, error: 'empty body' });
        continue;
      }

      // allorigins/get wraps in { contents: "..." }
      let jsonText = text;
      if (p.name.includes('allorigins-get')) {
        try {
          const wrapper = JSON.parse(text);
          if (wrapper.contents) jsonText = wrapper.contents;
        } catch { /* keep original */ }
      }

      try {
        const data = JSON.parse(jsonText);
        return {
          data,
          rawText: jsonText,
          error: null,
          proxy: p.name,
          status: response.status,
          url: p.url,
          headersSent: fetchHeaders,
          responseHeaders,
          durationMs: Date.now() - startAll,
          attempts,
        };
      } catch {
        // Return raw text so UI can show what the API actually returned (often HTML error from RapidAPI)
        return {
          data: null,
          rawText: jsonText,
          error: `${p.name} returned non-JSON`,
          proxy: p.name,
          status: response.status,
          url: p.url,
          headersSent: fetchHeaders,
          responseHeaders,
          durationMs: Date.now() - startAll,
          attempts: [...attempts, { proxy: p.name, status: response.status, error: 'non-JSON response' }],
        };
      }
    } catch (e: any) {
      attempts.push({ proxy: p.name, error: e?.name === 'AbortError' ? 'timeout' : (e?.message || 'error') });
      continue;
    }
  }

  return {
    data: null,
    error: 'All proxies failed – RapidAPI requires server-side calls for CORS. Showing sample data.',
    proxy: 'none',
    durationMs: Date.now() - startAll,
    attempts,
  };
}
