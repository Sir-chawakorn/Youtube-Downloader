import os
import shutil
import platform
import subprocess
import yt_dlp
from typing import Dict, Any, List
from fastapi import APIRouter
from pydantic import BaseModel

from ..services.ffmpeg_service import ffmpeg_service
from ..services.database import db_service
from ..utils.filesystem import check_disk_space

router = APIRouter(prefix="/api/system", tags=["system"])


class SystemStatusResponse(BaseModel):
    ytdlp_installed: bool
    ytdlp_version: str
    ffmpeg_installed: bool
    ffmpeg_path: str
    ffmpeg_version: str
    download_folder: str
    download_folder_writable: bool
    disk_free_bytes: int
    disk_free_gb: float
    os_name: str


class CommonFolder(BaseModel):
    name: str
    path: str


class CommonFoldersResponse(BaseModel):
    folders: List[CommonFolder]


@router.get("/status", response_model=SystemStatusResponse)
async def get_system_status():
    settings = db_service.get_settings()
    ffmpeg_info = ffmpeg_service.check_installed()

    # yt-dlp version
    try:
        ytdlp_version = getattr(yt_dlp, "version", None)
        if hasattr(ytdlp_version, "__version__"):
            ytdlp_version_str = ytdlp_version.__version__
        else:
            ytdlp_version_str = "Installed"
    except Exception:
        ytdlp_version_str = "Installed"

    folder = os.path.expanduser(settings.default_folder)
    writable = False
    try:
        os.makedirs(folder, exist_ok=True)
        writable = os.access(folder, os.W_OK)
    except Exception:
        writable = False

    _, free_bytes, _ = check_disk_space(folder)
    free_gb = round(free_bytes / (1024 ** 3), 2)

    return SystemStatusResponse(
        ytdlp_installed=True,
        ytdlp_version=ytdlp_version_str,
        ffmpeg_installed=ffmpeg_info["installed"],
        ffmpeg_path=ffmpeg_info["path"],
        ffmpeg_version=ffmpeg_info["version_info"],
        download_folder=folder,
        download_folder_writable=writable,
        disk_free_bytes=free_bytes,
        disk_free_gb=free_gb,
        os_name=f"{platform.system()} {platform.release()}",
    )


@router.get("/common-folders", response_model=CommonFoldersResponse)
async def get_common_folders():
    home = os.path.expanduser("~")
    candidates = [
        ("Downloads / YouTube", os.path.join(home, "Downloads", "YouTube")),
        ("Downloads", os.path.join(home, "Downloads")),
        ("Desktop", os.path.join(home, "Desktop")),
        ("Movies", os.path.join(home, "Movies")),
        ("Music", os.path.join(home, "Music")),
        ("Documents", os.path.join(home, "Documents")),
    ]

    result = []
    for name, path in candidates:
        result.append(CommonFolder(name=name, path=path))
    return CommonFoldersResponse(folders=result)


@router.post("/pick-folder")
async def pick_folder():
    """
    On macOS, launches native AppleScript folder picker dialog.
    """
    if platform.system() == "Darwin":
        script = 'POSIX path of (choose folder with prompt "Select download destination folder:")'
        try:
            res = subprocess.run(
                ["osascript", "-e", script],
                capture_output=True,
                text=True,
                check=False,
                timeout=30,
            )
            if res.returncode == 0 and res.stdout.strip():
                selected_path = res.stdout.strip().rstrip("/")
                return {"success": True, "path": selected_path}
        except Exception:
            pass

    # Fallback to current settings default folder
    settings = db_service.get_settings()
    return {"success": False, "path": settings.default_folder}
