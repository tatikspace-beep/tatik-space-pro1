export interface AssistantCodeFile {
  path: string;
  content: string;
}

export interface AssistantProjectMove {
  fromPath: string;
  toPath: string;
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

export function hasAssistantProjectOperationsBlock(response: string) {
  return /```tatik-project-operations(?:\s|\r?\n)/i.test(response);
}

export function extractAssistantProjectMoves(response: string): AssistantProjectMove[] {
  const blocks = Array.from(response.matchAll(/```tatik-project-operations\s*\r?\n([\s\S]*?)```/gi));
  if (blocks.length === 0) {
    if (hasAssistantProjectOperationsBlock(response)) {
      throw new Error("Il piano di spostamento dei file non è formattato correttamente.");
    }
    return [];
  }
  if (blocks.length !== 1) {
    throw new Error("La risposta deve contenere un solo piano di spostamento dei file.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(blocks[0][1]);
  } catch {
    throw new Error("Il piano di spostamento dei file non contiene JSON valido.");
  }
  if (!parsed || typeof parsed !== "object" || !("moves" in parsed) || !Array.isArray(parsed.moves)) {
    throw new Error("Il piano di spostamento deve contenere un elenco moves.");
  }
  if (parsed.moves.length > 20) {
    throw new Error("È possibile spostare al massimo 20 file per volta.");
  }

  const sources = new Set<string>();
  const destinations = new Set<string>();
  return parsed.moves.map((move): AssistantProjectMove => {
    if (!move || typeof move !== "object" || !("fromPath" in move) || !("toPath" in move)
      || typeof move.fromPath !== "string" || typeof move.toPath !== "string") {
      throw new Error("Ogni spostamento deve specificare fromPath e toPath.");
    }
    const fromPath = normalizeFilePath(move.fromPath);
    const toPath = normalizeFilePath(move.toPath);
    if (!fromPath || !toPath) {
      throw new Error("Il piano contiene un percorso file non valido.");
    }

    const sourceKey = fromPath.toLowerCase();
    const destinationKey = toPath.toLowerCase();
    if (sourceKey === destinationKey || sources.has(sourceKey) || destinations.has(destinationKey)) {
      throw new Error("Il piano contiene percorsi di origine o destinazione duplicati.");
    }
    sources.add(sourceKey);
    destinations.add(destinationKey);
    return { fromPath, toPath };
  });
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
      .replace(/^(?:\d+\uFE0F?\u20E3|\d+[.)])\s+/, "")
      .replace(/^(?:file|path)\s*:\s*/i, "")
      .replace(/^\*\*(.*?)\*\*$/, "$1")
      .replace(/^`(.*?)`$/, "$1")
      .trim();
    const path = normalizeFilePath(candidate);
    if (path) return path;
  }
  return null;
}

function isProjectOperationsFence(info: string) {
  return /^tatik-project-operations(?:\s|$)/i.test(info.trim());
}

export function extractAssistantCodeBlocks(response: string) {
  const blocks: Array<{ language: string; content: string }> = [];
  const pattern = /```([^\n`]*)\r?\n?([\s\S]*?)```/g;
  for (const match of response.matchAll(pattern)) {
    if (isProjectOperationsFence(match[1])) continue;
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
    if (isProjectOperationsFence(match[1])) continue;
    const path = filePathFromFenceInfo(match[1]) || filePathBeforeFence(response, match.index ?? 0);
    const content = match[2].trim();
    if (!path || !content || seenPaths.has(path.toLowerCase())) continue;
    seenPaths.add(path.toLowerCase());
    files.push({ path, content });
  }
  return files;
}

export function findUnverifiedGoogleMapEmbeds(files: AssistantCodeFile[], sourceContext: string) {
  const source = decodeMapValue(sourceContext).toLowerCase();
  const flaggedPaths = new Set<string>();

  for (const file of files) {
    const iframePattern = /<iframe\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
    for (const match of file.content.matchAll(iframePattern)) {
      const url = decodeMapValue(match[1]);
      if (!/google\.[^/]+\/maps/i.test(url)) continue;

      const coordinates = [
        ...url.matchAll(/!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/gi),
        ...url.matchAll(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/gi),
      ];
      const hasUnverifiedCoordinates = coordinates.some(coordinate =>
        !source.includes(coordinate[1].toLowerCase()) || !source.includes(coordinate[2].toLowerCase()),
      );
      const placeIds = [...url.matchAll(/!1s(0x[0-9a-f]+(?::0x[0-9a-f]+)?)/gi)];
      const hasUnverifiedPlaceId = placeIds.some(placeId => !source.includes(placeId[1].toLowerCase()));
      let hasUnverifiedEmbedApiKey = false;
      if (/\/maps\/embed\/v1\//i.test(url)) {
        const apiKey = new URL(url, "https://www.google.com").searchParams.get("key")?.trim();
        hasUnverifiedEmbedApiKey = !apiKey
          || /^(?:YOUR|REPLACE|INSERT|ADD|API_KEY|MAPS_API_KEY)/i.test(apiKey)
          || !source.includes(apiKey.toLowerCase());
      }

      if (hasUnverifiedCoordinates || hasUnverifiedPlaceId || hasUnverifiedEmbedApiKey) {
        flaggedPaths.add(file.path);
      }
    }
  }

  return [...flaggedPaths];
}

function decodeMapValue(value: string) {
  try {
    return decodeURIComponent(value);
  } catch (error) {
    if (error instanceof URIError) return value;
    throw error;
  }
}
