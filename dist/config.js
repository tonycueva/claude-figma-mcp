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
exports.getServerConfig = getServerConfig;
// src/config.ts
const yargs = __importStar(require("yargs"));
function getServerConfig(isStdioMode) {
    // Instead of using parse directly, use yargs().parse() to ensure synchronous parsing
    const args = yargs
        .option('port', {
        alias: 'p',
        type: 'number',
        description: 'HTTP server port',
        default: process.env.PORT ? parseInt(process.env.PORT) : 3000
    })
        .option('websocket-port', {
        alias: 'w',
        type: 'number',
        description: 'WebSocket server port',
        default: process.env.WEBSOCKET_PORT ? parseInt(process.env.WEBSOCKET_PORT) : 8080
    })
        .option('figma-api-key', {
        type: 'string',
        description: 'Figma API key'
    })
        .parseSync(); // Use parseSync instead of parse
    return {
        figmaApiKey: args['figma-api-key'] || process.env.FIGMA_API_KEY || "",
        port: args.port,
        websocketPort: args['websocket-port'],
    };
}
//# sourceMappingURL=config.js.map