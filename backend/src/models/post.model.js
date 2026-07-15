import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    image : String,
    caption : String,
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
})

const Post = mongoose.model("Post", postSchema);

export default Post;