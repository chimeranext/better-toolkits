# ui-patterns — fuentes externas

Catálogo curado de referencias para diseñar/implementar patrones UI de escritorio y web.
Se agrupan por utilidad. *(Recopilación 2026; verifica disponibilidad.)*

## Galerías y catálogos de componentes
- [The Component Gallery](https://component.gallery/components/) — catálogo de componentes UI con ejemplos de decenas de design systems.
- [UI Skills](https://www.ui-skills.com) — browse de skills UI para design engineers (439 skills).
- [SkillDB · UX Design Patterns](https://skilldb.dev/skills/ux-design-patterns-skills) — skills de UX patterns para agentes.
- [Skills Claude (UI pattern)](https://skillsclaude.org/skills/ui-pattern) — colección de skills UI.

## Repos de skills UI
- [jakubkrehel/skills](https://github.com/jakubkrehel/skills) — agent skills para construir buenas interfaces.
- [Dimillian/Skills · swiftui-ui-patterns](https://github.com/Dimillian/Skills/blob/main/swiftui-ui-patterns/SKILL.md) — patrón SwiftUI.
- [shadcn/ui · skills](https://ui.shadcn.com/docs/skills) — skills para el ecosistema shadcn.
- [TypeUI · design skills](https://www.typeui.sh/design-skills) — design skills para AI.

## Guías y artículos
- [Improving frontend design through Skills](https://claude.com/resources/articles/improving-frontend-design-through-skills) — Anthropic.
- [Top 8 Claude Skills for UI/UX Engineers](https://snyk.io/articles/top-claude-skills-ui-ux-engineers/) — Snyk.
- [UI.sh — skills que hacen ver bien las UIs generadas](https://www.danvega.dev/blog/ui-dot-sh-agent-skills-for-building-beautiful-uis).
- [12 UI/UX Design Skills para agentes](https://www.kimi.ai/resources/ui-ux-design-skills-for-agents) — Kimi.
- [48 design skill files para Claude](https://www.reddit.com/r/ClaudeAI/comments/1rx7v8i/i_built_a_list_of_48_design_skill_files_with/) — Reddit.
- [UI UX Pro Max Skill](https://ui-ux-pro-max-skill.com) — design intelligence para Claude Code.
- [Untitled UI · improve UI design skills](https://www.untitledui.com/blog/ui-design-skills).
- [How to develop UI design skills](https://supercharge.design/blog/how-to-develop-ui-design-skills) — Supercharge.
- [Top 8 soft skills in UI/UX](https://uxdesign.cc/top-8-soft-skills-in-ui-ux-design-e1aedc783ac9) — UX Collective.

## Taxonomías
- [Lightcast · UI/UX Design Patterns taxonomy](https://lightcast.io/taxonomies/skills-taxonomy/KS1593H7BKFC5B0OPMEM/ui-ux-design-patterns).

## Crítica de diseño
- [impeccable.style/docs/critique](https://impeccable.style/docs/critique/) — framework de crítica de diseño (impresionar/mejorar UIs).

## Scraping recursivo
- Para extraer contenido de varias de estas fuentes de forma recursiva: [Scrapling](https://github.com/d4vinci/Scrapling) (scraper Python, soporta JS).
- Algunas (ui-skills.com, skillsclaude.org) son SPA → requieren render JS (Scrapling con `use_stealth`/playwright).
