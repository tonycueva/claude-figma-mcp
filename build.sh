#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Switch to that directory
cd "$SCRIPT_DIR"

# Make our scripts executable
chmod +x run-mcp.js
chmod +x run-mcp-cli.sh

# Install dependencies and build
npm install
npm run build

# Show success message and instructions
echo ""
echo "Build completed. Update your Claude Desktop configuration to:"
echo ""
echo "{
  \"mcpServers\": {
    \"figma-mcp\": {
      \"command\": \"bash\",
      \"args\": [
        \"run-mcp-cli.sh\"
      ],
      \"cwd\": \"$SCRIPT_DIR\"
    }
  }
}"
echo ""
echo "Or alternatively:"
echo ""
echo "{
  \"mcpServers\": {
    \"figma-mcp\": {
      \"command\": \"node\",
      \"args\": [
        \"dist/index.js\",
        \"--stdio\"
      ],
      \"cwd\": \"$SCRIPT_DIR\"
    }
  }
}"
