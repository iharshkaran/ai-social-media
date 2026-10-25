import mongoose from "mongoose";

const followSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "accepted"], default: "pending", index: true },
}, { timestamps: true });

followSchema.pre("validate", function preventSelfConnection() {
  if (this.from && this.to && this.from.equals(this.to)) this.invalidate("to", "A user cannot connect with themselves.");
});
followSchema.index({ from: 1, to: 1 }, { unique: true });
followSchema.index({ to: 1, status: 1, createdAt: -1 });
followSchema.index({ from: 1, status: 1, createdAt: -1 });

export default mongoose.models.Follow || mongoose.model("Follow", followSchema);
