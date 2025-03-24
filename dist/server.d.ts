import { Transport } from "@modelcontextprotocol/sdk/shared/transport";
import { ServerConfig } from "./config";
export declare const Logger: {
    log: (...args: any[]) => void;
    error: (...args: any[]) => void;
};
export declare class FigmaMcpServer {
    private readonly server;
    private sseTransport;
    private wss;
    private figmaConnection;
    private responseHandlers;
    private readonly config;
    constructor(config: ServerConfig);
    private registerTools;
    private sendToFigma;
    private setupWebSocketServer;
    connect(transport: Transport): Promise<void>;
    startHttpServer(port: number): Promise<void>;
}
