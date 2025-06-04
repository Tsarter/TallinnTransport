#!/bin/bash

# Folder path
FOLDER_PATH="/home/tanel/Documents/public_transport_project/HardDrive/data/transport_data"

#FOLDER_PATH2="/home/tanel/Documents/public_transport_project/HardDrive/data/modified_data/2024-08-27"

# Webhook URL
WEBHOOK_URL="https://discord.com/api/webhooks"

# Get the size of the folder
FOLDER_SIZE=$(du -sh "$FOLDER_PATH2cat " | cut -f1)

echo "{\"content\": \"The size of the folder $FOLDER_PATH is $FOLDER_SIZE\"}"


# Create the message payload
PAYLOAD=$(printf '{"content": "The size of the folder %s is %s"}' "$FOLDER_PATH" "$FOLDER_SIZE")

# Send the message via the webhook
curl -X POST -H "Content-Type: application/json" -d "$PAYLOAD" "$WEBHOOK_URL"
