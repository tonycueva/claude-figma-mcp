declare class SimpleMcpServer {
  constructor();
  private messageId: number;
  private handleStdinData(data: Buffer): void;
  private handleMessage(message: any): void;
  private registerTools(): void;
  private sendResponse(id: string | number, result: any): void;
  private sendMessage(method: string, params: any): number;
  private sendJsonMessage(message: any): void;
}

export = SimpleMcpServer;
