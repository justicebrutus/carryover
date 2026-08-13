import { Link } from "react-router-dom";
import { useWorkspace } from "../WorkspaceContext";

const lanes = ["Open", "Evidence submitted", "Waiting approval", "Closed"] as const;
export default function Actions() {
  const { workspace } = useWorkspace();
  return <div className="page"><header className="page-head compact"><div><p className="eyebrow">Actions · Ownership and proof</p><h1>Closure needs evidence.</h1><p>Work moves through visible responsibility, verification, and approval states before the source condition changes.</p></div></header><div className="responsibility-board">{lanes.map((lane) => <section key={lane}><header><span>{String(lanes.indexOf(lane) + 1).padStart(2, "0")}</span><h2>{lane}</h2><b>{workspace.actions.filter((action) => action.state === lane).length}</b></header><div>{workspace.actions.filter((action) => action.state === lane).map((action) => { const issue = workspace.issues.find((item) => item.id === action.issueId)!; return <Link className="action-record" to={`/actions/${action.id}`} key={action.id}><span>{action.id} · {issue.equipment}</span><h3>{action.title}</h3><p>{action.expectedProof}</p><footer><strong>{action.owner}</strong><b data-severity={issue.severity}>{issue.severity}</b></footer></Link>; })}{workspace.actions.every((action) => action.state !== lane) && <p className="lane-empty">No records in this state.</p>}</div></section>)}</div></div>;
}
