export type VersionResult = {
    message: string | null;
    guidelinesHash: string | null;
    agentSkillsSha: string | null;
    disableSkillsCli: boolean;
};
export declare function getVersion(): Promise<VersionResult | null>;
export declare function validateVersionResult(json: any): VersionResult | null;
/** Fetch the latest agent skills SHA from version.convex.dev. */
export declare function fetchAgentSkillsSha(): Promise<string | null>;
export declare function downloadGuidelines(): Promise<string | null>;
//# sourceMappingURL=versionApi.d.ts.map