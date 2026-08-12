import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Thin wrapper around React Router's useSearchParams that works with a
 * plain object instead of URLSearchParams directly, and drops any key
 * whose value is empty/undefined/null so the URL stays clean (no
 * "?category=&sort=" clutter). This makes the current search/filter/sort/
 * page state shareable and bookmarkable — refreshing or sending someone
 * the URL reproduces the exact same book list.
 */
export const useQueryParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(
    () => Object.fromEntries(searchParams.entries()),
    [searchParams],
  );

  const setParams = useCallback(
    (updates) => {
      const next = { ...params, ...updates };

      Object.keys(next).forEach((key) => {
        if (next[key] === undefined || next[key] === null || next[key] === "") {
          delete next[key];
        }
      });

      setSearchParams(next);
    },
    [params, setSearchParams],
  );

  return [params, setParams];
};
