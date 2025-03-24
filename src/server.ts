import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { z } from "zod";
import express, { Request, Response } from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse";
import { IncomingMessage, ServerResponse } from "http";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport";
import { WebSocket, WebSocketServer } from "ws";
import { ServerConfig } from "./config";

export const Logger = {
  log: (...args: any[]) => {
    console.log(...args);
  },
  error: (...args: any[]) => {
    console.error(...args);
  },
};

export class FigmaMcpServer {
  private readonly server: McpServer;
  private sseTransport: SSEServerTransport | null = null;
  private wss: WebSocketServer | null = null;
  private figmaConnection: WebSocket | null = null;
  private responseHandlers: Record<string, (response: any) => void> = {};
  private readonly config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;
    this.server = new McpServer(
      {
        name: "Claude Figma MCP Server",
        version: "1.0.0",
      },
      {
        capabilities: {
          logging: {},
          tools: {},
        },
      },
    );

    this.registerTools();
  }

  private registerTools(): void {
    // Register project management tool
    this.server.tool(
      "create_project",
      "Create a new Figma project",
      {
        name: z.string().describe("Name of the project"),
        description: z.string().optional().describe("Project description"),
      },
      async ({ name, description }) => {
        try {
          Logger.log(`Creating new project: ${name}`);
          
          const result = await this.sendToFigma('createProject', { name, description });
          
          return {
            content: [
              { 
                type: "text", 
                text: JSON.stringify({
                  projectId: result.projectId,
                  name: name,
                  success: true
                }) 
              }
            ],
          };
        } catch (error) {
          Logger.error(`Error creating project:`, error);
          return {
            isError: true,
            content: [{ type: "text", text: `Error creating project: ${error}` }],
          };
        }
      },
    );

    // Register frame creation tool
    this.server.tool(
      "create_frame",
      "Create a new frame/artboard in Figma",
      {
        name: z.string().describe("Name of the frame"),
        width: z.number().optional().describe("Width of the frame in pixels"),
        height: z.number().optional().describe("Height of the frame in pixels"),
        type: z.enum(["Desktop", "Mobile", "Tablet", "Custom"]).optional().describe("Type of frame"),
      },
      async ({ name, width, height, type = "Desktop" }) => {
        try {
          // Set default dimensions based on frame type
          let frameDimensions = { width: width || 1440, height: height || 900 };
          if (type === "Mobile") {
            frameDimensions = { width: width || 375, height: height || 812 };
          } else if (type === "Tablet") {
            frameDimensions = { width: width || 768, height: height || 1024 };
          }

          Logger.log(`Creating new ${type} frame: ${name} (${frameDimensions.width}x${frameDimensions.height})`);
          
          const result = await this.sendToFigma('createFrame', {
            name,
            width: frameDimensions.width,
            height: frameDimensions.height,
            type
          });
          
          return {
            content: [
              { 
                type: "text", 
                text: JSON.stringify({
                  frameId: result.frameId,
                  name: name,
                  width: frameDimensions.width,
                  height: frameDimensions.height,
                  success: true
                }) 
              }
            ],
          };
        } catch (error) {
          Logger.error(`Error creating frame:`, error);
          return {
            isError: true,
            content: [{ type: "text", text: `Error creating frame: ${error}` }],
          };
        }
      },
    );

    // Register rectangle creation tool
    this.server.tool(
      "create_rectangle",
      "Create a rectangle element",
      {
        x: z.number().describe("X position"),
        y: z.number().describe("Y position"),
        width: z.number().describe("Width in pixels"),
        height: z.number().describe("Height in pixels"),
        fillColor: z.string().optional().describe("Fill color (hex)"),
        cornerRadius: z.number().optional().describe("Corner radius"),
        name: z.string().optional().describe("Name of the element"),
      },
      async ({ x, y, width, height, fillColor, cornerRadius, name }) => {
        try {
          Logger.log(`Creating rectangle at (${x}, ${y}) with dimensions ${width}x${height}`);
          
          const result = await this.sendToFigma('createRectangle', {
            x,
            y,
            width,
            height,
            fillColor: fillColor || '#FFFFFF',
            cornerRadius: cornerRadius || 0,
            name: name || 'Rectangle'
          });
          
          return {
            content: [
              { 
                type: "text", 
                text: JSON.stringify({
                  nodeId: result.nodeId,
                  success: true
                }) 
              }
            ],
          };
        } catch (error) {
          Logger.error(`Error creating rectangle:`, error);
          return {
            isError: true,
            content: [{ type: "text", text: `Error creating rectangle: ${error}` }],
          };
        }
      },
    );

    // Register text creation tool
    this.server.tool(
      "create_text",
      "Create a text element",
      {
        x: z.number().describe("X position"),
        y: z.number().describe("Y position"),
        text: z.string().describe("Text content"),
        fontSize: z.number().optional().describe("Font size"),
        fontName: z.string().optional().describe("Font name"),
        color: z.string().optional().describe("Text color (hex)"),
        name: z.string().optional().describe("Name of the element"),
      },
      async ({ x, y, text, fontSize, fontName, color, name }) => {
        try {
          Logger.log(`Creating text "${text}" at (${x}, ${y})`);
          
          const result = await this.sendToFigma('createText', {
            x,
            y,
            text,
            fontSize: fontSize || 16,
            fontName: fontName || 'Inter',
            color: color || '#000000',
            name: name || 'Text'
          });
          
          return {
            content: [
              { 
                type: "text", 
                text: JSON.stringify({
                  nodeId: result.nodeId,
                  success: true
                }) 
              }
            ],
          };
        } catch (error) {
          Logger.error(`Error creating text:`, error);
          return {
            isError: true,
            content: [{ type: "text", text: `Error creating text: ${error}` }],
          };
        }
      },
    );

    // Register component creation tool
    this.server.tool(
      "create_component",
      "Create a pre-defined UI component like button, input field, etc.",
      {
        type: z.enum(["Button", "Input", "Checkbox", "Radio", "Dropdown", "Toggle", "Tab", "Card"])
          .describe("Component type"),
        x: z.number().describe("X position"),
        y: z.number().describe("Y position"),
        width: z.number().optional().describe("Width in pixels"),
        height: z.number().optional().describe("Height in pixels"),
        text: z.string().optional().describe("Text content (if applicable)"),
        variant: z.string().optional().describe("Component variant (e.g., primary, secondary)"),
        name: z.string().optional().describe("Name of the component"),
      },
      async ({ type, x, y, width, height, text, variant, name }) => {
        try {
          // Set default dimensions based on component type
          let componentDimensions = { width: width || 120, height: height || 40 };
          if (type === "Input") {
            componentDimensions = { width: width || 240, height: height || 40 };
          } else if (type === "Card") {
            componentDimensions = { width: width || 320, height: height || 200 };
          }

          Logger.log(`Creating ${type} component at (${x}, ${y})`);
          
          const result = await this.sendToFigma('createComponent', {
            type,
            x,
            y,
            width: componentDimensions.width,
            height: componentDimensions.height,
            text: text || (type === 'Button' ? 'Button' : ''),
            variant: variant || 'primary',
            name: name || type
          });
          
          return {
            content: [
              { 
                type: "text", 
                text: JSON.stringify({
                  nodeId: result.nodeId,
                  success: true
                }) 
              }
            ],
          };
        } catch (error) {
          Logger.error(`Error creating component:`, error);
          return {
            isError: true,
            content: [{ type: "text", text: `Error creating component: ${error}` }],
          };
        }
      },
    );

    // Register layout creation tool
    this.server.tool(
      "create_layout",
      "Create a pre-defined layout pattern",
      {
        type: z.enum(["Header", "Footer", "Sidebar", "Grid", "Form", "Hero"])
          .describe("Layout type"),
        x: z.number().optional().describe("X position"),
        y: z.number().optional().describe("Y position"),
        width: z.number().optional().describe("Width in pixels"),
        height: z.number().optional().describe("Height in pixels"),
        name: z.string().optional().describe("Name of the layout"),
      },
      async ({ type, x = 0, y = 0, width, height, name }) => {
        try {
          Logger.log(`Creating ${type} layout`);
          
          const result = await this.sendToFigma('createLayout', {
            type,
            x,
            y,
            width,
            height,
            name: name || type
          });
          
          return {
            content: [
              { 
                type: "text", 
                text: JSON.stringify({
                  groupId: result.groupId,
                  elementIds: result.elementIds || [],
                  success: true
                }) 
              }
            ],
          };
        } catch (error) {
          Logger.error(`Error creating layout:`, error);
          return {
            isError: true,
            content: [{ type: "text", text: `Error creating layout: ${error}` }],
          };
        }
      },
    );

    // Register interaction creation tool
    this.server.tool(
      "create_interaction",
      "Create an interaction/link between elements for prototyping",
      {
        sourceId: z.string().describe("ID of the source element"),
        targetId: z.string().describe("ID of the target frame/element"),
        trigger: z.enum(["On Click", "On Hover", "On Press", "On Drag"])
          .optional()
          .describe("Interaction trigger"),
        transition: z.enum(["Instant", "Dissolve", "Smart Animate", "Push", "Slide In", "Slide Out"])
          .optional()
          .describe("Transition type"),
      },
      async ({ sourceId, targetId, trigger = "On Click", transition = "Smart Animate" }) => {
        try {
          Logger.log(`Creating interaction from ${sourceId} to ${targetId}`);
          
          const result = await this.sendToFigma('createInteraction', {
            sourceId,
            targetId,
            trigger,
            transition
          });
          
          return {
            content: [
              { 
                type: "text", 
                text: JSON.stringify({
                  success: true
                }) 
              }
            ],
          };
        } catch (error) {
          Logger.error(`Error creating interaction:`, error);
          return {
            isError: true,
            content: [{ type: "text", text: `Error creating interaction: ${error}` }],
          };
        }
      },
    );

    // Register export frame tool
    this.server.tool(
      "export_frame",
      "Export a frame as an image",
      {
        frameId: z.string().optional().describe("ID of the frame to export (use current frame if not provided)"),
        format: z.enum(["PNG", "JPG", "SVG", "PDF"]).optional().describe("Export format"),
        scale: z.number().optional().describe("Export scale"),
      },
      async ({ frameId, format = "PNG", scale = 1 }) => {
        try {
          Logger.log(`Exporting frame ${frameId || 'current'} as ${format}`);
          
          let result;
          if (frameId) {
            result = await this.sendToFigma('exportFrame', {
              frameId,
              format,
              scale
            });
          } else {
            result = await this.sendToFigma('exportCurrentFrame', {
              format,
              scale
            });
          }
          
          return {
            content: [
              { 
                type: "text", 
                text: JSON.stringify({
                  success: true,
                  exportUrl: result.exportUrl
                }) 
              }
            ],
          };
        } catch (error) {
          Logger.error(`Error exporting frame:`, error);
          return {
            isError: true,
            content: [{ type: "text", text: `Error exporting frame: ${error}` }],
          };
        }
      },
    );
  }

  private async sendToFigma(command: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.figmaConnection) {
        reject(new Error('No active connection to Figma plugin'));
        return;
      }
      
      const id = Math.random().toString(36).substring(2, 15);
      this.responseHandlers[id] = resolve;
      
      this.figmaConnection.send(JSON.stringify({
        id,
        command,
        params
      }));
      
      // Set a timeout in case Figma plugin doesn't respond
      setTimeout(() => {
        if (this.responseHandlers[id]) {
          delete this.responseHandlers[id];
          reject(new Error('Timeout waiting for Figma plugin response'));
        }
      }, 10000);
    });
  }

  private setupWebSocketServer(): void {
    // Set up WebSocket server to communicate with the Figma plugin
    this.wss = new WebSocketServer({ port: this.config.websocketPort });
    Logger.log(`WebSocket server started on port ${this.config.websocketPort}`);

    this.wss.on('connection', (ws) => {
      Logger.log('Figma plugin connected');
      this.figmaConnection = ws;
      
      ws.on('message', (message) => {
        try {
          // Convert message to string if it's not already
          const messageStr = message instanceof Buffer ? message.toString() : message.toString();
          const response = JSON.parse(messageStr);
          Logger.log('Received from Figma plugin:', response);
          
          // Handle responses from the Figma plugin
          if (this.responseHandlers[response.id]) {
            this.responseHandlers[response.id](response);
            delete this.responseHandlers[response.id];
          }
        } catch (err) {
          const error = err as Error;
          Logger.error('Error parsing message from Figma plugin:', error.message);
        }
      });
      
      ws.on('close', () => {
        Logger.log('Figma plugin disconnected');
        this.figmaConnection = null;
      });
    });
  }

  async connect(transport: Transport): Promise<void> {
    await this.server.connect(transport);
    this.setupWebSocketServer();

    Logger.log = (...args: any[]) => {
      this.server.server.sendLoggingMessage({
        level: "info",
        data: args,
      });
    };
    Logger.error = (...args: any[]) => {
      this.server.server.sendLoggingMessage({
        level: "error",
        data: args,
      });
    };

    Logger.log("Server connected and ready to process requests");
  }

  async startHttpServer(port: number): Promise<void> {
    const app = express();

    this.setupWebSocketServer();

    app.get("/sse", async (req: Request, res: Response) => {
      console.log("New SSE connection established");
      this.sseTransport = new SSEServerTransport(
        "/messages",
        res as unknown as ServerResponse<IncomingMessage>,
      );
      await this.server.connect(this.sseTransport);
    });

    app.post("/messages", async (req: Request, res: Response) => {
      if (!this.sseTransport) {
        res.sendStatus(400);
        return;
      }
      await this.sseTransport.handlePostMessage(
        req as unknown as IncomingMessage,
        res as unknown as ServerResponse<IncomingMessage>,
      );
    });

    Logger.log = console.log;
    Logger.error = console.error;

    app.listen(port, () => {
      Logger.log(`MCP Server Figma Wireframe MCP Server started on port ${port}`);
      Logger.log(`SSE endpoint available at http://localhost:${port}/sse`);
      Logger.log(`Message endpoint available at http://localhost:${port}/messages`);
    });
  }
}
