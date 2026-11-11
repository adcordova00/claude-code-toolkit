# claude-code-toolkit

An AI engineering toolkit for Claude Code: **50 slash-command skills**, MCP server
configurations, two working hooks, a custom Datadog MCP server, and standalone Playwright
automation agents.

Keep it open as the primary VS Code workspace — add project folders with "Add Folder to
Workspace" to make every skill available across all your projects at once.

> **Published as study material.** This is a sanitized mirror of a toolkit used in day-to-day
> work. Everything project- and client-specific has been stripped: the `agentic-memory/` folder
> ships empty (its contents are gitignored), and the product names in skill examples are
> placeholders (`AcmeShop`, `AcmeBooking`). No credentials are committed — `.env.example`
> documents every variable you need to supply yourself.

## Quick start

```bash
git clone https://github.com/adcordova00/claude-code-toolkit.git
cd claude-code-toolkit
bash scripts/setup.sh      # interactive .env wizard
bash scripts/docker-up.sh  # pull Docker images + build Datadog MCP
```

Open in VS Code, then add your project folder: **File → Add Folder to Workspace**.

---

## Setup scripts

| Script | Purpose |
|--------|---------|
| `bash scripts/setup.sh` | First-time interactive `.env` creator — prompts per integration |
| `bash scripts/add-integration.sh` | Add or update a single integration in an existing `.env` |
| `bash scripts/docker-up.sh` | Pull MCP Docker images, build custom Datadog MCP, validate env vars |

---

## Environment variables

Copy `.env.example` to `.env` (never commit it). Only the vars for integrations you use are required.

| Variable | Integration | Required | Example |
|----------|-------------|----------|---------|
| `GITHUB_TOKEN` | GitHub MCP | if using GitHub MCP | `ghp_abc123...` |
| `GOOGLE_CREDENTIALS_PATH` | Google Drive MCP | if using Google Drive | `.credentials/google.json` |
| `POSTGRES_URL` | PostgreSQL MCP | if using PostgreSQL MCP | `postgresql://user:pass@localhost:5432/db` |
| `REDIS_HOST` | Redis MCP | if using Redis MCP | `localhost` |
| `REDIS_PORT` | Redis MCP | optional | `6379` |
| `REDIS_PASSWORD` | Redis MCP | if auth enabled | `secret` |
| `DD_API_KEY` | Datadog custom MCP | if using Datadog MCP | `abc123...` |
| `DD_APP_KEY` | Datadog custom MCP | if using Datadog MCP | `def456...` |
| `DD_SITE` | Datadog custom MCP | optional | `datadoghq.com` |
| `STAGING_URL` | Playwright agents | if using e2e-staging | `https://staging.yourapp.com` |
| `MONITORED_URLS` | Playwright agents | if using site-monitor | `https://yourapp.com` |
| `SLACK_WEBHOOK_URL` | Playwright agents | optional | `https://hooks.slack.com/...` |

---

## MCP servers

Configured in [.mcp.json](.mcp.json) at the repo root (project-scoped, version-controlled).
Claude Code does **not** read `mcpServers` from `.claude/settings.json` — that file is for
permissions and hooks.

