import { SEED_WORKSPACE } from "../data/seed";
import type { ActionRecord, AuditEntry, CarryoverWorkspaceV2, Handoff, Issue, IssueStatus, Permission, Role } from "../domain";

export const STORAGE_KEY = "carryover.workspace.v2";
export const LEGACY_STORAGE_KEY = "carryover.workspace.v1";
export const DEMO_NOW = "2026-08-13T07:30";

const cloneSeed = () => structuredClone(SEED_WORKSPACE);
const roles: Role[] = ["Operator", "Shift supervisor", "Plant manager"];
const permissions: Record<Role, Permission[]> = {
  Operator: ["observe", "submit-evidence"],
  "Shift supervisor": ["observe", "prepare", "acknowledge", "assign", "submit-evidence", "resolve"],
  "Plant manager": ["observe", "prepare", "acknowledge", "assign", "submit-evidence", "resolve", "approve"],
};

export interface WorkspaceRepository {
  load(): unknown;
  save(workspace: CarryoverWorkspaceV2): void;
  reset(): void;
  loadLegacy?(): unknown;
}

export class LocalWorkspaceRepository implements WorkspaceRepository {
  constructor(private storage: Pick<Storage, "getItem" | "setItem" | "removeItem"> = localStorage) {}
  load() { const value = this.storage.getItem(STORAGE_KEY); return value ? JSON.parse(value) : null; }
  loadLegacy() { const value = this.storage.getItem(LEGACY_STORAGE_KEY); return value ? JSON.parse(value) : null; }
  save(workspace: CarryoverWorkspaceV2) { this.storage.setItem(STORAGE_KEY, JSON.stringify(workspace)); }
  reset() { this.storage.removeItem(STORAGE_KEY); this.storage.removeItem(LEGACY_STORAGE_KEY); }
}

export function isWorkspace(value: unknown): value is CarryoverWorkspaceV2 {
  const item = value as Partial<CarryoverWorkspaceV2> | null;
  return Boolean(item && item.version === 2 && item.recordDate === "2026-08-13" && item.plant === "Northshore Beverage Packaging" && roles.includes(item.role as Role) && typeof item.activePerson === "string" && Number.isInteger(item.nextSequence) && Array.isArray(item.issues) && Array.isArray(item.handoffs) && Array.isArray(item.actions));
}

export function migrateV1(value: unknown): CarryoverWorkspaceV2 | null {
  const item = value as { version?: unknown; issues?: unknown; handoffs?: unknown; actions?: unknown } | null;
  if (!item || item.version !== 1 || !Array.isArray(item.issues) || !Array.isArray(item.handoffs) || !Array.isArray(item.actions)) return null;
  return cloneSeed();
}

export function loadWorkspace(repository: WorkspaceRepository = new LocalWorkspaceRepository()) {
  try {
    const current = repository.load();
    if (current !== null) {
      if (!isWorkspace(current)) throw new Error("invalid workspace");
      return { workspace: current, recovered: false, migrated: false };
    }
    const legacy = repository.loadLegacy?.();
    if (legacy !== null && legacy !== undefined) {
      const migrated = migrateV1(legacy);
      if (!migrated) throw new Error("invalid legacy workspace");
      repository.save(migrated);
      return { workspace: migrated, recovered: false, migrated: true };
    }
    return { workspace: cloneSeed(), recovered: false, migrated: false };
  } catch {
    repository.reset();
    return { workspace: cloneSeed(), recovered: true, migrated: false };
  }
}

export function saveWorkspace(workspace: CarryoverWorkspaceV2, repository: WorkspaceRepository = new LocalWorkspaceRepository()) { repository.save(workspace); }
export function resetWorkspace(repository: WorkspaceRepository = new LocalWorkspaceRepository()) { repository.reset(); return cloneSeed(); }
export const can = (role: Role, permission: Permission) => permissions[role].includes(permission);
export const unresolved = (issues: Issue[]) => issues.filter((issue) => issue.status !== "Resolved");
export const overdue = (issues: Issue[], now = DEMO_NOW) => unresolved(issues).filter((issue) => issue.due < now);
export const unacknowledged = (handoffs: Handoff[]) => handoffs.filter((handoff) => handoff.status === "Prepared");

/** The most recent audit event across the whole workspace, by sequence id. Used
 *  to label the undo/redo affordance (e.g. "Undo: Handoff prepared"). */
export function latestAudit(workspace: CarryoverWorkspaceV2): AuditEntry | undefined {
  let newest: AuditEntry | undefined;
  let newestSeq = -1;
  const scan = (entries: AuditEntry[]) => {
    for (const entry of entries) {
      const seq = Number(entry.id.split("-")[1]);
      if (Number.isFinite(seq) && seq > newestSeq) { newestSeq = seq; newest = entry; }
    }
  };
  workspace.issues.forEach((issue) => scan(issue.audit));
  workspace.handoffs.forEach((handoff) => scan(handoff.audit));
  workspace.actions.forEach((action) => scan(action.audit));
  return newest;
}

