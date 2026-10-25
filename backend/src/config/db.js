import mongoose from "mongoose";

export async function connectDB() {
    const uri = process.env.MONGODB_URI;
    if (!uri || uri === "your_mongodb_connection_string") throw new Error("Configure MONGODB_URI in backend/.env before starting the API.");
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log("MongoDB connected successfully");
}
