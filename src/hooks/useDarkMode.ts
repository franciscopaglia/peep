import { useCallback, useEffect, useState } from 'react';

const THEME_KEY = 'shavian-theme';

function systemPrefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

/** Theme, following the system until the learner makes an explicit choice. */
export function useDarkMode() {
  // `null` means "follow the system"; 'dark'/'light' is an explicit choice.
  const [preference, setPreference] = useState<'dark' | 'light' | null>(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'dark' || stored === 'light' ? stored : null;
  });
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  // Track the OS theme so we can follow it while no explicit choice is set.
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const dark = preference === null ? systemDark : preference === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const toggle = useCallback(() => {
    setPreference((prev) => {
      const currentlyDark = prev === null ? systemPrefersDark() : prev === 'dark';
      const next = currentlyDark ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  return [dark, toggle] as const;
}
