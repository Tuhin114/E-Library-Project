import { useEffect, useRef } from "react";
import { saveProgress } from "../services/readingService";

const DEBOUNCE_MS = 1500;

/**
 * Debounced auto-save of reading progress. Fires ~1.5s after the last
 * location change, not on every page flip, to avoid hammering the API
 * while someone is quickly paging through a book.
 */
const useReadingProgress = (bookId, format, location, percentComplete) => {
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!bookId || !format || location === null || location === undefined) {
      return undefined;
    }

    timeoutRef.current = setTimeout(() => {
      saveProgress(bookId, {
        format,
        location: String(location),
        percentComplete: percentComplete ?? 0,
      }).catch(() => {
        // Silent — losing a single progress save isn't worth surfacing
        // to the reader mid-book.
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeoutRef.current);
  }, [bookId, format, location, percentComplete]);
};

export default useReadingProgress;
