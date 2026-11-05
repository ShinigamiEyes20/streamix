import { useCallback, useEffect, useRef, useState } from "react";

const VERSION = 1;
const EVENT_NAME = "streamix-storage-change";
const EMPTY_ARRAY = Object.freeze([]);

function readValue(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    if (parsed?.version === VERSION && Array.isArray(parsed.value)) return parsed.value;
  } catch {
    // Use defaults when storage is disabled or has invalid data.
  }
  return fallback;
}

export function useLocalStorage(key, fallback = EMPTY_ARRAY) {
  const defaultValue = useRef(fallback).current;
  const [value, setValue] = useState(() => readValue(key, defaultValue));

  useEffect(() => {
    const sync = (event) => {
      if (!event.detail || event.detail.key === key) setValue(readValue(key, defaultValue));
    };
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, [defaultValue, key]);

  const updateValue = useCallback((next) => {
    const previous = readValue(key, defaultValue);
    const resolved = typeof next === "function" ? next(previous) : next;
    try {
      localStorage.setItem(key, JSON.stringify({ version: VERSION, value: resolved }));
    } catch {
      // Keep the current-session state if persistent storage is unavailable.
    }
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { key } }));
    setValue(resolved);
  }, [defaultValue, key]);

  return [value, updateValue];
}
