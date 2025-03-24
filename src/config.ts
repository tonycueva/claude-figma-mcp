import { parse } from "yargs";

export interface ServerConfig {
  figmaApiKey: string;
  port: number;
  websocketPort: number;
}

export function getServerConfig(isStdioMode: boolean): ServerConfig {
  const args = parse(process.argv.slice(2), {
    string: ["figma-api-key"],
    number: ["port", "websocket-port"],
    alias: {
      p: "port",
      w: "websocket-port",
    },
    default: {
      port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
      "websocket-port": process.env.WEBSOCKET_PORT ? parseInt(process.env.WEBSOCKET_PORT) : 8080,
    },
  });

  return {
    figmaApiKey: args["figma-api-key"] || process.env.FIGMA_API_KEY || "",
    port: args.port as number,
    websocketPort: args["websocket-port"] as number,
  };
}
