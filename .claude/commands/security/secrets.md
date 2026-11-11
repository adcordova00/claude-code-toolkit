---
description: Scan the codebase for hardcoded secrets, tokens, and credentials.
---

# Scan for Hardcoded Secrets

## When to use

Use when auditing a codebase for accidentally committed secrets, before making a repo public,
or after a security incident. Pass a file, directory, or describe the scope in `$ARGUMENTS`.

## Instructions

Scan for hardcoded secrets using a combination of pattern matching and heuristic analysis.

**Run these tools first (if available)**
```bash
# gitleaks - scans git history, not just current files
gitleaks detect --source . --verbose

# truffleHog - entropy + pattern scanning
trufflehog filesystem . --only-verified

# detect-secrets - good for CI integration
detect-secrets scan --list-all-plugins > .secrets.baseline
```

**If tools are not available, search manually for these patterns**

High-confidence patterns (almost always a secret):
```bash
grep -rn "AKIA[0-9A-Z]{16}" .           # AWS Access Key
grep -rn "sk-[a-zA-Z0-9]{32,}" .        # OpenAI API key
grep -rn "ghp_[a-zA-Z0-9]{36}" .        # GitHub PAT
grep -rn "eyJ[a-zA-Z0-9._-]{20,}" .     # JWT token (base64 encoded)
grep -rn "-----BEGIN.*PRIVATE KEY-----" . # Private key
```

Common secret variable names (check their values):
```bash
grep -rni "password\s*=\s*['\"][^'\"]" .
grep -rni "api_key\s*=\s*['\"][^'\"]" .
grep -rni "secret\s*=\s*['\"][^'\"]" .
grep -rni "token\s*=\s*['\"][^'\"]" .
grep -rni "connectionstring\s*=\s*['\"][^'\"]" .
grep -rni "jdbc:postgresql://[^:]+:[^@]+" .   # DB URL with credentials
```

**Check these locations specifically**
- `application.properties` / `application.yml` — Spring Boot config
- `.env` files accidentally committed (check `.gitignore` covers all `.env*`)
- Test files — credentials often hardcoded "just for tests"
- `docker-compose.yml` — DB passwords, tokens
- CI/CD config files (`.github/workflows/`) — secrets hardcoded instead of using `${{ secrets.NAME }}`
- Migration files — sometimes contain hardcoded admin passwords
- Commented-out code — old credentials left in comments

**Check git history too**
```bash
git log --all --full-history --source --remotes -- '*.env' '*.pem' '*.key'
git log -p --all | grep -E "(password|secret|api_key|token)\s*=\s*['\"][^'\"]{8,}"
```

**If a secret is found in git history**
1. The secret is compromised — rotate it immediately (before removing from history)
2. Use `git filter-repo` to remove it from history (BFG Repo Cleaner as alternative)
3. Force-push all branches (after team coordination)
4. Notify anyone who has cloned the repo

## Steps

1. Run gitleaks/truffleHog if available
2. Run manual grep patterns on the codebase
3. Check `.gitignore` is correctly excluding `.env` and secret files
4. Check git history for recently removed secrets

## Output format

```
## Secrets Scan Results

### Confirmed secrets found
- **[type]** at `[file:line]`
  Pattern: [what was found]
  Action required: [rotate immediately / remove and rotate]

### Suspicious patterns (needs human review)
- `[file:line]`: [why it looks suspicious]

### Git history findings
- [commit hash]: [description of what was committed]

### .gitignore gaps
- [file pattern] not excluded — add to .gitignore

### No issues found
- [areas scanned that were clean]

### Recommended next steps
1. [actions to take, in priority order]
```
