---
description: Audit project dependencies for known CVEs and outdated packages with security implications.
---

# Dependency Security Audit

## When to use

Use before a release, after a security advisory, or as part of a periodic security review.
Pass the `package.json`, `pom.xml`, or `build.gradle` in `$ARGUMENTS`, or ask to audit the
current project's dependencies.

## Instructions

Analyze dependencies for security risks:

**For npm/Node projects**
Run and interpret:
```bash
npm audit --audit-level=moderate
npm outdated
npx better-npm-audit audit --level moderate
```

Look for:
- Direct dependencies with High/Critical CVEs — must fix before release
- Transitive dependencies with High/Critical CVEs — update the parent or use `npm audit fix`
- Packages with no updates in 2+ years and known issues — consider alternatives
- Packages with history of supply chain attacks (check if publisher changed recently)

**For Maven/Spring Boot projects**
Run and interpret:
```bash
./mvnw org.owasp:dependency-check-maven:check
./mvnw versions:display-dependency-updates
```

Or check: https://deps.dev, https://ossindex.sonatype.org

Look for:
- Spring Boot and Spring Security version — check Spring Security Advisories
- Jackson (deserialization CVEs), Apache Commons, Log4j (Log4Shell)
- Dependencies with CVE CVSS score ≥ 7 — High/Critical

**Risk prioritization**
- Critical/High CVEs in code that handles user input or is network-accessible → block release
- Critical/High CVEs in dev/test dependencies → important but lower urgency
- Medium CVEs → schedule fix within the sprint
- Low CVEs → add to backlog, fix in batch

**For each CVE found, provide**
- CVE ID and CVSS score
- Affected component and version range
- Nature of the vulnerability (RCE, XSS, path traversal, etc.)
- Fixed version to upgrade to
- Whether the vulnerability is actually exploitable in this project's context
  (e.g., a RCE in a component used only for parsing config files at startup may be acceptable)

**Supply chain hygiene**
- Check for typosquatting risk in recently added packages (similar names to popular packages)
- Verify package authors/publishers for critical dependencies

## Steps

1. Run the appropriate audit tool for the stack
2. Parse the output and organize by severity
3. For each High/Critical finding: assess exploitability in this project's context
4. Provide upgrade commands ready to run

## Output format

```
## Dependency Security Audit

### Critical (fix before release)
| Package | Current | CVE | CVSS | Description | Fix |
|---------|---------|-----|------|-------------|-----|
| lodash | 4.17.20 | CVE-2021-23337 | 7.2 | Command injection | Upgrade to 4.17.21 |

### High
| ... |

### Medium (fix in next sprint)
| ... |

### Upgrade commands
```bash
npm install lodash@4.17.21
# or
./mvnw versions:set -DnewVersion=...
```

### Context assessment
[Which CVEs may not be exploitable in this specific project and why]
```
