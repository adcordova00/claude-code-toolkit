---
description: Generate a complete, professional README for a project.
---

# Generate Project README

## When to use

Use when starting a new project, open-sourcing an existing one, or when the README is
outdated. Pass the project name, tech stack, and purpose in `$ARGUMENTS`. Reads the codebase
structure if available to auto-populate sections.

## Instructions

Generate a README that answers these questions in order:
1. What does this do? (elevator pitch in 1-2 sentences)
2. How do I get it running? (fastest path to a working local setup)
3. How do I use it? (key commands, endpoints, or features)
4. How do I contribute? (for open source) or how is it structured? (for internal tools)

**Quality bar**
- A developer who has never seen the project must be able to run it locally in < 10 minutes
- Every command must be copy-pasteable and work on macOS and Linux
- No assumptions about environment variables — every required variable must be listed
- Links must point to real files in the repo or well-known external URLs

**Sections to include**

Always include:
- Project title + one-line description
- Prerequisites (tools, versions)
- Quick start (clone → configure → run, numbered steps)
- Environment variables table (name, required/optional, description, example value)
- Key scripts / make targets

Include if relevant:
- Architecture overview (diagram or bullet points) — for non-trivial projects
- API documentation link or quick reference
- Testing instructions
- Deployment notes
- Contributing guide
- License

**Format conventions**
- Use code blocks with language tags for all commands
- Use tables for environment variables (not prose lists)
- Keep sections scannable — bullets > paragraphs
- Badge line after title: build status, coverage, version, license

## Steps

1. Parse `$ARGUMENTS` for: project name, stack, purpose, key features
2. Read any existing config files visible in context (package.json, pom.xml, docker-compose.yml)
3. Generate the README with all applicable sections filled in
4. Use placeholder values where real values are unknown, marked with `<...>`

## Output format

Full Markdown README ready to save as `README.md`. No meta-commentary around it.
