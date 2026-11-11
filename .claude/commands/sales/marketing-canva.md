---
description: Genera un set de piezas de campaña (post, story, banner) en Canva con brand kit consistente
---

# Campaña de Marketing Multi-Formato con Canva

## When to use

Usa esta skill cuando necesites lanzar una campaña de marketing (producto, oferta, promoción, evento) y
requieras varias piezas visuales coherentes entre sí — un post para feed, una story vertical y un banner —
listas para publicar en redes o usar como material de venta. Genera las tres piezas con la misma identidad
visual (brand kit, paleta, mensaje) para que se vean como una sola campaña, no como diseños sueltos.

## Instructions

Eres un diseñador de marketing digital. Tu trabajo es tomar un brief de campaña y convertirlo en un
concepto creativo único (headline + mensaje + CTA) que luego se adapta a tres formatos distintos,
manteniendo consistencia visual mediante el mismo brand kit y la misma paleta/estilo en las tres queries.

### Paso 0 — Pedir el brief si no se proporcionó

Si `$ARGUMENTS` está vacío, responde **exactamente** esto y detente:

> Listo. Describe tu campaña en tu próximo mensaje. Incluye:
> - **Producto u oferta** a promocionar
> - **Mensaje clave / gancho** (qué problema resuelve o qué beneficio destaca)
> - **Call to action** (agendar demo, comprar, escribir por WhatsApp, etc.)
> - **Audiencia** (a quién le hablas)
> - **Estilo o paleta preferida** — opcional

### Paso 1 — Parsear el brief

Extrae del input:
- **Producto/oferta** y contexto (ej: plan, descuento, lanzamiento, evento)
- **Mensaje clave / gancho** — la idea central que debe repetirse en las tres piezas
- **CTA** — acción concreta y verbo imperativo (default si no se especifica: "Escríbenos por WhatsApp")
- **Audiencia** (default: dueños de negocios de servicios pequeños/medianos)
- **Estilo visual** (default: moderno, profesional, colores vibrantes pero sobrios)
- **Formatos solicitados** — si el usuario no especifica, generar los tres formatos default (ver Paso 4)

Si falta el CTA o el mensaje clave, pregúntalos antes de continuar — sin esto la campaña no tiene enfoque.

### Paso 2 — Definir el concepto creativo único

Antes de escribir queries, fija en una sola frase:
- **Headline** (máx 8 palabras, en español, gancho directo)
- **Subheadline / apoyo** (una frase que refuerza el beneficio)
- **CTA final** (verbo + acción)

Este mismo headline/CTA debe aparecer adaptado (no idéntico palabra por palabra, pero mismo mensaje) en
las tres piezas — es lo que hace que la campaña se sienta unificada.

### Paso 3 — Preguntar por brand kit

Antes de generar cualquier diseño, pregunta:

> ¿Quieres usar un brand kit de Canva para mantener los colores y fuentes de tu marca en toda la campaña?
> Responde **sí** para elegir uno o **no** para continuar con un estilo generado automáticamente.

Si dice **sí**: usa `mcp__canva__list-brand-kits`, muestra las opciones, espera selección y guarda el
`brand_kit_id`. Pasa el **mismo** `brand_kit_id` a las tres llamadas de `generate-design` — es lo que
garantiza consistencia visual entre piezas.

Si dice **no**: continúa sin `brand_kit_id`, pero repite la **misma paleta de colores** en las tres queries
(defínela explícitamente en Paso 2, ej: "deep blue #1a3c6e and warm orange accents") para lograr consistencia
igual sin brand kit.

### Paso 4 — Mapear formatos a `design_type`

Formatos default (si el usuario no pidió otros) y su `design_type` en `generate-design`:

| Pieza  | `design_type`     | Uso                                  | Notas de copy                          |
|--------|-------------------|---------------------------------------|-----------------------------------------|
| Post   | `instagram_post`   | Feed de Instagram/Facebook, 1080x1350 | Headline + subheadline + CTA visibles   |
| Story  | `your_story`       | Story vertical Instagram/Facebook     | Texto mínimo, mensaje en 3 segundos     |
| Banner | `facebook_cover`   | Portada de página, banner web/WhatsApp| Horizontal, texto corto, sin CTA denso  |

Si el usuario pide explícitamente otro canal, sustituye por el `design_type` correspondiente
(`facebook_post`, `twitter_post`, `pinterest_pin`, `youtube_banner`, `flyer`, `poster`), pero mantén
siempre exactamente 3 piezas salvo que pida más o menos.

### Paso 5 — Construir las tres queries

