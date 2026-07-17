import Post from "../models/post.model.js";
import generateCaption from "../services/ai.service.js";
import uploadImage from "../services/storage.service.js";


async function createPostController(req, res) {
    const file = req.file;

    const uploadResult = await uploadImage(file.buffer);

    const base64Image = Buffer.from(file.buffer).toString("base64");

    const caption = await generateCaption(base64Image);

    const post = await Post.create({
        image: uploadResult.url,
        caption: caption,
        user: req.user._id
    })

    res.status(201).json({
        msg: "Post created successfully",
        post: post
    });
}

export default createPostController;