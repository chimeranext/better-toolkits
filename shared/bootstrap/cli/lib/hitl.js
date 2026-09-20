/** HITL confirm: read explicit yes from /dev/tty (works even when stdin is piped). */
import { createInterface } from "node:readline";
import { openSync } from "node:fs";

export async function confirm(question) {
  let input;
  try {
    input = createInterface({ input: process.stdin, output: process.stdout });
  } catch {
    return false;
  }
  // Prefer the controlling terminal when stdin is not a TTY.
  if (!process.stdin.isTTY) {
    try {
      const fd = openSync("/dev/tty", "r");
      input.close();
      const { createInterface: ci } = await import("node:readline");
      const { ReadStream } = await import("node:tty");
      input = ci({ input: new ReadStream(fd), output: process.stdout });
    } catch {
      return false;
    }
  }
  const answer = await new Promise((resolve) =>
    input.question(`${question} [y/N] `, resolve),
  );
  input.close();
  return /^(y|yes)$/i.test(answer.trim());
}
