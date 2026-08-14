import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useWorkspace } from "../WorkspaceContext";
import { isEditableTarget, useFocusTrap } from "../lib/useFocusTrap";
import type { Role } from "../domain";
import TourRail from "./TourRail";
import CommandPalette from "./CommandPalette";

const links = [["/", "Overview"], ["/handoffs", "Handoffs"], ["/issues", "Issues"], ["/actions", "Actions"], ["/reports", "Reports"]] as const;

export default function Shell() {
  const { workspace, setRole, reset, recovered, migrated, announce, undo, redo, canUndo, canRedo, undoLabel, redoLabel } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const navigation = useRef<HTMLElement>(null);
  const location = useLocation();
  useEffect(() => { setOpen(false); }, [location.pathname]);
  useFocusTrap(open, navigation, { onEscape: () => { setOpen(false); menuButton.current?.focus(); } });

  // Global shortcuts: ⌘K / Ctrl+K toggles the palette; ⌘Z / ⌘⇧Z (Ctrl+Y) undo /
  // redo the operating record — but never while typing, so native text undo works.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.key.toLowerCase() === "k") { event.preventDefault(); setPaletteOpen((value) => !value); return; }
      if (paletteOpen || !mod || isEditableTarget(event.target)) return;
      const key = event.key.toLowerCase();
      if (key === "z" && !event.shiftKey) { event.preventDefault(); undo(); }
      else if ((key === "z" && event.shiftKey) || key === "y") { event.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteOpen, undo, redo]);

  return <div className="app-shell">
    <a className="skip" href="#workspace">Skip to workspace</a>
    <div className="sr-only" role="status" aria-live="polite">{announce}</div>
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
      <div className="workspace-tools no-print">
        <button type="button" className="tool-search" onClick={() => setPaletteOpen(true)} aria-haspopup="dialog"><span>Search records or run a command</span><kbd>⌘K</kbd></button>
        <div className="tool-history" role="group" aria-label="Operating record history">
          <button type="button" onClick={undo} disabled={!canUndo} title={canUndo ? `Undo: ${undoLabel}` : "Nothing to undo"}><span aria-hidden="true">↶</span> Undo</button>
          <button type="button" onClick={redo} disabled={!canRedo} title={canRedo ? `Redo: ${redoLabel}` : "Nothing to redo"}><span aria-hidden="true">↷</span> Redo</button>
        </div>
      </div>
      {(recovered || migrated) && <div className="notice" role="status">{recovered ? "Saved data could not be verified. Carryover restored the safe fictional demonstration record." : "The earlier demonstration record was upgraded to Carryover V2."}</div>}
      <TourRail />
      <main id="workspace"><Outlet /></main>
      <footer><strong>Demonstration only.</strong> Fictional plant, people, equipment, incidents, and records. Carryover does not replace approved plant procedures.</footer>
    </div>
    <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
  </div>;
}
