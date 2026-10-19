import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const customerDir = path.resolve(rootDir, "CUSTOMER");
const rootVercelOutput = path.resolve(rootDir, ".vercel", "output");
const rootDist = path.resolve(rootDir, "dist");

console.log("=== CRUNCH BOX VERCEL PRODUCTION BUILD ===");
console.log(`Root: ${rootDir}`);
console.log(`Customer: ${customerDir}`);

// 1. Build CUSTOMER with NITRO_PRESET=vercel
console.log("\n[1/4] Building CUSTOMER with Nitro preset: vercel...");
const env = {
  ...process.env,
  NITRO_PRESET: "vercel",
  NODE_ENV: "production",
};

execSync("npm run build", {
  cwd: customerDir,
  env,
  stdio: "inherit",
});

// 2. Prepare root .vercel/output
console.log("\n[2/4] Syncing .vercel/output to project root...");
const customerVercelOutput = path.resolve(customerDir, ".vercel", "output");

if (!fs.existsSync(customerVercelOutput)) {
  console.error("FATAL: CUSTOMER/.vercel/output does not exist after build!");
  process.exit(1);
}

fs.rmSync(rootVercelOutput, { recursive: true, force: true });
fs.cpSync(customerVercelOutput, rootVercelOutput, { recursive: true });
console.log(`Synced to: ${rootVercelOutput}`);

// 3. Populate root dist/ as fallback for Vercel standard static deployments
console.log("\n[3/4] Mirroring static output to root dist/...");
const staticDir = path.resolve(rootVercelOutput, "static");
fs.rmSync(rootDist, { recursive: true, force: true });
if (fs.existsSync(staticDir)) {
  fs.cpSync(staticDir, rootDist, { recursive: true });
}

// 4. Verify output files
console.log("\n[4/4] Verifying Vercel Build Output API v3 structure...");
const hasConfig = fs.existsSync(path.resolve(rootVercelOutput, "config.json"));
const hasFunc = fs.existsSync(path.resolve(rootVercelOutput, "functions", "__server.func"));
const hasStatic = fs.existsSync(path.resolve(rootVercelOutput, "static"));

console.log(`- config.json: ${hasConfig ? "OK" : "MISSING"}`);
console.log(`- __server.func: ${hasFunc ? "OK" : "MISSING"}`);
console.log(`- static/: ${hasStatic ? "OK" : "MISSING"}`);

if (!hasConfig || !hasFunc) {
  console.error("Vercel Build Output API verification failed!");
  process.exit(1);
}

console.log("\n>>> VERCEL BUILD COMPLETED SUCCESSFULLY! <<<");
