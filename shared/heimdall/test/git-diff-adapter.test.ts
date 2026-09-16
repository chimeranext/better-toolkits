/**
 * Tests unit de GitDiffAdapter — foco en el parseo del `git diff` (sin red, sin
 * subprocesos git reales). Verifican que un par numstat+diff de ejemplo produce
 * la lista correcta de archivos+patches, y el caso "sin cambios".
 */

import { test, expect } from "bun:test"
import { parseGitDiff } from "../src/adapters/git-diff-adapter.ts"

// --numstat -z separa registros con NUL (\0), no con \n.
const NUMSTAT = "2\t1\tsrc/foo.ts\0" + "10\t0\tsrc/bar.ts\0" + "0\t4\tsrc/gone.ts\0"

const RAW_DIFF = `diff --git a/src/foo.ts b/src/foo.ts
index 1111111..2222222 100644
--- a/src/foo.ts
+++ b/src/foo.ts
@@ -1,2 +1,3 @@
 const a = 1
-const b = 2
+const b = 3
+const c = 4
diff --git a/src/bar.ts b/src/bar.ts
new file mode 100644
index 0000000..3333333
--- /dev/null
+++ b/src/bar.ts
@@ -0,0 +1,10 @@
+line1
+line2
diff --git a/src/gone.ts b/src/gone.ts
deleted file mode 100644
index 4444444..0000000
--- a/src/gone.ts
+++ /dev/null
@@ -1,4 +0,0 @@
-old1
-old2
-old3
-old4
`

test("parseGitDiff mapea numstat+diff a archivos con additions/deletions/patch", () => {
  const files = parseGitDiff(NUMSTAT, RAW_DIFF)
  expect(files).toHaveLength(3)

  const foo = files.find((f) => f.filename === "src/foo.ts")
  expect(foo).toBeDefined()
  expect(foo?.additions).toBe(2)
  expect(foo?.deletions).toBe(1)
  expect(foo?.status).toBe("modified")
  expect(foo?.patch).toContain("+const c = 4")

  const bar = files.find((f) => f.filename === "src/bar.ts")
  expect(bar?.status).toBe("added")
  expect(bar?.deletions).toBe(0)
  expect(bar?.patch).toContain("+line1")

  const gone = files.find((f) => f.filename === "src/gone.ts")
  expect(gone?.status).toBe("removed")
  expect(gone?.additions).toBe(0)
  // El patch de un archivo borrado se nombra por su lado a/.
  expect(gone?.patch).toContain("-old1")
})

test("parseGitDiff devuelve lista vacía cuando no hay cambios", () => {
  expect(parseGitDiff("", "")).toEqual([])
})

test("parseGitDiff trata additions/deletions binarias ('-') como 0", () => {
  const numstat = "-\t-\tassets/logo.png\0"
  const files = parseGitDiff(numstat, "")
  expect(files).toHaveLength(1)
  expect(files[0].additions).toBe(0)
  expect(files[0].deletions).toBe(0)
})
