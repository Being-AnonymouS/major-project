    # 🔴 DATABASE NOT SEEDED - Fix Guide

## ✅ What's Fixed
- ✅ CORS is now working! (Frontend can communicate with backend)
- ✅ Environment variables are correct

## ❌ Current Problem
**Database is empty** - No demo users exist yet.

**Evidence from testing:**
- Request: `POST /api/auth/login` with `admin@mentorconnect.com / admin123`
- Response: `401 - Invalid email or password`
- Backend response: `{"success":false,"error":{"message":"Invalid email or password","code":"LOGIN_FAILED"}}`

---

## 🎯 The Fix: Seed the Database

You need to run the database seed script on Render to create demo users.

### Option 1: Using Render Dashboard (Recommended)

1. **Go to Render Dashboard:**
   - Open: https://dashboard.render.com
   - Click on your service: **major-project-8sxh**

2. **Open Shell:**
   - Click **"Shell"** tab in the left sidebar
   - This opens a terminal connected to your server

3. **Run Migration (if not already done):**
   ```bash
   npm run db:migrate
   ```
   Wait for it to complete (should say "Migration successful")

4. **Run Seed Script:**
   ```bash
   npx prisma db seed
   ```
   You should see output like:
   ```
   🌱 Starting comprehensive demonstration database seed...
   🧹 Clearing existing data...
   ✅ Existing data cleared
   👤 Created 2 admin users
   👤 Created 6 mentor users
   👤 Created 7 mentee users
   ...
   ✅ Seed completed successfully!
   ```

5. **Test Login:**
   - Go to: https://major-project-frontend-iqy7.vercel.app
   - Email: `admin@mentorconnect.com`
   - Password: `admin123`
   - Should work! ✅

---

### Option 2: Add to Build Process (Automatic)

If you want the database to be seeded automatically on every deployment:

1. **Update Render Service Settings:**
   - Go to your service on Render
   - Click **"Settings"** tab
   - Find **"Build Command"**
   - Change from:
     ```
     npm install && npx prisma generate && npm run build
     ```
   - To:
     ```
     npm install && npx prisma generate && npm run build && npx prisma db push && npx prisma db seed
     ```

2. **Save and Redeploy:**
   - Click "Save Changes"
   - Click "Manual Deploy" → "Deploy latest commit"

---

## 📋 Demo Credentials (After Seeding)

### Admins:
- `admin@mentorconnect.com` / `admin123`
- `support@mentorconnect.com` / `admin123`

### Mentors (password: `mentor123`):
- `john.doe@techcorp.com`
- `sarah.wilson@datatech.ai`
- `mike.chen@mobiledev.com`
- `lisa.garcia@cloudtech.com`
- `david.kim@cybersec.org`
- `anna.petrov@uxdesign.studio`

### Mentees (password: `mentee123`):
- `alice.johnson@university.edu`
- `bob.smith@stateuni.edu`
- `emma.davis@techcollege.edu`
- `carlos.rodriguez@community.edu`
- `priya.patel@bootcamp.tech`
- `james.wilson@artschool.edu`
- `sophia.lee@highschool.edu`

---

## 🔍 Why This Happened

When you first deploy to Render:
1. ✅ Database is created (PostgreSQL)
2. ✅ Migrations run (creates tables)
3. ❌ **Seed script doesn't run automatically** (tables are empty)

You need to manually run the seed script once, or add it to your build process.

---

## ✅ Verification Steps

After running the seed:

1. **Check Backend Health:**
   ```
   https://major-project-8sxh.onrender.com/api/health
   ```
   Should return: `{"status":"OK",...}`

2. **Test Login:**
   - Open DevTools (F12) → Network tab
   - Try logging in with `admin@mentorconnect.com` / `admin123`
   - Should see: `200 OK` with JWT tokens
   - Should redirect to admin dashboard

3. **Verify in Console:**
   - No errors
   - Login successful message

---

## 🆘 Troubleshooting

### Issue: "Shell tab not showing"
**Solution:** 
- Make sure your service is fully deployed (green "Live" status)
- Refresh the Render dashboard page

### Issue: "npm: command not found"
**Solution:**
- The shell loads Node.js environment
- If this happens, wait a few seconds and try again
- Or use: `/opt/render/project/src/node_modules/.bin/prisma db seed`

### Issue: "Seed script fails"
**Solution:**
Check the error message. Common issues:
- Database not connected: Check `DATABASE_URL` env var
- Migration not run: Run `npm run db:migrate` first
- Tables don't exist: Run migrations first

### Issue: "Still getting 401 after seeding"
**Solution:**
1. Verify seed completed successfully (check output)
2. Try a different credential from the list above
3. Check backend logs: Dashboard → Logs tab

---

## 📊 What I Found Using MCP Tools

### ✅ Vercel MCP:
- Project is live and deployed
- Latest deployment: 20 hours ago
- Environment variables are set correctly

### ✅ Chrome DevTools MCP:
- CORS is working (proper headers present)
- Request reaches backend successfully
- Backend responds with 401 (credentials not found in DB)
- Request body is correct: `{"email":"admin@mentorconnect.com","password":"admin123"}`

### ⚠️ Render MCP:
- Workspace selection required but tools are disabled in VS Code
- Cannot programmatically run seed script
- **Manual fix required via Render Dashboard**

---

## 🔧 Render MCP Configuration Issue

**Note:** Your mcp.json has been updated with `"disableWorkspaceTools": false`, but VS Code needs to be reloaded for changes to take effect.

**To enable Render automation:**
1. Save your work
2. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
3. Type: "Developer: Reload Window"
4. After reload, I'll be able to select workspace and run commands automatically

**For now:** Use the manual fix above (Render Shell → run seed command)

---

**Next Action:** Go to Render Dashboard → Shell → Run `npx prisma db seed`
