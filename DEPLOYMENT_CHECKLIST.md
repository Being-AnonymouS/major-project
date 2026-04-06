# Deployment Checklist

Use this checklist to ensure everything is ready before and during deployment.

## Pre-Deployment Checklist

### Code Preparation
- [ ] All code committed to Git
- [ ] All tests passing
- [ ] No `.env` files committed (check `.gitignore`)
- [ ] Build works locally:
  ```bash
  cd backend && npm run build
  cd ../frontend && npm run build
  ```

### Files Created/Updated
- [ ] `backend/prisma/schema.prisma` - Updated to PostgreSQL
- [ ] `backend/package.json` - Production scripts added
- [ ] `frontend/vercel.json` - Created
- [ ] `backend/render.yaml` - Created
- [ ] `.env.production.example` - Created

### Push to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

---

## Backend Deployment (Render)

### 1. Create PostgreSQL Database
- [ ] Sign up/login to Render
- [ ] New → PostgreSQL
- [ ] Name: `mentor-connect-db`
- [ ] Region: Choose one (e.g., Oregon)
- [ ] Copy **Internal Database URL**

### 2. Create Web Service
- [ ] New → Web Service
- [ ] Connect GitHub repo
- [ ] Root Directory: `backend`
- [ ] Build Command: `npm install && npx prisma generate && npm run build`
- [ ] Start Command: `npm run start:production`

### 3. Environment Variables
Add these in Render Environment tab:
```
NODE_ENV=production
PORT=5000
DATABASE_URL=[Internal DB URL from step 1]
FRONTEND_URL=[Will add after Vercel deployment]
JWT_SECRET=[Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
JWT_REFRESH_SECRET=[Generate another one]
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
```

### 4. Deploy & Verify
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (check Logs tab)
- [ ] Copy backend URL: `https://______.onrender.com`
- [ ] Test health check: `https://YOUR-URL.onrender.com/api/health`

---

## Frontend Deployment (Vercel)

### 1. Import Project
- [ ] Sign up/login to Vercel
- [ ] Add New → Project
- [ ] Import GitHub repo
- [ ] Root Directory: `frontend`

### 2. Environment Variables
Add these in Vercel:
```
VITE_API_URL=https://major-project-8sxh.onrender.com/api 
VITE_SOCKET_URL=https://major-project-8sxh.onrender.com
```

### 3. Deploy & Verify
- [ ] Click "Deploy"
- [ ] Wait for deployment
- [ ] Copy frontend URL: `https://______.vercel.app`
- [ ] Test in browser

---

## Final Configuration

### 1. Update Backend with Frontend URL
- [ ] Go to Render → Your Service → Environment
- [ ] Update `FRONTEND_URL=https://YOUR-VERCEL-URL.vercel.app`
- [ ] Save (auto-redeploys)

### 2. Seed Database
In Render Shell tab:
```bash
npm run db:seed
```

---

## Testing Checklist

### Backend Tests
- [ ] Health endpoint works: `/api/health`
- [ ] No errors in Render logs

### Frontend Tests
- [ ] Site loads correctly
- [ ] Can register new user
- [ ] Can login
- [ ] Can view mentors
- [ ] Can book appointment
- [ ] Real-time messaging works
- [ ] No CORS errors in browser console (F12)

### Integration Tests
- [ ] Frontend connects to backend
- [ ] Socket.io connection works
- [ ] Database operations work
- [ ] Authentication flow works

---

## Troubleshooting Quick Reference

### CORS Errors
1. Check `FRONTEND_URL` in Render = Vercel URL
2. Check `VITE_API_URL` in Vercel = Render URL
3. Redeploy both

### Database Errors
1. Check `DATABASE_URL` in Render
2. Use Internal URL (not External)
3. Check database is running in Render

### Build Fails
1. Check Render/Vercel logs
2. Test build locally first
3. Check all dependencies are correct

### Socket.io Not Working
1. Check `VITE_SOCKET_URL` in Vercel
2. Check Render logs for connections
3. Wait for Render to wake up (free tier)

---

## Important URLs

**Dashboards:**
- Render: https://dashboard.render.com
- Vercel: https://vercel.com/dashboard

**Your App:**
- Backend: https://________________.onrender.com
- Frontend: https://________________.vercel.app

**Documentation:**
- Full Guide: See `DEPLOYMENT_GUIDE.md`
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs

---

## Post-Deployment

- [ ] Share frontend URL
- [ ] Monitor logs for errors
- [ ] Set up custom domain (optional)
- [ ] Enable auto-deploy (already configured)
- [ ] Plan for scaling if needed

---

**Generated Secrets Storage (SAVE THESE SECURELY!):**

```
JWT_SECRET=_______________________________________
JWT_REFRESH_SECRET=_______________________________
Backend URL=______________________________________
Frontend URL=_____________________________________
Database URL=_____________________________________
```
