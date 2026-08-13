import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useWorkspace } from "../WorkspaceContext";
import type { Role } from "../domain";
import TourRail from "./TourRail";

const links = [["/", "Overview"], ["/handoffs", "Handoffs"], ["/issues", "Issues"], ["/actions", "Actions"], ["/reports", "Reports"]] as const;

export default function Shell() {
  const { workspace, setRole, reset, recovered, migrated } = useWorkspace();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const navigation = useRef<HTMLElement>(null);
  const location = useLocation();
  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const surface = navigation.current;
    const focusable = surface?.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), select:not([disabled])");
    focusable?.[0]?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);
  return <div className="app-shell">
    <a className="skip" href="#workspace">Skip to workspace</a>
    {open && <button className="nav-backdrop" type="button" aria-label="Close navigation" onClick={() => setOpen(false)} />}
    <aside ref={navigation} id="mobile-navigation" className={open ? "sidebar open" : "sidebar"} aria-label="Carryover navigation">
      <div className="brand"><span className="brand-mark">C/O</span><div><strong>Carryover</strong><span>Shift continuity</span></div></div>
      <nav aria-label="Workspaces">{links.map(([to, label], index) => <NavLink key={to} to={to} end={to === "/"}><span>0{index + 1}</span>{label}</NavLink>)}</nav>
      <div className="role-preview"><label htmlFor="role">Role preview</label><select id="role" value={workspace.role} onChange={(event) => setRole(event.target.value as Role)}><option>Operator</option><option>Shift supervisor</option><option>Plant manager</option></select><strong>{workspace.activePerson}</strong><p>Demonstration permissions only. This is not authentication or security enforcement.</p></div>
      <button className="reset" type="button" onClick={() => { if (confirm("Reset this local demonstration workspace to the original fictional record?")) reset(); }}>Reset demonstration</button>
    </aside>
    <div className="main-column">
      <header className="mobile-head"><button ref={menuButton} type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-navigation">Menu</button><strong>Carryover</strong><span>Day / A</span></header>
      <div className="shift-ribbon"><div><span>Plant</span><strong>{workspace.plant}</strong></div><div><span>Shift window</span><strong>Day · 07:00–15:00</strong></div><div><span>Record</span><strong>13 Aug 2026 · 07:30</strong></div><div><span>Role</span><strong>{workspace.role}</strong></div></div>
      {(recovered || migrated) && <div className="notice" role="status">{recovered ? "Saved data could not be verified. Carryover restored the safe fictional demonstration record." : "The earlier demonstration record was upgraded to Carryover V2."}</div>}
      <TourRail />
      <main id="workspace"><Outlet /></main>
      <footer><strong>Demonstration only.</strong> Fictional plant, people, equipment, incidents, and records. Carryover does not replace approved plant procedures.</footer>
    </div>
  </div>;
}
