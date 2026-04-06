# Deployment Guide for Mentor Connect

This guide will walk you through deploying the Mentor Connect application with the backend on Render and frontend on Vercel.

## 📋 Pre-Deployment Checklist

### ✅ Required Changes Completed
- [x] Database schema updated to PostgreSQL (from SQLite)
- [x] Production scripts added to package.json
- [x] Vercel configuration created (vercel.json)
- [x] Render configuration created (render.yaml)
- [x] Environment variable templates created

### 🔍 Verify Before Deployment
- [ ] All code is committed and pushed to GitHub
- [ ] No sensitive data in code (check .env files are in .gitignore)
- [ ] All tests passing locally
- [ ] Build works locally (`npm run build` in both frontend and backend)

---

## 🚀 Part 1: Deploy Backend to Render

### Step 1: Create a Render Account
1. Go to [https://render.com](https://render.com)
2. Sign up using GitHub (recommended for easy integration)
3. Authorize Render to access your GitHub repositories

### Step 2: Create PostgreSQL Database
1. From Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure database:
   - **Name**: `mentor-connect-db`
   - **Database**: `mentor_connect`
   - **User**: (auto-generated)
   - **Region**: Choose closest to your users (e.g., Oregon, Frankfurt)
   - **Plan**: Select **Free** tier
3. Click **"Create Database"**
4. **IMPORTANT**: Copy the **Internal Database URL** (it looks like: `postgresql://user:pass@host/database`)
   - Save this for later!

### Step 3: Create Web Service for Backend
1. From Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure the service:

   **Basic Settings:**
   - **Name**: `mentor-connect-backend`
   - **Region**: Same as your database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: 
     ```bash
     npm install && npx prisma generate && npm run build
     ```
   - **Start Command**: 
     ```bash
     npm run start:production
     ```

   **Instance Type:**
   - Select **Free** tier

### Step 4: Configure Environment Variables on Render

Click on **"Environment"** tab and add these variables:

```plaintext
NODE_ENV=production
PORT=5000
DATABASE_URL=[paste the Internal Database URL from Step 2]
FRONTEND_URL=[leave empty for now, we'll update after Vercel deployment]
JWT_SECRET=[generate a secure random string - min 32 characters]
JWT_REFRESH_SECRET=[generate another secure random string - min 32 characters]
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
```

**To generate secure secrets:**
```bash
# On your computer, run:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Run this twice to get two different secrets.

### Step 5: Deploy Backend
1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Generate Prisma client
   - Build TypeScript code
   - Run database migrations
   - Start your server

3. **Monitor the deployment:**
   - Check the **"Logs"** tab for any errors
   - Wait for "Your service is live 🎉" message

4. **Copy your backend URL:**
   - It will be something like: `https://mentor-connect-backend.onrender.com`
   - **Save this URL!**

### Step 6: Test Backend
1. Open your backend URL in browser: `https://your-backend-url.onrender.com/api/health`
2. You should see: `{"status":"OK", ...}`

---

## 🌐 Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to [https://vercel.com](https://vercel.com)
2. Sign up using GitHub
3. Authorize Vercel to access your repositories

### Step 2: Import Project
1. From Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Import your GitHub repository
3. Vercel will auto-detect it as a Vite project

### Step 3: Configure Build Settings
1. **Framework Preset**: `Vite`
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build` (should be auto-detected)
4. **Output Directory**: `dist` (should be auto-detected)
5. **Install Command**: `npm install` (should be auto-detected)

### Step 4: Configure Environment Variables
Click **"Environment Variables"** and add:

```plaintext
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_SOCKET_URL=https://your-backend-url.onrender.com
```

**Replace** `your-backend-url.onrender.com` with the actual URL from Part 1, Step 5.

### Step 5: Deploy Frontend
1. Click **"Deploy"**
2. Vercel will:
   - Clone repository
   - Install dependencies
   - Build production bundle
   - Deploy to CDN

3. Wait for deployment to complete (usually 1-2 minutes)

4. **Copy your frontend URL:**
   - It will be something like: `https://mentor-connect-xyz.vercel.app`
   - **Save this URL!**

### Step 6: Update Backend with Frontend URL
1. Go back to **Render Dashboard**
2. Click on your backend service
3. Go to **"Environment"** tab
4. Update the `FRONTEND_URL` variable:
   ```plaintext
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
5. Click **"Save Changes"**
6. Render will automatically redeploy your backend

---

## 🔄 Part 3: Initialize Database

### Option 1: Using Render Shell (Recommended)
1. In Render Dashboard, go to your backend service
2. Click **"Shell"** tab (on the right side)
3. Run the seed command:
   ```bash
   npm run db:seed
   ```

### Option 2: Using Local Migration
1. On your local machine, update your `.env` file temporarily:
   ```plaintext
   DATABASE_URL=[paste the External Database URL from Render]
   ```
2. Run:
   ```bash
   cd backend
   npm run db:seed
   ```
3. **Remember to revert your .env file after!**

---

## ✅ Part 4: Verification & Testing

### 1. Test Backend Endpoints
Open these URLs in your browser:

- Health Check: `https://your-backend.onrender.com/api/health`
  - Should return: `{"status": "OK"}`

### 2. Test Frontend
1. Open: `https://your-frontend.vercel.app`
2. Try to:
   - [ ] Register a new account
   - [ ] Login with credentials
   - [ ] Browse mentors (if seeded)
   - [ ] Book an appointment
   - [ ] Send messages

### 3. Check Logs
**Backend Logs (Render):**
- Go to Render Dashboard → Your Service → Logs tab
- Look for any errors

**Frontend Logs (Vercel):**
- Go to Vercel Dashboard → Your Project → Deployments
- Click on the latest deployment → "Runtime Logs"

### 4. Common Issues & Solutions

#### Issue 1: "Failed to fetch" or CORS errors
**Solution:**
1. Verify `FRONTEND_URL` in Render matches your Vercel URL exactly
2. Verify `VITE_API_URL` in Vercel matches your Render URL
3. Redeploy both services after fixing

#### Issue 2: Database connection errors
**Solution:**
1. Check `DATABASE_URL` in Render environment variables
2. Ensure you used the **Internal Database URL** (not External)
3. Verify database is running (check Render Database dashboard)

#### Issue 3: 404 errors on frontend routes
**Solution:**
- Verify `vercel.json` exists in frontend folder with rewrites config
- Redeploy frontend

#### Issue 4: Build fails on Render
**Solution:**
1. Check Render logs for specific error
2. Ensure all dependencies are in `dependencies` not `devDependencies`
3. Verify `build` script works locally: `npm run build`

#### Issue 5: WebSocket/Socket.io not working
**Solution:**
1. Verify `VITE_SOCKET_URL` points to your backend (without /api)
2. Check Render logs for socket connection attempts
3. Ensure Render service is not sleeping (free tier sleeps after 15 min inactivity)

---

## 🔐 Part 5: Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` files
- ✅ Use strong, random JWT secrets (32+ characters)
- ✅ Rotate secrets periodically

### 2. Database
- ✅ Use Internal Database URL (not External) for better security
- ✅ Regularly backup database (Render provides automatic backups on paid plans)

### 3. HTTPS
- ✅ Both Vercel and Render provide HTTPS by default
- ✅ Verify your URLs use `https://` not `http://`

---

## 🔄 Part 6: Continuous Deployment

Both platforms support automatic deployment:

### Auto-Deploy Setup (Already Configured)
1. **Vercel**: Automatically deploys on every push to `main` branch
2. **Render**: Automatically deploys on every push to `main` branch

### Manual Deploy
**Vercel:**
1. Go to project dashboard
2. Click "Deployments"
3. Click "Redeploy" on any deployment

**Render:**
1. Go to service dashboard
2. Click "Manual Deploy"
3. Select branch and click "Deploy"

---

## 📊 Part 7: Monitoring

### Backend Monitoring (Render)
- **Metrics**: Dashboard → Your Service → Metrics
  - CPU usage
  - Memory usage
  - Request counts
- **Logs**: Real-time logs available in Logs tab

### Frontend Monitoring (Vercel)
- **Analytics**: Dashboard → Your Project → Analytics
  - Page views
  - Performance metrics
- **Speed Insights**: Shows Core Web Vitals

---

## 💰 Pricing & Limits (Free Tier)

### Render Free Tier
- ✅ 750 hours/month of runtime
- ✅ Sleeps after 15 minutes of inactivity
- ✅ Wakes up on request (may take 30-60 seconds)
- ❌ No custom domains on free tier
- PostgreSQL: 90 days free, then $7/month

### Vercel Free Tier (Hobby)
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Always-on (no sleeping)
- ✅ Automatic HTTPS
- ✅ Custom domains supported

---

## 🆙 Upgrading to Production

When ready for production users:

### Render ($7/month)
- 24/7 uptime (no sleeping)
- Faster instances
- Persistent database included

### Vercel Pro ($20/month)
- More bandwidth
- Advanced analytics
- Team collaboration features

---

## 📝 Quick Reference

### Useful Commands

**Local Development:**
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

**Production Build (Test Locally):**
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

**Database Commands:**
```bash
cd backend
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations
npm run db:seed        # Seed database
```

### Important URLs
- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Your Backend**: https://your-app-name.onrender.com
- **Your Frontend**: https://your-app-name.vercel.app

---

## 🆘 Getting Help

### Check Logs First
1. **Render Logs**: Most helpful for backend issues
2. **Vercel Runtime Logs**: For frontend issues
3. **Browser Console**: For client-side errors (F12 → Console)

### Common Log Messages
- `Prisma migration failed`: Database connection or migration issue
- `CORS error`: Check FRONTEND_URL and VITE_API_URL
- `JWT secret`: Check JWT_SECRET is set correctly
- `Port already in use`: Normal on Render, ignore

---

## ✨ You're Done!

Your application should now be live and accessible to anyone with the URLs!

**Next Steps:**
1. Share your frontend URL with users
2. Monitor logs for any issues
3. Set up custom domain (optional)
4. Add monitoring/analytics
5. Plan for scaling (when needed)

**Pro Tips:**
- Keep your local .env files for development
- Document any changes to environment variables
- Test thoroughly after each deployment
- Use branches for testing changes before deploying to main

---

**Need help?** Check the logs first, then review the Common Issues section above.

Good luck with your deployment! 🚀
