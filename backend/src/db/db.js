import mongoose  from "mongoose";

function connectDB() {
    mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB: ", err);
    });
}

export default connectDB;