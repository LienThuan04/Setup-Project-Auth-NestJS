// components/theme-initializer.tsx
'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/redux/hooks';

export function ThemeInitializer({ children }: { children: React.ReactNode }) {
  const theme = useAppSelector(state => state.theme.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return <>{children}</>;
}