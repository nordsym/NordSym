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
var config_exports = {};
__export(config_exports, {
  aiFilesSchema: () => aiFilesSchema,
  readAiConfig: () => readAiConfig,
  writeAiConfig: () => writeAiConfig,
  writeAiDisabledToProjectConfig: () => writeAiDisabledToProjectConfig
});
module.exports = __toCommonJS(config_exports);
var Sentry = __toESM(require("@sentry/node"), 1);
var import_fs = require("fs");
var import_path = __toESM(require("path"), 1);
var import_zod = require("zod");
var import_paths = require("./paths.js");
const aiFilesStateSchema = import_zod.z.object({
  guidelinesHash: import_zod.z.string().nullable(),
  agentsMdSectionHash: import_zod.z.string().nullable(),
  claudeMdHash: import_zod.z.string().nullable(),
  // Commit SHA from get-convex/agent-skills that was current when skills were
  // last installed. Used to detect when newer skills are available.
  agentSkillsSha: import_zod.z.string().nullable(),
  // Names of skills installed by `npx skills add`, used by `remove` to
  // only remove Convex-managed skills.
  installedSkillNames: import_zod.z.array(import_zod.z.string()).default([])
});
const aiFilesProjectConfigSchema = import_zod.z.object({
  aiFiles: import_zod.z.object({
    disableStalenessMessage: import_zod.z.boolean().default(false)
  }).default({ disableStalenessMessage: false })
}).passthrough();
const aiFilesSchema = aiFilesStateSchema;
const EMPTY_AI_STATE = {
  guidelinesHash: null,
  agentsMdSectionHash: null,
  claudeMdHash: null,
  agentSkillsSha: null,
  installedSkillNames: []
};
async function readAiDisabledFromProjectConfig(projectDir) {
  let raw;
  try {
    raw = await import_fs.promises.readFile(import_path.default.join(projectDir, "convex.json"), "utf8");
  } catch {
    return false;
  }
  try {
    const parsed = aiFilesProjectConfigSchema.parse(JSON.parse(raw));
    return parsed.aiFiles.disableStalenessMessage;
  } catch (err) {
    Sentry.captureException(err);
    return false;
  }
}
async function writeAiDisabledToProjectConfig(disableStalenessMessage, projectDir) {
  const filePath = import_path.default.join(projectDir, "convex.json");
  let existing = {};
  try {
    existing = JSON.parse(await import_fs.promises.readFile(filePath, "utf8"));
  } catch {
  }
  const base = existing !== null && typeof existing === "object" && !Array.isArray(existing) ? existing : {};
  const aiFilesValue = base.aiFiles !== null && typeof base.aiFiles === "object" && !Array.isArray(base.aiFiles) ? base.aiFiles : {};
  const { $schema, ...rest } = base;
  const next = {
    $schema: $schema ?? "node_modules/convex/schemas/convex.schema.json",
    ...rest,
    aiFiles: {
      ...aiFilesValue,
      disableStalenessMessage
    }
  };
  await import_fs.promises.writeFile(filePath, JSON.stringify(next, null, 2) + "\n", "utf8");
}
async function readAiConfig(projectDir, convexDir) {
  const disableStalenessMessage = await readAiDisabledFromProjectConfig(projectDir);
  let rawState;
  try {
    rawState = await import_fs.promises.readFile(
      (0, import_paths.aiFilesStatePathForConvexDir)(convexDir),
      "utf8"
    );
  } catch {
    return disableStalenessMessage ? { ...EMPTY_AI_STATE, disableStalenessMessage } : null;
  }
  try {
    const state = aiFilesStateSchema.parse(JSON.parse(rawState));
    return {
      ...state,
      disableStalenessMessage
    };
  } catch (err) {
    Sentry.captureException(err);
    return null;
  }
}
async function writeAiConfig(config, projectDir, convexDir, options) {
  const state = aiFilesStateSchema.parse({
    guidelinesHash: config.guidelinesHash,
    agentsMdSectionHash: config.agentsMdSectionHash,
    claudeMdHash: config.claudeMdHash,
    agentSkillsSha: config.agentSkillsSha,
    installedSkillNames: config.installedSkillNames
  });
  await import_fs.promises.writeFile(
    (0, import_paths.aiFilesStatePathForConvexDir)(convexDir),
    JSON.stringify(state, null, 2) + "\n",
    "utf8"
  );
  const persistMode = options?.persistDisabledPreference ?? "ifTrue";
  if (persistMode === "always" || persistMode === "ifTrue" && config.disableStalenessMessage) {
    await writeAiDisabledToProjectConfig(
      config.disableStalenessMessage,
      projectDir
    );
  }
}
//# sourceMappingURL=config.js.map
