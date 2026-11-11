#!/usr/bin/env node
/**
 * Validates that all skill files have required frontmatter.
 * Usage: npm run validate-skills
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMMANDS_DIR = path.resolve(__dirname, "..", ".claude", "commands");

let errors = 0;
let checked = 0;

const categories = fs
  .readdirSync(COMMANDS_DIR)
  .filter((f) => fs.statSync(path.join(COMMANDS_DIR, f)).isDirectory())
  .sort();

for (const category of categories) {
  const categoryDir = path.join(COMMANDS_DIR, category);
  const skills = fs
    .readdirSync(categoryDir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .sort();

  for (const file of skills) {
    const filePath = path.join(categoryDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const command = `/${category}:${file.replace(".md", "")}`;
    checked++;

    // Check frontmatter exists
    if (!content.startsWith("---")) {
      console.error(`❌ ${command}: missing frontmatter (file must start with ---)`);
      errors++;
      continue;
    }

    // Check description field
    if (!content.match(/^description:\s*.+$/m)) {
      console.error(`❌ ${command}: missing or empty 'description' in frontmatter`);
      errors++;
    }

    // Check description is not the template placeholder
    if (content.includes("One-sentence description shown in Claude Code's command picker.")) {
      console.error(`❌ ${command}: description is still the template placeholder — fill it in`);
      errors++;
    }

    // Check description is not the new-skill placeholder
    if (content.includes("TODO: describe what")) {
      console.error(`❌ ${command}: description has not been filled in yet`);
      errors++;
    }

    // Check required sections exist
    const sections = ["## When to use", "## Instructions", "## Output format"];
    for (const section of sections) {
      if (!content.includes(section)) {
        console.warn(`⚠️  ${command}: missing section "${section}"`);
      }
    }
  }
}

console.log(`\nValidated ${checked} skills across ${categories.length} categories`);

if (errors > 0) {
  console.error(`\n${errors} error(s) found — fix them before committing\n`);
  process.exit(1);
} else {
  console.log(`✅ All skills valid\n`);
}
