---
description: Genera un documento IEEE 830 (ERS) completo en Google Drive a partir de una descripción de proyecto
---

# Generar Especificación de Requisitos de Software (IEEE 830)

## When to use

Cuando tienes una descripción de un proyecto de software (texto libre o archivo) y necesitas producir un documento formal de toma de requerimientos siguiendo el estándar IEEE 830 (ERS), listo para revisión con stakeholders o clientes.

## Instructions

Actúa como **Technical Leader y Product Owner senior** con experiencia en levantamiento de requerimientos para proyectos de software empresarial. Tu rol es interpretar la descripción del proyecto, hacer inferencias razonables sobre necesidades implícitas, y producir un ERS completo, riguroso y accionable.

### Reglas de análisis

- Si la descripción es ambigua, documenta el supuesto en el Apéndice C — no pidas aclaraciones para cada punto, infiere y documenta.
- Prioriza cada RF y RNF usando MoSCoW: **Must** (obligatorio para el lanzamiento), **Should** (importante pero no bloqueante), **Could** (deseable si hay tiempo), **Won't** (fuera de alcance v1).
- Los identificadores siguen el formato `RF-001`, `RF-002`... para funcionales y `RNF-001`... para no funcionales, siempre secuenciales sin saltos.
- Nunca inventes funcionalidades que contradigan la descripción; sí puedes inferir las obvias e implícitas (si hay login → hay logout y recuperación de contraseña).
- El documento completo debe estar en **español formal**.
- **Nunca subas el archivo si quedan comentarios placeholder (`<!-- SECCIÓN X -->`) o campos con valor `[pendiente]` en el HTML.**

### Cómo obtener el input

- Si el usuario pegó texto: úsalo directamente.
- Si mencionó una ruta de archivo: léelo con la herramienta Read antes de continuar.

## Steps

### Paso 1 — Leer el input

Lee el archivo si se proporcionó ruta; de lo contrario usa el texto del usuario.

### Paso 2 — Análisis explícito (escribir, no solo pensar)

Antes de redactar ningún RF, produce en tu respuesta un bloque de análisis con este formato exacto:

```
## Análisis previo

**Nombre del proyecto:** <derivado de la descripción>
**Dominio:** <ej: marketplace, SaaS B2B, app móvil de salud>

**Actores identificados:**
- <Actor 1>: <rol breve>
- <Actor 2>: <rol breve>

**Módulos / áreas funcionales:**
- <Módulo 1>
- <Módulo 2>

**Integraciones externas detectadas:**
- <Servicio / API>: <propósito>

**Restricciones tecnológicas mencionadas:**
- <restricción o "ninguna mencionada">

**Supuestos realizados:**
- <Supuesto 1>
- <Supuesto 2>

**Riesgos / ambigüedades a documentar:**
- <Riesgo 1>
```

Espera a tener este bloque completo antes de continuar con los siguientes pasos.

### Paso 3 — Redactar el ERS

Redacta el documento completo siguiendo la estructura IEEE 830 de la sección "Output format". Usa el análisis del Paso 2 como fuente de verdad — no añadas actores ni módulos que no aparezcan ahí.

### Paso 4 — Self-check de completitud

Antes de construir el HTML, verifica mentalmente cada punto:

- [ ] Todas las secciones 1.x, 2.x, 3.x tienen contenido real (no comentarios vacíos).
- [ ] Todos los RFs tienen: ID, Nombre, Descripción, Actor, Prioridad, Precondición, Postcondición, Flujos alternativos.
- [ ] Todos los RNFs tienen: ID, Nombre, Descripción, Métrica/criterio, Prioridad.
- [ ] Los IDs son secuenciales sin saltos.
- [ ] El Apéndice C lista todos los supuestos del Paso 2.
- [ ] La Matriz de trazabilidad (Apéndice B) cubre todos los RF.

Si algún punto falla, completa el contenido antes de continuar.

