# Test Assertion Standards (TAS)

Portable rule for **writing tests that do not drift**. A test must assert a
**contract** (a stable invariant or relationship), never a **snapshot** (an
absolute count of a registry that grows with the repo).

**Provenance:** field-hardened after `shared/bootstrap/cli/test/cli.test.js`
asserted `assert.equal(npm.length, 4)` — a literal count of `NPM_PACKAGES`.
When packages were added, the test drifted (12→18, 13→19) and had to be
hand-edited. The fix replaced literals with the relationship
`NPM_PACKAGES.length` and structural invariants.

---

## Principles

1. **Assert the contract, not the snapshot.** A test should stay valid when the
   repo grows without a code change to the test. If a test needs editing purely
   because the source registry gained an entry, the test asserted the wrong thing.
2. **Derive counts from the source of truth.** When a count must be checked,
   reference the imported source (e.g. `NPM_PACKAGES.length`), never a literal.
3. **Prefer behavior over implementation detail.** Assert outcome and
   relationships, not equality to an internal constant you happen to see.
4. **Frozen business data is the exception.** A genuinely fixed value (a schema
   cardinality, a fixture with a fixed shape) is fine, but name it and comment
   why it is frozen.

---

## Rules

### Do not

- `assert.equal(array.length, 4)` for an array that is a growing registry
  (packages, skills, toolkits, config entries).
- Hardcode a count that equals the current state of a source array.
- Mock a registry size to lock it in place.

### Do

- Assert **relationships**: e.g. `npm.length === NPM_PACKAGES.length`.
- Assert **structural invariants**: uniqueness, every element satisfies a
  property, superset/inclusion relations.
- Assert **behavior**: "the lock runs the callback once", not a snapshot count.

### Checklist

- [ ] Does this assertion still hold if the repo grows 2×? If not, replace it
      with an invariant or a source-derived relationship.
- [ ] Is every numeric literal either derived from an import or a named frozen
      constant with a comment?

---

## Multi-language coverage

The rule applies to every language in the code conventions that writes test
assertions. The deterministic checker (`scripts/lint/detect_code_smells.py`,
hook `code-smells`) recognizes the assertion syntax of each:

| Language | Assertion form flagged |
| --- | --- |
| TypeScript / JavaScript | `expect(x).toHaveLength(N)`, `assert.equal(x.length, N)`, `expect(x.length).toBe(N)` |
| Python | `assert len(x) == N` |
| Shell | `${#arr[@]} -eq N` (and -ne/-lt/-le/-gt/-ge) |
| PHP (PHPUnit) | `assertCount(N, $x)` |
| PowerShell (Pester) | `$x.Count -eq N` |
| Dart | `expect(x.length, N)`, `expect(x, hasLength(N))` |
| Elixir | `assert length(x) == N` |
| Rust | `assert_eq!(x.len(), N)` |
| Go | `require.Len(t, x, N)`, `len(x) != N` |
| Markdown / JSON / YAML / HTML / Dockerfile | no test assertions — n/a |

Enforcement: WARN (advisory) so legacy does not block CI; flip to HARD only
after the documented sweep clears existing hits. A literal count tied to a local
fixture or a validated transformation may be exempted via the explicit token
`# tas: fixture`.

---

## Deterministic propagation

The rule is enforced as a **versioned, gated deterministic** process, not as
prose:

1. **Detector (source of truth):** `scripts/lint/detect_code_smells.py`
   (hook `code-smells`, `pass_filenames`). It flags literal count assertions.
2. **Refinement (semantic):** a literal is flagged only when it has no local
   source — i.e. it is not derived from a fixture constant
   (`toHaveLength(FIXTURE.comments.length)`), is not a key-set equality
   (`new Set(Object.keys(X))` vs `new Set([...])`), and carries no explicit
   `# tas: fixture` token.
3. **Sweep:** existing hits are removed (each literal becomes derived/named/set
   equality). After the sweep, the repo reports 0 TAS findings.
4. **Gate flip:** the rule moves from WARN to **HARD** and CI asserts **0
   findings** — any new unsourced literal blocks the commit/PR.

Order invariant: never flip to HARD before the sweep is at 0.

**Learner summary:** internal-handbook `docs/how-to/engineering-standards/TAS.md`.

---

## Related

- [QT4L](qa-traceability-four-layers.md) — traceability layers (req → test → QA → HITL).
- [AFIF](anti-fragility-fault-injection.md) — harden tests by injecting faults, not by pinning state.
- [DSMS / IFS / CPS](dsms-ifs-cps.md) — code organization that keeps structure stable to test.
