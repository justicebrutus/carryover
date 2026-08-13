export type Role = "Operator" | "Shift supervisor" | "Plant manager";
export type Severity = "Low" | "Moderate" | "High" | "Critical";
export type IssueStatus = "Observed" | "Carried over" | "Acknowledged" | "In action" | "Resolved";
export interface AuditEntry { id: string; at: string; actor: string; event: string; evidence?: string; }
export interface Issue { id: string; title: string; equipment: string; area: string; severity: Severity; status: IssueStatus; owner: string; due: string; shift: string; observation: string; decision: string; evidence: string; audit: AuditEntry[]; }
export interface Handoff { id: string; fromShift: string; toShift: string; supervisor: string; summary: string; issueIds: string[]; acknowledgedAt?: string; }
export interface ActionRecord { id: string; issueId: string; title: string; owner: string; due: string; state: "Open" | "Waiting approval" | "Closed"; approvalRequired: boolean; resolutionEvidence: string; }
export interface CarryoverWorkspaceV1 { version: 1; recordDate: "2026-08-13"; role: Role; issues: Issue[]; handoffs: Handoff[]; actions: ActionRecord[]; }
