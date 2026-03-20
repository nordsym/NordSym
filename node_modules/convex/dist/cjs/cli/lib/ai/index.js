"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var ai_exports = {};
__export(ai_exports, {
  checkAiFilesStaleness: () => checkAiFilesStaleness,
  disableAiFiles: () => disableAiFiles,
  enableAiFiles: () => enableAiFiles,
  injectAgentsMdSection: () => injectAgentsMdSection,
  injectClaudeMdSection: () => injectClaudeMdSection,
  maybeSetupAiFiles: () => maybeSetupAiFiles,
  removeAiFiles: () => removeAiFiles,
  statusAiFiles: () => statusAiFiles,
  updateAiFiles: () => updateAiFiles,
  writeAiFiles: () => writeAiFiles
});
module.exports = __toCommonJS(ai_exports);
var Sentry = __toESM(require("@sentry/node"), 1);
var import_child_process = __toESM(require("child_process"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = require("fs");
var import_chalk = require("chalk");
var import_log = require("../../../bundler/log.js");
var import_agentsmd = require("../../codegen_templates/agentsmd.js");
var import_claudemd = require("../../codegen_templates/claudemd.js");
var import_versionApi = require("../versionApi.js");
var import_prompts = require("../utils/prompts.js");
var import_hash = require("../utils/hash.js");
var import_paths = require("./paths.js");
var import_config = require("./config.js");
function isAgentMode() {
  return process.env.CONVEX_AGENT_MODE !== void 0;
}
async function injectAgentsMdSection(section, projectDir) {
  const filePath = (0, import_paths.agentsMdPath)(projectDir);
  let existing = "";
  try {
    existing = await import_fs.promises.readFile(filePath, "utf8");
  } catch {
  }
  let updated;
  const startIdx = existing.indexOf(import_agentsmd.AGENTS_MD_START_MARKER);
  const endIdx = existing.indexOf(import_agentsmd.AGENTS_MD_END_MARKER);
  if (startIdx !== -1 && endIdx !== -1) {
    updated = existing.slice(0, startIdx) + section + existing.slice(endIdx + import_agentsmd.AGENTS_MD_END_MARKER.length);
  } else if (existing.length > 0) {
    updated = existing.trimEnd() + "\n\n" + section + "\n";
  } else {
    updated = section + "\n";
  }
  await import_fs.promises.writeFile(filePath, updated, "utf8");
  return (0, import_hash.hashSha256)(section);
}
async function injectClaudeMdSection(section, projectDir) {
  const filePath = (0, import_paths.claudeMdPath)(projectDir);
  let existing = "";
  try {
    existing = await import_fs.promises.readFile(filePath, "utf8");
  } catch {
  }
  let updated;
  const startIdx = existing.indexOf(import_claudemd.CLAUDE_MD_START_MARKER);
  const endIdx = existing.indexOf(import_claudemd.CLAUDE_MD_END_MARKER);
  if (startIdx !== -1 && endIdx !== -1) {
    updated = existing.slice(0, startIdx) + section + existing.slice(endIdx + import_claudemd.CLAUDE_MD_END_MARKER.length);
  } else if (existing.length > 0) {
    updated = existing.trimEnd() + "\n\n" + section + "\n";
  } else {
    updated = section + "\n";
  }
  const didWrite = updated !== existing;
  if (didWrite) {
    await import_fs.promises.writeFile(filePath, updated, "utf8");
  }
  return {
    sectionHash: (0, import_hash.hashSha256)(section),
    didWrite
  };
}
async function writeAiFiles(convexDir, installSkills = false, skillsOutputMode = "verbose", projectDirOverride) {
  const projectDir = import_path.default.resolve(
    projectDirOverride ?? import_path.default.dirname(convexDir)
  );
  try {
    await import_fs.promises.mkdir((0, import_paths.aiDirForConvexDir)(convexDir), { recursive: true });
    const config = {
      disableStalenessMessage: false,
      guidelinesHash: null,
      agentsMdSectionHash: null,
      claudeMdHash: null,
      agentSkillsSha: null,
      installedSkillNames: []
    };
    const guidelines = await (0, import_versionApi.downloadGuidelines)();
    if (guidelines !== null) {
      await import_fs.promises.writeFile(
        (0, import_paths.guidelinesPathForConvexDir)(convexDir),
        guidelines,
        "utf8"
      );
      config.guidelinesHash = (0, import_hash.hashSha256)(guidelines);
    } else {
      (0, import_log.logMessage)(
        import_chalk.chalkStderr.yellow(
          "Could not download Convex AI guidelines right now. You can retry with: npx convex ai-files install"
        )
      );
    }
    const convexDirName = import_path.default.relative(projectDir, convexDir);
    const section = (0, import_agentsmd.agentsMdConvexSection)(convexDirName);
    config.agentsMdSectionHash = await injectAgentsMdSection(
      section,
      projectDir
    );
    const claudeSection = (0, import_claudemd.claudeMdConvexSection)(convexDirName);
    const claudeInjectResult = await injectClaudeMdSection(
      claudeSection,
      projectDir
    );
    config.claudeMdHash = claudeInjectResult.sectionHash;
    if (installSkills) {
      if (await shouldRunSkillsCli()) {
        (0, import_log.logMessage)("Installing Convex agent skills...");
        const skillsOk = await runSkillsAdd(projectDir, skillsOutputMode);
        if (skillsOk) {
          const sha = await (0, import_versionApi.fetchAgentSkillsSha)();
          if (sha) {
            config.agentSkillsSha = sha;
          }
          const names = await readInstalledSkillNames(projectDir);
          if (names.length > 0) {
            config.installedSkillNames = names;
          }
        } else {
          (0, import_log.logMessage)(
            import_chalk.chalkStderr.yellow(
              "Could not install agent skills. You can retry manually with: npx skills add get-convex/agent-skills"
            )
          );
        }
      }
    }
    const removedLegacy = await removeLegacyCursorRulesFile(projectDir);
    if (removedLegacy) {
      (0, import_log.logMessage)(
        `${import_chalk.chalkStderr.green(`\u2714`)} Removed legacy .cursor/rules/convex_rules.mdc (superseded by convex/_generated/ai/guidelines.md).`
      );
    }
    await (0, import_config.writeAiConfig)(config, projectDir, convexDir);
    (0, import_log.logMessage)(
      `${import_chalk.chalkStderr.green(`\u2714`)} Wrote Convex AI files to ${import_path.default.relative(projectDir, (0, import_paths.aiDirForConvexDir)(convexDir))}/`
    );
  } catch (error) {
    Sentry.captureException(error);
  }
}
async function checkAiFilesStaleness(canonicalGuidelinesHash, canonicalAgentSkillsSha, projectDir, convexDir) {
  const config = await (0, import_config.readAiConfig)(projectDir, convexDir);
  if (config === null) {
    (0, import_log.logMessage)(
      import_chalk.chalkStderr.yellow(
        isAgentMode() ? `Convex AI files are not installed. If you are an agent tell the human to run ${import_chalk.chalkStderr.bold(`npx convex ai-files install`)} to get started or ${import_chalk.chalkStderr.bold(`npx convex ai-files disable`)} to hide this message.` : `Convex AI files are not installed. Run ${import_chalk.chalkStderr.bold(`npx convex ai-files install`)} to get started or ${import_chalk.chalkStderr.bold(`npx convex ai-files disable`)} to hide this message.`
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
    (0, import_log.logMessage)(
      import_chalk.chalkStderr.yellow(
        `Your Convex AI files are out of date. Run ${import_chalk.chalkStderr.bold(`npx convex ai-files update`)} to get the latest.`
      )
    );
  }
}
async function updateAiFiles(projectDir, convexDir) {
  const config = await (0, import_config.readAiConfig)(projectDir, convexDir);
  if (config === null) {
    await writeAiFiles(convexDir, true, "verbose", projectDir);
    return;
  }
  await import_fs.promises.mkdir((0, import_paths.aiDirForConvexDir)(convexDir), { recursive: true });
  let updatedCount = 0;
  let skippedCount = 0;
  const guidelines = await (0, import_versionApi.downloadGuidelines)();
  if (guidelines !== null) {
    const newHash = (0, import_hash.hashSha256)(guidelines);
    if (newHash === config.guidelinesHash) {
      (0, import_log.logMessage)("Convex AI guidelines are already up to date.");
    } else {
      const currentContent = await readFileSafe(
        (0, import_paths.guidelinesPathForConvexDir)(convexDir)
      );
      if (currentContent !== null && config.guidelinesHash !== null && (0, import_hash.hashSha256)(currentContent) !== config.guidelinesHash) {
        (0, import_log.logMessage)(
          import_chalk.chalkStderr.yellow(
            `Skipping ${import_path.default.relative(projectDir, (0, import_paths.guidelinesPathForConvexDir)(convexDir))} \u2014 file has been modified locally.`
          )
        );
        skippedCount++;
      } else {
        await import_fs.promises.writeFile(
          (0, import_paths.guidelinesPathForConvexDir)(convexDir),
          guidelines,
          "utf8"
        );
        config.guidelinesHash = newHash;
        updatedCount++;
      }
    }
  } else {
    (0, import_log.logMessage)(
      import_chalk.chalkStderr.yellow(
        "Could not download Convex AI guidelines right now. Keeping your existing guidelines file."
      )
    );
  }
  const convexDirName = import_path.default.relative(projectDir, convexDir);
  const section = (0, import_agentsmd.agentsMdConvexSection)(convexDirName);
  const newSectionHash = (0, import_hash.hashSha256)(section);
  if (newSectionHash !== config.agentsMdSectionHash) {
    config.agentsMdSectionHash = await injectAgentsMdSection(
      section,
      projectDir
    );
    updatedCount++;
  }
  if (await shouldRunSkillsCli()) {
    (0, import_log.logMessage)("Installing Convex agent skills...");
    const skillsOk = await runSkillsAdd(projectDir);
    if (skillsOk) {
      const sha = await (0, import_versionApi.fetchAgentSkillsSha)();
      if (sha) {
        config.agentSkillsSha = sha;
      }
      const names = await readInstalledSkillNames(projectDir);
      if (names.length > 0) {
        config.installedSkillNames = names;
      }
    } else {
      (0, import_log.logMessage)(
        import_chalk.chalkStderr.yellow(
          "Could not install agent skills. You can retry manually with: npx skills add get-convex/agent-skills"
        )
      );
    }
  }
  const removedLegacy = await removeLegacyCursorRulesFile(projectDir);
  if (removedLegacy) {
    (0, import_log.logMessage)(
      `${import_chalk.chalkStderr.green(`\u2714`)} Removed legacy .cursor/rules/convex_rules.mdc (superseded by convex/_generated/ai/guidelines.md).`
    );
    updatedCount++;
  }
  const claudeSection = (0, import_claudemd.claudeMdConvexSection)(convexDirName);
  const claudeInjectResult = await injectClaudeMdSection(
    claudeSection,
    projectDir
  );
  config.claudeMdHash = claudeInjectResult.sectionHash;
  if (claudeInjectResult.didWrite) {
    updatedCount++;
  }
  await (0, import_config.writeAiConfig)(config, projectDir, convexDir);
  if (updatedCount > 0) {
    (0, import_log.logMessage)(
      `${import_chalk.chalkStderr.green(`\u2714`)} Updated ${updatedCount} Convex AI file${updatedCount === 1 ? "" : "s"}.`
    );
  }
  if (skippedCount > 0) {
    (0, import_log.logMessage)(
      import_chalk.chalkStderr.yellow(
        `Skipped ${skippedCount} file${skippedCount === 1 ? "" : "s"} with local modifications.`
      )
    );
  }
  if (updatedCount === 0 && skippedCount === 0) {
    (0, import_log.logMessage)("Convex AI files are already up to date.");
  }
}
async function enableAiFiles(projectDir, convexDir) {
  await updateAiFiles(projectDir, convexDir);
  const config = await (0, import_config.readAiConfig)(projectDir, convexDir);
  if (config === null) {
    return;
  }
  config.disableStalenessMessage = false;
  await (0, import_config.writeAiConfig)(config, projectDir, convexDir, {
    persistDisabledPreference: "always"
  });
}
async function stripAgentsMdSection(projectDir) {
  const filePath = (0, import_paths.agentsMdPath)(projectDir);
  let content;
  try {
    content = await import_fs.promises.readFile(filePath, "utf8");
  } catch {
    return false;
  }
  const startIdx = content.indexOf(import_agentsmd.AGENTS_MD_START_MARKER);
  const endIdx = content.indexOf(import_agentsmd.AGENTS_MD_END_MARKER);
  if (startIdx === -1 || endIdx === -1) {
    return false;
  }
  const before = content.slice(0, startIdx).trimEnd();
  const after = content.slice(endIdx + import_agentsmd.AGENTS_MD_END_MARKER.length).trimStart();
  const updated = [before, after].filter(Boolean).join("\n\n");
  if (!updated.trim()) {
    try {
      await import_fs.promises.unlink(filePath);
    } catch {
    }
  } else {
    await import_fs.promises.writeFile(filePath, updated + "\n", "utf8");
  }
  return true;
}
async function stripClaudeMdSection(projectDir) {
  const filePath = (0, import_paths.claudeMdPath)(projectDir);
  let content;
  try {
    content = await import_fs.promises.readFile(filePath, "utf8");
  } catch {
    return "none";
  }
  const startIdx = content.indexOf(import_claudemd.CLAUDE_MD_START_MARKER);
  const endIdx = content.indexOf(import_claudemd.CLAUDE_MD_END_MARKER);
  if (startIdx === -1 || endIdx === -1) {
    return "none";
  }
  const before = content.slice(0, startIdx).trimEnd();
  const after = content.slice(endIdx + import_claudemd.CLAUDE_MD_END_MARKER.length).trimStart();
  const updated = [before, after].filter(Boolean).join("\n\n");
  if (!updated.trim()) {
    try {
      await import_fs.promises.unlink(filePath);
    } catch {
    }
    return "file";
  }
  await import_fs.promises.writeFile(filePath, updated + "\n", "utf8");
  return "section";
}
async function removeAiFiles(projectDir, convexDir) {
  const config = await (0, import_config.readAiConfig)(projectDir, convexDir);
  if (config === null) {
    (0, import_log.logMessage)("No Convex AI files found \u2014 nothing to remove.");
    return;
  }
  let removedCount = 0;
  const stripped = await stripAgentsMdSection(projectDir);
  if (stripped) {
    (0, import_log.logMessage)(
      `${import_chalk.chalkStderr.green(`\u2714`)} Removed Convex section from AGENTS.md.`
    );
    removedCount++;
  }
  const strippedClaude = await stripClaudeMdSection(projectDir);
  if (strippedClaude === "section") {
    (0, import_log.logMessage)(
      `${import_chalk.chalkStderr.green(`\u2714`)} Removed Convex section from CLAUDE.md.`
    );
    removedCount++;
  } else if (strippedClaude === "file") {
    (0, import_log.logMessage)(`${import_chalk.chalkStderr.green(`\u2714`)} Deleted CLAUDE.md.`);
    removedCount++;
  }
  if (config.installedSkillNames.length > 0) {
    if (await shouldRunSkillsCli()) {
      (0, import_log.logMessage)(
        `Removing Convex agent skills: ${config.installedSkillNames.join(", ")}`
      );
      const skillsOk = await runSkillsRemove(
        projectDir,
        config.installedSkillNames
      );
      if (!skillsOk) {
        (0, import_log.logMessage)(
          import_chalk.chalkStderr.yellow(
            "Could not remove agent skills automatically. Remove them manually with: npx skills remove"
          )
        );
      } else {
        const removedLock = await removeSkillsLockIfEmpty(
          projectDir,
          config.installedSkillNames
        );
        if (removedLock) {
          (0, import_log.logMessage)(`${import_chalk.chalkStderr.green(`\u2714`)} Deleted skills-lock.json.`);
          removedCount++;
        }
      }
    }
  }
  const removedLegacy = await removeLegacyCursorRulesFile(projectDir);
  if (removedLegacy) {
    (0, import_log.logMessage)(
      `${import_chalk.chalkStderr.green(`\u2714`)} Removed legacy .cursor/rules/convex_rules.mdc.`
    );
    removedCount++;
  }
  try {
    await import_fs.promises.rm((0, import_paths.aiDirForConvexDir)(convexDir), { recursive: true, force: true });
    (0, import_log.logMessage)(
      `${import_chalk.chalkStderr.green(`\u2714`)} Deleted ${import_path.default.relative(projectDir, (0, import_paths.aiDirForConvexDir)(convexDir))}/`
    );
    removedCount++;
  } catch (error) {
    Sentry.captureException(error);
    (0, import_log.logMessage)(
      import_chalk.chalkStderr.yellow(
        `Could not delete ${import_path.default.relative(projectDir, (0, import_paths.aiDirForConvexDir)(convexDir))}/. Remove it manually.`
      )
    );
  }
  if (removedCount > 0) {
    (0, import_log.logMessage)("Convex AI files removed.");
  }
}
async function disableAiFiles(projectDir) {
  try {
    await (0, import_config.writeAiDisabledToProjectConfig)(true, projectDir);
    (0, import_log.logMessage)(
      `${import_chalk.chalkStderr.green(`\u2714`)} Convex AI file staleness/install messages disabled. Run ${import_chalk.chalkStderr.bold(`npx convex ai-files enable`)} to re-enable.`
    );
  } catch (error) {
    Sentry.captureException(error);
    (0, import_log.logMessage)(
      import_chalk.chalkStderr.yellow(
        "Could not write AI message suppression config. Message may reappear."
      )
    );
  }
}
async function statusAiFiles(projectDir, convexDir) {
  const convexDirName = import_path.default.relative(projectDir, convexDir);
  const guidelinesRelPath = import_path.default.relative(
    projectDir,
    (0, import_paths.guidelinesPathForConvexDir)(convexDir)
  );
  const config = await (0, import_config.readAiConfig)(projectDir, convexDir);
  if (config === null) {
    (0, import_log.logMessage)(`Convex AI files: ${import_chalk.chalkStderr.yellow("not installed")}`);
    (0, import_log.logMessage)(
      `  Run ${import_chalk.chalkStderr.bold("npx convex ai-files install")} to get started, or ${import_chalk.chalkStderr.bold("npx convex ai-files disable")} to silence this message.`
    );
    return;
  }
  if (config.disableStalenessMessage) {
    (0, import_log.logMessage)(
      `Convex AI files: ${import_chalk.chalkStderr.yellow("staleness/install messages disabled")}`
    );
    (0, import_log.logMessage)(
      `  Run ${import_chalk.chalkStderr.bold("npx convex ai-files enable")} to re-enable.`
    );
    return;
  }
  (0, import_log.logMessage)(`Convex AI files: ${import_chalk.chalkStderr.green("enabled")}`);
  const [versionData, guidelinesFile, agentsContent, claudeContent] = await Promise.all([
    (0, import_versionApi.getVersion)(),
    readFileSafe((0, import_paths.guidelinesPathForConvexDir)(convexDir)),
    readFileSafe((0, import_paths.agentsMdPath)(projectDir)),
    readFileSafe((0, import_paths.claudeMdPath)(projectDir))
  ]);
  const canonicalGuidelinesHash = versionData?.guidelinesHash ?? null;
  const canonicalAgentSkillsSha = versionData?.agentSkillsSha ?? null;
  const networkAvailable = versionData !== null;
  if (guidelinesFile === null) {
    (0, import_log.logMessage)(
      `  ${import_chalk.chalkStderr.yellow("\u26A0")} ${guidelinesRelPath}: not on disk \u2014 run ${import_chalk.chalkStderr.bold("npx convex ai-files install")} to reinstall`
    );
  } else if (config.guidelinesHash !== null && (0, import_hash.hashSha256)(guidelinesFile) !== config.guidelinesHash) {
    (0, import_log.logMessage)(
      `  ${import_chalk.chalkStderr.yellow("\u26A0")} ${guidelinesRelPath}: installed, modified locally (Convex updates will be skipped)`
    );
  } else if (networkAvailable && canonicalGuidelinesHash !== null && config.guidelinesHash !== null && config.guidelinesHash !== canonicalGuidelinesHash) {
    (0, import_log.logMessage)(
      `  ${import_chalk.chalkStderr.yellow("\u26A0")} ${guidelinesRelPath}: installed, out of date \u2014 run ${import_chalk.chalkStderr.bold("npx convex ai-files update")}`
    );
  } else {
    (0, import_log.logMessage)(
      `  ${import_chalk.chalkStderr.green("\u2714")} ${guidelinesRelPath}: installed${networkAvailable ? ", up to date" : ""}`
    );
  }
  const hasAgentsSection = agentsContent !== null && agentsContent.includes(import_agentsmd.AGENTS_MD_START_MARKER) && agentsContent.includes(import_agentsmd.AGENTS_MD_END_MARKER);
  if (!hasAgentsSection) {
    (0, import_log.logMessage)(
      `  ${import_chalk.chalkStderr.yellow("\u26A0")} AGENTS.md: Convex section missing \u2014 run ${import_chalk.chalkStderr.bold("npx convex ai-files install")} to reinstall`
    );
  } else {
    const currentSectionHash = (0, import_hash.hashSha256)((0, import_agentsmd.agentsMdConvexSection)(convexDirName));
    if (config.agentsMdSectionHash !== null && config.agentsMdSectionHash !== currentSectionHash) {
      (0, import_log.logMessage)(
        `  ${import_chalk.chalkStderr.yellow("\u26A0")} AGENTS.md: Convex section out of date \u2014 run ${import_chalk.chalkStderr.bold("npx convex ai-files update")}`
      );
    } else {
      (0, import_log.logMessage)(
        `  ${import_chalk.chalkStderr.green("\u2714")} AGENTS.md: Convex section present, up to date`
      );
    }
  }
  const hasClaudeSection = claudeContent !== null && claudeContent.includes(import_claudemd.CLAUDE_MD_START_MARKER) && claudeContent.includes(import_claudemd.CLAUDE_MD_END_MARKER);
  if (!hasClaudeSection) {
    if (claudeContent === null) {
      (0, import_log.logMessage)(
        `  ${import_chalk.chalkStderr.yellow("\u26A0")} CLAUDE.md: missing - run ${import_chalk.chalkStderr.bold("npx convex ai-files install")} to create it`
      );
    } else {
      (0, import_log.logMessage)(
        `  ${import_chalk.chalkStderr.yellow("\u26A0")} CLAUDE.md: no Convex section present - run ${import_chalk.chalkStderr.bold("npx convex ai-files update")} to add it`
      );
    }
  } else {
    const currentSectionHash = (0, import_hash.hashSha256)((0, import_claudemd.claudeMdConvexSection)(convexDirName));
    if (config.claudeMdHash !== null && config.claudeMdHash !== currentSectionHash) {
      (0, import_log.logMessage)(
        `  ${import_chalk.chalkStderr.yellow("\u26A0")} CLAUDE.md: Convex section out of date - run ${import_chalk.chalkStderr.bold("npx convex ai-files update")}`
      );
    } else {
      (0, import_log.logMessage)(
        `  ${import_chalk.chalkStderr.green("\u2714")} CLAUDE.md: Convex section present, up to date`
      );
    }
  }
  if (config.installedSkillNames.length === 0) {
    (0, import_log.logMessage)(
      `  ${import_chalk.chalkStderr.yellow("\u26A0")} Agent skills: not installed \u2014 run ${import_chalk.chalkStderr.bold("npx convex ai-files install")} to install`
    );
  } else {
    const skillsStale = networkAvailable && canonicalAgentSkillsSha !== null && config.agentSkillsSha !== null && config.agentSkillsSha !== canonicalAgentSkillsSha;
    const skillsList = config.installedSkillNames.join(", ");
    if (skillsStale) {
      (0, import_log.logMessage)(
        `  ${import_chalk.chalkStderr.yellow("\u26A0")} Agent skills: ${skillsList} \u2014 out of date, run ${import_chalk.chalkStderr.bold("npx convex ai-files update")}`
      );
    } else {
      (0, import_log.logMessage)(
        `  ${import_chalk.chalkStderr.green("\u2714")} Agent skills: ${skillsList}${networkAvailable ? " (up to date)" : ""}`
      );
    }
  }
}
async function maybeSetupAiFiles(ctx, convexDir, projectDir) {
  if (isAgentMode()) {
    return;
  }
  let wantsAiFiles = true;
  if (process.stdin.isTTY) {
    wantsAiFiles = await (0, import_prompts.promptYesNo)(ctx, {
      message: "Set up Convex AI files? (guidelines, AGENTS.md, agent skills)",
      default: true
    });
  }
  if (wantsAiFiles) {
    await writeAiFiles(convexDir, true, "quiet", projectDir);
  }
}
async function removeLegacyCursorRulesFile(projectDir) {
  const filePath = import_path.default.join(
    projectDir,
    ".cursor",
    "rules",
    "convex_rules.mdc"
  );
  try {
    await import_fs.promises.unlink(filePath);
    return true;
  } catch {
    return false;
  }
}
async function removeSkillsLockIfEmpty(projectDir, removedSkillNames) {
  const lockPath = import_path.default.join(projectDir, "skills-lock.json");
  try {
    const content = await import_fs.promises.readFile(lockPath, "utf8");
    const lock = JSON.parse(content);
    if (!lock || typeof lock !== "object" || !lock.skills || typeof lock.skills !== "object") {
      return false;
    }
    const remainingSkills = Object.keys(lock.skills).filter(
      (name) => !removedSkillNames.includes(name)
    );
    if (remainingSkills.length === 0) {
      await import_fs.promises.unlink(lockPath);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
async function readFileSafe(filePath) {
  try {
    return await import_fs.promises.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}
async function readInstalledSkillNames(projectDir) {
  const skillsDir = import_path.default.join(projectDir, ".agents", "skills");
  let entries;
  try {
    const dirents = await import_fs.promises.readdir(skillsDir, { withFileTypes: true });
    entries = dirents.filter((d) => d.isDirectory() || d.isSymbolicLink()).map((d) => d.name);
  } catch {
    return [];
  }
  const names = [];
  for (const entry of entries) {
    const skillMdPath = import_path.default.join(skillsDir, entry, "SKILL.md");
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
  const versionData = await (0, import_versionApi.getVersion)();
  if (versionData === null || versionData === void 0) {
    (0, import_log.logMessage)(import_chalk.chalkStderr.yellow(`Agent skills are temporarily disabled.`));
    return false;
  }
  if (versionData.disableSkillsCli) {
    (0, import_log.logMessage)(import_chalk.chalkStderr.yellow(`Agent skills are temporarily disabled.`));
    return false;
  }
  return true;
}
function runSkillsCommand(cwd, args, outputMode = "verbose") {
  return new Promise((resolve) => {
    const quiet = outputMode === "quiet";
    const proc = import_child_process.default.spawn("npx", ["skills@latest", ...args], {
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
        (0, import_log.logMessage)(import_chalk.chalkStderr.gray(`skills output (tail):
${tail}`));
      }
      resolve(code === 0);
    });
    proc.on("error", () => resolve(false));
  });
}
//# sourceMappingURL=index.js.map
