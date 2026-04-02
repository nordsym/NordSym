import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Schema with schemaValidation: false to allow flexible documents
// while keeping indexes intact for queries
export default defineSchema(
  {
    // ─── Deal Room ───
    mous: defineTable(v.any())
      .index("by_customer", ["customerId"])
      .index("by_status", ["status"]),

    mouComments: defineTable(v.any())
      .index("by_mou", ["mouId"])
      .index("by_section", ["section"])
      .index("by_resolved", ["resolved"]),

    mouReplies: defineTable(v.any())
      .index("by_comment", ["commentId"]),

    dealroomComments: defineTable(v.any())
      .index("by_dealroom_document", ["dealroom", "document"])
      .index("by_dealroom", ["dealroom"]),

    sows: defineTable(v.any())
      .index("by_customerId", ["customerId"])
      .index("by_status", ["status"])
      .index("by_dealOwner", ["dealOwner"])
      .index("by_createdAt", ["createdAt"]),

    // ─── CRM / Deals ───
    deals: defineTable(v.any())
      .index("by_company", ["company"])
      .index("by_stage", ["stage"])
      .index("by_owner", ["owner"])
      .index("by_updatedAt", ["updatedAt"]),

    dealActivities: defineTable(v.any())
      .index("by_dealId", ["dealId"])
      .index("by_type", ["type"])
      .index("by_timestamp", ["timestamp"]),

    leads: defineTable(v.any())
      .index("by_company", ["company"])
      .index("by_status", ["status"])
      .index("by_source", ["source"])
      .index("by_createdAt", ["createdAt"]),

    proposals: defineTable(v.any())
      .index("by_customerId", ["customerId"])
      .index("by_status", ["status"])
      .index("by_createdAt", ["createdAt"]),

    // ─── Activities ───
    activities: defineTable(v.any())
      .index("by_status", ["status"])
      .index("by_agentId", ["agentId"])
      .index("by_source", ["source"])
      .index("by_timestamp", ["timestamp"]),

    activities_archive: defineTable(v.any())
      .index("by_status", ["status"])
      .index("by_type", ["type"])
      .index("by_timestamp", ["timestamp"])
      .index("by_archivedAt", ["archivedAt"]),

    // ─── Agents ───
    agentStats: defineTable(v.any())
      .index("by_agentId", ["agentId"])
      .index("by_lastSeen", ["lastSeen"]),

    agentMemories: defineTable(v.any())
      .index("by_agent", ["agentId"])
      .index("by_agent_type", ["agentId", "memoryType"])
      .index("by_created", ["agentId", "createdAt"])
      .index("by_importance", ["agentId", "importance"]),

    // ─── Memory System ───
    memoryNodes: defineTable(v.any())
      .index("by_title", ["title"])
      .index("by_type", ["type"])
      .index("by_orbit", ["orbit"])
      .index("by_strength", ["strength"])
      .index("by_lastReferenced", ["lastReferenced"])
      .index("by_createdAt", ["createdAt"]),

    memoryEdges: defineTable(v.any())
      .index("by_fromNode", ["fromNode"])
      .index("by_toNode", ["toNode"])
      .index("by_relation", ["relation"])
      .index("by_strength", ["strength"]),

    memoryOrbits: defineTable(v.any())
      .index("by_name", ["name"])
      .index("by_totalStrength", ["totalStrength"]),

    memoryTimeline: defineTable(v.any())
      .index("by_nodeId", ["nodeId"])
      .index("by_action", ["action"])
      .index("by_timestamp", ["timestamp"]),

    memorySync: defineTable(v.any())
      .index("by_key", ["key"])
      .index("by_category", ["category"])
      .index("by_lastUpdatedBy", ["lastUpdatedBy"])
      .index("by_lastUpdatedAt", ["lastUpdatedAt"]),

    memorySearchCache: defineTable(v.any())
      .index("by_query", ["query"])
      .index("by_hitCount", ["hitCount"]),

    // ─── Backlog ───
    backlog: defineTable(v.any())
      .index("by_category", ["category"])
      .index("by_status", ["status"])
      .index("by_priority", ["priority"])
      .index("by_score", ["score"]),

    // ─── Context / Groups ───
    context: defineTable(v.any())
      .index("by_type", ["type"])
      .index("by_source", ["source"])
      .index("by_sourceGroup", ["sourceGroup"])
      .index("by_timestamp", ["timestamp"]),

    groups: defineTable(v.any())
      .index("by_name", ["name"])
      .index("by_chatId", ["chatId"])
      .index("by_hierarchy", ["hierarchy"])
      .index("by_active", ["active"]),

    visibilityRules: defineTable(v.any())
      .index("by_contextId", ["contextId"])
      .index("by_groupId", ["groupId"])
      .index("by_contextId_groupId", ["contextId", "groupId"]),

    // ─── Trading ───
    tradingAlerts: defineTable(v.any())
      .index("by_symbol", ["symbol"])
      .index("by_alertType", ["alertType"])
      .index("by_active", ["active"]),

    positions: defineTable(v.any())
      .index("by_symbol", ["symbol"])
      .index("by_broker", ["broker"])
      .index("by_updatedAt", ["updatedAt"]),

    watchlists: defineTable(v.any())
      .index("by_name", ["name"])
      .index("by_updatedAt", ["updatedAt"]),

    marketSnapshots: defineTable(v.any())
      .index("by_type", ["type"])
      .index("by_timestamp", ["timestamp"]),

    // ─── Growth ───
    growthMetrics: defineTable(v.any())
      .index("by_platform", ["platform"])
      .index("by_account", ["account"])
      .index("by_date", ["date"])
      .index("by_platform_date", ["platform", "date"]),

    // ─── Documents / Reports ───
    documents: defineTable(v.any())
      .index("by_type", ["type"])
      .index("by_createdAt", ["createdAt"]),

    reports: defineTable(v.any())
      .index("by_agentId", ["agentId"])
      .index("by_type", ["type"])
      .index("by_createdAt", ["createdAt"]),

    dailySummaries: defineTable(v.any())
      .index("by_date", ["date"])
      .index("by_compressedAt", ["compressedAt"]),

    // ─── Traces / Audit ───
    traces: defineTable(v.any())
      .index("by_agentId", ["agentId"])
      .index("by_sessionKey", ["sessionKey"])
      .index("by_agentId_sessionKey", ["agentId", "sessionKey"])
      .index("by_action", ["action"])
      .index("by_timestamp", ["timestamp"]),

    auditLog: defineTable(v.any())
      .index("by_action", ["action"])
      .index("by_contextId", ["contextId"])
      .index("by_groupId", ["groupId"])
      .index("by_timestamp", ["timestamp"]),

    // ─── System ───
    commands: defineTable(v.any())
      .index("by_timestamp", ["timestamp"]),

    settings: defineTable(v.any())
      .index("by_key", ["key"]),

    workspaceFiles: defineTable(v.any())
      .index("by_path", ["path"])
      .index("by_folder", ["folder"])
      .index("by_modifiedAt", ["modifiedAt"])
      .index("by_syncedAt", ["syncedAt"]),
  },
  { schemaValidation: false },
);
