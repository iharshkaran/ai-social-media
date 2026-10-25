import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  headline: { type: String, default: "Student", trim: true, maxlength: 160 },
  university: { type: String, default: "", trim: true, maxlength: 160 },
  course: { type: String, default: "", trim: true, maxlength: 100 },
  year: { type: String, default: "", trim: true, maxlength: 50 },
  location: { type: String, default: "", trim: true, maxlength: 100 },
  bio: { type: String, default: "", trim: true, maxlength: 1200 },
  skills: { type: [{ type: String, trim: true, maxlength: 40 }], default: [], validate: [(v) => v.length <= 30, "A profile can have at most 30 skills."] },
  photo: { type: String, default: "", maxlength: 2200000 },
  portfolioUrl: { type: String, default: "", trim: true, maxlength: 500 },
}, { timestamps: true, toJSON: { transform: (_doc, ret) => { delete ret.passwordHash; delete ret.__v; return ret; } } });

userSchema.index({ name: "text", university: "text", course: "text", skills: "text" });

export default mongoose.models.User || mongoose.model("User", userSchema);

