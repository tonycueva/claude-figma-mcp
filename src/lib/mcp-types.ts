// src/lib/mcp-types.ts
import * as WebSocket from 'ws';

// Define proper interfaces for MCP components
export interface MCPFunctionDefinition {
  id: string;
  name: string;
  description: string;
  parameters: any;
  returns: any;
  run: (params: any) => Promise<any>;
}

export class MCPFunction {
  id: string;
  name: string;
  description: string;
  parameters: any;
  returns: any;
  run: (params: any) => Promise<any>;
  
  constructor(config: MCPFunctionDefinition) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.parameters = config.parameters;
    this.returns = config.returns;
    this.run = config.run;
  }
}

export class MCPResource {
  id: string;
  name: string;
  description: string;
  functions: MCPFunction[] = [];
  
  constructor(config: {
    id: string;
    name: string;
    description: string;
  }) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
  }
  
  addFunction(func: MCPFunction) {
    this.functions.push(func);
  }
}

export class MCPCapability {
  id: string;
  name: string;
  description: string;
  resources: MCPResource[] = [];
  
  constructor(config: {
    id: string;
    name: string;
    description: string;
  }) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
  }
  
  addResource(resource: MCPResource) {
    this.resources.push(resource);
  }
}

export interface MCPServerConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  // Make vendor optional
  vendor?: string;
}

export class MCPServer {
  id: string;
  name: string;
  description: string;
  version: string;
  vendor?: string;
  capabilities: MCPCapability[] = [];
  
  constructor(config: MCPServerConfig) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.version = config.version;
    this.vendor = config.vendor;
  }
  
  addCapability(capability: MCPCapability) {
    this.capabilities.push(capability);
  }
  
  async listen(port: number): Promise<void> {
    // In a real implementation, this would start an HTTP server
    console.log(`MCP Server ${this.name} started on port ${port}`);
    return Promise.resolve();
  }
}