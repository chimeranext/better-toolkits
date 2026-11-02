---- MODULE AdvisorRouting ----
(* Model of recommendAudits() in
   toolkits/make-no-mistakes-toolkit/src/audit/advisor-routing.ts
   Verified with TLC (the model checker Specula wraps). *)

EXTENDS Integers, FiniteSets, Sequences

ORDER == <<"SCH", "CDC", "DDD", "ARC", "STR", "ENF">>

AllSignals == {"SD", "FE", "CM", "LA", "MI"}
(* SD = sharedDatabase -> SCH, FE = feAndBackendValidate -> CDC
   CM = crossModuleImports -> DDD, LA = layeredArchitecture -> ARC
   MI = migratingMonolith -> STR *)

Selected(sig) ==
  (IF "SD" \in sig THEN {"SCH"} ELSE {}) \cup
  (IF "FE" \in sig THEN {"CDC"} ELSE {}) \cup
  (IF "CM" \in sig THEN {"DDD"} ELSE {}) \cup
  (IF "LA" \in sig THEN {"ARC"} ELSE {}) \cup
  (IF "MI" \in sig THEN {"STR"} ELSE {})

OrderBy(S) ==
  (IF "SCH" \in S THEN <<"SCH">> ELSE <<>>) \o
  (IF "CDC" \in S THEN <<"CDC">> ELSE <<>>) \o
  (IF "DDD" \in S THEN <<"DDD">> ELSE <<>>) \o
  (IF "ARC" \in S THEN <<"ARC">> ELSE <<>>) \o
  (IF "STR" \in S THEN <<"STR">> ELSE <<>>) \o
  (IF "ENF" \in S THEN <<"ENF">> ELSE <<>>)

Recommend(sig) ==
  LET S == Selected(sig) \cup (IF Selected(sig) # {} THEN {"ENF"} ELSE {})
  IN IF Selected(sig) = {} THEN ORDER ELSE OrderBy(S)

ToSet(seq) == { seq[i] : i \in 1..Len(seq) }

OrderIndex(f) ==
  CASE f = "SCH" -> 1
    [] f = "CDC" -> 2
    [] f = "DDD" -> 3
    [] f = "ARC" -> 4
    [] f = "STR" -> 5
    [] f = "ENF" -> 6

VARIABLE chosen
VARIABLE result

Init ==
  /\ chosen = {}
  /\ result = Recommend(chosen)

Next ==
  /\ chosen' \in SUBSET AllSignals
  /\ result' = Recommend(chosen')

Spec == Init /\ [][Next]_<<chosen, result>>

(* Invariants (from the routing contract) *)

(* INV1: when at least one signal is set, ENF is included in the result *)
Inv1 == chosen # {} => "ENF" \in ToSet(result)

(* INV2: ENF, when present, is always last *)
Inv2 == "ENF" \in ToSet(result) => result[Len(result)] = "ENF"

(* INV3: no signals => full canonical sweep *)
Inv3 == chosen = {} => result = ORDER

(* INV4: no duplicate families in the result *)
Inv4 == \A i, j \in 1..Len(result): i # j => result[i] # result[j]

(* INV5: result preserves canonical order (subsequence of ORDER) *)
Inv5 == \A i, j \in 1..Len(result): i < j => OrderIndex(result[i]) < OrderIndex(result[j])

====
