#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";
import { FigmaMcpServer } from "./server";
import { getServerConfig } from "./config";
import { resolve } from "path";
import { config } from "dotenv";
import { fileURLToPath } from "url";

// Load .env from the current working directory
config({ path: resolve(process.cwd(), ".env") });

export async function startServer(): Promise<void> {
  // Check if we're running in stdio mode (e.g., via CLI)
  const isStdioMode = process.env.NODE_ENV === "cli" || process.argv.includes("--stdio");

  const serverConfig = getServerConfig(isStdioMode);

  const server = new FigmaMcpServer(serverConfig);

  if (isStdioMode) {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("Figma MCP Server started in stdio mode");
  } else {
    console.log(`Initializing Figma MCP Server in HTTP mode on port ${serverConfig.port}...`);
    await server.startHttpServer(serverConfig.port);
  }
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
