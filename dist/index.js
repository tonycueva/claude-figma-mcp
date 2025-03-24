#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
const stdio_1 = require("@modelcontextprotocol/sdk/server/stdio");
const server_1 = require("./server");
const config_1 = require("./config");
const path_1 = require("path");
const dotenv_1 = require("dotenv");
// Load .env from the current working directory
(0, dotenv_1.config)({ path: (0, path_1.resolve)(process.cwd(), ".env") });
async function startServer() {
    // Check if we're running in stdio mode (e.g., via CLI)
    const isStdioMode = process.env.NODE_ENV === "cli" || process.argv.includes("--stdio");
    const serverConfig = (0, config_1.getServerConfig)(isStdioMode);
    const server = new server_1.FigmaMcpServer(serverConfig);
    if (isStdioMode) {
        const transport = new stdio_1.StdioServerTransport();
        await server.connect(transport);
        console.log("Figma MCP Server started in stdio mode");
    }
    else {
        console.log(`Initializing Figma MCP Server in HTTP mode on port ${serverConfig.port}...`);
        await server.startHttpServer(serverConfig.port);
    }
}
startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map