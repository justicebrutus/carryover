// A tiny generic undo/redo history over immutable workspace snapshots. Kept pure
// (no React, no storage) so it is unit-testable and reusable; WorkspaceContext
// wires it to state, persistence, and the aria-live announcement.

export interface Snapshot<T> { workspace: T; label: string; }
export interface History<T> { workspace: T; past: Snapshot<T>[]; future: Snapshot<T>[]; }

export const HISTORY_LIMIT = 50;

export function emptyHistory<T>(workspace: T): History<T> {
  return { workspace, past: [], future: [] };
}

/** Record a change. A no-op (same reference) leaves history untouched; any real
 *  change pushes the previous state onto `past` and clears the redo stack. */
export function pushHistory<T>(state: History<T>, next: T, label: string): History<T> {
  if (next === state.workspace) return state;
  return {
    workspace: next,
    past: [...state.past, { workspace: state.workspace, label }].slice(-HISTORY_LIMIT),
    future: [],
  };
}

export function undoHistory<T>(state: History<T>): { state: History<T>; label?: string } {
  if (!state.past.length) return { state };
  const entry = state.past[state.past.length - 1];
  return {
    state: {
      workspace: entry.workspace,
      past: state.past.slice(0, -1),
      future: [...state.future, { workspace: state.workspace, label: entry.label }].slice(-HISTORY_LIMIT),
    },
    label: entry.label,
  };
}

export function redoHistory<T>(state: History<T>): { state: History<T>; label?: string } {
  if (!state.future.length) return { state };
  const entry = state.future[state.future.length - 1];
  return {
    state: {
      workspace: entry.workspace,
      past: [...state.past, { workspace: state.workspace, label: entry.label }].slice(-HISTORY_LIMIT),
      future: state.future.slice(0, -1),
    },
    label: entry.label,
  };
}