function nextId(workspace: CarryoverWorkspaceV2, prefix: "CO" | "HO" | "AC" | "AU") { return `${prefix}-${workspace.nextSequence}`; }
function advance(workspace: CarryoverWorkspaceV2) { return { ...workspace, nextSequence: workspace.nextSequence + 1 }; }
function audit(workspace: CarryoverWorkspaceV2, actor: string, event: string, detail?: string) {
  return { entry: { id: nextId(workspace, "AU"), at: DEMO_NOW, actor, event, ...(detail ? { detail } : {}) }, workspace: advance(workspace) };
}

export interface ObservationInput { title: string; equipment: string; area: string; severity: Issue["severity"]; owner: string; due: string; shift: Issue["shift"]; observation: string; decision: string; evidence: string; }
export function createObservation(workspace: CarryoverWorkspaceV2, input: ObservationInput): CarryoverWorkspaceV2 {
  if (!can(workspace.role, "observe")) throw new Error("This role cannot record observations.");
  if (input.title.trim().length < 8 || input.observation.trim().length < 30 || input.decision.trim().length < 20) throw new Error("Add a specific condition, at least 30 characters of context, and a clear next-shift decision.");
  const issueId = nextId(workspace, "CO");
  let current = advance(workspace);
  const result = audit(current, current.activePerson, "Observation recorded", input.evidence.trim() || undefined);
  current = result.workspace;
  const issue: Issue = { id: issueId, ...input, title: input.title.trim(), observation: input.observation.trim(), decision: input.decision.trim(), evidence: input.evidence.trim(), status: "Observed", resolutionNote: "", linkedHandoffIds: [], linkedActionIds: [], audit: [result.entry] };
  return { ...current, issues: [issue, ...current.issues] };
}

export interface HandoffInput { fromShift: Handoff["fromShift"]; toShift: Handoff["toShift"]; summary: string; equipmentState: string; workAttempted: string; nextDecision: string; issueIds: string[]; }
export function prepareHandoff(workspace: CarryoverWorkspaceV2, input: HandoffInput): CarryoverWorkspaceV2 {
  if (!can(workspace.role, "prepare")) throw new Error("Shift supervisor or plant manager role required to prepare a handoff.");
  const fields = [input.summary, input.equipmentState, input.workAttempted, input.nextDecision];
  if (input.issueIds.length === 0 || fields.some((field) => field.trim().length < 20)) throw new Error("Select at least one issue and give each handoff field at least 20 characters of useful context.");
  const handoffId = nextId(workspace, "HO");
  let current = advance(workspace);
  const result = audit(current, current.activePerson, "Handoff prepared", `${input.fromShift} to ${input.toShift}`);
  current = result.workspace;
  const handoff: Handoff = { id: handoffId, ...input, summary: input.summary.trim(), equipmentState: input.equipmentState.trim(), workAttempted: input.workAttempted.trim(), nextDecision: input.nextDecision.trim(), preparedBy: current.activePerson, preparedAt: DEMO_NOW, status: "Prepared", audit: [result.entry] };
  const issues = current.issues.map((issue) => input.issueIds.includes(issue.id) ? { ...issue, status: "Carried over" as IssueStatus, linkedHandoffIds: [...issue.linkedHandoffIds, handoffId], audit: [...issue.audit, result.entry] } : issue);
  return { ...current, handoffs: [handoff, ...current.handoffs], issues };
}

export function acknowledgeHandoff(workspace: CarryoverWorkspaceV2, handoffId: string, note: string): CarryoverWorkspaceV2 {
  if (!can(workspace.role, "acknowledge")) throw new Error("Shift supervisor or plant manager role required to acknowledge a handoff.");
  if (note.trim().length < 20) throw new Error("Record at least 20 characters describing the incoming cross-check.");
  const handoff = workspace.handoffs.find((item) => item.id === handoffId);
  if (!handoff || handoff.status !== "Prepared") throw new Error("This handoff is unavailable or already acknowledged.");
  const result = audit(workspace, workspace.activePerson, "Incoming cross-check completed", note.trim());
  return { ...result.workspace, handoffs: result.workspace.handoffs.map((item) => item.id === handoffId ? { ...item, status: "Acknowledged", acknowledgedAt: DEMO_NOW, acknowledgedBy: workspace.activePerson, acknowledgementNote: note.trim(), audit: [...item.audit, result.entry] } : item), issues: result.workspace.issues.map((issue) => handoff.issueIds.includes(issue.id) ? { ...issue, status: "Acknowledged", owner: workspace.activePerson, audit: [...issue.audit, result.entry] } : issue) };
}

