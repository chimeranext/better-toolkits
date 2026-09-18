# Heimdall — atajos de desarrollo y dry-run.
# NVIDIA_API_KEY se toma del entorno; nunca se escribe en archivos trackeados.

CONTAINER_ENGINE ?= podman
IMAGE ?= heimdall

.PHONY: install typecheck test review-ci review-diff review-pr dry-run-fixture dry-run-pr image image-dry-run clean

install:
	bun install

typecheck:
	bun x tsc --noEmit

test:
	bun test

# Entry del MVP de GitHub Actions. Postea un review REAL. Fuera de CI, necesita
# GITHUB_TOKEN + NVIDIA_API_KEY + GITHUB_REPOSITORY + PR_NUMBER en el entorno.
review-ci:
	bun run review:ci

# Review local on-demand del diff de la rama actual (sin GitHub, sin CI).
# Imprime el review; no postea. Necesita NVIDIA_API_KEY en el entorno.
# Uso:  make review-diff   |   make review-diff BASE=develop
review-diff:
	REVIEWER_PROVIDER=nim-kimi bun run src/cli/review.ts diff $(if $(BASE),--base $(BASE),)

# Review local de un PR. Imprime por default; POST=1 postea (requiere GITHUB_TOKEN).
# Uso:  make review-pr N=42   |   make review-pr N=42 POST=1
review-pr:
	REVIEWER_PROVIDER=nim-kimi bun run src/cli/review.ts pr $(N) $(if $(POST),--post,)

# Dry-run Mode A (fixture, sin GitHub). Necesita NVIDIA_API_KEY en el entorno.
dry-run-fixture:
	REVIEWER_PROVIDER=nim-kimi bun run scripts/dry-run-fixture.ts

# Dry-run Mode B (PR real, sin postear). Uso: make dry-run-pr URL=https://github.com/o/r/pull/1
dry-run-pr:
	REVIEWER_PROVIDER=nim-kimi bun run scripts/dry-run-pr.ts $(URL)

# Construye la imagen del contenedor (Podman por defecto; CONTAINER_ENGINE=docker para Docker).
image:
	$(CONTAINER_ENGINE) build -t $(IMAGE) -f Containerfile .

# Corre el dry-run Mode A dentro del contenedor. NVIDIA_API_KEY se pasa por -e,
# nunca horneada en la imagen.
image-dry-run: image
	$(CONTAINER_ENGINE) run --rm -e NVIDIA_API_KEY=$(NVIDIA_API_KEY) $(IMAGE)

clean:
	rm -rf node_modules dist
