/**
 * Minimal ambient types for the OpenCode plugin runtime.
 *
 * The OpenCode plugins (opencode-plugin.ts) are deliberately zero-dependency: the
 * server-side loader injects the plugin API at runtime, so the code never imports
 * `@opencode-ai/plugin`. For `tsc --noEmit` to typecheck them, we declare just the
 * surface we use here. Keep in sync with the shapes used in `stderr/` and
 * `prds/` adapters.
 */
declare namespace OpenCode {
  interface SkillEditor {
    add(cfg: {
      id: string
      name: string
      description: string
      location: string
      content: string
    }): unknown
  }

  interface ReferenceEditor {
    add(name: string, cfg: { type: string; path: string }): unknown
  }

  interface ExecuteBeforeEvent {
    tool: string
    input?: unknown
  }

  interface PluginContext {
    skill: {
      transform(cb: (editor: SkillEditor) => Promise<void> | void): Promise<void>
    }
    reference: {
      transform(cb: (editor: ReferenceEditor) => Promise<void> | void): Promise<void>
    }
    tool: {
      hook(eventType: string, cb: (event: ExecuteBeforeEvent) => void): unknown
    }
  }
}
