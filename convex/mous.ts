import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    customerId: v.string(),
    customerName: v.string(),
    customerRep: v.string(),
    validHours: v.number(),
  },
  handler: async (ctx, args) => {
    const validUntil = Date.now() + args.validHours * 60 * 60 * 1000;
    return await ctx.db.insert("mous", {
      customerId: args.customerId,
      customerName: args.customerName,
      customerRep: args.customerRep,
      status: "pending",
      validUntil,
      createdAt: Date.now(),
    });
  },
});

export const sign = mutation({
  args: {
    customerId: v.string(),
    signature: v.string(),
    signerName: v.string(),
    signerTitle: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("mous")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "signed",
        signature: args.signature,
        signerName: args.signerName,
        signerTitle: args.signerTitle,
        signedAt: Date.now(),
      });
    }
  },
});

export const get = query({
  args: { customerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mous")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .first();
  },
});
