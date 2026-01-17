# Deploying to Cloudflare Pages

This guide covers deploying your Next.js Movie Streaming Platform to **Cloudflare Pages** - a free hosting service with **unlimited bandwidth** and global CDN.

## Prerequisites

- A GitHub account (with your code pushed)
- A Cloudflare account (free at [cloudflare.com](https://cloudflare.com))

## Step 1: Navigate to Cloudflare Pages

1. **Sign in** to your Cloudflare account at [dash.cloudflare.com](https://dash.cloudflare.com)
2. In the left sidebar, look for **"Workers & Pages"** (under the Build section)
   - OR click on **"Developer Platform"** tab at the top
3. Click **"Pages"** or **"Create application"** → **"Pages"**

## Step 2: Connect to Git

1. Click **"Connect to Git"**
2. Select **GitHub** and authorize Cloudflare
3. Find and select your repository: **`Pulsemovies-`**
4. Click **"Begin setup"**

## Step 3: Configure Build Settings

| Setting | Value |
|---------|-------|
| **Project name** | `pulsemovies` (or your choice) |
| **Production branch** | `main` |
| **Framework preset** | `Next.js` |
| **Root directory (path)** | `movie-app` |
| **Build command** | `npm run build` |
| **Build output directory** | `.next` |

## Step 4: Add Environment Variables

Scroll down to **"Environment variables"** section. Click **"Add variable"** for each:

| Variable name | Value |
|---------------|-------|
| `NEXT_PUBLIC_TMDB_API_KEY` | `eda3f911cf7b26e9d911b7609d276198` |
| `NEXT_PUBLIC_TMDB_BASE_URL` | `https://api.themoviedb.org/3` |
| `NEXT_PUBLIC_TMDB_IMAGE_BASE_URL` | `https://image.tmdb.org/t/p` |
| `NEXT_PUBLIC_SITE_NAME` | `Pulse` |
| `NEXT_PUBLIC_SITE_URL` | `https://pulsemovies.pages.dev` |
| `NODE_VERSION` | `18` |

## Step 5: Deploy

1. Click **"Save and Deploy"**
2. Wait for the build (2-5 minutes)
3. Once complete, you'll get a URL like: `https://pulsemovies.pages.dev`

## Step 6: Access Your App

Your app is now live at:
- **Production URL**: `https://pulsemovies.pages.dev`
- **Preview URLs**: Created for each branch/PR

## Adding a Custom Domain (Optional)

1. Go to your Pages project → **"Custom domains"** tab
2. Click **"Set up a custom domain"**
3. Enter your domain (e.g., `pulsemovies.com`)
4. Follow the DNS instructions provided

## Automatic Deployments

Cloudflare Pages automatically deploys:
- Every push to `main` → Production
- Every push to other branches → Preview URL

## Troubleshooting

### Build Fails?
1. Click on the failed deployment to see logs
2. Common fixes:
   - Ensure `Root directory (path)` is set to `movie-app`
   - Add `NODE_VERSION=18` to environment variables
   - Check for TypeScript/build errors

### Images Not Loading?
Add this to your `next.config.ts`:
```ts
const nextConfig = {
  images: {
    unoptimized: true,
  },
};
```

### 404 on Routes?
Cloudflare Pages handles Next.js routing automatically. If issues persist, ensure you're using the Next.js framework preset.

## Why Cloudflare Pages?

| Feature | Cloudflare Pages |
|---------|------------------|
| **Bandwidth** | ✅ Unlimited (free!) |
| **Builds** | 500/month |
| **Custom domains** | Unlimited |
| **SSL** | ✅ Free |
| **Global CDN** | ✅ 300+ locations |

Perfect for your movie streaming platform!
