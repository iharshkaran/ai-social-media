# AI Social Media

An AI-powered social media backend built with Node.js, Express, MongoDB, and Gemini AI. Users can securely authenticate, upload images, and generate AI-powered captions for their posts.

## ✨ Features

- 🔐 JWT Authentication
- 🍪 Cookie-based Authentication
- 📸 Image Upload with ImageKit
- 🤖 AI Caption Generation using Google Gemini
- 📝 Create Posts
- 🛡️ Protected Routes
- ☁️ MongoDB Database

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Cookie Parser
- Multer
- ImageKit
- Google Gemini API

## 📁 Project Structure

```
backend/
│
├── src/
│   ├── controllers/
│   ├── db/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── app.js
│
├── server.js
├── package.json
└── .env
```

## 🚀 Getting Started

### Clone Repository

```bash
git clone https://github.com/iharshkaran/ai-social-media.git
```

### Install Dependencies

```bash
npm install
```

### Run Server

```bash
npm run dev
```

## 🔑 Environment Variables

Create a `.env` file.

```env
PORT=3000

MONGO_URI=your_mongodb_uri

JWT_SECRET=your_jwt_secret

IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=your_url_endpoint

GEMINI_API_KEY=your_gemini_api_key
```

## 📌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login user |
| POST | `/posts` | Upload image and create a post (Protected) |

## 🔮 Future Improvements

- ❤️ Like Posts
- 💬 Comments
- 👤 User Profiles
- 🌐 Frontend (React)
- 📱 Responsive UI

## 👨‍💻 Author

**Harsh**