### Paso 5 — Construir el HTML

Ensambla el HTML completo usando la plantilla de la sección "Output format". Reglas:

- Reemplaza **todos** los `[placeholders]` con valores reales.
- Elimina **todos** los comentarios `<!-- -->` del HTML final.
- Genera el TOC dinámicamente con los IDs de sección reales (`#seccion-1`, `#rf-001`, etc.).
- Incluye la tabla de historial de versiones con al menos la fila v1.0.

### Paso 6 — Subir a Google Drive

Llama a `mcp__claude_ai_Google_Drive__create_file` con:
- `name`: `ERS - <Nombre del Proyecto> - IEEE 830.html`
- `mimeType`: `text/html`
- `content`: el HTML completo

### Paso 7 — Reportar al usuario

Muestra:
- Nombre del archivo creado
- Link de Google Drive retornado por el MCP
- Conteo de RFs y RNFs generados
- Lista de supuestos clave documentados (máximo 5)

## Output format

### Estructura IEEE 830 (secciones obligatorias)

```
Portada
  - Nombre del proyecto, versión, fecha, estado, autores
  - Tabla de historial de versiones (Versión | Fecha | Autor | Descripción del cambio)

Tabla de Contenidos (con links a cada sección y RF)

1. Introducción
   1.1 Propósito
   1.2 Alcance del producto
   1.3 Definiciones, acrónimos y abreviaturas
   1.4 Referencias
   1.5 Visión general del documento

2. Descripción general
   2.1 Perspectiva del producto
   2.2 Funciones del producto (resumen de módulos)
   2.3 Características de los usuarios (tabla: Actor | Descripción | Nivel técnico | Frecuencia de uso)
   2.4 Restricciones generales
   2.5 Supuestos y dependencias

3. Requisitos específicos
   3.1 Requisitos funcionales
       Por cada RF: tabla de dos columnas (Campo | Valor)
       Campos: ID, Nombre, Descripción, Actor, Prioridad MoSCoW, Precondición, Postcondición, Flujos alternativos/Excepciones
   3.2 Requisitos no funcionales
       Por cada RNF: tabla de dos columnas (Campo | Valor)
       Campos: ID, Nombre, Categoría, Descripción, Métrica/criterio de aceptación, Prioridad MoSCoW
       Categorías: Rendimiento | Seguridad | Usabilidad | Disponibilidad | Escalabilidad | Mantenibilidad
   3.3 Requisitos de interfaz
       3.3.1 Interfaces de usuario
       3.3.2 Interfaces de hardware
       3.3.3 Interfaces de software (integraciones externas)
       3.3.4 Interfaces de comunicación

4. Apéndices
   A. Glosario extendido (tabla: Término | Definición)
   B. Matriz de trazabilidad (tabla: RF-ID | Nombre | Módulo | Actor | Prioridad)
   C. Supuestos documentados (tabla: ID | Supuesto | Impacto si es incorrecto)
```

