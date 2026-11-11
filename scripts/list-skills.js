#!/usr/bin/env node
/**
 * Lists all skills with their descriptions.
 * Usage: npm run list-skills
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMMANDS_DIR = path.resolve(__dirname, "..", ".claude", "commands");

function extractDescription(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const match = content.match(/^description:\s*(.+)$/m);
  return match ? match[1].trim() : "(no description)";
}

const categories = fs
  .readdirSync(COMMANDS_DIR)
  .filter((f) => fs.statSync(path.join(COMMANDS_DIR, f)).isDirectory())
  .sort();

let total = 0;

console.log("\n📚 claude-code-toolkit skills\n");
console.log("Command".padEnd(36) + "Description");
console.log("─".repeat(90));

for (const category of categories) {
  const categoryDir = path.join(COMMANDS_DIR, category);
  const skills = fs
    .readdirSync(categoryDir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .sort();

  for (const file of skills) {
    const name = file.replace(".md", "");
    const command = `/${category}:${name}`;
    const desc = extractDescription(path.join(categoryDir, file));
    console.log(command.padEnd(36) + desc.slice(0, 54));
    total++;
  }
}

console.log("─".repeat(90));
console.log(`\n${total} skills across ${categories.length} categories\n`);
