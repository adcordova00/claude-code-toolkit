---
description: Create a new production-grade skill file in .claude/commands/<category>/<name>.md.
---

# Skill Creator

## When to use

Use any time you want to add a new slash command to this toolkit. Pass category and name as arguments:

```
/skill:creator <category> <name>
```

Examples:
```
/skill:creator react form-validator
/skill:creator java circuit-breaker
/skill:creator testing contract
/skill:creator git stash-manager
```

## Instructions

### Step 1 — Parse arguments

Split `$ARGUMENTS` on the first space:
- **category** = first word (lowercase)
- **name** = remaining words joined with hyphens (lowercase)

If `$ARGUMENTS` is empty, ask the user to provide category and name.

Existing categories are the subdirectories under `.claude/commands/` — check with a directory
listing rather than a hardcoded list (a hardcoded list here has gone stale before and rejected
valid categories). If the given category doesn't match an existing directory, confirm with the
user whether they want to create it as a new category before proceeding — don't silently reject
it, and don't silently create one from a typo either.

### Step 2 — Check for conflicts

Verify `.claude/commands/<category>/<name>.md` does not already exist.
If it does, stop and tell the user — do not overwrite.

### Step 3 — Ask for the objective

Ask the user one question:
> What should `/<category>:<name>` do? Describe the goal, the inputs it receives, and what it should produce.

Wait for the answer. Use it as the foundation for the entire skill.

### Step 4 — Write the skill

Create `.claude/commands/<category>/<name>.md` following the format below exactly.

**Quality bar — every skill must be:**
- **Specific**: name the exact commands, flags, methods, and patterns to use
- **Opinionated**: make the choices, don't leave them open-ended
- **Complete**: a developer should be able to invoke it with zero prior context
- **Senior-level**: write as a tech lead instructing a capable engineer — no hand-holding, no padding

**Skill file format:**

```markdown
---
description: <one sentence — what the skill does, shown in the command picker>
---

# <Title>

## When to use

<1–3 sentences: the exact situation that triggers this skill and what problem it solves>

## Instructions

<The core prompt. Step-by-step, specific, opinionated. Include:>
<- Exact commands or API calls to run>
<- Concrete decision rules ("prefer X over Y when Z")>
<- What to check, what to avoid, what to prioritize>
<- Any relevant thresholds, naming conventions, or constraints>

## Steps

1. <Imperative action>
2. <Imperative action>
3. <Continue as needed>

## Output format

<Describe exactly what to produce: a file, a diff, a table, a code block.>
<Specify the language if relevant.>

## Examples

<Optional but recommended for complex skills.>
<Show at least one realistic $ARGUMENTS value and the expected output shape.>
```

**Frontmatter rules:**
- Only one field: `description`
- One sentence, present tense, no trailing period
- Max 80 characters
- Must not be a placeholder

**Section rules:**
- `## When to use`, `## Instructions`, `## Output format` are mandatory
- `## Steps` and `## Examples` are recommended but optional
- Do not add extra sections unless they genuinely clarify the skill

### Step 5 — Validate

After writing the file, run:
```
npm run validate-skills
```

If validation fails, fix the reported issue immediately.

### Step 6 — Confirm

Report to the user:
- The full path of the created file
- The command they can now invoke: `/<category>:<name>`
- One sentence on what it does

## Steps

1. Parse `$ARGUMENTS` → category + name
2. Check `.claude/commands/<category>/<name>.md` does not exist
3. Ask the user for the skill objective
4. Write the skill file following the format and quality bar above
5. Run `npm run validate-skills`
6. Report success with file path and command name

## Output format

A new file created at `.claude/commands/<category>/<name>.md`, followed by a brief confirmation:

```
✅ Skill created: /react:form-validator
   File: .claude/commands/react/form-validator.md
   Validates a React form component with Zod schemas and displays field-level errors.
```

## Examples

**`$ARGUMENTS`:** `react form-validator`

Claude asks: *What should /react:form-validator do?*
User answers: *Audit a React form and add Zod validation with field-level errors and submit guard.*

Claude creates: `.claude/commands/react/form-validator.md`

---

**`$ARGUMENTS`:** `java circuit-breaker`

Claude asks: *What should /java:circuit-breaker do?*
User answers: *Add Resilience4j circuit breaker configuration to a Spring Boot service.*

Claude creates: `.claude/commands/java/circuit-breaker.md`
