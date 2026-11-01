/**
 * A declared relationship between two bounded contexts, from the machine-readable
 * context map (contexts + relationship declarations).
 */
export type RelationshipType =
  | "partnership"
  | "customer-supplier"
  | "conformist"
  | "anti-corruption-layer"
  | "open-host-service"
  | "published-language"
  | "shared-kernel"
  | "separate-ways";

export interface ContextMapRelationship {
  from: string;
  to: string;
  type: RelationshipType;
}

export interface ContextMap {
  /** Names of the bounded contexts in the map. */
  contexts: string[];
  /** Declared inter-context relationships. */
  relationships: ContextMapRelationship[];
}

/**
 * An observed inter-context communication edge, read from the actual code
 * (imports between contexts, service calls, message publishing, etc.).
 */
export interface ActualEdge {
  from: string;
  to: string;
  /** How the communication really happens in the code. */
  mechanism?: string; // e.g. "direct_call" | "acl" | "shared_kernel" | "event"
}

export type IntegrityIssueKind =
  | "undeclared_relationship" // actual communication with no declared relationship
  | "missing_relationship" // declared relationship with no actual communication
  | "violated_constraint"; // communication contradicts a declared constraint (e.g. separate-ways, direct call where ACL declared)

export interface ContextMapIntegrityIssue {
  kind: IntegrityIssueKind;
  from: string;
  to: string;
  relationshipType?: RelationshipType;
  mechanism?: string;
  detail: string;
}

const SEPARATE_WAYS: RelationshipType = "separate-ways";
const ACL_TYPES: Set<RelationshipType> = new Set(["anti-corruption-layer"]);

/**
 * Verify the declared context map against the code's actual inter-context
 * communication. Three integrity checks:
 *
 *  1. **Missing relationship** — a declared relationship (e.g. an ACL /
 *     anti-corruption-layer, a partnership, a published language) has no
 *     corresponding actual communication, so the declared integration was
 *     never built. "Separate-ways" declarations are exempt — their absence is
 *     correct.
 *  2. **Violated constraint** — actual communication contradicts a declared
 *     constraint: two contexts declared "separate-ways" that talk to each
 *     other, or a declared ACL that is bypassed by a direct call.
 *  3. **Undeclared relationship** — two contexts communicate in code with no
 *     relationship declared between them in the context map.
 *
 * Output is sorted by `kind` then `from` then `to`, so the result is
 * deterministic and diffable across runs.
 */
export function verifyContextMapRelationships(
  contextMap: ContextMap,
  actualEdges: ActualEdge[],
): ContextMapIntegrityIssue[] {
  const issues: ContextMapIntegrityIssue[] = [];

  const declaredBetween = (a: string, b: string): ContextMapRelationship[] =>
    contextMap.relationships.filter(
      (r) => (r.from === a && r.to === b) || (r.from === b && r.to === a),
    );

  const separateWays = new Set<string>();
  for (const r of contextMap.relationships) {
    if (r.type === SEPARATE_WAYS) {
      separateWays.add(`${r.from}->${r.to}`);
      separateWays.add(`${r.to}->${r.from}`);
    }
  }

  // 1. Declared relationships that are never realized in code.
  for (const r of contextMap.relationships) {
    if (r.type === SEPARATE_WAYS) continue; // absence is the correct state
    const realized = actualEdges.some((e) => e.from === r.from && e.to === r.to);
    if (!realized) {
      issues.push({
        kind: "missing_relationship",
        from: r.from,
        to: r.to,
        relationshipType: r.type,
        detail: `declared ${r.type} relationship ${r.from}→${r.to} has no corresponding communication in the code`,
      });
    }
  }

  // 2 & 3. Actual edges checked against the declarations.
  for (const edge of actualEdges) {
    const between = declaredBetween(edge.from, edge.to);

    // Violated constraint: "separate-ways" contexts must not talk.
    if (separateWays.has(`${edge.from}->${edge.to}`)) {
      issues.push({
        kind: "violated_constraint",
        from: edge.from,
        to: edge.to,
        relationshipType: SEPARATE_WAYS,
        mechanism: edge.mechanism,
        detail: `${edge.from} and ${edge.to} communicate despite a declared "separate-ways" relationship`,
      });
      continue;
    }

    // Violated constraint: ACL declared but the actual mechanism is a direct call.
    const aclDeclared = between.some((r) => ACL_TYPES.has(r.type));
    if (aclDeclared && edge.mechanism === "direct_call") {
      issues.push({
        kind: "violated_constraint",
        from: edge.from,
        to: edge.to,
        relationshipType: "anti-corruption-layer",
        mechanism: edge.mechanism,
        detail: `${edge.from}→${edge.to} declares an anti-corruption layer but communicates by direct call`,
      });
      continue;
    }

    // Undeclared: real communication with no declared relationship at all.
    if (between.length === 0) {
      issues.push({
        kind: "undeclared_relationship",
        from: edge.from,
        to: edge.to,
        mechanism: edge.mechanism,
        detail: `${edge.from}→${edge.to} communicate in code but no relationship is declared in the context map`,
      });
    }
  }

  return issues.sort(
    (a, b) =>
      a.kind.localeCompare(b.kind) ||
      a.from.localeCompare(b.from) ||
      a.to.localeCompare(b.to),
  );
}
