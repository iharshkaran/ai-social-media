# OrbitU — Student Community

OrbitU is a student-focused professional community for sharing work, building a portfolio, and connecting with peers. Students can publish updates with images, videos, or PDFs; discover other students; manage connection requests; message accepted connections; and showcase projects, education, skills, and featured work on a profile.

**Live app:** [orbitu.vercel.app](https://orbitu.vercel.app)<br>
**API health:** [orbitu.onrender.com/api/health](https://orbitu.onrender.com/api/health)

> This is an MVP project. The live app needs a reachable MongoDB database and valid ImageKit credentials for database-backed features and media uploads.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Repository layout](#repository-layout)
- [Run locally](#run-locally)
- [Environment variables](#environment-variables)
- [Demo students](#demo-students)
- [API overview](#api-overview)
- [Data and authentication](#data-and-authentication)
- [Deployment](#deployment)
- [Useful commands](#useful-commands)
- [Troubleshooting](#troubleshooting)

## Features

- **Accounts:** register, log in, keep a session, and log out.
- **Student profiles:** headline, course, year, university, location, bio, skills, profile photo, banner, portfolio link, education, projects, and featured items.
- **Feed:** publish text updates, categorized posts, images, videos, and PDF documents; like and comment on posts; open an individual post; and delete your own posts.
- **Explore:** search student profiles and browse paginated results by course and skills.
- **Connections:** send, accept, or decline requests; see pending and accepted connections; and remove a connection.
- **Messages:** inbox and conversation history for accepted connections.
- **Notifications:** view, mark as read, dismiss, or clear notifications.
- **Bookmarks and reports:** save posts and report content.
- **Media:** authenticated ImageKit upload authorization; media files are uploaded directly from the browser so large files do not pass through the API server.
- **Responsive interface:** desktop navigation and a mobile bottom navigation layout.

## Technology

| Area | Stack |
| --- | --- |
| Frontend | React 19, Vite 8, React Router, Zustand, Tailwind CSS 4, Lucide |
| Backend | Node.js, Express 5, Mongoose, Zod |
| Database | MongoDB / MongoDB Atlas |
| Authentication | JWT in an HttpOnly cookie; bearer tokens are also accepted by the API |
| Media | ImageKit |
| Hosting | Vercel (frontend) and Render (API) |

Use Node.js `20.19+` or `22.12+` for the current Vite version.

## Repository layout

```text
connectly/
├── backend/
│   ├── scripts/                 # Demo student seed and legacy image migration
│   ├── src/
│   │   ├── config/              # Environment and MongoDB setup
│   │   ├── constants/           # Shared backend constants
│   │   ├── controllers/         # HTTP request/response handlers
│   │   ├── middleware/          # Authentication, validation, errors
│   │   ├── models/              # Mongoose schemas and indexes
│   │   ├── routes/              # Express route definitions
│   │   ├── services/            # Business rules and database operations
│   │   ├── utils/               # Shared helpers
│   │   └── validators/          # Zod request schemas
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/          # Shared UI, feed, profile sections
│   │   ├── context/             # Authentication context
│   │   ├── pages/               # App routes/screens
│   │   ├── store/               # Zustand client-side cache
│   │   └── utils/               # API client and upload helpers
│   ├── .env.example
│   ├── vercel.json              # SPA fallback and /api proxy rewrite
│   └── package.json
├── render.yaml                  # Render Blueprint configuration
└── DEPLOYMENT.md                # Step-by-step hosting notes
```

## Run locally

### Requirements

- Node.js `20.19+` or `22.12+`
- npm
- A MongoDB database (local MongoDB or MongoDB Atlas)
- ImageKit public/private keys for media uploads

### 1. Configure the backend

Create `backend/.env` by copying `backend/.env.example`, then set the values described in [Environment variables](#environment-variables).

```bash
cd backend
npm install
npm run dev
```

The API listens on `http://localhost:8000` by default. Check `http://localhost:8000/api/health`; the JSON response should report `"database":"connected"`.

### 2. Configure and run the frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal, usually `http://localhost:5173`. Vite forwards local `/api` requests to `http://localhost:8000`.

### 3. Use the app

Create an account from the sign-up screen, or seed demo students for Explore and connection testing. Registration and login create the session cookie automatically.

## Environment variables

### Backend: `backend/.env`

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | API port; defaults to `8000`. Render supplies its own port. |
| `NODE_ENV` | Recommended | Use `development` locally and `production` on Render. |
| `MONGODB_URI` | Yes | MongoDB connection string. |
| `JWT_SECRET` | Yes | Private signing secret, at least 24 characters. Use a long random value. |
| `CLIENT_URL` | Yes in production | Allowed frontend origin(s) for credentialed CORS. Multiple origins can be comma-separated. |
| `COOKIE_SAME_SITE` | No | Usually `lax` with the Vercel `/api` rewrite. |
| `IMAGEKIT_PUBLIC_KEY` | Required for uploads | ImageKit public key. |
| `IMAGEKIT_PRIVATE_KEY` | Required for uploads | ImageKit private key; keep it only on the server. |

Example local values (replace placeholders and do not commit real secrets):

```dotenv
PORT=8000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
COOKIE_SAME_SITE=lax
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<database>
JWT_SECRET=<random-secret-at-least-24-characters>
IMAGEKIT_PUBLIC_KEY=<imagekit-public-key>
IMAGEKIT_PRIVATE_KEY=<imagekit-private-key>
```

### Frontend: `frontend/.env`

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `/api` | API base path. Keep `/api` for local Vite proxy and the Vercel rewrite. |

Vite only exposes variables prefixed with `VITE_` to browser code. Never put private keys or database credentials in frontend environment variables.

## Demo students

For local development, run this from `backend/` after setting `NODE_ENV=development` and configuring MongoDB:

```bash
npm run seed:students
```

This inserts 24 demo profiles only when their email does not already exist. The seed script prints the shared demo password, `DemoStudent123!`; demo email addresses follow `student01@demo.connectly.test` through `student24@demo.connectly.test`. **Do not seed demo users into production.**

## API overview

All routes below use the `/api` prefix unless shown otherwise. Protected routes require a valid session cookie (or an `Authorization: Bearer <token>` header). JSON responses generally use `{ "success": true, "data": ... }`; errors use `{ "success": false, "message": "..." }`. Feed pagination returns `page`, `hasMore`, and `ownPostCount` alongside the post data.

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | No | API and MongoDB connection status |
| `POST` | `/api/auth/register` | No | Create an account and start a session |
| `POST` | `/api/auth/login` | No | Start a session |
| `POST` | `/api/auth/logout` | No | Clear the session cookie |
| `GET` | `/api/auth/me` | Yes | Get the current account |
| `GET` | `/api/users?q=&page=&limit=` | Yes | Search and paginate students |
| `GET` | `/api/users/me` | Yes | Get the current profile |
| `PATCH` | `/api/users/me` | Yes | Update profile and portfolio sections |
| `GET` | `/api/users/:id` | Yes | Get a student profile |
| `GET` | `/api/users/:id/posts?page=&limit=` | Yes | Get a student's posts |
| `POST` | `/api/users/:id/connections` | Yes | Send a connection request |
| `GET` | `/api/connections` | Yes | List incoming, sent, and accepted connections |
| `PATCH` | `/api/connections/:id` | Yes | Accept or decline a request (`{ "action": "accept" }` or `"decline"`) |
| `DELETE` | `/api/connections/:id` | Yes | Remove a connection |
| `GET` | `/api/posts?page=&limit=` | Yes | Paginated feed |
| `POST` | `/api/posts` | Yes | Create a post |
| `GET` | `/api/posts/:id` | Yes | Get one post, its likes, and comments |
| `DELETE` | `/api/posts/:id` | Yes | Delete your own post |
| `POST` | `/api/posts/:id/like` | Yes | Toggle a like |
| `GET` | `/api/posts/:postId/comments` | Yes | List post comments |
| `POST` | `/api/posts/:postId/comments` | Yes | Add a comment (`{ "text": "..." }`) |
| `GET` | `/api/notifications` | Yes | List notifications |
| `PATCH` | `/api/notifications/read` | Yes | Mark one or all notifications read |
| `DELETE` | `/api/notifications/:id` | Yes | Dismiss a notification |
| `DELETE` | `/api/notifications` | Yes | Clear notifications |
| `GET` | `/api/messages` | Yes | Get inbox conversations |
| `GET` | `/api/messages/:userId` | Yes | Get a conversation thread |
| `POST` | `/api/messages/:userId` | Yes | Send a message (`{ "text": "..." }`) |
| `GET` | `/api/uploads/imagekit/auth` | Yes | Get a short-lived ImageKit upload signature |
| `GET` | `/api/bookmarks` | Yes | List saved posts |
| `POST` | `/api/posts/:postId/bookmark` | Yes | Toggle a post bookmark |
| `POST` | `/api/reports` | Yes | Report content |

Request bodies are validated before they reach the service layer. See `backend/src/validators/` for the accepted fields and limits.

## Data and authentication

- MongoDB stores users, posts, comments, likes, connections, messages, notifications, bookmarks, and reports.
- Passwords are stored as bcrypt hashes, never as plain text.
- Successful sign-up/login sets a JWT session in the `connectly_session` HttpOnly cookie. The browser API client sends credentials automatically.
- Production cookies use `Secure`; configure `CLIENT_URL` to the exact Vercel origin.
- For Vercel, `/api/*` is rewritten to the Render API, keeping browser requests on the Vercel origin and the session cookie first-party. Keep `VITE_API_URL=/api` (or unset it).
- The ImageKit private key remains on the backend. The browser receives only time-limited upload authorization.
- Zustand holds short-lived in-memory caches for frequently used lists. A browser refresh clears those client-side caches; MongoDB remains the source of truth.

## Deployment

OrbitU is configured for a Vercel frontend and a Render API. The repository includes `render.yaml` and `frontend/vercel.json`.

### Render API

Create a Render Blueprint from `render.yaml`, or configure a web service with:

- Root directory: `backend`
- Build command: `npm ci`
- Start command: `npm start`
- Health check: `/api/health`

Set `MONGODB_URI`, `JWT_SECRET`, ImageKit keys, and the exact Vercel production origin in `CLIENT_URL`. The current `render.yaml` has a placeholder frontend origin; update the Render environment setting to your deployed domain.

### Vercel frontend

Import this repository into Vercel and set:

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- `VITE_API_URL`: `/api` or unset

`frontend/vercel.json` contains the API rewrite to `https://orbitu.onrender.com`. If your Render service URL changes, update that destination and redeploy. After assigning the final Vercel domain, ensure Render's `CLIENT_URL` matches it exactly.

For full deployment instructions and pre-launch checks, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Useful commands

Run commands from the relevant application folder.

| Folder | Command | Purpose |
| --- | --- | --- |
| `backend` | `npm run dev` | Start the API with Nodemon |
| `backend` | `npm start` | Start the API in production |
| `backend` | `npm run seed:students` | Add development demo profiles |
| `backend` | `npm run migrate:images` | Preview legacy base64 image migration counts |
| `backend` | `npm run migrate:images -- --apply` | Apply the migration after reviewing counts |
| `frontend` | `npm run dev` | Start the Vite development server |
| `frontend` | `npm run build` | Build the frontend for production |
| `frontend` | `npm run preview` | Preview the production build locally |
| `frontend` | `npm run lint` | Run ESLint |

The image migration script refuses production by default. Read `backend/README.md` before using it and only opt into production migration intentionally.

## Troubleshooting

### API health reports `database: "disconnected"`

Check `MONGODB_URI`, the MongoDB username/password, Atlas Network Access rules, and that the service can reach the cluster.

### Browser says the origin is blocked or sign-in does not persist

Set Render's `CLIENT_URL` to the exact frontend origin (scheme and hostname, no path). When using the Vercel rewrite, use `COOKIE_SAME_SITE=lax` and keep frontend API calls on `/api`.

### Upload authorization or media upload fails

Check the ImageKit public/private keys on the backend. Never expose the private key in Vercel or client code. The authenticated upload authorization route is `/api/uploads/imagekit/auth`.

### Frontend shows an old deployment

Confirm the latest commit reached the connected Git branch, then check the Vercel deployment status. API configuration changes also require the Render service to redeploy.

### Local frontend cannot reach the API

Run the backend on port `8000`, the frontend through Vite, and confirm the Vite `/api` proxy is enabled in `frontend/vite.config.js`.

## Contributing

1. Create a focused branch for your change.
2. Keep API logic in services, request handling in controllers, and input rules in validators.
3. Keep credentials out of source control; `.env*` files are ignored except `.env.example`.
4. Run `npm run lint` and `npm run build` in `frontend` before submitting UI changes.

## License

No license has been added yet. Unless a license file is added, the source is not granted an open-source reuse license.
