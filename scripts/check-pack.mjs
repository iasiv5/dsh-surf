#!/usr/bin/env node
// Single source of truth for the npm pack contents audit.
// Consumed by both the local pre-release check (`npm run check:pack`) and
// the "Assert npm pack contents" step in .github/workflows/release.yml.
// When package.json `files` changes, update WANT here in the same commit.
import { execFileSync } from "node:child_process";

const WANT = [
  "LICENSE",
  "README.md",
  "cordis.patch.yml",
  "deploy/Dockerfile",
  "deploy/autostart",
  "deploy/docker-compose.example.yml",
  "deploy/reverse-proxy.md",
  "icon.svg",
  "lib/client.js",
  "lib/index.js",
  "package.json",
].sort();

const raw = execFileSync("npm", ["pack", "--dry-run", "--json"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "ignore"],
});
const parsed = JSON.parse(raw);
const got = (parsed[0] || parsed).files.map((f) => f.path).sort();

if (JSON.stringify(got) !== JSON.stringify(WANT)) {
  console.error("PACK-MISMATCH");
  console.error("  got: ", JSON.stringify(got));
  console.error("  want:", JSON.stringify(WANT));
  process.exit(1);
}
console.log("PACK-EXACT");
