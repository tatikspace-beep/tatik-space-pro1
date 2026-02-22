/**
 * server/_init-aliases.ts
 * MUST be imported first in any backend file that uses @shared imports
 * Registers module aliases for runtime resolution
 */

import moduleAlias from "module-alias";
import path from "path";

// Get the root directory (tatik-space-pro_PRO_FINAL/)
const projectRoot = path.resolve(__dirname, "..");

// Register aliases
moduleAlias.addAliases({
  "@shared": path.join(projectRoot, "shared"),
  "@": path.join(projectRoot, "client/src"),
});

console.log("[Module Init] Aliases registered");
