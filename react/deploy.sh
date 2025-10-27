#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Run the build script first
"$SCRIPT_DIR/build.sh"

SOURCE_DIR="$SCRIPT_DIR/dist"
MIDDLE_DIR="$SCRIPT_DIR/../Visualizer/dist"

# Copy files from source to destination
if [ -d "$SOURCE_DIR" ]; then
    sudo rsync -av --delete "$SOURCE_DIR/" "$MIDDLE_DIR" 
    echo "Files copied from $SOURCE_DIR to $MIDDLE_DIR"
else
    echo "Source directory does not exist."
fi

MIDDLE_DIR="$SCRIPT_DIR/../Visualizer/dist"
FINAL_DIR="/var/www/web_server/"

# Copy files from source to destination
if [ -d "$MIDDLE_DIR" ]; then
    sudo rsync -av --delete "$MIDDLE_DIR"* "$FINAL_DIR"
    echo "Files copied from $MIDDLE_DIR to $FINAL_DIR"
    sudo systemctl reload nginx
    echo "Nginx reloaded."
else
    echo "Middle directory does not exist."
fi
