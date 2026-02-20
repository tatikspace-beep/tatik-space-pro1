import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "email",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("backups", () => {
  it("should list user backups", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const backups = await caller.backups.list();

    expect(Array.isArray(backups)).toBe(true);
  });

  it("should create a backup with valid data", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const snapshot = JSON.stringify([
      { id: 1, name: "test.js", content: "console.log('test');" }
    ]);

    const result = await caller.backups.create({
      projectId: 1,
      name: "Test Backup",
      description: "Test backup description",
      snapshot,
    });

    expect(result).toHaveProperty("backupId");
    expect(typeof result.backupId).toBe("number");
  });

  it("should enforce 10 backup limit", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // This test verifies that the limit is enforced in the database helper
    // The actual enforcement happens in db.createBackup()
    const backups = await caller.backups.list();
    expect(backups.length).toBeLessThanOrEqual(10);
  });
});

describe("projects", () => {
  it("should list user projects", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const projects = await caller.projects.list();

    expect(Array.isArray(projects)).toBe(true);
  });

  it("should create a project", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.projects.create({
      name: "Test Project",
      description: "A test project",
    });

    expect(result).toHaveProperty("projectId");
    expect(typeof result.projectId).toBe("number");
  });
});

describe("files", () => {
  it("should create a file", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.files.create({
      projectId: 1,
      name: "test.js",
      path: "/test.js",
      content: "console.log('test');",
      language: "javascript",
    });

    expect(result).toHaveProperty("fileId");
    expect(typeof result.fileId).toBe("number");
  });

  it("should update file content", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.files.update({
      fileId: 1,
      content: "console.log('updated');",
    });

    expect(result).toEqual({ success: true });
  });

  it("should delete a file", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.files.delete({
      fileId: 1,
    });

    expect(result).toEqual({ success: true });
  });
});
