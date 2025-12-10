"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useSyncExternalStore,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themeStore = {
  theme: "light" as Theme,
  listeners: new Set<() => void>(),

  getSnapshot(): Theme {
    return themeStore.theme;
  },

  getServerSnapshot(): Theme {
    return "light";
  },

  subscribe(listener: () => void): () => void {
    themeStore.listeners.add(listener);
    return () => themeStore.listeners.delete(listener);
  },

  setTheme(newTheme: Theme) {
    themeStore.theme = newTheme;
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    document.cookie = `theme=${newTheme}; path=/; max-age=${60 * 60 * 24 * 30}`;
    themeStore.listeners.forEach((listener) => listener());
  },

  initialize() {
    if (typeof window === "undefined") return;

    const savedTheme = document.cookie
      .split("; ")
      .find((row) => row.startsWith("theme="))
      ?.split("=")[1] as Theme | undefined;

    if (savedTheme) {
      themeStore.theme = savedTheme;
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      themeStore.theme = "dark";
    }

    document.documentElement.classList.toggle(
      "dark",
      themeStore.theme === "dark"
    );
  },
};

if (typeof window !== "undefined") {
  themeStore.initialize();
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getServerSnapshot
  );

  const toggleTheme = useCallback(() => {
    themeStore.setTheme(theme === "light" ? "dark" : "light");
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
