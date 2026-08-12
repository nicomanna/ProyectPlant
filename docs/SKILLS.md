# Skills Instaladas

> Última actualización: 2026-08-11
> Este archivo registra todas las skills, extensiones, MCP servers y herramientas
> especializadas disponibles en el entorno de desarrollo (Claude Code).

---

## ¿Qué son las Skills?

Las skills son capacidades especializadas que la IA puede usar para implementar
funcionalidades de forma más eficiente y correcta. Antes de implementar cualquier
feature, la IA DEBE consultar este archivo para verificar si existe una skill
relevante.

---

## Skills Activas

| # | Nombre | Tipo | Descripción | Usar cuando |
|---|--------|------|-------------|-------------|
| 1 | `ui-styling` | Skill (Claude Code) | Construcción de UI accesible con Tailwind CSS, componentes shadcn/ui, temas y dark mode | Al maquetar el dashboard, login, componentes de `components/ui` |
| 2 | `ui-ux-pro-max` | Skill (Claude Code) | Guía de UI/UX: paletas de color, tipografía, patrones de layout, estilos (incluye estilos "3D a color" / ilustrativos) | Al diseñar la pantalla principal con la planta 3D animada y carita feliz |
| 3 | `dataviz` | Skill (Claude Code) | Guía de diseño para gráficos y dashboards (colores, ejes, tooltips, leyendas) | Al construir los gráficos históricos de sensores (FASE 2, feature de gráficos) |
| 4 | `run` | Skill (Claude Code) | Levanta y prueba la app real en el navegador para verificar una feature funcionando | Después de implementar cada feature de UI, antes de darla por completa |
| 5 | `code-review` | Skill (Claude Code) | Revisión de diffs por correctitud, simplificación y eficiencia | Antes de cerrar features grandes (auth, ingest de sensores, cálculo de puntos) |
| 6 | `security-review` | Skill (Claude Code) | Revisión de seguridad del diff pendiente | Antes de deploy, y siempre después de tocar auth/`ESP32_INGEST_SECRET`/RLS |

---

## MCP Servers Conectados

| # | Servidor | Herramientas | Descripción | Usar cuando |
|---|----------|-------------|-------------|-------------|
| _(ninguno relevante para el desarrollo del código de este proyecto por ahora)_ | | | | |

---

## Historial de Skills

| Fecha | Acción | Skill | Motivo |
|-------|--------|-------|--------|
| 2026-08-11 | Registrada | `ui-styling`, `ui-ux-pro-max`, `dataviz`, `run`, `code-review`, `security-review` | Setup inicial (FASE 1) — skills del entorno Claude Code relevantes para este proyecto |
