import { describe, expect, it } from "vitest";
import { SEED_WORKSPACE } from "../data/seed";
import { filterIssues, issuesCsv } from "./filters";

describe("record filters and exports", () => {
  it("searches across equipment and title", () => expect(filterIssues(SEED_WORKSPACE.issues, { query: "Labeler 02", severity: "All", state: "All" }).map((issue) => issue.id)).toEqual(["CO-201"]));
  it("filters severity and state together", () => expect(filterIssues(SEED_WORKSPACE.issues, { query: "", severity: "High", state: "Open" })).toHaveLength(2));
  it("returns resolved records", () => expect(filterIssues(SEED_WORKSPACE.issues, { query: "", severity: "All", state: "Resolved" }).map((issue) => issue.id)).toEqual(["CO-205"]));
  it("exports stable columns and escaped values", () => { const csv = issuesCsv([SEED_WORKSPACE.issues[0]]); expect(csv).toContain("ID,Title,Equipment"); expect(csv).toContain('"CO-201"'); expect(csv.split("\n")).toHaveLength(2); });
});
