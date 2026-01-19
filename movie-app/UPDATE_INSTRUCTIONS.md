# How to Update Your Vercel Deployment (Frontend + Backend)

Since you already have the frontend deployed, updating to include the backend is simple because **Next.js bundles both Frontend and Backend together**.

By pushing the latest code (which we just did), Vercel has likely already tried to build the backend. However, it will fail or not work until you complete these steps:

## Step 1: Verify the Code is on Vercel
1.  Go to your **Vercel Dashboard**.
2.  Click on your project (`movie-app`).
3.  Go to the **Deployments** tab.
4.  You should see a deployment corresponding to the latest commit: *"Update Vercel setup guide for Neon DB"*.
    *   If it failed, don't worry. It likely failed because of missing Environment Variables.

## Step 2: Add Missing "Backend" Variables
For the Backend (API & Database) to work, Vercel needs access to your Neon Database.

1.  In Vercel, go to **Settings > Environment Variables**.
2.  Add the following variables (if you haven't already):
    *   `DATABASE_URL`: `postgres://...` (Your **Neon** Connection String)
    *   `NEXTAUTH_SECRET`: (A random string, e.g., generated via `openssl rand -base64 32`)
    *   `NEXTAUTH_URL`: Your Vercel domain (e.g., `https://movie-app.vercel.app`)

## Step 3: Trigger a New Deployment
Once variables are added, you must **Redeploy** for them to take effect.

1.  Go to the **Deployments** tab.
2.  Click the three dots (`...`) next to the latest deployment (or the one that failed).
3.  Click **Redeploy**.
4.  Wait for it to finish.
    *   **Success means your Backend is now live!**

## Step 4: Initialize the Database (Critical!)
Your code is on the server, but your database tables (User, Profile, etc.) might not exist yet in Neon.

run this command **on your local computer** to push the structure to Neon:

1.  Open `c:\Movie Streaming Platform\movie-app\.env`
2.  Temporarily ensure `DATABASE_URL` is set to your **Neon Connection String**.
3.  Run:
    ```bash
    npx prisma db push
    ```

## Summary
*   **Frontend**: Already there.
*   **Backend**: Included in the same code. Works automatically once Env Vars are set.
*   **Database**: Hosted on Neon, connected via Env Vars.

**Process:** Git Push Code -> Set Vercel Env Vars -> Redeploy Vercel -> Run `npx prisma db push` locally.
