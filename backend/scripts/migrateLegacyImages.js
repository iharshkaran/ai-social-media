import "../src/config/loadEnv.js";
import { createHash } from "node:crypto";
import mongoose from "mongoose";
import Post from "../src/models/Post.js";
import User from "../src/models/User.js";

const APPLY = process.argv.includes("--apply");
const LEGACY_IMAGE = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/;
const UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

function parseDataImage(value) {
  const match = LEGACY_IMAGE.exec(value || "");
  if (!match) return null;
  const [, mimeType, base64] = match;
  const extension = mimeType.split("/")[1].replace("svg+xml", "svg");
  return { mimeType, buffer: Buffer.from(base64, "base64"), extension };
}

async function uploadLegacyImage(value, folder, label, privateKey) {
  const parsed = parseDataImage(value);
  if (!parsed || parsed.buffer.length === 0) throw new Error(`Unsupported or empty legacy image for ${label}.`);

  const digest = createHash("sha256").update(value).digest("hex").slice(0, 12);
  const fileName = `legacy-${label}-${digest}.${parsed.extension}`;
  const form = new FormData();
  form.append("file", new Blob([parsed.buffer], { type: parsed.mimeType }), fileName);
  form.append("fileName", fileName);
  form.append("folder", folder);
  form.append("useUniqueFileName", "false");
  form.append("overwriteFile", "true");

  const response = await fetch(UPLOAD_URL, {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}` },
    body: form,
    signal: AbortSignal.timeout(60_000),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.url) {
    throw new Error(`ImageKit upload failed for ${label}: ${result.message || `HTTP ${response.status}`}`);
  }
  return result.url;
}

async function migrateField({ Model, field, folder, label, privateKey }) {
  const filter = { [field]: { $regex: /^data:image\// } };
  const found = await Model.countDocuments(filter);
  if (!APPLY) return { found, migrated: 0, changedDuringMigration: 0 };

  let migrated = 0;
  let changedDuringMigration = 0;
  const cursor = Model.find(filter).select(`_id ${field}`).lean().cursor();
  for await (const record of cursor) {
    const oldValue = record[field];
    const imageLabel = `${label}-${record._id}`;
    const url = await uploadLegacyImage(oldValue, folder, imageLabel, privateKey);
    const result = await Model.updateOne(
      { _id: record._id, [field]: oldValue },
      { $set: { [field]: url } }
    );
    if (result.matchedCount === 1) migrated += 1;
    else changedDuringMigration += 1;
  }
  return { found, migrated, changedDuringMigration };
}

if (process.env.NODE_ENV === "production" && !process.argv.includes("--allow-production")) {
  throw new Error("Production migration requires the explicit --allow-production flag.");
}

try {
  if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI in backend/.env first.");
  if (APPLY && !process.env.IMAGEKIT_PRIVATE_KEY) {
    throw new Error("Set IMAGEKIT_PRIVATE_KEY in backend/.env before applying the migration.");
  }

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const [profiles, posts] = await Promise.all([
    migrateField({ Model: User, field: "photo", folder: "/connectly/profiles/legacy", label: "profile", privateKey: process.env.IMAGEKIT_PRIVATE_KEY }),
    migrateField({ Model: Post, field: "image", folder: "/connectly/posts/legacy", label: "post", privateKey: process.env.IMAGEKIT_PRIVATE_KEY }),
  ]);

  const totalFound = profiles.found + posts.found;
  if (!APPLY) {
    console.log(`Dry run only. Found ${profiles.found} profile photos and ${posts.found} post images stored as base64. No records or ImageKit files were changed.`);
  } else {
    console.log(`Migration complete. Profiles: ${profiles.migrated}/${profiles.found}; posts: ${posts.migrated}/${posts.found}.`);
    if (profiles.changedDuringMigration + posts.changedDuringMigration > 0) {
      console.log(`${profiles.changedDuringMigration + posts.changedDuringMigration} records changed while migrating and were left untouched. Re-run to check again.`);
    }
    if (totalFound === 0) console.log("No legacy base64 images were found.");
  }
} catch (error) {
  if (error.name === "MongooseServerSelectionError") {
    console.error("Could not reach MongoDB from this environment. Run the migration on the computer where your backend connects to the database.");
    process.exitCode = 1;
  } else {
    console.error(error.message);
    process.exitCode = 1;
  }
} finally {
  await mongoose.disconnect();
}
