#!/usr/bin/env node
/**
 * Usage:
 *   npm run new-skill -- <category> <name>
 *   npm run new-skill -- git squash
 *   npm run new-skill -- react state-manager
 *
 * Creates the directory and a blank template file, then prompts you to
 * fill it in using the /skill:creator command in Claude Code.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const COMMANDS_DIR = path.join(ROOT, ".claude", "commands");

// Derived from the filesystem so this never drifts from the categories that
// actually exist under .claude/commands (a hardcoded list previously went
// stale and rejected valid categories like "docker", "sales", "trello").
const VALID_CATEGORIES = fs
  .readdirSync(COMMANDS_DIR)
  .filter((f) => fs.statSync(path.join(COMMANDS_DIR, f)).isDirectory())
  .sort();

function usage() {
  console.error(`
Usage: npm run new-skill -- <category> <name>

Categories: ${VALID_CATEGORIES.join(", ")}

Examples:
  npm run new-skill -- git squash
  npm run new-skill -- java dto-validation
  npm run new-skill -- react form-validator

Tip: after running this, open Claude Code and run:
  /skill:creator <category> <name>
to have Claude write the full skill content for you.
`);
  process.exit(1);
}

// ─── Main ────────────────────────────────────────────────────────────────────

const [, , category, name] = process.argv;

if (!category || !name) usage();

const normalizedCategory = category.toLowerCase();
const normalizedName = name.toLowerCase().replace(/\s+/g, "-");
const command = `${normalizedCategory}:${normalizedName}`;

if (!VALID_CATEGORIES.includes(normalizedCategory)) {
  console.error(`❌ Unknown category: "${normalizedCategory}"`);
  console.error(`   Valid categories: ${VALID_CATEGORIES.join(", ")}`);
  process.exit(1);
}

const templatePath = path.join(ROOT, ".claude", "commands", "_template.md");
const destDir = path.join(ROOT, ".claude", "commands", normalizedCategory);
const destPath = path.join(destDir, `${normalizedName}.md`);

if (!fs.existsSync(templatePath)) {
  console.error(`❌ Template not found: ${templatePath}`);
  process.exit(1);
}

if (fs.existsSync(destPath)) {
  console.error(`❌ Skill already exists: .claude/commands/${normalizedCategory}/${normalizedName}.md`);
  console.error(`   Delete it first if you want to regenerate it.`);
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });

const template = fs.readFileSync(templatePath, "utf-8");
fs.writeFileSync(destPath, template, "utf-8");

console.log(`
✅ Stub created!

   File:    .claude/commands/${normalizedCategory}/${normalizedName}.md
   Command: /${command}

Next step — open Claude Code chat and run:

   /skill:creator ${normalizedCategory} ${normalizedName}

Claude will ask what the skill should do and write the full content for you.
`);
