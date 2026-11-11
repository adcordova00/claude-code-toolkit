---
description: Lee una tarjeta de Trello por URL y produce un plan de implementación accionable
---

# Trello — Leer Tarea y Planificar Implementación

## When to use

Usa este skill cuando el usuario proporcione un enlace de Trello y quiera entender qué hay que
hacer y cómo hacerlo. Extrae toda la información de la tarjeta (descripción, checklists,
comentarios, etiquetas, criterios de aceptación) y produce un plan de implementación técnico
estructurado listo para ejecutar.

## Instructions

**Parsear el enlace:** el formato de URL de Trello es `https://trello.com/c/{shortId}/...`.
Extrae el `shortId` (el segmento después de `/c/`). Este ID funciona directamente en el MCP.

**Extracción de información:** usa las siguientes tools del MCP en paralelo cuando sea posible:
- `mcp__trello__get_card` — título, descripción, etiquetas, fecha de vencimiento, estado
- `mcp__trello__get_checklist_items` — subtareas definidas (busca primero el checklist con `mcp__trello__get_checklist_by_name`)
- `mcp__trello__get_card_comments` — contexto adicional, decisiones tomadas, aclaraciones
- `mcp__trello__get_acceptance_criteria` — criterios de aceptación si están definidos

**Análisis como tech lead:** después de extraer la información, actúa como tech lead senior.
No copies la descripción — interpreta qué hay que construir, identifica dependencias técnicas,
detecta ambigüedades y define el orden de implementación correcto.

**Criterios de un buen plan:**
- Las fases tienen orden lógico (no puedes testear lo que no has construido)
- Cada paso es accionable por un desarrollador sin preguntas adicionales
- Se mencionan los archivos, clases o módulos específicos a crear o modificar cuando el contexto lo permite
- Las ambigüedades se señalan explícitamente como "Puntos a aclarar" — no las ignores ni las inventes
- El esfuerzo estimado es honesto, no optimista

## Steps

1. Extraer el `shortId` de la URL proporcionada por el usuario

2. Llamar en paralelo:
   - `mcp__trello__get_card` con el `shortId`
   - `mcp__trello__get_card_comments` con el `shortId`
   - `mcp__trello__get_acceptance_criteria` con el `shortId`

3. Si la tarjeta tiene checklists mencionados en la descripción o en los campos de la tarjeta,
   llamar `mcp__trello__get_checklist_by_name` y luego `mcp__trello__get_checklist_items`
   para obtener los ítems

4. Con toda la información recopilada, analizar:
   - ¿Qué hay que construir exactamente?
   - ¿Qué módulos, capas o componentes están involucrados?
   - ¿Hay dependencias entre subtareas?
   - ¿Qué falta definir para poder implementar?

5. Producir el plan de implementación en el formato definido abajo

## Output format

```markdown
## 📋 Tarea: <título de la tarjeta>

**Lista:** <nombre de la lista>  
**Etiqueta:** <etiquetas>  
**Vence:** <fecha o "sin fecha">

---

### Contexto
<2–4 oraciones resumiendo qué resuelve esta tarea y por qué importa. No copies la descripción — sintetízala.>

### Criterios de aceptación
<Lista bullet de los criterios que deben cumplirse para considerar la tarea completa.
Si no están definidos en la tarjeta, derivarlos del contexto.>

---

### Plan de implementación

**Fase 1 — <nombre descriptivo>** (~<X> horas)
- [ ] <paso concreto y accionable>
- [ ] <paso concreto y accionable>

**Fase 2 — <nombre descriptivo>** (~<X> horas)
- [ ] <paso concreto y accionable>
- [ ] <paso concreto y accionable>

_(añadir fases según complejidad)_

---

### Esfuerzo estimado total
<S / M / L / XL> — <N–M horas> de desarrollo

### Puntos a aclarar
<Lista de ambigüedades o decisiones pendientes que bloquean o condicionan la implementación.
Si no hay ninguna, omitir esta sección.>

---

Antes de implementar: crear una rama con `/git:branch` — nunca trabajar directo sobre
`main`/`master`, incluso para cambios que parezcan pequeños.
```

## Examples

**Input:** `https://trello.com/c/aBcD1234`

**Output:**
```markdown
## 📋 Tarea: Configuración de proyecto Java + Spring Boot para el backend de AcmeShop

**Lista:** Por Hacer
**Etiqueta:** Backend
**Vence:** sin fecha

---

### Contexto
Setup inicial del proyecto Spring Boot 3.x que servirá como base del backend de AcmeShop.
Establece la estructura de paquetes, stack de dependencias Maven, conexión a PostgreSQL con Flyway,
Redis, Dockerfile y pipeline CI en GitHub Actions.

### Criterios de aceptación
- El proyecto compila y arranca con `mvn spring-boot:run`
- Health check de Actuator retorna UP para PostgreSQL y Redis
- Primera migración Flyway ejecutada sin errores al iniciar
- `docker compose up` levanta el stack completo sin errores
- GitHub Actions ejecuta `mvn verify` exitosamente en cada push a `main`

---

### Plan de implementación

**Fase 1 — Scaffold del proyecto** (~2h)
- [ ] Generar proyecto con Spring Initializr: Web, Security, Data JPA, Redis, Actuator, Validation
- [ ] Definir estructura de paquetes `com.acmeshop.modules.*` e `infrastructure.*`
- [ ] Configurar `application.yml` con perfiles `dev` y `prod`
- [ ] Configurar `logback-spring.xml` con output JSON en prod (logstash-logback-encoder)

**Fase 2 — Persistencia y migraciones** (~1.5h)
- [ ] Configurar datasource PostgreSQL con Hikari pool en `application-{env}.yml`
- [ ] Crear primera migración Flyway `V1__init_schema.sql` con estructura base
- [ ] Configurar RedisConfig con `RedisTemplate<String, Object>` y serialización Jackson

**Fase 3 — Infraestructura Docker** (~1h)
- [ ] Escribir `Dockerfile` multistage: build Maven → runtime eclipse-temurin:21-jre-alpine
- [ ] Validar `docker compose up` con los 5 servicios (backend, frontend, db, redis, caddy)
- [ ] Verificar health checks de Docker apuntando a `/api/actuator/health`

**Fase 4 — Pipeline CI** (~1h)
- [ ] Crear `.github/workflows/ci.yml`: checkout → Java 21 → cache Maven → `mvn verify`
- [ ] Agregar step de build y push de imagen a GHCR con tag del SHA del commit

---

### Esfuerzo estimado total
S — 5–6 horas de desarrollo

### Puntos a aclarar
- ¿El repositorio de backend ya existe en GitHub o hay que crearlo?
- ¿Se usa GitHub Container Registry (GHCR) o Docker Hub para las imágenes?
```