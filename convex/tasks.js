import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getMIDIID = query({
  args: { file: v.string() },
  handler: async (ctx, args) => {
    const res = await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("name"), args.file))
      .take(1);
    return res[0]._id;
  },
});

export const getMIDI = query({
  args: { id: v.id("files") },
  handler: async (ctx, args) => {
    const res = await ctx.db.get(args.id);
    if (res == undefined) return [];
    if (res.midi == undefined) {
      return [];
    }
    return res.midi;
  },
});

export const setMIDI = mutation({
  args: { id: v.id("files"), midi: v.any() },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      midi: args.midi,
    });
  },
});

export const getCursors = query({
  args: { id: v.id("files") },
  handler: async (ctx, args) => {
    const res = await ctx.db.get(args.id);
    if (res == undefined) return [];
    if (res.cursors == undefined) {
      return [];
    }
    return res.cursors;
  },
});

export const setCursors = mutation({
  args: { id: v.id("files"), cursors: v.any() },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      cursors: args.cursors,
    });
  },
});
