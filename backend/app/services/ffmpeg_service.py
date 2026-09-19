import os
import shutil
import subprocess
from typing import Optional, Dict, Any


class FFmpegService:
    def __init__(self, custom_path: Optional[str] = None):
        self.custom_path = custom_path

    def get_ffmpeg_path(self) -> str:
        if self.custom_path and os.path.exists(self.custom_path) and os.access(self.custom_path, os.X_OK):
            return self.custom_path
        
        # Check homebrew default
        brew_path = "/opt/homebrew/bin/ffmpeg"
        if os.path.exists(brew_path) and os.access(brew_path, os.X_OK):
            return brew_path

        usr_local = "/usr/local/bin/ffmpeg"
        if os.path.exists(usr_local) and os.access(usr_local, os.X_OK):
            return usr_local

        which_ffmpeg = shutil.which("ffmpeg")
        if which_ffmpeg:
            return which_ffmpeg

        return "ffmpeg"

    def check_installed(self) -> Dict[str, Any]:
        ffmpeg_bin = self.get_ffmpeg_path()
        try:
            res = subprocess.run(
                [ffmpeg_bin, "-version"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                check=False,
            )
            if res.returncode == 0:
                first_line = res.stdout.splitlines()[0] if res.stdout else "FFmpeg installed"
                return {
                    "installed": True,
                    "path": ffmpeg_bin,
                    "version_info": first_line,
                }
        except Exception as e:
            pass

        return {
            "installed": False,
            "path": ffmpeg_bin,
            "version_info": "Not found in PATH or standard directories",
        }


ffmpeg_service = FFmpegService()
