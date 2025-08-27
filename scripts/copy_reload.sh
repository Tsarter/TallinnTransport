#!/bin/bash

# Define source and destination directories
SOURCE_DIR="/home/tanel/Documents/public_transport_project/iaib/Visualizer/"
DEST_DIR="/var/www/web_server/"

# Copy files from source to destination
if [ -d "$SOURCE_DIR" ]; then
    sudo rsync -av --delete "$SOURCE_DIR"* "$DEST_DIR"
    echo "Files copied from $SOURCE_DIR to $DEST_DIR"
    sudo systemctl reload nginx
    echo "Nginx reloaded."
else
    echo "Source directory does not exist."
fi
