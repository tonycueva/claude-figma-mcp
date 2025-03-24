// src/config.ts
import * as yargs from "yargs";

export interface ServerConfig {
  figmaApiKey: string;
  port: number;
  websocketPort: number;
}

export function getServerConfig(isStdioMode: boolean): ServerConfig {
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
    figmaApiKey: args['figma-api-key'] as string || process.env.FIGMA_API_KEY || "",
    port: args.port as number,
    websocketPort: args['websocket-port'] as number,
  };
}