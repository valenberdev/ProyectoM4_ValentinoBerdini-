import { useCallback, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

const THEME_KEY = 'theme';

function getStoredTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY);
  return stored === 'light' ? 'light' : 'dark';
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
