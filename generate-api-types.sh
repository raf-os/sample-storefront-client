#!/bin/bash

set -e

export NODE_TLS_REJECT_UNAUTHORIZED=0

API_URL="${API_URL:-https://localhost:7244/openapi/v1.json}"

OUTPUT_FILE="${OUTPUT_FILE:-./src/api/schema.ts}"

TIMEOUT="${TIMEOUT:-10}"

echo "Generating TypeScript types..."
echo "URL: $API_URL"
echo "OUTPUT: $OUTPUT_FILE"
echo ""

OUTPUT_DIR=$(dirname "$OUTPUT_FILE")
if [ ! -d "$OUTPUT_DIR" ]; then
    mkdir -p "$OUTPUT_DIR"
fi

if [[ "$API_URL" == http* ]]; then
    echo "Checking if API is reachable..."
    if ! curl -f -s -m "$TIMEOUT" -k "$API_URL" > /dev/null; then
        echo -e "WARNING: Could not reach API at $API_URL"
        echo ""
    else
        echo -e "SUCCESS: Api is running."
        echo ""
    fi
fi

if npx openapi-typescript "$API_URL" -o "$OUTPUT_FILE"; then
    echo ""
    echo -e "SUCCESS: Types generated at $OUTPUT_FILE"
else
    echo ""
    echo -e "ERROR: Failed to generate types."
    exit 1
fi