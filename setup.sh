#!/bin/bash

# Make the script executable
chmod +x run-mcp.js

# Show instructions
echo "Script made executable. Update your Claude Desktop configuration to use:"
echo ""
echo "{
  \"mcpServers\": {
    \"figma-mcp\": {
      \"command\": \"node\",
      \"args\": [
        \"run-mcp.js\"
      ],
      \"cwd\": \"$(pwd)\"
    }
  }
}"
echo ""
echo "Run this setup script with: bash setup.sh"
