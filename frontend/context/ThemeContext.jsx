import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

function getPreferredTheme() {
  if (typeof window === 'undefined') return 'dark';

  const persisted = window.localStorage.getItem('udev-theme');
  if (persisted === 'dark' || persisted === 'light') {
    return persisted;
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    setTheme(getPreferredTheme());
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('udev-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  const value = useMemo(
    () => ({
      theme,
      isDarkTheme: theme === 'dark',
      toggleTheme
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme precisa ser usado dentro de ThemeProvider');
  }
  return context;
}
