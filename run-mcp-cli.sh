#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Switch to that directory
cd "$SCRIPT_DIR"

# Run the npm script in STDIO mode
NODE_ENV=cli node dist/index.js --stdio
