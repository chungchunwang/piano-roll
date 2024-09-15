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
    console.log(res);
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
    console.log(args.midi);
    return await ctx.db.patch(args.id, {
      midi: args.midi,
    });
  },
});

// export const getCursors = query({
//   args: { file: v.string },
//   handler: async (ctx, args) => {
//     return await ctx.db.query(`${args.file}_cursors`).collect();
//   },
// });

// export const setCursor = mutation({
//   args: { file: v.string, x: v.number, y: v.number },
//   handler: async (ctx, args) => {
//     return await ctx.db.insert(`${args.file}_cursors`, {
//       x: args.x,
//       y: args.y,
//     });
//   },
// });
