#!/bin/bash

# Make the launcher script executable
chmod +x launch-mcp.sh

echo "Made launch-mcp.sh executable."
echo "You can now use this configuration in Claude Desktop:"
echo ""
echo "{
  \"mcpServers\": {
    \"figma-mcp\": {
      \"command\": \"$(pwd)/launch-mcp.sh\",
      \"cwd\": \"$(pwd)\"
    }
  }
}"
echo ""
echo "Or, alternatively:"
echo ""
echo "{
  \"mcpServers\": {
    \"figma-mcp\": {
      \"command\": \"/bin/bash\",
      \"args\": [
        \"$(pwd)/launch-mcp.sh\"
      ]
    }
  }
}"
