# Deploying to Vercel

This guide will help you deploy your Movie Streaming Platform to [Vercel](https://vercel.com), the creators of Next.js and the best platform for hosting it.

## Prerequisites

- A GitHub account (where your code is hosted)
- A Vercel account (sign up at vercel.com using GitHub)

## Deployment Steps

1. **Push to GitHub**
   Ensure your latest code is pushed to your GitHub repository.
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import Project to Vercel**
   - Go to your [Vercel Dashboard](https://vercel.com/dashboard).
   - Click **"Add New..."** -> **"Project"**.
   - Find your `movie-app` repository in the list and click **"Import"**.

3. **Configure Project**
   - **Framework Preset**: Should automatically detect `Next.js`.
   - **Root Directory**: Ensure this is set to `./` (or `movie-app` if it's in a subdirectory of your repo, but based on your structure, it seems to be the root).
     - *Note*: If your repo root *is* the folder containing `package.json`, leave it as root. If `movie-app` is a folder *inside* your git repo, click "Edit" and select the `movie-app` folder.

4. **Environment Variables (Crucial)**
   Expand the **"Environment Variables"** section. You need to copy the values from your local `.env.local` file. Add the following pairs:

   | Key | Value (Example/Description) |
   |-----|-----------------------------|
   | `NEXT_PUBLIC_TMDB_API_KEY` | `eda3f911cf7b26e9d911b7609d276198` |
   | `NEXT_PUBLIC_TMDB_BASE_URL` | `https://api.themoviedb.org/3` |
   | `NEXT_PUBLIC_TMDB_IMAGE_BASE_URL` | `https://image.tmdb.org/t/p` |
   | `NEXT_PUBLIC_SITE_NAME` | `Pulse` |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-project-name.vercel.app` (You can update this after deploy if needed) |

5. **Deploy**
   - Click **"Deploy"**.
   - Vercel will build your project. Wait for a minute or two.
   - Once finished, you will see a success screen with a screenshot of your app!

## Post-Deployment

- **Custom Domain**: Go to **Settings** -> **Domains** to add your own domain (e.g., `pulsemovies.com`) if you have one.
- **Redeployment**: Every time you push to your GitHub `main` branch, Vercel will automatically redeploy your site.
