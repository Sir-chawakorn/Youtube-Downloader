#!/usr/bin/env python3
"""
One-click cross-platform starter for Local YouTube Downloader
Starts FastAPI backend and Next.js frontend concurrently.
"""
import os
import sys
import subprocess
import time
import signal
import webbrowser
from pathlib import Path

ROOT_DIR = Path(__file__).parent.resolve()
VENV_PYTHON = ROOT_DIR / "venv" / ("Scripts/python.exe" if sys.platform == "win32" else "bin/python")
FRONTEND_DIR = ROOT_DIR / "frontend"

def main():
    print("=" * 50)
    print("🎬 Starting Local YouTube Downloader...")
    print("=" * 50)

    # 1. Check Python virtualenv
    python_cmd = str(VENV_PYTHON) if VENV_PYTHON.exists() else sys.executable

    # 2. Launch Backend
    print("[1/2] 🚀 Starting FastAPI Backend on http://127.0.0.1:8000...")
    backend_proc = subprocess.Popen(
        [python_cmd, "backend/run_backend.py"],
        cwd=str(ROOT_DIR),
    )

    # 3. Launch Frontend
    print("[2/2] 🚀 Starting Next.js Frontend on http://localhost:3000...")
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=str(FRONTEND_DIR),
    )

    time.sleep(2.5)
    try:
        webbrowser.open("http://localhost:3000")
    except Exception:
        pass

    print("\n✨ Application is running!")
    print("👉 Frontend: http://localhost:3000")
    print("👉 Backend API: http://127.0.0.1:8000/docs")
    print("\nPress Ctrl+C to terminate both servers.\n")

    def handle_shutdown(signum, frame):
        print("\n🛑 Shutting down servers...")
        try:
            backend_proc.terminate()
            frontend_proc.terminate()
            backend_proc.wait(timeout=3)
            frontend_proc.wait(timeout=3)
        except Exception:
            backend_proc.kill()
            frontend_proc.kill()
        print("Done.")
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_shutdown)
    signal.signal(signal.SIGTERM, handle_shutdown)

    # Keep alive
    while True:
        if backend_proc.poll() is not None or frontend_proc.poll() is not None:
            break
        time.sleep(1)

if __name__ == "__main__":
    main()
