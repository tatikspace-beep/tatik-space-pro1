/**
 * Initialize module aliases for Vercel serverless environment
 * This MUST be required before any other imports
 */

const moduleAlias = require("module-alias");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");

moduleAlias.addAliases({
  "@shared": path.join(projectRoot, "shared"),
  "@": path.join(projectRoot, "client/src"),
});

console.log("[API Init] Module aliases registered at runtime");
console.log("[API Init] @shared -> " + path.join(projectRoot, "shared"));
console.log("[API Init] @ -> " + path.join(projectRoot, "client/src"));
