# Database Migration: SQLite to PostgreSQL

This document explains the database changes made for production deployment.

## What Changed

### Before (Development)
- **Database**: SQLite (file-based)
- **File**: `backend/prisma/dev.db`
- **Good for**: Local development, testing
- **Limitations**: Not suitable for production, no concurrent access

### After (Production)
- **Database**: PostgreSQL
- **Location**: Render managed database
- **Good for**: Production, scalability, concurrent users
- **Features**: ACID compliance, better performance, hosted solution

## Changes Made to Code

### 1. Prisma Schema Updated
**File**: `backend/prisma/schema.prisma`

```diff
datasource db {
-  provider = "sqlite"
+  provider = "postgresql"
   url      = env("DATABASE_URL")
}
```

### 2. Environment Variables
**Development** (`.env`):
```env
DATABASE_URL="file:./dev.db"
```

**Production** (Render):
```env
DATABASE_URL="postgresql://user:pass@host:port/database"
```

## Data Migration Notes

### ⚠️ Important: Data Does NOT Auto-Transfer

Your local SQLite data will **NOT** automatically transfer to PostgreSQL. This includes:
- User accounts
- Appointments
- Messages
- Ratings

### How to Populate Production Database

#### Option 1: Use Seed Data (Recommended for Testing)
The seed script will create:
- Admin account
- Sample mentors
- Sample mentees
- Test data

Run on Render:
```bash
npm run db:seed
```

#### Option 2: Manual Data Entry
After deployment:
1. Register new accounts through the frontend
2. Create profiles
3. Book appointments
4. Use the application normally

#### Option 3: Export/Import (Advanced)
If you have important data to migrate:

**1. Export from SQLite:**
```bash
# In backend directory
npm install -g prisma
npx prisma db pull
# This updates your schema with data
```

**2. Use custom migration script:**
```javascript
// migrate-data.js
// You would need to write custom logic to:
// - Read from SQLite
// - Transform data
// - Insert into PostgreSQL
```

> ⚠️ This is complex and usually not needed for new deployments

## Schema Compatibility

The Prisma schema is compatible with both SQLite and PostgreSQL. No model changes were needed because:
- ✅ Same data types work on both
- ✅ Relations are handled by Prisma
- ✅ No database-specific features used

## Development vs Production Setup

### Local Development (SQLite)
```env
# .env
DATABASE_URL="file:./dev.db"
```

```bash
cd backend
npm run dev
```

### Production (PostgreSQL on Render)
```env
# Set in Render Dashboard
DATABASE_URL="postgresql://..."
```

Render automatically runs:
```bash
npx prisma migrate deploy
npm run start:production
```

## Migration Commands Reference

### Generate Prisma Client
```bash
npx prisma generate
```
Regenerates the Prisma Client based on your schema.

### Create Migration
```bash
npx prisma migrate dev --name init
```
Creates a new migration (development only).

### Deploy Migrations
```bash
npx prisma migrate deploy
```
Applies pending migrations to production database.

### Reset Database (Development Only!)
```bash
npm run db:reset
```
⚠️ **Warning**: Deletes all data and recreates database!

### Seed Database
```bash
npm run db:seed
```
Populates database with initial data.

## Troubleshooting

### Issue: "Can't reach database server"
**Cause**: Wrong DATABASE_URL
**Solution**: 
1. Check DATABASE_URL in Render environment variables
2. Use **Internal** Database URL (not External)
3. Format: `postgresql://user:pass@hostname:5432/dbname`

### Issue: "Migration failed"
**Cause**: Schema mismatch or existing data
**Solution**:
1. Check Render logs for specific error
2. Ensure database is empty before first migration
3. Drop and recreate database if needed (Render Dashboard)

### Issue: "SSL required"
**Cause**: PostgreSQL requires SSL connection
**Solution**: Prisma automatically handles SSL with Render. If issues persist, add to DATABASE_URL:
```
?sslmode=require
```

### Issue: "Too many connections"
**Cause**: Connection pool exhausted
**Solution**: Add to Prisma schema:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Add connection pool settings
}
```

## Prisma Studio (Database GUI)

### Local Development
```bash
cd backend
npx prisma studio
```
Opens at `http://localhost:5555`

### Production (Render)
Connect using External Database URL:
```bash
DATABASE_URL="postgresql://..." npx prisma studio
```

⚠️ **Warning**: Be careful editing production data!

## Best Practices

### Development
- ✅ Use SQLite for speed and simplicity
- ✅ Commit migration files to git
- ✅ Use seed data for testing
- ✅ Reset database when needed

### Production
- ✅ Use PostgreSQL for reliability
- ✅ Never reset production database
- ✅ Backup before major changes
- ✅ Test migrations locally first

### Migrations
- ✅ Create descriptive migration names
- ✅ Review generated SQL before applying
- ✅ Test migrations on development first
- ✅ Keep migrations in git

## Future Schema Changes

When you need to modify the database schema:

**1. Update Prisma Schema**
Edit `backend/prisma/schema.prisma`

**2. Create Migration (Development)**
```bash
npx prisma migrate dev --name your_change_description
```

**3. Test Locally**
```bash
npm run dev
# Test your changes
```

**4. Commit and Push**
```bash
git add prisma/
git commit -m "Add: new database field"
git push
```

**5. Deploy to Render**
Render will automatically:
- Run `npx prisma generate`
- Run `npx prisma migrate deploy`
- Restart the server

## Database Backup (Production)

### Automatic Backups
- Render Free tier: No automatic backups
- Render Paid plans: Daily automatic backups

### Manual Backup
```bash
# Using pg_dump (requires PostgreSQL tools)
pg_dump DATABASE_URL > backup.sql
```

### Restore from Backup
```bash
psql DATABASE_URL < backup.sql
```

## Summary

| Feature | SQLite (Dev) | PostgreSQL (Prod) |
|---------|-------------|-------------------|
| Storage | File-based | Server-based |
| Concurrent Users | Limited | Excellent |
| Performance | Fast for single user | Optimized for multiple users |
| Hosting | Local only | Cloud-hosted |
| Cost | Free | $7/month after trial |
| Backup | Manual file copy | Automated (paid) |
| Migrations | Prisma | Prisma |

## Questions?

- **Prisma Docs**: https://www.prisma.io/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Render Docs**: https://render.com/docs/databases

---

Your application code doesn't change - Prisma handles the differences automatically! 🎉
