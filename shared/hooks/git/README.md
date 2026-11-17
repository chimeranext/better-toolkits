# shared/hooks/git

Canonical git guards for Cursor / Claude `beforeShell` adapters.

| File | Role |
| --- | --- |
| `pre-push.sh` | HITL gate for push/merge to `main` + no-squash (`--squash` blocked) |

## Cursor plugin packaging (required)

Adapters under `toolkits/*/hooks/{no-squash,stderr}/adapters/` invoke:

```text
$PLUGIN_HOOKS_DIR/git/pre-push.sh
```

where `$PLUGIN_HOOKS_DIR` is that toolkit’s `hooks/` directory **inside the installed
Cursor plugin package**. They do **not** resolve `shared/hooks/git/` at runtime.

Therefore every toolkit that ships those adapters MUST vendor a copy:

```text
toolkits/<name>/hooks/git/pre-push.sh  ← copy of shared/hooks/git/pre-push.sh
```

Edit **only** `shared/hooks/git/pre-push.sh`, then re-vendor into `toolkits/*/hooks/git/`
in the same PR. Missing copies cause Cursor agents to fail every `git push` with
“No such file or directory” (seen after #163 / #187 when shared landed but packages
did not).
