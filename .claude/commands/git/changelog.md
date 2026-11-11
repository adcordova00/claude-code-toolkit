---
description: Generate a CHANGELOG entry from commits since the last git tag.
---

# Generate CHANGELOG Entry

## When to use

Use when preparing a release and needing to document what changed since the last version.
Pass the new version number (e.g., `v2.1.0`) in `$ARGUMENTS`. Follows Keep a Changelog format.

## Instructions

Run `git log $(git describe --tags --abbrev=0)..HEAD --oneline` to get all commits since the
last tag. If no tags exist, use `git log --oneline`. Parse the commit messages (which should
follow Conventional Commits) and group them into the standard Keep a Changelog sections.

Mapping from conventional commit types to CHANGELOG sections:
- `feat` → **Added**
- `fix` → **Fixed**
- `perf` → **Changed** (with note: performance improvement)
- `refactor` → **Changed**
- `docs` → omit unless the docs are user-facing
- `chore`, `ci`, `build`, `style`, `test` → omit (implementation details, not user-facing)
- `BREAKING CHANGE` footer → **Breaking Changes** (always first section)
- Removed functionality → **Removed**
- Security fixes → **Security** (always last section)

Rewrite commit subjects into user-facing language — the CHANGELOG is read by developers
consuming your project, not internal team members. Avoid internal jargon.

## Steps

1. Run `git describe --tags --abbrev=0` to find the last tag
2. Run `git log <last-tag>..HEAD --oneline --no-merges`
3. Group commits by type
4. Rewrite each entry to be user-facing (drop ticket numbers unless they're public)
5. Add the version header with today's date

## Output format

```markdown
## [<version>] - <YYYY-MM-DD>

### Breaking Changes
- [Only if BREAKING CHANGE commits exist]

### Added
- [New features]

### Changed
- [Changes to existing functionality]

### Fixed
- [Bug fixes]

### Removed
- [Removed features]

### Security
- [Security fixes — always last]
```

## Examples

**`$ARGUMENTS`:** `v1.3.0`

**Commits since last tag:**
```
feat(auth): add OAuth2 Google login
fix(user): handle null email in profile update
feat(api): add pagination to /users endpoint
perf(search): index full-text search on products table
chore: update dependencies
```

**Output:**
```markdown
## [1.3.0] - 2026-05-16

### Added
- Google OAuth2 login support
- Pagination support for the users API endpoint (`page` and `size` query params)

### Changed
- Improved full-text search performance on product listings

### Fixed
- Profile update no longer fails when email field is empty
```
