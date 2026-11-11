# claude-code-toolkit — AI Engineering Toolkit

An AI engineering toolkit repository, kept open as the primary VS Code workspace. Other project
folders are added via "Add Folder to Workspace", making these skills available to Claude Code
across all open projects simultaneously.

## Repository purpose

- **`.claude/commands/`** — 50 reusable slash-command skills for senior full-stack development
- **`.claude/settings.json`** — permissions plus two working hooks (memory sync, branch guard)
- **`.mcp.json`** — MCP server configurations (GitHub, Playwright, PostgreSQL, Redis, Datadog, Google Maps, etc.)
- **`mcp/datadog/`** — Custom Datadog MCP server (TypeScript)
- **`agents/`** — Playwright automation agents for E2E testing, site monitoring, and workflow automation
- **`agentic-memory/`** — working memory where skills write their long-form output (gitignored; see its README)

## How skills work

Skills in `.claude/commands/<category>/<skill>.md` are available as `/category:skill` in Claude Code chat.

```
/git:commit          → Generate conventional commit message
/java:scaffold       → Scaffold Spring Boot controller/service/repo
/testing:playwright  → Generate Playwright E2E tests
```

Each project's own `.claude/commands/` provides project-specific skills. Claude Code sees both
this repo's skills and the project's skills when running in a multi-root workspace.

## Skill authoring guide

To add a new skill:

1. Copy `.claude/commands/_template.md` to `.claude/commands/<category>/<name>.md`
2. Fill in the `description` frontmatter (one sentence, shown in the command picker)
3. Write the skill body in plain Markdown — instructions, steps, output format, examples
4. Keep skills self-contained: they must work without referencing files in this repo

**Naming convention:** `<verb>-<noun>.md` or just `<noun>.md` for simple skills.
The command becomes `/<category>:<filename-without-extension>`.

**Quality bar:** Every skill should be production-grade. Think: what would a senior engineer
or tech lead want the AI to do when they invoke this? Be specific, opinionated, and complete.

## Working memory

Several skills write their output to `agentic-memory/` at the repo root rather than returning it
in chat, so it survives across sessions. The folder's contents are gitignored — it is where
project-specific and client-specific documents accumulate. Read
[agentic-memory/README.md](agentic-memory/README.md) before touching anything that writes there:
the flat-layout and filename conventions are a contract the sync hook depends on.

## Cursor compatibility

Skill files are plain Markdown and can be used with Cursor by copying them to `.cursor/rules/`
and adding `globs` and `alwaysApply: false` to the frontmatter. The skill body does not change.

## MCP setup

All MCP servers are configured in `.mcp.json` at the repo root (project-scoped, version-controlled).
Note: Claude Code does **not** read `mcpServers` from `.claude/settings.json` — that file is for
permissions, hooks and other settings only. Required env vars:

| MCP | Required env vars |
|-----|------------------|
| GitHub | `GITHUB_TOKEN` |
| PostgreSQL | `POSTGRES_URL` |
| Redis | `REDIS_HOST`, `REDIS_PASSWORD` |
| Datadog (custom) | `DD_API_KEY`, `DD_APP_KEY` |
| Google Drive & Docs | `GOOGLE_CREDENTIALS_PATH` (OAuth2 JSON) |
| Google Slides | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` |
| Google Maps | `GOOGLE_MAPS_API_KEY` (Places API enabled in Google Cloud) |
| Trello | `TRELLO_API_KEY`, `TRELLO_TOKEN`, `TRELLO_BOARD_ID` |
| Playwright, Filesystem, Fetch, draw.io, Canva | none |

Copy `.env.example` to `.env` (never commit it) and fill in your values.
The custom Datadog MCP must be built first: `cd mcp/datadog && npm install && npm run build`

**Known issue (VS Code extension):** `${VAR}` substitution in `.mcp.json` from a project `.env`
file is unreliable when running Claude Code as the VS Code extension (works fine in the
standalone CLI or Cursor — see [anthropics/claude-code#14032](https://github.com/anthropics/claude-code/issues/14032),
closed as not planned). If a server fails to authenticate even with `.env` filled in, set the
same variables as real OS user environment variables instead.

After editing `.mcp.json`, fully quit and reopen VS Code (window reload is not enough) for the
new server to appear in `/mcp`.

## Commit convention for this repo

```
skill(category): add <skill-name>
skill(category): update <skill-name>
mcp: add <server-name>
agent: <change description>
```
