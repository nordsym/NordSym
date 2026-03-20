import { Context } from "../../../bundler/context.js";
export declare function injectAgentsMdSection(section: string, projectDir?: string): Promise<string | null>;
type InjectClaudeSectionResult = {
    sectionHash: string;
    didWrite: boolean;
};
export declare function injectClaudeMdSection(section: string, projectDir?: string): Promise<InjectClaudeSectionResult>;
/**
 * Write/update all Convex AI files (guidelines, AGENTS.md, CLAUDE.md, skills).
 *
 * @param convexDir - absolute path to the project's convex functions directory
 *   (e.g. `/home/user/myapp/convex`). Used to build the `_generated/ai/` subdirectory.
 */
export declare function writeAiFiles(convexDir: string, installSkills?: boolean, skillsOutputMode?: "verbose" | "quiet", projectDirOverride?: string): Promise<void>;
/**
 * Check whether the Convex AI files are out of date and log a nag message
 * if so.
 */
export declare function checkAiFilesStaleness(canonicalGuidelinesHash: string | null, canonicalAgentSkillsSha: string | null, projectDir: string, convexDir: string): Promise<void>;
/**
 * Update all Convex AI files to their latest versions.
 *
 * Files the user has modified (detected via hash comparison) are skipped
 * with a warning rather than silently overwritten.
 *
 * @param projectDir - absolute path to the project root directory.
 * @param convexDir - absolute path to the Convex functions directory.
 */
export declare function updateAiFiles(projectDir: string, convexDir: string): Promise<void>;
export declare function enableAiFiles(projectDir: string, convexDir: string): Promise<void>;
/**
 * Remove all Convex AI files from the project.
 * Called by `npx convex ai-files remove`.
 *
 * - Strips the Convex section from AGENTS.md (deletes file if empty)
 * - Strips the Convex section from CLAUDE.md (deletes file if empty)
 * - Runs `npx skills remove <name...> --yes` for each tracked skill
 * - Deletes the `convex/_generated/ai/` directory
 */
export declare function removeAiFiles(projectDir: string, convexDir: string): Promise<void>;
/**
 * Called by `npx convex ai-files disable`.
 *
 * Writes a suppression flag into `convex.json` (`aiFiles.disableStalenessMessage`) so
 * `npx convex dev` stops showing AI files install/staleness messages.
 * Files are left in place - use `remove` to delete them.
 * The user can re-enable at any time with `npx convex ai-files enable`.
 */
export declare function disableAiFiles(projectDir: string): Promise<void>;
/**
 * Print the current status of Convex AI files to the terminal.
 */
export declare function statusAiFiles(projectDir: string, convexDir: string): Promise<void>;
export declare function maybeSetupAiFiles(ctx: Context, convexDir: string, projectDir: string): Promise<void>;
export {};
//# sourceMappingURL=index.d.ts.map