Cada query va en **inglés**, es específica y reutiliza el mismo concepto creativo del Paso 2, adaptado
al formato:

```
[Format] design in Spanish promoting [PRODUCT/OFFER].
Style: [estilo], [paleta de colores exacta].
Headline: "[headline en español]"
Supporting message: "[subheadline en español]"
Call to action: "[CTA en español]"
Target audience: [audiencia]. All text in Spanish.
[Notas específicas de formato: ej. "vertical full-bleed layout, bold minimal text for story"
 o "wide horizontal layout, concise text for banner"]
```

### Paso 6 — Generar los 3 candidatos en paralelo

Llama a `mcp__canva__generate-design` una vez por formato (post, story, banner), cada una con su
`design_type` y query correspondiente, y el mismo `brand_kit_id` si aplica. Estas tres llamadas no
dependen entre sí — ejecútalas en paralelo.

Muestra los candidatos agrupados por formato:

```
### Post (Instagram/Facebook)
[thumbnails de candidatos 1, 2, 3...]

### Story
[thumbnails de candidatos 1, 2, 3...]

### Banner
[thumbnails de candidatos 1, 2, 3...]

Dime el número que prefieres para cada formato, ej: "post: 2, story: 1, banner: 3"
```

### Paso 7 — Guardar los diseños elegidos

Por cada formato, con la elección del usuario, llama a `mcp__canva__create-design-from-candidate` con
el `job_id` y `candidate_id` correspondientes. Guarda los tres `design_id` resultantes.

### Paso 8 — Exportar las tres piezas

Por cada `design_id`, llama a `mcp__canva__export-design` con:
```json
{
  "design_id": "[design_id]",
  "format": { "type": "png", "export_quality": "pro", "lossless": true }
}
```

### Paso 9 — Entregar la campaña completa

Entrega los tres links de descarga y de edición, agrupados, más un resumen del concepto creativo usado.

## Steps

1. Si `$ARGUMENTS` vacío → pedir brief y esperar
2. Parsear brief: producto, mensaje clave, CTA, audiencia, estilo, formatos
3. Definir concepto creativo único (headline, subheadline, CTA)
4. Preguntar por brand kit (sí/no) y fijar paleta consistente
5. Mapear los 3 formatos a `design_type` (default: instagram_post, your_story, facebook_cover)
6. Construir 3 queries en inglés que compartan el mismo concepto creativo adaptado por formato
7. Llamar `generate-design` en paralelo para los 3 formatos
8. Mostrar candidatos agrupados por formato y pedir elección
9. Llamar `create-design-from-candidate` por cada formato elegido
10. Llamar `export-design` (PNG, pro quality) por cada diseño guardado
11. Entregar los 3 links de descarga + edición + resumen del concepto

## Output format

```
## Campaña creada: [PRODUCTO/OFERTA]

**Concepto:** "[headline]" — [subheadline] — CTA: "[CTA]"

### 📱 Post
⬇️ Descargar: [URL]
✏️ Editar: https://www.canva.com/design/[design_id]/edit

### 📖 Story
⬇️ Descargar: [URL]
✏️ Editar: https://www.canva.com/design/[design_id]/edit

### 🖼️ Banner
⬇️ Descargar: [URL]
✏️ Editar: https://www.canva.com/design/[design_id]/edit

### Consistencia aplicada
- Brand kit: [nombre del brand kit usado / "paleta manual: #hex, #hex"]
- Mensaje repetido en las 3 piezas: "[headline]"
```

## Examples

**Input:** `Promocionar el Plan Ultra de AcmeBooking con 20% de descuento el primer mes. Mensaje: agenda automatizada 24/7 sin perder clientes. CTA: escríbenos por WhatsApp. Audiencia: dueños de spas y peluquerías. Paleta: azul y blanco, moderno.`

**Concepto creativo:**
- Headline: "Tus citas, solas, 24/7"
- Subheadline: "Nunca más pierdas un cliente por no contestar a tiempo"
- CTA: "Escríbenos por WhatsApp — 20% OFF primer mes"

**Query para Post (`instagram_post`):**
```
Instagram post design in Spanish promoting AcmeBooking Ultra Plan, 20% off first month.
Style: modern, clean, blue and white palette, professional but approachable.
Headline: "Tus citas, solas, 24/7"
Supporting message: "Nunca más pierdas un cliente por no contestar a tiempo"
Call to action: "Escríbenos por WhatsApp — 20% OFF primer mes"
Target audience: spa and salon owners. All text in Spanish.
Balanced layout with icon of chat bubble and calendar, clear visual hierarchy.
```
