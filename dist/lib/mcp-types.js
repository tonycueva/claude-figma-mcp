"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPServer = exports.MCPCapability = exports.MCPResource = exports.MCPFunction = void 0;
class MCPFunction {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.parameters = config.parameters;
        this.returns = config.returns;
        this.run = config.run;
    }
}
exports.MCPFunction = MCPFunction;
class MCPResource {
    constructor(config) {
        this.functions = [];
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
    }
    addFunction(func) {
        this.functions.push(func);
    }
}
exports.MCPResource = MCPResource;
class MCPCapability {
    constructor(config) {
        this.resources = [];
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
    }
    addResource(resource) {
        this.resources.push(resource);
    }
}
exports.MCPCapability = MCPCapability;
class MCPServer {
    constructor(config) {
        this.capabilities = [];
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.version = config.version;
        this.vendor = config.vendor;
    }
    addCapability(capability) {
        this.capabilities.push(capability);
    }
    async listen(port) {
        // In a real implementation, this would start an HTTP server
        console.log(`MCP Server ${this.name} started on port ${port}`);
        return Promise.resolve();
    }
}
exports.MCPServer = MCPServer;
//# sourceMappingURL=mcp-types.js.map