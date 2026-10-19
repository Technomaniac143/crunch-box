import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const kitchenDir = path.resolve(__dirname, "..");
const vercelOutput = path.resolve(kitchenDir, ".vercel", "output");
const distDir = path.resolve(kitchenDir, "dist");

console.log("=== CRUNCH BOX KITCHEN VERCEL PRODUCTION BUILD ===");
console.log(`Kitchen Dir: ${kitchenDir}`);

// 1. Build KITCHEN with NITRO_PRESET=vercel
console.log("\n[1/3] Building KITCHEN with Nitro preset: vercel...");
const env = {
  ...process.env,
  NITRO_PRESET: "vercel",
  NODE_ENV: "production",
};

execSync("npx vite build", {
  cwd: kitchenDir,
  env,
  stdio: "inherit",
});

// 2. Populate dist/ from .vercel/output/static as static fallback if needed
console.log("\n[2/3] Populating dist/ mirror...");
const staticDir = path.resolve(vercelOutput, "static");
fs.rmSync(distDir, { recursive: true, force: true });
if (fs.existsSync(staticDir)) {
  fs.cpSync(staticDir, distDir, { recursive: true });
}

// 3. Verify Vercel Build Output API v3 structure
console.log("\n[3/3] Verifying Vercel Build Output API v3 structure...");
const hasConfig = fs.existsSync(path.resolve(vercelOutput, "config.json"));
const hasFunc = fs.existsSync(path.resolve(vercelOutput, "functions", "__server.func"));
const hasStatic = fs.existsSync(path.resolve(vercelOutput, "static"));

console.log(`- config.json: ${hasConfig ? "OK" : "MISSING"}`);
console.log(`- __server.func: ${hasFunc ? "OK" : "MISSING"}`);
console.log(`- static/: ${hasStatic ? "OK" : "MISSING"}`);

if (!hasConfig || !hasFunc) {
  console.error("Vercel Build Output API verification failed for Kitchen!");
  process.exit(1);
}

console.log("\n>>> KITCHEN VERCEL BUILD COMPLETED SUCCESSFULLY! <<<");
