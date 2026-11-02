---
name: jidoka-verification
description: >
  Jidoka verification — confirm that a manufacturing/robotics process, simulator,
  twin, or tool *behaves* as specified using natural-language assertions
  (Given/When/Then), gated by Jidoka (stop on anomaly) and No-Workarounds
  (a suppressed signal is a failure). Use when verifying a manufacturing capability
  works with real inputs, or when adopting behavior-driven verification for lean
  production software. Complements /dogfood (make-no-mistakes), which remains the
  generic dogfooding command.
---

# Jidoka Verification — Behavior-Driven Verification for Manufacturing/Robotics

## Purpose

Confirm that a manufacturing/robotics capability (a process model, a simulator, a
digital twin, an MCP tool, a quality gate) actually **behaves** as specified — with
real inputs — using **behavior-driven** assertions. This is the verification twin of
the `/dogfood` protocol applied to the manufacturing/robotics domain, and it is
anchored in two TPS principles.

## The two governing principles

### Jidoka (autonomation) — build quality in at the source

- Detect anomalies at the point where they occur; do not let a defect advance.
- When a check fails or an anomaly appears, **STOP** the verification. Understand the
  cause before continuing.
- This is the *andon* cord: stopping is the correct response, not "see if the rest
  still passes".

### No-Workarounds — a suppressed signal is a failure

- A test/assertion that only passes by silencing a signal is **not** a pass.
- Forbidden shortcuts: discarding stderr to hide an error, casting away a type error,
  swallowing an exception, adding an arbitrary sleep/retry to "wait for it to settle",
  monkey-patching a boundary you don't own, or copy-paste "adaptation" that doesn't fit.
- Fix the source, not the symptom.

## BDD assertion format

```
Given <real precondition — real part/sensor/process/config>
When  <I exercise the real path — the actual executable, not a stub>
Then  <observable behavior is true — stated in natural language>
      <evidence: the actual output/message/measurement that demonstrates it>
```

Every assertion must be **falsifiable** — state what would falsify it.

## Verification procedure

1. **Given**: assemble real inputs (real config, real asset, real twin state). No
   placeholders, no `REPLACE_WITH_*`.
2. **When**: run the real path (the binary, the simulator, the MCP tool, the PLC
   logic, the twin).
3. **Then**: capture the actual observable output and assert the behavior in natural
   language, tied to that evidence.
4. **Jidoka gate**: if any assertion fails or an anomaly appears, STOP. Record the
   anomaly, the owning boundary, and a root-cause hypothesis (5-Whys) before any fix.
5. **No-Workarounds gate**: before declaring a pass, confirm no signal was silenced,
   no type error cast away, no exception swallowed, no arbitrary delay added.

## Domain examples

| Domain | Given | When | Then (observable) |
|---|---|---|---|
| Simulator | real robot URDF + a scene | run a physics step | the twin's joint angles update and match the commanded setpoint |
| MCP tool | real upstream server/credential | call the tool | it returns non-empty, well-formed output (not an empty exit 0) |
| Quality gate | a real part measurement | run the SPC check | out-of-spec parts are flagged and the line signal stops |
| Digital twin | real telemetry | feed a sample | the twin state reflects the telemetry within tolerance |

## Anti-patterns (fail the verification)

- **Silent success** — `exit 0` with no output: the capability did not behave.
- **Hidden redirect** — discarding a diagnostic stream to make output look clean.
- **Evasive cast** — casting away a type error instead of fixing the type truth.
- **Swallowed error** — an empty catch block that pretends nothing failed.
- **Timing hack** — an arbitrary delay/retry standing in for correct event coordination.
- **Durable placeholder** — a hardcoded value left in place of real configuration.

## References (APA)

- Liker, J. K. (2020). *The Toyota Way: 14 Management Principles from the World's
  Greatest Manufacturer* (2nd ed.). McGraw-Hill.
- Ohno, T. (1988). *Toyota Production System: Beyond Large-Scale Production*.
  Productivity Press.
- Nauck, P. (2026). *No Workarounds* (Claude skill). Retrieved from
  https://github.com/pedronauck/skills
