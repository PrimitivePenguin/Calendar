import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeType = 'classic' | 'future';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    // Check localStorage for saved theme
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('calendar-theme');
      if (saved === 'classic' || saved === 'future') {
        return saved;
      }
    }
    return 'classic';
  });

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme === 'future' ? 'future' : '');
    localStorage.setItem('calendar-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => prev === 'classic' ? 'future' : 'classic');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// This ensures the file is treated as a module
export type { ThemeType, ThemeContextType };