export interface ServerConfig {
    figmaApiKey: string;
    port: number;
    websocketPort: number;
}
export declare function getServerConfig(isStdioMode: boolean): ServerConfig;
