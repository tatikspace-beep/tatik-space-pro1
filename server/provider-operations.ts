import { createHash } from "node:crypto";
import type { ProviderId } from "./provider-credentials";

export interface StaticDeploymentFile {
  path: string;
  content: string;
}

const MAX_DEPLOYMENT_FILES = 100;
const MAX_DEPLOYMENT_BYTES = 3 * 1024 * 1024;

function safeFilePath(path: string) {
  const normalized = path.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized || normalized.split("/").some(part => !part || part === "." || part === "..")) return null;
  if (/^[a-z]:/i.test(normalized)) return null;
  if (/(^|\/)(?:node_modules|\.git|\.env(?:\.[^/]+)?|\.next|\.nuxt)(?:\/|$)/i.test(normalized)) return null;
  if (/\.(?:pem|key|p12|pfx)$/i.test(normalized)) return null;
  return normalized;
}

function safeStaticFiles(files: StaticDeploymentFile[]) {
  if (files.length > MAX_DEPLOYMENT_FILES) {
    throw new Error(`Static deployment supports up to ${MAX_DEPLOYMENT_FILES} files.`);
  }
  const seen = new Set<string>();
  const safe: Array<{ path: string; bytes: Buffer }> = [];
  let totalBytes = 0;
  let buildRequired = false;
  for (const file of files) {
    const path = safeFilePath(file.path);
    if (!path) continue;
    if (seen.has(path)) throw new Error(`Duplicate deployment file: ${path}`);
    seen.add(path);
    if (!/^(?:[A-Za-z0-9+/]*={0,2})$/.test(file.content) || file.content.length % 4 !== 0) {
      throw new Error(`Invalid base64 content: ${path}`);
    }
    const bytes = Buffer.from(file.content, "base64");
    if (!bytes.length && file.content.length) throw new Error(`Invalid file content: ${path}`);
    totalBytes += bytes.length;
    if (totalBytes > MAX_DEPLOYMENT_BYTES) {
      throw new Error("Static deployment is limited to 3 MB of uncompressed files.");
    }
    const content = bytes.toString("utf8");
    if (path.toLowerCase() === "package.json") {
      try {
        const manifest = JSON.parse(content) as { scripts?: { build?: unknown } };
        buildRequired = typeof manifest.scripts?.build === "string";
      } catch {
        throw new Error("The package.json file is not valid JSON.");
      }
    }
    if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:sk_(?:live|proj)[_-]|rk_live_|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|xox[baprs]-|npm_[A-Za-z0-9]{20,}|vercel_[A-Za-z0-9_-]{20,})/i.test(content)) {
      throw new Error(`A possible secret was detected in ${path}; remove it before deployment.`);
    }
    safe.push({ path, bytes });
  }
  if (!safe.some(file => file.path.toLowerCase() === "index.html")) {
    throw new Error("Static deployment requires an index.html file at the project root.");
  }
  if (buildRequired) {
    throw new Error("This project requires a build. Upload the generated static output directory (for example dist/) with index.html at its root.");
  }
  return safe;
}

async function providerRequest(
  provider: ProviderId,
  token: string,
  url: string,
  init: RequestInit,
) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "User-Agent": "Tatik.space",
      ...init.headers,
    },
    signal: AbortSignal.timeout(60_000),
    redirect: "error",
  });
  const body = await response.text();
  let payload: Record<string, any> = {};
  if (body) {
    try {
      payload = JSON.parse(body);
    } catch {
      if (response.ok) throw new Error(`${provider} returned an invalid response.`);
    }
  }
  if (!response.ok) {
    const message = typeof payload.message === "string" ? payload.message
      : typeof payload.error_description === "string" ? payload.error_description
        : typeof payload.error === "string" ? payload.error
          : `HTTP ${response.status}`;
    throw new Error(`${provider} request failed: ${message.replaceAll(token, "[redacted]").slice(0, 240)}`);
  }
  return payload;
}

