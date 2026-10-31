---- MODULE orchestrator ----
(*
  Prototipo pequeño — orquestador /parallel-subagents.

  Flujo: init → harness_detected → graph_built → wave_dispatched
  → wave_gated → reviewed → finished.

  Invariantes (PoC):
    INV1 — Capability gate: nunca se dispacha sin pasar el gate.
    INV2 — Overlap check: dos waves nunca tocan el mismo archivo.
    INV3 — No auto-merge: finish exige decisión humana.

  2 waves (1,2) × 2 archivos (10,20); transiciones concretas.
  Nota: O modelo PERMITE dispatch con overlap → TLC debe encontrar el
  contraejemplo de INV2 (demostrando que el gate es necesario).
*)

EXTENDS Integers

VARIABLES
  phase,
  capability_gate_passed,
  dispatched_waves,
  touched_by_wave,
  auto_merge,
  human_approved

vars == <<phase, capability_gate_passed, dispatched_waves, touched_by_wave,
        auto_merge, human_approved>>

Init ==
  /\ phase = "init"
  /\ capability_gate_passed = FALSE
  /\ dispatched_waves = {}
  /\ touched_by_wave = [w \in {1, 2} |-> {}]
  /\ auto_merge = FALSE
  /\ human_approved = FALSE

DetectHarness ==
  /\ phase = "init"
  /\ phase' = "harness_detected"
  /\ UNCHANGED <<capability_gate_passed, dispatched_waves, touched_by_wave,
                  auto_merge, human_approved>>

RunCapabilityGate ==
  /\ phase = "harness_detected"
  /\ capability_gate_passed' = TRUE
  /\ phase' = "graph_built"
  /\ UNCHANGED <<dispatched_waves, touched_by_wave, auto_merge, human_approved>>

FailCapabilityGate ==
  /\ phase = "harness_detected"
  /\ capability_gate_passed' = FALSE
  /\ phase' = "graph_built"
  /\ UNCHANGED <<dispatched_waves, touched_by_wave, auto_merge, human_approved>>

(* -- 4 transiciones de dispatch concretas (sin SUBSET) -- *)
Dispatch1_f10 ==
  /\ phase = "graph_built"
  /\ capability_gate_passed = TRUE
  /\ 1 \notin dispatched_waves
  /\ phase' = "wave_dispatched"
  /\ dispatched_waves' = dispatched_waves \cup {1}
  /\ touched_by_wave' = [touched_by_wave EXCEPT ![1] = {10}]
  /\ UNCHANGED <<capability_gate_passed, auto_merge, human_approved>>

Dispatch1_f20 ==
  /\ phase = "graph_built"
  /\ capability_gate_passed = TRUE
  /\ 1 \notin dispatched_waves
  /\ phase' = "wave_dispatched"
  /\ dispatched_waves' = dispatched_waves \cup {1}
  /\ touched_by_wave' = [touched_by_wave EXCEPT ![1] = {20}]
  /\ UNCHANGED <<capability_gate_passed, auto_merge, human_approved>>

Dispatch2_f10 ==
  /\ phase = "graph_built"
  /\ capability_gate_passed = TRUE
  /\ 2 \notin dispatched_waves
  /\ phase' = "wave_dispatched"
  /\ dispatched_waves' = dispatched_waves \cup {2}
  /\ touched_by_wave' = [touched_by_wave EXCEPT ![2] = {10}]
  /\ UNCHANGED <<capability_gate_passed, auto_merge, human_approved>>

Dispatch2_f20 ==
  /\ phase = "graph_built"
  /\ capability_gate_passed = TRUE
  /\ 2 \notin dispatched_waves
  /\ phase' = "wave_dispatched"
  /\ dispatched_waves' = dispatched_waves \cup {2}
  /\ touched_by_wave' = [touched_by_wave EXCEPT ![2] = {20}]
  /\ UNCHANGED <<capability_gate_passed, auto_merge, human_approved>>

GateWave ==
  /\ phase = "wave_dispatched"
  /\ phase' = "wave_gated"
  /\ UNCHANGED <<capability_gate_passed, dispatched_waves, touched_by_wave,
                  auto_merge, human_approved>>

ReviewWave ==
  /\ phase = "wave_gated"
  /\ phase' = "reviewed"
  /\ UNCHANGED <<capability_gate_passed, dispatched_waves, touched_by_wave,
                  auto_merge, human_approved>>

(* Tras revisar una wave, se puede lanzar la siguiente wave.
   Se conservan las waves ya despachadas y los archivos tocados,
   de modo que una wave posterior puede solaparse con una anterior
   (eso es lo que debe detectar INV_OverlapCheck). *)
BeginNextWave ==
  /\ phase = "reviewed"
  /\ phase' = "graph_built"
  /\ UNCHANGED <<capability_gate_passed, dispatched_waves, touched_by_wave,
                  auto_merge, human_approved>>

FinishHuman ==
  /\ phase = "reviewed"
  /\ human_approved = TRUE
  /\ phase' = "finished"
  /\ UNCHANGED <<capability_gate_passed, dispatched_waves, touched_by_wave,
                  auto_merge>>

AutoMergeBad ==
  /\ phase = "reviewed"
  /\ auto_merge' = TRUE
  /\ phase' = "finished"
  /\ UNCHANGED <<capability_gate_passed, dispatched_waves, touched_by_wave,
                  human_approved>>

Next ==
  \/ DetectHarness
  \/ RunCapabilityGate
  \/ FailCapabilityGate
  \/ Dispatch1_f10
  \/ Dispatch1_f20
  \/ Dispatch2_f10
  \/ Dispatch2_f20
  \/ GateWave
  \/ ReviewWave
  \/ BeginNextWave
  \/ FinishHuman
  \/ AutoMergeBad

(* ==== INVARIANTES ==== *)

INV_CapabilityGate ==
  phase = "wave_dispatched" => capability_gate_passed

INV_OverlapCheck ==
  touched_by_wave[1] \cap touched_by_wave[2] = {}

INV_NoAutoMerge ==
  auto_merge = FALSE

INV_FinishedHuman ==
  phase = "finished" => human_approved

====
