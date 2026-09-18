# Review local on-demand del diff de la rama actual con Heimdall.
# Local salvo la inferencia a NVIDIA NIM; no toca GitHub ni CI.
# Prefiere el bin local `heimdall-review` (instalado con `bun link`); si no está
# en PATH, cae a `bunx` (requiere red para bajar el package). La NIM key se toma
# del entorno (.env / env var local), o prefijá la invocación con `infisical run`.
# Uso:  make heimdall-review            (compara contra merge-base de origin/HEAD)
#       make heimdall-review BASE=develop
.PHONY: heimdall-review
heimdall-review:
	@if command -v heimdall-review >/dev/null 2>&1; then \
		heimdall-review diff $(if $(BASE),--base $(BASE),); \
	else \
		bunx github:chimeranext/heimdall@main review diff $(if $(BASE),--base $(BASE),); \
	fi
