declare module '@modelcontextprotocol/sdk/server/stdio' {
    export class StdioServerTransport {
      handlePostMessage(req: any, res: any): Promise<void>;
    }
  }
  
  declare module '@modelcontextprotocol/sdk/server/mcp' {
    export class McpServer {
      constructor(info: any, options: any);
      connect(transport: any): Promise<void>;
      tool(name: string, description: string, schema: any, handler: any): void;
      server: {
        sendLoggingMessage(message: any): void;
      };
    }
  }
  
  declare module '@modelcontextprotocol/sdk/server/sse' {
    export class SSEServerTransport {
      constructor(path: string, res: any);
      handlePostMessage(req: any, res: any): Promise<void>;
    }
  }
  
  declare module '@modelcontextprotocol/sdk/shared/transport' {
    export interface Transport {
      handlePostMessage(req: any, res: any): Promise<void>;
    }
  }