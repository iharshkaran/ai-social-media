import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  type: { type: String, enum: ["connection", "like", "comment", "system"], default: "system", required: true },
  message: { type: String, required: true, trim: true, maxlength: 300 },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
  connection: { type: mongoose.Schema.Types.ObjectId, ref: "Follow", default: null },
  read: { type: Boolean, default: false, index: true },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
