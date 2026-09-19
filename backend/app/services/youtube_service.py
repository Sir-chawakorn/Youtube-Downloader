import os
import json
import shutil
import subprocess
from typing import Dict, Any, List, Optional
from ..models.video import VideoMetadata, SubtitleTrack
from ..utils.validators import is_valid_youtube_url, clean_youtube_url
from ..utils.errors import translate_error


def get_ytdlp_binary_path() -> str:
    """Returns absolute path to yt-dlp binary (prioritizes homebrew updated binary)."""
    brew_path = "/opt/homebrew/bin/yt-dlp"
    if os.path.exists(brew_path) and os.access(brew_path, os.X_OK):
        return brew_path
    
    usr_local = "/usr/local/bin/yt-dlp"
    if os.path.exists(usr_local) and os.access(usr_local, os.X_OK):
        return usr_local

    which_path = shutil.which("yt-dlp")
    if which_path:
        return which_path

    return "yt-dlp"


def format_duration(seconds: Optional[int]) -> str:
    """Format duration into HH:MM:SS or MM:SS."""
    if not seconds or seconds < 0:
        return "00:00"
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    return f"{minutes:02d}:{secs:02d}"


class YouTubeService:
    def __init__(self, cookies_from_browser: Optional[str] = None):
        self.cookies_from_browser = cookies_from_browser

    def analyze_url(self, url: str) -> VideoMetadata:
        cleaned_url = clean_youtube_url(url)
        if not is_valid_youtube_url(cleaned_url):
            raise ValueError("URL ไม่ถูกต้อง กรุณาระบุลิงก์ YouTube ที่ถูกต้อง เช่น https://www.youtube.com/watch?v=... หรือ https://youtu.be/...")

        ytdlp_bin = get_ytdlp_binary_path()
        cmd = [
            ytdlp_bin,
            "--dump-single-json",
            "--no-playlist",
            "--no-warnings",
            "--skip-download",
        ]

        if self.cookies_from_browser:
            cmd.extend(["--cookies-from-browser", self.cookies_from_browser])

        cmd.append(cleaned_url)

        try:
            res = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=False,
                timeout=25,
            )

            if res.returncode != 0:
                raw_err = res.stderr or res.stdout or "Failed to extract video information"
                raise RuntimeError(translate_error(raw_err))

            info = json.loads(res.stdout)
            if not info:
                raise ValueError("ไม่สามารถดึงข้อมูลวิดีโอได้ กรุณาตรวจสอบ URL อีกครั้ง")

            # Check if it's currently live
            is_live = bool(info.get("is_live", False) or info.get("live_status") == "is_live")

            video_id = info.get("id", "")
            title = info.get("title", "Unknown Title")
            channel = info.get("uploader") or info.get("channel") or "Unknown Channel"
            channel_url = info.get("uploader_url") or info.get("channel_url")
            duration = info.get("duration") or 0
            thumbnail = info.get("thumbnail") or ""
            description = info.get("description")
            if description and len(description) > 300:
                description = description[:300] + "..."

            upload_date = info.get("upload_date")
            view_count = info.get("view_count")

            # Inspect formats to find real available resolutions (PRD #13)
            formats = info.get("formats") or []
            resolutions_set = set()
            for fmt in formats:
                height = fmt.get("height")
                vcodec = fmt.get("vcodec")
                if height and vcodec and vcodec != "none":
                    resolutions_set.add(int(height))

            standard_resolutions = [2160, 1440, 1080, 720, 480, 360, 240, 144]
            available_resolutions = []
            for res_val in standard_resolutions:
                if res_val in resolutions_set:
                    available_resolutions.append(res_val)
                else:
                    matching = [h for h in resolutions_set if abs(h - res_val) <= 20]
                    if matching and res_val not in available_resolutions:
                        available_resolutions.append(res_val)

            if not available_resolutions and resolutions_set:
                available_resolutions = sorted(list(resolutions_set), reverse=True)

            max_res = max(resolutions_set) if resolutions_set else 1080

            # Extract subtitle tracks
            subtitles: List[SubtitleTrack] = []
            sub_dict = info.get("subtitles") or {}
            auto_sub_dict = info.get("automatic_captions") or {}

            seen_langs = set()
            for lang_code, sub_list in sub_dict.items():
                name = lang_code.upper()
                if lang_code == "en":
                    name = "English"
                elif lang_code == "th":
                    name = "Thai"
                subtitles.append(SubtitleTrack(lang=lang_code, name=name))
                seen_langs.add(lang_code)

            for lang_code, sub_list in auto_sub_dict.items():
                if lang_code not in seen_langs and lang_code in ["en", "th"]:
                    name = f"{'English' if lang_code == 'en' else 'Thai'} (Auto)"
                    subtitles.append(SubtitleTrack(lang=lang_code, name=name))
                    seen_langs.add(lang_code)

            return VideoMetadata(
                id=video_id,
                url=cleaned_url,
                title=title,
                channel=channel,
                channel_url=channel_url,
                duration=duration,
                duration_string=format_duration(duration),
                thumbnail=thumbnail,
                description=description,
                upload_date=upload_date,
                view_count=view_count,
                max_resolution=max_res,
                available_resolutions=available_resolutions,
                available_video_formats=["mp4", "webm", "mkv"],
                available_audio_formats=["mp3", "m4a", "opus", "wav"],
                subtitles=subtitles,
                is_live=is_live,
            )

        except Exception as e:
            friendly_err = translate_error(e)
            raise RuntimeError(friendly_err) from e


youtube_service = YouTubeService()
