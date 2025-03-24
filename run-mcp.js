#!/usr/bin/env node

// This script provides a more reliable way for Claude Desktop to start your MCP server
const { spawn } = require('child_process');
const path = require('path');

// Get the directory where this script is located
const scriptDir = __dirname;
console.error(`Running from directory: ${scriptDir}`);

// Run the start:cli npm script
const npmProcess = spawn('npm', ['run', 'start:cli'], {
  cwd: scriptDir,
  stdio: ['inherit', 'inherit', 'inherit'] // Pass stdio/stderr/stdin through
});

npmProcess.on('error', (err) => {
  console.error('Failed to start npm process:', err);
  process.exit(1);
});

process.on('SIGINT', () => {
  npmProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  npmProcess.kill('SIGTERM');
});
