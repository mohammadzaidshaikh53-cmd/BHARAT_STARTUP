#!/usr/bin/env bash
# Simple build script for Graphify
# This script regenerates the graph.json file in the graphify-out directory.
# It can be customized to run any build steps required for your project.

set -euo pipefail

# Path to the output directory
OUT_DIR="$(dirname "$0")"

# Example: generate a simple graph.json if it doesn't exist
if [ ! -f "$OUT_DIR/graph.json" ]; then
  echo "Generating default graph.json..."
  cat <<EOF > "$OUT_DIR/graph.json"
{
  "nodes": [],
  "links": []
}
EOF
fi

echo "Graphify build completed."
