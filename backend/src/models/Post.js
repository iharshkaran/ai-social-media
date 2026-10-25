import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  text: { type: String, default: "", trim: true, maxlength: 3000 },
  image: { type: String, default: "", maxlength: 2200000 },
  category: { type: String, enum: ["General", "Project", "Hackathon", "Learning", "Achievement"], default: "General", index: true },
}, { timestamps: true });

postSchema.index({ createdAt: -1 });

export default mongoose.models.Post || mongoose.model("Post", postSchema);
