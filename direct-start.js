#!/usr/bin/env node

/**
 * Direct MCP Server Launcher
 * This script directly imports and uses the StdioServerTransport
 * without relying on dynamic imports that might fail
 */

// Setup process management
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

// Use try-catch for the entire script
try {
  const path = require('path');
  const fs = require('fs');
  
  // Log environment information
  console.error(`Starting Direct Launcher`);
  console.error(`Node.js: ${process.version}`);
  console.error(`Working directory: ${process.cwd()}`);
  console.error(`Script path: ${__filename}`);
  
  // Ensure we're in the project directory
  const projectDir = path.dirname(__filename);
  process.chdir(projectDir);
  console.error(`Changed to project directory: ${projectDir}`);
  
  // Verify key files exist
  const distIndexPath = path.join(projectDir, 'dist', 'index.js');
  if (!fs.existsSync(distIndexPath)) {
    console.error(`ERROR: ${distIndexPath} does not exist. Run 'npm run build' first.`);
    process.exit(1);
  }
  
  // Check for node_modules
  const sdkPath = path.join(projectDir, 'node_modules', '@modelcontextprotocol', 'sdk');
  if (!fs.existsSync(sdkPath)) {
    console.error(`ERROR: SDK modules not found at ${sdkPath}. Run 'npm install' first.`);
    process.exit(1);
  }
  
  // Instead of importing the server directly, which might have path resolution issues,
  // simply spawn a child process to run the server with the right environment
  const { spawn } = require('child_process');
  const env = Object.assign({}, process.env, { NODE_ENV: 'cli' });
  
  // Spawn the server process passing the stdio flag
  const serverProcess = spawn(
    process.execPath, // This is the current node executable
    [distIndexPath, '--stdio'],
    {
      env,
      stdio: 'inherit', // Inherit all stdio from parent
      cwd: projectDir
    }
  );
  
  serverProcess.on('error', (err) => {
    console.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  });
  
  serverProcess.on('exit', (code, signal) => {
    console.error(`Server exited with code ${code} and signal ${signal}`);
    process.exit(code || 0);
  });
  
  // Keep the parent process alive until the child exits
  console.error('MCP server started successfully');
} catch (error) {
  console.error('ERROR in launcher script:', error);
  process.exit(1);
}
