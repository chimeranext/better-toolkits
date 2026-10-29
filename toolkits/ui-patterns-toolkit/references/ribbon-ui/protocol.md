# /ribbon-ui — protocol SSOT

Patrón de UI de escritorio **Ribbon** (colapsible). Framework-agnostic: documenta la
anatomía y variantes; cada implementación concreta vive en su repo.

## Anatomía (referencia OpenCADStudio / Office / AutoCAD)

```
┌─────────────────────────────── Ribbon ───────────────────────────────┐
│ TAB BAR: [ Home | Progreso | Guías | Editor YAML | … ]   [🎨][⏷ ] │
│ ──────────────────────────────────────────────────────────────────── │
│ TOOL AREA (~96px)                                                    │
│ [ Grupo A ] [ Grupo B ] [ Grupo C ]                                  │
│  ┌────────┐  ┌────────┐  ┌────────┐                                 │
│  │ ⚙ Acción│  │ ⚙ Acción│  │ ⚙ Acción│                                 │
│  │ ⚙ Acción│  └────────┘  │ ⚙ Acción│                                 │
│  └────────┘              └────────┘                                 │
│  "Selección"              "Portapapeles"                             │
└──────────────────────────────────────────────────────────────────────┘
```

- **Tab bar**: tabs de texto; la activa subrayada con color de acento.
- **Tool area** (~96px): paneles horizontales (`RibbonGroup`), cada uno con fila de
  botones grandes (`RibbonToolButton` = icono + etiqueta) y título de grupo abajo.
- **Colapso total**: a solo tab bar con el botón del extremo derecho (`ExpandLess`/
  `ExpandMore`), estilo AutoCAD.

## Variantes (implementaciones de referencia)

| Variante | Dónde | Notas |
|---|---|---|
| **React (MUI)** | — | anatomía fiel, `useState(collapsed)`, specs por tab |
| **iced.rs** | OpenTwinBuilder (repo separado) | pendiente de implementación |
| WinUI 3 (CommandBar/NavigationView) | patrón de Windows Desktop | CommandBar (variante futura) |
| Flutter | — | variante futura |

## Referencias de catálogo

- [The Component Gallery](https://component.gallery/components/) — catálogo de
  componentes UI (Tabs, Button group/Toolbar, Accordion/Collapse…) para consulta al
  diseñar patrones.
- OpenCADStudio `src/ui/ribbon` (`mod.rs` + `widgets.rs` + `collapse.rs`) — fuente de
  la anatomía.

## Checklist de implementación

1. Modelos: `RibbonTab`, `RibbonGroup`, `RibbonCommand` (label, icon, tip, on_click, disabled).
2. Widget `Ribbon`: tab bar + tool area + toggle colapso.
3. Tool area: `Row` de `RibbonGroup`; cada grupo = `Column` (comandos) + título.
4. Estado `collapsed` controla ocultar tool area.
5. Conectar comandos a la app (acciones reales, no placeholders).

## Criterio

El patrón está **documentado** cuando un dev puede implementarlo en otro framework solo
con este protocolo + las variantes. No es un script; es una spec de UI.
