# Claude Figma MCP

A Model Context Protocol (MCP) server that enables Claude to create and manipulate designs in Figma through a Figma plugin.

## Overview

This project consists of two main components:

1. **MCP Server**: A server that implements the Model Context Protocol, allowing Claude to communicate with Figma
2. **Figma Plugin**: A Figma plugin that listens for commands from the MCP server and executes them in Figma

## Installation

### Running the server quickly with NPM

You can run the server quickly without installing or building the repo using NPM:

```bash
npx claude-figma-mcp
```

### Running the server from local source

1. Clone this repository
2. Install dependencies with `npm install`
3. Build the TypeScript code with `npm run build`
4. Run the server with `npm start`

### JSON config for Claude Desktop

Add the following to your Claude Desktop configuration file:

```json
{
  "mcpServers": {
    "figma-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "claude-figma-mcp",
        "--stdio"
      ]
    }
  }
}
```

## Setting up the Figma Plugin

1. Open Figma and go to Menu → Plugins → Development → Import plugin from manifest...
2. Select the `figma-plugin/manifest.json` file from this repository
3. The plugin should now be available in your Figma plugins menu

## Usage

1. Start the MCP server using one of the methods above
2. Open Figma and run the Claude MCP Integration plugin
3. Click "Connect to MCP Server" in the plugin UI
4. In Claude, use the Figma MCP tool to interact with Figma

## Available Tools

The MCP server provides the following tools:

- `create_project`: Create a new Figma project
- `create_frame`: Create a new frame/artboard
- `create_rectangle`: Create a rectangle element
- `create_text`: Create a text element
- `create_component`: Create pre-defined UI components (buttons, inputs, etc.)
- `create_layout`: Create common layout patterns (headers, footers, etc.)
- `create_interaction`: Create interactive prototyping connections between elements
- `export_frame`: Export a frame as an image

## Example Claude Prompts

Here are some examples of how to interact with the MCP server through Claude:

### Creating a Simple UI

```
Can you create a login screen in Figma? It should have a logo at the top, email and password input fields, and a login button.
```

### Creating a More Complex Layout

```
I need a dashboard layout in Figma with a header, sidebar navigation, and a main content area with 4 card components showing different statistics.
```

### Creating an Interactive Prototype

```
Please create a simple app flow in Figma with three screens: Home, Profile, and Settings. Then connect them with interactions so I can click between the screens.
```

## Configuration

The server can be configured using environment variables or command-line arguments:

### Environment Variables

- `PORT`: HTTP server port (default: 3000)
- `WEBSOCKET_PORT`: WebSocket server port for Figma plugin communication (default: 8080)
- `FIGMA_API_KEY`: Figma API key (optional, only if using Figma API directly)

### Command Line Arguments

- `--port`: HTTP server port
- `--websocket-port`: WebSocket server port
- `--figma-api-key`: Figma API key
- `--stdio`: Run in stdio mode (for Claude Desktop integration)

## Troubleshooting

### "WebSocket is not available in this environment"

The Figma plugin environment doesn't support WebSockets. The plugin automatically falls back to an HTTP-based communication method.

### Plugin Can't Connect to Server

Make sure:
1. The MCP server is running
2. The ports aren't blocked by a firewall
3. The WebSocket port (default: 8080) matches in both server config and plugin

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
