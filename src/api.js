// Thin client for the Laravel backend (../admin). VITE_API_URL is set in .env.development (local) and .env.production (live).
export const API_URL = (import.meta.env.VITE_API_URL || 'http://vihaaraa.local/admin/api').replace(/\/$/, '');

const TOKEN_KEY = 'vihaaraa_token';

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable — the session lasts until reload */
  }
};

export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
  /** First message for a field, for inline form errors. */
  field(name) {
    return this.errors?.[name]?.[0];
  }
}

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

export async function api(path, { method = 'GET', body, signal } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, signal, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new ApiError('Could not reach the store. Please check your connection and try again.', 0);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    throw new ApiError(data.message || 'Something went wrong. Please try again.', res.status, data.errors);
  }
  return data;
}
