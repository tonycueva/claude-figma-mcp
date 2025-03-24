export interface MCPFunctionDefinition {
    id: string;
    name: string;
    description: string;
    parameters: any;
    returns: any;
    run: (params: any) => Promise<any>;
}
export declare class MCPFunction {
    id: string;
    name: string;
    description: string;
    parameters: any;
    returns: any;
    run: (params: any) => Promise<any>;
    constructor(config: MCPFunctionDefinition);
}
export declare class MCPResource {
    id: string;
    name: string;
    description: string;
    functions: MCPFunction[];
    constructor(config: {
        id: string;
        name: string;
        description: string;
    });
    addFunction(func: MCPFunction): void;
}
export declare class MCPCapability {
    id: string;
    name: string;
    description: string;
    resources: MCPResource[];
    constructor(config: {
        id: string;
        name: string;
        description: string;
    });
    addResource(resource: MCPResource): void;
}
export interface MCPServerConfig {
    id: string;
    name: string;
    description: string;
    version: string;
    vendor?: string;
}
export declare class MCPServer {
    id: string;
    name: string;
    description: string;
    version: string;
    vendor?: string;
    capabilities: MCPCapability[];
    constructor(config: MCPServerConfig);
    addCapability(capability: MCPCapability): void;
    listen(port: number): Promise<void>;
}
