# Deploying Pulse Movies to Cloudflare

Pulse Movies is built with Next.js App Router and optimized for Cloudflare using **[@opennextjs/cloudflare](https://opennext.js.org/cloudflare)** and **Cloudflare Workers (with Assets)**.

---

## 📋 Prerequisites

1. **Cloudflare Account**: [dash.cloudflare.com](https://dash.cloudflare.com) (Free plan works great)
2. **Node.js**: v18 or v20+
3. **TMDB API Key**: Free at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
4. **PostgreSQL Database** *(Optional for basic browsing, required for user accounts/watchlist)*: A free serverless PostgreSQL database such as [Neon](https://neon.tech) or [Supabase](https://supabase.com).

---

## 🔑 Required Environment Variables

When deploying, set these environment variables in your Cloudflare dashboard or Wrangler secret settings:

| Variable | Example Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_TMDB_API_KEY` | `eda3f911cf7b26e9d911b7609d276198` | Your TMDB API v3 Key |
| `NEXT_PUBLIC_TMDB_BASE_URL` | `https://api.themoviedb.org/3` | TMDB API URL |
| `NEXT_PUBLIC_TMDB_IMAGE_BASE_URL` | `https://image.tmdb.org/t/p` | TMDB CDN Image URL |
| `NEXT_PUBLIC_SITE_NAME` | `Pulse` | Site Branding Name |
| `NEXT_PUBLIC_SITE_URL` | `https://pulsemovies.<your-subdomain>.workers.dev` | Production site URL |
| `NEXTAUTH_URL` | `https://pulsemovies.<your-subdomain>.workers.dev` | Base URL for auth callbacks |
| `NEXTAUTH_SECRET` | *(Random 32+ char string)* | Encryption secret for NextAuth |
| `AUTH_SECRET` | *(Same as NEXTAUTH_SECRET)* | Fallback auth secret |
| `DATABASE_URL` | `postgresql://...` | Connection string to your Postgres DB |

---

## 🚀 Option 1: Direct Terminal Deployment (Recommended & Fastest)

You can build and deploy directly to Cloudflare in 2 commands:

### 1. Authenticate with Cloudflare
```bash
cd movie-app
npx wrangler login
```
*A browser window will open asking you to authorize Wrangler.*

### 2. Build and Deploy
```bash
npm run deploy:cf
```
*(Or manually: `npx @opennextjs/cloudflare build && npx wrangler deploy`)*

### 3. Add Environment Secrets
You can set secrets directly from the terminal:
```bash
npx wrangler secret put NEXTAUTH_SECRET
npx wrangler secret put DATABASE_URL
```

Wrangler will output your live URL:
`https://pulsemovies.<your-subdomain>.workers.dev`

---

## 🌐 Option 2: Cloudflare Dashboard Git Integration

If you prefer continuous deployment every time you push to GitHub:

1. Go to **[Cloudflare Dashboard](https://dash.cloudflare.com/)**
2. In the left sidebar, navigate to **Compute (Workers) > Workers & Pages**
3. Click **Create Application** > Select **Workers** (or **Pages**) > **Connect to Git**
4. Choose repository: `Pulsemovies-`
5. Configure the build settings:
   - **Framework preset**: `None` / `Custom`
   - **Root directory**: `movie-app`
   - **Build command**: `npx @opennextjs/cloudflare build`
   - **Build output directory**: `.open-next/assets`
6. Under **Environment variables**, add all the variables from the table above.
7. Click **Save and Deploy**.

---

## ⚡ Option 3: GitHub Actions (Automated CI/CD)

A GitHub Actions workflow is set up in `.github/workflows/deploy.yml` (if added):
1. Go to your GitHub repo **Settings > Secrets and variables > Actions**.
2. Add:
   - `CLOUDFLARE_API_TOKEN` (Create from Cloudflare Profile > API Tokens > "Edit Cloudflare Workers" template)
   - `CLOUDFLARE_ACCOUNT_ID` (Found on your Cloudflare dashboard overview)
3. Every push to `main` will build and publish automatically.

---

## 🛠️ Testing Locally

To preview your Cloudflare worker build locally before pushing:

```bash
cd movie-app
npm run build:cf
npm run preview
```
Visit `http://localhost:8787` to verify the Worker behaves identically to production.
