"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.figmaConfig = void 0;
// Figma API configuration
exports.figmaConfig = {
    // Personal access token for the Figma API (optional)
    // Get your personal access token from https://www.figma.com/developers/api#access-tokens
    personalAccessToken: process.env.FIGMA_PERSONAL_ACCESS_TOKEN || '',
    // OAuth configuration (optional)
    // For OAuth, you need to register your app at https://www.figma.com/developers/api#oauth2
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
//# sourceMappingURL=config.js.map