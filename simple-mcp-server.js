#!/usr/bin/env node

/**
 * Simple MCP Server for Figma
 * 
 * This is a simplified version of the server that doesn't rely on external imports
 * It directly connects via stdin/stdout for use with Claude Desktop
 */

// Log important info at startup
console.error(`
==== Simple MCP Server for Figma ====
Time: ${new Date().toISOString()}
Node version: ${process.version}
CWD: ${process.cwd()}
==================================
`);

// Setup error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

// Simple MCP server that directly uses stdin/stdout
class SimpleMcpServer {
  constructor() {
    this.messageId = 0;
    
    // Set up stdin/stdout handling
    process.stdin.on('data', this.handleStdinData.bind(this));
    process.stdin.on('end', () => console.error('stdin stream ended'));
    process.stdin.on('error', (err) => console.error('stdin error:', err));
    
    process.stdout.on('error', (err) => console.error('stdout error:', err));
    
    console.error('SimpleMcpServer initialized');
  }
  
  // Process incoming data from stdin
  handleStdinData(data) {
    try {
      // Split by newlines in case multiple messages are sent together
      const lines = data.toString().split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        const message = JSON.parse(line);
        this.handleMessage(message);
      }
    } catch (err) {
      console.error('Error handling stdin data:', err);
    }
  }
  
  // Handle JSON-RPC messages
  handleMessage(message) {
    console.error(`Received message: ${JSON.stringify(message)}`);
    
    // If it's an initialization message, respond with success
    if (message.method === 'initialize') {
      this.sendResponse(message.id, {
        protocolVersion: "2024-11-05",
        serverInfo: {
          name: "figma-mcp",
          version: "1.0.0"
        },
        capabilities: {
          tools: {}
        }
      });
      
      // After initialization, register the tools
      setTimeout(() => this.registerTools(), 0);
    }
  }
  
  // Register Figma tools with Claude
  registerTools() {
    console.error('Registering tools...');
    
    // Register create_frame tool as an example
    this.sendMessage('registerTools', {
      tools: [
        {
          name: "create_frame",
          description: "Create a new frame/artboard in Figma",
          parameters: {
            type: "object",
            required: ["name"],
            properties: {
              name: {
                type: "string",
                description: "Name of the frame"
              },
              width: {
                type: "number",
                description: "Width of the frame in pixels"
              },
              height: {
                type: "number",
                description: "Height of the frame in pixels"
              },
              type: {
                type: "string", 
                enum: ["Desktop", "Mobile", "Tablet", "Custom"],
                description: "Type of frame"
              }
            }
          }
        },
        // Add more tool definitions here as needed
      ]
    });
  }
  
  // Send JSON-RPC response
  sendResponse(id, result) {
    const response = {
      jsonrpc: "2.0",
      id,
      result
    };
    
    this.sendJsonMessage(response);
  }
  
  // Send JSON-RPC request
  sendMessage(method, params) {
    const id = this.messageId++;
    
    const request = {
      jsonrpc: "2.0",
      id,
      method,
      params
    };
    
    this.sendJsonMessage(request);
    return id;
  }
  
  // Send a JSON message to stdout
  sendJsonMessage(message) {
    try {
      const json = JSON.stringify(message);
      process.stdout.write(json + '\n');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  }
}

// Create and start the server
const server = new SimpleMcpServer();
console.error('Server ready');
