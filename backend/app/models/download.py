from typing import Optional
from pydantic import BaseModel, Field


class DownloadRequest(BaseModel):
    url: str
    type: str = Field(default="video", description="video or audio")
    quality: str = Field(default="best", description="e.g. best, 2160, 1440, 1080, 720, 480, 360 or 320, 256, 192, 128")
    format: str = Field(default="mp4", description="mp4, webm, mkv, mp3, m4a, opus, wav")
    save_path: Optional[str] = None
    filename_template: Optional[str] = "%(title)s.%(ext)s"
    subtitle_lang: Optional[str] = None # None, en, th, orig, all
    embed_subtitle: bool = False
    embed_thumbnail: bool = False
    embed_metadata: bool = True


class ProgressEvent(BaseModel):
    download_id: str
    status: str # queued, analyzing, downloading, processing, merging, converting, completed, failed, cancelled
    progress: float = 0.0 # 0.0 to 100.0
    speed: Optional[float] = None # bytes per second
    speed_string: Optional[str] = None # e.g. "12.5 MB/s"
    eta: Optional[int] = None # seconds
    eta_string: Optional[str] = None # e.g. "00:04"
    downloaded_bytes: Optional[int] = None
    total_bytes: Optional[int] = None
    file_path: Optional[str] = None
    filename: Optional[str] = None
    error_message: Optional[str] = None


class DownloadRecord(BaseModel):
    id: str
    video_id: str
    url: str
    title: str
    channel: str
    thumbnail: str
    format: str
    quality: str
    file_path: str
    file_size: Optional[int] = None
    status: str
    created_at: str
    completed_at: Optional[str] = None
    error_message: Optional[str] = None
