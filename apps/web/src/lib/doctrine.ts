// Doctrine copy — surfaces docs/multi-harness-ssot.md on the public site.
import type { Lang } from "@/lib/copy";

export type DoctrineContent = {
  title: string;
  subtitle: string;
  back: string;
  sourceNote: string;
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
    title: "Multi-harness SSOT",
    subtitle:
      "One protocol markdown contract. One stderr detector. N thin entries per harness — Claude Code, Cursor, OpenCode2, Antigravity, and friends. Not a Cursor-vs-Claude dichotomy.",
    back: "← Home",
    sourceNote: "Canonical markdown in the repo: docs/multi-harness-ssot.md · OpenSpec change 2026-08-20-multi-harness-ssot",
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
      "make-no-mistakes /implement → references/implement/* + templates/bilingual-issue-brief.md. Fat commands across the monorepo follow the same thin-entry → references/<cmd>/protocol.md shape.",
    harnessTitle: "Harness wire-up matrix",
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
    title: "Multi-harness SSOT",
    subtitle:
      "Un contrato markdown de protocolo. Un detector de stderr. N entries finas por harness — Claude Code, Cursor, OpenCode2, Antigravity y compañía. No es una dicotomía Cursor vs Claude.",
    back: "← Inicio",
    sourceNote: "Markdown canónico en el repo: docs/multi-harness-ssot.md · OpenSpec 2026-08-20-multi-harness-ssot",
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
      "make-no-mistakes /implement → references/implement/* + templates/bilingual-issue-brief.md. Los commands gordos del monorepo siguen la misma forma entry fino → references/<cmd>/protocol.md.",
    harnessTitle: "Matriz de wire-up por harness",
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
