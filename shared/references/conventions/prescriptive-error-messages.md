# Prescriptive error messages — convention

Convención transversal (aplica a todo lenguaje): un mensaje de error debe decirle al
consumidor **qué hacer**, no solo que algo falló. La excepción es la **seguridad por
secrecía**, marcada en el doc comment idiomático del lenguaje.

## La regla

| Case | Requisito |
|---|---|
| Error normal | El mensaje **sugiere una alternativa o el siguiente paso** (p.ej. "usa `> out.log 2>&1`", "corre `cargo clippy`"). |
| Excepción por secrecía | El mensaje es **genérico y vago** ("error de autenticación", "operación no válida") y lleva la marca `[SECRECY]` en su **doc comment** (no en el string que ve el usuario). |

**Principio:** prohibir sin instruir es un mal mensaje (dicta la violación, no la cura).
El gate de cada lenguaje valida que todo `panic!`/`throw`/`raise`/`{:error,_}` o bien es
prescriptivo, o bien tiene `[SECRECY]` en su doc comment.

## Marca `[SECRECY]` en doc comments

Cada lenguaje usa su formato de doc comment idiomático (equivalente a Javadoc):

| Lenguaje | Doc comment | Marca |
|---|---|---|
| Rust | `///` (rustdoc) | `/// [SECRECY] ...` |
| TypeScript/JS | `/** ... */` (JSDoc/TSDoc) | `* [SECRECY] ...` |
| Dart | `///` (dartdoc) | `/// [SECRECY] ...` |
| PHP | `/** ... */` (PHPDoc) | `* [SECRECY] ...` |
| Elixir | `@doc """..."""` | `@doc """\n[SECRECY] ...\n"""` |

La marca vive en el **doc comment**, nunca en el string de error que llega al usuario
(revelar la marca en runtime filtraría el motivo).

## Ejemplo (Rust)

```rust
/// Valida el secreto.
/// [SECRECY] no revelar el motivo exacto (seguridad por secrecía).
pub fn validate(secret: &str) -> Result<(), Error> {
    Err(Error::Invalid) // no "wrong length" / "bad charset"
}
```

## GATES

Cada record de lenguaje incorpora esta regla como una RULE más, con su gate local/CI
(la herramienta de lint de ese lenguaje o un check liviano que parsea doc comments).

## SOURCES

- refactoring.guru (Shvets) — catálogos de patterns por lenguaje (`RefactoringGuru/design-patterns-*`).
- `patterns-and-refactoring` skill (christianpasinrey) — incluido `functional-patterns.md` (Result/Either).
