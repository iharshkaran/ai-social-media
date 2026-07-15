import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import becrypt from "bcryptjs";

// POST /register
async function registerController(req, res) {
    const { username, password } = req.body;

    const isUserAlreadyExists = await User.findOne({
        username
    });

    if (isUserAlreadyExists) {
        return res.status(409).json({
            msg: "username already exists"
        });
    }

    const user = await User.create({
        username,
        password: await becrypt.hash(password, 10)
        
    });

    const token = jwt.sign({
        id: user._id
    }, process.env.JWT_SECRET);

    res.cookie("token", token);

    res.status(201).json({
        msg: "User Created successfully",
        user
    });
}

// POST /login
async function loginController(req, res) {
    const { username, password } = req.body;

    const user = await User.findOne({
        username
    });

    if (!user) {
        return res.status(404).json({
            msg: "User not found"
        });
    }

    const isPasswordValid = await becrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({
            msg: "Invalid password"
        });
    }

    const token = jwt.sign({
        id: user._id
    }, process.env.JWT_SECRET);

    res.cookie("token", token);

    res.status(200).json({
        msg: "Login successful",
        user
    });
}

export default {
    registerController,
    loginController
}; 