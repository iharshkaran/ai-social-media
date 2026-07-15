import Post from "../models/post.model.js";
import generateCaption from "../services/ai.service.js";


async function createPostController(req, res) {
    const file = req.file;

    const base64Image = Buffer.from(file.buffer).toString("base64");

    const caption = await generateCaption(base64Image);

    res.status(201).json({
        msg: "Post created successfully",
        post: {
            caption: caption
        }
    });
}

export default createPostController;