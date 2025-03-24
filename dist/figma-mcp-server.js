"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// figma-mcp-server.ts
const mcp_types_1 = require("./lib/mcp-types");
const WebSocketModule = __importStar(require("ws"));
const figma_config_1 = require("./figma-config");
// Set up WebSocket server to communicate with the Figma plugin
const wss = new WebSocketModule.Server({ port: figma_config_1.figmaConfig.websocket.port });
console.log(`WebSocket server started on port ${figma_config_1.figmaConfig.websocket.port}`);
let figmaConnection = null;
wss.on('connection', (ws) => {
    console.log('Figma plugin connected');
    figmaConnection = ws;
    ws.on('message', (message) => {
        try {
            // Convert message to string if it's not already
            const messageStr = message instanceof Buffer ? message.toString() : message.toString();
            const response = JSON.parse(messageStr);
            console.log('Received from Figma plugin:', response);
            // Handle responses from the Figma plugin
            if (responseHandlers[response.id]) {
                responseHandlers[response.id](response);
                delete responseHandlers[response.id];
            }
        }
        catch (err) {
            const error = err;
            console.error('Error parsing message from Figma plugin:', error.message);
        }
    });
    ws.on('close', () => {
        console.log('Figma plugin disconnected');
        figmaConnection = null;
    });
});
// Store response handlers for async communication with the Figma plugin
const responseHandlers = {};
// Helper function to send commands to the Figma plugin
async function sendToFigma(command, params) {
    return new Promise((resolve, reject) => {
        if (!figmaConnection) {
            reject(new Error('No active connection to Figma plugin'));
            return;
        }
        const id = Math.random().toString(36).substring(2, 15);
        responseHandlers[id] = resolve;
        figmaConnection.send(JSON.stringify({
            id,
            command,
            params
        }));
        // Set a timeout in case Figma plugin doesn't respond
        setTimeout(() => {
            if (responseHandlers[id]) {
                delete responseHandlers[id];
                reject(new Error('Timeout waiting for Figma plugin response'));
            }
        }, 10000);
    });
}
// Create the MCP server
const mcpServer = new mcp_types_1.MCPServer({
    id: 'figma-wireframe-server',
    name: 'Figma Wireframe MCP Server',
    description: 'A Model Context Protocol server for creating wireframes and prototypes in Figma',
    version: '1.0.0',
    vendor: 'Your Organization',
});
// Define MCP capabilities and resources
// Project Management
const projectResource = new mcp_types_1.MCPResource({
    id: 'project',
    name: 'Figma Project',
    description: 'Manage Figma projects and files',
});
projectResource.addFunction(new mcp_types_1.MCPFunction({
    id: 'create-project',
    name: 'Create Project',
    description: 'Create a new Figma project',
    parameters: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                description: 'Name of the project',
            },
            description: {
                type: 'string',
                description: 'Project description',
                optional: true,
            },
        },
        required: ['name'],
    },
    returns: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            success: { type: 'boolean' },
        },
    },
    run: async ({ name, description }) => {
        try {
            const result = await sendToFigma('createProject', { name, description });
            return {
                id: result.projectId,
                name: name,
                success: true
            };
        }
        catch (err) {
            const error = err;
            console.error('Error creating project:', error);
            return {
                id: '',
                name: name,
                success: false,
                error: error.message
            };
        }
    },
}));
// Frame Management
const frameResource = new mcp_types_1.MCPResource({
    id: 'frame',
    name: 'Figma Frame',
    description: 'Manage frames and artboards in Figma',
});
frameResource.addFunction(new mcp_types_1.MCPFunction({
    id: 'create-frame',
    name: 'Create Frame',
    description: 'Create a new frame/artboard in Figma',
    parameters: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                description: 'Name of the frame',
            },
            width: {
                type: 'number',
                description: 'Width of the frame in pixels',
                optional: true,
            },
            height: {
                type: 'number',
                description: 'Height of the frame in pixels',
                optional: true,
            },
            type: {
                type: 'string',
                description: 'Type of frame (Desktop, Mobile, Tablet, Custom)',
                enum: ['Desktop', 'Mobile', 'Tablet', 'Custom'],
                optional: true,
            },
        },
        required: ['name'],
    },
    returns: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            width: { type: 'number' },
            height: { type: 'number' },
            success: { type: 'boolean' },
        },
    },
    run: async ({ name, width, height, type = 'Desktop' }) => {
        try {
            // Set default dimensions based on frame type
            let frameDimensions = { width: width || 1440, height: height || 900 };
            if (type === 'Mobile') {
                frameDimensions = { width: width || 375, height: height || 812 };
            }
            else if (type === 'Tablet') {
                frameDimensions = { width: width || 768, height: height || 1024 };
            }
            const result = await sendToFigma('createFrame', {
                name,
                width: frameDimensions.width,
                height: frameDimensions.height,
                type
            });
            return {
                id: result.frameId,
                name: name,
                width: frameDimensions.width,
                height: frameDimensions.height,
                success: true
            };
        }
        catch (err) {
            const error = err;
            console.error('Error creating frame:', error);
            return {
                id: '',
                name: name,
                width: 0,
                height: 0,
                success: false,
                error: error.message
            };
        }
    },
}));
// UI Elements Management
const elementsResource = new mcp_types_1.MCPResource({
    id: 'elements',
    name: 'UI Elements',
    description: 'Create and manage UI elements in Figma',
});
elementsResource.addFunction(new mcp_types_1.MCPFunction({
    id: 'create-rectangle',
    name: 'Create Rectangle',
    description: 'Create a rectangle element',
    parameters: {
        type: 'object',
        properties: {
            x: {
                type: 'number',
                description: 'X position',
            },
            y: {
                type: 'number',
                description: 'Y position',
            },
            width: {
                type: 'number',
                description: 'Width in pixels',
            },
            height: {
                type: 'number',
                description: 'Height in pixels',
            },
            fillColor: {
                type: 'string',
                description: 'Fill color (hex)',
                optional: true,
            },
            cornerRadius: {
                type: 'number',
                description: 'Corner radius',
                optional: true,
            },
            name: {
                type: 'string',
                description: 'Name of the element',
                optional: true,
            },
        },
        required: ['x', 'y', 'width', 'height'],
    },
    returns: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            success: { type: 'boolean' },
        },
    },
    run: async ({ x, y, width, height, fillColor, cornerRadius, name }) => {
        try {
            const result = await sendToFigma('createRectangle', {
                x,
                y,
                width,
                height,
                fillColor: fillColor || '#FFFFFF',
                cornerRadius: cornerRadius || 0,
                name: name || 'Rectangle'
            });
            return {
                id: result.nodeId,
                success: true
            };
        }
        catch (err) {
            const error = err;
            console.error('Error creating rectangle:', error);
            return {
                id: '',
                success: false,
                error: error.message
            };
        }
    },
}));
elementsResource.addFunction(new mcp_types_1.MCPFunction({
    id: 'create-text',
    name: 'Create Text',
    description: 'Create a text element',
    parameters: {
        type: 'object',
        properties: {
            x: {
                type: 'number',
                description: 'X position',
            },
            y: {
                type: 'number',
                description: 'Y position',
            },
            text: {
                type: 'string',
                description: 'Text content',
            },
            fontSize: {
                type: 'number',
                description: 'Font size',
                optional: true,
            },
            fontName: {
                type: 'string',
                description: 'Font name',
                optional: true,
            },
            color: {
                type: 'string',
                description: 'Text color (hex)',
                optional: true,
            },
            name: {
                type: 'string',
                description: 'Name of the element',
                optional: true,
            },
        },
        required: ['x', 'y', 'text'],
    },
    returns: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            success: { type: 'boolean' },
        },
    },
    run: async ({ x, y, text, fontSize, fontName, color, name }) => {
        try {
            const result = await sendToFigma('createText', {
                x,
                y,
                text,
                fontSize: fontSize || 16,
                fontName: fontName || 'Inter',
                color: color || '#000000',
                name: name || 'Text'
            });
            return {
                id: result.nodeId,
                success: true
            };
        }
        catch (err) {
            const error = err;
            console.error('Error creating text:', error);
            return {
                id: '',
                success: false,
                error: error.message
            };
        }
    },
}));
elementsResource.addFunction(new mcp_types_1.MCPFunction({
    id: 'create-component',
    name: 'Create UI Component',
    description: 'Create a pre-defined UI component like button, input field, etc.',
    parameters: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
                description: 'Component type',
                enum: ['Button', 'Input', 'Checkbox', 'Radio', 'Dropdown', 'Toggle', 'Tab', 'Card'],
            },
            x: {
                type: 'number',
                description: 'X position',
            },
            y: {
                type: 'number',
                description: 'Y position',
            },
            width: {
                type: 'number',
                description: 'Width in pixels',
                optional: true,
            },
            height: {
                type: 'number',
                description: 'Height in pixels',
                optional: true,
            },
            text: {
                type: 'string',
                description: 'Text content (if applicable)',
                optional: true,
            },
            variant: {
                type: 'string',
                description: 'Component variant (e.g., primary, secondary)',
                optional: true,
            },
            name: {
                type: 'string',
                description: 'Name of the component',
                optional: true,
            },
        },
        required: ['type', 'x', 'y'],
    },
    returns: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            success: { type: 'boolean' },
        },
    },
    run: async ({ type, x, y, width, height, text, variant, name }) => {
        try {
            // Set default dimensions based on component type
            let componentDimensions = { width: width || 120, height: height || 40 };
            if (type === 'Input') {
                componentDimensions = { width: width || 240, height: height || 40 };
            }
            else if (type === 'Card') {
                componentDimensions = { width: width || 320, height: height || 200 };
            }
            const result = await sendToFigma('createComponent', {
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
                id: result.nodeId,
                success: true
            };
        }
        catch (err) {
            const error = err;
            console.error('Error creating component:', error);
            return {
                id: '',
                success: false,
                error: error.message
            };
        }
    },
}));
// Layout Management
const layoutResource = new mcp_types_1.MCPResource({
    id: 'layout',
    name: 'Layout',
    description: 'Create common layout patterns in Figma',
});
layoutResource.addFunction(new mcp_types_1.MCPFunction({
    id: 'create-layout',
    name: 'Create Layout',
    description: 'Create a pre-defined layout pattern',
    parameters: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
                description: 'Layout type',
                enum: ['Header', 'Footer', 'Sidebar', 'Grid', 'Form', 'Hero'],
            },
            x: {
                type: 'number',
                description: 'X position',
                optional: true,
            },
            y: {
                type: 'number',
                description: 'Y position',
                optional: true,
            },
            width: {
                type: 'number',
                description: 'Width in pixels',
                optional: true,
            },
            height: {
                type: 'number',
                description: 'Height in pixels',
                optional: true,
            },
            name: {
                type: 'string',
                description: 'Name of the layout',
                optional: true,
            },
        },
        required: ['type'],
    },
    returns: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            success: { type: 'boolean' },
            elements: {
                type: 'array',
                items: { type: 'string' }
            },
        },
    },
    run: async ({ type, x = 0, y = 0, width, height, name }) => {
        try {
            const result = await sendToFigma('createLayout', {
                type,
                x,
                y,
                width,
                height,
                name: name || type
            });
            return {
                id: result.groupId,
                success: true,
                elements: result.elementIds || []
            };
        }
        catch (err) {
            const error = err;
            console.error('Error creating layout:', error);
            return {
                id: '',
                success: false,
                error: error.message,
                elements: []
            };
        }
    },
}));
// Prototype Management
const prototypeResource = new mcp_types_1.MCPResource({
    id: 'prototype',
    name: 'Prototype',
    description: 'Create and manage interactive prototypes',
});
prototypeResource.addFunction(new mcp_types_1.MCPFunction({
    id: 'create-interaction',
    name: 'Create Interaction',
    description: 'Create an interaction/link between elements for prototyping',
    parameters: {
        type: 'object',
        properties: {
            sourceId: {
                type: 'string',
                description: 'ID of the source element',
            },
            targetId: {
                type: 'string',
                description: 'ID of the target frame/element',
            },
            trigger: {
                type: 'string',
                description: 'Interaction trigger',
                enum: ['On Click', 'On Hover', 'On Press', 'On Drag'],
                optional: true,
            },
            transition: {
                type: 'string',
                description: 'Transition type',
                enum: ['Instant', 'Dissolve', 'Smart Animate', 'Push', 'Slide In', 'Slide Out'],
                optional: true,
            },
        },
        required: ['sourceId', 'targetId'],
    },
    returns: {
        type: 'object',
        properties: {
            success: { type: 'boolean' },
        },
    },
    run: async ({ sourceId, targetId, trigger = 'On Click', transition = 'Smart Animate' }) => {
        try {
            const result = await sendToFigma('createInteraction', {
                sourceId,
                targetId,
                trigger,
                transition
            });
            return {
                success: true
            };
        }
        catch (err) {
            const error = err;
            console.error('Error creating interaction:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },
}));
// Export Management
const exportResource = new mcp_types_1.MCPResource({
    id: 'export',
    name: 'Export',
    description: 'Export designs from Figma',
});
exportResource.addFunction(new mcp_types_1.MCPFunction({
    id: 'export-frame',
    name: 'Export Frame',
    description: 'Export a frame as an image',
    parameters: {
        type: 'object',
        properties: {
            frameId: {
                type: 'string',
                description: 'ID of the frame to export',
            },
            format: {
                type: 'string',
                description: 'Export format',
                enum: ['PNG', 'JPG', 'SVG', 'PDF'],
                optional: true,
            },
            scale: {
                type: 'number',
                description: 'Export scale',
                optional: true,
            },
        },
        required: ['frameId'],
    },
    returns: {
        type: 'object',
        properties: {
            success: { type: 'boolean' },
            url: { type: 'string' },
        },
    },
    run: async ({ frameId, format = 'PNG', scale = 1 }) => {
        try {
            const result = await sendToFigma('exportFrame', {
                frameId,
                format,
                scale
            });
            return {
                success: true,
                url: result.exportUrl
            };
        }
        catch (err) {
            const error = err;
            console.error('Error exporting frame:', error);
            return {
                success: false,
                url: '',
                error: error.message
            };
        }
    },
}));
// Natural Language Processing Resource
// This is a higher-level resource that translates natural language commands
// into specific Figma operations using the resources defined above
const nlpResource = new mcp_types_1.MCPResource({
    id: 'nlp',
    name: 'Natural Language Processing',
    description: 'Process natural language commands for Figma wireframing',
});
nlpResource.addFunction(new mcp_types_1.MCPFunction({
    id: 'process-command',
    name: 'Process Natural Language Command',
    description: 'Process a natural language command and execute the corresponding Figma operations',
    parameters: {
        type: 'object',
        properties: {
            command: {
                type: 'string',
                description: 'Natural language command',
            },
        },
        required: ['command'],
    },
    returns: {
        type: 'object',
        properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            actions: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        type: { type: 'string' },
                        id: { type: 'string' }
                    }
                }
            },
        },
    },
    run: async ({ command }) => {
        try {
            // No need for NLP here - Claude has already interpreted the user's request
            // and sent us a structured command. We just need to execute it.
            // Parse the command - this is now a structured command from Claude, not raw user text
            const parsedCommand = typeof command === 'string' ? JSON.parse(command) : command;
            const actions = [];
            // Extract the action type and parameters
            const { action, parameters } = parsedCommand;
            // Execute the appropriate Figma operation based on the action
            switch (action) {
                case 'createProject': {
                    const result = await sendToFigma('createProject', parameters);
                    actions.push({ type: 'create-project', id: result.projectId });
                    return {
                        success: true,
                        message: `Created new project "${parameters.name}"`,
                        actions
                    };
                }
                case 'createFrame': {
                    const result = await sendToFigma('createFrame', parameters);
                    actions.push({ type: 'create-frame', id: result.frameId });
                    return {
                        success: true,
                        message: `Created new ${parameters.type || 'Desktop'} frame "${parameters.name}" (${result.width}x${result.height})`,
                        actions
                    };
                }
                case 'createLayout': {
                    const result = await sendToFigma('createLayout', parameters);
                    actions.push({ type: 'create-layout', id: result.groupId });
                    return {
                        success: true,
                        message: `Created ${parameters.type} layout`,
                        actions
                    };
                }
                case 'createComponent': {
                    const result = await sendToFigma('createComponent', parameters);
                    actions.push({ type: 'create-component', id: result.nodeId });
                    return {
                        success: true,
                        message: `Created ${parameters.type} at position (${parameters.x}, ${parameters.y})${parameters.text ? ' with text "' + parameters.text + '"' : ''}`,
                        actions
                    };
                }
                case 'exportFrame': {
                    const result = await sendToFigma('exportCurrentFrame', parameters);
                    return {
                        success: true,
                        message: `Exported current frame as ${parameters.format || 'PNG'}`,
                        actions: [{ type: 'export', url: result.exportUrl }]
                    };
                }
                case 'generatePrototype': {
                    const result = await sendToFigma('generatePrototype', parameters);
                    return {
                        success: true,
                        message: 'Generated interactive prototype',
                        actions: [{ type: 'prototype', url: result.prototypeUrl }]
                    };
                }
                default:
                    return {
                        success: false,
                        message: `Unknown action: ${action}`,
                        actions: []
                    };
            }
        }
        catch (err) {
            const error = err;
            console.error('Error processing command:', error.message);
            return {
                success: false,
                message: `Error: ${error.message}`,
                actions: []
            };
        }
    }
}));
// Add all resources to the MCP server
const figmaCapability = new mcp_types_1.MCPCapability({
    id: 'figma-wireframing',
    name: 'Figma Wireframing',
    description: 'Create wireframes and prototypes in Figma',
});
figmaCapability.addResource(projectResource);
figmaCapability.addResource(frameResource);
figmaCapability.addResource(elementsResource);
figmaCapability.addResource(layoutResource);
figmaCapability.addResource(prototypeResource);
figmaCapability.addResource(exportResource);
figmaCapability.addResource(nlpResource);
mcpServer.addCapability(figmaCapability);
// Start the MCP server
mcpServer.listen(figma_config_1.figmaConfig.mcpServer.port).then(() => {
    console.log(`Figma MCP Server started on port ${figma_config_1.figmaConfig.mcpServer.port}`);
}).catch((error) => {
    console.error('Failed to start Figma MCP Server:', error);
});
//# sourceMappingURL=figma-mcp-server.js.map