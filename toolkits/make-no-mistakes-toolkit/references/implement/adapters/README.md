# Implement protocol — harness entry matrix

**Protocol SSOT:** `references/implement/*.md` (harness-agnostic).  
**Thin entries** only differ by how the UI invokes the same SSOT.

| Harness | Entry | How to load SSOT |
|---------|-------|------------------|
| **Claude Code** | `commands/implement.md` (`/make-no-mistakes:implement`) | Orchestrator lists files; agent Reads each |
| **Cursor** | `skills/implement/SKILL.md` (`/implement`) | Same list; router skill `implement-advisor` gates Bilingual first |
| **OpenCode V2** | Plugin command / skill install | See [`opencode.md`](opencode.md) |
| **Antigravity / Codex / Kiro / Grok CLI** | Docs + paste / skill path | See [`antigravity.md`](antigravity.md) |

Do not maintain a second protocol body per harness.
