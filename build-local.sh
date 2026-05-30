#!/usr/bin/env bash
# Local build + dev server
set -e

echo "🔨  Building HTR-United..."
npm run build
echo "✓  Build complete → dist/"
echo ""
echo "🌐  Starting preview server at http://localhost:5173"
npm run preview -- --port 5173
