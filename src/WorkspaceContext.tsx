import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { LocalWorkspaceRepository, STORAGE_KEY, latestAudit, loadWorkspace, resetWorkspace, saveWorkspace } from "./lib/workspace";
import { emptyHistory, pushHistory, redoHistory, undoHistory, type History } from "./lib/history";
import type { CarryoverWorkspaceV2, Role } from "./domain";

type HistoryState = History<CarryoverWorkspaceV2>;

interface Value {
  workspace: CarryoverWorkspaceV2;
  recovered: boolean;
  migrated: boolean;
  announce: string;
  canUndo: boolean;
  canRedo: boolean;
  undoLabel: string;
  redoLabel: string;
  update: (fn: (current: CarryoverWorkspaceV2) => CarryoverWorkspaceV2) => void;
  undo: () => void;
  redo: () => void;
  setRole: (role: Role) => void;
  reset: () => void;
}
const Context = createContext<Value | null>(null);

const TAB_ID = Math.random().toString(36).slice(2);
const personFor = (role: Role) =>
  role === "Operator" ? "Noah Williams" : role === "Plant manager" ? "Avery Chen" : "Mina Park";

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const repository = useMemo(() => new LocalWorkspaceRepository(), []);
  const loaded = useMemo(() => loadWorkspace(repository), [repository]);
  const [state, setState] = useState<HistoryState>(() => emptyHistory(loaded.workspace));
  const [recovered, setRecovered] = useState(loaded.recovered);
  const [migrated, setMigrated] = useState(loaded.migrated);
  const [announce, setAnnounce] = useState("");

  // A ref mirror lets the undo/redo handlers read current state synchronously
  // without nesting state updaters (which StrictMode would double-invoke).
  const stateRef = useRef(state);
  stateRef.current = state;

  // Cross-tab live sync: another tab's save pings this one, which re-reads the
  // persisted record and adopts it. Local history is dropped because a foreign
  // edit can't be coherently undone from here.
  const channelRef = useRef<BroadcastChannel | null>(null);
  const pendingBroadcast = useRef(false);
  useEffect(() => {
    const adopt = () => {
      const incoming = loadWorkspace(repository).workspace;
      // already in sync — skip to avoid a re-save/echo loop between tabs
      if (JSON.stringify(incoming) === JSON.stringify(stateRef.current.workspace)) return;
      pendingBroadcast.current = false; // adopting must not echo back
      setState(emptyHistory(incoming));
      setAnnounce("This operating record was updated in another tab.");
    };
    // BroadcastChannel is the fast path where supported; the storage event is a
    // universally-reliable fallback (fires in every OTHER tab on a localStorage
    // write). Listening to both keeps sync working across all engines.
    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel("carryover.workspace");
      channelRef.current = channel;
      channel.onmessage = (event: MessageEvent) => { if (event.data?.tabId !== TAB_ID) adopt(); };
    }
    const onStorage = (event: StorageEvent) => { if (event.key === STORAGE_KEY) adopt(); };
    window.addEventListener("storage", onStorage);
    return () => { channel?.close(); channelRef.current = null; window.removeEventListener("storage", onStorage); };
  }, [repository]);

  // Persist every workspace change, then notify other tabs when the change was
  // local (never on mount, and never when adopting a foreign change).
  useEffect(() => {
    saveWorkspace(state.workspace, repository);
    if (pendingBroadcast.current) {
      pendingBroadcast.current = false;
      channelRef.current?.postMessage({ tabId: TAB_ID });
    }
  }, [state.workspace, repository]);

  const update = useCallback((fn: (current: CarryoverWorkspaceV2) => CarryoverWorkspaceV2) => {
    pendingBroadcast.current = true;
    setState((current) => {
      const next = fn(current.workspace);
      return pushHistory(current, next, latestAudit(next)?.event ?? "Record updated");
    });
  }, []);

  const undo = useCallback(() => {
    const { state: next, label } = undoHistory(stateRef.current);
    if (label === undefined) return;
    pendingBroadcast.current = true;
    setState(next);
    setAnnounce(`Undid: ${label}`);
  }, []);

  const redo = useCallback(() => {
    const { state: next, label } = redoHistory(stateRef.current);
    if (label === undefined) return;
    pendingBroadcast.current = true;
    setState(next);
    setAnnounce(`Redid: ${label}`);
  }, []);

  // Role preview is a view lens, not a record mutation — it never enters history.
  const setRole = useCallback((role: Role) => {
    pendingBroadcast.current = true;
    setState((current) => ({ ...current, workspace: { ...current.workspace, role, activePerson: personFor(role) } }));
  }, []);

  const reset = useCallback(() => {
    pendingBroadcast.current = true;
    setState(emptyHistory(resetWorkspace(repository)));
    setRecovered(false);
    setMigrated(false);
    setAnnounce("Demonstration workspace reset to the original record.");
  }, [repository]);

  const value: Value = {
    workspace: state.workspace,
    recovered,
    migrated,
    announce,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    undoLabel: state.past[state.past.length - 1]?.label ?? "",
    redoLabel: state.future[state.future.length - 1]?.label ?? "",
    update,
    undo,
    redo,
    setRole,
    reset,
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useWorkspace() {
  const value = useContext(Context);
  if (!value) throw new Error("WorkspaceProvider missing");
  return value;
}
