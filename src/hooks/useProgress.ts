import { useCallback, useEffect, useState } from 'react';

const PROGRESS_KEY = 'shavian-progress';
const BRANCHES_KEY = 'shavian-branches';

/** Course progress: a single number, the count of spine lessons completed. */
export function useProgress() {
  const [completedCount, setCompletedCount] = useState(() => {
    const stored = Number(localStorage.getItem(PROGRESS_KEY));
    return Number.isFinite(stored) && stored > 0 ? stored : 0;
  });
  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, String(completedCount));
  }, [completedCount]);
  return [completedCount, setCompletedCount] as const;
}

/**
 * Completed optional branch lessons, kept as a set of ids separate from the
 * linear spine progress so a branch never advances the course or gates a lesson.
 */
export function useBranchProgress() {
  const [completed, setCompleted] = useState<Set<number>>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(BRANCHES_KEY) ?? '[]');
      return new Set(Array.isArray(raw) ? raw.filter((n) => typeof n === 'number') : []);
    } catch {
      return new Set();
    }
  });
  useEffect(() => {
    localStorage.setItem(BRANCHES_KEY, JSON.stringify([...completed]));
  }, [completed]);
  const markBranchDone = useCallback((id: number) => {
    setCompleted((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);
  return [completed, markBranchDone] as const;
}
