# Branching Strategy — por tipo de repo

> Adaptable desde el día uno. Nace de la práctica adoptada en
> `docs/branching.md` (HabitaNexus) y del estándar `branching-strategy.md`
> (Seacrets.Online). Define ramas, nombres y protección por **tipo de
> repositorio**; NO es un framework que exija una sola topología.

## Principios generales

Elegir la estrategia por tipo de repo — no aplicar una única a todo el monorepo:

* **Infraestructura & GitOps**: Trunk-Based. `main` es la única fuente de verdad;
  los entornos se separan por directorios u overlays (Kustomize).
* **Código de aplicación**: Environment Branching (variante GitFlow). Ramas
  (`develop`, `staging`, `main`) que mapean 1:1 a entornos, con puerto entre ellas.
* **Docs**: Trunk-Based directo. PRs para cambios; commits directos a `main`
  bloqueados por ruleset de org.

## Estándares por tipo de repo

### 1. Monorepo de aplicación (Flutter / app / backend)

**Estrategia**: Environment Branching (GitFlow).

Ramas de larga vida:

| Rama | Entorno | Protección |
| --- | --- | --- |
| `develop` | Dev (default) | Abierta, pero PR recomendado |
| `staging` | Staging | Solo PR (puerto desde `develop`) |
| `main` | Producción | Solo PR (releases, approval gate manual) |

Flujo:

1. **Feature**: `feature/{issue}-{slug}` desde `develop`.
2. **Dev**: PR a `develop`. Merge despliega a Dev.
3. **Staging**: PR de `develop` a `staging`. Merge desplega a Staging.
4. **Producción**: PR de `staging` a `main`. Merge dispara despliegue a Prod
   con gate de aprobación manual.

### 2. Infraestructura (Terraform / Pulumi)

**Estrategia**: Trunk-Based con directorios de entorno.

* Rama única **`main`**.
* Aislamiento por carpetas: `environments/{dev,stage,prod}` — no por ramas.
* Flujo: cambios en `environments/stage/*` en una rama `feat/*` → PR a `main`
  → CI corre `terraform plan` del entorno afectado → al mergear, CI aplica
  `terraform apply` en el entorno correspondiente.

### 3. GitOps (manifiestos + ArgoCD)

**Estrategia**: Trunk-Based con overlays.

* Rama única **`main`**.
* Cambios de entorno con Kustomize overlays (`k8s/overlays/{dev,staging,prod}`).
* Flujo: el CI actualiza el tag de imagen en el overlay correspondiente → PR a
  `main` → ArgoCD detecta el cambio y sincroniza el cluster → Promoción a prod
  = copiar/actualizar el overlay de prod en un nuevo PR.

### 4. Documentación

* Trunk-Based directo. PRs para cualquier cambio; el ruleset de la org bloquea
  commits directos a `main`.

## Convenciones de nombres

### Ramas

Formato: `type/referencia-descripcion-corta` (usar el id del tracker en
minúsculas, p. ej. `hab-123`).

| Tipo | Uso | Ejemplo |
| --- | --- | --- |
| `feat` | Feature nueva | `feat/DEV-123-login-page` |
| `fix` | Bug fix | `fix/DEV-124-header-alignment` |
| `docs` | Solo docs | `docs/update-readme` |
| `chore` | Mantenimiento / deps | `chore/update-flutter-3` |
| `refactor` | Sin cambio de comportamiento | `refactor/user-service` |
| `infra` | Cambios de infraestructura | `infra/add-redis-cluster` |
| `hotfix` | Desde `main`, urgentes | `hotfix/DEV-999-critical` |
| `release` | Corte candidato | `release/1.4.0` |

### Commits (Conventional Commits)

Formato: `type(scope): descripción`

* `feat(auth): add login endpoint`
* `fix(ui): resolve button padding issue`
* `chore(deps): upgrade serverpod`

## Reglas de protección de ramas

Para ramas críticas (`main`, `staging`, `develop`):

1. **Require PR reviews** — mínimo 1 aprobación (subir umbral al crecer).
2. **Require status checks** — test suite + lint + análisis estático pasando.
3. **No direct pushes** — push directo y force-push bloqueados en ramas críticas.
4. **Linear history** — recomendado (squash merges para features; merge commits
   solo para releases).

## Orden de adopción

1. Definir los tipos de repo del monorepo (app vs infra vs gitops vs docs).
2. Documentar las ramas de larga vida y su mapeo a entornos (`docs/branching.md`).
3. Configurar los rulesets de la org (protección de ramas, PR obligatorio).
4. Enlazar el `AGENTS.md` a este estándar — no duplicar el texto completo.