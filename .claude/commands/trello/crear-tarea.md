---
description: Crea una tarjeta en Trello con descripción, checklist y etiqueta usando el MCP de Trello.
model: sonnet
---

# Trello — Crear Tarea

## When to use

Usa este skill cuando el usuario quiera registrar una tarea, historia de usuario, o ítem de backlog
en un tablero de Trello. Acepta descripción en lenguaje natural y usa el MCP de Trello para
resolver listas y etiquetas antes de crear la tarjeta.

Requiere el MCP `trello` activo con estas variables en el entorno:
- `TRELLO_API_KEY` — obtenida en https://trello.com/power-ups/admin
- `TRELLO_TOKEN` — generada en `https://trello.com/1/authorize?expiration=never&scope=read,write&response_type=token&key=TU_API_KEY`
- `TRELLO_BOARD_ID` — el `id` del JSON del tablero (`trello.com/b/XXXXXX/nombre.json`)

Si el MCP no responde, indica al usuario que reinicie VS Code completamente (no solo reload window).

## Instructions

Actúa como un PM que registra tareas con criterio. No crees tarjetas vacías ni con títulos
genéricos. Si el input es ambiguo en algún campo obligatorio (nombre o lista destino), pregunta
antes de ejecutar llamadas al MCP.

**Resolución de IDs:** nunca asumas IDs de listas ni etiquetas. Usa siempre el MCP para
resolverlos por nombre antes de crear. Si hay una coincidencia parcial, confírmala con el usuario.

**Descripción:** construye una descripción en Markdown con contexto de la tarea y criterio de
aceptación si el usuario lo provee. Trello acepta Markdown básico.

**Checklist:** si el usuario provee subtareas, crea un checklist "Subtareas" con cada ítem.
Si no provee subtareas, omite el checklist — no crees uno vacío.

**Etiquetas:** si no existe la etiqueta pedida, créala con el color más apropiado al contexto
(Backend → verde, Frontend → azul, Bug → rojo, DevOps → naranja) y úsala inmediatamente.
Aplicarla a la tarjeta es un paso aparte y no un parámetro de la creación — ver el paso 4.

**Fecha de vencimiento:** si el usuario menciona semana, sprint o fecha, conviértela a ISO 8601
usando la fecha actual como referencia.

## Steps

0. **Contexto de arquitectura — solo si hace falta, y solo el trozo que hace falta.**

   **Nunca cargar el archivo de arquitectura completo.** Son documentos grandes
   (`arquitectura-acmeshop.md` ronda los 16 800 tokens) y entrarían enteros en cada
   tarjeta que se crea, para redactar una descripción y unas subtareas. Leerlo completo es
   el gasto que domina este skill.

   - Si el input del usuario ya trae la terminología del proyecto (módulos, entidades,
     nombres de clase), **saltar este paso entero**: no aporta nada.
   - Si no, en paralelo con el paso 1: llamar `mcp__trello__get_active_board_info` y derivar
     el slug del nombre del tablero en minúsculas con espacios como guiones
     (ej. "AcmeShop" → `acmeshop`, "Acme Booking" → `acme-booking`).
   - Buscar con `Grep` los términos del input dentro de
     `agentic-memory/arquitectura-{slug}.md` y leer con `Read` **solo** las secciones que
     devuelva, usando `offset`/`limit`. Sintetizar, no copiar.
   - Si el archivo no existe o la búsqueda no devuelve nada: continuar sin contexto de
     arquitectura. Es un caso normal, no un error.

1. **Parsear input** — extraer o preguntar al usuario:
   - `nombre` (obligatorio): título imperativo y conciso
   - `lista` (obligatorio): nombre de la lista destino
   - `descripcion` (opcional): contexto y criterio de aceptación
   - `subtareas` (opcional): ítems para el checklist
   - `etiqueta` (opcional): nombre de etiqueta
   - `vencimiento` (opcional): fecha o referencia relativa

