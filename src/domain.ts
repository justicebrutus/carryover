export type Role = "Operator" | "Shift supervisor" | "Plant manager";
export type Severity = "Low" | "Moderate" | "High" | "Critical";
export type Shift = "Night" | "Day" | "Evening";
export type IssueStatus = "Observed" | "Carried over" | "Acknowledged" | "In action" | "Resolved";
export type HandoffStatus = "Prepared" | "Acknowledged";
export type ActionState = "Open" | "Evidence submitted" | "Waiting approval" | "Closed";
export type Permission = "observe" | "prepare" | "acknowledge" | "assign" | "submit-evidence" | "resolve" | "approve";

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  event: string;
  detail?: string;
}

export interface Issue {
  id: string;
  title: string;
  equipment: string;
  area: string;
  severity: Severity;
  status: IssueStatus;
  owner: string;
  due: string;
  shift: Shift;
  observation: string;
  decision: string;
  evidence: string;
  resolutionNote: string;
  linkedHandoffIds: string[];
  linkedActionIds: string[];
  audit: AuditEntry[];
}

export interface Handoff {
  id: string;
  fromShift: Shift;
  toShift: Shift;
  preparedBy: string;
  preparedAt: string;
  summary: string;
  equipmentState: string;
  workAttempted: string;
  nextDecision: string;
  issueIds: string[];
  status: HandoffStatus;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  acknowledgementNote?: string;
  audit: AuditEntry[];
}

export interface ActionRecord {
  id: string;
  issueId: string;
  title: string;
  owner: string;
  due: string;
  expectedProof: string;
  state: ActionState;
  approvalRequired: boolean;
  resolutionEvidence: string;
  resolutionNote: string;
  audit: AuditEntry[];
}

export interface CarryoverWorkspaceV1 {
  version: 1;
  recordDate: "2026-08-13";
  role: Role;
  issues: unknown[];
  handoffs: unknown[];
  actions: unknown[];
}

export interface CarryoverWorkspaceV2 {
  version: 2;
  recordDate: "2026-08-13";
  plant: "Northshore Beverage Packaging";
  role: Role;
  activePerson: string;
  nextSequence: number;
  issues: Issue[];
  handoffs: Handoff[];
  actions: ActionRecord[];
}

export type CarryoverWorkspace = CarryoverWorkspaceV2;
