"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FigmaMcpServer = exports.Logger = void 0;
const mcp_1 = require("@modelcontextprotocol/sdk/server/mcp");
const zod_1 = require("zod");
const express_1 = __importDefault(require("express"));
const sse_1 = require("@modelcontextprotocol/sdk/server/sse");
const ws_1 = require("ws");
exports.Logger = {
    log: (...args) => {
        console.log(...args);
    },
    error: (...args) => {
        console.error(...args);
    },
};
class FigmaMcpServer {
    constructor(config) {
        this.sseTransport = null;
        this.wss = null;
        this.figmaConnection = null;
        this.responseHandlers = {};
        this.config = config;
        this.server = new mcp_1.McpServer({
            name: "Claude Figma MCP Server",
            version: "1.0.0",
        }, {
            capabilities: {
                logging: {},
                tools: {},
            },
        });
        this.registerTools();
    }
    registerTools() {
        // Register project management tool
        this.server.tool("create_project", "Create a new Figma project", {
            name: zod_1.z.string().describe("Name of the project"),
            description: zod_1.z.string().optional().describe("Project description"),
        }, async ({ name, description }) => {
            try {
                exports.Logger.log(`Creating new project: ${name}`);
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
            }
            catch (error) {
                exports.Logger.error(`Error creating project:`, error);
                return {
                    isError: true,
                    content: [{ type: "text", text: `Error creating project: ${error}` }],
                };
            }
        });
        // Register frame creation tool
        this.server.tool("create_frame", "Create a new frame/artboard in Figma", {
            name: zod_1.z.string().describe("Name of the frame"),
            width: zod_1.z.number().optional().describe("Width of the frame in pixels"),
            height: zod_1.z.number().optional().describe("Height of the frame in pixels"),
            type: zod_1.z.enum(["Desktop", "Mobile", "Tablet", "Custom"]).optional().describe("Type of frame"),
        }, async ({ name, width, height, type = "Desktop" }) => {
            try {
                // Set default dimensions based on frame type
                let frameDimensions = { width: width || 1440, height: height || 900 };
                if (type === "Mobile") {
                    frameDimensions = { width: width || 375, height: height || 812 };
                }
                else if (type === "Tablet") {
                    frameDimensions = { width: width || 768, height: height || 1024 };
                }
                exports.Logger.log(`Creating new ${type} frame: ${name} (${frameDimensions.width}x${frameDimensions.height})`);
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
            }
            catch (error) {
                exports.Logger.error(`Error creating frame:`, error);
                return {
                    isError: true,
                    content: [{ type: "text", text: `Error creating frame: ${error}` }],
                };
            }
        });
        // Register rectangle creation tool
        this.server.tool("create_rectangle", "Create a rectangle element", {
            x: zod_1.z.number().describe("X position"),
            y: zod_1.z.number().describe("Y position"),
            width: zod_1.z.number().describe("Width in pixels"),
            height: zod_1.z.number().describe("Height in pixels"),
            fillColor: zod_1.z.string().optional().describe("Fill color (hex)"),
            cornerRadius: zod_1.z.number().optional().describe("Corner radius"),
            name: zod_1.z.string().optional().describe("Name of the element"),
        }, async ({ x, y, width, height, fillColor, cornerRadius, name }) => {
            try {
                exports.Logger.log(`Creating rectangle at (${x}, ${y}) with dimensions ${width}x${height}`);
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
            }
            catch (error) {
                exports.Logger.error(`Error creating rectangle:`, error);
                return {
                    isError: true,
                    content: [{ type: "text", text: `Error creating rectangle: ${error}` }],
                };
            }
        });
        // Register text creation tool
        this.server.tool("create_text", "Create a text element", {
            x: zod_1.z.number().describe("X position"),
            y: zod_1.z.number().describe("Y position"),
            text: zod_1.z.string().describe("Text content"),
            fontSize: zod_1.z.number().optional().describe("Font size"),
            fontName: zod_1.z.string().optional().describe("Font name"),
            color: zod_1.z.string().optional().describe("Text color (hex)"),
            name: zod_1.z.string().optional().describe("Name of the element"),
        }, async ({ x, y, text, fontSize, fontName, color, name }) => {
            try {
                exports.Logger.log(`Creating text "${text}" at (${x}, ${y})`);
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
            }
            catch (error) {
                exports.Logger.error(`Error creating text:`, error);
                return {
                    isError: true,
                    content: [{ type: "text", text: `Error creating text: ${error}` }],
                };
            }
        });
        // Register component creation tool
        this.server.tool("create_component", "Create a pre-defined UI component like button, input field, etc.", {
            type: zod_1.z.enum(["Button", "Input", "Checkbox", "Radio", "Dropdown", "Toggle", "Tab", "Card"])
                .describe("Component type"),
            x: zod_1.z.number().describe("X position"),
            y: zod_1.z.number().describe("Y position"),
            width: zod_1.z.number().optional().describe("Width in pixels"),
            height: zod_1.z.number().optional().describe("Height in pixels"),
            text: zod_1.z.string().optional().describe("Text content (if applicable)"),
            variant: zod_1.z.string().optional().describe("Component variant (e.g., primary, secondary)"),
            name: zod_1.z.string().optional().describe("Name of the component"),
        }, async ({ type, x, y, width, height, text, variant, name }) => {
            try {
                // Set default dimensions based on component type
                let componentDimensions = { width: width || 120, height: height || 40 };
                if (type === "Input") {
                    componentDimensions = { width: width || 240, height: height || 40 };
                }
                else if (type === "Card") {
                    componentDimensions = { width: width || 320, height: height || 200 };
                }
                exports.Logger.log(`Creating ${type} component at (${x}, ${y})`);
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
            }
            catch (error) {
                exports.Logger.error(`Error creating component:`, error);
                return {
                    isError: true,
                    content: [{ type: "text", text: `Error creating component: ${error}` }],
                };
            }
        });
        // Register layout creation tool
        this.server.tool("create_layout", "Create a pre-defined layout pattern", {
            type: zod_1.z.enum(["Header", "Footer", "Sidebar", "Grid", "Form", "Hero"])
                .describe("Layout type"),
            x: zod_1.z.number().optional().describe("X position"),
            y: zod_1.z.number().optional().describe("Y position"),
            width: zod_1.z.number().optional().describe("Width in pixels"),
            height: zod_1.z.number().optional().describe("Height in pixels"),
            name: zod_1.z.string().optional().describe("Name of the layout"),
        }, async ({ type, x = 0, y = 0, width, height, name }) => {
            try {
                exports.Logger.log(`Creating ${type} layout`);
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
            }
            catch (error) {
                exports.Logger.error(`Error creating layout:`, error);
                return {
                    isError: true,
                    content: [{ type: "text", text: `Error creating layout: ${error}` }],
                };
            }
        });
        // Register interaction creation tool
        this.server.tool("create_interaction", "Create an interaction/link between elements for prototyping", {
            sourceId: zod_1.z.string().describe("ID of the source element"),
            targetId: zod_1.z.string().describe("ID of the target frame/element"),
            trigger: zod_1.z.enum(["On Click", "On Hover", "On Press", "On Drag"])
                .optional()
                .describe("Interaction trigger"),
            transition: zod_1.z.enum(["Instant", "Dissolve", "Smart Animate", "Push", "Slide In", "Slide Out"])
                .optional()
                .describe("Transition type"),
        }, async ({ sourceId, targetId, trigger = "On Click", transition = "Smart Animate" }) => {
            try {
                exports.Logger.log(`Creating interaction from ${sourceId} to ${targetId}`);
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
            }
            catch (error) {
                exports.Logger.error(`Error creating interaction:`, error);
                return {
                    isError: true,
                    content: [{ type: "text", text: `Error creating interaction: ${error}` }],
                };
            }
        });
        // Register export frame tool
        this.server.tool("export_frame", "Export a frame as an image", {
            frameId: zod_1.z.string().optional().describe("ID of the frame to export (use current frame if not provided)"),
            format: zod_1.z.enum(["PNG", "JPG", "SVG", "PDF"]).optional().describe("Export format"),
            scale: zod_1.z.number().optional().describe("Export scale"),
        }, async ({ frameId, format = "PNG", scale = 1 }) => {
            try {
                exports.Logger.log(`Exporting frame ${frameId || 'current'} as ${format}`);
                let result;
                if (frameId) {
                    result = await this.sendToFigma('exportFrame', {
                        frameId,
                        format,
                        scale
                    });
                }
                else {
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
            }
            catch (error) {
                exports.Logger.error(`Error exporting frame:`, error);
                return {
                    isError: true,
                    content: [{ type: "text", text: `Error exporting frame: ${error}` }],
                };
            }
        });
    }
    async sendToFigma(command, params) {
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
    setupWebSocketServer() {
        // Set up WebSocket server to communicate with the Figma plugin
        this.wss = new ws_1.WebSocketServer({ port: this.config.websocketPort });
        exports.Logger.log(`WebSocket server started on port ${this.config.websocketPort}`);
        this.wss.on('connection', (ws) => {
            exports.Logger.log('Figma plugin connected');
            this.figmaConnection = ws;
            ws.on('message', (message) => {
                try {
                    // Convert message to string if it's not already
                    const messageStr = message instanceof Buffer ? message.toString() : message.toString();
                    const response = JSON.parse(messageStr);
                    exports.Logger.log('Received from Figma plugin:', response);
                    // Handle responses from the Figma plugin
                    if (this.responseHandlers[response.id]) {
                        this.responseHandlers[response.id](response);
                        delete this.responseHandlers[response.id];
                    }
                }
                catch (err) {
                    const error = err;
                    exports.Logger.error('Error parsing message from Figma plugin:', error.message);
                }
            });
            ws.on('close', () => {
                exports.Logger.log('Figma plugin disconnected');
                this.figmaConnection = null;
            });
        });
    }
    async connect(transport) {
        await this.server.connect(transport);
        this.setupWebSocketServer();
        exports.Logger.log = (...args) => {
            this.server.server.sendLoggingMessage({
                level: "info",
                data: args,
            });
        };
        exports.Logger.error = (...args) => {
            this.server.server.sendLoggingMessage({
                level: "error",
                data: args,
            });
        };
        exports.Logger.log("Server connected and ready to process requests");
    }
    async startHttpServer(port) {
        const app = (0, express_1.default)();
        this.setupWebSocketServer();
        app.get("/sse", async (req, res) => {
            console.log("New SSE connection established");
            this.sseTransport = new sse_1.SSEServerTransport("/messages", res);
            await this.server.connect(this.sseTransport);
        });
        app.post("/messages", async (req, res) => {
            if (!this.sseTransport) {
                res.sendStatus(400);
                return;
            }
            await this.sseTransport.handlePostMessage(req, res);
        });
        exports.Logger.log = console.log;
        exports.Logger.error = console.error;
        app.listen(port, () => {
            exports.Logger.log(`MCP Server Figma Wireframe MCP Server started on port ${port}`);
            exports.Logger.log(`SSE endpoint available at http://localhost:${port}/sse`);
            exports.Logger.log(`Message endpoint available at http://localhost:${port}/messages`);
        });
    }
}
exports.FigmaMcpServer = FigmaMcpServer;
//# sourceMappingURL=server.js.map