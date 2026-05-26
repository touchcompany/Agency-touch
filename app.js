// app.js
// Entry point for cPanel Node.js (Phusion Passenger) application

// Set environment variables if not set by Passenger/cPanel
process.env.PORT = process.env.PORT || 3000;
process.env.HOSTNAME = process.env.HOSTNAME || 'localhost';
process.env.NODE_ENV = 'production';

console.log(`Starting Next.js standalone server on host: ${process.env.HOSTNAME}, port: ${process.env.PORT}...`);

const fs = require('fs');
const path = require('path');

// Smart resolution: works both locally (project root) and on cPanel (flat standalone folder)
let serverPath = path.join(__dirname, 'server.js');
if (!fs.existsSync(serverPath)) {
  serverPath = path.join(__dirname, '.next', 'standalone', 'server.js');
}

console.log(`Loading server from: ${serverPath}`);

try {
  require(serverPath);
} catch (error) {
  console.error('Failed to load Next.js standalone server:', error);
  process.exit(1);
}
