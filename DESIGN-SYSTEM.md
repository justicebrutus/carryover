# Carryover Design System

## Product truth

Carryover serves operators and supervisors who need to transfer unresolved work without losing context or responsibility. Its primary action is an explicit two-way handoff supported by evidence. It is a fictional interface demonstration, not plant safety software.

## Design point of view

An industrial logbook expressed as a calm control room: current state first, responsibility second, proof before closure.

## Foundations

| Token | Value | Job |
| --- | --- | --- |
| Graphite | `#15191c` | Persistent navigation, protected decisions, evidence surfaces |
| Steel | `#293139` | Section headers and responsibility lanes |
| Paper | `#f1f2ef` | Working canvas with a restrained 24px grid |
| White | `#ffffff` | Editable records and primary reading surfaces |
| Amber | `#d88622` | Current action, focus, and required attention |
| Red | `#983629` | Critical severity with a text label |
| Green | `#2f6650` | Verified or completed state with a text label |

System UI carries operating copy; the native monospaced stack carries IDs, time, state, and audit metadata. Body copy remains 16px where narrative reading matters; dense metadata never drops below 10px and is not used for instructions.

## Structural motifs

- **Shift ribbon:** plant, shift window, record date, and role remain visible context.
- **Continuity board:** the next responsibility transfer outranks summary metrics.
- **Transfer ledger:** outgoing preparation and incoming cross-check are separate panels in one record.
- **Equipment logbook:** conditions connect directly to handoffs, actions, evidence, and audit history.
- **Responsibility lanes:** work is grouped by state and owner, not decorative KPIs.
- **Operating brief:** print output removes controls while preserving context and disclosure.

## Responsive behaviour

- **1440:** persistent 240px workspace rail and comparative operating surfaces.
- **1024:** 200px rail, simplified grids, and five-column condition register.
- **768:** navigation becomes a sheet; forms and ledgers use the full task width.
- **390:** direct full-width sequence; tables become readable records.
- **320:** one-column controls, clipped decorative overflow, and short persistent context.

All actionable controls target at least 44px. Mobile navigation closes on selection, backdrop, or Escape and returns focus to the menu button.

## States, motion, and accessibility

- Native labels, inputs, buttons, links, tables, and headings are preferred.
- Disabled actions include visible role requirements.
- Validation explains the missing evidence or context and preserves entered data.
- Recovery, migration, and save outcomes use status messaging without implying transmission.
- Status always includes text; color is supplementary.
- Motion is limited to 160–220ms navigation and state transitions and collapses under reduced motion.
- Focus uses a 3px amber outline with offset; document order remains complete without motion.

## Copy voice

Short, specific, and accountable. Use “cross-check the equipment state” instead of “collaborate seamlessly.” Buttons predict outcomes: “Publish prepared handoff,” “Acknowledge responsibility,” and “Approve and close.”

## Product-depth interaction patterns

- **Command surface** (Ctrl/Cmd+K, or the on-screen trigger): a centered graphite-bordered dialog over a scrim. Mono group labels, hairline rows, and the active row inverts to graphite with amber-tinted hints. It is a `role="dialog"` with a `role="combobox"` input over a `role="listbox"`; focus is trapped and restored to the trigger on close. It searches the real record set — never a separate data source.
- **Undo / redo**: a mono `Undo / Redo` pair in the workspace tool bar, disabled when empty and titled with the change label. Time-travel rewinds the operating record and its immutable audit trail together; it is session state, never persisted history. Global Ctrl/Cmd+Z is suppressed while a text field is focused so native editing is preserved.
- **Cross-tab feedback**: a change adopted from another tab is announced through the shared `aria-live` status region — the same channel as recovery and migration notices. Text first; no transmission implied.
- **Shared focus trap**: one `useFocusTrap` hook backs both the responsive navigation sheet and the command palette, so keyboard and screen-reader behaviour stay identical.
- New application controls carry the `no-print` class and are removed from print output.
