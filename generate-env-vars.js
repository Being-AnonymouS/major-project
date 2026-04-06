#!/usr/bin/env node

/**
 * Environment Variable Generator for Deployment
 * 
 * This script helps generate secure values for production environment variables.
 * Run with: node generate-env-vars.js
 */

const crypto = require('crypto');

console.log('\n🔐 Environment Variable Generator\n');
console.log('='.repeat(60));

// Generate secure random strings
const jwtSecret = crypto.randomBytes(32).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(32).toString('hex');

console.log('\n📋 BACKEND ENVIRONMENT VARIABLES (for Render)\n');
console.log('Copy these to Render Dashboard → Environment tab:\n');
console.log('NODE_ENV=production');
console.log('PORT=5000');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}`);
console.log('JWT_ACCESS_EXPIRES_IN=15m');
console.log('JWT_REFRESH_EXPIRES_IN=7d');
console.log('BCRYPT_ROUNDS=12');
console.log('DATABASE_URL=[Paste Internal Database URL from Render PostgreSQL]');
console.log('FRONTEND_URL=[Will add after Vercel deployment]');

console.log('\n📋 FRONTEND ENVIRONMENT VARIABLES (for Vercel)\n');
console.log('Copy these to Vercel Dashboard → Settings → Environment Variables:\n');
console.log('VITE_API_URL=[Your Render Backend URL]/api');
console.log('VITE_SOCKET_URL=[Your Render Backend URL]');

console.log('\n💾 SAVE THESE SECRETS SECURELY!\n');
console.log('JWT_SECRET:', jwtSecret);
console.log('JWT_REFRESH_SECRET:', jwtRefreshSecret);

console.log('\n' + '='.repeat(60));
console.log('\n✅ Generation complete!\n');
console.log('Next steps:');
console.log('1. Copy JWT secrets above to Render environment variables');
console.log('2. Follow DEPLOYMENT_GUIDE.md for complete deployment steps');
console.log('3. Keep these secrets safe and never commit them!\n');