export interface ActionInput { issueId: string; title: string; owner: string; due: string; expectedProof: string; approvalRequired: boolean; }
export function assignAction(workspace: CarryoverWorkspaceV2, input: ActionInput): CarryoverWorkspaceV2 {
  if (!can(workspace.role, "assign")) throw new Error("Shift supervisor or plant manager role required to assign an action.");
  if (input.title.trim().length < 8 || input.expectedProof.trim().length < 20) throw new Error("Add a specific action and at least 20 characters describing acceptable proof.");
  const issue = workspace.issues.find((item) => item.id === input.issueId);
  if (!issue || issue.status === "Resolved") throw new Error("Select an unresolved issue.");
  const actionId = nextId(workspace, "AC");
  let current = advance(workspace);
  const result = audit(current, current.activePerson, "Action assigned", `${input.title.trim()} · ${input.owner}`);
  current = result.workspace;
  const action: ActionRecord = { id: actionId, ...input, title: input.title.trim(), expectedProof: input.expectedProof.trim(), state: "Open", resolutionEvidence: "", resolutionNote: "", audit: [result.entry] };
  return { ...current, actions: [action, ...current.actions], issues: current.issues.map((item) => item.id === issue.id ? { ...item, status: "In action", owner: input.owner, linkedActionIds: [...item.linkedActionIds, actionId], audit: [...item.audit, result.entry] } : item) };
}

export function submitActionEvidence(workspace: CarryoverWorkspaceV2, actionId: string, evidence: string): CarryoverWorkspaceV2 {
  if (!can(workspace.role, "submit-evidence")) throw new Error("This role cannot submit action evidence.");
  if (evidence.trim().length < 20) throw new Error("Resolution evidence must be at least 20 characters.");
  const action = workspace.actions.find((item) => item.id === actionId);
  if (!action || action.state === "Closed") throw new Error("This action is unavailable or already closed.");
  const nextState = action.approvalRequired ? "Waiting approval" : "Evidence submitted";
  const result = audit(workspace, workspace.activePerson, "Resolution evidence submitted", evidence.trim());
  return { ...result.workspace, actions: result.workspace.actions.map((item) => item.id === actionId ? { ...item, state: nextState, resolutionEvidence: evidence.trim(), audit: [...item.audit, result.entry] } : item) };
}

export function approveAction(workspace: CarryoverWorkspaceV2, actionId: string, resolutionNote: string): CarryoverWorkspaceV2 {
  const action = workspace.actions.find((item) => item.id === actionId);
  if (!action) throw new Error("Action not found.");
  if (action.approvalRequired && !can(workspace.role, "approve")) throw new Error("Plant manager role required to approve this closure.");
  if (!action.approvalRequired && !can(workspace.role, "resolve")) throw new Error("Shift supervisor or plant manager role required to close this action.");
  if (!action.resolutionEvidence || resolutionNote.trim().length < 12) throw new Error("Add evidence first and a final resolution note of at least 12 characters.");
  const result = audit(workspace, workspace.activePerson, "Action closed", resolutionNote.trim());
  const actions = result.workspace.actions.map((item) => item.id === actionId ? { ...item, state: "Closed" as const, resolutionNote: resolutionNote.trim(), audit: [...item.audit, result.entry] } : item);
  const issue = result.workspace.issues.find((item) => item.id === action.issueId)!;
  const allClosed = issue.linkedActionIds.every((id) => actions.find((item) => item.id === id)?.state === "Closed");
  const issues = result.workspace.issues.map((item) => item.id === issue.id ? { ...item, status: allClosed ? "Resolved" as const : item.status, evidence: action.resolutionEvidence, resolutionNote: allClosed ? resolutionNote.trim() : item.resolutionNote, audit: [...item.audit, result.entry] } : item);
  return { ...result.workspace, actions, issues };
}

export function returnAction(workspace: CarryoverWorkspaceV2, actionId: string, note: string): CarryoverWorkspaceV2 {
  if (!can(workspace.role, "approve")) throw new Error("Plant manager role required to return evidence.");
  if (note.trim().length < 12) throw new Error("Explain what additional proof is required.");
  const result = audit(workspace, workspace.activePerson, "Evidence returned for more work", note.trim());
  return { ...result.workspace, actions: result.workspace.actions.map((item) => item.id === actionId ? { ...item, state: "Open", audit: [...item.audit, result.entry] } : item) };
}

export function tourStep(workspace: CarryoverWorkspaceV2) {
  const issue = workspace.issues.find((item) => item.id === "CO-201");
  const handoff = workspace.handoffs.find((item) => item.issueIds.includes("CO-201"));
  const action = workspace.actions.find((item) => item.issueId === "CO-201");
  if (!issue || !handoff) return 0;
  if (handoff.status !== "Acknowledged") return 2;
  if (!action) return 3;
  if (!action.resolutionEvidence) return 4;
  if (issue.status !== "Resolved") return 5;
  return 6;
}
