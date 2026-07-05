<!--
  PLANTILLA DEL INFORME DE ENTRADA — Portal Ejecutivo de Gestión SMG
  ==================================================================
  Este archivo es la plantilla que se usa para pedirle a Rovo (o a
  cualquier otra IA con acceso a Jira/Confluence) que genere el
  Resumen Ejecutivo de cada período (Quarter, Half o Año).

  Reglas de secciones:
    - Sección 1: OBLIGATORIA
    - Secciones 2 y 3: al menos UNA debe estar presente (puede ir
      solo la 2, solo la 3, o ambas — nunca ninguna)
    - Secciones 4 y 5: OBLIGATORIAS
    - Secciones 6 y 7: OPCIONALES

  Reemplazá todo lo que está entre [corchetes]. Las líneas que
  empiezan con "> " son instrucciones para quien completa el
  informe (o para la IA que lo genera) y no van en el documento
  final.
-->

# Resumen Ejecutivo [PERÍODO] — [AUTOR]

**Período:** [DD/MM/AAAA] – [DD/MM/AAAA]
**Rol:** [rol del autor / representante de qué organización ante quién]

---

## Sección 1 — Principales Proyectos y Actividades

> OBLIGATORIA. Repetir el siguiente bloque una vez por cada iniciativa o macro-actividad
> relevante del período. No hay un número fijo de iniciativas: puede haber 4 en un
> trimestre y 9 en otro.
>
> Importante: el trabajo transversal que no pertenece a una sola iniciativa con código
> Jira propio — por ejemplo trabajo técnico general (scripts, automatizaciones,
> estándares) u onboarding/capacitación/coaching — también va ACÁ, como un bloque más,
> con su propio nombre y estructura. No lo diluyas como bullets sueltos dentro de otra
> iniciativa que no tenga relación real.

### [N]. [Nombre de la iniciativa o actividad]

**Iniciativa directriz:** [MASTER-XXXX: nombre completo de la iniciativa en Jira]
> Si el bloque no tiene un código Jira propio (ej. trabajo técnico transversal u
> onboarding), escribir: "Sin iniciativa Jira asociada" o el código más relacionado.

**Estado:** [Finalizada / Entrega / En curso]
**Horas:** [X]h estimadas, [Y]h insumidas
**Inversión:** USD [monto]

[Párrafo descriptivo: qué se hizo y por qué]

**Trabajo realizado:**
- [bullet 1]
- [bullet 2]
- [bullet 3]

**Impacto estimado:** [personas impactadas] · [ahorro anual proyectado, si aplica] · [ROI, si aplica] · [repago, si aplica]

<!-- Repetir el bloque "### [N]. ..." completo por cada iniciativa/actividad adicional -->

---

## Sección 2 — Consolidado de Iniciativas Propias del Frente de Agilidad

> Al menos una de las Secciones 2 o 3 debe existir en el informe (pueden ir ambas).

| Iniciativa | Código | Horas Est. | Horas Ins. | USD | ROI |
|---|---|---|---|---|---|
| [Nombre corto] | [MASTER-XXXX] | [n] | [n] | [monto] | [%] |
| [Nombre corto] | [MASTER-XXXX] | [n] | [n] | [monto] | [%] |
| **Totales** | | **[suma]** | **[suma]** | **[suma]** | — |

---

## Sección 3 — Consolidado de Iniciativas No Propias (a las que se prestó servicio)

> Al menos una de las Secciones 2 o 3 debe existir en el informe (pueden ir ambas).
> Esta sección documenta el trabajo de acompañamiento/consultoría a iniciativas que
> pertenecen a otros equipos o frentes, no al frente de Agilidad.

| Frente / Cliente | Product Manager / Product Owner | Iniciativas atendidas (ejemplos) | Horas dedicadas |
|---|---|---|---|
| [Seguros] | [Nombre PM/PO] | [Nombre iniciativa 1, Nombre iniciativa 2] | [n] |
| [ART] | [Nombre PM/PO] | [Nombre iniciativa 1, Nombre iniciativa 2] | [n] |

---

## Sección 4 — Indicadores Consolidados

> OBLIGATORIA. La lista puede variar según lo relevante del período, pero como mínimo
> debe incluir: iniciativas concretadas, inversión total, horas insumidas, frentes
> atendidos, personas impactadas y ahorro proyectado.

| Indicador | Valor |
|---|---|
| Iniciativas dirigidas y concretadas | [n] |
| Inversión total gestionada | USD [monto] |
| Horas insumidas en iniciativas propias | [n]h |
| Frentes de trabajo atendidos | [n] ([listado de frentes]) |
| Agentes de IA diseñados/construidos | [n] |
| Documentos estructurales producidos | [n] |
| Personas coacheadas/capacitadas | [n] |
| Personas impactadas (alcance de mejoras) | [n]+ |
| Ahorro anual acumulado proyectado | USD [monto] |

---

## Sección 5 — Distribución de Horas entre Clientes Atendidos (Recobro de Servicios)

> OBLIGATORIA. Alimenta los gráficos de distribución de horas por frente y por mes en
> la vista de Indicadores del portal.

| Cliente / Unidad | Total | [Mes 1] | [Mes 2] | [Mes 3] | ... | Frente |
|---|---|---|---|---|---|---|
| [Nombre unidad] | [n] | [n] | [n] | [n] | | [Frente] |
| **Total** | **[suma]** | [suma] | [suma] | [suma] | | |

---

## Sección 6 — Entregables

> OPCIONAL. Incluir solo si hubo artefactos/entregables generados en el período.

| Artefacto | Acceso |
|---|---|
| [Nombre del entregable] | [Link o nombre de archivo] |
| [Nombre del entregable] | [Link o nombre de archivo] |

> ⚠️ Si un artefacto tiene link real, incrustalo como hipervínculo en el texto (aunque
> visualmente solo se vea el nombre del archivo, ej. "Manual de Usuario.docx") en vez
> de dejarlo solo como texto plano sin URL. Cuando se procesa el informe con IA para
> generar el portal, el link incrustado se puede extraer aunque no sea visible.

---

## Sección 7 — Áreas de Mejora y Foco Estratégico del Próximo Período

> OPCIONAL. Incluir si hay líneas de trabajo definidas para el siguiente período.

### [Nombre de la línea de trabajo 1]

[Párrafo de contexto/diagnóstico]

**Meta:** [meta concreta, si aplica]

**Acciones:**
- [acción 1]
- [acción 2]

<!-- Repetir el bloque "### [Nombre...]" por cada línea de trabajo adicional -->

**Resumen de prioridades:**

| Prioridad | Eje | Impacto Esperado |
|---|---|---|
| Alta / Media / Normal | [nombre del eje] | [impacto esperado] |
| Alta / Media / Normal | [nombre del eje] | [impacto esperado] |
