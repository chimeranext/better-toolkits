---
title: "{{title}}"
aliases: []
date: "{{date}}"
tags: [project, plan, spmp]
status: borrador
standard: ISO/IEC/IEEE 16326:2019
risk_companion: ISO/IEC/IEEE 16085:2021
template_id: iso-16326-spmp
ssot: fractional-cto-toolkit/references/software-project-management-plan
---

# Plan de gestión del proyecto · {{project_name}}

> [!warning] Borrador
> Completar identificación, firmas y puntos abiertos antes de aprobación.

## Portada

| Campo | Valor |
| --- | --- |
| Identificador | {{spmp_id}} |
| Versión | {{version}} |
| Fecha de emisión | {{date}} |
| Estado | Borrador |
| Proyecto | {{project_name}} |
| Emisor | {{issuer}} |
| Cliente | {{customer}} |
| Representante del cliente | {{customer_rep}} |
| Norma | ISO/IEC/IEEE 16326:2019 |
| Riesgos (companion) | ISO/IEC/IEEE 16085:2021 |

El contenido sigue las secciones que ISO/IEC/IEEE 16326:2019 exige en un plan de gestión de proyecto. Si una sección no tiene plan propio, el texto dice por qué (`N/A` + motivo).

## Historial de cambios

| Versión | Fecha | Cambio | Motivo |
| --- | --- | --- | --- |
| 0.1 | {{date}} | Primera redacción | Arranque del plan |

## Registro de aprobación

| Rol | Nombre | Firma | Fecha |
| --- | --- | --- | --- |
| Autor del plan | | | |
| Representante del cliente | | | |

## 1. Visión general del proyecto

### 1.1 Resumen

{{summary}}

### 1.2 Propósito, alcance y objetivos

{{purpose_scope_objectives}}

## 2. Referencias

| Ref | Documento |
| --- | --- |
| R1 | ISO/IEC/IEEE 16326:2019 |
| R2 | ISO/IEC/IEEE 16085:2021 (gestión de riesgos del proyecto) |
| R3 | {{prd_or_spec_link}} |

## 3. Definiciones

| Término | Definición |
| --- | --- |
| SPMP | Software / Systems Project Management Plan |
| Línea base | Alcance aprobado para esta versión del plan |

## 4. Contexto del proyecto

### 4.1 Modelo de proceso

{{process_model}}

### 4.2 Restricciones

{{constraints}}

### 4.3 Supuestos

{{assumptions}}

### 4.4 Métodos, herramientas y técnicas

{{methods_tools}}

### 4.5 Aceptación del producto

{{acceptance}}

### 4.6 Estructura organizativa e interfaces

{{org_interfaces}}

> No copiar el organigrama del cliente como ley de carpetas del vault. Interfaces van aquí como datos; la topología del brain se elige en `/business-brain-setup` (Reverse Conway).

## 5. Planificación del proyecto

### 5.1 Estimaciones

{{estimates}}

### 5.2 Dotación / staffing

{{staffing}}

### 5.3 Actividades (EDT / WBS)

{{wbs}}

### 5.4 Calendario e hitos

{{schedule}}

### 5.5 Presupuesto y recursos

{{budget_resources}}

## 6. Evaluación y control

### 6.1 Monitoreo

{{monitoring}}

### 6.2 Umbrales de control

{{control_thresholds}}

### 6.3 Informes

{{reporting}}

### 6.4 Acción correctiva / órdenes de cambio

{{corrective_action}}

## 7. Entrega del producto

{{product_delivery}}

## 8. Procesos de soporte

### 8.1 Aseguramiento de la calidad

{{qa}}

### 8.2 Verificación, validación y pruebas

{{vv_test}}

### 8.3 Gestión de riesgos

Companion por defecto: **ISO/IEC/IEEE 16085:2021** — ver plantilla
`iso-16085-risk-management-plan.md` (inline o documento enlazado).

{{risk_management_summary_or_link}}

Registro / perfil de riesgos (resumen):

| Id | Categoría | Riesgo | Probabilidad | Impacto | Tratamiento |
| --- | --- | --- | --- | --- | --- |
| R-01 | | | | | |

### 8.4 Gestión de configuración

{{configuration_management}}

### 8.5 Gestión de la información

{{information_management}}

### 8.6 Comunicación

{{communication}}

## 9. Planes adicionales

This section is not applicable to this plan — {{additional_plans_na_reason}}

## Anexo A. Puntos abiertos

| Id | Punto | Dueño | Estado |
| --- | --- | --- | --- |
| A-01 | | | abierto |
