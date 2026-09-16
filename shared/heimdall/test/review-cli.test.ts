/**
 * Smoke tests del CLI heimdall-review — solo parseo de args (sin red, sin git,
 * sin LLM). Verifican el parser de flags y la autodetección owner/repo del
 * remote origin.
 */

import { test, expect } from "bun:test"
import { parseArgs, parseOriginRemote } from "../src/cli/review.ts"

test("parseArgs separa subcomando, posicionales y flags con valor", () => {
  const { positionals, flags } = parseArgs(["pr", "42", "--owner", "chimeranext", "--repo", "x"])
  expect(positionals).toEqual(["pr", "42"])
  expect(flags.owner).toBe("chimeranext")
  expect(flags.repo).toBe("x")
})

test("parseArgs trata --post / --force / --with-hook como booleanos sin consumir token", () => {
  const { positionals, flags } = parseArgs(["pr", "7", "--post"])
  expect(positionals).toEqual(["pr", "7"])
  expect(flags.post).toBe(true)

  const install = parseArgs(["install", "--force", "--with-hook"])
  expect(install.flags.force).toBe(true)
  expect(install.flags["with-hook"]).toBe(true)
})

test("parseArgs reconoce --help y -h", () => {
  expect(parseArgs(["--help"]).flags.help).toBe(true)
  expect(parseArgs(["-h"]).flags.help).toBe(true)
})

test("parseArgs default base flag toma el valor siguiente", () => {
  const { flags } = parseArgs(["diff", "--base", "develop"])
  expect(flags.base).toBe("develop")
})

test("parseOriginRemote soporta SSH y HTTPS", () => {
  expect(parseOriginRemote("git@github.com:chimeranext/heimdall.git")).toEqual({
    owner: "chimeranext",
    repo: "heimdall",
  })
  expect(parseOriginRemote("https://github.com/chimeranext/heimdall.git")).toEqual({
    owner: "chimeranext",
    repo: "heimdall",
  })
  expect(parseOriginRemote("https://github.com/chimeranext/heimdall")).toEqual({
    owner: "chimeranext",
    repo: "heimdall",
  })
})

test("parseOriginRemote devuelve null para un remote no-GitHub", () => {
  expect(parseOriginRemote("https://gitlab.com/foo/bar.git")).toBeNull()
})
