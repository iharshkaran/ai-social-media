# Connectly backend

## Setup
1. Install dependencies with `npm install` inside this folder.
2. Copy `.env.example` to `.env` and set `MONGODB_URI`, a random `JWT_SECRET` of at least 24 characters, and your ImageKit public/private keys. The backend loads this `.env` from its own folder, regardless of the terminal's current directory.
3. Start the API with `npm run dev` (port 8000 by default).

## Structure
- `src/app.js` configures middleware and mounts route modules only.
- `src/routes/` maps HTTP endpoints to middleware and controllers.
- `src/controllers/` handles request and response formatting.
- `src/services/` owns database queries and application rules.
- `src/models/` defines Mongoose schemas and indexes.
- `src/validators/` contains request schemas; `src/middleware/` contains auth, validation, error and async handling.

## API
The API exposes `/api/health`, `/api/auth`, `/api/users`, `/api/connections`, `/api/posts`, `/api/notifications`, `/api/messages`, `/api/uploads/imagekit/auth`, `/api/bookmarks`, and `/api/reports`. JSON responses use `{ success, data?, message? }`. Auth uses an HttpOnly session cookie and also accepts bearer tokens. Messaging is available to accepted connections; inbox and thread history are stored in MongoDB. ImageKit upload signatures are issued to authenticated users; the private key stays on the backend.
