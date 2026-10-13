# References — add-conventions-layer

Fuentes aportadas y verificadas en sesión. Estado: `verified` = fetcheada y
citada con contenido confirmado; `listed` = aportada, verificación pendiente
en apply (tarea que la extrae). Nada `listed` sostiene una RULE hasta verificarse.

## Método y gates

| URL | Para | Estado |
|---|---|---|
| https://github.com/lint-staged/lint-staged/blob/main/README.md | gate local estilo pre-push | listed |
| https://github.com/Mearman/typecheck-files/blob/main/README.md | typecheck sin build (TS) | listed |
| https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html | fundamento checkJs | listed |
| https://zerotomastery.io/blog/typescript-type-checking/ | contexto TS | listed |
| https://circleci.com/blog/enforce-type-safety-with-typescript-checks-before-deployments/ | gate TS en CI | listed |
| https://www.convex.dev/typescript/typescript-101/control-flow-operators/typescript-check-type | contexto TS | listed |
| https://megalinter.io/v9/descriptors/typescript/ | catálogo gate TS (eslint/prettier) | listed |
| https://megalinter.io/v9/descriptors/rust/ | catálogo gate Rust (**solo clippy**: suplementar fmt) | verified |
| https://megalinter.io/v9/descriptors/python/ | catálogo gate Python (ruff/mypy/bandit) | verified |

## Elixir (ejemplar 1.º)

| URL | Para | Estado |
|---|---|---|
| https://github.com/rrrene/credo | Credo ~> 1.7 MIT (load-bearing) | verified |
| https://hexdocs.pm/credo | lista exacta de checks (load-bearing) | listed |
| https://elixir.hexdocs.pm/introduction.html | contexto lenguaje | listed |
| https://elixir-lang.org/learning/ | contexto lenguaje | listed |
| https://phoenix.hexdocs.pm/overview.html | hijo frameworks/phoenix | listed |
| https://ash.hexdocs.pm/get-started.html | follow-up (siguiente framework) | listed |
| https://github.com/whatsapp/erlang-language-platform | ELP: LSP server + CLI para BEAM | listed |
| https://whatsapp.github.io/erlang-language-platform/docs/erlang-error-index/ | Erlang Error Index (análogo rustc index) | listed |
| https://whatsapp-elixir.hexdocs.pm/api-reference.html | whatsapp_elixir v0.1.9 | listed |
| https://dev.to/sampseiol1/elixir-a-brief-introduction-to-the-language-behind-whatsapp-nubank-brex-and-so-many-others-4og4 | contexto industria BEAM | listed |
| https://news.ycombinator.com/item?id=49863138 | contexto escala BEAM/WhatsApp | listed |
| https://www.youtube.com/watch?v=Z_FHEFao-r8 | contexto (transcript pendiente si se cita) | listed |

## RDD / receipts (video + repos)

| URL | Para | Estado |
|---|---|---|
| https://www.youtube.com/watch?v=t_HEm1om2Ek | RDD 51:24, transcript en `/tmp/opencode/rdd-video/transcript.txt` (10.332 palabras, efímero: re-extraer en apply si se cita) | verified |
| https://github.com/Gentleman-Programming/gentle-ai | README: 4R = Risk/Resilience/Readability/Reliability, freeze, 1 corrección acotada, kill switch (MIT) | verified |
| https://github.com/Gentleman-Programming/engram | memory layer SQLite+FTS5 (MIT, referencia no dependencia) | verified |
| https://github.com/Gentleman-Programming/Gentleman.Dots | dev-env personal (Neovim/shells/TUI installer, MIT) — marginal: solo precedente de E2E con Docker (`Dockerfile.test`) para sandboxes tipo `_dogfood` | verified |

## Ramas reservadas (contexto verificado)

| URL | Para | Estado |
|---|---|---|
| https://edge.autonomylogic.com/docs/openplc-editor/iec-concepts/pous/ | `platform/openplc`: POUs Program/Function/FunctionBlock | verified |
| https://edge.autonomylogic.com/docs/openplc-editor/iec-concepts/variables-datatypes/ | `platform/openplc`: variables y tipos | listed |
| https://edge.autonomylogic.com/docs/openplc-editor/iec-concepts/tasks-instances/ | `platform/openplc`: tasks | listed |
| https://edge.autonomylogic.com/docs/openplc-editor/custom-languages/python-blocks/python-structure | `platform/openplc`: bloques Python | listed |
| https://edge.autonomylogic.com/docs/openplc-editor/custom-languages/cpp-blocks/cpp-structure/ | `platform/openplc`: bloques C++ | listed |
| https://github.com/smart-data-models/data-models | `dataset/`: ontologías | listed |
| https://github.com/smart-data-models/dataModel.Agrifood/tree/master | `dataset/cv-finetune`: ancla de labels | listed |
| https://github.com/roboflow/computer-vision-skills | `dataset/`: convenciones ejecutables | listed |
| https://github.com/QuecPython/solution-Agriculture-Control-Panel | `dataset/`: contexto edge agri | listed |
| https://developer.quectel.com/doc/sbc/Quectel-Pi-H1/en/NPU-Applications/yolov8-det-deploy.html | `dataset/`: patrón deploy NPU (YOLO, no DETR) | listed |
| https://playground.roboflow.com/models/compare/rt-detr-vs-sam-3 | `dataset/`: evaluación | listed |
| https://docs.roboflow.com/workflows/blocks/blocks/visualize-predictions/polygon-visualization | `dataset/`: visualización | listed |
| https://universe.roboflow.com/ralph-matthew-r-aquino/coffee-berry-borer | `dataset/cv-finetune`: dataset semilla (usado en hackathon #3) | listed |
| https://roboflow.com/blog/train-rf-detr-on-a-custom-dataset | `dataset/cv-finetune`: receta training | listed |

## Contexto mMTC / hackathon (no son convenciones)

| URL | Para | Estado |
|---|---|---|
| https://inseego.com/resources/5g-glossary/what-is-mmtc/ | definición mMTC (muchos disp., poco caudal) | verified |
| https://www.nokia.com/core-networks/cloud-mobile-gateway/ | contexto | listed |
| https://catalog.redhat.com/en/software/container-stacks/detail/62e9649f9bafeb42c82a429b | contexto | listed |
| https://onestore.nokia.com/asset/i/210510/ | contexto | listed |
| https://www.quectel.com/product/5g-redcap-rg255c-gl-m2/ | contexto RedCap | listed |
| https://www.quectel.com/blog/what-is-5g-redcap/ | contexto RedCap | listed |
| https://github.com/vertivolatam/hackathon-5g-2026/pulls?q=is%3Apr+state%3Aclosed | serie de lecciones (18 PRs) | verified |
| https://github.com/vertivolatam/hackathon-5g-2026/pull/3 | lección filtro `biotrap/#`, contrato 503/400, `ROBOFLOW_URL` | verified |
| https://chimeranext.slack.com/archives/C0BHA27AB9T/p1791828774083699 | aportado por usuario, sin acceso (requiere auth) | listed |
