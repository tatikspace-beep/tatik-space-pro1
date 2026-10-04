export type MarketplaceScanStatus = "passed" | "review" | "blocked";
export type MarketplaceScanFinding = {
  code: string;
  severity: "review" | "blocked";
  message: string;
};
export type MarketplaceScanResult = {
  status: MarketplaceScanStatus;
  findings: MarketplaceScanFinding[];
};

type SourceFile = { name: string; content: string };

const MAX_MARKETPLACE_UPLOAD_BYTES = 2 * 1024 * 1024;
const SUPPORTED_SOURCE_FILE = /\.(html?|css|[cm]?js|jsx|tsx?|json|md|txt|xml|svg|py|sql)$/i;

function getSourceFiles(fileName: string, content: string): SourceFile[] {
  if (!fileName || /[\\/]/.test(fileName) || !SUPPORTED_SOURCE_FILE.test(fileName)) {
    throw new Error("Nome o formato del file non supportato.");
  }

  if (!fileName.toLowerCase().endsWith(".json")) return [{ name: fileName, content }];

  let manifest: unknown;
  try {
    manifest = JSON.parse(content);
  } catch {
    return [{ name: fileName, content }];
  }
  if (!manifest || typeof manifest !== "object" || !("format" in manifest) ||
    (manifest as { format?: unknown }).format !== "tatik-project-v1") {
    return [{ name: fileName, content }];
  }

  const files = (manifest as { files?: unknown }).files;
  if (!Array.isArray(files) || files.length === 0 || files.length > 100) {
    throw new Error("Il progetto deve contenere da 1 a 100 file.");
  }

  return files.map((file): SourceFile => {
    if (!file || typeof file !== "object" || !("name" in file) || !("content" in file) ||
      typeof file.name !== "string" || typeof file.content !== "string") {
      throw new Error("Manifest progetto non valido.");
    }
    const name = file.name as string;
    const path = "path" in file && typeof file.path === "string" ? file.path as string : name;
    if (!name || !SUPPORTED_SOURCE_FILE.test(name) || path.startsWith("/") ||
      /^[a-z]:/i.test(path) || path.split(/[\\/]/).some((part: string) => part === "..")) {
      throw new Error("Il progetto contiene un percorso o formato di file non supportato.");
    }
    return { name, content: file.content as string };
  });
}

export function scanMarketplaceTemplate(fileName: string, content: string): MarketplaceScanResult {
  const findings: MarketplaceScanFinding[] = [];
  const addFinding = (code: string, severity: MarketplaceScanFinding["severity"], message: string) => {
    if (!findings.some((finding) => finding.code === code)) findings.push({ code, severity, message });
  };

  if (Buffer.byteLength(content, "utf8") > MAX_MARKETPLACE_UPLOAD_BYTES) {
    throw new Error("Il contenuto supera il limite di 2 MB.");
  }

  const files = getSourceFiles(fileName, content);
  if (files.some((file) => file.content.includes("\0"))) {
    addFinding("binary-content", "blocked", "Rilevato contenuto binario non supportato.");
  }

  for (const file of files) {
    const source = file.content;
    if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{30,}|sk_live_[A-Za-z0-9]{16,}/i.test(source) ||
      /\b(?:api[_-]?key|secret|access[_-]?token)\b\s*[:=]\s*["'][A-Za-z0-9_./+-]{24,}["']/i.test(source)) {
      addFinding("possible-secret", "blocked", "Possibile chiave privata o credenziale incorporata: rimuovila e ruotala se reale.");
    }

    if (/(?:coinhive|cryptonight|webminerpool|xmrig)/i.test(source)) {
      addFinding("known-cryptominer", "blocked", "Rilevato codice o riferimento associato a software di mining non autorizzato.");
    }

    const collectsCredentials = /type\s*=\s*["']password["']|autocomplete\s*=\s*["'](?:current-password|new-password)["']|\bpassword\b/i.test(source);
    const sendsData = /\bfetch\s*\(|\bXMLHttpRequest\b|\bsendBeacon\s*\(|\baxios\.(?:post|put|patch)\s*\(/i.test(source);
    if (collectsCredentials && sendsData) {
      addFinding("credential-network-pattern", "review", "Modulo che tratta password e invia dati in rete: verificare che l'invio sia verso il servizio previsto.");
    }

    if (/\beval\s*\(\s*(?:atob|decodeURIComponent|String\.fromCharCode)|new\s+Function\s*\(\s*(?:atob|decodeURIComponent)|\b(?:atob|Buffer\.from)\s*\([^)]{0,80}base64[^)]*\)[\s\S]{0,120}\b(?:eval|new\s+Function)\b/i.test(source) ||
      /(?:[A-Za-z0-9+/]{500,}={0,2})/.test(source)) {
      addFinding("obfuscated-executable-code", "review", "Codice eseguibile offuscato o payload codificato: richiede un controllo aggiuntivo.");
    }
    if (/\beval\s*\(|new\s+Function\s*\(|\b(?:child_process|execSync|spawnSync)\b/i.test(source)) {
      addFinding("dynamic-or-system-execution", "review", "Rilevata esecuzione dinamica o accesso a processi di sistema.");
    }
  }

  const status: MarketplaceScanStatus = findings.some((finding) => finding.severity === "blocked")
    ? "blocked"
    : findings.length > 0 ? "review" : "passed";
  return { status, findings };
}
