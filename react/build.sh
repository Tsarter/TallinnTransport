#!/bin/bash
# Production build script for React app
# This script ensures the correct Node.js version is used via nvm

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use the installed Node.js LTS version
nvm use default

# Build for production
npm run build
