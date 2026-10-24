{
  "type": "documento-tipo-aditivo",
  "description": "Aprobación determinista: todos los hooks y scripts de /dogfood SSOT deben auditor determin isticamente las 4 variantes de redireccion stderr prohibidas en toda la repo.",
  "mensaje_pendiente": "Notificar vía §4b que el script audit-stderr-redirects.sh está instalado y ejecutado exit=0",
  "estado": "QUEMADO",
  "pila_mm": ["protocol.md (SSOT correction note)", "restrictions-check-ready-to-review-mergeable.sh (genérico)", "dogfood-verify.sh (8 pasos)", "claude-pre-bash.sh (decorative echo)", "claude-pre-edit.sh", "claude-pre-write.sh (4 prohibiciones)"],
  "próxima_acción": "Ejecutando scripts/audit-stderr-redirects.sh con el chequeo determinista de los 4 stdout prohibicion"
}
