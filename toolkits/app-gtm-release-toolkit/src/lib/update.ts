import { installPlugin } from "./install.js";
import type { InstallOptions, InstallResult } from "./install.js";

export async function updatePlugin(options: InstallOptions): Promise<InstallResult> {
  const result = await installPlugin(options);
  return { ...result, command: "update" };
}
