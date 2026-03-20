"use strict";
import path from "path";
import { logMessage } from "../../bundler/log.js";
import { readProjectConfig } from "./config.js";
import { functionsDir } from "./utils/utils.js";
import { checkAiFilesStaleness } from "./ai/index.js";
import { getVersion } from "./versionApi.js";
export async function checkVersion(ctx) {
  const version = await getVersion();
  if (version === null) {
    return;
  }
  if (version.message) {
    logMessage(version.message);
  }
  try {
    const { configPath, projectConfig } = await readProjectConfig(ctx);
    const convexDir = path.resolve(functionsDir(configPath, projectConfig));
    const projectDir = path.resolve(path.dirname(configPath));
    await checkAiFilesStaleness(
      version.guidelinesHash,
      version.agentSkillsSha,
      projectDir,
      convexDir
    );
  } catch {
  }
}
//# sourceMappingURL=updates.js.map
