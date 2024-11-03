#!/bin/bash

# Folder path
FOLDER_PATH="/home/tanel/Documents/public_transport_project/HardDrive/data/transport_data"

# Webhook URL
WEBHOOK_URL="https://discord.com/api/webhooks/1258765586167758870/WgUJ-wPgZMFXnspyBDNdZQBGg7GVeBwjI0EsBM_Ofe8tJPVvj3qEzOq4gbCeuBrDRw6I"

# Get the size of the folder
FOLDER_SIZE=$(du -sh "$FOLDER_PATH" | cut -f1)

# Create the message payload
PAYLOAD=$(printf '{"content": "The size of the folder %s is %s"}' "$FOLDER_PATH" "$FOLDER_SIZE")

# Send the message via the webhook
curl -X POST -H "Content-Type: application/json" -d "$PAYLOAD" "$WEBHOOK_URL"
