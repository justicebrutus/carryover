import { Link } from "react-router-dom";
import { useWorkspace } from "../WorkspaceContext";
import { overdue, tourStep, unacknowledged, unresolved } from "../lib/workspace";

export default function Overview() {
  const { workspace } = useWorkspace();
  const openIssues = unresolved(workspace.issues);
  const late = overdue(workspace.issues);
  const waiting = unacknowledged(workspace.handoffs);
  const next = waiting[0] ?? workspace.handoffs[0];
  const progress = tourStep(workspace);
  return <div className="page overview-page">
    <header className="page-head overview-head"><div><p className="eyebrow">Overview · Current operating brief</p><h1>Know what the next shift inherits.</h1><p>Carryover keeps unresolved conditions, responsibility transfers, and proof of closure in one legible operating record.</p><div className="head-actions"><Link className="primary" to="/issues/CO-201?tour=handoff&stage=0">Run the handoff →</Link><Link to="/issues/new">Record an observation</Link></div></div><div className="shift-stamp"><span>Current shift</span><strong>DAY / A</strong><small>07:00–15:00</small><i>Live fictional record</i></div></header>
    <section className="continuity-board" aria-labelledby="continuity-title">
      <div className="board-lead"><p className="eyebrow">Next responsibility transfer</p><h2 id="continuity-title">{waiting.length ? "Incoming cross-check required." : "Current handoff acknowledged."}</h2><p>{next.summary}</p><dl><div><dt>From / to</dt><dd>{next.fromShift} → {next.toShift}</dd></div><div><dt>Linked conditions</dt><dd>{next.issueIds.length}</dd></div><div><dt>Status</dt><dd>{next.status}</dd></div></dl><Link className="primary" to={`/handoffs/${next.id}`}>{next.status === "Prepared" ? "Cross-check handoff" : "Open transfer record"} →</Link></div>
      <div className="board-register"><div className="register-head"><div><p className="eyebrow">Shift pressure</p><h2>What cannot be dropped</h2></div><span>{openIssues.length} unresolved</span></div>{openIssues.slice(0, 4).map((issue, index) => <Link className="register-row" to={`/issues/${issue.id}`} key={issue.id}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{issue.title}</strong><small>{issue.equipment} · {issue.area}</small></div><b data-severity={issue.severity}>{issue.severity}</b><em>{issue.status}</em></Link>)}</div>
    </section>
    <section className="operating-signals" aria-label="Operating signals"><article><span>{waiting.length}</span><div><strong>unacknowledged handoff</strong><small>{waiting.length ? "Responsibility has not transferred." : "No incoming cross-check is waiting."}</small></div></article><article><span>{late.length}</span><div><strong>overdue condition{late.length === 1 ? "" : "s"}</strong><small>Measured against the fixed 07:30 record time.</small></div></article><article><span>{workspace.actions.filter((action) => action.state !== "Closed").length}</span><div><strong>open actions</strong><small>Evidence and approval remain connected.</small></div></article></section>
    <section className="workflow-map"><div><p className="eyebrow">Signature journey</p><h2>Continuity is a verified transfer—not a forwarded note.</h2><p>The guided path uses the same records, permissions, and audit history as freeform use.</p></div><ol>{["Observation", "Prepared handoff", "Incoming cross-check", "Assigned action", "Resolution evidence", "Updated record"].map((label, index) => <li key={label} data-active={index <= progress}><span>{String(index + 1).padStart(2, "0")}</span>{label}</li>)}</ol></section>
  </div>;
}
