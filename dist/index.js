#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
const stdio_1 = require("@modelcontextprotocol/sdk/server/stdio");
const server_1 = require("./server");
const config_1 = require("./config");
const path_1 = require("path");
const dotenv_1 = require("dotenv");
const fs_1 = require("fs");
const path = __importStar(require("path"));
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
if ((0, fs_1.existsSync)(packageJsonPath)) {
    console.error(`✅ Found package.json at: ${packageJsonPath}`);
}
else {
    console.error(`❌ Cannot find package.json at: ${packageJsonPath}`);
    console.error(`This may indicate a working directory issue.`);
}
// Load .env from the current working directory
const envPath = (0, path_1.resolve)(process.cwd(), ".env");
if ((0, fs_1.existsSync)(envPath)) {
    console.error(`✅ Loading environment variables from ${envPath}`);
    (0, dotenv_1.config)({ path: envPath });
}
else {
    console.error(`⚠️ No .env file found at ${envPath}, using default settings`);
}
async function startServer() {
    try {
        // Check if we're running in stdio mode (e.g., via CLI)
        const isStdioMode = process.env.NODE_ENV === "cli" || process.argv.includes("--stdio");
        console.error(`🚀 Starting Figma MCP Server in ${isStdioMode ? 'STDIO' : 'HTTP'} mode`);
        // Get server config
        const serverConfig = (0, config_1.getServerConfig)(isStdioMode);
        console.error(`✅ Server configuration loaded successfully`);
        // Create server instance
        const server = new server_1.FigmaMcpServer(serverConfig);
        console.error(`✅ Figma MCP Server instance created`);
        if (isStdioMode) {
            console.error(`🔄 Initializing STDIO transport for Claude Desktop integration`);
            const transport = new stdio_1.StdioServerTransport();
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
        }
        else {
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
    }
    catch (error) {
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
//# sourceMappingURL=index.js.map