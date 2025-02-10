import mongoose, { Schema, Types, model } from "mongoose";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      minlength: 2,
      maxlength: 50000,
      trim: true,
      required: function () {
        return this.attachments?.length ? false : true;
      },
    },
    postId: { type: Types.ObjectId, ref: "Post", required: true },
    commentId: { type: Types.ObjectId, ref: "Comment" },
    attachments: [{ secure_url: String, public_id: String }],
    likes: [{ type: Types.ObjectId, ref: "User" }],
    tags: [{ type: Types.ObjectId, ref: "User" }],
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    deletedBy: { type: Types.ObjectId, ref: "User" },
    deletedAt: Date,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

commentSchema.virtual("replies", {
  localField: "_id",
  foreignField: "commentId",
  ref: "Comment",
});

export const commentModel =
  mongoose.models.Comment || model("Comment", commentSchema);
