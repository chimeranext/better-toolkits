# DPC — Dependency Caching (doctrina)

## Purpose

Standardize how `better-toolkits` installs and caches dependencies, so every
repo (and every worktree) behaves identically regardless of harness, CI, or
language.

The **pattern is universal**: a content-addressable store, a committed lockfile,
and a frozen install. The specific tool, lockfile, and store path vary by
language.

## The universal pattern (language-agnostic)

1. **Commit the lockfile.** Every repo tracks its lockfile
   (`pnpm-lock.yaml`, `Cargo.lock`, `uv.lock`, `pubspec.lock`, `mix.lock`,
   `composer.lock`, ...). It is the single source of truth for versions.
2. **Install frozen.** Use the tool's frozen/CI install
   (`--frozen-lockfile`, `--locked`, `--frozen`, `npm ci`, ...). No floating
   resolution.
3. **Cache the store.** The dependency store (content-addressable) is shared:
   - **Local**: a global, per-user store (see table).
   - **CI**: an external cache service keyed by lockfile hash.
4. **Symlink out of tree.** `node_modules`/stores are symlinked out of the
   tracked tree (BGI). pnpm does this natively.

## Canonical tools per language

| Language | Manager | Lockfile | Local store / cache |
| --- | --- | --- | --- |
| TypeScript / JS | **pnpm** (canonical) | `pnpm-lock.yaml` | `~/.local/share/pnpm/store` |
| Python | uv (preferred) / poetry | `uv.lock` / `poetry.lock` | `~/.cache/uv` / `~/.cache/pypoetry` |
| Rust | cargo | `Cargo.lock` | `~/.cargo/registry` |
| Dart / Flutter | pub | `pubspec.lock` | `~/.pub-cache` |
| Elixir | mix | `mix.lock` | `~/.hex` |
| Go | go modules | `go.sum` | `$(go env GOMODCACHE)` |
| Java / Kotlin | Gradle / Maven | (gradle/maven lock) | `~/.gradle/caches` / `~/.m2/repository` |
| C# / .NET | dotnet | `packages.lock.json` | `~/.nuget/packages` |
| Ruby | bundler | `Gemfile.lock` | `~/.bundle` / `vendor/bundle` |
| PHP | composer | `composer.lock` | `~/.composer/cache` |
| C / C++ | (vcpkg/conan/cmake) | `vcpkg.json` / `conan.lock` | `~/.cache/vcpkg` / `~/.conan` |
| Swift / Obj-C | SwiftPM | `Package.resolved` | `~/.swiftpm/cache` |
| Scala | sbt | `build.sbt` + lock | `~/.ivy2` / `~/.sbt` |
| Lua | luarocks | (rockspec) | `~/.cache/luarocks` |
| R | renv / pak | `renv.lock` | `~/.cache/R` |
| Haskell | cabal / stack | `cabal.project.freeze` / `stack.yaml.lock` | `~/.cabal` / `~/.stack` |
| Julia | Pkg | `Project.toml` / `Manifest.toml` | `~/.julia/packages` |
| Zig | zig build | `build.zig.zon` | `~/.cache/zig` |
| Crystal | shards | `shard.lock` | `~/.cache/shards` |
| Nim | nimble | `*.nimble.lock` | `~/.nimble/pkgs` |

**pnpm is the canonical manager for Node/JS only.** Other languages use their
native manager from the table above. The DPC pattern (lockfile + frozen +
store cache) applies unchanged.

## Doctrine

1. **Choose the manager per language** from the canonical table. Do not force
   pnpm on a non-JS repo.
2. **Lockfile is the source of truth.** Committed; frozen install in CI.
3. **CI caches the store** keyed by lockfile hash:
   - GitHub Actions: `actions/cache` (or `setup-node cache: pnpm` for JS).
   - Other hosts: see the infrastructure table below.
4. **Local uses the global store.** The per-user store is shared across
   worktrees (no per-worktree reinstall).
5. **The setup script is transport-agnostic.** `setup-worktree.sh`/`.ps1`
   detects the lockfile, runs the correct manager's frozen install, and does
   NOT implement caching (caching lives in the CI workflow or the local store).

## Relation to other standards

- **BGI** (`build-artifacts-gitignore.md`): BGI governs *what* build artifacts
  are ignored or symlinked out of the tracked tree; DPC (this standard) governs
  *how* the dependency store is shared and cached. pnpm's symlinked
  `node_modules` realizes the BGI doctrine natively. (Cross-referenced both
  ways.)
- **WTD** (`worktree-discipline.md`): shared store makes worktrees cheap (no
  reinstall).
- **CIS** (`ci-security-standards.md`): `--frozen-lockfile` is the
  reproducibility gate in CI.

## Alternative CI providers (when migrating off GitHub Actions)

The doctrine holds regardless of the CI host. The cache mechanism varies by how
the runner persists between jobs:

| CI / infra host | Cache mechanism | Persistent between jobs? |
| --- | --- | --- |
| GitHub Actions (hosted) | `actions/cache` (or `setup-node cache: pnpm`), keyed by lockfile hash | yes — external cache service |
| GitLab CI (SaaS/self-hosted) | `cache:` keyword with `key` + `paths` (`~/.local/share/pnpm/store`) | yes — per-branch/key, distributed |
| CircleCI | `save_cache`/`restore_cache` steps, keyed by lockfile hash | yes — distributed cache |
| Bitbucket Pipelines | `caches:` (built-in) or `cache` step with `path` | yes |
| Google Cloud Build | build cache volumes (`volumes`), or `--cache-from` + `/root/.cache` | yes — builder cache via volumes |
| Google Cloud (GCE self-hosted) | in-region GCS bucket cache (accelerates/`places `actions/cache`), with fallback | yes — GCS bucket |
| AWS CodeBuild | `cache:` config (`local` or `S3` bucket), or `S3` cache | yes — S3 bucket |
| AWS CodePipeline + self-hosted | EFS volume mount, or S3 cache layer | yes — EFS/S3 |
| Azure Pipelines (hosted) | `Cache@2` task (or `actions/cache`), keyed by lockfile hash | yes — external cache service |
| Azure + AKS self-hosted | PVC (persistent volume) mounted at store dir; avoid emptyDir | yes — PV |
| OVH / GKE / EKS / AKS (ARC, K8s self-hosted) | **Requires a PersistentVolume (PVC)** mounted at the store dir; emptyDir runner pods do NOT persist the store | only if PVC configured |
| Self-hosted bare VM | local persistent store (`~/.local/share/pnpm/store`) — no cache step needed | yes — runner persists |
| Ephemeral containers / serverless | must use an external object store (S3/GCS/Azure Blob) or cache service | yes — via object store |

**Critical note for containerized self-hosted runners (ARC / K8s):** runner
pods are ephemeral. If the store lives in `emptyDir`, it is lost when the pod
exits — every job re-downloads. Mount the store on a **PersistentVolumeClaim
(PVC)** (or a shared volume backed by object storage) so the cache survives
between jobs. This is the one case where `~/.local/share/pnpm/store` does NOT
"just work" — the store must be a persistent volume.

The invariant is the same everywhere: **cache the store, key by lockfile hash,
install with `--frozen-lockfile`**.
