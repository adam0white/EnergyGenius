#!/usr/bin/env node

/**
 * Post-deployment verification script
 * Verifies that the Worker is deployed and responding correctly
 */

import https from 'https';
import http from 'http';

// Default Worker URL - can be overridden via environment variable
const workerUrl = process.env.WORKER_URL || 'https://energy-genius.21785aeab46b7c081cae0be3a4313dbd.workers.dev';

console.log('\n🔍 Verifying deployment...');
console.log(`📍 Worker URL: ${workerUrl}`);

// Parse URL to determine protocol
const url = new URL(workerUrl);
const client = url.protocol === 'https:' ? https : http;

// Health check with timeout and retry
const healthCheck = (retries = 3, delay = 2000) => {
  return new Promise((resolve, reject) => {
    const attempt = (retriesLeft) => {
      console.log(`\n⏳ Health check attempt ${4 - retriesLeft}/3...`);

      const request = client.get(`${workerUrl}/health`, { timeout: 10000 }, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const json = JSON.parse(data);
              if (json.status === 'ok') {
                console.log('✅ Health check passed');
                console.log(`   Status: ${json.status}`);
                console.log(`   Worker: ${json.worker || 'active'}`);
                resolve(true);
              } else {
                console.warn(`⚠️  Health check returned unexpected status: ${json.status}`);
                if (retriesLeft > 0) {
                  console.log(`   Retrying in ${delay/1000}s...`);
                  setTimeout(() => attempt(retriesLeft - 1), delay);
                } else {
                  reject(new Error('Health check status not "ok"'));
                }
              }
            } catch (error) {
              console.error('❌ Failed to parse health check response');
              console.error(`   Response: ${data}`);
              if (retriesLeft > 0) {
                console.log(`   Retrying in ${delay/1000}s...`);
                setTimeout(() => attempt(retriesLeft - 1), delay);
              } else {
                reject(error);
              }
            }
          } else {
            console.error(`❌ Health check failed with status: ${res.statusCode}`);
            if (retriesLeft > 0) {
              console.log(`   Retrying in ${delay/1000}s...`);
              setTimeout(() => attempt(retriesLeft - 1), delay);
            } else {
              reject(new Error(`HTTP ${res.statusCode}`));
            }
          }
        });
      });

      request.on('error', (error) => {
        console.error(`❌ Health check error: ${error.message}`);
        if (retriesLeft > 0) {
          console.log(`   Retrying in ${delay/1000}s...`);
          setTimeout(() => attempt(retriesLeft - 1), delay);
        } else {
          reject(error);
        }
      });

      request.on('timeout', () => {
        console.error('❌ Health check timeout (10s)');
        request.destroy();
        if (retriesLeft > 0) {
          console.log(`   Retrying in ${delay/1000}s...`);
          setTimeout(() => attempt(retriesLeft - 1), delay);
        } else {
          reject(new Error('Timeout'));
        }
      });
    };

    attempt(retries);
  });
};

// Main verification flow
async function verify() {
  console.log('\n' + '='.repeat(60));
  console.log('  DEPLOYMENT VERIFICATION');
  console.log('='.repeat(60));

  try {
    await healthCheck();

    console.log('\n' + '='.repeat(60));
    console.log('✅ DEPLOYMENT VERIFIED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log(`\n🌐 Visit: ${workerUrl}`);
    console.log(`📊 Logs: wrangler tail`);
    console.log(`📈 Dashboard: https://dash.cloudflare.com/`);
    console.log('\n');
    process.exit(0);
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ DEPLOYMENT VERIFICATION FAILED');
    console.log('='.repeat(60));
    console.error(`\nError: ${error.message}`);
    console.log('\n📋 Troubleshooting:');
    console.log('   1. Check Wrangler deployment logs');
    console.log('   2. Verify Worker is running: wrangler tail');
    console.log('   3. Check Cloudflare dashboard for errors');
    console.log('   4. Ensure /health endpoint exists in Worker');
    console.log('   5. Verify WORKER_URL environment variable is correct');
    console.log('\n');
    process.exit(1);
  }
}

// Run verification
verify();
