#!/bin/bash

# Script to fix the MCP server issues

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Make our scripts executable
chmod +x direct-start.js
chmod +x simple-mcp-server.js

# Reinstall dependencies if needed
if [ ! -d "node_modules/@modelcontextprotocol" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Rebuild the project if needed
if [ ! -d "dist" ]; then
  echo "Building project..."
  npm run build
fi

echo "✅ Fix completed!"
echo ""
echo "Use one of these Claude Desktop configurations:"
echo ""
echo "OPTION 1 - Direct start (recommended):"
echo "{
  \"mcpServers\": {
    \"figma-mcp\": {
      \"command\": \"node\",
      \"args\": [
        \"$SCRIPT_DIR/direct-start.js\"
      ]
    }
  }
}"
echo ""
echo "OPTION 2 - Simple MCP server:"
echo "{
  \"mcpServers\": {
    \"figma-mcp\": {
      \"command\": \"node\",
      \"args\": [
        \"$SCRIPT_DIR/simple-mcp-server.js\"
      ]
    }
  }
}"
echo ""
echo "To test manually, run:"
echo "node $SCRIPT_DIR/direct-start.js"
echo ""
