import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "../WorkspaceContext";
import { useFocusTrap } from "../lib/useFocusTrap";
import type { Role } from "../domain";

interface Command {
  id: string;
  label: string;
  hint?: string;
  group: string;
  run: () => void;
}

const matches = (text: string, query: string) => text.toLowerCase().includes(query);

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { workspace, undo, redo, canUndo, canRedo, undoLabel, redoLabel, setRole, reset } = useWorkspace();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) { restoreRef.current = document.activeElement as HTMLElement; setQuery(""); setActive(0); }
  }, [open]);

  const close = () => { onClose(); restoreRef.current?.focus(); };
  useFocusTrap(open, containerRef, { onEscape: close, initialFocus: inputRef });

  if (!open) return null;
  const q = query.trim().toLowerCase();

  const nav: Command[] = ([
    ["Overview", "/"], ["Handoffs", "/handoffs"], ["Issues", "/issues"], ["Actions", "/actions"], ["Reports", "/reports"],
  ] as const).map(([label, to]) => ({ id: `nav-${to}`, label, group: "Go to", run: () => navigate(to) }));

  const doCommands: Command[] = [
    { id: "do-observe", label: "Record an observation", hint: "New operating condition", group: "Actions", run: () => navigate("/issues/new") },
    { id: "do-handoff", label: "Prepare a handoff", hint: "Outgoing shift transfer", group: "Actions", run: () => navigate("/handoffs") },
    ...(canUndo ? [{ id: "do-undo", label: "Undo last change", hint: undoLabel, group: "Actions", run: undo }] : []),
    ...(canRedo ? [{ id: "do-redo", label: "Redo change", hint: redoLabel, group: "Actions", run: redo }] : []),
    ...(["Operator", "Shift supervisor", "Plant manager"] as Role[]).map((role) => ({
      id: `role-${role}`, label: `Preview role: ${role}`, hint: role === workspace.role ? "Current" : undefined, group: "Actions", run: () => setRole(role),
    })),
    { id: "do-reset", label: "Reset demonstration", hint: "Restore the original record", group: "Actions", run: () => { if (confirm("Reset this local demonstration workspace to the original fictional record?")) reset(); } },
  ];

  const records: Command[] = q
    ? [
        ...workspace.issues.filter((i) => matches(`${i.id} ${i.title} ${i.equipment} ${i.area}`, q)).map((i) => ({ id: `rec-${i.id}`, label: `${i.id} · ${i.title}`, hint: `${i.equipment} · ${i.status}`, group: "Records", run: () => navigate(`/issues/${i.id}`) })),
        ...workspace.handoffs.filter((h) => matches(`${h.id} ${h.fromShift} ${h.toShift} ${h.summary}`, q)).map((h) => ({ id: `rec-${h.id}`, label: `${h.id} · ${h.fromShift} → ${h.toShift}`, hint: `Handoff · ${h.status}`, group: "Records", run: () => navigate(`/handoffs/${h.id}`) })),
        ...workspace.actions.filter((a) => matches(`${a.id} ${a.title} ${a.owner}`, q)).map((a) => ({ id: `rec-${a.id}`, label: `${a.id} · ${a.title}`, hint: `Action · ${a.state}`, group: "Records", run: () => navigate(`/actions/${a.id}`) })),
      ].slice(0, 8)
    : [];

  const filterCmd = (command: Command) => !q || matches(`${command.label} ${command.hint ?? ""}`, q);
  const groups: [string, Command[]][] = ([
    ["Go to", nav.filter(filterCmd)],
    ["Actions", doCommands.filter(filterCmd)],
    ["Records", records],
  ] as [string, Command[]][]).filter(([, list]) => list.length > 0);
  const options = groups.flatMap(([, list]) => list);
  const activeIndex = options.length ? Math.min(active, options.length - 1) : 0;

  const runCommand = (command: Command | undefined) => { if (!command) return; command.run(); close(); };

  const onKey = (event: React.KeyboardEvent) => {
    if (!options.length) return;
    if (event.key === "ArrowDown") { event.preventDefault(); setActive((i) => (i + 1) % options.length); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActive((i) => (i - 1 + options.length) % options.length); }
    else if (event.key === "Enter") { event.preventDefault(); runCommand(options[activeIndex]); }
  };

  let optionIndex = -1;
  return (
    <div className="palette-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Command palette" ref={containerRef}>
        <input
          ref={inputRef}
          className="palette-input"
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-activedescendant={options.length ? `palette-opt-${activeIndex}` : undefined}
          placeholder="Search records or run a command…"
          value={query}
          spellCheck={false}
          autoComplete="off"
          onChange={(event) => { setQuery(event.target.value); setActive(0); }}
          onKeyDown={onKey}
        />
        <ul id="palette-list" role="listbox" className="palette-list" aria-label="Commands and records">
          {options.length === 0 && <li className="palette-empty" role="presentation">No matching record or command.</li>}
          {groups.map(([group, list]) => (
            <li key={group} role="presentation" className="palette-group">
              <p className="palette-group-head">{group}</p>
              <ul role="presentation">
                {list.map((command) => {
                  optionIndex += 1;
                  const index = optionIndex;
                  return (
                    <li
                      key={command.id}
                      id={`palette-opt-${index}`}
                      role="option"
                      aria-selected={index === activeIndex}
                      className={index === activeIndex ? "palette-opt active" : "palette-opt"}
                      onMouseEnter={() => setActive(index)}
                      onMouseDown={(event) => { event.preventDefault(); runCommand(command); }}
                    >
                      <span>{command.label}</span>
                      {command.hint && <small>{command.hint}</small>}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
        <p className="palette-foot">↑↓ move · ↵ run · esc close</p>
      </div>
    </div>
  );
}
