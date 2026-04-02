import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    dealroom: v.string(),
    document: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dealroomComments")
      .withIndex("by_dealroom_document", (q) =>
        q.eq("dealroom", args.dealroom).eq("document", args.document)
      )
      .order("asc")
      .collect();
  },
});

export const listAll = query({
  args: {
    dealroom: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dealroomComments")
      .withIndex("by_dealroom", (q) => q.eq("dealroom", args.dealroom))
      .order("asc")
      .collect();
  },
});

export const add = mutation({
  args: {
    dealroom: v.string(),
    document: v.string(),
    section: v.string(),
    author: v.string(),
    authorRole: v.optional(v.union(v.literal("client"), v.literal("nordsym"))),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("dealroomComments", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("dealroomComments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
