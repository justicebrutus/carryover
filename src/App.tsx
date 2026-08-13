import { Route, Routes } from "react-router-dom";
import Shell from "./components/Shell";
import Overview from "./pages/Overview";
import Handoffs from "./pages/Handoffs";
import HandoffDetail from "./pages/HandoffDetail";
import Issues from "./pages/Issues";
import NewIssue from "./pages/NewIssue";
import IssueDetail from "./pages/IssueDetail";
import Actions from "./pages/Actions";
import ActionDetail from "./pages/ActionDetail";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

export default function App() {
  return <Routes><Route element={<Shell />}>
    <Route path="/" element={<Overview />} />
    <Route path="/handoffs" element={<Handoffs />} />
    <Route path="/handoffs/:id" element={<HandoffDetail />} />
    <Route path="/issues" element={<Issues />} />
    <Route path="/issues/new" element={<NewIssue />} />
    <Route path="/issues/:id" element={<IssueDetail />} />
    <Route path="/actions" element={<Actions />} />
    <Route path="/actions/:id" element={<ActionDetail />} />
    <Route path="/reports" element={<Reports />} />
    <Route path="*" element={<NotFound />} />
  </Route></Routes>;
}
