import os
from typing import Optional
from pydantic import BaseModel, Field


def get_default_download_folder() -> str:
    home = os.path.expanduser("~")
    download_dir = os.path.join(home, "Downloads", "YouTube")
    return download_dir


class AppSettings(BaseModel):
    default_folder: str = Field(default_factory=get_default_download_folder)
    default_video_quality: str = "best"
    default_video_format: str = "mp4"
    default_audio_quality: str = "best"
    default_audio_format: str = "mp3"
    concurrent_downloads: int = 2
    embed_metadata: bool = True
    embed_thumbnail: bool = False
    clipboard_detection: bool = False
    filename_template: str = "%(title)s.%(ext)s"
    ffmpeg_path: str = "/opt/homebrew/bin/ffmpeg"
    ytdlp_path: str = "yt-dlp"
    theme: str = "system"
