import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "uok-color-mode";
const ColorModeContext = createContext(null);

function readStoredMode() {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

function systemPrefersDark() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Light/dark mode provider built on top of Chakra v3's `_light` / `_dark`
 * conditions, which are driven by a `dark` class on the root element.
 */
export function ColorModeProvider({ children }) {
  const [mode, setModeState] = useState(readStoredMode);

  const resolvedMode = useMemo(() => {
    if (mode === "system") return systemPrefersDark() ? "dark" : "light";
    return mode;
  }, [mode]);

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const dark = mode === "system" ? systemPrefersDark() : mode === "dark";
      root.classList.toggle("dark", dark);
      root.classList.toggle("light", !dark);
      root.style.colorScheme = dark ? "dark" : "light";
      root.dataset.uokTheme = dark ? "dark" : "light";
    };

    apply();

    if (mode !== "system") return undefined;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [mode]);

  const setMode = useCallback((next) => {
    setModeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleColorMode = useCallback(() => {
    setMode(resolvedMode === "dark" ? "light" : "dark");
  }, [resolvedMode, setMode]);

  const value = useMemo(
    () => ({ mode, resolvedMode, setMode, toggleColorMode }),
    [mode, resolvedMode, setMode, toggleColorMode],
  );

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
}

export function useColorMode() {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error("useColorMode must be used inside <ColorModeProvider>");
  }
  return context;
}
