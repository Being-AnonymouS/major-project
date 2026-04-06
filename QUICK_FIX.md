# 🚨 URGENT FIX: Frontend Can't Connect to Backend

## Problem Found
Your frontend on Vercel is trying to connect to `http://localhost:5000` which doesn't exist in production.

## Quick Fix Options

### Option 1: Use Helper Script (Easiest)

1. Open terminal in your project root
2. Run:
   ```bash
   node setup-vercel-env.js
   ```
3. Follow the prompts - you'll need:
   - Your backend URL from Render
   - A Vercel token (get from https://vercel.com/account/tokens)

### Option 2: Manual Setup via Vercel Dashboard

1. **Get your backend URL:**
   - Go to https://dashboard.render.com
   - Look for `mentor-connect-backend` (or similar name)
   - Copy the URL (e.g., `https://mentor-connect-backend.onrender.com`)
   - **⚠️ If you don't see it, you need to deploy the backend first!** (see below)

2. **Update Vercel environment variables:**
   - Go to https://vercel.com/piyushs-projects-8737cf52/major-project-frontend-iqy7/settings/environment-variables
   - Add variable #1:
     - Name: `VITE_API_URL`
     - Value: `https://YOUR-BACKEND.onrender.com/api`
     - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Add variable #2:
     - Name: `VITE_SOCKET_URL`
     - Value: `https://YOUR-BACKEND.onrender.com`
     - Environments: ✅ Production, ✅ Preview, ✅ Development

3. **Redeploy:**
   - Go to https://vercel.com/piyushs-projects-8737cf52/major-project-frontend-iqy7/deployments
   - Click latest deployment → "..." → "Redeploy"
   - Uncheck "Use existing Build Cache"
   - Click "Redeploy"

---

## 🔴 If Backend Not Deployed Yet

If you don't see your backend on Render, deploy it first:

### Quick Backend Deployment on Render

1. **Create Database:**
   - Go to https://dashboard.render.com
   - New + → PostgreSQL
   - Name: `mentor-connect-db`
   - Plan: Free
   - Create Database
   - **Copy "Internal Database URL"** (you'll need this!)

2. **Create Web Service:**
   - New + → Web Service
   - Connect your GitHub: `piyushcoder07/major-project`
   - Settings:
     - Name: `mentor-connect-backend`
     - Root Directory: `backend`
     - Runtime: Node
     - Build Command: `npm install && npx prisma generate && npm run build`
     - Start Command: `npm run start:production`
     - Plan: Free

3. **Add Environment Variables:**
   ```
   NODE_ENV=production
   DATABASE_URL=[Paste Internal Database URL from step 1]
   FRONTEND_URL=https://major-project-frontend-iqy7.vercel.app
   JWT_SECRET=<generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
   JWT_REFRESH_SECRET=<generate another one>
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   BCRYPT_ROUNDS=12
   ```

4. **Deploy:**
   - Click "Create Web Service"
   - Wait 5-10 minutes for first deployment
   - Copy your backend URL
   - **Now go back to "Quick Fix Options" above!**

---

## ✅ Verify It Works

After completing the fix:

1. Visit: https://major-project-frontend-iqy7.vercel.app
2. Open DevTools (F12) → Network tab
3. Try logging in:
   - Email: `admin@mentorconnect.com`
   - Password: `admin123`
4. Check Network tab - you should see requests to your backend URL (not localhost!)
5. Login should work and redirect to dashboard

---

## 🆘 Need More Help?

- Read detailed guide: `VERCEL_ENV_FIX.md`
- Full deployment guide: `DEPLOYMENT_GUIDE.md`
- Backend logs: https://dashboard.render.com (click your service → Logs)
- Frontend logs: https://vercel.com → your project → Deployments → click deployment → "Logs"
