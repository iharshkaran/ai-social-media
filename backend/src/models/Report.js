import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true, index: true },
  reason: { type: String, required: true, trim: true, minlength: 5, maxlength: 500 },
  status: { type: String, enum: ["open", "reviewed", "dismissed"], default: "open", index: true },
}, { timestamps: true });

reportSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Report || mongoose.model("Report", reportSchema);
