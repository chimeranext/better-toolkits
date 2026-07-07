import type { InstallOptions, InstallResult } from "./install.js";
import { installPlugin } from "./install.js";
export async function updatePlugin(options: InstallOptions): Promise<InstallResult> {
  return { ...(await installPlugin(options)), command: "update" };
}
