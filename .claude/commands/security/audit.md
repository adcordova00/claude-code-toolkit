---
description: Audit code for OWASP Top 10 vulnerabilities and common security anti-patterns.
---

# Security Audit

## When to use

Use before shipping a new feature, reviewing a PR with security implications, or performing
a periodic security review. Pass the code, file path, or feature description in `$ARGUMENTS`.

## Instructions

Audit for the OWASP Top 10 and common security issues. For each finding, be specific about
the vulnerable code pattern — not just "there could be injection" but exactly what input path
leads to what vulnerable operation.

**A01: Broken Access Control**
- Is authorization checked on every endpoint? (Not just authentication)
- Horizontal privilege escalation: can user A access user B's resources by guessing an ID?
  (Check: is the resource fetched by ID alone, or by ID + authenticated user context?)
- Missing method-level security: `@PreAuthorize` / `@Secured` on sensitive Spring methods
- IDOR (Insecure Direct Object References): URL contains resource ID, no ownership check
- JWT: is `sub` (user ID) taken from the token, or trusted from the request body?

**A02: Cryptographic Failures**
- Passwords stored in plaintext or with weak hash (MD5, SHA1, unsalted SHA256)
  → Use BCrypt / Argon2 with Spring Security `PasswordEncoder`
- Sensitive data (SSN, credit card, health info) stored unencrypted
- HTTP used instead of HTTPS for sensitive data transmission
- Weak random number generation (`Math.random()` for security tokens)
  → Use `SecureRandom` in Java, `crypto.randomBytes()` in Node

**A03: Injection**
- SQL: string concatenation in queries — `"SELECT * FROM users WHERE email = '" + email + "'"`
  → Use parameterized queries / JPA named parameters
- JPQL injection: string concatenation in `@Query` — same issue, different syntax
- Command injection: `Runtime.exec()` or `ProcessBuilder` with user input
- LDAP, XML, XPath injection if applicable

**A04: Insecure Design**
- Business logic vulnerabilities: can a user skip steps in a process (checkout without paying)?
- Missing rate limiting on sensitive endpoints (login, password reset, OTP)
- Password reset flow: token in URL (logged by servers), short TTL?

**A05: Security Misconfiguration**
- CORS: `allowedOrigins("*")` with `allowCredentials(true)` — forbidden combination
- Actuator endpoints exposed without authentication
- Error messages revealing stack traces, SQL, or internal paths to end users
- Default credentials or debug endpoints left in production config
- HTTP security headers missing: CSP, HSTS, X-Frame-Options, X-Content-Type-Options

**A06: Vulnerable Components**
- Dependencies with known CVEs (flag for `/security:deps` skill)

**A07: Authentication Failures**
- No brute force protection on login (no lockout, no rate limiting, no CAPTCHA)
- Session tokens not invalidated on logout
- "Remember me" tokens stored insecurely or with no expiration
- JWT: algorithm confusion attack — is `alg: none` accepted?
- JWT: verified against the correct secret/key?

**A09: Security Logging Failures**
- Authentication events not logged (successful logins, failures, lockouts)
- Sensitive operations (password change, permission escalation) not audited
- Log injection: user input logged without sanitization (newlines can forge log entries)
- Passwords or tokens appearing in log output

**A10: SSRF**
- User-supplied URLs fetched server-side without validation
- Internal services accessible from the URL fetcher (metadata endpoints, internal APIs)

## Steps

1. Read all code in `$ARGUMENTS`
2. Focus on: entry points (controllers, APIs), data access layer, authentication/authorization
3. For each vulnerability: cite the specific code pattern, explain the attack scenario,
   provide the remediation

## Output format

```
## Security Audit

### Critical (exploitable, user data at risk)
- **[Vulnerability type]** at [class/file:line]
  Attack scenario: [how an attacker exploits this]
  Fix: [specific remediation with code example]

### High
- [finding]

### Medium
- [finding]

### Informational
- [best practice suggestion]

### No issues found in
- [areas that were checked and are clean]
```
