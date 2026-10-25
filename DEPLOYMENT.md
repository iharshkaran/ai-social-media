# OrbitU deployment

The app is prepared for a Vercel frontend and a Render API. The Vercel rewrite sends `/api/*` through the frontend domain so the HttpOnly session cookie remains first-party in the browser.

## 1. Deploy the API on Render

Create a Blueprint from this repository using `render.yaml`, or create a Web Service manually with:

- Root directory: `backend`
- Build command: `npm ci`
- Start command: `npm start`
- Health check path: `/api/health`

Set these environment values in Render:

- `MONGODB_URI`: your MongoDB Atlas connection string. Configure Atlas Network Access so the Render service can reach the cluster, and use a strong database user password.
- `JWT_SECRET`: a private random value of at least 24 characters. Render generates one in the Blueprint.
- `IMAGEKIT_PUBLIC_KEY` and `IMAGEKIT_PRIVATE_KEY`: your ImageKit keys.
- `CLIENT_URL`: the exact Vercel production origin, for example `https://orbitu.vercel.app` (no trailing slash). Multiple allowed origins can be comma-separated.
- `COOKIE_SAME_SITE`: keep `lax` when using the Vercel same-origin API rewrite.

Copy the deployed API service URL, such as `https://orbitu-api.onrender.com`.

## 2. Point Vercel at the Render API

Create a Vercel project from the same repository and set its Root Directory to `frontend`. The build command is `npm run build`; the output directory is `dist`.

In `frontend/vercel.json`, replace `https://orbitu-api.onrender.com` with the exact Render service URL if Render assigned a different URL. The rewrite keeps API calls and the session cookie on the Vercel site origin. Keep `VITE_API_URL` unset or set it to `/api`; do not set it to the Render URL when using this rewrite.

After Vercel assigns the final production domain, update Render's `CLIENT_URL` to that exact origin and redeploy the API. Add any additional Vercel preview origins only if you intend to use them.

## Local development

Run `npm run dev` in `backend` and `npm run dev` in `frontend`. Vite proxies `/api` requests to `http://localhost:8000`, so the frontend uses the same API path locally and in production.

## Before sharing the public app

- Check `/api/health` on the Render service and confirm the database reports `connected`.
- Verify signup, login, logout, post creation, media upload, connection requests, and messaging on the deployed Vercel URL.
- Keep `.env` files and private ImageKit/MongoDB credentials out of Git. The `.env.example` files contain placeholders only.