export async function createDatabaseProject(input: {
  provider: "supabase" | "neon";
  token: string;
  projectName: string;
  region: string;
  organizationSlug?: string;
  databasePassword?: string;
}) {
  if (input.provider === "neon") {
    const payload = await providerRequest("neon", input.token, "https://console.neon.tech/api/v2/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project: { name: input.projectName, region_id: input.region, pg_version: 17 },
      }),
    });
    const project = payload.project;
    const connectionUri = payload.connection_uris?.[0]?.connection_uri;
    if (typeof project?.id !== "string" || typeof connectionUri !== "string") {
      throw new Error("Neon created a project but did not return its connection details.");
    }
    return {
      provider: input.provider,
      projectId: project.id,
      projectName: project.name,
      connectionUri,
      dashboardUrl: `https://console.neon.tech/app/projects/${encodeURIComponent(project.id)}`,
    };
  }

  if (!input.organizationSlug || !input.databasePassword) {
    throw new Error("Supabase requires an organization slug and a database password.");
  }
  if (input.databasePassword.length < 12 || input.databasePassword.length > 128) {
    throw new Error("Supabase database passwords must be 12 to 128 characters long.");
  }
  const payload = await providerRequest("supabase", input.token, "https://api.supabase.com/v1/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.projectName,
      organization_slug: input.organizationSlug,
      db_pass: input.databasePassword,
      region: input.region,
      plan: "free",
    }),
  });
  if (typeof payload.id !== "string") {
    throw new Error("Supabase created a project but did not return its project ID.");
  }
  return {
    provider: input.provider,
    projectId: payload.id,
    projectName: payload.name ?? input.projectName,
    dashboardUrl: `https://supabase.com/dashboard/project/${encodeURIComponent(payload.id)}`,
  };
}

export async function deployStaticProject(input: {
  provider: "vercel" | "netlify";
  token: string;
  projectName: string;
  files: StaticDeploymentFile[];
  resourceId?: string;
}) {
  const files = safeStaticFiles(input.files);
  const projectName = input.projectName.toLowerCase().replace(/[^a-z0-9-_]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
  if (!projectName) throw new Error("Project name is required for deployment.");

  if (input.provider === "vercel") {
    const inlineFiles = files.map(file => ({
      file: file.path,
      data: file.bytes.toString("base64"),
      encoding: "base64",
    }));
    const payload = await providerRequest("vercel", input.token, "https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(input.resourceId ? { projectId: input.resourceId } : { name: projectName }),
        files: inlineFiles,
        target: "production",
        projectSettings: { framework: null },
      }),
    });
    if (typeof payload.url !== "string") throw new Error("Vercel did not return a deployment URL.");
    return {
      provider: input.provider,
      deploymentId: payload.id,
      resourceId: typeof payload.projectId === "string" ? payload.projectId : input.resourceId,
      url: `https://${payload.url}`,
      state: payload.readyState ?? payload.state ?? "BUILDING",
    };
  }

  const digests: Record<string, string> = {};
  for (const file of files) {
    digests[`/${file.path}`] = createHash("sha1").update(file.bytes).digest("hex");
  }
  const site = input.resourceId
    ? { id: input.resourceId }
    : await providerRequest("netlify", input.token, "https://api.netlify.com/api/v1/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: projectName }),
    });
  if (typeof site.id !== "string") throw new Error("Netlify did not return a site ID.");
  const deployment = await providerRequest(
    "netlify",
    input.token,
    `https://api.netlify.com/api/v1/sites/${encodeURIComponent(site.id)}/deploys`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ files: digests }),
    },
  );
  if (typeof deployment.id !== "string") {
    throw new Error("Netlify did not return a site ID for the deployment.");
  }
  const missing = Array.isArray(deployment.required) ? deployment.required as string[] : [];
  const byDigest = new Map<string, typeof files>();
  for (const file of files) {
    const digest = createHash("sha1").update(file.bytes).digest("hex");
    byDigest.set(digest, [...(byDigest.get(digest) ?? []), file]);
  }
  const uploads: Array<() => Promise<unknown>> = [];
  for (const digest of missing) {
    const matchingFiles = byDigest.get(digest);
    if (!matchingFiles) throw new Error("Netlify requested a file that was not in the deployment.");
    for (const file of matchingFiles) {
      const encodedPath = file.path.split("/").map(encodeURIComponent).join("/");
      const uploadBody = new ArrayBuffer(file.bytes.length);
      new Uint8Array(uploadBody).set(file.bytes);
      uploads.push(() => providerRequest("netlify", input.token, `https://api.netlify.com/api/v1/deploys/${encodeURIComponent(deployment.id)}/files/${encodedPath}`, {
          method: "PUT",
          headers: { "Content-Type": "application/octet-stream" },
          body: uploadBody,
        }));
    }
  }
  const concurrentUploads = 5;
  for (let index = 0; index < uploads.length; index += concurrentUploads) {
    await Promise.all(uploads.slice(index, index + concurrentUploads).map(upload => upload()));
  }
  return {
    provider: input.provider,
    siteId: site.id,
    resourceId: site.id,
    deploymentId: deployment.id,
    url: deployment.deploy_url ?? deployment.ssl_url ?? site.ssl_url ?? site.url,
    state: deployment.state ?? "processing",
  };
}
