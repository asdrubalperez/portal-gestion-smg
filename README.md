# Portal Ejecutivo de Gestión — Swiss Medical Group

Portal ejecutivo que visibiliza la gestión del frente de Agilidad, Metodologías e IA
ante Swiss Medical Group, período a período (Quarter, Half o Año).

**URL en producción:** `gestion-smg.asdru.space`

---

## 1. Estructura del repositorio

```
portal-gestion-smg/
├── index.html              # Shell de la app + manifiesto de períodos (ver sección 4)
├── styles.css               # Estilos — no cambia con cada período
├── app.js                   # Router + lógica de render — no cambia con cada período
├── REPORT_TEMPLATE.md        # Plantilla del informe de entrada (ver sección 2)
├── data/
│   └── H1-2026.json         # Datos del período H1 2026
│   └── <periodo>.json       # Un archivo por cada período agregado a futuro
└── input_reports/           # Informes de origen ya completados (ignorado por git, ver .gitignore)
```

`index.html`, `styles.css` y `app.js` son fijos: casi nunca hace falta tocarlos al
actualizar el portal. Lo único que crece con el tiempo es la carpeta `data/`.

### Cómo funciona (resumen)

- Es una sola página (`index.html`) con una sola URL para siempre.
- `index.html` incluye un pequeño manifiesto (`PERIODS_META`) que lista los períodos
  disponibles y cuál es el vigente (`isCurrent: true`).
- Al entrar al portal, `app.js` carga (`fetch`) el JSON del período vigente y arma la
  interfaz. Los demás períodos solo se descargan si el usuario los selecciona.
- El período elegido queda codificado en la URL (ej. `#/H1-2026/iniciativa/gdd`), por
  lo que cualquier vista es enlazable directamente.

> ⚠️ Como usa `fetch()`, no funciona abriendo `index.html` con doble clic
> (`file://`). Para probar localmente, corré `npx serve` en la carpeta y abrí la URL
> que te indique, o simplemente probá contra el preview que genera Vercel en cada push.

---

## 2. El informe de entrada (PDF o documento de Rovo)

Cada período se genera a partir de un informe con una **estructura estandarizada de 7
secciones**, documentada en detalle en [`REPORT_TEMPLATE.md`](./REPORT_TEMPLATE.md).
Ese archivo es la plantilla que se le pasa a Rovo (o a cualquier IA con acceso a
Jira/Confluence) para generar el informe de cada período, con placeholders listos para
completar.

**Reglas de secciones:**

| Sección | Obligatoriedad |
|---|---|
| 1 — Principales Proyectos y Actividades | **Obligatoria** |
| 2 — Consolidado de Iniciativas Propias | Al menos una entre 2 y 3 |
| 3 — Consolidado de Iniciativas No Propias (a las que se prestó servicio) | Al menos una entre 2 y 3 |
| 4 — Indicadores Consolidados | **Obligatoria** |
| 5 — Distribución de Horas (Recobro de Servicios) | **Obligatoria** |
| 6 — Entregables | Opcional |
| 7 — Áreas de Mejora y Foco Estratégico | Opcional |

**Puntos importantes a tener en cuenta al completar el template:**

- **Sección 1**: el trabajo transversal que no pertenece a una sola iniciativa con
  código Jira propio (trabajo técnico general, onboarding, capacitación, coaching) va
  ahí también, **como un bloque de iniciativa más** — no como bullets sueltos dentro de
  otra iniciativa sin relación real. Esto es lo que le permite al portal mostrarlo como
  su propia tarjeta en vez de perderlo dentro de otra.
- **Sección 3** es la que formaliza el trabajo de acompañamiento a iniciativas de otros
  equipos (lo que hoy en el portal se ve en la vista "Frentes de Trabajo"). Completarla
  con números reales (no solo nombres de ejemplo) permite que esa vista muestre datos
  concretos en vez de una lista ilustrativa.
- **Entregables** (Sección 6): si un artefacto tiene link real, incrustalo como
  hipervínculo en el texto aunque visualmente se vea solo el nombre del archivo — se
  puede extraer al procesar el informe aunque no aparezca como URL escrita. Lo mismo
  aplica a cualquier código `MASTER-XXXX` mencionado en el informe: su link a
  `https://swiss-medical.atlassian.net/browse/MASTER-XXXX` puede estar incrustado sin
  mostrarse como texto.

Guardá el informe del período en `input_reports/` (queda solo en tu máquina, no se sube
al repositorio).

---

## 3. Proceso de actualización (agregar un nuevo período)

Ejemplo: llega el informe de **Q3 2026**.

### Paso 1 — Generar el informe con Rovo y procesarlo con Claude
Pasale a Rovo el contenido de [`REPORT_TEMPLATE.md`](./REPORT_TEMPLATE.md) como
instrucción, pidiéndole que complete cada sección con la información real de Jira/
Confluence del nuevo período (recordale las reglas de secciones obligatorias/opcionales
del punto 2 de este README).

Con el informe ya generado, abrí una conversación con Claude (puede ser esta misma u
otra nueva) y subíselo. Pedile algo como:

> "Te paso el informe de Q3 2026. Generame el archivo `data/Q3-2026.json` para el
> portal, con la misma estructura que `H1-2026.json`, y decime exactamente qué agregar
> en el manifiesto de `index.html`."

Claude va a entregarte:
- El archivo `data/Q3-2026.json` completo
- La línea nueva para agregar en `PERIODS_META` dentro de `index.html`

### Paso 2 — Copiar el archivo nuevo
Copiá `Q3-2026.json` a la carpeta `data/` de tu repo local.

### Paso 3 — Actualizar el manifiesto en `index.html`
Abrí `index.html` y en el bloque `PERIODS_META`:

```js
var PERIODS_META = [
  { id: "H1-2026", label: "H1 2026", file: "data/H1-2026.json", isCurrent: false },   // <- pasa a false
  { id: "Q3-2026", label: "Q3 2026", file: "data/Q3-2026.json", isCurrent: true },    // <- nuevo, en true
];
```

Reglas:
- **Un solo período** debe tener `isCurrent: true` — es el que se muestra por defecto
  al entrar al portal.
- El orden del array define el orden en el selector.
- El `id` debe ser único y coincidir con el nombre del archivo (sin `.json`).

### Paso 4 — Subir los cambios

```bash
cd "C:\Users\Asdrubal Perez\Documents\Github Devs\portal-gestion-smg"
git add .
git commit -m "Agregar período Q3 2026"
git push
```

Vercel redeploya automáticamente. No hace falta tocar nada de la configuración del
dominio ni del proyecto — eso quedó resuelto una sola vez.

### Convención de IDs de período

| Tipo de período | Formato de `id` | Ejemplo |
|---|---|---|
| Quarter | `Q<n>-<año>` | `Q3-2026` |
| Half | `H<n>-<año>` | `H2-2026` |
| Año completo | `Año-<año>` | `Año-2026` |

---

## 4. Diseño (referencia rápida)

- Paleta de marca (rojo institucional, sidebar): `#A82C30` — pastilla activa en negro `#1C1C1E`
- Colores de estado (extraídos de GIGA): Finalizada = verde `#197B53` / `#E2F5EE`,
  Entrega = azul `#246178` / `#E3F4F8`, En curso = gris `#617086` / `#DFE8F1`
- Prioridad en Próximos Pasos: Alta = rojo, Media = amarillo `#B7791F`, Normal/Baja = verde
- Tipografía: Inter (UI), IBM Plex Mono (cifras/KPIs)

Estos valores viven como variables CSS al inicio de `styles.css` — no debería hacer
falta tocarlos al actualizar un período.
