"use strict";
import * as Sentry from "@sentry/node";
import child_process from "child_process";
import path from "path";
import { promises as fs } from "fs";
import { chalkStderr } from "chalk";
import { logMessage } from "../../../bundler/log.js";
import {
  AGENTS_MD_START_MARKER,
  AGENTS_MD_END_MARKER,
  agentsMdConvexSection
} from "../../codegen_templates/agentsmd.js";
import {
  CLAUDE_MD_END_MARKER,
  CLAUDE_MD_START_MARKER,
  claudeMdConvexSection
} from "../../codegen_templates/claudemd.js";
import {
  downloadGuidelines,
  fetchAgentSkillsSha,
  getVersion
} from "../versionApi.js";
import { promptYesNo } from "../utils/prompts.js";
import { hashSha256 } from "../utils/hash.js";
import {
  aiDirForConvexDir,
  agentsMdPath,
  claudeMdPath,
  guidelinesPathForConvexDir
} from "./paths.js";
import {
  readAiConfig,
  writeAiConfig,
  writeAiDisabledToProjectConfig
} from "./config.js";
function isAgentMode() {
  return process.env.CONVEX_AGENT_MODE !== void 0;
}
export async function injectAgentsMdSection(section, projectDir) {
  const filePath = agentsMdPath(projectDir);
  let existing = "";
  try {
    existing = await fs.readFile(filePath, "utf8");
  } catch {
  }
  let updated;
  const startIdx = existing.indexOf(AGENTS_MD_START_MARKER);
  const endIdx = existing.indexOf(AGENTS_MD_END_MARKER);
  if (startIdx !== -1 && endIdx !== -1) {
    updated = existing.slice(0, startIdx) + section + existing.slice(endIdx + AGENTS_MD_END_MARKER.length);
  } else if (existing.length > 0) {
    updated = existing.trimEnd() + "\n\n" + section + "\n";
  } else {
    updated = section + "\n";
  }
  await fs.writeFile(filePath, updated, "utf8");
  return hashSha256(section);
}
export async function injectClaudeMdSection(section, projectDir) {
  const filePath = claudeMdPath(projectDir);
  let existing = "";
  try {
    existing = await fs.readFile(filePath, "utf8");
  } catch {
  }
  let updated;
  const startIdx = existing.indexOf(CLAUDE_MD_START_MARKER);
  const endIdx = existing.indexOf(CLAUDE_MD_END_MARKER);
  if (startIdx !== -1 && endIdx !== -1) {
    updated = existing.slice(0, startIdx) + section + existing.slice(endIdx + CLAUDE_MD_END_MARKER.length);
  } else if (existing.length > 0) {
    updated = existing.trimEnd() + "\n\n" + section + "\n";
  } else {
    updated = section + "\n";
  }
  const didWrite = updated !== existing;
  if (didWrite) {
    await fs.writeFile(filePath, updated, "utf8");
  }
  return {
    sectionHash: hashSha256(section),
    didWrite
  };
}
export async function writeAiFiles(convexDir, installSkills = false, skillsOutputMode = "verbose", projectDirOverride) {
  const projectDir = path.resolve(
    projectDirOverride ?? path.dirname(convexDir)
  );
  try {
    await fs.mkdir(aiDirForConvexDir(convexDir), { recursive: true });
    const config = {
      disableStalenessMessage: false,
      guidelinesHash: null,
      agentsMdSectionHash: null,
      claudeMdHash: null,
      agentSkillsSha: null,
      installedSkillNames: []
    };
    const guidelines = await downloadGuidelines();
    if (guidelines !== null) {
      await fs.writeFile(
        guidelinesPathForConvexDir(convexDir),
        guidelines,
        "utf8"
      );
      config.guidelinesHash = hashSha256(guidelines);
    } else {
      logMessage(
        chalkStderr.yellow(
          "Could not download Convex AI guidelines right now. You can retry with: npx convex ai-files install"
        )
      );
    }
    const convexDirName = path.relative(projectDir, convexDir);
    const section = agentsMdConvexSection(convexDirName);
    config.agentsMdSectionHash = await injectAgentsMdSection(
      section,
      projectDir
    );
    const claudeSection = claudeMdConvexSection(convexDirName);
    const claudeInjectResult = await injectClaudeMdSection(
      claudeSection,
      projectDir
    );
    config.claudeMdHash = claudeInjectResult.sectionHash;
    if (installSkills) {
      if (await shouldRunSkillsCli()) {
        logMessage("Installing Convex agent skills...");
        const skillsOk = await runSkillsAdd(projectDir, skillsOutputMode);
        if (skillsOk) {
          const sha = await fetchAgentSkillsSha();
          if (sha) {
            config.agentSkillsSha = sha;
          }
          const names = await readInstalledSkillNames(projectDir);
          if (names.length > 0) {
            config.installedSkillNames = names;
          }
        } else {
          logMessage(
            chalkStderr.yellow(
              "Could not install agent skills. You can retry manually with: npx skills add get-convex/agent-skills"
            )
          );
        }
      }
    }
    const removedLegacy = await removeLegacyCursorRulesFile(projectDir);
    if (removedLegacy) {
      logMessage(
        `${chalkStderr.green(`\u2714`)} Removed legacy .cursor/rules/convex_rules.mdc (superseded by convex/_generated/ai/guidelines.md).`
      );
    }
    await writeAiConfig(config, projectDir, convexDir);
    logMessage(
      `${chalkStderr.green(`\u2714`)} Wrote Convex AI files to ${path.relative(projectDir, aiDirForConvexDir(convexDir))}/`
    );
  } catch (error) {
    Sentry.captureException(error);
  }
}
export async function checkAiFilesStaleness(canonicalGuidelinesHash, canonicalAgentSkillsSha, projectDir, convexDir) {
  const config = await readAiConfig(projectDir, convexDir);
  if (config === null) {
    logMessage(
      chalkStderr.yellow(
        isAgentMode() ? `Convex AI files are not installed. If you are an agent tell the human to run ${chalkStderr.bold(`npx convex ai-files install`)} to get started or ${chalkStderr.bold(`npx convex ai-files disable`)} to hide this message.` : `Convex AI files are not installed. Run ${chalkStderr.bold(`npx convex ai-files install`)} to get started or ${chalkStderr.bold(`npx convex ai-files disable`)} to hide this message.`
      )
    );
    return;
  }
  if (config.disableStalenessMessage) {
    return;
  }
  if (canonicalGuidelinesHash === null && canonicalAgentSkillsSha === null) {
    return;
  }
  const guidelinesStale = canonicalGuidelinesHash !== null && config.guidelinesHash !== null && config.guidelinesHash !== canonicalGuidelinesHash;
  const skillsStale = canonicalAgentSkillsSha !== null && config.agentSkillsSha !== null && config.agentSkillsSha !== canonicalAgentSkillsSha;
  if (guidelinesStale || skillsStale) {
    logMessage(
      chalkStderr.yellow(
        `Your Convex AI files are out of date. Run ${chalkStderr.bold(`npx convex ai-files update`)} to get the latest.`
      )
    );
  }
}
export async function updateAiFiles(projectDir, convexDir) {
  const config = await readAiConfig(projectDir, convexDir);
  if (config === null) {
    await writeAiFiles(convexDir, true, "verbose", projectDir);
    return;
  }
  await fs.mkdir(aiDirForConvexDir(convexDir), { recursive: true });
  let updatedCount = 0;
  let skippedCount = 0;
  const guidelines = await downloadGuidelines();
  if (guidelines !== null) {
    const newHash = hashSha256(guidelines);
    if (newHash === config.guidelinesHash) {
      logMessage("Convex AI guidelines are already up to date.");
    } else {
      const currentContent = await readFileSafe(
        guidelinesPathForConvexDir(convexDir)
      );
      if (currentContent !== null && config.guidelinesHash !== null && hashSha256(currentContent) !== config.guidelinesHash) {
        logMessage(
          chalkStderr.yellow(
            `Skipping ${path.relative(projectDir, guidelinesPathForConvexDir(convexDir))} \u2014 file has been modified locally.`
          )
        );
        skippedCount++;
      } else {
        await fs.writeFile(
          guidelinesPathForConvexDir(convexDir),
          guidelines,
          "utf8"
        );
        config.guidelinesHash = newHash;
        updatedCount++;
      }
    }
  } else {
    logMessage(
      chalkStderr.yellow(
        "Could not download Convex AI guidelines right now. Keeping your existing guidelines file."
      )
    );
  }
  const convexDirName = path.relative(projectDir, convexDir);
  const section = agentsMdConvexSection(convexDirName);
  const newSectionHash = hashSha256(section);
  if (newSectionHash !== config.agentsMdSectionHash) {
    config.agentsMdSectionHash = await injectAgentsMdSection(
      section,
      projectDir
    );
    updatedCount++;
  }
  if (await shouldRunSkillsCli()) {
    logMessage("Installing Convex agent skills...");
    const skillsOk = await runSkillsAdd(projectDir);
    if (skillsOk) {
      const sha = await fetchAgentSkillsSha();
      if (sha) {
        config.agentSkillsSha = sha;
      }
      const names = await readInstalledSkillNames(projectDir);
      if (names.length > 0) {
        config.installedSkillNames = names;
      }
    } else {
      logMessage(
        chalkStderr.yellow(
          "Could not install agent skills. You can retry manually with: npx skills add get-convex/agent-skills"
        )
      );
    }
  }
  const removedLegacy = await removeLegacyCursorRulesFile(projectDir);
  if (removedLegacy) {
    logMessage(
      `${chalkStderr.green(`\u2714`)} Removed legacy .cursor/rules/convex_rules.mdc (superseded by convex/_generated/ai/guidelines.md).`
    );
    updatedCount++;
  }
  const claudeSection = claudeMdConvexSection(convexDirName);
  const claudeInjectResult = await injectClaudeMdSection(
    claudeSection,
    projectDir
  );
  config.claudeMdHash = claudeInjectResult.sectionHash;
  if (claudeInjectResult.didWrite) {
    updatedCount++;
  }
  await writeAiConfig(config, projectDir, convexDir);
  if (updatedCount > 0) {
    logMessage(
      `${chalkStderr.green(`\u2714`)} Updated ${updatedCount} Convex AI file${updatedCount === 1 ? "" : "s"}.`
    );
  }
  if (skippedCount > 0) {
    logMessage(
      chalkStderr.yellow(
        `Skipped ${skippedCount} file${skippedCount === 1 ? "" : "s"} with local modifications.`
      )
    );
  }
  if (updatedCount === 0 && skippedCount === 0) {
    logMessage("Convex AI files are already up to date.");
  }
}
export async function enableAiFiles(projectDir, convexDir) {
  await updateAiFiles(projectDir, convexDir);
  const config = await readAiConfig(projectDir, convexDir);
  if (config === null) {
    return;
  }
  config.disableStalenessMessage = false;
  await writeAiConfig(config, projectDir, convexDir, {
    persistDisabledPreference: "always"
  });
}
async function stripAgentsMdSection(projectDir) {
  const filePath = agentsMdPath(projectDir);
  let content;
  try {
    content = await fs.readFile(filePath, "utf8");
  } catch {
    return false;
  }
  const startIdx = content.indexOf(AGENTS_MD_START_MARKER);
  const endIdx = content.indexOf(AGENTS_MD_END_MARKER);
  if (startIdx === -1 || endIdx === -1) {
    return false;
  }
  const before = content.slice(0, startIdx).trimEnd();
  const after = content.slice(endIdx + AGENTS_MD_END_MARKER.length).trimStart();
  const updated = [before, after].filter(Boolean).join("\n\n");
  if (!updated.trim()) {
    try {
      await fs.unlink(filePath);
    } catch {
    }
  } else {
    await fs.writeFile(filePath, updated + "\n", "utf8");
  }
  return true;
}
async function stripClaudeMdSection(projectDir) {
  const filePath = claudeMdPath(projectDir);
  let content;
  try {
    content = await fs.readFile(filePath, "utf8");
  } catch {
    return "none";
  }
  const startIdx = content.indexOf(CLAUDE_MD_START_MARKER);
  const endIdx = content.indexOf(CLAUDE_MD_END_MARKER);
  if (startIdx === -1 || endIdx === -1) {
    return "none";
  }
  const before = content.slice(0, startIdx).trimEnd();
  const after = content.slice(endIdx + CLAUDE_MD_END_MARKER.length).trimStart();
  const updated = [before, after].filter(Boolean).join("\n\n");
  if (!updated.trim()) {
    try {
      await fs.unlink(filePath);
    } catch {
    }
    return "file";
  }
  await fs.writeFile(filePath, updated + "\n", "utf8");
  return "section";
}
export async function removeAiFiles(projectDir, convexDir) {
  const config = await readAiConfig(projectDir, convexDir);
  if (config === null) {
    logMessage("No Convex AI files found \u2014 nothing to remove.");
    return;
  }
  let removedCount = 0;
  const stripped = await stripAgentsMdSection(projectDir);
  if (stripped) {
    logMessage(
      `${chalkStderr.green(`\u2714`)} Removed Convex section from AGENTS.md.`
    );
    removedCount++;
  }
  const strippedClaude = await stripClaudeMdSection(projectDir);
  if (strippedClaude === "section") {
    logMessage(
      `${chalkStderr.green(`\u2714`)} Removed Convex section from CLAUDE.md.`
    );
    removedCount++;
  } else if (strippedClaude === "file") {
    logMessage(`${chalkStderr.green(`\u2714`)} Deleted CLAUDE.md.`);
    removedCount++;
  }
  if (config.installedSkillNames.length > 0) {
    if (await shouldRunSkillsCli()) {
      logMessage(
        `Removing Convex agent skills: ${config.installedSkillNames.join(", ")}`
      );
      const skillsOk = await runSkillsRemove(
        projectDir,
        config.installedSkillNames
      );
      if (!skillsOk) {
        logMessage(
          chalkStderr.yellow(
            "Could not remove agent skills automatically. Remove them manually with: npx skills remove"
          )
        );
      } else {
        const removedLock = await removeSkillsLockIfEmpty(
          projectDir,
          config.installedSkillNames
        );
        if (removedLock) {
          logMessage(`${chalkStderr.green(`\u2714`)} Deleted skills-lock.json.`);
          removedCount++;
        }
      }
    }
  }
  const removedLegacy = await removeLegacyCursorRulesFile(projectDir);
  if (removedLegacy) {
    logMessage(
      `${chalkStderr.green(`\u2714`)} Removed legacy .cursor/rules/convex_rules.mdc.`
    );
    removedCount++;
  }
  try {
    await fs.rm(aiDirForConvexDir(convexDir), { recursive: true, force: true });
    logMessage(
      `${chalkStderr.green(`\u2714`)} Deleted ${path.relative(projectDir, aiDirForConvexDir(convexDir))}/`
    );
    removedCount++;
  } catch (error) {
    Sentry.captureException(error);
    logMessage(
      chalkStderr.yellow(
        `Could not delete ${path.relative(projectDir, aiDirForConvexDir(convexDir))}/. Remove it manually.`
      )
    );
  }
  if (removedCount > 0) {
    logMessage("Convex AI files removed.");
  }
}
export async function disableAiFiles(projectDir) {
  try {
    await writeAiDisabledToProjectConfig(true, projectDir);
    logMessage(
      `${chalkStderr.green(`\u2714`)} Convex AI file staleness/install messages disabled. Run ${chalkStderr.bold(`npx convex ai-files enable`)} to re-enable.`
    );
  } catch (error) {
    Sentry.captureException(error);
    logMessage(
      chalkStderr.yellow(
        "Could not write AI message suppression config. Message may reappear."
      )
    );
  }
}
export async function statusAiFiles(projectDir, convexDir) {
  const convexDirName = path.relative(projectDir, convexDir);
  const guidelinesRelPath = path.relative(
    projectDir,
    guidelinesPathForConvexDir(convexDir)
  );
  const config = await readAiConfig(projectDir, convexDir);
  if (config === null) {
    logMessage(`Convex AI files: ${chalkStderr.yellow("not installed")}`);
    logMessage(
      `  Run ${chalkStderr.bold("npx convex ai-files install")} to get started, or ${chalkStderr.bold("npx convex ai-files disable")} to silence this message.`
    );
    return;
  }
  if (config.disableStalenessMessage) {
    logMessage(
      `Convex AI files: ${chalkStderr.yellow("staleness/install messages disabled")}`
    );
    logMessage(
      `  Run ${chalkStderr.bold("npx convex ai-files enable")} to re-enable.`
    );
    return;
  }
  logMessage(`Convex AI files: ${chalkStderr.green("enabled")}`);
  const [versionData, guidelinesFile, agentsContent, claudeContent] = await Promise.all([
    getVersion(),
    readFileSafe(guidelinesPathForConvexDir(convexDir)),
    readFileSafe(agentsMdPath(projectDir)),
    readFileSafe(claudeMdPath(projectDir))
  ]);
  const canonicalGuidelinesHash = versionData?.guidelinesHash ?? null;
  const canonicalAgentSkillsSha = versionData?.agentSkillsSha ?? null;
  const networkAvailable = versionData !== null;
  if (guidelinesFile === null) {
    logMessage(
      `  ${chalkStderr.yellow("\u26A0")} ${guidelinesRelPath}: not on disk \u2014 run ${chalkStderr.bold("npx convex ai-files install")} to reinstall`
    );
  } else if (config.guidelinesHash !== null && hashSha256(guidelinesFile) !== config.guidelinesHash) {
    logMessage(
      `  ${chalkStderr.yellow("\u26A0")} ${guidelinesRelPath}: installed, modified locally (Convex updates will be skipped)`
    );
  } else if (networkAvailable && canonicalGuidelinesHash !== null && config.guidelinesHash !== null && config.guidelinesHash !== canonicalGuidelinesHash) {
    logMessage(
      `  ${chalkStderr.yellow("\u26A0")} ${guidelinesRelPath}: installed, out of date \u2014 run ${chalkStderr.bold("npx convex ai-files update")}`
    );
  } else {
    logMessage(
      `  ${chalkStderr.green("\u2714")} ${guidelinesRelPath}: installed${networkAvailable ? ", up to date" : ""}`
    );
  }
  const hasAgentsSection = agentsContent !== null && agentsContent.includes(AGENTS_MD_START_MARKER) && agentsContent.includes(AGENTS_MD_END_MARKER);
  if (!hasAgentsSection) {
    logMessage(
      `  ${chalkStderr.yellow("\u26A0")} AGENTS.md: Convex section missing \u2014 run ${chalkStderr.bold("npx convex ai-files install")} to reinstall`
    );
  } else {
    const currentSectionHash = hashSha256(agentsMdConvexSection(convexDirName));
    if (config.agentsMdSectionHash !== null && config.agentsMdSectionHash !== currentSectionHash) {
      logMessage(
        `  ${chalkStderr.yellow("\u26A0")} AGENTS.md: Convex section out of date \u2014 run ${chalkStderr.bold("npx convex ai-files update")}`
      );
    } else {
      logMessage(
        `  ${chalkStderr.green("\u2714")} AGENTS.md: Convex section present, up to date`
      );
    }
  }
  const hasClaudeSection = claudeContent !== null && claudeContent.includes(CLAUDE_MD_START_MARKER) && claudeContent.includes(CLAUDE_MD_END_MARKER);
  if (!hasClaudeSection) {
    if (claudeContent === null) {
      logMessage(
        `  ${chalkStderr.yellow("\u26A0")} CLAUDE.md: missing - run ${chalkStderr.bold("npx convex ai-files install")} to create it`
      );
    } else {
      logMessage(
        `  ${chalkStderr.yellow("\u26A0")} CLAUDE.md: no Convex section present - run ${chalkStderr.bold("npx convex ai-files update")} to add it`
      );
    }
  } else {
    const currentSectionHash = hashSha256(claudeMdConvexSection(convexDirName));
    if (config.claudeMdHash !== null && config.claudeMdHash !== currentSectionHash) {
      logMessage(
        `  ${chalkStderr.yellow("\u26A0")} CLAUDE.md: Convex section out of date - run ${chalkStderr.bold("npx convex ai-files update")}`
      );
    } else {
      logMessage(
        `  ${chalkStderr.green("\u2714")} CLAUDE.md: Convex section present, up to date`
      );
    }
  }
  if (config.installedSkillNames.length === 0) {
    logMessage(
      `  ${chalkStderr.yellow("\u26A0")} Agent skills: not installed \u2014 run ${chalkStderr.bold("npx convex ai-files install")} to install`
    );
  } else {
    const skillsStale = networkAvailable && canonicalAgentSkillsSha !== null && config.agentSkillsSha !== null && config.agentSkillsSha !== canonicalAgentSkillsSha;
    const skillsList = config.installedSkillNames.join(", ");
    if (skillsStale) {
      logMessage(
        `  ${chalkStderr.yellow("\u26A0")} Agent skills: ${skillsList} \u2014 out of date, run ${chalkStderr.bold("npx convex ai-files update")}`
      );
    } else {
      logMessage(
        `  ${chalkStderr.green("\u2714")} Agent skills: ${skillsList}${networkAvailable ? " (up to date)" : ""}`
      );
    }
  }
}
export async function maybeSetupAiFiles(ctx, convexDir, projectDir) {
  if (isAgentMode()) {
    return;
  }
  let wantsAiFiles = true;
  if (process.stdin.isTTY) {
    wantsAiFiles = await promptYesNo(ctx, {
      message: "Set up Convex AI files? (guidelines, AGENTS.md, agent skills)",
      default: true
    });
  }
  if (wantsAiFiles) {
    await writeAiFiles(convexDir, true, "quiet", projectDir);
  }
}
async function removeLegacyCursorRulesFile(projectDir) {
  const filePath = path.join(
    projectDir,
    ".cursor",
    "rules",
    "convex_rules.mdc"
  );
  try {
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
}
async function removeSkillsLockIfEmpty(projectDir, removedSkillNames) {
  const lockPath = path.join(projectDir, "skills-lock.json");
  try {
    const content = await fs.readFile(lockPath, "utf8");
    const lock = JSON.parse(content);
    if (!lock || typeof lock !== "object" || !lock.skills || typeof lock.skills !== "object") {
      return false;
    }
    const remainingSkills = Object.keys(lock.skills).filter(
      (name) => !removedSkillNames.includes(name)
    );
    if (remainingSkills.length === 0) {
      await fs.unlink(lockPath);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
async function readFileSafe(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}
async function readInstalledSkillNames(projectDir) {
  const skillsDir = path.join(projectDir, ".agents", "skills");
  let entries;
  try {
    const dirents = await fs.readdir(skillsDir, { withFileTypes: true });
    entries = dirents.filter((d) => d.isDirectory() || d.isSymbolicLink()).map((d) => d.name);
  } catch {
    return [];
  }
  const names = [];
  for (const entry of entries) {
    const skillMdPath = path.join(skillsDir, entry, "SKILL.md");
    const content = await readFileSafe(skillMdPath);
    if (content === null) continue;
    const match = content.match(/^---[\s\S]*?^name:\s*(.+?)\s*$/m);
    if (match) {
      names.push(match[1]);
    }
  }
  return names;
}
function runSkillsAdd(cwd, outputMode = "verbose") {
  return runSkillsCommand(
    cwd,
    ["add", "get-convex/agent-skills", "--yes"],
    outputMode
  );
}
function runSkillsRemove(cwd, skillNames) {
  return runSkillsCommand(cwd, ["remove", ...skillNames, "--yes"]);
}
async function shouldRunSkillsCli() {
  const versionData = await getVersion();
  if (versionData === null || versionData === void 0) {
    logMessage(chalkStderr.yellow(`Agent skills are temporarily disabled.`));
    return false;
  }
  if (versionData.disableSkillsCli) {
    logMessage(chalkStderr.yellow(`Agent skills are temporarily disabled.`));
    return false;
  }
  return true;
}
function runSkillsCommand(cwd, args, outputMode = "verbose") {
  return new Promise((resolve) => {
    const quiet = outputMode === "quiet";
    const proc = child_process.spawn("npx", ["skills@latest", ...args], {
      cwd,
      stdio: quiet ? "pipe" : "inherit",
      // shell: true is required on Windows to resolve `npx` from PATH.
      shell: process.platform === "win32"
    });
    let capturedOutput = "";
    if (quiet) {
      proc.stdout?.on("data", (chunk) => {
        capturedOutput += chunk.toString();
      });
      proc.stderr?.on("data", (chunk) => {
        capturedOutput += chunk.toString();
      });
    }
    proc.on("close", (code) => {
      if (quiet && code !== 0 && capturedOutput.trim().length > 0) {
        const lines = capturedOutput.trim().split(/\r?\n/);
        const tail = lines.slice(-10).join("\n");
        logMessage(chalkStderr.gray(`skills output (tail):
${tail}`));
      }
      resolve(code === 0);
    });
    proc.on("error", () => resolve(false));
  });
}
//# sourceMappingURL=index.js.map
