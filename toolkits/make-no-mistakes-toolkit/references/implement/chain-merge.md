Sequential merge strategy when processing multiple issues.

## Chain Merge Strategy

When processing multiple issues:

- PRs can be merged in chain (sequentially, not in parallel)
- After each merge, rebase remaining branches onto updated {baseBranch}
- Monitor ALL open PRs for incoming Greptile reviews throughout the chain
- If a later PR conflicts with an earlier merge, resolve immediately
