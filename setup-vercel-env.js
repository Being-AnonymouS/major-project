#!/usr/bin/env node

/**
 * Helper script to update Vercel environment variables via API
 * This script helps configure your frontend to connect to your backend
 */

const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function makeRequest(method, path, data, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function main() {
  console.log('\n🚀 Vercel Environment Variables Setup Helper\n');
  console.log('This script will help you configure your frontend to connect to your backend.\n');

  // Get backend URL
  console.log('First, let\'s find your backend URL:');
  console.log('1. Go to https://dashboard.render.com');
  console.log('2. Find your backend service (e.g., "mentor-connect-backend")');
  console.log('3. Copy the URL (e.g., https://mentor-connect-backend.onrender.com)\n');
  
  const backendUrl = await question('Enter your backend URL (without /api): ');
  
  if (!backendUrl || !backendUrl.startsWith('https://')) {
    console.error('❌ Error: Backend URL must start with https://');
    process.exit(1);
  }

  console.log('\n✅ Backend URL:', backendUrl);
  console.log('📝 VITE_API_URL will be set to:', backendUrl + '/api');
  console.log('📝 VITE_SOCKET_URL will be set to:', backendUrl);

  const proceed = await question('\nIs this correct? (yes/no): ');
  
  if (proceed.toLowerCase() !== 'yes' && proceed.toLowerCase() !== 'y') {
    console.log('Cancelled.');
    process.exit(0);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Next, we need your Vercel credentials:');
  console.log('\n📌 To get your Vercel token:');
  console.log('1. Go to https://vercel.com/account/tokens');
  console.log('2. Click "Create Token"');
  console.log('3. Name it something like "env-setup"');
  console.log('4. Select "Full Account" scope');
  console.log('5. Copy the token\n');

  const token = await question('Enter your Vercel token: ');

  if (!token) {
    console.error('❌ Error: Token is required');
    process.exit(1);
  }

  const projectId = 'prj_smGbawbSH67tXDkVuu9cmQUNDnTT';
  const teamId = 'team_aWxhjG6pWvqzq29gc49ipsAl';

  console.log('\n🔧 Setting up environment variables...\n');

  // Create VITE_API_URL
  console.log('Creating VITE_API_URL...');
  const apiUrlResult = await makeRequest(
    'POST',
    `/v10/projects/${projectId}/env?teamId=${teamId}&upsert=true`,
    {
      key: 'VITE_API_URL',
      value: backendUrl + '/api',
      type: 'plain',
      target: ['production', 'preview', 'development'],
      comment: 'Backend API URL for authentication and data'
    },
    token
  );

  if (apiUrlResult.status === 200 || apiUrlResult.status === 201) {
    console.log('✅ VITE_API_URL created/updated successfully');
  } else {
    console.log('❌ Failed to create VITE_API_URL:', apiUrlResult.data);
  }

  // Create VITE_SOCKET_URL
  console.log('Creating VITE_SOCKET_URL...');
  const socketUrlResult = await makeRequest(
    'POST',
    `/v10/projects/${projectId}/env?teamId=${teamId}&upsert=true`,
    {
      key: 'VITE_SOCKET_URL',
      value: backendUrl,
      type: 'plain',
      target: ['production', 'preview', 'development'],
      comment: 'Backend WebSocket URL for real-time messaging'
    },
    token
  );

  if (socketUrlResult.status === 200 || socketUrlResult.status === 201) {
    console.log('✅ VITE_SOCKET_URL created/updated successfully');
  } else {
    console.log('❌ Failed to create VITE_SOCKET_URL:', socketUrlResult.data);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Environment variables configured!');
  console.log('\n📋 Next steps:');
  console.log('1. Go to https://vercel.com/piyushs-projects-8737cf52/major-project-frontend-iqy7');
  console.log('2. Click on the latest deployment');
  console.log('3. Click "..." menu → "Redeploy"');
  console.log('4. Uncheck "Use existing Build Cache"');
  console.log('5. Click "Redeploy"');
  console.log('\n🎉 After redeployment, your app should work!');
  console.log('\nTest with these credentials:');
  console.log('  Email: admin@mentorconnect.com');
  console.log('  Password: admin123');

  rl.close();
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  rl.close();
  process.exit(1);
});
