import mongoose from "mongoose";

const { Schema } = mongoose;

const tokenSchema = new Schema(
  {
    token: { type: String, required: true },
    userId: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("token", tokenSchema, "RefreshToken");
