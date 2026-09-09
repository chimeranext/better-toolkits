// Doctrine copy — surfaces docs/multi-harness-ssot.md + docs/hitl.md on the public site.
import type { Lang } from "@/lib/copy";

export type DoctrineContent = {
  pageEyebrow: string;
  title: string;
  subtitle: string;
  back: string;
  sourceNote: string;
  pillarsTitle: string;
  pillars: { name: string; doc: string; purpose: string }[];
  hitlTitle: string;
  hitlRules: string[];
  hitlSurfacesTitle: string;
  hitlSurfaces: { harness: string; wire: string }[];
  ssotTitle: string;
  ssotRows: { name: string; location: string; purpose: string }[];
  protocolTitle: string;
  protocolRules: string[];
  runtimeTitle: string;
  runtimeRules: string[];
  pilotTitle: string;
  pilotBody: string;
  harnessTitle: string;
  harnessRows: { harness: string; wire: string }[];
  domainNote: string;
};

export const DOCTRINE: Record<Lang, DoctrineContent> = {
  en: {
    pageEyebrow: "Repo doctrine",
    title: "Two pillars",
    subtitle:
      "Multi-harness SSOT keeps protocols and stderr one place. HITL keeps shared-state mutations behind an explicit human OK — not a buried --execute flag.",
    back: "← Home",
    sourceNote:
      "Canonical markdown: docs/hitl.md · docs/multi-harness-ssot.md · OpenSpec change 2026-08-20-multi-harness-ssot",
    pillarsTitle: "Pillars",
    pillars: [
      {
        name: "HITL",
        doc: "docs/hitl.md",
        purpose:
          "After a plan whose natural next step mutates shared state, ask and wait. The approval question is the product.",
      },
      {
        name: "Multi-harness SSOT",
        doc: "docs/multi-harness-ssot.md",
        purpose:
          "One protocol markdown contract. One stderr detector. N thin entries per harness — not a Cursor-vs-Claude dichotomy.",
      },
    ],
    hitlTitle: "HITL rules",
    hitlRules: [
      "Applies repo-wide to every toolkit, command, skill, and agent — not only make-no-mistakes.",
      "Shared-state examples: gh pr merge / create mode, force-with-lease on published history, tracker → Done, worktree delete, prod ops, regenerating base-anchored artifacts for the open PR set.",
      "Local measure / edit / test may proceed without per-action approval until that boundary.",
      "Do not bury the obvious follow-through behind --execute or end with “run these yourself” when the user asked for the outcome.",
      "Never offer --admin / --force / merge-past-red as menu options. If blocked, the block is the finding.",
    ],
    hitlSurfacesTitle: "HITL ask surface",
    hitlSurfaces: [
      { harness: "Claude Code", wire: "AskUserQuestion" },
      {
        harness: "Cursor",
        wire: "Numbered options in the main conversation + wait for an explicit reply (silence ≠ yes)",
      },
      {
        harness: "Background sub-agent",
        wire: "Emit pause JSON; orchestrator asks and relays — sub-agent must not ask directly",
      },
    ],
    ssotTitle: "Two orthogonal SSOTs",
    ssotRows: [
      {
        name: "Protocol",
        location: "toolkits/<name>/references/<cmd-or-domain>/ (+ templates/)",
        purpose: "HOW for commands and skills — harness-agnostic markdown",
      },
      {
        name: "Runtime stderr",
        location: "shared/hooks/stderr/ (vendored into every toolkit)",
        purpose: "Block shell stderr discards — one detect.py, N wire-ups",
      },
    ],
    protocolTitle: "Protocol rules",
    protocolRules: [
      "Entry thin (≤ ~120 lines): Claude commands/*.md, Cursor skills/*/SKILL.md when / must surface it.",
      "Body lives in references/. No second protocol body per harness.",
      "Harness notes go under references/.../adapters/ or entry footnotes.",
    ],
    runtimeTitle: "Runtime stderr rules",
    runtimeRules: [
      "Canonical tree: shared/hooks/stderr/ (detect.py + adapters + tests).",
      "Every toolkit Claude hooks/hooks.json registers PreToolUse Bash → claude adapter.",
      "OpenCode: register hooks/stderr/adapters/opencode-plugin.ts. Cursor: beforeShellExecution. Antigravity/Codex: detect.py --command.",
      "Opt-out: MNM_DISABLE_STDERR_HOOK=1, stderr-hooks.json preserve_stderr:false, or disable the OpenCode plugin.",
      "Done criterion: a session with only toolkit T installed still blocks 2>/dev/null.",
    ],
    pilotTitle: "Pilot",
    pilotBody:
      "HITL: /merge-advisor and /implement hard STOP gates in make-no-mistakes. SSOT: /implement → references/implement/* + templates/bilingual-issue-brief.md; fat commands across the monorepo use thin-entry → references/<cmd>/protocol.md.",
    harnessTitle: "Harness wire-up matrix (stderr)",
    harnessRows: [
      { harness: "Claude Code", wire: "Plugin hooks/hooks.json → PreToolUse Bash → claude-pre-bash.sh" },
      { harness: "Cursor", wire: "beforeShellExecution → cursor-before-shell.sh" },
      { harness: "OpenCode V2", wire: "File plugin opencode-plugin.ts in opencode config" },
      { harness: "Antigravity / Codex / Kiro / Grok", wire: "pre-exec: python3 detect.py --command \"$CMD\"" },
    ],
    domainNote:
      "This site is published for toolkits.chimeranext.dev. Until DNS + GitHub Pages custom domain are live, the same build also serves on GitHub Pages (project URL).",
  },
  es: {
    pageEyebrow: "Doctrina del repo",
    title: "Dos pilares",
    subtitle:
      "Multi-harness SSOT deja protocolos y stderr en un solo lugar. HITL deja las mutaciones de estado compartido detrás de un OK humano explícito — no detrás de un --execute enterrado.",
    back: "← Inicio",
    sourceNote:
      "Markdown canónico: docs/hitl.md · docs/multi-harness-ssot.md · OpenSpec 2026-08-20-multi-harness-ssot",
    pillarsTitle: "Pilares",
    pillars: [
      {
        name: "HITL",
        doc: "docs/hitl.md",
        purpose:
          "Después de un plan cuyo siguiente paso natural muta estado compartido, preguntá y esperá. La pregunta de aprobación es el producto.",
      },
      {
        name: "Multi-harness SSOT",
        doc: "docs/multi-harness-ssot.md",
        purpose:
          "Un contrato markdown de protocolo. Un detector de stderr. N entries finas por harness — no una dicotomía Cursor vs Claude.",
      },
    ],
    hitlTitle: "Reglas HITL",
    hitlRules: [
      "Aplica a todo el monorepo: cada toolkit, command, skill y agent — no solo make-no-mistakes.",
      "Ejemplos de estado compartido: gh pr merge / modo de create, force-with-lease sobre historia publicada, tracker → Done, borrar worktree, ops de prod, regenerar artefactos anclados a la base para el set de PRs abiertos.",
      "Medir / editar / testear en local puede seguir sin aprobación por acción hasta ese límite.",
      "No enterrar el follow-through obvio detrás de --execute ni terminar con «corré vos estos comandos» cuando el usuario pidió el resultado.",
      "Nunca ofrecer --admin / --force / merge-past-red como opciones de menú. Si está bloqueado, el bloqueo es el hallazgo.",
    ],
    hitlSurfacesTitle: "Superficie para preguntar",
    hitlSurfaces: [
      { harness: "Claude Code", wire: "AskUserQuestion" },
      {
        harness: "Cursor",
        wire: "Opciones numeradas en la conversación principal + esperar respuesta explícita (silencio ≠ sí)",
      },
      {
        harness: "Sub-agente en background",
        wire: "Emitir pause JSON; el orquestador pregunta y retransmite — el sub-agente no pregunta directo",
      },
    ],
    ssotTitle: "Dos SSOTs ortogonales",
    ssotRows: [
      {
        name: "Protocolo",
        location: "toolkits/<name>/references/<cmd-or-domain>/ (+ templates/)",
        purpose: "HOW de commands y skills — markdown agnóstico al harness",
      },
      {
        name: "Runtime stderr",
        location: "shared/hooks/stderr/ (vendored en cada toolkit)",
        purpose: "Bloquear descarte de stderr en shell — un detect.py, N wire-ups",
      },
    ],
    protocolTitle: "Reglas de protocolo",
    protocolRules: [
      "Entry fino (≤ ~120 líneas): Claude commands/*.md, Cursor skills/*/SKILL.md cuando / deba surfacearlo.",
      "El cuerpo vive en references/. Sin segundo protocolo por harness.",
      "Notas de harness en references/.../adapters/ o footnotes del entry.",
    ],
    runtimeTitle: "Reglas de stderr runtime",
    runtimeRules: [
      "Árbol canónico: shared/hooks/stderr/ (detect.py + adapters + tests).",
      "Cada toolkit Claude hooks/hooks.json registra PreToolUse Bash → claude adapter.",
      "OpenCode: registrar hooks/stderr/adapters/opencode-plugin.ts. Cursor: beforeShellExecution. Antigravity/Codex: detect.py --command.",
      "Opt-out: MNM_DISABLE_STDERR_HOOK=1, stderr-hooks.json preserve_stderr:false, o deshabilitar el plugin OpenCode.",
      "Criterio de done: sesión con solo el toolkit T instalado sigue bloqueando 2>/dev/null.",
    ],
    pilotTitle: "Piloto",
    pilotBody:
      "HITL: hard STOP de /merge-advisor y /implement en make-no-mistakes. SSOT: /implement → references/implement/* + templates/bilingual-issue-brief.md; commands gordos del monorepo: entry fino → references/<cmd>/protocol.md.",
    harnessTitle: "Matriz de wire-up por harness (stderr)",
    harnessRows: [
      { harness: "Claude Code", wire: "Plugin hooks/hooks.json → PreToolUse Bash → claude-pre-bash.sh" },
      { harness: "Cursor", wire: "beforeShellExecution → cursor-before-shell.sh" },
      { harness: "OpenCode V2", wire: "File plugin opencode-plugin.ts en la config de opencode" },
      { harness: "Antigravity / Codex / Kiro / Grok", wire: "pre-exec: python3 detect.py --command \"$CMD\"" },
    ],
    domainNote:
      "Este sitio se publica para toolkits.chimeranext.dev. Hasta que DNS + custom domain de GitHub Pages estén vivos, el mismo build también sirve en GitHub Pages (URL de proyecto).",
  },
};
