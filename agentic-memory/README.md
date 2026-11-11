# `agentic-memory/`

This folder is the toolkit's **working memory**: the place where several skills write the
long-form documents they produce, so that a later Claude Code session can find them without
re-deriving everything from the codebase.

It ships empty on purpose. **The contents are gitignored** (see the rule in
[.gitignore](../.gitignore)) because in real use this is exactly where project and client data
ends up — architecture documents, cost analyses, pricing, prospect lists, onboarding notes.
Only this README is tracked.

## Who writes here

| Skill | Writes |
|-------|--------|
| `/docs:diseñar-arquitectura` | `arquitectura-<project>.md` — full technical architecture document |
| `/design:prototype` | `prototype-<product>-<slug>.md` — pointer record with the published Artifact URLs |
| `/trello:crear-tarea` | *reads* `arquitectura-<slug>.md` to ground card descriptions |

## Conventions that matter

**Flat, no subfolders.** Every file sits directly in `agentic-memory/`. The sync hook in
[.claude/settings.json](../.claude/settings.json) only matches `agentic-memory/*`, so a file
written to a nested subfolder is silently never synced.

**Kebab-case filenames**, prefixed by kind: `arquitectura-`, `prototype-`, `spike-`,
`analisis-`. The sync hook derives an auto-memory slug from the filename, so the name is part
of the contract.

**One topic per file.** These documents get read selectively — a skill greps for the sections
it needs rather than loading the whole file, because a full architecture document can run to
~17k tokens and would otherwise be pulled into every single invocation.

## The sync hook

`.claude/settings.json` registers a `PostToolUse` hook on `Write`/`Edit` scoped to
`agentic-memory/*`. It spawns an agent that writes a short pointer entry into Claude Code's
separate auto-memory directory (`<YOUR_HOME>/.claude/projects/<workspace-slug>/memory/`), so a
future session knows the document exists without reading the repo. The two systems are
deliberately separate: this folder holds the full documents a human reads, auto-memory holds
one-line hooks an agent reads.
