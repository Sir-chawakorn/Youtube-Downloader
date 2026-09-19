from typing import List, Optional
from pydantic import BaseModel, Field


class SubtitleTrack(BaseModel):
    lang: str
    name: str
    ext: str = "vtt"


class VideoMetadata(BaseModel):
    id: str
    url: str
    title: str
    channel: str
    channel_url: Optional[str] = None
    duration: int = 0
    duration_string: str = "00:00"
    thumbnail: str = ""
    description: Optional[str] = None
    upload_date: Optional[str] = None
    view_count: Optional[int] = None
    max_resolution: int = 1080
    available_resolutions: List[int] = Field(default_factory=list)
    available_video_formats: List[str] = Field(default_factory=lambda: ["mp4", "webm", "mkv"])
    available_audio_formats: List[str] = Field(default_factory=lambda: ["mp3", "m4a", "opus", "wav"])
    subtitles: List[SubtitleTrack] = Field(default_factory=list)
    is_live: bool = False
