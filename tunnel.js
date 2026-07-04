// tunnel.js - Start a localtunnel to expose localhost:8080 publicly
// Run: node tunnel.js

const { execSync, spawn } = require('child_process');
const path = require('path');

// Install localtunnel if not present
try {
  require.resolve('localtunnel');
  console.log('[tunnel] localtunnel already installed.');
} catch(e) {
  console.log('[tunnel] Installing localtunnel...');
  execSync('npm install localtunnel --prefix ./tunnel_deps', { stdio: 'inherit', cwd: __dirname });
}

// Load and start tunnel
const lt = require(path.join(__dirname, 'tunnel_deps', 'node_modules', 'localtunnel'));

async function startTunnel() {
  console.log('[tunnel] Starting tunnel to http://localhost:8080 ...');
  const tunnel = await lt({ port: 8080, subdomain: 'khetimitra' });

  console.log('');
  console.log('===========================================');
  console.log(' 🌾 KhetiMitra PUBLIC URL:');
  console.log('');
  console.log('   ' + tunnel.url);
  console.log('');
  console.log(' Share this URL to access from any device!');
  console.log('===========================================');
  console.log('');
  console.log(' Press Ctrl+C to stop the tunnel.');
  console.log('');

  tunnel.on('close', () => {
    console.log('[tunnel] Tunnel closed.');
  });

  tunnel.on('error', (err) => {
    console.error('[tunnel] Error:', err.message);
  });
}

startTunnel().catch(err => {
  console.error('[tunnel] Failed to start:', err.message);
  process.exit(1);
});
