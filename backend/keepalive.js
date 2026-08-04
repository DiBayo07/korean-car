const http = require('http');
const INTERVAL = 4 * 60 * 1000; // 4 minutes

function ping() {
  http.get('http://localhost:3000/api/health', (res) => {
    console.log(`[Keep-Alive] Ping sent. Status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error(`[Keep-Alive] Ping failed: ${err.message}`);
  });
}

setInterval(ping, INTERVAL);
console.log('[Keep-Alive] Service started.');
