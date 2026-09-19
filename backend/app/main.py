import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.analyze import router as analyze_router
from .api.download import router as download_router
from .api.history import router as history_router
from .api.settings import router as settings_router
from .api.system import router as system_router

from .services.download_service import download_service
from .services.ffmpeg_service import ffmpeg_service
from .utils.filesystem import cleanup_stale_temps


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions (PRD #88)
    loop = asyncio.get_running_loop()
    download_service.set_event_loop(loop)
    cleanup_stale_temps()

    # Preflight check FFmpeg
    ffmpeg_info = ffmpeg_service.check_installed()
    print(f"[Startup] FFmpeg Status: {ffmpeg_info}")

    yield

    # Shutdown actions
    cleanup_stale_temps()


app = FastAPI(
    title="Local YouTube Downloader API",
    description="Local-first YouTube video & audio downloader backend",
    version="1.0.0",
    lifespan=lifespan,
)

import os

# Enable CORS for Next.js frontend, Vercel deployments, Cloudflare tunnels, and local dev
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?:\/\/.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# Register routers
app.include_router(analyze_router)
app.include_router(download_router)
app.include_router(history_router)
app.include_router(settings_router)
app.include_router(system_router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Local YouTube Downloader backend is running"}
