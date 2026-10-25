export interface AssistantCodeFile {
  path: string;
  content: string;
}

function normalizeFilePath(candidate: string) {
  const path = candidate.trim().replace(/^["'`]|["'`]$/g, "").replace(/\\/g, "/");
  if (
    !path
    || path.startsWith("/")
    || /^[a-z]:/i.test(path)
    || path.split("/").some(segment => !segment || segment === "." || segment === "..")
    || /(^|\/)(?:\.env(?:\.[^/]+)?|node_modules|\.git)(?:\/|$)/i.test(path)
    || /\.(?:pem|key|p12|pfx)$/i.test(path)
    || !/\.[a-z0-9]+$/i.test(path.split("/").pop() || "")
  ) {
    return null;
  }
  return path;
}

function filePathFromFenceInfo(info: string) {
  const explicitPath = info.match(/(?:filename|file|path)\s*=\s*["']?([^"'`\s]+)/i)?.[1];
  if (explicitPath) return normalizeFilePath(explicitPath);

  const pathToken = info.split(/\s+/).find(token => /\.[a-z0-9]+$/i.test(token));
  return pathToken ? normalizeFilePath(pathToken) : null;
}

function filePathBeforeFence(response: string, fenceStart: number) {
  const precedingLines = response.slice(0, fenceStart).trimEnd().split(/\r?\n/).slice(-6);
  for (let index = precedingLines.length - 1; index >= 0; index -= 1) {
    const line = precedingLines[index].trim();
    const candidate = line
      .replace(/^#{1,6}\s+/, "")
      .replace(/^(?:file|path)\s*:\s*/i, "")
      .replace(/^\*\*(.*?)\*\*$/, "$1")
      .replace(/^`(.*?)`$/, "$1")
      .trim();
    const path = normalizeFilePath(candidate);
    if (path) return path;
  }
  return null;
}

export function extractAssistantCodeBlocks(response: string) {
  const blocks: Array<{ language: string; content: string }> = [];
  const pattern = /```([^\n`]*)\r?\n?([\s\S]*?)```/g;
  for (const match of response.matchAll(pattern)) {
    const content = match[2].trim();
    if (content) {
      blocks.push({
        language: match[1].trim().split(/\s+/)[0] || "",
        content,
      });
    }
  }
  return blocks;
}

export function extractAssistantCodeFiles(response: string): AssistantCodeFile[] {
  const files: AssistantCodeFile[] = [];
  const seenPaths = new Set<string>();
  const pattern = /```([^\n`]*)\r?\n?([\s\S]*?)```/g;
  for (const match of response.matchAll(pattern)) {
    const path = filePathFromFenceInfo(match[1]) || filePathBeforeFence(response, match.index ?? 0);
    const content = match[2].trim();
    if (!path || !content || seenPaths.has(path.toLowerCase())) continue;
    seenPaths.add(path.toLowerCase());
    files.push({ path, content });
  }
  return files;
}
