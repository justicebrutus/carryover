import { createContext, useContext, useMemo, useState } from "react";
import { LocalWorkspaceRepository, loadWorkspace, resetWorkspace, saveWorkspace } from "./lib/workspace";
import type { CarryoverWorkspaceV2, Role } from "./domain";

interface Value {
  workspace: CarryoverWorkspaceV2;
  recovered: boolean;
  migrated: boolean;
  update: (fn: (current: CarryoverWorkspaceV2) => CarryoverWorkspaceV2) => void;
  setRole: (role: Role) => void;
  reset: () => void;
}
const Context = createContext<Value | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const repository = useMemo(() => new LocalWorkspaceRepository(), []);
  const loaded = useMemo(() => loadWorkspace(repository), [repository]);
  const [workspace, setWorkspace] = useState(loaded.workspace);
  const [recovered, setRecovered] = useState(loaded.recovered);
  const [migrated, setMigrated] = useState(loaded.migrated);
  const value: Value = {
    workspace, recovered, migrated,
    update: (fn) => setWorkspace((current) => { const next = fn(current); saveWorkspace(next, repository); return next; }),
    setRole: (role) => setWorkspace((current) => { const next = { ...current, role, activePerson: role === "Operator" ? "Noah Williams" : role === "Plant manager" ? "Avery Chen" : "Mina Park" }; saveWorkspace(next, repository); return next; }),
    reset: () => { setWorkspace(resetWorkspace(repository)); setRecovered(false); setMigrated(false); },
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useWorkspace() {
  const value = useContext(Context);
  if (!value) throw new Error("WorkspaceProvider missing");
  return value;
}
