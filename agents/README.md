# Playwright Agents

Three standalone Node.js/TypeScript automation agents.

## Prerequisites

- Node.js 20+
- Install Playwright browsers once: `npx playwright install chromium`

## Agents

### e2e-staging — E2E test runner

Runs smoke and regression Playwright test suites against a live staging environment.

```bash
cd e2e-staging
npm install
STAGING_URL=https://staging.myapp.com npm run smoke
STAGING_URL=https://staging.myapp.com npm run regression
```

**Env vars:** `STAGING_URL`

---

### site-monitor — Site availability and content monitoring

Monitors URLs for availability, content changes, and Core Web Vitals. Exit code 1 if any check fails (works with GitHub Actions scheduled workflows).

```bash
cd site-monitor
npm install
MONITORED_URLS=https://myapp.com,https://api.myapp.com npm run monitor
```

**Env vars:** `MONITORED_URLS` (comma-separated), `SLACK_WEBHOOK_URL` (optional), `DD_API_KEY` + `DD_APP_KEY` (optional)

---

### workflow-automator — Declarative browser automation

Runs YAML-defined browser workflows. No TypeScript required to add new workflows.

```bash
cd workflow-automator
npm install
node automator.js --workflow=./workflows/example-form.yaml
```

**Env vars:** any `${VAR}` references in your workflow YAML files.

**Adding a workflow:** copy `workflows/example-form.yaml` and edit the steps. Available step types:
- `navigate` — go to a URL path
- `wait-for` — wait for a CSS selector to appear
- `fill-form` — fill multiple form fields
- `click` — click a selector
- `assert` — assert a selector contains text
- `extract` — extract a value into the workflow context

## GitHub Actions integration

```yaml
- name: Run smoke tests
  run: cd agents/e2e-staging && npm ci && npm run smoke
  env:
    STAGING_URL: ${{ secrets.STAGING_URL }}

- name: Monitor production
  run: cd agents/site-monitor && npm ci && npm run monitor
  env:
    MONITORED_URLS: ${{ vars.MONITORED_URLS }}
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```
