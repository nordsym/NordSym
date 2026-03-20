import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  mous: defineTable({
    customerId: v.string(),
    customerName: v.string(),
    customerRep: v.string(),
    status: v.union(v.literal("pending"), v.literal("signed")),
    signature: v.optional(v.string()),
    signerName: v.optional(v.string()),
    signerTitle: v.optional(v.string()),
    signedAt: v.optional(v.number()),
    validUntil: v.number(),
    createdAt: v.number(),
  })
    .index("by_customer", ["customerId"])
    .index("by_status", ["status"]),
});
