import { Link, useLocation, useNavigate } from "react-router-dom";
import { useWorkspace } from "../WorkspaceContext";
import { tourStep } from "../lib/workspace";

const steps = ["Observe", "Prepare", "Cross-check", "Assign", "Prove", "Close"];
export default function TourRail() {
  const { workspace } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();
  if (!new URLSearchParams(location.search).has("tour")) return null;
  const params = new URLSearchParams(location.search);
  const staged = Number(params.get("stage"));
  const derived = tourStep(workspace);
  const current = Number.isInteger(staged) && staged >= 0 && staged <= 5 && derived < 6 ? staged : derived;
  const handoff = workspace.handoffs.find((item) => item.issueIds.includes("CO-201"));
  const action = workspace.actions.find((item) => item.issueId === "CO-201");
  const destinations = ["/handoffs", handoff ? `/handoffs/${handoff.id}` : "/handoffs", handoff ? `/handoffs/${handoff.id}` : "/handoffs", "/issues/CO-201", action ? `/actions/${action.id}` : "/actions", action ? `/actions/${action.id}` : "/actions"];
  const dismiss = () => navigate(location.pathname, { replace: true });
  return <section className="tour-rail" aria-label="Guided handoff progress">
    <div><span className="signal-dot" /> <strong>{current === 6 ? "Handoff complete" : `Step ${current + 1} of 6`}</strong><small>Live demonstration record</small></div>
    <ol>{steps.map((label, index) => <li key={label} data-state={index < current ? "done" : index === current ? "current" : "next"}><span>{index + 1}</span>{label}</li>)}</ol>
    <div className="tour-actions">{current < 6 && current !== 1 && <Link to={`${destinations[current]}?tour=handoff${current === 0 ? "&stage=1" : ""}`}>Continue →</Link>}<button type="button" onClick={dismiss}>Exit guide</button></div>
  </section>;
}
