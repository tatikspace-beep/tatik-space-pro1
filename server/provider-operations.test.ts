import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createDatabaseProject,
  deployStaticProject,
  type StaticDeploymentFile,
} from "./provider-operations";
import { createHash } from "node:crypto";

const token = "provider-token-for-tests";
const staticFiles: StaticDeploymentFile[] = [
  { path: "index.html", content: Buffer.from("<h1>Hello</h1>").toString("base64") },
];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("provider operations", () => {
  it("creates a Neon database and returns connection details only to the caller", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      project: { id: "neon-project", name: "demo" },
      connection_uris: [{ connection_uri: "postgresql://user:secret@db.example/neondb" }],
    }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await createDatabaseProject({
      provider: "neon",
      token,
      projectName: "demo",
      region: "aws-eu-central-1",
    });

    expect(result).toMatchObject({
      provider: "neon",
      projectId: "neon-project",
      connectionUri: "postgresql://user:secret@db.example/neondb",
    });
    expect(fetchMock.mock.calls[0][0]).toBe("https://console.neon.tech/api/v2/projects");
    expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({ Authorization: `Bearer ${token}` });
  });

  it("creates a static Vercel deployment after validating root index and secret filters", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      id: "deployment-id",
      url: "demo.vercel.app",
      readyState: "QUEUED",
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await deployStaticProject({
      provider: "vercel",
      token,
      projectName: "Demo Project",
      files: staticFiles,
    });

    expect(result.url).toBe("https://demo.vercel.app");
    const request = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(request.name).toBe("demo-project");
    expect(request.target).toBe("production");
    expect(request.files[0]).toMatchObject({ file: "index.html", encoding: "base64" });

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      id: "next-deployment",
      projectId: "existing-vercel-project",
      url: "demo-2.vercel.app",
      readyState: "READY",
    }), { status: 200 }));
    await deployStaticProject({
      provider: "vercel",
      token,
      projectName: "Demo Project",
      resourceId: "existing-vercel-project",
      files: staticFiles,
    });
    const redeployRequest = JSON.parse(fetchMock.mock.calls[1][1].body as string);
    expect(redeployRequest.projectId).toBe("existing-vercel-project");
    expect(redeployRequest.name).toBeUndefined();

    await expect(deployStaticProject({
      provider: "vercel",
      token,
      projectName: "Demo",
      files: [{ path: "../secret.txt", content: Buffer.from("x").toString("base64") }],
    })).rejects.toThrow("Static deployment requires an index.html file at the project root.");
    await expect(deployStaticProject({
      provider: "vercel",
      token,
      projectName: "Demo",
      files: [
        ...staticFiles,
        { path: "package.json", content: Buffer.from('{"scripts":{"build":"npm run build"}}').toString("base64") },
      ],
    })).rejects.toThrow("This project requires a build.");
  });

  it("creates a Netlify site and uploads exactly the files requested by its digest", async () => {
    const digest = createHash("sha1").update(Buffer.from("<h1>Hello</h1>")).digest("hex");
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "site-id" }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "deploy-id", required: [digest], state: "uploading" }), { status: 200 }))
      .mockResolvedValueOnce(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await deployStaticProject({
      provider: "netlify",
      token,
      projectName: "Demo",
      files: staticFiles,
    });

    expect(result.siteId).toBe("site-id");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[2][0]).toBe("https://api.netlify.com/api/v1/deploys/deploy-id/files/index.html");
    expect(fetchMock.mock.calls[2][1].body).toBeInstanceOf(ArrayBuffer);
  });

  it("reuses an existing Netlify site for subsequent deploys", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "deploy-id", required: [] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await deployStaticProject({
      provider: "netlify",
      token,
      projectName: "Demo",
      resourceId: "existing-site-id",
      files: staticFiles,
    });

    expect(result.siteId).toBe("existing-site-id");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.netlify.com/api/v1/sites/existing-site-id/deploys");
  });
});