| MCP | What it gives Claude | Required env vars |
|-----|---------------------|------------------|
| GitHub | Read/write issues, PRs, repos, Actions | `GITHUB_TOKEN` |
| Playwright | Browser automation and E2E testing | — |
| PostgreSQL | Query and inspect PostgreSQL databases | `POSTGRES_URL` |
| Redis | Read/write Redis cache | `REDIS_HOST`, `REDIS_PASSWORD` |
| Filesystem | Read/write files on disk | — |
| Fetch | Fetch web pages and APIs | — |
| draw.io | Create and edit diagrams (flowcharts, ER, UML, etc.) | — |
| Google Drive & Docs | Create and edit Google Docs/Sheets | `GOOGLE_CREDENTIALS_PATH` (OAuth2 JSON) |
| Google Slides | Build presentations programmatically | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` |
| Google Maps | Search local businesses by category + city (Places API) | `GOOGLE_MAPS_API_KEY` |
| Trello | Read and write cards, lists, checklists, labels | `TRELLO_API_KEY`, `TRELLO_TOKEN`, `TRELLO_BOARD_ID` |
| Canva | Generate and edit designs | OAuth (in-app) |
| Datadog (custom) | Query metrics, logs, monitors, incidents | `DD_API_KEY`, `DD_APP_KEY` |

After editing `.mcp.json`, fully quit and reopen VS Code — a window reload is not enough for a
new server to appear in `/mcp`.

**Build the custom Datadog MCP before first use:**
```bash
cd mcp/datadog && npm install && npm run build
```

**Google Drive MCP — one-time auth:**
1. Create OAuth2 credentials at [console.cloud.google.com](https://console.cloud.google.com) (Desktop app type)
2. Download the JSON and place it at the path in `GOOGLE_CREDENTIALS_PATH`
3. Run `/mcp` in Claude Code chat → select **claude.ai Google Drive** → authenticate

---

## Skills reference

Type `/` in Claude Code chat to see all available commands. Skills are organized by namespace:

### `/git:*` — Git workflows

| Command | Description |
|---------|-------------|
| `/git:commit` | Generate conventional commit message from staged changes |
| `/git:pr` | Generate complete PR description from branch diff vs main |
| `/git:review` | Review a diff for bugs, style issues, and security problems |
| `/git:changelog` | Generate CHANGELOG entry from commits since last tag |
| `/git:branch` | Suggest branch name from ticket or description |

### `/react:*` — React / JavaScript

| Command | Description |
|---------|-------------|
| `/react:review` | Review React component for correctness and modern patterns |
| `/react:hooks` | Audit custom hooks for dependency arrays and correctness |
| `/react:refactor` | Refactor component to modern patterns without behavior change |
| `/react:a11y` | Audit component for WCAG 2.1 AA compliance |
| `/react:perf` | Analyze render performance and optimization opportunities |
| `/react:react-doctor-reviewer` | Run react-doctor diagnostics and auto-apply suggested fixes |
| `/react:zod-validator` | Add Zod validation schema + field errors to a React form |

### `/java:*` — Java / Spring Boot

| Command | Description |
|---------|-------------|
| `/java:scaffold` | Scaffold Controller + Service + Repository + DTO + Mapper |
| `/java:review` | Review Java/Spring Boot code for idioms and correctness |
| `/java:jpa` | Audit JPA entities and queries for N+1 and fetch strategy issues |
| `/java:errors` | Design global exception handler with RFC 9457 ProblemDetail |
| `/java:api` | Review REST API design for consistency and HTTP semantics |

### `/testing:*` — Testing

| Command | Description |
|---------|-------------|
| `/testing:jest` | Generate Jest + React Testing Library tests |
| `/testing:playwright` | Generate Playwright E2E test with page objects |
| `/testing:junit` | Generate JUnit 5 + Mockito unit tests |
| `/testing:review` | Review test quality and find false-confidence anti-patterns |
| `/testing:coverage` | Identify untested code paths and suggest high-value test cases |
| `/testing:playwright-debuger` | Open browser, reproduce a bug, diagnose root cause from dev tools |

### `/docker:*` — Docker

| Command | Description |
|---------|-------------|
| `/docker:deploy-service` | Build a Docker image from source and recreate the running container via docker compose |

### `/ci-cd:*` — CI/CD (GitHub Actions)

| Command | Description |
|---------|-------------|
| `/ci-cd:workflow` | Generate GitHub Actions workflow for React or Spring Boot |
| `/ci-cd:review` | Review workflow for security vulnerabilities and efficiency |
| `/ci-cd:docker` | Review Dockerfile for security, size, and build efficiency |
| `/ci-cd:deploy` | Generate pre-deployment checklist tailored to the service |

### `/monitoring:*` — Observability

| Command | Description |
|---------|-------------|
| `/monitoring:datadog` | Generate Datadog monitor from SLO description |
| `/monitoring:actuator` | Review Spring Boot Actuator configuration |
| `/monitoring:alerts` | Design complete alerting strategy for a service |
| `/monitoring:runbook` | Generate incident runbook for an alert or service |

### `/database:*` — Database

| Command | Description |
|---------|-------------|
| `/database:sql` | Review PostgreSQL query for correctness and performance |
| `/database:migration` | Generate safe Flyway/Liquibase migration |
| `/database:redis` | Design Redis caching strategy (TTL, eviction, invalidation) |
| `/database:indexes` | Analyze access patterns and recommend optimal indexes |

### `/docs:*` — Documentation

| Command | Description |
|---------|-------------|
| `/docs:readme` | Generate complete project README |
| `/docs:openapi` | Generate OpenAPI 3.1 spec from Spring Boot controllers |
| `/docs:adr` | Write Architecture Decision Record in MADR format |
| `/docs:spec` | Write technical specification for a feature |
| `/docs:diseñar-arquitectura` | Turn requirements into a full, opinionated technical architecture document |
| `/docs:generar-requerimientos` | Produce an IEEE 830 software requirements spec (SRS) in Google Drive |

### `/security:*` — Security

| Command | Description |
|---------|-------------|
| `/security:audit` | Audit code for OWASP Top 10 vulnerabilities |
| `/security:deps` | Audit dependencies for known CVEs |
| `/security:secrets` | Scan codebase for hardcoded secrets and credentials |

### `/design:*` — UI prototyping

| Command | Description |
|---------|-------------|
| `/design:prototype` | Prototype a component, screen, or flow as paired web + mobile Artifacts |

### `/trello:*` — Backlog management

| Command | Description |
|---------|-------------|
| `/trello:crear-tarea` | Create a card with description, checklist, and label via the Trello MCP |
| `/trello:leer-tarea` | Read a card by URL and turn it into an actionable implementation plan |

### `/sales:*` — Outbound sales

| Command | Description |
|---------|-------------|
| `/sales:marketing-canva` | Generate a campaign set (post, story, banner) in Canva with a consistent brand kit |

### `/skill:*` — Skill management

| Command | Description |
|---------|-------------|
| `/skill:creator <category> <name>` | Create a new production-grade skill interactively |

---

## Adding a new skill

```bash
npm run new-skill <category> <name>   # scaffolds the .md file
# then invoke:
/skill:creator <category> <name>      # Claude writes the skill content
```

Valid categories: `git`, `react`, `java`, `testing`, `ci-cd`, `monitoring`, `database`, `docs`, `security`, `skill`, `docker`, `design`, `sales`, `trello`

Skills live in `.claude/commands/<category>/<name>.md` and are immediately available as `/<category>:<name>`.

---

## Adding project-specific skills

In your project, create `.claude/commands/<category>/<skill>.md`. Claude Code sees both this
repo's skills and your project's skills simultaneously in a multi-root workspace.

```markdown
---
description: Scaffold a new feature module following this project's conventions.
---
# Scaffold Feature Module
...
```

---

## Playwright agents

Standalone Node.js/TypeScript agents for automation:

| Agent | Purpose | Run |
|-------|---------|-----|
| `e2e-staging` | E2E test suites against staging | `npm run e2e -- --suite=smoke` |
| `site-monitor` | Availability + content + perf monitoring | `npm run monitor` |
| `workflow-automator` | Declarative YAML-driven browser automation | `npm run automate -- --workflow=./workflows/my-flow.yaml` |

```bash
cd agents/<agent-name>
npm install
npm run <command>
```

---

## Hooks

[.claude/settings.json](.claude/settings.json) registers two hooks worth reading as examples,
since they solve problems skills alone cannot:

| Hook | Event | What it does |
|------|-------|--------------|
| Memory sync | `PostToolUse` on `Write`/`Edit` scoped to `agentic-memory/*` | Spawns an agent that writes a one-line pointer into Claude Code's auto-memory, so a later session knows the document exists without reading the repo |
| Branch guard | `PreToolUse` on `Bash` | Inspects the command; if it is a `git commit`/`git push` while on the default branch, returns `permissionDecision: ask` to force an explicit confirmation |

The branch guard is a PowerShell one-liner that reads the tool call as JSON on stdin and emits
a `hookSpecificOutput` decision — the shape to copy if you want a hook that gates a tool call
rather than reacting after it.

## Working memory

Several skills write their long-form output to [agentic-memory/](agentic-memory/) instead of
returning it in chat, so it survives across sessions. **The folder's contents are gitignored**
— in real use it fills with project and client documents. It ships empty here; its
[README](agentic-memory/README.md) documents the filename and flat-layout conventions that the
sync hook depends on.

## Cursor compatibility

Skills are plain Markdown and work with Cursor. Copy to `.cursor/rules/` and add `globs` +
`alwaysApply: false` to the frontmatter:

```bash
cp .claude/commands/git/commit.md .cursor/rules/git-commit.md
```
