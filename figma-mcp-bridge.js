#!/usr/bin/env node

/**
 * Figma MCP Bridge - A self-contained script to launch the Figma MCP server
 * This script doesn't depend on any npm modules and should work reliably
 * when executed directly by Claude Desktop.
 */

const { spawn } = require('child_process');
const { existsSync } = require('fs');
const { join } = require('path');

// Determine the directory where this script is located
const scriptDir = __dirname;
console.error(`Script directory: ${scriptDir}`);

// Check if we have the compiled dist folder
const distIndexPath = join(scriptDir, 'dist', 'index.js');
const hasDist = existsSync(distIndexPath);

if (!hasDist) {
  console.error(`Error: Could not find compiled code at ${distIndexPath}`);
  console.error('Please run "npm run build" first and try again.');
  process.exit(1);
}

// Log some diagnostic info
console.error('Launching Figma MCP server with:');
console.error(`- Node.js version: ${process.version}`);
console.error(`- Working directory: ${process.cwd()}`);
console.error(`- Script location: ${__filename}`);
console.error(`- Entry point: ${distIndexPath}`);

// Launch the server process with stdio forwarding
const serverProcess = spawn('node', [distIndexPath, '--stdio'], {
  cwd: scriptDir,
  env: {
    ...process.env,
    NODE_ENV: 'cli'
  },
  stdio: ['pipe', 'pipe', 'pipe'] // We'll manually pipe stdin/stdout for more control
});

// Handle process events for better debugging
serverProcess.on('error', (err) => {
  console.error(`Failed to start server process: ${err.message}`);
  process.exit(1);
});

serverProcess.on('exit', (code, signal) => {
  console.error(`Server process exited with code ${code} and signal ${signal}`);
  process.exit(code || 0);
});

// Forward stdio
process.stdin.pipe(serverProcess.stdin);
serverProcess.stdout.pipe(process.stdout);
serverProcess.stderr.on('data', (data) => {
  console.error(`[Server] ${data.toString().trim()}`);
});

// Forward signals
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => {
    console.error(`Received ${signal}, forwarding to server process...`);
    serverProcess.kill(signal);
  });
});

console.error('Bridge script running. All communication is now forwarded to the MCP server.');
