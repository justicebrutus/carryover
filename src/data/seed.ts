import type { CarryoverWorkspaceV2 } from "../domain";

export const PEOPLE = ["Mina Park", "Elias Morgan", "Sofia Reyes", "Noah Williams", "Avery Chen"] as const;
export const EQUIPMENT = ["Filler 02", "Labeler 02", "Palletizer 01", "CIP Loop B", "Cold-storage Dock 3"] as const;

export const SEED_WORKSPACE: CarryoverWorkspaceV2 = {
  version: 2,
  recordDate: "2026-08-13",
  plant: "Northshore Beverage Packaging",
  role: "Shift supervisor",
  activePerson: "Mina Park",
  nextSequence: 210,
  issues: [
    {
      id: "CO-201", title: "Intermittent label skew after changeover", equipment: "Labeler 02", area: "Packaging hall", severity: "High", status: "Observed", owner: "Noah Williams", due: "2026-08-13T08:30", shift: "Night",
      observation: "Labels drifted 3–5 mm toward the trailing edge on four bottles after the 355 mL flavour changeover.",
      decision: "Keep Labeler 02 at reduced speed until alignment is verified across a complete 30-bottle run.",
      evidence: "Four affected bottles isolated; guide-rail setting and changeover checklist recorded.", resolutionNote: "", linkedHandoffIds: [], linkedActionIds: [],
      audit: [
        { id: "AU-201", at: "2026-08-13T05:48", actor: "Noah Williams", event: "Observation recorded", detail: "Four affected bottles isolated." },
      ],
    },
    {
      id: "CO-202", title: "Fill-height sample outside target", equipment: "Filler 02", area: "Packaging hall", severity: "Critical", status: "Acknowledged", owner: "Sofia Reyes", due: "2026-08-13T08:00", shift: "Night",
      observation: "Two bottles in the final hourly sample measured below the documented fill-height target.",
      decision: "Hold pallet 7B and complete quality verification before product release.",
      evidence: "Pallet 7B placed on quality hold; sample IDs Q-882 through Q-893 logged.", resolutionNote: "", linkedHandoffIds: ["HO-40"], linkedActionIds: ["AC-61"],
      audit: [
        { id: "AU-203", at: "2026-08-13T05:12", actor: "Noah Williams", event: "Observation recorded" },
        { id: "AU-204", at: "2026-08-13T06:42", actor: "Sofia Reyes", event: "Incoming shift acknowledged responsibility" },
      ],
    },
    {
      id: "CO-203", title: "Case-count photo-eye misses", equipment: "Palletizer 01", area: "End-of-line", severity: "Moderate", status: "In action", owner: "Elias Morgan", due: "2026-08-13T10:00", shift: "Day",
      observation: "The infeed photo-eye missed two cases during a 20-minute observation window.",
      decision: "Operate with visual confirmation while maintenance inspects sensor alignment.",
      evidence: "Affected cases reconciled against the production count.", resolutionNote: "", linkedHandoffIds: ["HO-40"], linkedActionIds: ["AC-62"],
      audit: [{ id: "AU-205", at: "2026-08-13T06:55", actor: "Elias Morgan", event: "Inspection action assigned" }],
    },
    {
      id: "CO-204", title: "Final rinse conductivity slow to clear", equipment: "CIP Loop B", area: "Sanitation", severity: "High", status: "Observed", owner: "Avery Chen", due: "2026-08-13T12:00", shift: "Day",
      observation: "Final rinse required six additional minutes to return below the documented conductivity threshold.",
      decision: "Review the next cycle trend before releasing Loop B for the evening sanitation plan.",
      evidence: "Cycle trace CIP-B-0813 retained for review.", resolutionNote: "", linkedHandoffIds: [], linkedActionIds: [],
      audit: [{ id: "AU-206", at: "2026-08-13T07:08", actor: "Avery Chen", event: "Observation recorded" }],
    },
    {
      id: "CO-205", title: "Dock door seal replaced", equipment: "Cold-storage Dock 3", area: "Cold storage", severity: "Low", status: "Resolved", owner: "Elias Morgan", due: "2026-08-12T16:00", shift: "Evening",
      observation: "Lower door seal showed a visible split during the pre-shift inspection.",
      decision: "Replace before the next refrigerated trailer is positioned.",
      evidence: "New seal installed and closure inspected under dock lighting.", resolutionNote: "Door closed evenly through three cycles and no light gap remained.", linkedHandoffIds: [], linkedActionIds: ["AC-60"],
      audit: [
        { id: "AU-207", at: "2026-08-12T14:24", actor: "Elias Morgan", event: "Observation recorded" },
        { id: "AU-208", at: "2026-08-12T15:35", actor: "Mina Park", event: "Resolution approved", detail: "Three closure cycles verified." },
      ],
    },
  ],
  handoffs: [
    {
      id: "HO-40", fromShift: "Night", toShift: "Day", preparedBy: "Noah Williams", preparedAt: "2026-08-13T06:20", summary: "Protect the quality hold at Filler 02 and maintain visual confirmation at Palletizer 01 until both checks are complete.", equipmentState: "Filler 02 stopped with pallet 7B isolated. Palletizer 01 is available at reduced throughput.", workAttempted: "Fill-height samples were repeated and palletizer case counts were reconciled manually.", nextDecision: "Quality disposition for pallet 7B, then maintenance confirmation for the palletizer sensor.", issueIds: ["CO-202", "CO-203"], status: "Acknowledged", acknowledgedAt: "2026-08-13T06:42", acknowledgedBy: "Sofia Reyes", acknowledgementNote: "Hold labels and physical pallet location cross-checked at the line.",
      audit: [
        { id: "AU-209", at: "2026-08-13T06:20", actor: "Noah Williams", event: "Handoff prepared" },
        { id: "AU-210", at: "2026-08-13T06:42", actor: "Sofia Reyes", event: "Incoming shift cross-check completed" },
      ],
    },
  ],
  actions: [
    { id: "AC-60", issueId: "CO-205", title: "Replace and verify Dock 3 lower seal", owner: "Elias Morgan", due: "2026-08-12T16:00", expectedProof: "Three complete closure cycles with no visible light gap.", state: "Closed", approvalRequired: false, resolutionEvidence: "Seal replaced; three closure cycles completed without a visible gap.", resolutionNote: "Returned to normal service.", audit: [{ id: "AU-212", at: "2026-08-12T15:35", actor: "Elias Morgan", event: "Action closed with evidence" }] },
    { id: "AC-61", issueId: "CO-202", title: "Complete fill-height disposition for pallet 7B", owner: "Sofia Reyes", due: "2026-08-13T08:00", expectedProof: "Documented sample result and quality disposition for the isolated pallet.", state: "Waiting approval", approvalRequired: true, resolutionEvidence: "Twelve retained samples measured; results entered against hold QH-118.", resolutionNote: "", audit: [{ id: "AU-213", at: "2026-08-13T07:12", actor: "Sofia Reyes", event: "Evidence submitted for manager approval" }] },
    { id: "AC-62", issueId: "CO-203", title: "Inspect Palletizer 01 photo-eye alignment", owner: "Elias Morgan", due: "2026-08-13T10:00", expectedProof: "Sensor alignment confirmed through a 20-minute monitored run.", state: "Open", approvalRequired: false, resolutionEvidence: "", resolutionNote: "", audit: [{ id: "AU-214", at: "2026-08-13T06:55", actor: "Mina Park", event: "Action assigned" }] },
  ],
};
