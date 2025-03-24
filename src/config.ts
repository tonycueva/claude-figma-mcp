// src/config.ts
import * as yargs from "yargs";
import * as fs from "fs";
import * as path from "path";

export interface ServerConfig {
  figmaApiKey: string;
  port: number;
  websocketPort: number;
}

export function getServerConfig(isStdioMode: boolean): ServerConfig {
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
  } catch (err) {
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
    figmaApiKey: args['figma-api-key'] as string || process.env.FIGMA_API_KEY || "",
    port: args.port as number,
    websocketPort: args['websocket-port'] as number,
  };
  
  console.error(`Server configuration: port=${config.port}, websocketPort=${config.websocketPort}, figmaApiKey=${config.figmaApiKey ? 'set' : 'not set'}`);
  
  return config;
}
