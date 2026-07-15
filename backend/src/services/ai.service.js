import dotenv from "dotenv";
dotenv.config();
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

async function generateCaption(base64ImageFile) {

    const response = await ai.interactions.create({
        model: "gemini-3.1-flash-lite",
        input: [
            { type: "text", text: "Caption this image." },
            {
                type: "image",
                data: base64ImageFile,
                mime_type: "image/jpeg"
            }
        ],
        system_instruction: `
        You are an AI Instagram caption writer.

Analyze the uploaded image carefully and generate a short, catchy Instagram caption in a modern Gen-Z style.

Rules:
- Keep the caption under 12 words.
- Make it feel natural and trendy.
- Add 1-3 relevant emojis only.
- Generate only ONE best caption.
- Add 2-6 relevant hashtags.
- Hashtags should be lowercase.
- Don't overuse slang.
- Don't explain the image.
- Don't mention things you're not sure about.
- Avoid cringe or repetitive captions.

Output Format:
<caption> #tag1 #tag2 #tag3
        `
    });
    return response.output_text;

};


export default generateCaption;