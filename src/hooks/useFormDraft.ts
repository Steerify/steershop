import { useEffect, useRef, useCallback } from "react";

/**
 * Persists a form's state to sessionStorage so it survives accidental
 * navigation or page refreshes.  Works only while the user is on the page;
 * the draft is removed on explicit save or on intentional sign-out.
 *
 * @param key      - unique storage key (e.g. `"draft_add_product_${userId}"`)
 * @param value    - the current form state object to persist
 * @param enabled  - set false to disable (e.g. when editing an existing record)
 * @returns        - `{ clearDraft }` so callers can wipe the draft after a successful save
 */
export function useFormDraft<T extends object>(
  key: string,
  value: T,
  enabled = true
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save with 1.5 s debounce so we're not hammering sessionStorage
  useEffect(() => {
    if (!enabled || !key) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch {
        // sessionStorage unavailable (private mode quota, etc.) — silently ignore
      }
    }, 1500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [key, value, enabled]);

  const clearDraft = useCallback(() => {
    if (key) sessionStorage.removeItem(key);
  }, [key]);

  return { clearDraft };
}

/**
 * Reads a previously saved draft from sessionStorage.
 * Returns `null` if nothing is stored or parsing fails.
 */
export function readFormDraft<T>(key: string): T | null {
  if (!key) return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
