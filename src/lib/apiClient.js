const API_BASE = "/api";
const CACHE_TTL_MS = 3 * 60 * 1000;
const SESSION_PREFIX = "streamix:tmdb:v1:";
const MAX_MEMORY_ENTRIES = 200;
const memoryCache = new Map();
const inFlightRequests = new Map();

function createAbortError() {
  if (typeof DOMException !== "undefined") return new DOMException("The request was aborted.", "AbortError");
  const error = new Error("The request was aborted.");
  error.name = "AbortError";
  return error;
}

function waitForCaller(promise, signal) {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(createAbortError());
  return new Promise((resolve, reject) => {
    const cleanup = () => signal.removeEventListener("abort", onAbort);
    const onAbort = () => {
      cleanup();
      reject(createAbortError());
    };
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => { cleanup(); resolve(value); },
      (error) => { cleanup(); reject(error); },
    );
  });
}

function setMemoryCache(key, entry) {
  memoryCache.delete(key);
  memoryCache.set(key, entry);
  while (memoryCache.size > MAX_MEMORY_ENTRIES) {
    memoryCache.delete(memoryCache.keys().next().value);
  }
}

function readSessionCache(key) {
  try {
    const cached = JSON.parse(sessionStorage.getItem(`${SESSION_PREFIX}${key}`));
    if (cached?.expiresAt > Date.now()) return cached;
    sessionStorage.removeItem(`${SESSION_PREFIX}${key}`);
  } catch {
    // Storage may be disabled or contain malformed data.
  }
  return undefined;
}

function pruneExpiredSessionEntries() {
  const now = Date.now();
  try {
    Object.keys(sessionStorage).filter((key) => key.startsWith(SESSION_PREFIX)).forEach((key) => {
      try {
        const entry = JSON.parse(sessionStorage.getItem(key));
        if (!entry || entry.expiresAt <= now) sessionStorage.removeItem(key);
      } catch {
        sessionStorage.removeItem(key);
      }
    });
  } catch {
    // Storage may be disabled.
  }
}

function writeCache(key, data) {
  const entry = { expiresAt: Date.now() + CACHE_TTL_MS, data };
  setMemoryCache(key, entry);
  try {
    sessionStorage.setItem(`${SESSION_PREFIX}${key}`, JSON.stringify(entry));
  } catch {
    pruneExpiredSessionEntries();
    try {
      sessionStorage.setItem(`${SESSION_PREFIX}${key}`, JSON.stringify(entry));
    } catch {
      // In-memory cache remains available if storage is full or unavailable.
    }
  }
}

function isJsonResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  return /(?:application\/json|\+json)(?:\s*;|$)/i.test(contentType);
}

async function requestJson(url, cacheKey, cache) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!isJsonResponse(response)) {
    throw new Error(`Expected a JSON response from ${url.pathname} (HTTP ${response.status}). The local TMDb proxy may not be configured.`);
  }
  if (!response.ok) {
    const error = new Error(`TMDb request failed (${response.status}).`);
    error.status = response.status;
    if (response.status === 429) error.retryAfter = response.headers.get("Retry-After");
    throw error;
  }
  const data = await response.json();
  if (cache) writeCache(cacheKey, data);
  return data;
}

export async function tmdbRequest(path, params = {}, { signal, cache = true } = {}) {
  if (signal?.aborted) throw createAbortError();
  const cleanPath = String(path).replace(/^\/+/, "");
  if (!/^[a-z0-9_/-]+$/i.test(cleanPath)) throw new Error("Invalid TMDb endpoint.");

  const url = new URL(`${API_BASE}/${cleanPath}`, window.location.origin);
  Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .forEach(([key, value]) => url.searchParams.set(key, String(value)));

  const cacheKey = `${url.pathname}${url.search}`;
  if (cache) {
    const inMemory = memoryCache.get(cacheKey);
    if (inMemory?.expiresAt > Date.now()) {
      setMemoryCache(cacheKey, inMemory);
      return inMemory.data;
    }
    const stored = readSessionCache(cacheKey);
    if (stored) {
      // Keep its original expiry instead of extending its lifetime on promotion.
      setMemoryCache(cacheKey, stored);
      return stored.data;
    }
  }

  let request = inFlightRequests.get(cacheKey);
  if (!request) {
    request = requestJson(url, cacheKey, cache);
    inFlightRequests.set(cacheKey, request);
    request.finally(() => {
      if (inFlightRequests.get(cacheKey) === request) inFlightRequests.delete(cacheKey);
    }).catch(() => {
      // The original request promise is observed by every caller; avoid an unhandled finally-chain rejection.
    });
  }
  return waitForCaller(request, signal);
}

export function clearTMDBCache() {
  memoryCache.clear();
  try {
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith(SESSION_PREFIX))
      .forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // Ignore unavailable storage.
  }
}
