import { SEED_WORKSPACE } from "../data/seed";
import type { ActionRecord, CarryoverWorkspaceV1, Issue, IssueStatus, Role } from "../domain";
export const STORAGE_KEY = "carryover.workspace.v1";
const cloneSeed = () => JSON.parse(JSON.stringify(SEED_WORKSPACE)) as CarryoverWorkspaceV1;
export function isWorkspace(value: unknown): value is CarryoverWorkspaceV1 { const item=value as Partial<CarryoverWorkspaceV1>|null; return Boolean(item&&item.version===1&&Array.isArray(item.issues)&&Array.isArray(item.handoffs)&&Array.isArray(item.actions)); }
export function loadWorkspace(storage: Pick<Storage,"getItem"> = localStorage) { try { const raw=storage.getItem(STORAGE_KEY); if(!raw) return {workspace:cloneSeed(),recovered:false}; const parsed=JSON.parse(raw); if(!isWorkspace(parsed)) throw new Error("invalid"); return {workspace:parsed,recovered:false}; } catch { return {workspace:cloneSeed(),recovered:true}; } }
export function saveWorkspace(workspace: CarryoverWorkspaceV1, storage: Pick<Storage,"setItem"> = localStorage) { storage.setItem(STORAGE_KEY,JSON.stringify(workspace)); }
export function resetWorkspace(storage: Pick<Storage,"removeItem"> = localStorage) { storage.removeItem(STORAGE_KEY); return cloneSeed(); }
export const can = (role: Role, action: "observe"|"acknowledge"|"assign"|"resolve"|"approve") => ({Operator:["observe"],"Shift supervisor":["observe","acknowledge","assign","resolve"],"Plant manager":["observe","acknowledge","assign","resolve","approve"]}[role] as string[]).includes(action);
export const unresolved = (issues: Issue[]) => issues.filter((issue)=>issue.status!=="Resolved");
export const overdue = (issues: Issue[], now="2026-08-13T07:30") => unresolved(issues).filter((issue)=>issue.due<now);
export const transitionIssue = (issue: Issue, next: IssueStatus, actor: string, evidence=""): Issue => ({...issue,status:next,evidence:evidence||issue.evidence,audit:[...issue.audit,{id:`AU-${Date.now()}`,at:"2026-08-13T07:30",actor,event:`Status changed to ${next}`,...(evidence?{evidence}: {})}]});
export function closeAction(action: ActionRecord, evidence: string, role: Role): ActionRecord { if(!can(role,"resolve")) throw new Error("Role cannot close actions"); if(evidence.trim().length<12) throw new Error("Resolution evidence must be at least 12 characters"); if(action.approvalRequired&&role!=="Plant manager") return {...action,resolutionEvidence:evidence,state:"Waiting approval"}; return {...action,resolutionEvidence:evidence,state:"Closed"}; }
