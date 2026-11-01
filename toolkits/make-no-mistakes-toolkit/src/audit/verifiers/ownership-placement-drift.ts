/**
 * One module in the repo that is subject to ownership/placement review. `path`
 * is repo-relative. `owner` is OPTIONAL: when present it is the module's own
 * declared/assigned owner (e.g. from CODEOWNERS or an explicit ownership map),
 * used to detect "wrong owner" placement.
 */
export interface SourceModule {
  path: string;
  owner?: string;
}

/**
 * A declared ownership/placement rule: the path `prefix` (repo-relative) is
 * owned/placed under the logical `owner` (a component, team, or bounded
 * context). A path's owner is the rule with the LONGEST matching prefix
 * (most specific wins).
 */
export interface OwnershipPlacement {
  prefix: string;
  owner: string;
}

/** The kinds of placement drift this verifier can surface. */
export type MisplacementKind =
  | "junk_drawer" // in a generic catch-all dir instead of a domain home
  | "wrong_owner" // the module's declared owner disagrees with the placement map
  | "misnamed_folder"; // the folder name does not reflect its declared owner

export interface MisplacedModule {
  modulePath: string;
  kind: MisplacementKind;
  detail: string;
  /** Resolved owner from the placement map (if any). */
  owner?: string;
  /** The module's own declared owner (if any). */
  declaredOwner?: string;
}

/**
 * Directory-name markers for a "junk drawer" — generic catch-all folders that
 * indicate a module was never given a proper home. Kept conservative so shared
 * `utils/` / `helpers/` directories are not flagged.
 */
export const JUNK_DRAWER_DIRS = [
  "misc", "miscellaneous", "miscellany", "others", "other",
  "catch-all", "catchall", "generic", "assorted", "everything-else",
];

/**
 * Directory names that legitimately host shared code and should not count as a
 * misname when they appear as the container inside an owned prefix.
 */
const SHARED_CONTAINER_DIRS = ["platform", "shared", "common", "lib", "components"];

/** Resolve a path to its owning placement rule by the LONGEST matching prefix. */
function resolvePlacement(
  path: string,
  placements: OwnershipPlacement[],
): OwnershipPlacement | undefined {
  let best: OwnershipPlacement | undefined;
  for (const p of placements) {
    if (path.startsWith(p.prefix)) {
      if (!best || p.prefix.length > best.prefix.length) {
        best = p;
      }
    }
  }
  return best;
}

/** Normalize a directory/owner name to a comparable slug. */
function slug(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/**
 * Flag modules whose assigned placement contradicts the declared ownership map.
 * Three independent checks run per module:
 *
 *  1. **Junk drawer** — the module lives in a generic catch-all directory
 *     (`misc/`, `others/`, `catch-all/`, …) that indicates it was never given
 *     a proper domain home.
 *  2. **Wrong owner** — the module declares an owner (via its optional
 *     `owner` field) that differs from the owner the placement map resolves.
 *  3. **Misnamed folder** — the immediate container directory under the owning
 *     prefix does not reflect the declared owner (and is not a known shared
 *     container), e.g. an owned prefix `src/features/billing/` hosting a folder
 *     named `money/`.
 *
 * Output is sorted by `modulePath` then `kind`, so the result is deterministic
 * and diffable across runs.
 */
export function findMisplacedModules(
  modules: SourceModule[],
  placements: OwnershipPlacement[],
): MisplacedModule[] {
  const findings: MisplacedModule[] = [];

  for (const mod of modules) {
    const segments = mod.path.split("/").filter(Boolean);
    const match = resolvePlacement(mod.path, placements);

    // 1. Junk drawer: parked in a generic catch-all directory.
    for (const seg of segments) {
      if (JUNK_DRAWER_DIRS.includes(seg.toLowerCase())) {
        findings.push({
          modulePath: mod.path,
          kind: "junk_drawer",
          detail: `lives in generic catch-all directory "${seg}"`,
          owner: match?.owner,
          declaredOwner: mod.owner,
        });
        break;
      }
    }

    // 2. Wrong owner: declared owner contradicts the placement map.
    if (mod.owner && match && match.owner !== mod.owner) {
      findings.push({
        modulePath: mod.path,
        kind: "wrong_owner",
        detail: `declared owner "${mod.owner}" but placed under "${match.owner}"`,
        owner: match.owner,
        declaredOwner: mod.owner,
      });
    }

    // 3. Misnamed folder: container dir under the owning prefix doesn't reflect
    //    the declared owner.
    if (match) {
      const rest = mod.path.slice(match.prefix.length);
      const dirs = rest.split("/").filter(Boolean);
      if (dirs.length > 0) {
        const container = dirs[0];
        if (
          slug(container) !== slug(match.owner) &&
          !SHARED_CONTAINER_DIRS.includes(container.toLowerCase())
        ) {
          findings.push({
            modulePath: mod.path,
            kind: "misnamed_folder",
            detail: `folder "${container}" does not match declared owner "${match.owner}"`,
            owner: match.owner,
            declaredOwner: mod.owner,
          });
        }
      }
    }
  }

  return findings.sort(
    (a, b) =>
      a.modulePath.localeCompare(b.modulePath) || a.kind.localeCompare(b.kind),
  );
}
