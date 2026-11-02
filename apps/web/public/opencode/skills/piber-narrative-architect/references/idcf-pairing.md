# IDCF Pairing

The product spine that runs underneath PIBER when the thing being communicated is a product. PIBER is the narrative wrapper. IDCF is the load path from the same Insight down to shippable features.

## Contents

1. The four nodes
2. Where IDCF attaches to PIBER
3. The traceability rule
4. When to run it and when to skip it
5. Worked chain

---

## 1. The four nodes

**I. Insight.** The same non-obvious truth from PIBER. One sentence. Do not write a second, product-flavored insight; if the product needs a different insight than the narrative, one of them is wrong.

**D. Design Theses.** If the Insight is true, what must the solution inherently do or feel like? Four to six statements, each containing the word "must". These are constraints, not features. A good thesis eliminates a large region of the product space. "It must produce a number the user can lose" eliminates every dashboard that only goes up.

**C. Capabilities.** The technical and operational muscles required to satisfy the theses: infrastructure, data models, APIs, partnerships, team skills, regulatory posture. Tag each Build, Buy or Partner, with a timeline. The tagging is the strategic content; a capability list without build/buy/partner decisions is a wish list.

**F. Features.** How users meet those capabilities day to day. Every feature traces backwards: Feature to Capability to Design Thesis to Insight. A feature that cannot complete the chain is either a distraction or evidence that a thesis is missing, and both are worth knowing before the sprint.

---

## 2. Where IDCF attaches to PIBER

The two frameworks share the I node. That shared node is the joint.

- **D feeds B.** The Design Theses are what make the Big Idea inevitable rather than decorative. When the theses are strong, the Big Idea is often just the most compressed statement of them.
- **C and F feed E.** The Execution node's product surface is populated from Capabilities and Features. This is why an Execution section built on IDCF traces cleanly and one built by listing features never does.
- **F feeds R.** The measurable results usually attach to specific features, which is how a result stays falsifiable rather than atmospheric.

Practical order: PIBER's P and I first, then IDCF's D and C, then back up to PIBER's B, then E populated from F, then R.

---

## 3. The traceability rule

Every feature must complete this sentence without hand-waving:

> [Feature] exists because we needed [Capability], which we needed because [Design Thesis], which is only true if [Insight] is true.

Run this on the three features the team is most excited about. Excitement is uncorrelated with traceability, and the failures are informative: a feature that cannot trace is usually a feature copied from a competitor whose insight is different from yours.

---

## 4. When to run it and when to skip it

**Run it** when the artifact is a product pitch, a roadmap defense, a build/buy decision, a spec, an investor deck for a software company, or any conversation where someone will ask "why are you building that and not the other thing".

**Skip it** when the subject is not a product: an event, a policy, an essay, a personal brand, a campaign, a foundation. Forcing IDCF onto a non-product produces a taxonomy nobody uses. In those cases the Execution node's six surfaces are enough.

**Compress it** when the artifact is short. At L2 and L1 on the compression ladder, IDCF is invisible: it did its work upstream by making sure the features you mention are the ones that trace.

---

## 5. Worked chain

**I.** Brand diagnosis fails not because the data is late but because it is unfalsifiable. A score nobody can lose is a score nobody acts on.

**D.**
1. The score must be losable, which means it must be able to go down for reasons the user can name.
2. The scoring must be deterministic, which means the same inputs must produce the same number on two different days.
3. The instrument must be auditable, which means every point must show its derivation.
4. The diagnostic must complete in one session, since an instrument that takes a quarter to run is a report, not an instrument.
5. It must compare against a defined cohort, since a number without a peer set is a mood.

**C.**
- Deterministic scoring engine, no generative variance in the number itself. Build.
- Structured diagnostic instrument, screen by screen, with weighted dimensions. Build.
- Cohort benchmark data. Partner.
- Evidence store linking every point to its input. Build.
- Report generation. Buy.

**F.** The 66-screen diagnostic, the score breakdown with per-dimension derivation, the cohort comparison view, the quarter-over-quarter delta, the exportable board report.

**Trace check.** The cohort comparison view exists because we needed benchmark data, which we needed because a number without a peer set is a mood, which is only true if the insight about falsifiability holds. It completes. The exportable board report traces to the buyer's real motive rather than to a design thesis, which is worth noting explicitly: it is a commercial feature, not a product-thesis feature, and mislabeling it would corrupt the chain.
