# Claude Figma MCP

A Model Context Protocol (MCP) server that enables Claude to create and manipulate designs in Figma through either a Figma plugin or directly via the Figma API.

## Overview

This project offers two approaches for Claude to interact with Figma:

1. **Plugin Approach**: Uses a Figma plugin to execute commands in Figma's UI
   - Allows creating and manipulating designs from scratch
   - Requires running the Figma plugin in the Figma application

2. **API Approach**: Uses the Figma REST API directly
   - Allows retrieving and exporting existing Figma files
   - Works without opening Figma, but has more limited creation capabilities
   - Requires a Figma API key

## Installation

### Using NPM (Recommended)

Install the package globally:

```bash
npm install -g claude-figma-mcp
```

Or run it directly with npx:

```bash
npx claude-figma-mcp
```

### Running from Local Source

1. Clone this repository
2. Install dependencies with `npm install`
3. Build the TypeScript code with `npm run build`
4. Run the server with `npm start` (HTTP mode) or `npm run start:cli` (STDIO mode)

## Setting Up Claude Desktop Integration

### Standard Approach (NPM Package)

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

### Figma API Approach

If you prefer using the Figma API directly (more reliable but with fewer creation capabilities):

```json
{
  "mcpServers": {
    "figma-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "claude-figma-mcp",
        "--stdio",
        "--figma-api-key",
        "your_figma_api_key_here"
      ]
    }
  }
}
```

### Simplified Server Option

For environments where the standard server has issues, we provide a simplified server:

```json
{
  "mcpServers": {
    "figma-mcp": {
      "command": "node",
      "args": [
        "/path/to/claude-figma-mcp/simple-mcp-server.js"
      ]
    }
  }
}
```

## Setting up the Figma Plugin (Plugin Approach Only)

1. Open Figma and go to Menu → Plugins → Development → Import plugin from manifest...
2. Select the `figma-plugin/manifest.json` file from this repository
3. The plugin should now be available in your Figma plugins menu

## Usage

### Plugin Approach

1. Start the MCP server in HTTP mode
2. Open Figma and run the Claude MCP Integration plugin
3. Click "Connect to MCP Server" in the plugin UI
4. In Claude, use the Figma MCP tool to interact with Figma

### API Approach

1. Start the MCP server with your Figma API key
2. In Claude, use the Figma MCP tool to interact with Figma files
3. No need to open Figma - operations happen directly via the API

## Available Tools

### Plugin Approach Tools

- `create_project`: Create a new Figma project
- `create_frame`: Create a new frame/artboard
- `create_rectangle`: Create a rectangle element
- `create_text`: Create a text element
- `create_component`: Create pre-defined UI components (buttons, inputs, etc.)
- `create_layout`: Create common layout patterns (headers, footers, etc.)
- `create_interaction`: Create interactive prototyping connections between elements
- `export_frame`: Export a frame as an image

### API Approach Tools

- `get_file`: Retrieve information about a Figma file
- `get_file_nodes`: Get specific nodes from a Figma file
- `get_comments`: Retrieve comments from a Figma file
- `post_comment`: Add a comment to a Figma file
- `get_team_components`: List components from a team
- `export_image`: Export a frame or node as an image

## Example Claude Prompts

### Plugin Approach Examples

```
Can you create a login screen in Figma? It should have a logo at the top, email and password input fields, and a login button.
```

```
I need a dashboard layout in Figma with a header, sidebar navigation, and a main content area with 4 card components showing different statistics.
```

### API Approach Examples

```
Show me the contents of my Figma file with ID abcde12345
```

```
Export the frame named 'Homepage' from my Figma file abcde12345 as a PNG
```

## Configuration

The server can be configured using environment variables or command-line arguments:

### Environment Variables

- `PORT`: HTTP server port (default: 3000)
- `WEBSOCKET_PORT`: WebSocket server port for Figma plugin communication (default: 8080)
- `FIGMA_API_KEY`: Figma API key (required for API approach)

### Command Line Arguments

- `--port`: HTTP server port
- `--websocket-port`: WebSocket server port
- `--figma-api-key`: Figma API key
- `--stdio`: Run in stdio mode (for Claude Desktop integration)

## Troubleshooting

### Connection Issues with Claude Desktop

If you have issues with the default server, try the simplified server option:

```bash
node /path/to/claude-figma-mcp/simple-mcp-server.js
```

### Plugin Can't Connect to Server

Make sure:
1. The MCP server is running in HTTP mode
2. The ports aren't blocked by a firewall
3. The WebSocket port (default: 8080) matches in both server config and plugin

### API Key Not Recognized

Ensure your Figma API key is:
1. Valid and has the necessary permissions
2. Correctly set in either the environment variable or command-line argument

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
