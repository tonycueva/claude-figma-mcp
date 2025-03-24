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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function getServerConfig(isStdioMode) {
    // Log the current environment to help with debugging
    console.error(`Environment mode: ${isStdioMode ? 'STDIO' : 'HTTP'}`);
    console.error(`Current working directory: ${process.cwd()}`);
    // Check for package.json to help diagnose path issues
    try {
        const packageJsonPath = path.resolve(process.cwd(), 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            // Read the package.json file to display useful info
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            console.error(`Package name: ${packageJson.name}, version: ${packageJson.version}`);
        }
    }
    catch (err) {
        console.error(`Error checking package.json: ${err}`);
    }
    console.error(`Environment variables: PORT=${process.env.PORT || 'not set'}, WEBSOCKET_PORT=${process.env.WEBSOCKET_PORT || 'not set'}, FIGMA_API_KEY=${process.env.FIGMA_API_KEY ? 'set' : 'not set'}`);
    // Parse command line arguments
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
        .parseSync();
    // Create and log the config
    const config = {
        figmaApiKey: args['figma-api-key'] || process.env.FIGMA_API_KEY || "",
        port: args.port,
        websocketPort: args['websocket-port'],
    };
    console.error(`Server configuration: port=${config.port}, websocketPort=${config.websocketPort}, figmaApiKey=${config.figmaApiKey ? 'set' : 'not set'}`);
    return config;
}
//# sourceMappingURL=config.js.map