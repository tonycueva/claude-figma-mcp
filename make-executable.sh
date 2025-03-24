#!/bin/bash

# Make all scripts executable
chmod +x launch-mcp.sh
chmod +x setup-executable.sh
chmod +x figma-mcp-bridge.js

echo "All scripts are now executable."
echo ""
echo "=== RECOMMENDED CLAUDE DESKTOP CONFIGURATION ==="
echo ""
echo "{
  \"mcpServers\": {
    \"figma-mcp\": {
      \"command\": \"node\",
      \"args\": [
        \"$(pwd)/figma-mcp-bridge.js\"
      ]
    }
  }
}"
echo ""
echo "Run the following to build and prepare:"
echo ""
echo "cd $(pwd)"
echo "npm install"
echo "npm run build"
echo "bash make-executable.sh"
echo ""
