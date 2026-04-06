# Fix Vercel Frontend Connection Issue

## 🔴 **Current Problem**
Your frontend is deployed on Vercel but trying to connect to `http://localhost:5000` which doesn't exist in production.

**Error seen in browser console:**
```
POST http://localhost:5000/api/auth/login [failed - net::ERR_NETWORK_CHANGED]
```

## ✅ **Solution**
You need to configure Vercel environment variables to point to your deployed backend.

---

## 📋 **Step 1: Check if Backend is Deployed**

### Option A: Backend Already Deployed on Render
1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Look for a service named `mentor-connect-backend` or similar
3. If it exists, copy the URL (e.g., `https://mentor-connect-backend.onrender.com`)
4. **Skip to Step 2**

### Option B: Backend Not Yet Deployed
If you don't see the backend service, you need to deploy it first:

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
   - Name: `mentor-connect-db`
   - Region: Oregon (or closest to you)
   - Plan: Free
   - Click "Create Database"
   - **Copy the "Internal Database URL"** - you'll need this!

3. Click **"New +"** → **"Web Service"**
   - Connect your GitHub account if not connected
   - Select repository: `major-project`
   - Click "Connect"
   
4. Configure the service:
   - **Name**: `mentor-connect-backend`
   - **Region**: Same as database (Oregon)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm run start:production`
   - **Plan**: Free

5. Add Environment Variables (click "Advanced" → "Add Environment Variable"):
   ```
   NODE_ENV=production
   DATABASE_URL=[Paste the Internal Database URL from step 2]
   JWT_SECRET=[Generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
   JWT_REFRESH_SECRET=[Generate another random secret]
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   BCRYPT_ROUNDS=12
   FRONTEND_URL=https://major-project-frontend-iqy7.vercel.app
   ```

6. Click **"Create Web Service"**
7. Wait for deployment (5-10 minutes first time)
8. Once deployed, **copy your backend URL** (e.g., `https://mentor-connect-backend.onrender.com`)

---

## 📋 **Step 2: Update Vercel Environment Variables**

### Method 1: Using Vercel Dashboard (Recommended)

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your project: **major-project-frontend-iqy7**
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

   **Variable 1:**
   - **Name**: `VITE_API_URL`
   - **Value**: `https://YOUR-BACKEND-URL.onrender.com/api`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

   **Variable 2:**
   - **Name**: `VITE_SOCKET_URL`
   - **Value**: `https://YOUR-BACKEND-URL.onrender.com`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

   **Replace** `YOUR-BACKEND-URL.onrender.com` with your actual backend URL from Step 1!

5. Go to **Deployments** tab
6. Find the latest deployment
7. Click the **"..."** menu → **"Redeploy"**
8. Check "Use existing Build Cache" is **UNCHECKED**
9. Click "Redeploy"

### Method 2: Using Vercel CLI (Alternative)

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Link to your project
cd frontend
vercel link

# Add environment variables (replace with your actual backend URL)
vercel env add VITE_API_URL production
# When prompted, enter: https://YOUR-BACKEND-URL.onrender.com/api

vercel env add VITE_SOCKET_URL production
# When prompted, enter: https://YOUR-BACKEND-URL.onrender.com

# Redeploy
vercel --prod
```

---

## 📋 **Step 3: Verify the Fix**

1. Wait for Vercel redeployment to complete (~1-2 minutes)
2. Visit: https://major-project-frontend-iqy7.vercel.app
3. Open browser Developer Tools (F12)
4. Go to **Console** tab
5. Try to log in with:
   - **Email**: `admin@mentorconnect.com`
   - **Password**: `admin123`

6. Check the **Network** tab:
   - You should see a POST request to `https://YOUR-BACKEND-URL.onrender.com/api/auth/login`
   - Status should be **200 OK** (not ERR_NETWORK_CHANGED)

7. If login successful, you should be redirected to the admin dashboard!

---

## 🔧 **Troubleshooting**

### Issue: Still seeing localhost:5000 in Network tab
**Solution**: Clear browser cache and hard reload (Ctrl+Shift+R)

### Issue: Backend URL returns 404
**Solution**: 
- Make sure your backend URL ends with `/api` for VITE_API_URL
- Check backend is fully deployed on Render (green "Live" status)

### Issue: CORS error
**Solution**: 
- Update the `FRONTEND_URL` environment variable on Render backend
- Set it to: `https://major-project-frontend-iqy7.vercel.app`
- Redeploy the backend service

### Issue: Login returns 500 error
**Solution**: 
- Check backend logs on Render dashboard
- Make sure database migration ran: Run `npm run db:migrate` in Render shell
- Seed the database: Run `npx prisma db seed` in Render shell

---

## 📝 **Quick Reference**

### Test Credentials (After Backend is Seeded)
```
Admin: admin@mentorconnect.com / admin123
Mentor: john.doe@techcorp.com / mentor123
Mentee: alice.johnson@university.edu / mentee123
```

### Important URLs
- Frontend: https://major-project-frontend-iqy7.vercel.app
- Backend: https://YOUR-BACKEND-URL.onrender.com
- Backend Health Check: https://YOUR-BACKEND-URL.onrender.com/api/health
- Render Dashboard: https://dashboard.render.com
- Vercel Dashboard: https://vercel.com/dashboard

---

## ✅ **Success Indicators**

You'll know everything is working when:
1. ✅ Browser Network tab shows requests to `https://YOUR-BACKEND-URL.onrender.com`
2. ✅ No CORS errors in console
3. ✅ Login works and redirects to dashboard
4. ✅ Backend health check returns `{"status":"OK"}`

---

**Need Help?** If you're still having issues after following these steps:
1. Check backend logs on Render
2. Check browser console for specific error messages
3. Verify all environment variables are set correctly on both platforms