2. **Obtener listas del tablero** con `mcp__trello__get_lists` usando el `TRELLO_BOARD_ID`.
   Busca coincidencia case-insensitive con el nombre pedido. Confirma si la coincidencia es parcial.

3. **Obtener etiquetas del tablero** con `mcp__trello__get_board_labels` (si el usuario pidió
   etiqueta). Si no existe, créala con `mcp__trello__create_label` con el color apropiado.

4. **Crear la tarjeta** con `mcp__trello__add_card_to_list`:
   - `listId`: ID resuelto en el paso 2
   - `name`: título de la tarjeta
   - `description`: descripción en Markdown
   - `dueDate`: fecha ISO 8601 (si aplica)

   **La etiqueta no se puede pasar acá.** `add_card_to_list` y `update_card_details`
   **descartan en silencio** cualquier clave de etiqueta —probado con `labelIds` y con
   `idLabels`, en las dos herramientas—: no devuelven error, la tarjeta se crea y queda sin
   etiquetar. Si confías en el resultado de la llamada, parece que funcionó.

   Se aplica aparte, con la API REST, que es la única vía verificada:

   ```bash
   curl -sS -X POST "https://api.trello.com/1/cards/$CARD_ID/idLabels\
   ?key=$TRELLO_API_KEY&token=$TRELLO_TOKEN&value=$LABEL_ID"
   ```

   Devuelve el array de etiquetas de la tarjeta, así que **la respuesta misma sirve de
   comprobación**. No verifiques con `fields=name&labels=true`: esa combinación devuelve
   `labels` vacío aunque la etiqueta esté puesta, y parece un fallo que no existe. Si quieres
   comprobarlo aparte, usa `GET /1/cards/{id}/labels`.

   Acá REST es seguro porque solo viajan identificadores. **Para texto, nunca REST** — ver
   el paso 5.

5. **Crear checklist** si hay subtareas, con los nombres de parámetro exactos — no son los
   que uno esperaría y el primer intento falla si se adivinan:

   - `mcp__trello__create_checklist` toma `cardId` y `name`.
   - `mcp__trello__add_checklist_item` toma **`text`**, **`checkListName`** y **`cardId`**.
     No `name`, no `checklistId`. Una llamada por ítem.

   **Todo el texto va por el MCP, nunca por la API REST.** El MCP respeta UTF-8; REST lo
   rompe de dos formas distintas y las dos quedan guardadas en Trello:

   - `curl --data-urlencode` codifica los acentos como Latin-1 y la tarjeta acaba con
     `Migraci%F3n%3A ...` literal.
   - un `POST` con cuerpo JSON y `charset=utf-8` queda en mojibake: `MigraciÃ³n`.

   Y cuidado al comprobarlo: leer con `curl | python` en Windows decodifica la tubería con la
   codepage del sistema y convierte acentos **correctos** en falso mojibake. Para verificar de
   verdad, lee con `urllib` y `.decode("utf-8")` explícito, y distingue los casos por punto de
   código: una `ó` correcta sale como `\xf3` con `encode("ascii", "backslashreplace")`,
   mientras el mojibake sale como `\xc3\xb3`.

6. **Confirmar** con resumen y link directo a la tarjeta.

## Output format

```
✓ Tarjeta creada en Trello

  Título:    <nombre>
  Lista:     <lista>
  Etiqueta:  <etiqueta> (<color>)
  Vence:     <fecha>
  Subtareas: <N> ítems en checklist "Subtareas"

  → <shortUrl>
```

Si algún paso falla, reporta el error del MCP y pregunta cómo continuar.

## Examples

**Input:** `Implementar módulo Auth — lista: Por Hacer — etiqueta: Backend — subtareas: endpoint POST /api/auth/login, JwtFilter, test con Testcontainers`

**Output:**
```
✓ Tarjeta creada en Trello

  Título:    Implementar módulo Auth
  Lista:     Por Hacer
  Etiqueta:  Backend (verde)
  Subtareas: 3 ítems en checklist "Subtareas"

  → https://trello.com/c/abc123
```