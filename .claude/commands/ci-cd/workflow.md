---
description: Generate a GitHub Actions workflow for a React or Spring Boot project.
---

# Generate GitHub Actions Workflow

## When to use

Use when setting up CI/CD for a new project or improving an existing pipeline. Pass the project
type and requirements in `$ARGUMENTS` (e.g., "Spring Boot with PostgreSQL, deploy to AWS ECS").

## Instructions

Generate a production-ready GitHub Actions workflow following these principles:

**Security first**
- `permissions` block set to least privilege (default `contents: read`)
- Elevated permissions declared only at the job level where needed
- Never use `pull_request_target` with code checkout from untrusted forks
- Secrets accessed via `${{ secrets.NAME }}`, never hardcoded
- `GITHUB_TOKEN` used for GitHub operations, not a PAT unless necessary

**Performance**
- Dependency caching: `actions/cache` for npm/Maven/Gradle — cache key based on lockfile hash
- Parallel jobs for independent tasks (lint, test, build can run concurrently)
- Matrix builds for multi-version testing
- `--fail-fast: false` in matrix to see all failures, not just the first

**For React/Node projects**
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
- run: npm ci          # never npm install in CI
- run: npm run lint
- run: npm test -- --coverage --watchAll=false
- run: npm run build
```

**For Spring Boot/Java projects**
```yaml
- uses: actions/setup-java@v4
  with:
    java-version: '21'
    distribution: 'temurin'
    cache: 'maven'
- run: ./mvnw verify   # runs tests + build
# For services needing a DB:
services:
  postgres:
    image: postgres:16
    env:
      POSTGRES_PASSWORD: test
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
```

**Job structure**
- `ci` job: lint → test → build (fast feedback)
- `security` job: dependency audit (`npm audit --audit-level=high` / `./mvnw dependency-check:check`)
- `deploy` job: depends on `ci`, runs only on `main` branch push

**Triggers**
- `push` to `main` and `develop`
- `pull_request` targeting `main` (to validate before merge)
- `workflow_dispatch` for manual runs

## Steps

1. Parse `$ARGUMENTS` for: language/framework, DB dependencies, deployment target, branches
2. Generate the workflow YAML with appropriate jobs
3. Add comments explaining non-obvious sections

## Output format

```yaml
# === .github/workflows/ci.yml ===
name: CI
on: ...
jobs:
  ci: ...
  deploy: ...
```
