import { test, expect } from "bun:test"
import { parseJudgeReviewPayload } from "../src/lib/one-shot-judge.ts"

test("parseJudgeReviewPayload accepts valid judge JSON", () => {
  const payload = parseJudgeReviewPayload(
    JSON.stringify({
      summary: "Checked auth middleware only; no security issues.",
      confidence: 4.2,
      status: "APPROVE",
      comments: [
        {
          path: "src/a.ts",
          line: 2,
          side: "RIGHT",
          body: "Consider renaming for clarity.",
          severity: "business",
        },
      ],
    }),
  )
  expect(payload.status).toBe("APPROVE")
  expect(payload.confidence).toBe(4.2)
  expect(payload.comments).toHaveLength(1)
})

test("parseJudgeReviewPayload rejects missing summary", () => {
  expect(() =>
    parseJudgeReviewPayload(JSON.stringify({ status: "APPROVE", comments: [] })),
  ).toThrow(/summary/)
})
