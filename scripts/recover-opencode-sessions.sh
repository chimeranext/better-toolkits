#!/usr/bin/env bash
# /recover-opencode-sessions
# Aprende primero: escanear DB opencode ANTES de inventar sesiones faltantes.
# Usa python3 (sqlite3) para consultar session, session_message, session_v2.
# No inventa contenido; solo reporta evidencia real del DB.

DB="${HOME}/.local/share/opencode/opencode.db"

if [ ! -f "$DB" ]; then
  echo "DB opencode NO ENCONTRADO: $DB (evidencia real: archivo ausente)"
  exit 1
fi

echo "=== RECOVER OPENCODE SESSIONS (evidencia real del DB) ==="
echo "DB: $DB ($(stat -c%s "$DB" || echo UNKNOWN) bytes)"

python3 << 'PYTHON'
import sqlite3, sys, os
DB = os.path.expanduser("~/.local/share/opencode/opencode.db")
try:
    conn = sqlite3.connect(DB)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [r[0] for r in cursor.fetchall()]
    print("Tablas encontradas (evidencia real):", ", ".join(tables))
    for table in ["session", "session_message", "session_v2", "session_pending", "instruction_blob"]:
        if table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"  {table}: {count} registros")
except Exception as e:
    print(f"ERROR al consultar DB (evidencia real del error): {e}")
PYTHON

echo "Nota: para buscar contenido específico (ej. 'rust-wrapper', 'mojibake'), usar:"
echo "  python3 -c \"...SELECT session_id, data FROM session_message WHERE data LIKE '%keyword%'...\""