### Plantilla HTML

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ERS - [Nombre del Proyecto] - IEEE 830</title>
  <style>
    /* Base */
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 980px; margin: 40px auto; padding: 0 24px; color: #222; line-height: 1.75; }

    /* Tipografía */
    h1 { color: #1a237e; border-bottom: 3px solid #1a237e; padding-bottom: 10px; font-size: 2em; }
    h2 { color: #283593; margin-top: 48px; border-bottom: 1px solid #c5cae9; padding-bottom: 6px; font-size: 1.4em; }
    h3 { color: #3949ab; margin-top: 32px; font-size: 1.1em; }
    h4 { color: #5c6bc0; margin-top: 20px; font-size: 1em; }

    /* Portada y meta */
    .cover { text-align: center; padding: 40px 0 20px; border-bottom: 2px solid #c5cae9; margin-bottom: 40px; }
    .cover h1 { border: none; }
    .cover .subtitle { font-size: 1.15em; color: #555; margin: 4px 0; }
    .meta-badge { display: inline-block; background: #e8eaf6; border-radius: 20px; padding: 4px 14px; font-size: 0.82em; margin: 4px; color: #3949ab; font-weight: 600; }

    /* Tabla de contenidos */
    .toc { background: #f5f5ff; border: 1px solid #c5cae9; border-radius: 8px; padding: 20px 28px; margin: 32px 0; }
    .toc h2 { margin-top: 0; border: none; font-size: 1.1em; }
    .toc ol { margin: 0; padding-left: 20px; }
    .toc li { margin: 4px 0; }
    .toc a { color: #3949ab; text-decoration: none; }
    .toc a:hover { text-decoration: underline; }

    /* Tablas */
    table { border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 0.92em; }
    th { background: #3949ab; color: white; padding: 10px 14px; text-align: left; }
    td { border: 1px solid #c5cae9; padding: 9px 14px; vertical-align: top; }
    tr:nth-child(even) td { background: #f5f5ff; }
    td:first-child { font-weight: 600; color: #3949ab; white-space: nowrap; width: 22%; }

    /* Bloques de requisito */
    .rf-block { background: #fafafa; border-left: 4px solid #3949ab; border-radius: 0 6px 6px 0; padding: 14px 18px; margin: 18px 0; }
    .rf-block h4 { margin: 0 0 10px; color: #1a237e; }
    .rnf-block { background: #fafafa; border-left: 4px solid #00897b; border-radius: 0 6px 6px 0; padding: 14px 18px; margin: 18px 0; }
    .rnf-block h4 { margin: 0 0 10px; color: #00695c; }
    .rnf-block td:first-child { color: #00695c; }

    /* Prioridades MoSCoW */
    .must   { color: #b71c1c; font-weight: 700; }
    .should { color: #e65100; font-weight: 700; }
    .could  { color: #1565c0; font-weight: 600; }
    .wont   { color: #757575; font-style: italic; }

    /* Historial de versiones */
    .version-table th { background: #455a64; }

    /* Apéndices */
    .appendix { background: #fafafa; border: 1px solid #e0e0e0; border-radius: 6px; padding: 16px 20px; margin: 20px 0; }

    /* Print */
    @media print {
      body { max-width: 100%; margin: 0; padding: 12px 24px; font-size: 11pt; }
      .toc, .rf-block, .rnf-block, .appendix { break-inside: avoid; }
      h2, h3 { break-after: avoid; }
      a { color: inherit; text-decoration: none; }
      .meta-badge { border: 1px solid #999; }
    }
  </style>
</head>
<body>

  <!-- PORTADA -->
  <div class="cover">
    <h1>Especificación de Requisitos de Software</h1>
    <p class="subtitle">[Nombre del Proyecto]</p>
    <p>
      <span class="meta-badge">IEEE 830-1998</span>
      <span class="meta-badge">Versión 1.0</span>
      <span class="meta-badge">Fecha: [YYYY-MM-DD]</span>
      <span class="meta-badge">Estado: Borrador</span>
    </p>
  </div>

  <!-- HISTORIAL DE VERSIONES -->
  <h2>Historial de versiones</h2>
  <table class="version-table">
    <tr><th>Versión</th><th>Fecha</th><th>Autor</th><th>Descripción del cambio</th></tr>
    <tr><td>1.0</td><td>[YYYY-MM-DD]</td><td>[Autor]</td><td>Versión inicial del documento</td></tr>
  </table>

  <!-- TABLA DE CONTENIDOS -->
  <nav class="toc">
    <h2>Tabla de contenidos</h2>
    <ol>
      <li><a href="#seccion-1">Introducción</a></li>
      <li><a href="#seccion-2">Descripción general</a></li>
      <li><a href="#seccion-3">Requisitos específicos</a>
        <ol>
          <li><a href="#seccion-3-1">Requisitos funcionales</a></li>
          <li><a href="#seccion-3-2">Requisitos no funcionales</a></li>
          <li><a href="#seccion-3-3">Requisitos de interfaz</a></li>
        </ol>
      </li>
      <li><a href="#apendice-a">Apéndice A — Glosario</a></li>
      <li><a href="#apendice-b">Apéndice B — Matriz de trazabilidad</a></li>
      <li><a href="#apendice-c">Apéndice C — Supuestos documentados</a></li>
    </ol>
  </nav>

  <!-- SECCIÓN 1 -->
  <h2 id="seccion-1">1. Introducción</h2>
  <h3>1.1 Propósito</h3>
  <!-- contenido -->
  <h3>1.2 Alcance del producto</h3>
  <!-- contenido -->
  <h3>1.3 Definiciones, acrónimos y abreviaturas</h3>
  <!-- contenido -->
  <h3>1.4 Referencias</h3>
  <!-- contenido -->
  <h3>1.5 Visión general del documento</h3>
  <!-- contenido -->

  <!-- SECCIÓN 2 -->
  <h2 id="seccion-2">2. Descripción general</h2>
  <h3>2.1 Perspectiva del producto</h3>
  <!-- contenido -->
  <h3>2.2 Funciones del producto</h3>
  <!-- contenido -->
  <h3>2.3 Características de los usuarios</h3>
  <table>
    <tr><th>Actor</th><th>Descripción</th><th>Nivel técnico</th><th>Frecuencia de uso</th></tr>
    <!-- filas -->
  </table>
  <h3>2.4 Restricciones generales</h3>
  <!-- contenido -->
  <h3>2.5 Supuestos y dependencias</h3>
  <!-- contenido -->

  <!-- SECCIÓN 3 -->
  <h2 id="seccion-3">3. Requisitos específicos</h2>

  <h3 id="seccion-3-1">3.1 Requisitos funcionales</h3>

  <!-- RF EJEMPLO — replicar por cada requisito funcional -->
  <div class="rf-block" id="rf-001">
    <h4>RF-001 — [Nombre del requisito]</h4>
    <table>
      <tr><td>ID</td><td>RF-001</td></tr>
      <tr><td>Nombre</td><td>[Nombre]</td></tr>
      <tr><td>Descripción</td><td>[Descripción detallada de qué debe hacer el sistema]</td></tr>
      <tr><td>Actor</td><td>[Actor principal]</td></tr>
      <tr><td>Prioridad</td><td><span class="must">Must</span></td></tr>
      <tr><td>Precondición</td><td>[Estado del sistema antes de ejecutar]</td></tr>
      <tr><td>Postcondición</td><td>[Estado del sistema después de ejecutar exitosamente]</td></tr>
      <tr><td>Flujos alternativos / Excepciones</td><td>[Qué ocurre si falla, datos inválidos, o el actor cancela]</td></tr>
    </table>
  </div>

  <h3 id="seccion-3-2">3.2 Requisitos no funcionales</h3>

  <!-- RNF EJEMPLO — replicar por cada requisito no funcional -->
  <div class="rnf-block" id="rnf-001">
    <h4>RNF-001 — [Nombre del requisito]</h4>
    <table>
      <tr><td>ID</td><td>RNF-001</td></tr>
      <tr><td>Nombre</td><td>[Nombre]</td></tr>
      <tr><td>Categoría</td><td>[Rendimiento / Seguridad / Usabilidad / Disponibilidad / Escalabilidad / Mantenibilidad]</td></tr>
      <tr><td>Descripción</td><td>[Descripción del requisito de calidad]</td></tr>
      <tr><td>Métrica / Criterio de aceptación</td><td>[Valor medible: ej. "Tiempo de respuesta &lt; 2s bajo 500 usuarios concurrentes"]</td></tr>
      <tr><td>Prioridad</td><td><span class="must">Must</span></td></tr>
    </table>
  </div>

  <h3 id="seccion-3-3">3.3 Requisitos de interfaz</h3>
  <h4>3.3.1 Interfaces de usuario</h4>
  <!-- contenido -->
  <h4>3.3.2 Interfaces de hardware</h4>
  <!-- contenido -->
  <h4>3.3.3 Interfaces de software</h4>
  <!-- contenido -->
  <h4>3.3.4 Interfaces de comunicación</h4>
  <!-- contenido -->

  <!-- APÉNDICE A -->
  <h2 id="apendice-a">Apéndice A — Glosario extendido</h2>
  <div class="appendix">
    <table>
      <tr><th>Término</th><th>Definición</th></tr>
      <!-- filas -->
    </table>
  </div>

  <!-- APÉNDICE B -->
  <h2 id="apendice-b">Apéndice B — Matriz de trazabilidad</h2>
  <div class="appendix">
    <table>
      <tr><th>RF-ID</th><th>Nombre</th><th>Módulo</th><th>Actor</th><th>Prioridad</th></tr>
      <!-- filas — una por cada RF -->
    </table>
  </div>

  <!-- APÉNDICE C -->
  <h2 id="apendice-c">Apéndice C — Supuestos documentados</h2>
  <div class="appendix">
    <table>
      <tr><th>ID</th><th>Supuesto</th><th>Impacto si es incorrecto</th></tr>
      <!-- filas -->
    </table>
  </div>

</body>
</html>
```

## Examples

**Input:**
> "Quiero una app para que barberías gestionen sus citas. Los clientes reservan por WhatsApp o web, el dueño ve el calendario y puede bloquear horarios. Pagos con tarjeta al reservar."

**Bloque de análisis que debe producir el Paso 2:**

```
## Análisis previo

**Nombre del proyecto:** Sistema de Gestión de Citas para Barberías
**Dominio:** SaaS B2C para negocios de servicios locales

**Actores identificados:**
- Cliente: persona que reserva la cita por web o WhatsApp
- Dueño/Administrador: gestiona calendario, horarios y bloqueos
- Barbero: recibe asignación de citas (inferido)

**Módulos / áreas funcionales:**
- Reservas (canal web y WhatsApp)
- Calendario y gestión de horarios
- Pagos con tarjeta
- Notificaciones

**Integraciones externas detectadas:**
- WhatsApp Business API: canal de reservas
- Pasarela de pagos (Stripe / MercadoPago): cobro al reservar

**Restricciones tecnológicas mencionadas:**
- Ninguna mencionada explícitamente

**Supuestos realizados:**
- SA-001: El sistema requiere autenticación para el dueño; los clientes no necesitan cuenta registrada
- SA-002: Los pagos son procesados al momento de la reserva, no al finalizar el servicio
- SA-003: Existe al menos un barbero por negocio; la asignación puede ser manual o automática

**Riesgos / ambigüedades a documentar:**
- No se especifica si un cliente puede cancelar/reagendar — se asume que sí (Must)
- No se define el modelo de múltiples sucursales — se excluye de v1 (Won't)
```

**Fragmento de RF resultante:**

```html
<div class="rf-block" id="rf-001">
  <h4>RF-001 — Reserva de cita por canal web</h4>
  <table>
    <tr><td>Actor</td><td>Cliente</td></tr>
    <tr><td>Prioridad</td><td><span class="must">Must</span></td></tr>
    <tr><td>Precondición</td><td>Horarios del negocio configurados y al menos un barbero activo.</td></tr>
    <tr><td>Postcondición</td><td>Cita registrada, cobro procesado, notificación enviada al cliente y al barbero.</td></tr>
    <tr><td>Flujos alternativos</td><td>Si el pago falla, la cita no se confirma y se muestra mensaje de error. Si el horario ya fue tomado, se ofrecen los próximos 3 disponibles.</td></tr>
  </table>
</div>
```

**Archivo creado en Drive:** `ERS - Sistema de Gestión de Citas para Barberías - IEEE 830.html`