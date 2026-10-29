import type { AssistantProjectMove } from "./assistantCodeFiles";
import { normalizeAssistantProjectPath, type AssistantProjectFile } from "./assistantProjectContext";

export interface AssistantGeneratedFile {
  path: string;
  content: string;
}

export interface AssistantProjectReferenceIssue {
  sourcePath: string;
  reference: string;
  reason: "missing" | "stale";
}

function canonicalPath(path: string) {
  return normalizeAssistantProjectPath(path)?.toLocaleLowerCase() || null;
}

function localReferences(path: string, content: string) {
  const references = new Set<string>();
  const patterns: Array<{ pattern: RegExp; index: number; moduleOnly?: boolean }> = [
    { pattern: /(?:href|src|poster|action)\s*=\s*["']([^"']+)["']/gi, index: 1 },
    { pattern: /url\(\s*(['"]?)(.*?)\1\s*\)/gi, index: 2 },
    { pattern: /@import\s+(?:url\()?['"]([^'"]+)['"]/gi, index: 1 },
    { pattern: /(?:from\s*|import\s*\(\s*)["']([^"']+)["']/gi, index: 1, moduleOnly: true },
  ];

  for (const { pattern, index, moduleOnly } of patterns) {
    for (const match of content.matchAll(pattern)) {
      const reference = match[index]?.trim();
      if (!reference || reference.startsWith("#") || reference.startsWith("//")
        || /^(?:[a-z][a-z\d+.-]*:|data:)/i.test(reference)) continue;
      if (moduleOnly && !reference.startsWith(".") && !reference.startsWith("/")) continue;
      references.add(reference);
    }
  }
  return Array.from(references);
}

function resolveProjectPath(sourcePath: string, reference: string) {
  let pathname: string;
  try {
    pathname = decodeURIComponent(reference.split(/[?#]/, 1)[0].replace(/\\/g, "/"));
  } catch {
    pathname = reference.split(/[?#]/, 1)[0].replace(/\\/g, "/");
  }
  if (!pathname) return null;

  const segments = pathname.startsWith("/")
    ? []
    : normalizeAssistantProjectPath(sourcePath)?.split("/").slice(0, -1) || [];
  for (const segment of pathname.split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") {
      if (segments.length === 0) return null;
      segments.pop();
      continue;
    }
    segments.push(segment);
  }
  return segments.join("/");
}

export function validateAssistantProjectReferences(
  existingFiles: AssistantProjectFile[],
  generatedFiles: AssistantGeneratedFile[],
  moves: AssistantProjectMove[],
): AssistantProjectReferenceIssue[] {
  const movedSources = new Map(
    moves.map(move => [canonicalPath(move.fromPath), move.toPath] as const),
  );
  const availablePaths = new Set<string>();
  for (const file of existingFiles) {
    const path = canonicalPath(file.path);
    if (path && !movedSources.has(path)) availablePaths.add(path);
  }
  for (const move of moves) {
    const path = canonicalPath(move.toPath);
    if (path) availablePaths.add(path);
  }
  for (const file of generatedFiles) {
    const path = canonicalPath(file.path);
    if (path) availablePaths.add(path);
  }

  const issues: AssistantProjectReferenceIssue[] = [];
  for (const file of generatedFiles) {
    for (const reference of localReferences(file.path, file.content)) {
      const resolved = resolveProjectPath(file.path, reference);
      if (!resolved) {
        issues.push({ sourcePath: file.path, reference, reason: "missing" });
        continue;
      }

      const target = canonicalPath(resolved);
      const directoryIndex = [`${resolved.replace(/\/+$/, "")}/index.html`, `${resolved.replace(/\/+$/, "")}/index.htm`];
      if (!target || movedSources.has(target)) {
        issues.push({ sourcePath: file.path, reference, reason: "stale" });
      } else if (!availablePaths.has(target) && !directoryIndex.some(path => {
        const canonicalIndex = canonicalPath(path);
        return canonicalIndex !== null && availablePaths.has(canonicalIndex);
      })) {
        issues.push({ sourcePath: file.path, reference, reason: "missing" });
      }
    }
  }
  return issues;
}
