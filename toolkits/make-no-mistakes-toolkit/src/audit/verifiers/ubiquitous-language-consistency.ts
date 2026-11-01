/**
 * One term usage inside a bounded context: the `term` as spoken in that context
 * and the `meaning` it denotes (a canonical concept id or a plain-language
 * definition). A term may appear multiple times with different meanings — that
 * is exactly the ambiguity this verifier looks for.
 */
export interface TermUse {
  term: string;
  meaning: string;
}

/** The term dictionary for a single bounded context. */
export interface UbiquitousLanguageContext {
  context: string;
  terms: TermUse[];
}

export type UbiquitousLanguageFindingKind =
  | "ambiguous_term_within_context" // one term, two meanings, in a single context
  | "cross_context_synonym"; // same concept named differently across contexts

export interface UbiquitousLanguageFinding {
  kind: UbiquitousLanguageFindingKind;
  context: string;
  term: string;
  meaning: string;
  relatedContext?: string;
  otherTerm?: string;
  detail: string;
}

/**
 * Flag ubiquitous-language inconsistencies across and within bounded contexts:
 *
 *  1. **Ambiguous term within a context** — the same term denotes two different
 *     meanings inside a single context (e.g. "account" means bank account in one
 *     place and user account in another).
 *  2. **Cross-context synonym** — the same domain concept (meaning) is named
 *     with different terms in different contexts (e.g. "customer" in the sales
 *     context vs "client" in the billing context).
 *
 * Output is sorted by `kind`, then `context`, then `term`, then `meaning`, so
 * the result is deterministic and diffable across runs.
 */
export function findUbiquitousLanguageInconsistencies(
  contexts: UbiquitousLanguageContext[],
): UbiquitousLanguageFinding[] {
  const findings: UbiquitousLanguageFinding[] = [];

  // 1. Within-context ambiguity: same (context, term) carrying multiple meanings.
  const byContextTerm = new Map<string, TermUse[]>();
  for (const c of contexts) {
    for (const t of c.terms) {
      const key = `${c.context}|${t.term}`;
      const arr = byContextTerm.get(key) ?? [];
      arr.push(t);
      byContextTerm.set(key, arr);
    }
  }
  for (const [key, uses] of byContextTerm) {
    const meanings = new Set(uses.map((u) => u.meaning));
    if (meanings.size > 1) {
      const [context, term] = key.split("|");
      for (const meaning of meanings) {
        findings.push({
          kind: "ambiguous_term_within_context",
          context,
          term,
          meaning,
          detail: `term "${term}" in context "${context}" carries multiple meanings (including "${meaning}")`,
        });
      }
    }
  }

  // 2. Cross-context synonyms: same concept (meaning) named differently in
  //    different contexts.
  const byMeaning = new Map<string, Array<{ context: string; term: string }>>();
  for (const c of contexts) {
    for (const t of c.terms) {
      const arr = byMeaning.get(t.meaning) ?? [];
      arr.push({ context: c.context, term: t.term });
      byMeaning.set(t.meaning, arr);
    }
  }
  for (const [meaning, uses] of byMeaning) {
    const distinctTerms = new Set(uses.map((u) => u.term));
    if (uses.length > 1 && distinctTerms.size > 1) {
      // Report each unordered pair of contexts that use different terms.
      for (let i = 0; i < uses.length; i++) {
        for (let j = i + 1; j < uses.length; j++) {
          const a = uses[i];
          const b = uses[j];
          if (a.term !== b.term) {
            findings.push({
              kind: "cross_context_synonym",
              context: a.context,
              term: a.term,
              meaning,
              relatedContext: b.context,
              otherTerm: b.term,
              detail: `concept "${meaning}" is named "${a.term}" in ${a.context} but "${b.term}" in ${b.context}`,
            });
          }
        }
      }
    }
  }

  return findings.sort(
    (a, b) =>
      a.kind.localeCompare(b.kind) ||
      a.context.localeCompare(b.context) ||
      a.term.localeCompare(b.term) ||
      a.meaning.localeCompare(b.meaning),
  );
}
