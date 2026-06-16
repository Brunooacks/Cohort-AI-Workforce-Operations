import { createContext, useContext, useState, type ReactNode } from "react";

export type Perspective = "gestor" | "platform";

interface AppShellState {
  search: string;
  setSearch: (v: string) => void;
  perspective: Perspective;
  setPerspective: (p: Perspective) => void;
}

const AppShellContext = createContext<AppShellState | null>(null);

export function AppShellProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState("");
  const [perspective, setPerspectiveState] = useState<Perspective>(() => {
    if (typeof window === "undefined") return "gestor";
    const stored = window.localStorage.getItem("cohort:perspective");
    return stored === "platform" ? "platform" : "gestor";
  });

  const setPerspective = (p: Perspective) => {
    setPerspectiveState(p);
    try {
      window.localStorage.setItem("cohort:perspective", p);
    } catch {
      /* ignore storage errors */
    }
  };

  return (
    <AppShellContext.Provider value={{ search, setSearch, perspective, setPerspective }}>
      {children}
    </AppShellContext.Provider>
  );
}

export function useAppShell() {
  const ctx = useContext(AppShellContext);
  if (!ctx) {
    throw new Error("useAppShell must be used within AppShellProvider");
  }
  return ctx;
}
