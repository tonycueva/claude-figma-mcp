"use strict";
// A compatibility layer for the old figmaConfig structure
// This will be used by figma-mcp-server.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.figmaConfig = void 0;
exports.figmaConfig = {
    // Personal access token for the Figma API (optional)
    personalAccessToken: process.env.FIGMA_PERSONAL_ACCESS_TOKEN || '',
    // OAuth configuration (optional)
    oauth: {
        clientId: process.env.FIGMA_CLIENT_ID || '',
        clientSecret: process.env.FIGMA_CLIENT_SECRET || '',
        redirectUri: process.env.FIGMA_REDIRECT_URI || 'http://localhost:3000/oauth/callback'
    },
    // WebSocket configuration for plugin communication
    websocket: {
        port: process.env.WEBSOCKET_PORT ? parseInt(process.env.WEBSOCKET_PORT) : 8080
    },
    // MCP server configuration
    mcpServer: {
        port: process.env.MCP_SERVER_PORT ? parseInt(process.env.MCP_SERVER_PORT) : 3000
    }
};
//# sourceMappingURL=figma-config.js.map