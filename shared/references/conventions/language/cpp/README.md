# convention: cpp
id: cpp · version: 0.1.0 · status: draft · level: language
extracted_at: 2026-11-03 · ttl_expires: 2027-02-03
parent: none

## GOAL

C/C++ que compila con `-Wall -Wextra -Werror`, pasa clang-tidy y fija
dependencias (vcpkg/conan/CMake) de forma reproducible.

## SOURCES

| # | kind | ref | weight | para qué |
|---|------|-----|--------|----------|
| S1 | docs | CMAKE + vcpkg manifest mode | load-bearing | deps reproducibles |
| S2 | repo | `llvm/llvm-project` (clang-tidy) | load-bearing | lint |
| S3 | docs | Conan lockfile (`conan.lock`) | load-bearing | lockfile |
| S4 | docs | CMake `--warn-uninitialized` | context | warnings |
| S5 | repo | Google C++ Style | context | estilo |

## RULES

- R1 [warn] compilar con `-Wall -Wextra -Werror` → toolchain.
- R2 [tidy] `clang-tidy` sin hallazgos (con `.clang-tidy`) → S2.
- R3 [deps] vcpkg.json / conan.lock commiteado → S1/S3.
- R4 [locked] `vcpkg install --x-manifest-root` con lock → S1.
- R5 [fmt] `clang-format --dry-run` → S5.

## COUNTEREXAMPLES

```cpp
// ❌ wrong: cast C-style (R4)
int x = (int)y;

// ✅ right: static_cast<int>(y)
```

## GATES

- local: `cmake --build build --target check` (warnings como errores)
- CI: mismos + `clang-tidy` + `clang-format --dry-run`.
