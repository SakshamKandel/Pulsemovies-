# Vercel Deployment Guide (Full Stack)

Your application is now ready for full-stack deployment on Vercel. This includes the Next.js frontend, the API backend, and the PostgreSQL database.

## 1. Prerequisites (Codebase Ready)
I have updated your `package.json` to include `"postinstall": "prisma generate"`. This ensures Vercel automatically sets up your database client during deployment.

## 2. Setting up the Database on Neon (Recommended)
Since you want to use **Neon Database**:

1. Log in to your [Neon Console](https://console.neon.tech).
2. Create a new project (e.g., `pulse-movies`).
3. Once created, go to the **Dashboard**.
4. Look for the **Connection Details** section.
5. Copy the **Connection String** (it starts with `postgresql://...`).
   - Use the "Pooled connection" option if available (usually better for serverless apps like Next.js), but the direct one works too.

## 3. Connecting Neon to Vercel
1. Go to your Vercel Project Settings > **Environment Variables**.
2. Add a new variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Paste the Neon connection string you copied.
3. Save.

**Note:** You do NOT need to create a database inside Vercel's "Storage" tab if you are using Neon. Just setting the environment variable is enough.

## 4. Setting up NextAuth (Authentication)
Your app uses NextAuth for login, so you need to set these variables in Vercel **Settings > Environment Variables**:

| Variable Name | Value |
|---|---|
| `NEXTAUTH_URL` | Your deployment URL (e.g., `https://your-project.vercel.app`) - *Wait until you have the URL or use the generated one* |
| `NEXTAUTH_SECRET` | A long random string. You can generate one by running `openssl rand -base64 32` in terminal or just smashing your keyboard (securely). |

## 5. Deploying
1. Push your latest code to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push
   ```
2. Vercel will automatically detect the commit and start building.
3. Watch the **Deployments** tab.
4. Once "Ready", your app is live!

## 6. Initializing the Database (Schema Push)
After your first deployment, or if you change the schema, you need to apply the database structure to the live database.

You can do this from your local machine if you have the remote connection string, or more easily via the Vercel CLI (if installed), or just by connecting your local development environment to the Vercel DB temporarily.

**Easiest way:**
1. Copy the `POSTGRES_PRISMA_URL` from Vercel.
2. Update your `.env` file locally to use this remote URL temporarily:
   ```env
   DATABASE_URL="postgres://..."
   ```
3. Run:
   ```bash
   npx prisma db push
   ```
   This creates the tables in your production database.

**Verify:**
Your app should now be fully functional with Login, Watchlist, and Profile features working in the cloud!
