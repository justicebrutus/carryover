import { describe, expect, it } from "vitest";
import { emptyHistory, pushHistory, redoHistory, undoHistory } from "./history";
import { latestAudit } from "./workspace";
import type { CarryoverWorkspaceV2 } from "../domain";

describe("history reducer", () => {
  it("pushes changes onto the past and clears redo", () => {
    let history = emptyHistory("a");
    history = pushHistory(history, "b", "to b");
    history = pushHistory(history, "c", "to c");
    expect(history.workspace).toBe("c");
    expect(history.past.map((snapshot) => snapshot.workspace)).toEqual(["a", "b"]);
    expect(history.future).toEqual([]);
  });

  it("ignores a no-op change (same reference)", () => {
    const history = pushHistory(emptyHistory("a"), "b", "x");
    expect(pushHistory(history, history.workspace, "noop")).toBe(history);
  });

  it("undo and redo move between stacks and report the change label", () => {
    const history = pushHistory(pushHistory(emptyHistory("a"), "b", "to b"), "c", "to c");
    const first = undoHistory(history);
    expect(first.label).toBe("to c");
    expect(first.state.workspace).toBe("b");
    const second = undoHistory(first.state);
    expect(second.label).toBe("to b");
    expect(second.state.workspace).toBe("a");
    expect(undoHistory(second.state).label).toBeUndefined();
    const redone = redoHistory(second.state);
    expect(redone.label).toBe("to b");
    expect(redone.state.workspace).toBe("b");
  });

  it("a fresh change after undo discards the redo future", () => {
    const history = pushHistory(pushHistory(emptyHistory("a"), "b", "to b"), "c", "to c");
    const undone = undoHistory(history).state;
    const forked = pushHistory(undone, "d", "to d");
    expect(forked.workspace).toBe("d");
    expect(forked.future).toEqual([]);
  });
});

describe("latestAudit", () => {
  it("returns the highest-sequence audit event across issues, handoffs, and actions", () => {
    const workspace = {
      issues: [{ audit: [{ id: "AU-3", event: "Observation recorded" }] }],
      handoffs: [{ audit: [{ id: "AU-7", event: "Handoff prepared" }] }],
      actions: [{ audit: [{ id: "AU-5", event: "Action assigned" }] }],
    } as unknown as CarryoverWorkspaceV2;
    expect(latestAudit(workspace)?.event).toBe("Handoff prepared");
  });
});
