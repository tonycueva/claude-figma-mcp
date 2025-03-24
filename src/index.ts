#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";
import { FigmaMcpServer } from "./server";
import { getServerConfig } from "./config";
import { resolve } from "path";
import { config } from "dotenv";
import { existsSync } from "fs";
import * as path from "path";

// Output key debugging information to stderr so Claude Desktop logs will show it
console.error(`
===========================================================
Claude Figma MCP Server Startup
===========================================================
- Date/Time: ${new Date().toISOString()}
- Node.js version: ${process.version}
- Current directory: ${process.cwd()}
- Command-line args: ${process.argv.join(' ')}
- Environment: NODE_ENV=${process.env.NODE_ENV || 'not set'}
===========================================================
`);

// Check for package.json - this helps debug path issues
const packageJsonPath = path.resolve(process.cwd(), 'package.json');
if (existsSync(packageJsonPath)) {
  console.error(`✅ Found package.json at: ${packageJsonPath}`);
} else {
  console.error(`❌ Cannot find package.json at: ${packageJsonPath}`);
  console.error(`This may indicate a working directory issue.`);
}

// Load .env from the current working directory
const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  console.error(`✅ Loading environment variables from ${envPath}`);
  config({ path: envPath });
} else {
  console.error(`⚠️ No .env file found at ${envPath}, using default settings`);
}

export async function startServer(): Promise<void> {
  try {
    // Check if we're running in stdio mode (e.g., via CLI)
    const isStdioMode = process.env.NODE_ENV === "cli" || process.argv.includes("--stdio");
    console.error(`🚀 Starting Figma MCP Server in ${isStdioMode ? 'STDIO' : 'HTTP'} mode`);
    
    // Get server config
    const serverConfig = getServerConfig(isStdioMode);
    console.error(`✅ Server configuration loaded successfully`);

    // Create server instance
    const server = new FigmaMcpServer(serverConfig);
    console.error(`✅ Figma MCP Server instance created`);

    if (isStdioMode) {
      console.error(`🔄 Initializing STDIO transport for Claude Desktop integration`);
      const transport = new StdioServerTransport();
      // Register a few events to help with debugging
      process.on('exit', () => {
        console.error('Process exit event triggered');
      });
      process.stdout.on('error', (err) => {
        console.error(`Stdout error: ${err.message}`);
      });
      process.stdin.on('error', (err) => {
        console.error(`Stdin error: ${err.message}`);
      });
      
      // Connect the server with the transport
      await server.connect(transport);
      console.error("✅ Figma MCP Server started in stdio mode");
    } else {
      console.error(`🌐 Initializing HTTP server on port ${serverConfig.port}...`);
      await server.startHttpServer(serverConfig.port);
      console.error(`✅ WebSocket server configured on port ${serverConfig.websocketPort}`);
      console.error(`ℹ️ Figma plugin should connect to ws://localhost:${serverConfig.websocketPort}`);
    }
    
    console.error("✅ Server startup complete");
    
    // Keep the process alive in HTTP mode
    if (!isStdioMode) {
      console.error("Server running, press Ctrl+C to stop");
    }
  } catch (error) {
    console.error("❌ Error during server startup:", error);
    // Write to stderr to ensure Claude Desktop sees the error
    console.error(`FATAL ERROR: ${error}`);
    process.exit(1);
  }
}

// Add process error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
});

// Start the server
startServer().catch((error) => {
  console.error("❌ Fatal error starting server:", error);
  process.exit(1);
});
