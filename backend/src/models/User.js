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
  banner: { type: String, default: "", maxlength: 2200000 },
  projects: { type: [{ key: { type: String, trim: true, maxlength: 80 }, title: { type: String, trim: true, maxlength: 100 }, description: { type: String, trim: true, maxlength: 600 }, url: { type: String, trim: true, maxlength: 500 }, mediaUrl: { type: String, trim: true, maxlength: 2200000 }, mediaType: { type: String, enum: ["", "image", "video"], default: "" }, relatedPostIds: { type: [String], default: [] } }], default: [], validate: [(v) => v.length <= 20, "A profile can have at most 20 projects."] },
  education: { type: [{ school: { type: String, trim: true, maxlength: 160 }, degree: { type: String, trim: true, maxlength: 100 }, field: { type: String, trim: true, maxlength: 100 }, startYear: { type: String, trim: true, maxlength: 20 }, endYear: { type: String, trim: true, maxlength: 20 }, description: { type: String, trim: true, maxlength: 500 } }], default: [], validate: [(v) => v.length <= 12, "A profile can have at most 12 education entries."] },
  featured: { type: [{ type: { type: String, enum: ["project", "post", "link"], default: "project" }, projectKey: { type: String, trim: true, maxlength: 80 }, postId: { type: String, trim: true, maxlength: 80 }, title: { type: String, trim: true, maxlength: 100 }, description: { type: String, trim: true, maxlength: 500 }, url: { type: String, trim: true, maxlength: 500 } }], default: [], validate: [(v) => v.length <= 12, "A profile can have at most 12 featured items."] },
  portfolioUrl: { type: String, default: "", trim: true, maxlength: 500 },
}, { timestamps: true, toJSON: { transform: (_doc, ret) => { delete ret.passwordHash; delete ret.__v; return ret; } } });

userSchema.index({ name: "text", university: "text", course: "text", skills: "text" });

export default mongoose.models.User || mongoose.model("User", userSchema);

