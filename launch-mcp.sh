#!/bin/bash

# This script sets up and runs the Claude-Figma MCP server in stdio mode
# It should be executed from the project root directory

# Get the absolute path to the project directory
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "Project directory: $PROJECT_DIR"

# Navigate to the project directory
cd "$PROJECT_DIR"

# Display current directory for debugging
echo "Current working directory: $(pwd)"

# Check if the dist directory exists, if not, build the project
if [ ! -d "$PROJECT_DIR/dist" ]; then
  echo "Building project..."
  npm install
  npm run build
fi

# Check if the build succeeded
if [ ! -f "$PROJECT_DIR/dist/index.js" ]; then
  echo "Error: Build failed. dist/index.js not found."
  exit 1
fi

# Run the server in stdio mode directly, with debugging information
echo "Launching MCP server in stdio mode..."
NODE_ENV=cli node "$PROJECT_DIR/dist/index.js" --stdio
