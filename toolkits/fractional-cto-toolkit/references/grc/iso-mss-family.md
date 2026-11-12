# ISO management-system / risk family map

Where ISO 31000 sits relative to other ISO/IEC management standards in this
toolkit. **Skill** = full protocol exists. **Pointer** = related skill or note
only (no dedicated skill in this change).

| Standard | Topic | Status in toolkit |
| --- | --- | --- |
| ISO 31000:2018 | Risk management (principles / framework / process) | **Skill** `grc/iso31000` |
| ISO/IEC/IEEE 16085:2021 | Systems & software lifecycle risk management | Via SPMP catalog (not a separate GRC skill) — bridge from 31000 §5.2.3 |
| ISO/IEC/IEEE 16326:2019 | Project management plan content | SPMP authoring/audit skills |
| ISO/IEC 27001 | Information security (ISMS) | Skill `grc/iso27001` |
| ISO/IEC 27701 | Privacy (PIMS) | Skill `grc/iso27701` |
| ISO/IEC 42001 | AI management | Skill `grc/iso42001` |
| ISO 22301 | Business continuity | Pointer → `risk/disaster-recovery` |
| ISO 9001 | Quality (risk/opportunity) | Pointer → feeds `iso31000` register |
| ISO 14001 | Environment | Pointer |
| ISO 45001 | Occupational health & safety | Pointer (Excel Agentes SST) |
| ISO 28001 | Supply chain security | Pointer → overlaps `grc/tprm` |
| ISO 37001 | Anti-bribery | Pointer (correct designation; not “38001”) |
| ISO/IEC 20000 | IT service management | Pointer |

## Routing

```
Org risk / 9001 risk-opportunity  →  /iso31000
Software project SPMP           →  /software-project-management-plan
  └─ project risk companion     →  ISO/IEC/IEEE 16085 templates
Security audit framing          →  /risk/audit  (then a GRC skill)
```
