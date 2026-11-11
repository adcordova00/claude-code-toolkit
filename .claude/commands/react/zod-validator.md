---
description: Add Zod validation to a React form — schema, field errors, and submit guard.
---

# React — Zod Form Validation

## When to use

Use when you have an existing React form (controlled or uncontrolled) that lacks validation,
or when you want to replace ad-hoc validation logic with a typed, centralized Zod schema.
Pass the component path (or paste the code) as `$ARGUMENTS`. Works with plain `useState`
forms, `react-hook-form`, or `@tanstack/form`.

## Instructions

Analyse the form's fields and business rules, then add Zod validation that:

- Validates on submit (required) and on blur (recommended)
- Shows a field-level error message beneath each input
- Disables or guards the submit button while the form is invalid or submitting
- Keeps the schema co-located with the component unless it's shared — in that case, extract
  it to `<feature>/schemas/<form-name>.schema.ts`

Follow these conventions without exception:

1. **Schema first** — define the `z.object(...)` before the component; export it as
   `<FormName>Schema` and infer the type: `export type <FormName>Values = z.infer<typeof <FormName>Schema>`
2. **Use Zod's built-in refinements before regex** — prefer `.email()`, `.url()`, `.min()`,
   `.max()`, `.uuid()`, `.datetime()` over manual patterns; only fall back to `.regex()` for
   truly custom formats (e.g., NIT, RFC, postal codes)
3. **Cross-field validation** — use `.superRefine()` or `.refine()` at the object level, not
   inside individual field validators
4. **Error messages in Spanish by default** — match the locale of the existing UI; switch to
   English only if the existing form already uses English messages
5. **Never mutate the Zod error object** — always read from `result.error.flatten()` or
   `result.error.format()` to extract messages

### Integration patterns

**Plain `useState` form:**
```tsx
const result = <FormName>Schema.safeParse(formState);
if (!result.success) {
  setErrors(result.error.flatten().fieldErrors);
  return;
}
// proceed with result.data (fully typed)
```

**`react-hook-form` (preferred for large forms):**
```tsx
import { zodResolver } from "@hookform/resolvers/zod";

const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
  resolver: zodResolver(<FormName>Schema),
});
```

**`@tanstack/form`:**
```tsx
validators: { onChange: <FormName>Schema }
```

## Steps

1. Read the component in `$ARGUMENTS` (or ask the user to paste it if no path given)
2. Identify every form field: name, type, required/optional, any existing validation
3. Map each field to the appropriate Zod type and refinements — see table below
4. Identify cross-field rules (e.g., `passwordConfirm === password`) and add `.superRefine()`
5. Write the schema and inferred type above the component
6. Wire validation into the form:
   - `useState` form: validate on submit, set `errors` state, show beneath each `<input>`
   - `react-hook-form`: add `zodResolver`, replace manual validation props
   - `@tanstack/form`: set `validators.onChange`
7. Add error display: `{errors.fieldName && <p className="text-red-500 text-sm">{errors.fieldName}</p>}`
8. Guard submit: disable button while `isSubmitting` or when errors are present
9. Run `npm run validate-skills` equivalent check: ensure no `any` types leak out of the schema

### Field type mapping

| HTML input type | Zod type | Common refinements |
|-----------------|----------|--------------------|
| `text` (name) | `z.string()` | `.min(2).max(100).trim()` |
| `email` | `z.string()` | `.email()` |
| `password` | `z.string()` | `.min(8).regex(/[A-Z]/).regex(/[0-9]/)` |
| `number` | `z.coerce.number()` | `.int().positive().min(1)` |
| `date` | `z.string()` | `.date()` or `.datetime()` |
| `tel` | `z.string()` | `.regex(/^\+?[1-9]\d{7,14}$/)` |
| `url` | `z.string()` | `.url()` |
| `select` | `z.enum([...])` | — |
| `checkbox` | `z.boolean()` | `.literal(true)` for required consent |
| `file` | `z.instanceof(File)` | `.refine(f => f.size < 5_000_000)` |
| optional field | `z.string().optional()` or `.nullable()` | Use `.or(z.literal(""))` for empty string |

## Output format

Produce the updated component file (or a clear diff if the file is large).
The output must include:

1. **Schema block** — `<FormName>Schema` and `<FormName>Values` type
2. **Updated component** — validation wired in, error messages rendered, submit guarded
3. **Install note** — if `zod` or `@hookform/resolvers` are not in `package.json`,
   prefix with: `npm install zod` / `npm install @hookform/resolvers`

Use TypeScript. Do not use `any`. Do not add validation for fields that have no business rule.

## Examples

**`$ARGUMENTS`:** `src/features/auth/LoginForm.tsx`

**Input form fields:** email (required), password (required, min 8 chars)

**Output schema:**
```ts
import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

export type LoginValues = z.infer<typeof LoginSchema>;
```

**Output usage (react-hook-form):**
```tsx
const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({
  resolver: zodResolver(LoginSchema),
});

// Inside JSX:
<input {...register("email")} />
{errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

<button type="submit" disabled={isSubmitting}>Ingresar</button>
```

**`$ARGUMENTS`:** `src/features/checkout/ShippingForm.tsx`

**Cross-field rule example:** `zipCode` must match the selected `country` pattern.
```ts
export const ShippingSchema = z
  .object({
    country: z.enum(["MX", "CO", "AR"]),
    zipCode: z.string(),
  })
  .superRefine(({ country, zipCode }, ctx) => {
    const patterns: Record<string, RegExp> = {
      MX: /^\d{5}$/,
      CO: /^\d{6}$/,
      AR: /^[A-Z]\d{4}[A-Z]{3}$/,
    };
    if (!patterns[country].test(zipCode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Código postal inválido para ${country}`,
        path: ["zipCode"],
      });
    }
  });
```
