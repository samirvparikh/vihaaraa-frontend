import { useEffect, useState } from 'react';
import { api } from '../api';

// Responses for public GETs are kept for the session so going back to a page is instant.
const cache = new Map();

/** Fetches `path` (skips when null). Returns { data, error, loading }. */
export default function useApi(path, { cacheable = true } = {}) {
  const cached = path && cacheable ? cache.get(path) : undefined;
  const [state, setState] = useState({ data: cached, error: null, loading: !cached && !!path });

  useEffect(() => {
    if (!path) return undefined;
    const hit = cacheable ? cache.get(path) : undefined;
    setState({ data: hit, error: null, loading: !hit });
    const ctrl = new AbortController();
    api(path, { signal: ctrl.signal })
      .then((data) => {
        if (cacheable) cache.set(path, data);
        setState({ data, error: null, loading: false });
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ data: hit, error, loading: false });
      });
    return () => ctrl.abort();
  }, [path, cacheable]);

  return state;
}
