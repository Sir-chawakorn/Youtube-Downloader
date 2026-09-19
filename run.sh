#!/bin/bash
set -e

echo "=========================================="
echo "🎬 Local YouTube Downloader — Starting..."
echo "=========================================="

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 1. Check FFmpeg
if command -v ffmpeg >/dev/null 2>&1; then
    echo "✓ FFmpeg found: $(which ffmpeg)"
else
    echo "⚠️  FFmpeg not found! Please install FFmpeg (e.g. brew install ffmpeg)"
fi

# 2. Check Python venv
if [ ! -d "venv" ]; then
    echo "⚙️ Creating Python virtual environment..."
    python3 -m venv venv
    ./venv/bin/pip install -r backend/requirements.txt
fi

# 3. Start Backend
echo "🚀 Starting FastAPI Backend at http://127.0.0.1:8000..."
./venv/bin/python backend/run_backend.py &
BACKEND_PID=$!

# 4. Check Frontend dependencies
if [ ! -d "frontend/node_modules" ]; then
    echo "⚙️ Installing Frontend npm packages..."
    (cd frontend && npm install)
fi

# Trap signals to stop backend when script exits
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

echo "🚀 Starting Next.js Frontend at http://localhost:3000..."
(sleep 2 && open "http://localhost:3000" 2>/dev/null || true) &
(cd frontend && npm run dev)
