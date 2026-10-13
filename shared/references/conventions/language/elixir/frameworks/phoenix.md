# convention: phoenix
id: phoenix · version: 0.1.0 · status: draft · level: framework
extracted_at: 2026-10-13 · ttl_expires: 2027-01-11
parent: elixir@0.1.0

## GOAL

App Phoenix organizada por contextos: la web es interfaz, la lógica vive en
módulos de contexto. Hereda todos los GATES de `elixir@0.1.0` sin duplicarlos.

## SOURCES

| # | kind | ref | weight | para qué |
|---|------|-----|--------|----------|
| S1 | docs | `phoenix.hexdocs.pm/overview` v1.8.15 (verificado 2026-10-13) | load-bearing | MVC, channels, generadores |
| S2 | docs | `hexdocs.pm/phoenix/contexts` v1.8.15, cap. 1 (verificado 2026-10-13) | load-bearing | contexts, `phx.gen.*`, `phx.gen.auth` |

## RULES

- P1 [contexts] Acceso a datos solo en módulos de contexto (`MyApp.Posts`
  centraliza posts, no se dispersa en controllers/LiveViews); generados con
  `mix phx.gen.live|json|html`; auth con `mix phx.gen.auth <Contexto>` → S2.
- P2 [web-vs-core] Controllers, routers y LiveViews son la interfaz web;
  la app es ante todo una app Elixir: lógica en módulos plain/contextos → S1/S2.
- P3 [nesting] Recursos anidados se colocan con su contexto
  (`Posts Comment ... post_id:references:posts`); nombres de contexto
  intencionales (`Accounts`, no `Users` genérico) → S2.

## COUNTEREXAMPLES

```elixir
# ❌ wrong: query Ecto en el controller (P1)
def show(conn, %{"id" => id}) do
  post = Repo.get!(Post, id) |> Repo.preload(:comments)
  render(conn, :show, post: post)
end

# ✅ right: el contexto encapsula
def show(conn, %{"id" => id}) do
  render(conn, :show, post: Posts.get_post!(id))
end
```

## GATES

Hereda `elixir@0.1.0` exacto (compile/format/credo/dialyzer + toolchain).
Propios: `mix test` del contexto antes que el de la web
(`mix test test/my_app/` → luego `test/my_app_web/`).

## LESSONS

- (vacía)

## RECEIPT

Mismo formato del padre.
