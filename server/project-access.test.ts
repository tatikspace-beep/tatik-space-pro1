import { describe, expect, it } from "vitest";
import { canAccessProject, canManageProjectMembers, canUseProjectAgent } from "./project-access";

describe("project access rules", () => {
  it("allows the owner, an assigned member, and an administrator", () => {
    expect(canAccessProject(7, "user", 7, false)).toBe(true);
    expect(canAccessProject(9, "user", 7, true)).toBe(true);
    expect(canAccessProject(3, "admin", 7, false)).toBe(true);
  });

  it("denies users who are neither owner, member, nor administrator", () => {
    expect(canAccessProject(9, "user", 7, false)).toBe(false);
  });

  it("lets only the owner or an administrator manage membership", () => {
    expect(canManageProjectMembers(7, "user", 7)).toBe(true);
    expect(canManageProjectMembers(3, "admin", 7)).toBe(true);
    expect(canManageProjectMembers(9, "user", 7)).toBe(false);
  });

  it("limits the AI agent to administrators, assigned members, and early-access developers", () => {
    expect(canUseProjectAgent("admin", false)).toBe(true);
    expect(canUseProjectAgent("user", true)).toBe(true);
    expect(canUseProjectAgent("user", false, true)).toBe(true);
    expect(canUseProjectAgent("user", false)).toBe(false);
  });
});
